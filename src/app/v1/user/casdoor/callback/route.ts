import { NextResponse } from "next/server";
import { handleRoute } from "@/server/response";
import { getSession } from "@/server/auth/session";
import {
  getCasdoorOAuthToken,
  parseJWTClaims,
  readClaimAsString,
  buildFrontendOAuthCallbackURL,
} from "@/server/auth/casdoor";
import { getUserById, getUserByCasdoorSub, getUserByEmail } from "@/server/db/queries";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { hashPassword } from "@/server/auth/password";
import { randomUUID } from "crypto";
import * as errors from "@/server/errors";

export async function GET(req: Request) {
  return handleRoute(async () => {
    const url = new URL(req.url);
    const state = url.searchParams.get("state") || "";
    const code = url.searchParams.get("code") || "";

    const session = await getSession();
    const storedState = session.casdoorOAuthState || "";

    if (!state || state !== storedState) throw errors.InvalidArgument();
    if (!code) throw errors.InvalidArgument();

    const token = await getCasdoorOAuthToken(code);
    if (!token.access_token) throw errors.InternalServerError();

    const claims = parseJWTClaims(token.access_token);
    const casdoorSub = readClaimAsString(claims, "sub");
    if (!casdoorSub) throw errors.InternalServerError();

    const email = readClaimAsString(claims, "email").toLowerCase().trim();
    let nickname = readClaimAsString(claims, "name").trim();
    if (!nickname) nickname = readClaimAsString(claims, "preferred_username").trim();
    const realname = nickname;

    const bindUserId = session.casdoorBindUserId;
    let userId: number;

    if (bindUserId) {
      // Bind flow: link Casdoor to existing user
      // Check if casdoorSub is already bound to another user
      const [existing] = await db
        .select()
        .from(users)
        .where(and(eq(users.casdoorSub, casdoorSub), isNull(users.deletedAt)));
      if (existing && existing.id !== bindUserId) throw errors.UserAlreadyExists();

      await db.update(users).set({ casdoorSub }).where(eq(users.id, bindUserId));
      userId = bindUserId;
    } else {
      // Login flow: find or create user
      try {
        const user = await getUserByCasdoorSub(casdoorSub);
        userId = user.id;
      } catch {
        // Not found by casdoorSub, try by email
        let found = false;
        if (email) {
          try {
            const user = await getUserByEmail(email);
            await db.update(users).set({ casdoorSub }).where(eq(users.id, user.id));
            userId = user.id;
            found = true;
          } catch {
            // Not found by email either
          }
        }

        if (!found!) {
          // Create new OAuth user
          const hash = await hashPassword(randomUUID());
          const invCode = generateInvitationCode();
          const userEmail = email || `oauth_${casdoorSub.replace(/\//g, "_")}@invalid.local`;
          const nick = nickname || userEmail.split("@")[0];

          const [newUser] = await db
            .insert(users)
            .values({
              email: userEmail,
              casdoorSub,
              password: hash,
              nickName: nick,
              realName: realname || nick,
              isActive: true,
              isAdmin: false,
              invitationCode: invCode,
            })
            .returning({ id: users.id });
          userId = newUser.id;
        }
      }
    }

    // Set session
    session.userId = userId!;
    session.casdoorOAuthState = undefined;
    session.casdoorBindUserId = undefined;
    const returnUrl = session.casdoorReturnUrl || "/";
    session.casdoorReturnUrl = undefined;
    await session.save();

    const redirectURL = buildFrontendOAuthCallbackURL(returnUrl);
    return NextResponse.redirect(redirectURL, 302);
  });
}

function generateInvitationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
