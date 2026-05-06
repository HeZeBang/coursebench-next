/**
 * Load .env.local into process.env (idempotent).
 * Supports KEY="value" and KEY=value lines.
 */
import { readFileSync, existsSync } from "fs";

let loaded = false;

export function loadDotEnvLocal() {
  if (loaded) return;
  loaded = true;

  const envPath = new URL("../.env.local", import.meta.url);
  if (!existsSync(envPath)) return;

  const envContent = readFileSync(envPath, "utf-8");
  for (const rawLine of envContent.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
