/**
 * Shared query helpers used across multiple route handlers.
 * Ported from backend/pkg/queries/
 */
import { db } from "./index";
import { eq, and, isNull, desc, sql, inArray } from "drizzle-orm";
import {
  users,
  courses,
  courseGroups,
  teachers,
  comments,
  commentLikes,
  replies,
  replyLikes,
  courseTeachers,
  coursegroupTeachers,
} from "./schema";
import * as errors from "../errors";
import { resolveAvatarUrl } from "../storage/blob";
import { cachePublic, cacheTags } from "../cache";

const SCORE_LENGTH = 4;

// ---------- score helpers ----------

/**
 * Compute average scores from the stored score sums and comment count.
 * In the database, `scores` is the cumulative sum of all comment scores,
 * and `commentCount` is the number of comments. Average = sum / count.
 */
export function computeAverageScores(scores: number[] | null, commentCount: number): number[] {
  const avg = new Array(SCORE_LENGTH).fill(0);
  if (!scores || scores.length !== SCORE_LENGTH || commentCount === 0) return avg;
  for (let i = 0; i < SCORE_LENGTH; i++) {
    avg[i] = scores[i] / commentCount;
  }
  return avg;
}

// ---------- user helpers ----------

export async function getUserById(id: number) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)));
  if (!user) throw errors.UserNotExists();
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)));
  if (!user) throw errors.UserNotExists();
  return user;
}

export async function getUserByCasdoorSub(casdoorSub: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.casdoorSub, casdoorSub), isNull(users.deletedAt)));
  if (!user) throw errors.UserNotExists();
  return user;
}

export async function getUserByInvitationCode(code: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.invitationCode, code), isNull(users.deletedAt)));
  if (!user) throw errors.UserNotExists();
  return user;
}

// ---------- profile response ----------

export interface ProfileResponse {
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

export async function buildProfileResponse(
  queriedUserId: number,
  queryingUserId: number,
): Promise<ProfileResponse> {
  const user = await getUserById(queriedUserId);
  const isSelf = queryingUserId === queriedUserId;

  let displayReward = isSelf;
  if (queryingUserId !== 0 && !isSelf) {
    try {
      const queryingUser = await getUserById(queryingUserId);
      if (queryingUser.isAdmin || queryingUser.isCommunityAdmin) {
        displayReward = true;
      }
    } catch {
      // not logged in, ignore
    }
  }

  const r: ProfileResponse = {
    id: user.id,
    email: "",
    year: 0,
    grade: 0,
    nickname: user.nickName || "",
    realname: "",
    avatar: resolveAvatarUrl(user.avatar),
    is_anonymous: user.isAnonymous ?? false,
    is_admin: user.isAdmin ?? false,
    is_community_admin: user.isCommunityAdmin ?? false,
    invitation_code: "",
    reward: -1,
    has_casdoor_bound: false,
  };

  if (!user.isAnonymous || isSelf) {
    r.email = user.email || "";
    r.year = user.year ?? 0;
    r.grade = user.grade ?? 0;
    r.realname = user.realName || "";
  }

  if (isSelf) {
    r.invitation_code = user.invitationCode || "";
    r.has_casdoor_bound = !!user.casdoorSub;
  }

  if (displayReward) {
    r.reward = user.reward ?? 0;
  }

  return r;
}

// ---------- course helpers ----------

export interface CourseListItem {
  id: number;
  name: string;
  institute: string;
  code: string;
  score: number[];
  credit: number;
  comment_num: number;
}

async function getAllCoursesRaw(): Promise<CourseListItem[]> {
  const rows = await db
    .select()
    .from(courses)
    .where(isNull(courses.deletedAt));

  return rows.map((c) => ({
    id: c.id,
    name: c.name || "",
    institute: c.institute || "",
    code: c.code || "",
    score: computeAverageScores(c.scores, c.commentCount ?? 0),
    credit: c.credit ?? 0,
    comment_num: c.commentCount ?? 0,
  }));
}

export const getAllCourses = cachePublic(getAllCoursesRaw, ["courses:all"], [
  cacheTags.courses,
]);

async function getCourseDetailRaw(courseId: number) {
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, courseId), isNull(courses.deletedAt)));
  if (!course) throw errors.CourseNotExists();

  const groups = await db
    .select()
    .from(courseGroups)
    .where(and(eq(courseGroups.courseId, courseId), isNull(courseGroups.deletedAt)));

  const groupIds = groups.map((g) => g.id);

  // Get teachers for each group
  const groupTeacherRows =
    groupIds.length > 0
      ? await db
          .select()
          .from(coursegroupTeachers)
          .where(inArray(coursegroupTeachers.courseGroupId, groupIds))
      : [];

  const teacherIds = [...new Set(groupTeacherRows.map((r) => r.teacherId))];
  const teacherRows =
    teacherIds.length > 0
      ? await db
          .select({ id: teachers.id, name: teachers.name })
          .from(teachers)
          .where(and(inArray(teachers.id, teacherIds), isNull(teachers.deletedAt)))
      : [];

  const teacherMap = new Map(teacherRows.map((t) => [t.id, t]));

  const groupsData = groups.map((g) => {
    const gTeacherIds = groupTeacherRows.filter((r) => r.courseGroupId === g.id).map((r) => r.teacherId);
    return {
      id: g.id,
      code: g.code || "",
      score: computeAverageScores(g.scores, g.commentCount ?? 0),
      comment_num: g.commentCount ?? 0,
      teachers: gTeacherIds
        .map((tid) => teacherMap.get(tid))
        .filter(Boolean)
        .map((t) => ({ name: t!.name || "", id: t!.id })),
    };
  });

  return {
    name: course.name || "",
    code: course.code || "",
    id: course.id,
    institute: course.institute || "",
    credit: course.credit ?? 0,
    score: computeAverageScores(course.scores, course.commentCount ?? 0),
    comment_num: course.commentCount ?? 0,
    groups: groupsData,
  };
}

