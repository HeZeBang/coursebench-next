import { NextResponse } from "next/server";
import { handleRoute } from "@/server/response";
import { getSession, requireUserId } from "@/server/auth/session";
import {
  buildCasdoorSigninURL,
  generateOAuthState,
  sanitizeReturnURL,
  isCasdoorConfigured,
} from "@/server/auth/casdoor";
import * as errors from "@/server/errors";

export async function GET(req: Request) {
  return handleRoute(async () => {
    if (!isCasdoorConfigured()) throw errors.InvalidArgument();

    const userId = await requireUserId();
    const url = new URL(req.url);
    const returnUrl = sanitizeReturnURL(url.searchParams.get("return_url") || "") || "/";

    const session = await getSession();
    const state = generateOAuthState();

    session.casdoorOAuthState = state;
    session.casdoorBindUserId = userId;
    session.casdoorReturnUrl = returnUrl;
    await session.save();

    const authURL = buildCasdoorSigninURL(state);
    return NextResponse.redirect(authURL, 302);
  });
}
