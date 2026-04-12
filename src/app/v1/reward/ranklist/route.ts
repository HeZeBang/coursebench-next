import { handleRoute, okResponse } from "@/server/response";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { isNull, desc } from "drizzle-orm";

export async function GET() {
  return handleRoute(async () => {
    const rows = await db
      .select({
        nickName: users.nickName,
        reward: users.reward,
        isAnonymous: users.isAnonymous,
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.reward))
      .limit(30);

    const data = rows.map((r) => ({
      nickname: r.isAnonymous ? "" : (r.nickName || ""),
      reward: r.reward ?? 0,
      is_anonymous: r.isAnonymous ?? false,
    }));

    return okResponse(data);
  });
}
