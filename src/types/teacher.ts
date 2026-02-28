import type { Course } from "./course";

/** Teacher from /v1/teacher/:id */
export interface Teacher {
  id: number;
  name: string;
  institute: string;
  job: string;
  introduction: string;
  photo: string;
  courses: Course[];  // same shape as /v1/course/all items
}
