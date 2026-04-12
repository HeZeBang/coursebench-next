import { handleRoute, okResponse } from "@/server/response";
import { requireUserId } from "@/server/auth/session";
import { db } from "@/server/db";
import { comments, replies } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import * as errors from "@/server/errors";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const commentId = Number(id);
    const { parent_reply_id, content, is_anonymous } = await req.json();

    if (!content || content.length > 50000) throw errors.InvalidArgument();

    const [comment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), isNull(comments.deletedAt)));
    if (!comment) throw errors.CommentNotExists();

    // Validate parent reply if provided
    if (parent_reply_id) {
      const [parent] = await db
        .select()
        .from(replies)
        .where(and(eq(replies.id, Number(parent_reply_id)), isNull(replies.deletedAt)));
      if (!parent || parent.commentId !== commentId) throw errors.InvalidArgument();
    }

    const now = Math.floor(Date.now() / 1000);
    const [newReply] = await db
      .insert(replies)
      .values({
        commentId,
        parentReplyId: parent_reply_id ? Number(parent_reply_id) : null,
        userId,
        content,
        isAnonymous: !!is_anonymous,
        createTime: now,
        updateTime: now,
      })
      .returning({ id: replies.id });

    return okResponse({ reply_id: newReply.id });
  });
}
