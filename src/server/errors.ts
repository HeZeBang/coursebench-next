// Error codes ported from backend/pkg/errors/description.go
// errno values are sequential integers starting from 1, matching the Go registration order.

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly errno: string,
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Sequential errno generator to match Go's auto-incrementing errno
let _errno = 0;
function nextErrno(): string {
  return String(++_errno);
}

// FATAL errors (errno 1-2)
export const ServerPanics = () => new AppError("ServerPanics", "1", 500, "服务器内部错误");
export const LogicError = () => new AppError("LogicError", "2", 500, "服务器内部错误");

// ERROR-level internal errors (errno 3-10)
export const InternalServerError = () => new AppError("InternalServerError", "3", 500, "服务器内部错误");
export const InfluxDBError = () => new AppError("InfluxDBError", "4", 500, "服务器内部错误");
export const NebulaError = () => new AppError("NebulaError", "5", 500, "服务器内部错误");
export const RedisError = () => new AppError("RedisError", "6", 500, "服务器内部错误");
export const DatabaseError = () => new AppError("DatabaseError", "7", 500, "服务器内部错误");
export const MinIOError = () => new AppError("MinIOError", "8", 500, "服务器内部错误");
export const GobEncodingError = () => new AppError("GobEncodingError", "9", 500, "服务器内部错误");
export const GobDecodingError = () => new AppError("GobDecodingError", "10", 500, "服务器内部错误");
export const GPTWorkerError = () => new AppError("GPTWorkerError", "11", 500, "GPT Worker 出错");

// SILENT business errors (errno 12+)
export const InvalidRequest = () => new AppError("InvalidRequest", "12", 400, "请求非法");
export const UserNotExists = () => new AppError("UserNotExists", "13", 400, "未找到用户");
export const UserAlreadyExists = () => new AppError("UserAlreadyExists", "14", 400, "用户已存在");
export const UserEmailDuplicated = () => new AppError("UserEmailDuplicated", "15", 400, "用户邮箱重复");
export const UserPasswordIncorrect = () => new AppError("UserPasswordIncorrect", "16", 400, "用户密码错误");
export const UserNotLogin = () => new AppError("UserNotLogin", "17", 400, "用户未登录");
export const UserNotActive = () => new AppError("UserNotActive", "18", 400, "用户邮箱未激活");
export const MailCodeInvalid = () => new AppError("MailCodeInvalid", "19", 400, "邮箱验证码错误");
export const CaptchaMismatch = () => new AppError("CaptchaMismatch", "20", 400, "验证码错误");
export const NoCaptchaToken = () =>
  new AppError("NoCaptchaToken", "21", 400, "未请求过验证码Token，请检查您的 Cookie 设置");
export const CaptchaExpired = () => new AppError("CaptchaExpired", "22", 400, "验证码已过期");
export const InvitationCodeInvalid = () => new AppError("InvitationCodeInvalid", "23", 400, "邀请码无效");
export const TeacherNotExists = () => new AppError("TeacherNotExists", "24", 400, "未找到教师");
export const CourseNotExists = () => new AppError("CourseNotExists", "25", 400, "未找到课程");
export const CourseGroupNotExists = () => new AppError("CourseGroupNotExists", "26", 400, "未找到课程授课组");
export const CommentAlreadyExists = () => new AppError("CommentAlreadyExists", "27", 400, "评论已存在");
export const CommentNotExists = () => new AppError("CommentNotExists", "28", 400, "评论不存在");
export const FileTooLarge = () => new AppError("FileTooLarge", "29", 400, "文件过大");
export const InvalidArgument = () => new AppError("InvalidArgument", "30", 400, "参数非法");
export const PermissionDenied = () => new AppError("PermissionDenied", "31", 403, "您没有权限执行此操作");
export const UnCaughtError = () => new AppError("UnCaughtError", "32", 500, "服务器内部错误");
export const FailedToGetRedisLock = () => new AppError("FailedToGetRedisLock", "33", 500, "服务器繁忙");
export const SMTPError = () => new AppError("SMTPError", "34", 500, "邮件发送失败");
