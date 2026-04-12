import crypto from "crypto";
import * as errors from "../errors";

const CASDOOR_ENDPOINT = process.env.CASDOOR_ENDPOINT || "";
const CASDOOR_CLIENT_ID = process.env.CASDOOR_CLIENT_ID || "";
const CASDOOR_CLIENT_SECRET = process.env.CASDOOR_CLIENT_SECRET || "";
const CASDOOR_REDIRECT_URI = process.env.CASDOOR_REDIRECT_URI || "";
const CASDOOR_FRONTEND_URL = process.env.CASDOOR_FRONTEND_URL || "";

interface CasdoorTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export function buildCasdoorSigninURL(state: string): string {
  const params = new URLSearchParams({
    client_id: CASDOOR_CLIENT_ID,
    response_type: "code",
    redirect_uri: getCasdoorRedirectURI(),
    scope: "read",
    state,
  });
  return `${CASDOOR_ENDPOINT.replace(/\/+$/, "")}/login/oauth/authorize?${params}`;
}

export function getCasdoorRedirectURI(): string {
  if (CASDOOR_REDIRECT_URI) return CASDOOR_REDIRECT_URI;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  return `${serverUrl.replace(/\/+$/, "")}/v1/user/casdoor/callback`;
}

export async function getCasdoorOAuthToken(code: string): Promise<CasdoorTokenResponse> {
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CASDOOR_CLIENT_ID,
    client_secret: CASDOOR_CLIENT_SECRET,
    code,
    redirect_uri: getCasdoorRedirectURI(),
  });

  const endpoint = `${CASDOOR_ENDPOINT.replace(/\/+$/, "")}/api/login/oauth/access_token`;
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    signal: AbortSignal.timeout(15000),
  });

  const token: CasdoorTokenResponse = await resp.json();
  return token;
}

export function parseJWTClaims(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length < 2) throw errors.InvalidArgument();
  const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
  return JSON.parse(payload);
}

export function readClaimAsString(claims: Record<string, unknown>, key: string): string {
  const v = claims[key];
  return typeof v === "string" ? v : "";
}

export function generateOAuthState(length = 16): string {
  return crypto.randomBytes(length).toString("hex");
}

export function sanitizeReturnURL(raw: string): string {
  raw = raw.trim();
  if (!raw) return "";
  try {
    const u = new URL(raw, "http://placeholder");
    if (raw.startsWith("/")) return raw;
    if (u.protocol === "http:" || u.protocol === "https:") return raw;
    return "";
  } catch {
    return "";
  }
}

export function buildFrontendOAuthCallbackURL(returnURL: string): string {
  const params = new URLSearchParams({ return_url: returnURL });
  const callbackPath = "/oauth/casdoor";

  if (CASDOOR_FRONTEND_URL) {
    return `${CASDOOR_FRONTEND_URL.replace(/\/+$/, "")}${callbackPath}?${params}`;
  }

  try {
    const parsed = new URL(returnURL);
    return `${parsed.origin}${callbackPath}?${params}`;
  } catch {
    return `${callbackPath}?${params}`;
  }
}

export function isCasdoorConfigured(): boolean {
  return !!(CASDOOR_ENDPOINT && CASDOOR_CLIENT_ID && CASDOOR_CLIENT_SECRET);
}
