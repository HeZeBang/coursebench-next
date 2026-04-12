import { sql } from "../db.mjs";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";

const TEACHER_OTHER_ID = 100000001;

/**
 * Import courses from CSV files in a directory.
 * CSV columns: [0]?, [1]?, [2]name, [3]code, [4]credit, ..., [10]institute, ..., [12]teacher_names(JSON), [13]teacher_eams_ids(JSON)
 */
export async function importCourse(dirPath) {
  console.log(`Importing courses from directory: ${dirPath}`);

  const stat = statSync(dirPath);
  if (!stat.isDirectory()) {
    console.error("Given path must be a directory");
    process.exit(1);
  }

  const files = readdirSync(dirPath).filter((f) => f.endsWith(".csv"));
  console.log(`Found ${files.length} CSV files`);

  for (const file of files) {
    const filePath = join(dirPath, file);
    console.log(`\nProcessing: ${file}`);

    const content = readFileSync(filePath, "utf-8");
    const records = parse(content, { relax_column_count: true, relax_quotes: true });

    for (let i = 1; i < records.length; i++) {
      const record = records[i];
      if (record.length < 14) continue;

      const code = record[3];
      const name = record[2];
      const institute = record[10];
      const credit = Math.floor(parseFloat(record[4]) || 0);

      // Find or create course
      let [course] = await sql`SELECT * FROM courses WHERE code = ${code} AND deleted_at IS NULL`;
      if (!course) {
        console.log(`  Add course: ${code} ${name} ${institute} ${credit}`);
        [course] = await sql`INSERT INTO courses (name, institute, credit, code, scores, comment_count, created_at, updated_at)
          VALUES (${name}, ${institute}, ${credit}, ${code}, ${[0, 0, 0, 0]}, 0, NOW(), NOW()) RETURNING *`;

        // Create default "other" group
        const [defaultGroup] = await sql`INSERT INTO course_groups (code, course_id, scores, comment_count, created_at, updated_at)
          VALUES ('', ${course.id}, ${[0, 0, 0, 0]}, 0, NOW(), NOW()) RETURNING id`;
        await sql`INSERT INTO coursegroup_teachers (course_group_id, teacher_id) VALUES (${defaultGroup.id}, ${TEACHER_OTHER_ID}) ON CONFLICT DO NOTHING`;
      } else {
        console.log(`  Find course: ${code} id=${course.id}`);
      }

      // Parse teacher data
      const teacherNamesRaw = record[12].replace(/'/g, '"');
      let teacherNames, teacherEamsIds;
      try {
        teacherNames = JSON.parse(teacherNamesRaw);
        teacherEamsIds = JSON.parse(record[13]);
      } catch {
        console.log(`  Warning: failed to parse teacher data at line ${i + 1}`);
        continue;
      }

      // Check if identical teacher name set already exists
      const existingGroups = await sql`
        SELECT cg.id, array_agg(t.name ORDER BY t.name) as teacher_names
        FROM course_groups cg
        INNER JOIN coursegroup_teachers cgt ON cg.id = cgt.course_group_id
        INNER JOIN teachers t ON cgt.teacher_id = t.id
        WHERE cg.course_id = ${course.id} AND cg.deleted_at IS NULL
        GROUP BY cg.id`;

      const sortedNames = [...teacherNames].sort();
      const isDuplicate = existingGroups.some((g) => {
        const existing = (g.teacher_names || []).sort();
        return existing.length === sortedNames.length && existing.every((v, idx) => v === sortedNames[idx]);
      });
      if (isDuplicate) continue;

      // Find or create teachers
      const teacherIds = [];
      for (let j = 0; j < teacherNames.length; j++) {
        const tName = teacherNames[j];
        const eamsId = teacherEamsIds[j] || 0;

        let [teacher] = await sql`SELECT id FROM teachers WHERE name = ${tName} AND deleted_at IS NULL LIMIT 1`;
        if (!teacher) {
          [teacher] = await sql`INSERT INTO teachers (name, eams_id, uni_id, institute, job, introduction, email, photo, created_at, updated_at)
            VALUES (${tName}, ${eamsId}, 0, '', '', '', '', '', NOW(), NOW()) RETURNING id`;
        }
        teacherIds.push(teacher.id);
      }

      // Create course group
      const [group] = await sql`INSERT INTO course_groups (code, course_id, scores, comment_count, created_at, updated_at)
        VALUES ('', ${course.id}, ${[0, 0, 0, 0]}, 0, NOW(), NOW()) RETURNING id`;

      for (const tid of teacherIds) {
        await sql`INSERT INTO coursegroup_teachers (course_group_id, teacher_id) VALUES (${group.id}, ${tid}) ON CONFLICT DO NOTHING`;
        await sql`INSERT INTO course_teachers (course_id, teacher_id) VALUES (${course.id}, ${tid}) ON CONFLICT DO NOTHING`;
      }

      console.log(`  Add group: ${code} course=${course.id} group=${group.id} teachers=[${teacherIds}]`);
    }

    console.log(`Finished: ${file}`);
  }

  console.log("\nFinished importing courses");
}
