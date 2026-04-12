import { handleRoute, okResponse } from "@/server/response";
import { getAllTeachers } from "@/server/db/queries";
import { connection } from "next/server";

export async function GET() {
  return handleRoute(async () => {
    await connection();
    const data = await getAllTeachers();
    return okResponse(data);
  });
}
