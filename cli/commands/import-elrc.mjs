import { sql } from "../db.mjs";
import readline from "readline";

const TEACHER_OTHER_ID = 100000001;
const ELRC_BASE = "https://elrc.shanghaitech.edu.cn";

function parseSemester(arg) {
  const parts = arg.split("-");
  if (parts.length !== 3) throw new Error("Invalid semester format, expect 2024-2025-3");
  const termMap = { "1": "秋季", "2": "春季", "3": "夏季" };
  const termName = termMap[parts[2]];
  if (!termName) throw new Error(`Invalid term number: ${parts[2]}`);
  return {
    year: `${parts[0]}-${parts[1]}`,
    termNum: parts[2],
    termName,
    fullLabel: `${parts[0]}-${parts[1]}学年${termName}`,
  };
}

async function confirm(message) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

async function fetchCourseList(semInfo) {
  const allCourses = [];
  let page = 1;
  let pageSize = 20;
  let totalPages = 1;

  while (true) {
    process.stdout.write(`\rFetching page ${page}/${totalPages}...`);
    const params = new URLSearchParams({
      page: String(page),
      size: String(pageSize),
      courseType: "2",
      semester: semInfo.fullLabel,
    });

    const resp = await fetch(`${ELRC_BASE}/learn/shanghai/tech/get/course?${params}`);
    if (!resp.ok) { console.log(`\nBad response: ${resp.status}`); break; }

    const data = await resp.json();
    const results = data.data?.results || [];
    if (results.length === 0) break;

    allCourses.push(...results);

    if (page === 1) {
      pageSize = data.data.size || 20;
      const total = data.data.total || 0;
      totalPages = Math.ceil(total / pageSize);
    }

    if (page >= totalPages) break;
    page++;
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("");
  return allCourses;
}

async function fetchCourseDetail(serialNumber, semInfo) {
  const params = new URLSearchParams({
    semester: semInfo.year,
    term: semInfo.termNum,
    course_no: serialNumber,
    course_id: "undefined",
  });

  const resp = await fetch(`${ELRC_BASE}/shanghaitechdatasync/datasync/bksCourse/?${params}`);
  if (!resp.ok) return null;

  const data = await resp.json();
  if (data.error_code !== "shanghaitech.0000.0000") return null;
  return data;
}

// ── Dry-run analysis ──

async function analyzeCourses(courses, semInfo) {
  const newCourses = [];
  const existingCourses = [];
  const newTeachers = []; // { name, uniId, institute }
  const allTeacherNames = new Set();
  const seenNewTeachers = new Set();

  // Prefetch existing course codes
  const existingCodes = new Set();
  const rows = await sql`SELECT code FROM courses WHERE deleted_at IS NULL`;
  for (const r of rows) existingCodes.add(r.code);

  // Prefetch existing teacher names
  const existingTeacherNames = new Set();
  const tRows = await sql`SELECT name FROM teachers WHERE deleted_at IS NULL`;
  for (const r of tRows) existingTeacherNames.add(r.name);

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    process.stdout.write(`\rAnalyzing ${i + 1}/${courses.length}: ${c.courseNumber}...`);

    const teacherNames = c.teacher_names || [];
    const teacherUniIds = c.teacher || [];
    for (const n of teacherNames) allTeacherNames.add(n);

    if (existingCodes.has(c.courseNumber)) {
      existingCourses.push(c);
    } else {
      // Fetch detail for credit/course institute
      const detail = await fetchCourseDetail(c.serialNumber, semInfo);
      let credit = 0;
      let courseInstitute = "未知单位";
      if (detail?.extend_message?.JwPkKcxxBk_instance?.credits) {
        credit = Math.floor(parseFloat(detail.extend_message.JwPkKcxxBk_instance.credits));
      }
      if (detail?.extend_message?.KczxCourseActivityBk_instance?.college_name) {
        courseInstitute = detail.extend_message.KczxCourseActivityBk_instance.college_name;
      }
      newCourses.push({ ...c, _credit: credit, _institute: courseInstitute });
      await new Promise((r) => setTimeout(r, 50));
    }

    // Check for new teachers, resolve their real institute
    for (let j = 0; j < teacherNames.length; j++) {
      const name = teacherNames[j];
      if (existingTeacherNames.has(name) || seenNewTeachers.has(name)) continue;
      seenNewTeachers.add(name);

      const uniId = parseInt(teacherUniIds[j], 10) || 0;
      const institute = await resolveTeacherInstitute(uniId, name, "");
      newTeachers.push({ name, uniId, institute });
    }
  }
  console.log("");

  return { newCourses, existingCourses, newTeachers, allTeacherNames };
}