export async function getCourseDetail(courseId: number) {
  return cachePublic(
    () => getCourseDetailRaw(courseId),
    ["course:detail", String(courseId)],
    [cacheTags.courses, cacheTags.course(courseId)],
  )();
}

// ---------- teacher helpers ----------

async function getAllTeachersRaw() {
  const rows = await db.select().from(teachers).where(isNull(teachers.deletedAt));
  return rows.map((t) => ({
    id: t.id,
    name: t.name || "",
    institute: t.institute || "",
    photo: t.photo || "",
    job: t.job || "",
    introduction: t.introduction || "",
  }));
}

export const getAllTeachers = cachePublic(getAllTeachersRaw, ["teachers:all"], [
  cacheTags.teachers,
]);

async function getTeacherDetailRaw(teacherId: number) {
  const [teacher] = await db
    .select()
    .from(teachers)
    .where(and(eq(teachers.id, teacherId), isNull(teachers.deletedAt)));
  if (!teacher) throw errors.TeacherNotExists();

  // Get courses taught by this teacher
  const ctRows = await db.select().from(courseTeachers).where(eq(courseTeachers.teacherId, teacherId));
  const courseIds = ctRows.map((r) => r.courseId);

  let teacherCourses: CourseListItem[] = [];
  if (courseIds.length > 0) {
    const courseRows = await db
      .select()
      .from(courses)
      .where(and(inArray(courses.id, courseIds), isNull(courses.deletedAt)));
    teacherCourses = courseRows.map((c) => ({
      id: c.id,
      name: c.name || "",
      institute: c.institute || "",
      code: c.code || "",
      score: computeAverageScores(c.scores, c.commentCount ?? 0),
      credit: c.credit ?? 0,
      comment_num: c.commentCount ?? 0,
    }));
  }

  return {
    id: teacher.id,
    name: teacher.name || "",
    institute: teacher.institute || "",
    job: teacher.job || "",
    introduction: teacher.introduction || "",
    photo: teacher.photo || "",
    courses: teacherCourses,
  };
}

export async function getTeacherDetail(teacherId: number) {
  return cachePublic(
    () => getTeacherDetailRaw(teacherId),
    ["teacher:detail", String(teacherId)],
    [cacheTags.teachers, cacheTags.teacher(teacherId)],
  )();
}

// ---------- comment helpers ----------

