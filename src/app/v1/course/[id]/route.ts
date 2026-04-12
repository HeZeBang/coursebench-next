import { handleRoute, okResponse } from "@/server/response";
import { getCourseDetail } from "@/server/db/queries";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { id } = await params;
    const data = await getCourseDetail(Number(id));
    return okResponse(data);
  });
}