function printPreview({ newCourses, existingCourses, newTeachers, allTeacherNames }, semInfo) {
  const divider = "─".repeat(60);

  console.log(`\n${divider}`);
  console.log(`  ELRC Import Preview — ${semInfo.fullLabel}`);
  console.log(`${divider}\n`);

  console.log(`  Total courses from API:   ${newCourses.length + existingCourses.length}`);
  console.log(`  New courses to add:       ${newCourses.length}`);
  console.log(`  Already in database:      ${existingCourses.length}`);
  console.log(`  New teachers to create:   ${newTeachers.length}`);
  console.log(`  Total unique teachers:    ${allTeacherNames.size}`);

  if (newCourses.length > 0) {
    console.log(`\n${divider}`);
    console.log(`  New Courses (${newCourses.length})`);
    console.log(`${divider}`);
    // Group by institute
    const byInstitute = {};
    for (const c of newCourses) {
      const inst = c._institute || "未知单位";
      if (!byInstitute[inst]) byInstitute[inst] = [];
      byInstitute[inst].push(c);
    }
    for (const [inst, courses] of Object.entries(byInstitute).sort((a, b) => b[1].length - a[1].length)) {
      console.log(`\n  📚 ${inst} (${courses.length})`);
      for (const c of courses) {
        const teachers = (c.teacher_names || []).join(", ") || "未知";
        console.log(`     ${c.courseNumber.padEnd(12)} ${c.name_.padEnd(30)} ${String(c._credit).padStart(2)}学分  👤 ${teachers}`);
      }
    }
  }

  if (newTeachers.length > 0) {
    console.log(`\n${divider}`);
    console.log(`  New Teachers (${newTeachers.length})`);
    console.log(`${divider}`);
    for (const t of newTeachers) {
      const inst = t.institute || "未知单位";
      const uid = t.uniId ? String(t.uniId) : "(无)";
      console.log(`     + ${t.name.padEnd(16)} UniID: ${uid.padEnd(8)} 学院: ${inst}`);
    }
  }

  if (existingCourses.length > 0 && existingCourses.length <= 20) {
    console.log(`\n${divider}`);
    console.log(`  Existing Courses (skipped, ${existingCourses.length})`);
    console.log(`${divider}`);
    for (const c of existingCourses) {
      console.log(`     ✓ ${c.courseNumber.padEnd(12)} ${c.name_}`);
    }
  } else if (existingCourses.length > 20) {
    console.log(`\n  (${existingCourses.length} existing courses omitted)`);
  }

  console.log(`\n${divider}\n`);
}

// ── ELRC teacher search (for real institute) ──

// Cache: userCode → { nickName, college }
const elrcTeacherCache = new Map();

