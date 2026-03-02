import { UserProfile } from "./user";

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

/** User attached to a reply */
export type ReplyUser = UserProfile;

/** The "reply_to" target (parent reply info) */
export interface ReplyTarget {
  reply_id: number;
  user: ReplyUser | null;
}

/** A single reply from the backend */
export interface Reply {
  id: number;
  comment_id: number;
  parent_reply_id: number | null;
  content: string;
  post_time: number;
  update_time: number;
  like: number;
  dislike: number;
  like_status: number; // 0=none, 1=liked, 2=disliked
  is_anonymous: boolean;
  has_sub_replies: boolean;
  user: ReplyUser | null;
  reply_to: ReplyTarget | null;
}

/** Tree node used in reply chain descendants */
export interface ReplyTreeNode {
  reply: Reply;
  children: ReplyTreeNode[];
}

/** Response from GET /comment/:id/replies */
export interface ReplyListData {
  total_count: number;
  filtered_count: number;
  replies: Reply[];
}

/** Response from GET /reply/:id/chain */
export interface ReplyChainData {
  ancestors: Reply[];
  current: Reply;
  descendants: ReplyTreeNode[];
}
