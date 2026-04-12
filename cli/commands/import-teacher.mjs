import { sql } from "../db.mjs";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";

/**
 * Update teacher info from CSV.
 * CSV columns: name, photo, job, email, institute, introduction
 * Only updates existing teachers (matched by name).
 */
export async function importTeacher(filePath) {
  console.log(`Importing teacher data from: ${filePath}`);

  const content = readFileSync(filePath, "utf-8");
  const records = parse(content, { relax_column_count: true });

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (record.length < 6) {
      console.log(`  Wrong format at line ${i + 1}, skipping`);
      continue;
    }

    const [name, photo, job, email, institute, introduction] = record;

    const [teacher] = await sql`SELECT id FROM teachers WHERE name = ${name} AND deleted_at IS NULL LIMIT 1`;
    if (!teacher) {
      console.log(`  Teacher "${name}" not found, skipping`);
      skipped++;
      continue;
    }

    await sql`UPDATE teachers SET
      email = ${email},
      introduction = ${introduction},
      job = ${job},
      photo = ${photo},
      institute = ${institute},
      updated_at = NOW()
      WHERE id = ${teacher.id}`;

    console.log(`  Updated: ${name}`);
    updated++;
  }

  console.log(`\nFinished: ${updated} updated, ${skipped} skipped`);
}
