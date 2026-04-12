const MAIL_SUFFIX = process.env.MAIL_SUFFIX || "@shanghaitech.edu.cn";

export function checkEmail(email: string): boolean {
  if (email.length > 100) return false;
  if (email.includes("+")) return false;
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  if (!email.endsWith(MAIL_SUFFIX)) return false;
  return true;
}

export function checkPassword(password: string): boolean {
  if (password.length < 6 || password.length > 30) return false;
  const allowed = /^[a-zA-Z0-9!@#$%^&*()\-_=+{}\[\]|\\:;'<>,.?/~`]+$/;
  return allowed.test(password);
}

export function checkNickName(nickname: string): boolean {
  if (nickname.length > 40) return false;
  // eslint-disable-next-line no-control-regex
  const nonGraphic = /[\x00-\x1F\x7F]/;
  return !nonGraphic.test(nickname);
}

export function checkRealName(realname: string): boolean {
  if (realname.length > 30) return false;
  // eslint-disable-next-line no-control-regex
  const nonGraphic = /[\x00-\x1F\x7F]/;
  return !nonGraphic.test(realname);
}

export function checkYear(year: number): boolean {
  return year === 0 || (year >= 2014 && year <= new Date().getFullYear());
}

export function checkGrade(grade: number): boolean {
  return grade >= 0 && grade <= 3;
}

export function checkInvitationCode(code: string): boolean {
  if (code.length === 0) return true;
  if (code.length !== 5) return false;
  return /^[a-zA-Z0-9]+$/.test(code);
}
