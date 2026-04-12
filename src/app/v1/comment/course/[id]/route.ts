import { handleRoute, okResponse } from "@/server/response";
import { getUserId } from "@/server/auth/session";
import { getCommentsByCourse } from "@/server/db/queries";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    const { id } = await params;
    const viewerId = (await getUserId()) ?? 0;
    const data = await getCommentsByCourse(Number(id), viewerId);
    return okResponse(data);
  });
}
