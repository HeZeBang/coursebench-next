import * as errors from "../errors";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "";
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Replaces the old SVG captcha system.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyCaptcha(token: string): Promise<void> {
  if (process.env.DISABLE_CAPTCHA === "true") return;

  if (!token) {
    throw errors.NoCaptchaToken();
  }

  if (!TURNSTILE_SECRET_KEY) {
    console.warn("TURNSTILE_SECRET_KEY not set, skipping verification");
    return;
  }

  const formData = new URLSearchParams();
  formData.append("secret", TURNSTILE_SECRET_KEY);
  formData.append("response", token);

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  const outcome: { success: boolean; "error-codes"?: string[] } = await res.json();

  if (!outcome.success) {
    const codes = outcome["error-codes"] || [];
    if (codes.includes("timeout-or-duplicate")) {
      throw errors.CaptchaExpired();
    }
    throw errors.CaptchaMismatch();
  }
}