async function fetchTeacherFromELRC(name) {
  const params = new URLSearchParams({ page: "1", size: "5", name, wholeMatch: "true" });
  try {
    const resp = await fetch(`${ELRC_BASE}/learn/v1/search/history/search/teacher?${params}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.data?.results || [];
  } catch {
    return null;
  }
}

/**
 * Resolve the real institute for a teacher via ELRC search API.
 * Matches by userCode (uni_id). Falls back to single-result match by name.
 * Returns the college string, or fallbackInstitute if not found.
 */
async function resolveTeacherInstitute(uniId, name, fallbackInstitute) {
  // Check cache first
  if (uniId && elrcTeacherCache.has(uniId)) {
    return elrcTeacherCache.get(uniId).college || fallbackInstitute;
  }

  const results = await fetchTeacherFromELRC(name);
  if (!results || results.length === 0) return fallbackInstitute;

  // Cache all results
  for (const r of results) {
    const code = parseInt(r.userCode, 10);
    if (code) elrcTeacherCache.set(code, r);
  }

  // Match by userCode
  if (uniId) {
    const match = results.find((r) => String(r.userCode) === String(uniId));
    if (match?.college) return match.college;
  }

  // Single result → use it
  if (results.length === 1 && results[0].college) return results[0].college;

  return fallbackInstitute;
}

// ── Execute import ──

async function findOrCreateTeacher(uniId, name, courseInstitute) {
  // Resolve real institute from ELRC search API
  const institute = await resolveTeacherInstitute(uniId, name, courseInstitute);

  let [teacher] = await sql`SELECT * FROM teachers WHERE uni_id = ${uniId} AND deleted_at IS NULL`;
  if (teacher) {
    let needUpdate = false;
    if (!teacher.name && name) needUpdate = true;
    if (institute && institute !== teacher.institute) needUpdate = true;
    if (needUpdate) {
      await sql`UPDATE teachers SET
        name = COALESCE(NULLIF(name, ''), ${name}),
        institute = ${institute || teacher.institute || ""},
        updated_at = NOW()
        WHERE id = ${teacher.id}`;
    }
    return teacher;
  }

  [teacher] = await sql`SELECT * FROM teachers WHERE name = ${name} AND deleted_at IS NULL LIMIT 1`;
  if (teacher) {
    const updateInst = institute || teacher.institute || "";
    await sql`UPDATE teachers SET uni_id = ${uniId}, institute = ${updateInst}, updated_at = NOW() WHERE id = ${teacher.id}`;
    return teacher;
  }

  const [newTeacher] = await sql`INSERT INTO teachers (name, uni_id, institute, job, introduction, email, photo, created_at, updated_at)
    VALUES (${name}, ${uniId}, ${institute || ""}, '', '', '', '', NOW(), NOW()) RETURNING *`;
  console.log(`  + Teacher: ${name} (UniID: ${uniId}, institute: ${institute})`);
  return newTeacher;
}

async function processCourse(courseInfo, semInfo) {
  const detail = await fetchCourseDetail(courseInfo.serialNumber, semInfo);

  let credit = 0;
  if (detail?.extend_message?.JwPkKcxxBk_instance?.credits) {
    credit = Math.floor(parseFloat(detail.extend_message.JwPkKcxxBk_instance.credits));
  }
  let institute = detail?.extend_message?.KczxCourseActivityBk_instance?.college_name || "未知单位";

  let [course] = await sql`SELECT * FROM courses WHERE code = ${courseInfo.courseNumber} AND deleted_at IS NULL`;

  if (!course) {
    [course] = await sql`INSERT INTO courses (name, institute, credit, code, scores, comment_count, created_at, updated_at)
      VALUES (${courseInfo.name_}, ${institute}, ${credit}, ${courseInfo.courseNumber}, ${[0, 0, 0, 0]}, 0, NOW(), NOW()) RETURNING *`;

    const teacherIds = [];
    const teachers = {};
    for (let i = 0; i < (courseInfo.teacher || []).length; i++) {
      const uniIdStr = courseInfo.teacher[i];
      const name = (courseInfo.teacher_names || [])[i] || "";
      if (uniIdStr && name) teachers[uniIdStr] = name;
    }

    for (const [uniIdStr, name] of Object.entries(teachers)) {
      const uniId = parseInt(uniIdStr, 10);
      if (isNaN(uniId)) continue;
      const teacher = await findOrCreateTeacher(uniId, name, institute);
      teacherIds.push(teacher.id);
    }

    if (teacherIds.length === 0) teacherIds.push(TEACHER_OTHER_ID);

    const existingGroups = await sql`
      SELECT cg.id, array_agg(cgt.teacher_id ORDER BY cgt.teacher_id) as teacher_ids
      FROM course_groups cg
      INNER JOIN coursegroup_teachers cgt ON cg.id = cgt.course_group_id
      WHERE cg.course_id = ${course.id} AND cg.deleted_at IS NULL
      GROUP BY cg.id`;

    const sortedIds = [...teacherIds].sort((a, b) => a - b);
    const isDuplicate = existingGroups.some((g) => {
      const existing = (g.teacher_ids || []).map(Number).sort((a, b) => a - b);
      return existing.length === sortedIds.length && existing.every((v, i) => v === sortedIds[i]);
    });

    if (isDuplicate) return;

    const [group] = await sql`INSERT INTO course_groups (code, course_id, scores, comment_count, created_at, updated_at)
      VALUES ('', ${course.id}, ${[0, 0, 0, 0]}, 0, NOW(), NOW()) RETURNING *`;

    for (const tid of teacherIds) {
      await sql`INSERT INTO coursegroup_teachers (course_group_id, teacher_id) VALUES (${group.id}, ${tid}) ON CONFLICT DO NOTHING`;
      await sql`INSERT INTO course_teachers (course_id, teacher_id) VALUES (${course.id}, ${tid}) ON CONFLICT DO NOTHING`;
    }

    console.log(`  + ${courseInfo.courseNumber} ${courseInfo.name_} (course=${course.id} group=${group.id})`);
    await new Promise((r) => setTimeout(r, 50));
  }
}

// ── Entry point ──

export async function importELRC(semesterArg, { dryRun = false } = {}) {
  const semInfo = parseSemester(semesterArg);
  console.log(`Semester: ${semInfo.fullLabel} (year=${semInfo.year}, term=${semInfo.termNum})`);

  const courses = await fetchCourseList(semInfo);
  console.log(`Fetched ${courses.length} courses from ELRC API`);

  if (courses.length === 0) {
    console.log("No courses found. Exiting.");
    return;
  }

  // Always analyze and preview first
  const analysis = await analyzeCourses(courses, semInfo);
  printPreview(analysis, semInfo);

  if (dryRun) {
    console.log("Dry run complete. No changes were made.");
    return;
  }

  if (analysis.newCourses.length === 0) {
    console.log("No new courses to import. Done.");
    return;
  }

  const ok = await confirm(`Import ${analysis.newCourses.length} new courses?`);
  if (!ok) { console.log("Aborted."); return; }

  let imported = 0;
  for (const courseInfo of courses) {
    try {
      await processCourse(courseInfo, semInfo);
      imported++;
    } catch (err) {
      console.error(`Error processing ${courseInfo.courseNumber}: ${err.message}`);
    }
  }

  console.log(`\nFinished: ${imported} courses processed`);
}
