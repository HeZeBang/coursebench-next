import { connection } from "next/server";
import { getAllCourses } from "@/server/db/queries";
import HomeClient from "./HomeClient";
import type { Course } from "@/types";

export default async function HomePage() {
  await connection();
  const courses = await getAllCourses();
  return <HomeClient initialCourses={courses as Course[]} />;
}
