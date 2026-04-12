import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";
import { sendMail } from "./send";

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
const SERVICE_NAME = process.env.SERVICE_NAME || "GeekPie_ CourseBench 评教平台";
const SERVICE_NAME_EN = process.env.SERVICE_NAME_EN || "GeekPie_ CourseBench";
const CODE_TTL = 60 * 60 * 2; // 2 hours in seconds

/**
 * Generate a verification code, store it in Redis, and send the email.
 * Mirrors the Go PostMail function.
 */
export async function postMail(
  userId: number,
  email: string,
  service: string,
  subject: string,
  urlPath: string,
  body: string,
): Promise<void> {
  if (process.env.DISABLE_MAIL === "true") return;

  const code = randomUUID();
  const key = `${service}:${userId}`;
  await redis.set(key, code, { ex: CODE_TTL });

  const activeURL = `${SERVER_URL}/${urlPath}?id=${userId}&code=${code}`;
  await sendMail(email, subject, body, activeURL);
}

/**
 * Verify a mail code against what's stored in Redis.
 * Returns true if valid, false if mismatch. Deletes the code on success.
 */
export async function checkCode(userId: number, code: string, service: string): Promise<boolean> {
  if (process.env.DISABLE_MAIL === "true") return true;

  const key = `${service}:${userId}`;
  const stored = await redis.get<string>(key);

  if (!stored) return false;
  if (stored !== code) return false;

  await redis.del(key);
  return true;
}

// Re-export email templates
export function getRegisterEmailBody(): string {
  return `<html><body>
<h1>欢迎注册${SERVICE_NAME}</h1> <p>我们已经接收到您的电子邮箱验证申请，请点击以下链接完成注册。</p>
<p>验证完成后，您将能够即刻发布课程评价，并与其他用户互动。</p>
<a href="{activeURL}">注册链接 </a> <br>
<p>如无法点击，请手动复制该链接并粘贴至浏览器地址栏以完成注册：{activeURL} </p>
<p>预祝您在 CourseBench 玩得开心！</p> <br>
<p>如果您需要其它任何帮助，欢迎随时联系我们。</p>
<p>电邮地址：zhaoqch1@shanghaitech.edu.cn</p>
<p>如您并未注册CourseBench账号，请无视本邮件。</p><br>
<p>此致</p>
<p>${SERVICE_NAME} 团队</p>
<br>
<h1>Thank you for registering for ${SERVICE_NAME_EN}</h1> <p>We have received your application for verifying this email address. Please click on the link below to accomplish the process.</p>
<p>Once the registration is done, you will be able to post your comments on courses and interact with other users.</p>
<a href="{activeURL}">Register Link </a> <br>
<p>If the link above isn't working, in order to verify your account, please copy this URL and paste it on the address bar of your browser:  {activeURL} </p>
<p>Have fun at CourseBench!</p><br>
<p>If you need any help, please don't hesitate to contact us.</p>
<p>Email: zhaoqch1@shanghaitech.edu.cn </p>
<p>If you are not registering for CourseBench, please ignore this email.</p><br>
<p>Yours,</p>
<p>${SERVICE_NAME_EN} Team</p>
</body></html>`;
}

export function getResetPasswordEmailBody(): string {
  return `<html><body><h1>您正在重置您在${SERVICE_NAME}的密码</h1> <p>请点击该链接继续完成密码重置:</p><a href="{activeURL}">密码重置链接 </a> <br> <p>如果链接无法点击，请手动复制该链接并粘贴至浏览器：{activeURL} </p><br><br> <p>如果您没有注册过我们的服务或您没有进行过密码重置，请无视该邮件</p> </body></html>`;
}
