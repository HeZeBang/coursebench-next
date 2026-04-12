import { handleRoute, okResponse } from "@/server/response";
import { hashPassword } from "@/server/auth/password";
import { verifyCaptcha } from "@/server/captcha";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { checkEmail, checkPassword, checkNickName, checkRealName, checkYear, checkGrade, checkInvitationCode } from "@/server/validation";
import { postMail, getRegisterEmailBody } from "@/server/mail/verify";
import * as errors from "@/server/errors";

const SERVICE_NAME = process.env.SERVICE_NAME || "GeekPie_ CourseBench 评教平台";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const body = await req.json();
    const { email, password, year, grade, captcha, nickname, invitation_code } = body;

    // Validate inputs
    if (!checkEmail(email)) throw errors.InvalidArgument();
    if (!checkPassword(password)) throw errors.InvalidArgument();
    if (!checkYear(year ?? 0)) throw errors.InvalidArgument();
    if (!checkGrade(grade ?? 0)) throw errors.InvalidArgument();
    if (!checkNickName(nickname || "")) throw errors.InvalidArgument();
    if (!checkRealName(body.realname || "")) throw errors.InvalidArgument();
    if (!checkInvitationCode(invitation_code || "")) throw errors.InvalidArgument();

    await verifyCaptcha(captcha);

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)));

    if (existing) {
      if (existing.isActive) {
        throw errors.UserEmailDuplicated();
      }
      // Delete inactive user to allow re-registration
      await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, existing.id));
    }

    const hash = await hashPassword(password);

    // Generate invitation code
    const invCode = generateInvitationCode();

    // Handle invitation code reward
    let invitedByUserId = 0;
    if (invitation_code) {
      const [inviter] = await db
        .select()
        .from(users)
        .where(and(eq(users.invitationCode, invitation_code), isNull(users.deletedAt)));
      if (!inviter) throw errors.InvitationCodeInvalid();
      invitedByUserId = inviter.id;
      await db
        .update(users)
        .set({ reward: (inviter.reward ?? 0) + 100 })
        .where(eq(users.id, inviter.id));
    }

    // Map grade string to number
    const gradeMap: Record<string, number> = {
      unknown: 0,
      undergraduate: 1,
      postgraduate: 2,
      phd_student: 3,
    };
    const gradeNum = typeof grade === "string" ? (gradeMap[grade] ?? 0) : (grade ?? 0);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hash,
        nickName: nickname || "",
        realName: body.realname || "",
        year: year ?? 0,
        grade: gradeNum,
        isActive: false,
        isAdmin: false,
        invitationCode: invCode,
        invitedByUserId,
      })
      .returning({ id: users.id });

    // Send activation email
    await postMail(
      newUser.id,
      email,
      "register_mail_code",
      `${SERVICE_NAME}用户注册验证`,
      "active",
      getRegisterEmailBody(),
    );

    return okResponse({ UserID: newUser.id });
  });
}

function generateInvitationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
