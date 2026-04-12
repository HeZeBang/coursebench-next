import { handleRoute, okResponse } from "@/server/response";
import { getUserId } from "@/server/auth/session";
import { buildReplyResponse } from "@/server/db/queries";
import { db } from "@/server/db";
import { replies } from "@/server/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import * as errors from "@/server/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { id } = await params;
    const replyId = Number(id);
    const viewerId = (await getUserId()) ?? 0;

    const [current] = await db
      .select()
      .from(replies)
      .where(and(eq(replies.id, replyId), isNull(replies.deletedAt)));
    if (!current) throw errors.InvalidArgument();

    // Build ancestors chain
    const ancestors = [];
    let parentId = current.parentReplyId;
    while (parentId) {
      const [parent] = await db.select().from(replies).where(eq(replies.id, parentId));
      if (!parent) break;
      ancestors.unshift(await buildReplyResponse(parent, viewerId));
      parentId = parent.parentReplyId;
    }

    // Build descendants (direct children)
    const children = await db
      .select()
      .from(replies)
      .where(and(eq(replies.parentReplyId, replyId), isNull(replies.deletedAt)))
      .orderBy(desc(replies.createTime));

    const descendants = await Promise.all(
      children.map(async (child) => {
        const childResp = await buildReplyResponse(child, viewerId);
        // Get grandchildren
        const grandchildren = await db
          .select()
          .from(replies)
          .where(and(eq(replies.parentReplyId, child.id), isNull(replies.deletedAt)))
          .orderBy(desc(replies.createTime));
        const grandchildData = await Promise.all(
          grandchildren.map(async (gc) => ({
            reply: await buildReplyResponse(gc, viewerId),
            children: [],
          })),
        );
        return { reply: childResp, children: grandchildData };
      }),
    );

    return okResponse({
      ancestors,
      current: await buildReplyResponse(current, viewerId),
      descendants,
    });
  });
}
