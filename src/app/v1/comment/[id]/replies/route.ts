import { handleRoute, okResponse } from "@/server/response";
import { getUserId } from "@/server/auth/session";
import { buildReplyResponse } from "@/server/db/queries";
import { db } from "@/server/db";
import { comments, replies } from "@/server/db/schema";
import { eq, and, isNull, desc, sql, gte } from "drizzle-orm";
import * as errors from "@/server/errors";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { id } = await params;
    const commentId = Number(id);
    const viewerId = (await getUserId()) ?? 0;

    const url = new URL(req.url);
    const sort = url.searchParams.get("sort") || "latest";
    const showAll = url.searchParams.get("all") === "1";

    const [comment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), isNull(comments.deletedAt)));
    if (!comment) throw errors.CommentNotExists();

    // Get total count
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(replies)
      .where(and(eq(replies.commentId, commentId), isNull(replies.deletedAt)));
    const totalCount = Number(totalResult?.count ?? 0);

    // Build query
    const conditions = [eq(replies.commentId, commentId), isNull(replies.deletedAt)];
    if (!showAll) {
      conditions.push(gte(replies.like, 5));
    }

    const orderBy = sort === "hottest" ? desc(replies.like) : desc(replies.createTime);

    const rows = await db
      .select()
      .from(replies)
      .where(and(...conditions))
      .orderBy(orderBy);

    const replyData = await Promise.all(rows.map((r) => buildReplyResponse(r, viewerId)));

    return okResponse({
      total_count: totalCount,
      filtered_count: rows.length,
      replies: replyData,
    });
  });
}
