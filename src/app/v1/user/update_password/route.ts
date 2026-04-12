import { handleRoute, okResponse } from "@/server/response";
import { requireUserId } from "@/server/auth/session";
import { verifyPassword, hashPassword } from "@/server/auth/password";
import { verifyCaptcha } from "@/server/captcha";
import { getUserById } from "@/server/db/queries";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { checkPassword } from "@/server/validation";
import * as errors from "@/server/errors";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const userId = await requireUserId();
    const { old_password, new_password, captcha } = await req.json();

    if (!checkPassword(old_password) || !checkPassword(new_password)) {
      throw errors.InvalidArgument();
    }

    await verifyCaptcha(captcha);

    const user = await getUserById(userId);
    if (!(await verifyPassword(old_password, user.password || ""))) {
      throw errors.UserPasswordIncorrect();
    }

    const hash = await hashPassword(new_password);
    await db.update(users).set({ password: hash, updatedAt: new Date() }).where(eq(users.id, userId));

    return okResponse(null);
  });
}
