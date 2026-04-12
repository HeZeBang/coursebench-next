import type { Metadata } from "next";
import { getRecentCommentsPaginated } from "@/server/db/queries";
import { getUserId } from "@/server/auth/session";
import RecentClient from "./RecentClient";
import type { Comment } from "@/types";

export const metadata: Metadata = {
  title: "最近评价 - CourseBench",
};

export default async function RecentPage() {
  const viewerId = (await getUserId()) ?? 0;
  const firstPage = await getRecentCommentsPaginated(viewerId, 1);
  return (
    <RecentClient
      firstPage={{
        ...firstPage,
        comments: firstPage.comments as Comment[],
      }}
    />
  );
}