interface UserBrief {
  id: number;
  nickname: string;
  avatar: string;
  is_anonymous: boolean;
  is_admin: boolean;
  is_community_admin: boolean;
  email: string;
  year: number;
  grade: number;
  realname: string;
  reward: number;
  invitation_code: string;
  has_casdoor_bound: boolean;
}

function buildUserBrief(user: typeof users.$inferSelect, viewerId: number): UserBrief {
  const isSelf = viewerId === user.id;
  const brief: UserBrief = {
    id: user.id,
    nickname: user.nickName || "",
    avatar: resolveAvatarUrl(user.avatar),
    is_anonymous: user.isAnonymous ?? false,
    is_admin: user.isAdmin ?? false,
    is_community_admin: user.isCommunityAdmin ?? false,
    email: "",
    year: 0,
    grade: 0,
    realname: "",
    reward: -1,
    invitation_code: "",
    has_casdoor_bound: false,
  };
  if (!user.isAnonymous || isSelf) {
    brief.email = user.email || "";
    brief.year = user.year ?? 0;
    brief.grade = user.grade ?? 0;
    brief.realname = user.realName || "";
    brief.invitation_code = user.invitationCode || "";
    brief.has_casdoor_bound = !!user.casdoorSub;
  }
  return brief;
}

export async function buildCommentResponse(
  comment: typeof comments.$inferSelect,
  viewerId: number,
) {
  // Anonymous handling: if comment is anonymous and viewer is not the author, user = null
  const isAnonymous = comment.isAnonymous ?? false;
  const isSelf = viewerId !== 0 && viewerId === comment.userId;
  let userBrief: UserBrief | null = null;
  if (!isAnonymous || isSelf) {
    const [user] = await db.select().from(users).where(eq(users.id, comment.userId!));
    userBrief = user ? buildUserBrief(user, viewerId) : null;
  }

  // Get course
  const [course] = await db
    .select({ id: courses.id, name: courses.name, code: courses.code, institute: courses.institute })
    .from(courses)
    .where(eq(courses.id, comment.courseId!));

  // Get course group + teachers
  const [group] = await db.select().from(courseGroups).where(eq(courseGroups.id, comment.courseGroupId!));
  let groupTeachers: { id: number; name: string }[] = [];
  if (group) {
    const gtRows = await db
      .select()
      .from(coursegroupTeachers)
      .where(eq(coursegroupTeachers.courseGroupId, group.id));
    const tIds = gtRows.map((r) => r.teacherId);
    if (tIds.length > 0) {
      const tRows = await db
        .select({ id: teachers.id, name: teachers.name })
        .from(teachers)
        .where(inArray(teachers.id, tIds));
      groupTeachers = tRows.map((t) => ({ id: t.id, name: t.name || "" }));
    }
  }

  // Get like status for viewer
  let likeStatus = 0;
  if (viewerId) {
    const [like] = await db
      .select()
      .from(commentLikes)
      .where(
        and(
          eq(commentLikes.userId, viewerId),
          eq(commentLikes.commentId, comment.id),
          isNull(commentLikes.deletedAt),
        ),
      );
    if (like) {
      likeStatus = like.isLike ? 1 : 2;
    }
  }

  return {
    id: comment.id,
    title: comment.title || "",
    content: comment.content || "",
    post_time: comment.createTime ?? 0,
    update_time: comment.updateTime ?? 0,
    semester: comment.semester ?? 0,
    is_anonymous: comment.isAnonymous ?? false,
    like: comment.like ?? 0,
    dislike: comment.dislike ?? 0,
    like_status: likeStatus,
    score: comment.scores || [],
    user: userBrief,
    course: course
      ? { id: course.id, name: course.name || "", code: course.code || "", institute: course.institute || "" }
      : null,
    group: group
      ? {
          id: group.id,
          code: group.code || "",
          teachers: groupTeachers,
        }
      : null,
    is_fold: comment.isFold ?? false,
    is_covered: comment.isCovered ?? false,
    cover_title: comment.coverTitle || "",
    cover_content: comment.coverContent || "",
    cover_reason: comment.coverReason || "",
    reward: comment.reward ?? 0,
  };
}

