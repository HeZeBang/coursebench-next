import { handleRoute, okResponse } from "@/server/response";
import { verifyCaptcha } from "@/server/captcha";
import { getUserByEmail } from "@/server/db/queries";
import { postMail, getResetPasswordEmailBody } from "@/server/mail/verify";
import { checkEmail } from "@/server/validation";
import * as errors from "@/server/errors";

const SERVICE_NAME = process.env.SERVICE_NAME || "GeekPie_ CourseBench 评教平台";

export async function POST(req: Request) {
  return handleRoute(async () => {
    const { email, captcha } = await req.json();

    if (!checkEmail(email)) throw errors.InvalidArgument();
    await verifyCaptcha(captcha);

    const user = await getUserByEmail(email);
    if (!user.isActive) throw errors.UserNotActive();

    await postMail(
      user.id,
      email,
      "reset_password_mail_code",
      `${SERVICE_NAME}用户密码重置`,
      "reset_password_active",
      getResetPasswordEmailBody(),
    );

    return okResponse({ OK: true });
  });
}
