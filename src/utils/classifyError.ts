import { AxiosError } from "axios";

export type ErrorType = "network" | "backend" | "invalid" | "unknown";

export interface ClassifiedError {
  type: ErrorType;
  message: string;
  code?: number;
}

/**
 * Classify an error from API calls into network / backend / invalid / unknown.
 */
export function classifyError(error: unknown): ClassifiedError {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return { type: "network", message: "网络连接失败，请检查网络设置" };
    }
    const status = error.response.status;
    const data = error.response.data as
      | { error?: number; msg?: string }
      | undefined;
    if (status >= 500) {
      return {
        type: "backend",
        message: data?.msg ?? "服务器内部错误",
        code: data?.error,
      };
    }
    return {
      type: "invalid",
      message: data?.msg ?? "请求无效",
      code: data?.error,
    };
  }
  return { type: "unknown", message: "未知错误" };
}
