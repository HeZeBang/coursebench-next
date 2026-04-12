/**
 * Shared database connection for CLI tools.
 * Loads DATABASE_URL from .env.local automatically.
 */
import { readFileSync, existsSync } from "fs";
import { neon } from "@neondatabase/serverless";

// Load .env.local if present
const envPath = new URL("../.env.local", import.meta.url);
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([A-Z_]+)="(.+)"$/);
    if (match) process.env[match[1]] = match[2];
  }
}

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not found. Run `vercel env pull` first.");
  process.exit(1);
}

export const sql = neon(process.env.DATABASE_URL);

/** Helper: query with tagged template */
export { sql as db };
