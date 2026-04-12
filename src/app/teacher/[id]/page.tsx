import { notFound } from "next/navigation";

import { getTeacherDetail } from "@/server/db/queries";
import { AppError } from "@/server/errors";
import TeacherDetailClient from "./TeacherDetailClient";
import type { Teacher } from "@/types";

interface TeacherDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { id } = await params;
  const teacherId = Number(id);

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
