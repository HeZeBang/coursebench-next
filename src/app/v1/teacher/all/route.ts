import { handleRoute, okResponse } from "@/server/response";
import { getAllTeachers } from "@/server/db/queries";

export async function GET() {
  return handleRoute(async () => {
    const data = await getAllTeachers();
    return okResponse(data);
  });
}
