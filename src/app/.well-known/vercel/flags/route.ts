import { NextResponse } from "next/server";
import { getProviderData } from "@vercel/flags/next";
import { verifyAccess } from "@vercel/flags";
import { allFlags } from "@/flags";

export async function GET(req: Request) {
  const access = await verifyAccess(req.headers.get("Authorization"));
  if (!access) {
    return NextResponse.json(null, { status: 401 });
  }

  const providerData = getProviderData(allFlags);
  return NextResponse.json(providerData);
}
