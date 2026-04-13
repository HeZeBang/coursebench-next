import { handleRoute, okResponse } from "@/server/response";
import { requireUserId } from "@/server/auth/session";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { checkNickName, checkRealName, checkYear, checkGrade } from "@/server/validation";
import * as errors from "@/server/errors";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const userId = await requireUserId();
    const { year, grade, nickname, realname, is_anonymous, avatar } = await req.json();

    const gradeMap: Record<string, number> = { unknown: 0, undergraduate: 1, postgraduate: 2, phd_student: 3 };
    const gradeNum = typeof grade === "string" ? (gradeMap[grade] ?? 0) : (grade ?? 0);

    if (!checkYear(year ?? 0)) throw errors.InvalidArgument();
    if (!checkGrade(gradeNum)) throw errors.InvalidArgument();
    if (!checkNickName(nickname || "")) throw errors.InvalidArgument();
    if (!checkRealName(realname || "")) throw errors.InvalidArgument();

    const updateData: Record<string, unknown> = {
      year: year ?? 0,
      grade: gradeNum,
      nickName: nickname || "",
      realName: realname || "",
      isAnonymous: !!is_anonymous,
      updatedAt: new Date(),
    };

    if (typeof avatar === "string") {
      updateData.avatar = avatar;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    return okResponse(null);
  });
}
