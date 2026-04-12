import { sql } from "../db.mjs";

/**
 * Delete ALL user data: users, comments, comment_likes, replies, reply_likes.
 * Reset course/group scores and comment counts.
 * THIS IS DESTRUCTIVE AND IRREVERSIBLE.
 */
export async function clearUserdata() {
  console.log("WARNING: This will delete ALL user data!");
  console.log("  - All users");
  console.log("  - All comments and replies");
  console.log("  - All likes");
  console.log("  - Reset all course scores\n");

  // Soft-delete all user data
  console.log("Deleting users...");
  await sql`UPDATE users SET deleted_at = NOW() WHERE deleted_at IS NULL`;

  console.log("Deleting comments...");
  await sql`UPDATE comments SET deleted_at = NOW() WHERE deleted_at IS NULL`;

  console.log("Deleting comment likes...");
  await sql`UPDATE comment_likes SET deleted_at = NOW() WHERE deleted_at IS NULL`;

  console.log("Deleting replies...");
  await sql`UPDATE replies SET deleted_at = NOW() WHERE deleted_at IS NULL`;

  console.log("Deleting reply likes...");
  await sql`UPDATE reply_likes SET deleted_at = NOW() WHERE deleted_at IS NULL`;

  console.log("Resetting course scores...");
  await sql`UPDATE courses SET comment_count = 0, scores = ${[0, 0, 0, 0]} WHERE deleted_at IS NULL`;

  console.log("Resetting course group scores...");
  await sql`UPDATE course_groups SET comment_count = 0, scores = ${[0, 0, 0, 0]} WHERE deleted_at IS NULL`;

  console.log("\nFinished clearing all user data.");
}
