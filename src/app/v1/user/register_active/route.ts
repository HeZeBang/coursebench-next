import { handleRoute, okResponse } from "@/server/response";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { checkCode } from "@/server/mail/verify";
import * as errors from "@/server/errors";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const { id, code } = await req.json();

    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, Number(id)), isNull(users.deletedAt)));
    if (!user) throw errors.UserNotExists();

    const ok = await checkCode(user.id, code, "register_mail_code");
    if (!ok) throw errors.MailCodeInvalid();

    await db.update(users).set({ isActive: true }).where(eq(users.id, user.id));

    return okResponse({ OK: true });
  });
}
