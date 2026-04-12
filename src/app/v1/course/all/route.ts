import { handleRoute, okResponse } from "@/server/response";
import { getAllCourses } from "@/server/db/queries";

export async function GET() {
  return handleRoute(async () => {
    const data = await getAllCourses();
    return okResponse(data);
  });
}
