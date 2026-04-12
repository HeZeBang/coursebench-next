import { sql } from "../db.mjs";

export async function showStats() {
  const [users] = await sql`SELECT count(*) as cnt FROM users WHERE deleted_at IS NULL`;
  const [courses] = await sql`SELECT count(*) as cnt FROM courses WHERE deleted_at IS NULL`;
  const [groups] = await sql`SELECT count(*) as cnt FROM course_groups WHERE deleted_at IS NULL`;
  const [teachers] = await sql`SELECT count(*) as cnt FROM teachers WHERE deleted_at IS NULL`;
  const [comments] = await sql`SELECT count(*) as cnt FROM comments WHERE deleted_at IS NULL`;
  const [replies] = await sql`SELECT count(*) as cnt FROM replies WHERE deleted_at IS NULL`;
  const [admins] = await sql`SELECT count(*) as cnt FROM users WHERE is_admin = true AND deleted_at IS NULL`;
  const [communityAdmins] = await sql`SELECT count(*) as cnt FROM users WHERE is_community_admin = true AND deleted_at IS NULL`;

  console.log(`\nCourseBench Database Statistics\n${"=".repeat(40)}`);
  console.log(`Users:            ${users.cnt}`);
  console.log(`  Admins:         ${admins.cnt}`);
  console.log(`  Community Admins: ${communityAdmins.cnt}`);
  console.log(`Courses:          ${courses.cnt}`);
  console.log(`Course Groups:    ${groups.cnt}`);
  console.log(`Teachers:         ${teachers.cnt}`);
  console.log(`Comments:         ${comments.cnt}`);
  console.log(`Replies:          ${replies.cnt}`);
}
