import { createHash } from "crypto";

/**
 * Parse a contributor's avatar URL from protocol-prefixed links.
 * Supports: qq:<id>, github:<username>, gravatar:<email>, cravatar:<email>, email:<address>, and direct URLs.
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
  if (url.startsWith("gravatar:")) {
    const email = url.slice(9).trim().toLowerCase();
    const hash = createHash("md5").update(email).digest("hex");
    return `https://www.gravatar.com/avatar/${hash}?s=640`;
  }
  if (url.startsWith("cravatar:")) {
    const email = url.slice(9).trim().toLowerCase();
    const hash = createHash("md5").update(email).digest("hex");
    return `https://cravatar.cn/avatar/${hash}?s=640`;
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
