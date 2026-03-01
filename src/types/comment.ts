/** User object embedded in a comment (null when anonymous and not own) */
export interface CommentUser {
  id: number;
  email: string;
  year: number;
  grade: number;
  nickname: string;
  realname: string;
  avatar: string;
  is_anonymous: boolean;
  is_admin: boolean;
  is_community_admin: boolean;
  invitation_code: string;
  reward: number;
  has_casdoor_bound: boolean;
}

/** Course reference inside a comment */
export interface CommentCourse {
  id: number;
  name: string;
  code: string;
  institute: string;
}

/** Group reference inside a comment */
export interface CommentGroup {
  id: number;
  code: string;
  teachers: { id: number; name: string }[];
}

/** Comment from /v1/comment/* endpoints */
export interface Comment {
  id: number;
  title: string;
  content: string;
  post_time: number;
  update_time: number;
  semester: number;
  is_anonymous: boolean;
  like: number;
  dislike: number;
  like_status: number; // 0=none, 1=liked, 2=disliked
  score: number[]; // [quality, workload, difficulty, distribution] raw
  user: CommentUser | null;
  course: CommentCourse;
  group: CommentGroup;
  is_fold: boolean;
  is_covered: boolean;
  cover_title: string;
  cover_content: string;
  cover_reason: string;
  reward: number;
}

export interface Reply {
  id: number;
  comment_id: number;
  user_id: number;
  user_nickname: string;
  user_is_anonymous: boolean;
  content: string;
  like_count: number;
  created_at: number;
  updated_at: number;
  is_liked: boolean;
  parent_id: number;
  replies?: Reply[];
}
