/**
 * Helpers for initiating Casdoor (GeekPie) OAuth flows.
 *
 * The backend exposes two GET endpoints that redirect the browser to Casdoor:
 *   - /v1/user/casdoor/login  — login or register via OAuth
 *   - /v1/user/casdoor/bind   — bind an existing account to Casdoor
 *
 * Both accept a `return_url` query parameter so the user is redirected back
 * to the page they came from after the flow completes.
 */

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";

/**
 * Redirect the browser to start the Casdoor OAuth **login** flow.
 * After success the backend redirects to `/oauth/casdoor?return_url=…`
 * which is handled by the existing Next.js callback page.
 */
export function startCasdoorLogin(): void {
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.href = `${SERVER_URL}/v1/user/casdoor/login?return_url=${returnUrl}`;
}

/**
 * Redirect the browser to start the Casdoor OAuth **bind** flow.
 * The user must already be logged in; the backend will associate their
 * session with the Casdoor identity.
 */
export function startCasdoorBind(): void {
  const returnUrl = encodeURIComponent(window.location.href);
  window.location.href = `${SERVER_URL}/v1/user/casdoor/bind?return_url=${returnUrl}`;
}
