/**
 * Parse a contributor's avatar URL from protocol-prefixed links.
 * Supports: qq:<id>, github:<username>, email:<address>, and direct URLs.
 */
export function parseAvatarUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("qq:")) {
    const qqId = url.slice(3);
    return `https://q1.qlogo.cn/g?b=qq&nk=${qqId}&s=640`;
  }
  if (url.startsWith("github:")) {
    const id = url.slice(7);
    if (/^\d+$/.test(id)) {
      return `https://avatars.githubusercontent.com/u/${id}`;
    }
    return `https://github.com/${id}.png`;
  }
  if (url.startsWith("email:") || url.startsWith("homepage:")) {
    return "";
  }
  return url;
}

/**
 * Parse a contributor's home link from protocol-prefixed links.
 */
export function parseHomeUrl(url: string): string {
  if (!url) return "#";
  if (url.startsWith("github:")) {
    const username = url.slice(7);
    return `https://github.com/${username}`;
  }
  if (url.startsWith("email:")) {
    const addr = url.slice(6);
    return `mailto:${addr}`;
  }
  if (url.startsWith("homepage:")) {
    return url.slice(9);
  }
  if (url.startsWith("qq:")) {
    return "#";
  }
  return url;
}
