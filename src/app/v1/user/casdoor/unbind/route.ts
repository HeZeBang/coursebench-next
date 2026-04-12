import { handleRoute, okResponse } from "@/server/response";
import { requireUserId } from "@/server/auth/session";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  return handleRoute(async () => {
    const userId = await requireUserId();
    await db.update(users).set({ casdoorSub: "" }).where(eq(users.id, userId));
    return okResponse({});
  });
}
