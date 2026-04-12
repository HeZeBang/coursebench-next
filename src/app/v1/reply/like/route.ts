import { handleRoute, okResponse } from "@/server/response";
import { requireUserId } from "@/server/auth/session";
import { db } from "@/server/db";
import { replies, replyLikes } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import * as errors from "@/server/errors";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const userId = await requireUserId();
    const { id, status } = await req.json();
    const replyId = Number(id);

    const [reply] = await db
      .select()
      .from(replies)
      .where(and(eq(replies.id, replyId), isNull(replies.deletedAt)));
    if (!reply) throw errors.InvalidArgument();
    if (reply.userId === userId) throw errors.InvalidArgument();

    const [existing] = await db
      .select()
      .from(replyLikes)
      .where(and(eq(replyLikes.userId, userId), eq(replyLikes.replyId, replyId), isNull(replyLikes.deletedAt)));

    let likeDelta = 0;
    let dislikeDelta = 0;

    if (existing) {
      const wasLike = existing.isLike;
      if (status === 0) {
        await db.update(replyLikes).set({ deletedAt: new Date() }).where(eq(replyLikes.id, existing.id));
        if (wasLike) likeDelta = -1; else dislikeDelta = -1;
      } else {
        const newIsLike = status === 1;
        if (newIsLike !== wasLike) {
          await db.update(replyLikes).set({ isLike: newIsLike, updatedAt: new Date() }).where(eq(replyLikes.id, existing.id));
          if (newIsLike) { likeDelta = 1; dislikeDelta = -1; }
          else { likeDelta = -1; dislikeDelta = 1; }
        }
      }
    } else if (status !== 0) {
      await db.insert(replyLikes).values({ userId, replyId, isLike: status === 1 });
      if (status === 1) likeDelta = 1; else dislikeDelta = 1;
    }

    if (likeDelta !== 0 || dislikeDelta !== 0) {
      await db
        .update(replies)
        .set({ like: (reply.like ?? 0) + likeDelta, dislike: (reply.dislike ?? 0) + dislikeDelta, updatedAt: new Date() })
        .where(eq(replies.id, replyId));
    }

    return okResponse({});
  });
}
