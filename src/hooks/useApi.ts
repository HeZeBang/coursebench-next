import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import type {
  ApiResponse,
  Course,
  CourseDetail,
  Comment,
  Reply,
  ReplyListData,
  ReplyChainData,
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
    courseId ? `/v1/comment/course/${courseId}` : null,
  );
}

export function useCommentsByUser(userId: number | string) {
  return useSWR<ApiResponse<Comment[]>>(
    userId ? `/v1/comment/user/${userId}` : null,
  );
}

export function useRecentComments() {
  return useSWR<ApiResponse<Comment[]>>("/v1/comment/recent");
}

interface RecentCommentsPage {
  page_count: number;
  has_more: boolean;
  comments: Comment[];
}

export function useRecentCommentsInfinite() {
  const result = useSWRInfinite<ApiResponse<RecentCommentsPage>>(
    (pageIndex, previousPageData) => {
      if (pageIndex === 0) return `/v1/comment/recent/1`;
      if (previousPageData && !previousPageData.data?.has_more) return null;
      return `/v1/comment/recent/${pageIndex + 1}`;
    },
    { revalidateFirstPage: false },
  );

  const comments = result.data?.flatMap((page) => page.data?.comments ?? []) ?? [];
  const isLoadingMore = result.isLoading || (result.size > 0 && result.data && typeof result.data[result.size - 1] === "undefined");
  const hasMore = result.data ? (result.data[result.data.length - 1]?.data?.has_more ?? false) : true;

  return {
    ...result,
    comments,
    isLoadingMore: !!isLoadingMore,
    hasMore,
    loadMore: () => result.setSize(result.size + 1),
  };
}

export function useReplies(
  commentId: number | string | null,
  sort = "latest",
  showAll = false,
) {
  return useSWR<ApiResponse<ReplyListData>>(
    commentId
      ? `/v1/comment/${commentId}/replies?sort=${sort}&all=${showAll ? 1 : 0}`
      : null,
  );
}

export function useReplyChain(replyId: number | string | null) {
  return useSWR<ApiResponse<ReplyChainData>>(
    replyId ? `/v1/reply/${replyId}/chain` : null,
  );
}

// ── Teacher hooks ──

export function useTeacher(id: number | string) {
  return useSWR<ApiResponse<Teacher>>(id ? `/v1/teacher/${id}` : null);
}

// ── User hooks ──

export function useUserProfile(id: number | string) {
  return useSWR<ApiResponse<UserProfile>>(id ? `/v1/user/profile/${id}` : null);
}

// ── Reward hooks ──

export function useRanklist() {
  return useSWR<ApiResponse<RanklistEntry[]>>("/v1/reward/ranklist");
}
