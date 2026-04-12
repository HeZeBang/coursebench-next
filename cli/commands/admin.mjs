import { sql } from "../db.mjs";

export async function setAdmin(userId, isAdmin) {
  console.log(`Setting user ${userId} admin=${isAdmin}...`);

  const [user] = await sql`SELECT id, is_admin, is_community_admin, nick_name, email FROM users WHERE id = ${userId} AND deleted_at IS NULL`;
  if (!user) {
    console.error(`User ${userId} not found`);
    process.exit(1);
  }

  if (isAdmin && user.is_community_admin) {
    console.error(`User ${userId} is already a community admin. Remove community admin first.`);
    process.exit(1);
  }

  await sql`UPDATE users SET is_admin = ${isAdmin}, updated_at = NOW() WHERE id = ${userId}`;
  console.log(`User ${userId} (${user.nick_name || user.email}) admin set to ${isAdmin}`);
}

export async function setCommunityAdmin(userId, isCommunityAdmin) {
  console.log(`Setting user ${userId} community_admin=${isCommunityAdmin}...`);

  const [user] = await sql`SELECT id, is_admin, is_community_admin, nick_name, email FROM users WHERE id = ${userId} AND deleted_at IS NULL`;
  if (!user) {
    console.error(`User ${userId} not found`);
    process.exit(1);
  }

  if (isCommunityAdmin && user.is_admin) {
    console.error(`User ${userId} is already an admin. Remove admin first.`);
    process.exit(1);
  }

  await sql`UPDATE users SET is_community_admin = ${isCommunityAdmin}, updated_at = NOW() WHERE id = ${userId}`;
  console.log(`User ${userId} (${user.nick_name || user.email}) community_admin set to ${isCommunityAdmin}`);
}
