import { sql } from "../db.mjs";

const ELRC_BASE = "https://elrc.shanghaitech.edu.cn";

/**
 * Fetch ALL teachers from ELRC by paginating the search API with empty name.
 */
async function fetchAllElrcTeachers() {
  const all = [];
  let page = 1;
  const size = 100;

  while (true) {
    process.stdout.write(`\rFetching ELRC teachers page ${page}...`);
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      name: "",
    });

    try {
      const resp = await fetch(`${ELRC_BASE}/learn/v1/search/history/search/teacher?${params}`);
      if (!resp.ok) { console.log(`\nBad response: ${resp.status}`); break; }

      const data = await resp.json();
      const results = data.data?.results || [];
      if (results.length === 0) break;

      all.push(...results);

      const total = data.data?.total || 0;
      const totalPages = Math.ceil(total / size);

      if (page === 1) {
        console.log(`\rELRC reports ${total} teachers, ${totalPages} pages`);
      }

      if (page >= totalPages) break;
      page++;
      await new Promise((r) => setTimeout(r, 80));
    } catch (err) {
      console.log(`\nFetch error on page ${page}: ${err.message}`);
      break;
    }
  }

  console.log(`\rFetched ${all.length} teachers from ELRC`.padEnd(60));
  return all;
}

export async function updateTeacherInstitute({ dryRun = false } = {}) {
  // 1. Fetch all teachers from ELRC
  const elrcTeachers = await fetchAllElrcTeachers();

  // Build lookup: userCode → { nickName, college }
  const byCode = new Map();
  const byName = new Map(); // name → [results] for fallback
  for (const t of elrcTeachers) {
    const code = parseInt(t.userCode, 10);
    if (code) byCode.set(code, t);
    const name = t.nickName || "";
    if (name) {
      if (!byName.has(name)) byName.set(name, []);
      byName.get(name).push(t);
    }
  }

  // 2. Load all DB teachers
  console.log("\nLoading database teachers...");
  const dbTeachers = await sql`
    SELECT id, name, uni_id, institute
    FROM teachers
    WHERE deleted_at IS NULL
    ORDER BY id`;
  console.log(`Found ${dbTeachers.length} teachers in database\n`);

  // 3. Match and collect changes
  let updated = 0;
  let alreadyCorrect = 0;
  let notFound = 0;
  let ambiguous = 0;
  const changes = [];
  const ambiguousList = [];

  for (const t of dbTeachers) {
    let match = null;

    // Try by uni_id (userCode) first
    if (t.uni_id) {
      match = byCode.get(Number(t.uni_id)) || null;
    }

    // Fallback: try by name
    if (!match && t.name) {
      const candidates = byName.get(t.name);
      if (candidates?.length === 1) {
        match = candidates[0];
      } else if (candidates?.length > 1) {
        ambiguous++;
        ambiguousList.push({
          id: t.id,
          name: t.name,
          uni_id: t.uni_id,
          candidates: candidates.map((c) => `${c.nickName}(${c.userCode}/${c.college})`),
        });
        continue;
      }
    }

    if (!match) { notFound++; continue; }

    const newInstitute = match.college || "";
    const newUniId = parseInt(match.userCode, 10) || 0;
    const updateFields = [];

    if (newInstitute && newInstitute !== t.institute) {
      updateFields.push(`institute: "${t.institute || "(空)"}" → "${newInstitute}"`);
    }
    if (newUniId && (!t.uni_id || t.uni_id === 0)) {
      updateFields.push(`uni_id: ${t.uni_id || 0} → ${newUniId}`);
    }

    if (updateFields.length === 0) { alreadyCorrect++; continue; }

    changes.push({ id: t.id, name: t.name, fields: updateFields, newInstitute, newUniId: (!t.uni_id && newUniId) ? newUniId : null });
    updated++;

    if (!dryRun) {
      if (newInstitute && newInstitute !== t.institute) {
        await sql`UPDATE teachers SET institute = ${newInstitute}, updated_at = NOW() WHERE id = ${t.id}`;
      }
      if (newUniId && (!t.uni_id || t.uni_id === 0)) {
        await sql`UPDATE teachers SET uni_id = ${newUniId}, updated_at = NOW() WHERE id = ${t.id}`;
      }
    }
  }

  // 4. Print report
  const divider = "─".repeat(60);
  console.log(`${divider}`);
  console.log(`  Teacher Institute Update ${dryRun ? "(DRY RUN)" : ""}`);
  console.log(`${divider}\n`);

  console.log(`  DB teachers:       ${dbTeachers.length}`);
  console.log(`  ELRC teachers:     ${elrcTeachers.length}`);
  console.log(`  Updated:           ${updated}`);
  console.log(`  Already correct:   ${alreadyCorrect}`);
  console.log(`  Not found in ELRC: ${notFound}`);
  console.log(`  Ambiguous (skip):  ${ambiguous}`);

  if (changes.length > 0) {
    console.log(`\n${divider}`);
    console.log(`  Changes (${changes.length})`);
    console.log(`${divider}`);
    for (const c of changes) {
      console.log(`  [${c.id}] ${c.name}: ${c.fields.join(", ")}`);
    }
  }

  if (ambiguousList.length > 0) {
    console.log(`\n${divider}`);
    console.log(`  Ambiguous — manual review (${ambiguousList.length})`);
    console.log(`${divider}`);
    for (const a of ambiguousList) {
      console.log(`  [${a.id}] ${a.name} (uni_id=${a.uni_id || "无"}): ${a.candidates.join(", ")}`);
    }
  }

  console.log(`\n${divider}`);
  if (dryRun) console.log("  Dry run complete. No changes were made.\n");
}
