import { notFound } from "next/navigation";

import { getCommentsByCourse, getCourseDetail } from "@/server/db/queries";
import { getUserId } from "@/server/auth/session";
import { AppError } from "@/server/errors";
import CourseDetailClient from "./CourseDetailClient";
import type { Comment, CourseDetail } from "@/types";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;
  const courseId = Number(id);

  const viewerId = (await getUserId()) ?? 0;

  let course;
  try {
    course = await getCourseDetail(courseId);
  } catch (e) {
    if (e instanceof AppError && e.code === "CourseNotExists") {
      notFound();
    }
    throw e;
  }

  const comments = await getCommentsByCourse(courseId, viewerId);

  return (
    <CourseDetailClient
      courseId={courseId}
      initialCourse={course as CourseDetail}
      initialComments={comments as Comment[]}
    />
  );
}
