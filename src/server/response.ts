import { NextResponse } from "next/server";
import { AppError } from "./errors";

export function okResponse(data: unknown = null) {
  return NextResponse.json({ error: false, data });
}

export function errorResponse(err: AppError) {
  return NextResponse.json(
    {
      error: true,
      code: err.errno,
      msg: err.message,
      timestamp: new Date().toISOString(),
      full_msg: err.message,
    },
    { status: err.statusCode },
  );
}

/**
 * Wraps an async route handler with error handling that matches the Go backend's response format.
 */
export function handleRoute(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  return handler().catch((err) => {
    if (err instanceof AppError) {
      return errorResponse(err);
    }
    console.error("Unhandled error:", err);
    return NextResponse.json(
      {
        error: true,
        code: "32", // UnCaughtError errno
        msg: "服务器内部错误",
        timestamp: new Date().toISOString(),
        full_msg: String(err),
      },
      { status: 500 },
    );
  });
}
