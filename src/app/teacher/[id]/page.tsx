import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connection } from "next/server";

import { getTeacherDetail } from "@/server/db/queries";
import { AppError } from "@/server/errors";
import TeacherDetailClient from "./TeacherDetailClient";
import type { Teacher } from "@/types";

interface TeacherDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TeacherDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  await connection();
  try {
    const teacher = await getTeacherDetail(Number(id));
    return {
      title: `${teacher.name} - CourseBench`,
      description: `${teacher.institute} ${teacher.job} | ${teacher.courses.length} 门课程`,
    };
  } catch {
    return { title: "教师不存在 - CourseBench" };
  }
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { id } = await params;
  const teacherId = Number(id);
  await connection();

  let teacher;
  try {
    teacher = await getTeacherDetail(teacherId);
  } catch (e) {
    if (e instanceof AppError && e.code === "TeacherNotExists") {
      notFound();
    }
    throw e;
  }

  return (
    <TeacherDetailClient
      teacherId={teacherId}
      initialTeacher={teacher as Teacher}
    />
  );
}
