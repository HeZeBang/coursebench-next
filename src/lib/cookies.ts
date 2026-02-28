import Cookies from "js-cookie";
import type { UserProfile } from "@/types";

const PRESET_KEY = "preset";
const PRESET_MAX_AGE_DAYS = 1; // 24 hours

/**
 * Encode a unicode string to base64 (handling non-ASCII characters).
 */
function unicodeToBase64(str: string): string {
  const codeUnits = new Uint16Array(str.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = str.charCodeAt(i);
  }
  const charCodes = new Uint8Array(codeUnits.buffer);
  let binary = "";
  for (let i = 0; i < charCodes.byteLength; i++) {
    binary += String.fromCharCode(charCodes[i]);
  }
  return btoa(binary);
}

/**
 * Decode a base64 string back to unicode.
 */
function base64ToUnicode(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const charCodes = new Uint16Array(bytes.buffer);
  let result = "";
  for (let i = 0; i < charCodes.length; i++) {
    result += String.fromCharCode(charCodes[i]);
  }
  return result;
}

/**
 * Save user preset to cookie (base64-encoded JSON).
 * Merges with existing preset data.
 */
export function setPreset(preset: Partial<UserProfile>): void {
  const existing = getPreset();
  const merged = { ...existing, ...preset };
  const encoded = unicodeToBase64(JSON.stringify(merged));
  Cookies.set(PRESET_KEY, encoded, { expires: PRESET_MAX_AGE_DAYS, path: "/" });
}

/**
 * Read user preset from cookie.
 */
export function getPreset(): Partial<UserProfile> {
  const raw = Cookies.get(PRESET_KEY);
  if (!raw) return {};
  try {
    const decoded = base64ToUnicode(raw);
    const parsed = JSON.parse(decoded);
    // Filter out undefined values
    const result: Record<string, unknown> = {};
    for (const key in parsed) {
      if (parsed[key] !== undefined) result[key] = parsed[key];
    }
    return result as Partial<UserProfile>;
  } catch {
    return {};
  }
}

/**
 * Clear user preset cookie.
 */
export function clearPreset(): void {
  Cookies.remove(PRESET_KEY, { path: "/" });
}

/**
 * Check if preset cookie exists and is non-empty.
 */
export function hasPreset(): boolean {
  const raw = Cookies.get(PRESET_KEY);
  return !!raw && raw.length > 0;
}