/**
 * Batched version of buildCommentResponse for lists.
 * Avoids the 4–5 sequential queries per comment that buildCommentResponse does
 * by fetching users/courses/groups/group-teachers/likes in bulk and assembling
 * in JS. Output shape matches buildCommentResponse exactly.
 */
export async function buildCommentResponsesBatch(
  rows: (typeof comments.$inferSelect)[],
  viewerId: number,
) {
  if (rows.length === 0) return [];

  const userIdSet = new Set<number>();
  const courseIdSet = new Set<number>();
  const groupIdSet = new Set<number>();
  const commentIds: number[] = [];

  for (const c of rows) {
    const isAnonymous = c.isAnonymous ?? false;
    const isSelf = viewerId !== 0 && viewerId === c.userId;
    if (c.userId != null && (!isAnonymous || isSelf)) userIdSet.add(c.userId);
    if (c.courseId != null) courseIdSet.add(c.courseId);
    if (c.courseGroupId != null) groupIdSet.add(c.courseGroupId);
    commentIds.push(c.id);
  }

  const userIds = [...userIdSet];
  const courseIds = [...courseIdSet];
  const groupIds = [...groupIdSet];

  const [userRows, courseRows, groupRows, gtRows, likeRows] = await Promise.all([
    userIds.length
      ? db.select().from(users).where(inArray(users.id, userIds))
      : Promise.resolve([] as (typeof users.$inferSelect)[]),
    courseIds.length
      ? db
          .select({
            id: courses.id,
            name: courses.name,
            code: courses.code,
            institute: courses.institute,
          })
          .from(courses)
          .where(inArray(courses.id, courseIds))
      : Promise.resolve([] as { id: number; name: string | null; code: string | null; institute: string | null }[]),
    groupIds.length
      ? db.select().from(courseGroups).where(inArray(courseGroups.id, groupIds))
      : Promise.resolve([] as (typeof courseGroups.$inferSelect)[]),
    groupIds.length
      ? db
          .select()
          .from(coursegroupTeachers)
          .where(inArray(coursegroupTeachers.courseGroupId, groupIds))
      : Promise.resolve([] as (typeof coursegroupTeachers.$inferSelect)[]),
    viewerId && commentIds.length
      ? db
          .select()
          .from(commentLikes)
          .where(
            and(
              eq(commentLikes.userId, viewerId),
              inArray(commentLikes.commentId, commentIds),
              isNull(commentLikes.deletedAt),
            ),
          )
      : Promise.resolve([] as (typeof commentLikes.$inferSelect)[]),
  ]);

  const teacherIdSet = new Set<number>();
  for (const r of gtRows) teacherIdSet.add(r.teacherId);
  const teacherIds = [...teacherIdSet];
  const teacherRows = teacherIds.length
    ? await db
        .select({ id: teachers.id, name: teachers.name })
        .from(teachers)
        .where(inArray(teachers.id, teacherIds))
    : [];

  const userMap = new Map(userRows.map((u) => [u.id, u]));
  const courseMap = new Map(courseRows.map((c) => [c.id, c]));
  const groupMap = new Map(groupRows.map((g) => [g.id, g]));
  const teacherMap = new Map(teacherRows.map((t) => [t.id, t]));
  const groupTeacherMap = new Map<number, { id: number; name: string }[]>();
  for (const r of gtRows) {
    const t = teacherMap.get(r.teacherId);
    if (!t) continue;
    const arr = groupTeacherMap.get(r.courseGroupId) ?? [];
    arr.push({ id: t.id, name: t.name || "" });
    groupTeacherMap.set(r.courseGroupId, arr);
  }
  const likeMap = new Map<number, boolean>();
  for (const l of likeRows) likeMap.set(l.commentId!, l.isLike ?? false);

  return rows.map((comment) => {
    const isAnonymous = comment.isAnonymous ?? false;
    const isSelf = viewerId !== 0 && viewerId === comment.userId;
    let userBrief: UserBrief | null = null;
    if (!isAnonymous || isSelf) {
      const user = comment.userId != null ? userMap.get(comment.userId) : undefined;
      userBrief = user ? buildUserBrief(user, viewerId) : null;
    }
    const course = comment.courseId != null ? courseMap.get(comment.courseId) : undefined;
    const group = comment.courseGroupId != null ? groupMap.get(comment.courseGroupId) : undefined;
    const groupTeachers = group ? groupTeacherMap.get(group.id) ?? [] : [];

    let likeStatus = 0;
    if (viewerId && likeMap.has(comment.id)) {
      likeStatus = likeMap.get(comment.id) ? 1 : 2;
    }

    return {
      id: comment.id,
      title: comment.title || "",
      content: comment.content || "",
      post_time: comment.createTime ?? 0,
      update_time: comment.updateTime ?? 0,
      semester: comment.semester ?? 0,
      is_anonymous: comment.isAnonymous ?? false,
      like: comment.like ?? 0,
      dislike: comment.dislike ?? 0,
      like_status: likeStatus,
      score: comment.scores || [],
      user: userBrief,
      course: course
        ? {
            id: course.id,
            name: course.name || "",
            code: course.code || "",
            institute: course.institute || "",
          }
        : null,
      group: group
        ? {
            id: group.id,
            code: group.code || "",
            teachers: groupTeachers,
          }
        : null,
      is_fold: comment.isFold ?? false,
      is_covered: comment.isCovered ?? false,
      cover_title: comment.coverTitle || "",
      cover_content: comment.coverContent || "",
      cover_reason: comment.coverReason || "",
      reward: comment.reward ?? 0,
    };
  });
}

