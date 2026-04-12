import { put, del } from "@vercel/blob";

const AVATAR_SIZE_LIMIT = parseInt(process.env.AVATAR_SIZE_LIMIT || "1048576", 10); // 1MB default

// Old MinIO URL pattern for backward compatibility
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "";
const MINIO_BUCKET = process.env.MINIO_BUCKET || "";

/**
 * Upload an avatar file to Vercel Blob and return the public URL.
 */
export async function uploadAvatar(file: Blob, userId: number): Promise<string> {
  if (file.size > AVATAR_SIZE_LIMIT) {
    const { FileTooLarge } = await import("../errors");
    throw FileTooLarge();
  }

  const blob = await put(`avatar/${userId}/${Date.now()}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return blob.url;
}

/**
 * Resolve an avatar field to a full URL.
 * Handles both old MinIO UUIDs and new Vercel Blob URLs.
 */
export function resolveAvatarUrl(avatar: string | null): string {
  if (!avatar) return "";

  // If it's already a full URL (Vercel Blob), return as-is
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }

  // Legacy MinIO UUID format
  if (MINIO_ENDPOINT && MINIO_BUCKET) {
    return `https://${MINIO_ENDPOINT}/${MINIO_BUCKET}/avatar/${avatar}`;
  }

  return "";
}

/**
 * Delete a blob by URL.
 */
export async function deleteBlob(url: string): Promise<void> {
  if (url.startsWith("https://") && url.includes(".blob.")) {
    await del(url);
  }
}
