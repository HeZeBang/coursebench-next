import { handleRoute, okResponse } from "@/server/response";
import { getRanklist } from "@/server/db/queries";
import { connection } from "next/server";

export async function GET() {
  return handleRoute(async () => {
    await connection();
    const data = await getRanklist();
    return okResponse(data);
  });
}
