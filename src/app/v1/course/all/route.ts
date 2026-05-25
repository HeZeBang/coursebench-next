import { handleRoute, publicOkResponse } from "@/server/response";
import { getAllCourses } from "@/server/db/queries";

export async function GET() {
  return handleRoute(async () => {
    const data = await getAllCourses();
    return publicOkResponse(data);
  });
}
