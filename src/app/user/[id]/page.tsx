import { notFound } from "next/navigation";
import { buildProfileResponse, getCommentsByUser } from "@/server/db/queries";
import { getUserId } from "@/server/auth/session";
import { AppError } from "@/server/errors";
import UserDetailClient from "./UserDetailClient";
import type { Comment, UserProfile } from "@/types";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const userId = Number(id);
  const viewerId = (await getUserId()) ?? 0;

  let profile;
  try {
    profile = await buildProfileResponse(userId, viewerId);
  } catch (e) {
    if (e instanceof AppError && e.code === "UserNotExists") {
      notFound();
    }
    throw e;
  }

  const comments = await getCommentsByUser(userId, viewerId);

  return (
    <UserDetailClient
      userId={userId}
      initialProfile={profile as UserProfile}
      initialComments={comments as Comment[]}
    />
  );
}