async function getCommentsByCourseRaw(courseId: number, viewerId: number) {
  const rows = await db
    .select()
    .from(comments)
    .where(and(eq(comments.courseId, courseId), isNull(comments.deletedAt)))
    .orderBy(desc(comments.updateTime));

  return buildCommentResponsesBatch(rows, viewerId);
}

export async function getCommentsByCourse(courseId: number, viewerId: number) {
  if (viewerId !== 0) {
    return getCommentsByCourseRaw(courseId, viewerId);
  }

  return cachePublic(
    () => getCommentsByCourseRaw(courseId, 0),
    ["comments:course", String(courseId), "anonymous"],
    [cacheTags.courseComments(courseId)],
  )();
}

export async function getCommentsByCourseGroup(groupId: number, viewerId: number) {
  const rows = await db
    .select()
    .from(comments)
    .where(and(eq(comments.courseGroupId, groupId), isNull(comments.deletedAt)))
    .orderBy(desc(comments.updateTime));

  return buildCommentResponsesBatch(rows, viewerId);
}

export async function getCommentsByUser(userId: number, viewerId: number) {
  const rows = await db
    .select()
    .from(comments)
    .where(and(eq(comments.userId, userId), isNull(comments.deletedAt)))
    .orderBy(desc(comments.updateTime));

  // showAnonymous=false: when viewing another user's comments, skip anonymous ones
  const filtered = rows.filter((c) => {
    if (c.isAnonymous && c.userId !== viewerId) return false;
    return true;
  });

  return buildCommentResponsesBatch(filtered, viewerId);
}

async function getRecentCommentsRaw(viewerId: number, limit = 100) {
  const rows = await db
    .select()
    .from(comments)
    .where(isNull(comments.deletedAt))
    .orderBy(desc(comments.updateTime))
    .limit(limit);

  return buildCommentResponsesBatch(rows, viewerId);
}

export async function getRecentComments(viewerId: number, limit = 100) {
  if (viewerId !== 0) {
    return getRecentCommentsRaw(viewerId, limit);
  }

  return cachePublic(
    () => getRecentCommentsRaw(0, limit),
    ["comments:recent", String(limit), "anonymous"],
    [cacheTags.recentComments],
  )();
}

async function getRecentCommentsPaginatedRaw(viewerId: number, page: number) {
  const pageSize = 30;
  const offset = (page - 1) * pageSize;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(isNull(comments.deletedAt));

  const total = Number(countResult?.count ?? 0);
  const pageCount = Math.ceil(total / pageSize);

  const rows = await db
    .select()
    .from(comments)
    .where(isNull(comments.deletedAt))
    .orderBy(desc(comments.updateTime))
    .limit(pageSize)
    .offset(offset);

  const commentData = await buildCommentResponsesBatch(rows, viewerId);

  return {
    page_count: pageCount,
    has_more: page < pageCount,
    comments: commentData,
  };
}

