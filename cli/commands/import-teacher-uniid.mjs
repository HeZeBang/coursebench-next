import { sql } from "../db.mjs";
import { readFileSync } from "fs";

/**
 * Update teacher UniIDs from JSON file.
 * Format: { course_code: { uni_id_string: teacher_name } }
 */
export async function importTeacherUniID(filePath) {
  console.log(`Importing teacher UniIDs from: ${filePath}`);

  const raw = readFileSync(filePath, "utf-8");
  const teachersJSON = JSON.parse(raw);

  // Build course_code => name => uniIDs mapping
  const courseTeacherMap = {};
  for (const [courseCode, teachers] of Object.entries(teachersJSON)) {
    courseTeacherMap[courseCode] = {};
    for (const [uniIdStr, name] of Object.entries(teachers)) {
      const uniId = parseInt(uniIdStr, 10);
      if (isNaN(uniId)) continue;
      if (!courseTeacherMap[courseCode][name]) courseTeacherMap[courseCode][name] = [];
      courseTeacherMap[courseCode][name].push(uniId);
    }
  }

  // Sort uniIDs
  for (const nameMap of Object.values(courseTeacherMap)) {
    for (const ids of Object.values(nameMap)) {
      ids.sort((a, b) => a - b);
    }
  }

  // Load all course groups with teachers
  const courseGroups = await sql`
    SELECT cg.id as group_id, c.code as course_code, t.id as teacher_id, t.name as teacher_name, t.uni_id
    FROM course_groups cg
    INNER JOIN courses c ON cg.course_id = c.id
    INNER JOIN coursegroup_teachers cgt ON cg.id = cgt.course_group_id
    INNER JOIN teachers t ON cgt.teacher_id = t.id
    WHERE cg.deleted_at IS NULL AND c.deleted_at IS NULL AND t.deleted_at IS NULL`;

  let updated = 0;
  for (const row of courseGroups) {
    const courseCode = row.course_code;
    const teacherName = row.teacher_name;
    const uniIds = courseTeacherMap[courseCode]?.[teacherName];
    if (!uniIds || uniIds.length === 0) continue;

    const uniId = uniIds[0];
    if (row.uni_id !== uniId) {
      await sql`UPDATE teachers SET uni_id = ${uniId}, updated_at = NOW() WHERE id = ${row.teacher_id}`;
      console.log(`  Updated: ${teacherName} (ID: ${row.teacher_id}) UniID ${row.uni_id} → ${uniId}`);
      updated++;
    }
  }

  console.log(`\nFinished: ${updated} teachers updated`);
}
