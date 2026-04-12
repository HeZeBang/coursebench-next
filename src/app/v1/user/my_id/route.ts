import { handleRoute, okResponse } from "@/server/response";
import { getUserId } from "@/server/auth/session";

export async function GET() {
  return handleRoute(async () => {
    const id = await getUserId();
    return okResponse({ id: id ?? 0 });
  });
}
