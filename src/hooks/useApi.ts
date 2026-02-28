import useSWR from "swr";
import type {
  ApiResponse,
  Course,
  CourseDetail,
  Comment,
  Reply,
  Teacher,
  UserProfile,
} from "@/types";

/** Ranklist entry from /v1/reward/ranklist */
export interface RanklistEntry {
  nick_name: string;
  reward: number;
  is_anonymous: boolean;
}

// ── Course hooks ──

export function useCourses() {
  return useSWR<ApiResponse<Course[]>>("/v1/course/all");
}

export function useCourse(id: number | string) {
  return useSWR<ApiResponse<CourseDetail>>(id ? `/v1/course/${id}` : null);
}

// ── Comment hooks ──

export function useCommentsByCourse(courseId: number | string) {
  return useSWR<ApiResponse<Comment[]>>(
    courseId ? `/v1/comment/course/${courseId}` : null
  );
}

export function useCommentsByUser(userId: number | string) {
  return useSWR<ApiResponse<Comment[]>>(
    userId ? `/v1/comment/user/${userId}` : null
  );
}

export function useRecentComments() {
  return useSWR<ApiResponse<Comment[]>>("/v1/comment/recent");
}

export function useReplies(commentId: number | string) {
  return useSWR<ApiResponse<Reply[]>>(
    commentId ? `/v1/reply/${commentId}/chain` : null
  );
}

// ── Teacher hooks ──

export function useTeacher(id: number | string) {
  return useSWR<ApiResponse<Teacher>>(id ? `/v1/teacher/${id}` : null);
}

// ── User hooks ──

export function useUserProfile(id: number | string) {
  return useSWR<ApiResponse<UserProfile>>(
    id ? `/v1/user/profile/${id}` : null
  );
}

// ── Reward hooks ──

export function useRanklist() {
  return useSWR<ApiResponse<RanklistEntry[]>>("/v1/reward/ranklist");
}
