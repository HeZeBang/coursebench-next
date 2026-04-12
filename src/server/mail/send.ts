import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USERNAME = process.env.SMTP_USERNAME || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
const SMTP_FROM = process.env.SMTP_FROM || "";
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "CourseBench";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
});

/**
 * Send an HTML email. Mirrors the Go sendMail function.
 * @param to Recipient email address
 * @param subject Email subject
 * @param html HTML body (use {activeURL} as placeholder for activation link)
 * @param activeURL The activation URL to replace {activeURL} in the body
 */
export async function sendMail(
  to: string,
  subject: string,
  html: string,
  activeURL?: string,
): Promise<void> {
  if (process.env.DISABLE_MAIL === "true") return;

  let body = html;
  if (activeURL) {
    body = body.replaceAll("{activeURL}", activeURL);
  }

  await transporter.sendMail({
    from: `"${SMTP_FROM_NAME}" <${SMTP_FROM}>`,
    to,
    subject,
    html: body,
  });
}
