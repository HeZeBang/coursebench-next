import { handleRoute, okResponse } from "@/server/response";
import { requireUserId } from "@/server/auth/session";
import { db } from "@/server/db";
import { replies } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import * as errors from "@/server/errors";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const userId = await requireUserId();
    const { id, content } = await req.json();

    if (!content || content.length > 50000) throw errors.InvalidArgument();

    const [reply] = await db
      .select()
      .from(replies)
      .where(and(eq(replies.id, Number(id)), isNull(replies.deletedAt)));
    if (!reply) throw errors.InvalidArgument();
    if (reply.userId !== userId) throw errors.PermissionDenied();

    const now = Math.floor(Date.now() / 1000);
    await db.update(replies).set({ content, updateTime: now, updatedAt: new Date() }).where(eq(replies.id, reply.id));

    return okResponse({});
  });
}
