/**
 * Test email sending via SMTP.
 *
 * Usage:
 *   pnpm cli test_mail <to> [options]
 *
 * Options:
 *   --subject <text>     Custom subject
 *   --template <name>    Use built-in template: register | reset
 *   --raw <html>         Custom HTML body
 */
import { readFileSync, existsSync } from "fs";
import { createTransport } from "nodemailer";
// import { getRegisterEmailBody, getResetPasswordEmailBody } from "../../src/server/mail/verify.mjs";

const SERVICE_NAME = process.env.SERVICE_NAME || "CourseBench";
const SERVICE_NAME_EN = process.env.SERVICE_NAME_EN || "CourseBench";

// Re-export email templates
function getRegisterEmailBody(){
  return `<html><body>
<h1>欢迎注册${SERVICE_NAME}</h1>
<p>我们已经接收到您的电子邮箱验证申请，请点击以下链接完成注册。</p>
<p>验证完成后，您将能够即刻发布课程评价，并与其他用户互动。</p>
<p>请手动复制该链接并粘贴至浏览器地址栏以完成注册：</p>
<br/>
<p>{activeURL}</p>
<br/>
<p>预祝您在 CourseBench 玩得开心！</p>
<br/>
<p>如果您需要其它任何帮助，欢迎随时联系我们。</p>
<p>电邮地址：geekpie@geekpie.club</p>
<p>如您并未注册CourseBench账号，请无视本邮件。</p>
<br/>
<p>此致</p>
<p>${SERVICE_NAME} 团队</p>
<br>
<h1>Thank you for registering for ${SERVICE_NAME_EN}</h1> <p>We have received your application for verifying this email address. Please click on the link below to accomplish the process.</p>
<p>Once the registration is done, you will be able to post your comments on courses and interact with other users.</p>
<p>Please copy this URL and paste it on the address bar of your browser: </p>
<br/>
<p>{activeURL}</p>
<br/>
<p>Have fun at CourseBench!</p>
<br/>
<p>If you need any help, please don't hesitate to contact us.</p>
<p>Email: geekpie@geekpie.club </p>
<p>If you are not registering for CourseBench, please ignore this email.</p>
<br/>
<p>Yours,</p>
<p>${SERVICE_NAME_EN} Team</p>
</body></html>`;
}

function getResetPasswordEmailBody() {
  return `<html><body>
<h1>您正在重置您在${SERVICE_NAME}的密码</h1>
<p>请手动复制该链接并粘贴至浏览器：</p>
<br/>
<p>{activeURL}</p>
<br/>
<p>如有任何疑问，请随时联系我们。</p>
<p>电邮地址：geekpie@geekpie.club</p>
<p>如果您没有注册过我们的服务或您没有进行过密码重置，请无视该邮件</p>
<br/>
<p>此致</p>
<p>${SERVICE_NAME} 团队</p>
<br/>
<h1>You are resetting your password for ${SERVICE_NAME_EN}</h1>
<p>Please copy this URL and paste it on the address bar of your browser: </p>
<br/>
<p>{activeURL}</p>
<br/>
<p>If you have any questions, please don't hesitate to contact us.</p>
<p>Email: geekpie@geekpie.club</p>
<p>If you did not register for our service or did not request a password reset, please ignore this email.</p>
<br/>
<p>Yours,</p>
<p>${SERVICE_NAME_EN} Team</p>
</body></html>`;
}

// Load .env.local
const envPath = new URL("../../.env.local", import.meta.url);
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=["']?(.+?)["']?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

function env(key, fallback = "") {
  return process.env[key] || fallback;
}

export async function testMail(to, opts = {}) {
  const smtpHost = env("SMTP_HOST", "smtp.gmail.com");
  const smtpPort = parseInt(env("SMTP_PORT", "465"), 10);
  const smtpUser = env("SMTP_USERNAME");
  const smtpPass = env("SMTP_PASSWORD");
  const smtpFrom = env("SMTP_FROM");
  const smtpFromName = env("SMTP_FROM_NAME", "CourseBench");
  const serviceName = env("SERVICE_NAME", "GeekPie_ CourseBench 评教平台");

  console.log("── SMTP 配置 ──────────────────────────");
  console.log(`  Host:     ${smtpHost}`);
  console.log(`  Port:     ${smtpPort}`);
  console.log(`  Secure:   ${smtpPort === 465}`);
  console.log(`  Username: ${smtpUser ? smtpUser.slice(0, 4) + "****" : "(未设置)"}`);
  console.log(`  Password: ${smtpPass ? "****" : "(未设置)"}`);
  console.log(`  From:     "${smtpFromName}" <${smtpFrom || "(未设置)"}>`);
  console.log("");

  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP_USERNAME 或 SMTP_PASSWORD 未设置，请检查 .env.local");
  }

  // Build email content
  let { subject, template, raw } = opts;
  subject = subject || "CourseBench 测试邮件";
  const dummyURL = "https://example.com/test-active?id=0&code=test-code-123";

  const templates = {
    register: {
      subject: `${serviceName}用户邮箱验证`,
      html: getRegisterEmailBody().replaceAll("{activeURL}", dummyURL),
    },
    reset: {
      subject: `${serviceName}用户密码重置`,
      html: getResetPasswordEmailBody().replaceAll("{activeURL}", dummyURL),
    },
  };

  let html;
  if (raw) {
    html = raw;
  } else if (template) {
    if (!templates[template]) {
      throw new Error(`未知模板: "${template}"，可选: register, reset`);
    }
    subject = templates[template].subject;
    html = templates[template].html;
  } else {
    html = `<html><body>
<h1>CourseBench 邮件测试</h1>
<p>这是一封测试邮件，用于验证 SMTP 配置是否正确。</p>
<p>发送时间: ${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</p>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;margin-top:12px">
  <tr><td><b>SMTP Host</b></td><td>${smtpHost}</td></tr>
  <tr><td><b>SMTP Port</b></td><td>${smtpPort}</td></tr>
  <tr><td><b>From</b></td><td>${smtpFromName} &lt;${smtpFrom}&gt;</td></tr>
  <tr><td><b>To</b></td><td>${to}</td></tr>
</table>
<p style="color:#999;font-size:12px;">此邮件由 pnpm cli test_mail 发送。</p>
</body></html>`;
  }

  // Create transporter with debug logging
  const transporter = createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    logger: true,
    debug: true,
  });

  console.log(`── 发送邮件 ──────────────────────────`);
  console.log(`  收件人: ${to}`);
  console.log(`  主题:   ${subject}`);
  console.log(`  模板:   ${template || (raw ? "自定义" : "默认测试")}`);
  console.log("");

  const startTime = Date.now();

  // Verify connection
  console.log("→ 验证 SMTP 连接...");
  await transporter.verify();
  console.log(`✓ SMTP 连接成功 (${Date.now() - startTime}ms)\n`);

  // Send
  console.log("→ 发送邮件...");
  const info = await transporter.sendMail({
    from: `"${smtpFromName}" <${smtpFrom}>`,
    to,
    subject,
    html,
  });

  const elapsed = Date.now() - startTime;
  console.log("");
  console.log(`✓ 邮件发送成功! (${elapsed}ms)`);
  console.log(`  Message-ID: ${info.messageId}`);
  console.log(`  Response:   ${info.response}`);
  if (info.accepted?.length) console.log(`  Accepted:   ${info.accepted.join(", ")}`);
  if (info.rejected?.length) console.log(`  Rejected:   ${info.rejected.join(", ")}`);
}
