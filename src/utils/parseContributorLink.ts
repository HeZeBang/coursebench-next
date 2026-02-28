/**
 * Parse a contributor's avatar URL from protocol-prefixed links.
 * Supports: qq://<id>, github://<username>, email://<address>, https://...
 */
export function parseAvatarUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("qq://")) {
    const qqId = url.replace("qq://", "");
    return `https://q1.qlogo.cn/g?b=qq&nk=${qqId}&s=640`;
  }
  if (url.startsWith("github://")) {
    const username = url.replace("github://", "");
    return `https://github.com/${username}.png`;
  }
  if (url.startsWith("email://")) {
    return ""; // No avatar for email
  }
  return url; // Direct URL
}

/**
 * Parse a contributor's home link from protocol-prefixed links.
 */
export function parseHomeUrl(url: string): string {
  if (!url) return "#";
  if (url.startsWith("github://")) {
    const username = url.replace("github://", "");
    return `https://github.com/${username}`;
  }
  if (url.startsWith("qq://") || url.startsWith("email://")) {
    return "#";
  }
  return url;
}
