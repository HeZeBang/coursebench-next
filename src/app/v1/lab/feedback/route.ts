import { handleRoute, okResponse } from "@/server/response";
import { requireUserId } from "@/server/auth/session";
import { db } from "@/server/db";
import { featureFeedback } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import * as errors from "@/server/errors";
import { featureMeta } from "@/flags";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const userId = await requireUserId();
    const { featureKey, rating, comment } = await req.json();

    // Validate featureKey
    if (!featureMeta.some((f) => f.key === featureKey)) {
      throw errors.InvalidArgument();
    }

    // Validate rating 1-5
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      throw errors.InvalidArgument();
    }

    const trimmedComment =
      typeof comment === "string" ? comment.trim().slice(0, 500) : null;

    // Upsert: update if same user + featureKey already exists
    const [existing] = await db
      .select()
      .from(featureFeedback)
      .where(
        and(
          eq(featureFeedback.userId, userId),
          eq(featureFeedback.featureKey, featureKey),
        ),
      );

    if (existing) {
      await db
        .update(featureFeedback)
        .set({
          rating: r,
          comment: trimmedComment,
          updatedAt: new Date(),
        })
        .where(eq(featureFeedback.id, existing.id));
    } else {
      await db.insert(featureFeedback).values({
        userId,
        featureKey,
        rating: r,
        comment: trimmedComment,
      });
    }

    return okResponse({});
  });
}