export async function getRecentCommentsPaginated(viewerId: number, page: number) {
  if (viewerId !== 0) {
    return getRecentCommentsPaginatedRaw(viewerId, page);
  }

  return cachePublic(
    () => getRecentCommentsPaginatedRaw(0, page),
    ["comments:recent:page", String(page), "anonymous"],
    [cacheTags.recentComments],
  )();
}

// ---------- reply helpers ----------

interface ReplyUserBrief {
  id: number;
  nickname: string;
  avatar: string;
  is_anonymous: boolean;
}

/**
 * Build reply user brief. `replyIsAnonymous` is the reply's anonymous flag,
 * NOT the user's profile anonymous setting. This matches the Go backend's
 * buildReplyUserResponse which passes the reply's isAnonymous directly.
 */
function buildReplyUserBrief(user: typeof users.$inferSelect, replyIsAnonymous: boolean): ReplyUserBrief {
  return {
    id: user.id,
    nickname: user.nickName || "",
    avatar: resolveAvatarUrl(user.avatar),
    is_anonymous: replyIsAnonymous,
  };
}

export async function buildReplyResponse(reply: typeof replies.$inferSelect, viewerId: number) {
  // Anonymous handling: if reply is anonymous and viewer is not the author, user = null
  const isAnonymous = reply.isAnonymous ?? false;
  const isSelf = viewerId !== 0 && viewerId === reply.userId;
  let replyUser: ReplyUserBrief | null = null;
  if (!isAnonymous || isSelf) {
    const [user] = await db.select().from(users).where(eq(users.id, reply.userId!));
    replyUser = user ? buildReplyUserBrief(user, isAnonymous) : null;
  }

  let likeStatus = 0;
  if (viewerId) {
    const [like] = await db
      .select()
      .from(replyLikes)
      .where(
        and(
          eq(replyLikes.userId, viewerId),
          eq(replyLikes.replyId, reply.id),
          isNull(replyLikes.deletedAt),
        ),
      );
    if (like) likeStatus = like.isLike ? 1 : 2;
  }

  // Check if has sub-replies
  const [subCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(replies)
    .where(and(eq(replies.parentReplyId, reply.id), isNull(replies.deletedAt)));

  let replyTo = null;
  if (reply.parentReplyId) {
    const [parentReply] = await db.select().from(replies).where(eq(replies.id, reply.parentReplyId));
    if (parentReply) {
      const parentAnonymous = parentReply.isAnonymous ?? false;
      const parentIsSelf = viewerId !== 0 && viewerId === parentReply.userId;
      let parentUserBrief: ReplyUserBrief | null = null;
      if (!parentAnonymous || parentIsSelf) {
        const [parentUser] = await db.select().from(users).where(eq(users.id, parentReply.userId!));
        parentUserBrief = parentUser ? buildReplyUserBrief(parentUser, parentAnonymous) : null;
      }
      replyTo = {
        reply_id: parentReply.id,
        user: parentUserBrief,
      };
    }
  }

  return {
    id: reply.id,
    comment_id: reply.commentId,
    parent_reply_id: reply.parentReplyId ?? null,
    content: reply.content || "",
    post_time: reply.createTime ?? 0,
    update_time: reply.updateTime ?? 0,
    like: reply.like ?? 0,
    dislike: reply.dislike ?? 0,
    like_status: likeStatus,
    is_anonymous: isAnonymous,
    has_sub_replies: Number(subCount?.count ?? 0) > 0,
    user: replyUser,
    reply_to: replyTo,
    is_fold: reply.isFold ?? false,
  };
}

// ---------- ranklist helpers ----------

async function getRanklistRaw() {
  const rows = await db
    .select({
      nickName: users.nickName,
      reward: users.reward,
      isAnonymous: users.isAnonymous,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.reward))
    .limit(30);

  return rows.map((r) => ({
    nick_name: r.isAnonymous ? "" : (r.nickName || ""),
    reward: r.reward ?? 0,
    is_anonymous: r.isAnonymous ?? false,
  }));
}

export const getRanklist = cachePublic(getRanklistRaw, ["ranklist"], [
  cacheTags.ranklist,
]);
