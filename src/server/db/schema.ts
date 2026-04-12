import {
  pgTable,
  bigserial,
  text,
  bigint,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

// ---------- helpers ----------

// gorm.Model equivalent: id (bigserial), created_at, updated_at, deleted_at (soft delete)
// GORM uses bigint for IDs and "timestamp with time zone" for timestamps
function gormModel() {
  return {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  };
}

// Shorthand for bigint columns (GORM defaults to bigint for all int fields)
function bigintCol(name: string) {
  return bigint(name, { mode: "number" });
}

// ---------- users ----------

export const users = pgTable(
  "users",
  {
    ...gormModel(),
    email: text("email"),
    casdoorSub: text("casdoor_sub"),
    password: text("password"),
    nickName: text("nick_name"),
    realName: text("real_name"),
    year: bigintCol("year").default(0),
    grade: bigintCol("grade").default(0), // 0=Unknown 1=Undergraduate 2=Postgraduate 3=PhD
    isActive: boolean("is_active").default(false),
    avatar: text("avatar"),
    isAnonymous: boolean("is_anonymous").default(false),
    isAdmin: boolean("is_admin").default(false),
    isCommunityAdmin: boolean("is_community_admin").default(false),
    invitationCode: text("invitation_code"),
    invitedByUserId: bigintCol("invited_by_user_id").default(0),
    reward: bigintCol("reward").default(0),
    hasPostedComments: boolean("has_posted_comments").default(false),
  },
  (table) => [index("idx_users_email").on(table.email), index("idx_users_casdoor_sub").on(table.casdoorSub)],
);

// ---------- teachers ----------

export const teachers = pgTable("teachers", {
  ...gormModel(),
  eamsId: bigintCol("eams_id").default(0),
  uniId: bigintCol("uni_id").default(0),
  name: text("name"),
  institute: text("institute"),
  job: text("job"),
  introduction: text("introduction"),
  email: text("email"),
  photo: text("photo"),
});

// ---------- courses ----------

export const courses = pgTable("courses", {
  ...gormModel(),
  name: text("name"),
  institute: text("institute"),
  credit: bigintCol("credit").default(0),
  code: text("code"),
  scores: bigint("scores", { mode: "number" }).array(),
  commentCount: bigintCol("comment_count").default(0),
});

// ---------- course_groups ----------

export const courseGroups = pgTable(
  "course_groups",
  {
    ...gormModel(),
    code: text("code"),
    courseId: bigintCol("course_id"),
    scores: bigint("scores", { mode: "number" }).array(),
    commentCount: bigintCol("comment_count").default(0),
  },
  (table) => [index("idx_course_groups_course_id").on(table.courseId)],
);

// ---------- junction tables ----------

export const courseTeachers = pgTable("course_teachers", {
  courseId: bigintCol("course_id").notNull(),
  teacherId: bigintCol("teacher_id").notNull(),
});

export const coursegroupTeachers = pgTable("coursegroup_teachers", {
  courseGroupId: bigintCol("course_group_id").notNull(),
  teacherId: bigintCol("teacher_id").notNull(),
});

// ---------- comments ----------

export const comments = pgTable(
  "comments",
  {
    ...gormModel(),
    userId: bigintCol("user_id"),
    courseGroupId: bigintCol("course_group_id"),
    courseId: bigintCol("course_id"),
    semester: bigintCol("semester").default(0),
    scores: bigint("scores", { mode: "number" }).array(),
    title: text("title"),
    content: text("content"),
    studentScoreRanking: bigintCol("student_score_ranking").default(0),
    isAnonymous: boolean("is_anonymous").default(false),
    createTime: bigintCol("create_time").default(0),
    updateTime: bigintCol("update_time").default(0),
    like: bigintCol("like").default(0),
    dislike: bigintCol("dislike").default(0),
    isFold: boolean("is_fold").default(false),
    isCovered: boolean("is_covered").default(false),
    coverTitle: text("cover_title"),
    coverContent: text("cover_content"),
    coverReason: text("cover_reason"),
    reward: bigintCol("reward").default(0),
  },
  (table) => [
    index("idx_comments_user_id").on(table.userId),
    index("idx_comments_course_group_id").on(table.courseGroupId),
    index("idx_comments_course_id").on(table.courseId),
  ],
);

// ---------- comment_likes ----------

export const commentLikes = pgTable(
  "comment_likes",
  {
    ...gormModel(),
    userId: bigintCol("user_id"),
    commentId: bigintCol("comment_id"),
    isLike: boolean("is_like"),
  },
  (table) => [
    index("idx_comment_likes_user_id").on(table.userId),
    index("idx_comment_likes_comment_id").on(table.commentId),
    index("idx_comment_likes_is_like").on(table.isLike),
  ],
);

// ---------- replies ----------

export const replies = pgTable(
  "replies",
  {
    ...gormModel(),
    commentId: bigintCol("comment_id"),
    parentReplyId: bigintCol("parent_reply_id"), // nullable, self-referencing
    userId: bigintCol("user_id"),
    content: text("content"),
    isAnonymous: boolean("is_anonymous").default(false),
    like: bigintCol("like").default(0),
    dislike: bigintCol("dislike").default(0),
    createTime: bigintCol("create_time").default(0),
    updateTime: bigintCol("update_time").default(0),
    isFold: boolean("is_fold").default(false),
  },
  (table) => [
    index("idx_replies_comment_id").on(table.commentId),
    index("idx_replies_parent_reply_id").on(table.parentReplyId),
    index("idx_replies_user_id").on(table.userId),
  ],
);

// ---------- reply_likes ----------

export const replyLikes = pgTable(
  "reply_likes",
  {
    ...gormModel(),
    userId: bigintCol("user_id"),
    replyId: bigintCol("reply_id"),
    isLike: boolean("is_like"),
  },
  (table) => [
    index("idx_reply_likes_user_id").on(table.userId),
    index("idx_reply_likes_reply_id").on(table.replyId),
    index("idx_reply_likes_is_like").on(table.isLike),
  ],
);

// ---------- metadata ----------

export const metadata = pgTable("metadata", {
  ...gormModel(),
  dbVersion: bigintCol("db_version").default(0),
});
