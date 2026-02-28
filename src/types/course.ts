/** Teacher reference inside a CourseGroup */
export interface GroupTeacher {
  id: number;
  name: string;
}

/** Course group (teacher-section) from /v1/course/:id */
export interface CourseGroup {
  id: number;
  code: string;
  score: number[];       // [quality, workload, difficulty, distribution]
  comment_num: number;
  teachers: GroupTeacher[];
}

/** Course item from /v1/course/all and teacher courses */
export interface Course {
  id: number;
  name: string;
  code: string;
  institute: string;
  credit: number;
  score: number[];       // [quality, workload, difficulty, distribution] — averaged
  comment_num: number;
}

/** Course detail from /v1/course/:id */
export interface CourseDetail extends Course {
  groups: CourseGroup[];
}
