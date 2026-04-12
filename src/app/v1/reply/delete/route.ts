import { handleRoute, okResponse } from "@/server/response";
import { requireUserId } from "@/server/auth/session";
import { getUserById } from "@/server/db/queries";
import { db } from "@/server/db";
import { replies } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import * as errors from "@/server/errors";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const userId = await requireUserId();
    const { id } = await req.json();

    const [reply] = await db
      .select()
      .from(replies)
      .where(and(eq(replies.id, Number(id)), isNull(replies.deletedAt)));
    if (!reply) throw errors.InvalidArgument();

    const user = await getUserById(userId);
    if (reply.userId !== userId && !user.isAdmin) throw errors.PermissionDenied();

    await db.update(replies).set({ deletedAt: new Date() }).where(eq(replies.id, reply.id));

    return okResponse(null);
  });
}
