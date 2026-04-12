import { handleRoute, okResponse } from "@/server/response";
import { requireUserId } from "@/server/auth/session";
import { uploadAvatar, resolveAvatarUrl } from "@/server/storage/blob";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const userId = await requireUserId();

    const formData = await req.formData();
    const file = formData.get("avatar") as Blob | null;
    if (!file) {
      const { InvalidArgument } = await import("@/server/errors");
      throw InvalidArgument();
    }

    const url = await uploadAvatar(file, userId);
    await db.update(users).set({ avatar: url, updatedAt: new Date() }).where(eq(users.id, userId));

    return okResponse({ avatar: url });
  });
}
