import { revalidateTag, unstable_cache } from "next/cache";

export const PUBLIC_CACHE_SECONDS = 60 * 60;
export const PUBLIC_API_CACHE_CONTROL = `public, s-maxage=60, stale-while-revalidate=${PUBLIC_CACHE_SECONDS - 60}`;

export const cacheTags = {
  courses: "courses",
  course: (courseId: number) => `course:${courseId}`,
  teachers: "teachers",
  teacher: (teacherId: number) => `teacher:${teacherId}`,
  ranklist: "ranklist",
  recentComments: "comments:recent",
  courseComments: (courseId: number) => `comments:course:${courseId}`,
};

export function cachePublic<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyParts: string[],
  tags: string[],
): T {
  return unstable_cache(fn, keyParts, {
    revalidate: PUBLIC_CACHE_SECONDS,
    tags,
  }) as unknown as T;
}

export function revalidatePublicTag(tag: string) {
  revalidateTag(tag, "max");
}

export function revalidateCoursePublicData(courseId: number) {
  revalidatePublicTag(cacheTags.courses);
  revalidatePublicTag(cacheTags.course(courseId));
  revalidatePublicTag(cacheTags.courseComments(courseId));
  revalidatePublicTag(cacheTags.recentComments);
}

export function revalidateRanklistPublicData() {
  revalidatePublicTag(cacheTags.ranklist);
}
