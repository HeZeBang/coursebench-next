import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: number;
  // Casdoor OAuth flow state
  casdoorOAuthState?: string;
  casdoorBindUserId?: number;
  casdoorReturnUrl?: string;
}

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET || "a-very-long-secret-that-must-be-at-least-32-chars-long",
  cookieName: "session_id",
  cookieOptions: {
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

export async function getUserId(): Promise<number | null> {
  const session = await getSession();
  return session.userId ?? null;
}

export async function requireUserId(): Promise<number> {
  const userId = await getUserId();
  if (!userId) {
    const { UserNotLogin } = await import("../errors");
    throw UserNotLogin();
  }
  return userId;
}
