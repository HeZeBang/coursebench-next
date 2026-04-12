import { handleRoute, okResponse } from "@/server/response";
import { getSession } from "@/server/auth/session";

export async function POST() {
  return handleRoute(async () => {
    const session = await getSession();
    session.destroy();
    return okResponse({});
  });
}
