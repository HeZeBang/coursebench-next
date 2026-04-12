import { handleRoute, okResponse } from "@/server/response";
import { getSession } from "@/server/auth/session";
import { verifyPassword } from "@/server/auth/password";
import { verifyCaptcha } from "@/server/captcha";
import { getUserByEmail, buildProfileResponse } from "@/server/db/queries";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { checkEmail, checkPassword } from "@/server/validation";
import * as errors from "@/server/errors";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const body = await req.json();
    const { email, password, captcha } = body;

    if (!checkEmail(email) || !checkPassword(password)) {
      throw errors.InvalidArgument();
    }

    await verifyCaptcha(captcha);

    const user = await getUserByEmail(email);

    if (!(await verifyPassword(password, user.password || ""))) {
      throw errors.UserPasswordIncorrect();
    }

    if (!user.isActive) {
      throw errors.UserNotActive();
    }

    // Generate invitation code if missing
    if (!user.invitationCode) {
      const code = generateInvitationCode();
      await db.update(users).set({ invitationCode: code }).where(eq(users.id, user.id));
    }

    const session = await getSession();
    session.userId = user.id;
    await session.save();

    const profile = await buildProfileResponse(user.id, user.id);
    return okResponse(profile);
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
