/**
 * Shared database connection for CLI tools.
 * Loads DATABASE_URL from .env.local automatically.
 */
import { neon } from "@neondatabase/serverless";
import { loadDotEnvLocal } from "./env.mjs";

loadDotEnvLocal();

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not found. Run `vercel env pull` first.");
  process.exit(1);
}

export const sql = neon(process.env.DATABASE_URL);

/** Helper: query with tagged template */
export { sql as db };
