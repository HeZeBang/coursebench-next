import { handleRoute, okResponse } from "@/server/response";
import { getAllCourses } from "@/server/db/queries";
import { connection } from "next/server";

export async function GET() {
  return handleRoute(async () => {
    await connection();
    const data = await getAllCourses();
    return okResponse(data);
  });
}
