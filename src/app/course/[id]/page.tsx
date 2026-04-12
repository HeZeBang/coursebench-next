import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCommentsByCourse, getCourseDetail } from "@/server/db/queries";
import { getUserId } from "@/server/auth/session";
import { AppError } from "@/server/errors";
import CourseDetailClient from "./CourseDetailClient";
import type { Comment, CourseDetail } from "@/types";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  // Call getUserId() to match the page body's dynamic signal
  await getUserId();
  try {
    const course = await getCourseDetail(Number(id));
    const avgScore = course.score.length > 0
      ? (course.score.reduce((a: number, b: number) => a + b, 0) / course.score.length).toFixed(1)
      : "暂无";
    return {
      title: `${course.name} - CourseBench`,
      description: `${course.institute} | ${course.code} | 综合评分 ${avgScore} | ${course.comment_num} 条评价`,
    };
  } catch {
    return { title: "课程不存在 - CourseBench" };
  }
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
