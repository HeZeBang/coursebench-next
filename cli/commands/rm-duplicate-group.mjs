import { sql } from "../db.mjs";

/**
 * Merge duplicate course groups with identical teacher sets.
 * Keeps the first group, merges scores/comments, deletes duplicates.
 */
export async function rmDuplicateGroup() {
  console.log("Scanning for duplicate course groups...");

  const courses = await sql`SELECT id, code FROM courses WHERE deleted_at IS NULL`;

  let totalMerged = 0;

  for (const course of courses) {
    // Get all groups for this course with their teacher IDs
    const groups = await sql`
      SELECT cg.id, cg.scores, cg.comment_count,
        array_agg(cgt.teacher_id ORDER BY cgt.teacher_id) as teacher_ids
      FROM course_groups cg
      INNER JOIN coursegroup_teachers cgt ON cg.id = cgt.course_group_id
      WHERE cg.course_id = ${course.id} AND cg.deleted_at IS NULL
      GROUP BY cg.id, cg.scores, cg.comment_count`;

    // Group by teacher set key
    const groupMap = {};
    for (const g of groups) {
      const key = (g.teacher_ids || []).join(",");
      if (!groupMap[key]) groupMap[key] = [];
      groupMap[key].push(g);
    }

    for (const [key, dupes] of Object.entries(groupMap)) {
      if (dupes.length <= 1) continue;

      console.log(`Course ${course.code}: ${dupes.length} duplicate groups for teacher set [${key}]`);

      const main = dupes[0];
      const mainScores = (main.scores || [0, 0, 0, 0]).map(Number);
      let mergedCommentCount = Number(main.comment_count || 0);

      for (const dup of dupes.slice(1)) {
        // Merge scores
        const dupScores = (dup.scores || [0, 0, 0, 0]).map(Number);
        for (let i = 0; i < mainScores.length && i < dupScores.length; i++) {
          mainScores[i] += dupScores[i];
        }
        mergedCommentCount += Number(dup.comment_count || 0);

        // Move comments
        await sql`UPDATE comments SET course_group_id = ${main.id}, updated_at = NOW() WHERE course_group_id = ${dup.id} AND deleted_at IS NULL`;

        // Soft delete duplicate group
        await sql`UPDATE course_groups SET deleted_at = NOW() WHERE id = ${dup.id}`;

        // Clean up junction table
        await sql`DELETE FROM coursegroup_teachers WHERE course_group_id = ${dup.id}`;

        console.log(`  Merged group ${dup.id} into ${main.id}`);
        totalMerged++;
      }

      // Update main group
      await sql`UPDATE course_groups SET scores = ${mainScores}, comment_count = ${mergedCommentCount}, updated_at = NOW() WHERE id = ${main.id}`;
    }
  }

  console.log(`\nFinished: ${totalMerged} duplicate groups merged`);
}
