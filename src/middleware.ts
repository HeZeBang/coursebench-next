import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block teacher ID 100000001 (sentinel/placeholder ID)
  if (pathname.startsWith("/teacher/100000001")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:id*"],
};
