import { handleRoute, okResponse } from "@/server/response";
import { hashPassword } from "@/server/auth/password";
import { getUserById } from "@/server/db/queries";
import { checkCode } from "@/server/mail/verify";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { checkPassword } from "@/server/validation";
import * as errors from "@/server/errors";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const { id, code, password } = await req.json();

    if (!checkPassword(password)) throw errors.InvalidArgument();

    const user = await getUserById(Number(id));
    if (!user.isActive) throw errors.UserNotActive();

    const ok = await checkCode(user.id, code, "reset_password_mail_code");
    if (!ok) throw errors.MailCodeInvalid();

    const hash = await hashPassword(password);
    await db.update(users).set({ password: hash, updatedAt: new Date() }).where(eq(users.id, user.id));

    return okResponse({ OK: true });
  });
}
