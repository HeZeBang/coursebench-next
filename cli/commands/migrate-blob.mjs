/**
 * Vercel Blob migration is not implemented.
 *
 * Reason: Blob isn't actively used in production right now — the upload-avatar
 * code path exists but is effectively dormant. If/when Blob is put into use,
 * implement this with `list()` from the source token + `put()` to the target,
 * then UPDATE users.avatar to rewrite URLs.
 */
export async function migrateBlob() {
  console.warn(
    [
      "[migrate_blob] Skipped: Vercel Blob migration is not implemented.",
      "",
      "Blob is currently not actively used by this project. Any rows in",
      "users.avatar that look like https://*.blob.* will continue to point",
      "at the OLD Vercel Blob store, and will 404 once that store is deleted.",
      "",
      "If you want to clear those legacy URLs after switching accounts, run:",
      "    UPDATE users SET avatar = '' WHERE avatar LIKE 'https://%.blob.%';",
    ].join("\n"),
  );
}
