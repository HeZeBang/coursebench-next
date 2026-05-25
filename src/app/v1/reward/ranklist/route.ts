import { handleRoute, publicOkResponse } from "@/server/response";
import { getRanklist } from "@/server/db/queries";

export async function GET() {
  return handleRoute(async () => {
    const data = await getRanklist();
    return publicOkResponse(data);
  });
}
