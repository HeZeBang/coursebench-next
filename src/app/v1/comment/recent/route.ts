import { handleRoute, okResponse } from "@/server/response";
import { getUserId } from "@/server/auth/session";
import { getRecentComments } from "@/server/db/queries";

export async function GET() {
  return handleRoute(async () => {
    const viewerId = (await getUserId()) ?? 0;
    const data = await getRecentComments(viewerId);
    return okResponse(data);
  });
}
