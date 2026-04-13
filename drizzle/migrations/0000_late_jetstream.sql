CREATE TABLE "comment_likes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" bigint,
	"comment_id" bigint,
	"is_like" boolean
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" bigint,
	"course_group_id" bigint,
	"course_id" bigint,
	"semester" bigint DEFAULT 0,
	"scores" bigint[],
	"title" text,
	"content" text,
	"student_score_ranking" bigint DEFAULT 0,
	"is_anonymous" boolean DEFAULT false,
	"create_time" bigint DEFAULT 0,
	"update_time" bigint DEFAULT 0,
	"like" bigint DEFAULT 0,
	"dislike" bigint DEFAULT 0,
	"is_fold" boolean DEFAULT false,
	"is_covered" boolean DEFAULT false,
	"cover_title" text,
	"cover_content" text,
	"cover_reason" text,
	"reward" bigint DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "course_groups" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"code" text,
	"course_id" bigint,
	"scores" bigint[],
	"comment_count" bigint DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "course_teachers" (
	"course_id" bigint NOT NULL,
	"teacher_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coursegroup_teachers" (
	"course_group_id" bigint NOT NULL,
	"teacher_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text,
	"institute" text,
	"credit" bigint DEFAULT 0,
	"code" text,
	"scores" bigint[],
	"comment_count" bigint DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "feature_feedback" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" bigint NOT NULL,
	"feature_key" text NOT NULL,
	"rating" bigint NOT NULL,
	"comment" text
);
--> statement-breakpoint
CREATE TABLE "metadata" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"db_version" bigint DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "replies" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"comment_id" bigint,
	"parent_reply_id" bigint,
	"user_id" bigint,
	"content" text,
	"is_anonymous" boolean DEFAULT false,
	"like" bigint DEFAULT 0,
	"dislike" bigint DEFAULT 0,
	"create_time" bigint DEFAULT 0,
	"update_time" bigint DEFAULT 0,
	"is_fold" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "reply_likes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"user_id" bigint,
	"reply_id" bigint,
	"is_like" boolean
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"eams_id" bigint DEFAULT 0,
	"uni_id" bigint DEFAULT 0,
	"name" text,
	"institute" text,
	"job" text,
	"introduction" text,
	"email" text,
	"photo" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"email" text,
	"casdoor_sub" text,
	"password" text,
	"nick_name" text,
	"real_name" text,
	"year" bigint DEFAULT 0,
	"grade" bigint DEFAULT 0,
	"is_active" boolean DEFAULT false,
	"avatar" text,
	"is_anonymous" boolean DEFAULT false,
	"is_admin" boolean DEFAULT false,
	"is_community_admin" boolean DEFAULT false,
	"invitation_code" text,
	"invited_by_user_id" bigint DEFAULT 0,
	"reward" bigint DEFAULT 0,
	"has_posted_comments" boolean DEFAULT false
);
--> statement-breakpoint
CREATE INDEX "idx_comment_likes_user_id" ON "comment_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_comment_likes_comment_id" ON "comment_likes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_comment_likes_is_like" ON "comment_likes" USING btree ("is_like");--> statement-breakpoint
CREATE INDEX "idx_comments_user_id" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_comments_course_group_id" ON "comments" USING btree ("course_group_id");--> statement-breakpoint
CREATE INDEX "idx_comments_course_id" ON "comments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_course_groups_course_id" ON "course_groups" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "idx_feature_feedback_user" ON "feature_feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_feature_feedback_key" ON "feature_feedback" USING btree ("feature_key");--> statement-breakpoint
CREATE INDEX "idx_replies_comment_id" ON "replies" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "idx_replies_parent_reply_id" ON "replies" USING btree ("parent_reply_id");--> statement-breakpoint
CREATE INDEX "idx_replies_user_id" ON "replies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reply_likes_user_id" ON "reply_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reply_likes_reply_id" ON "reply_likes" USING btree ("reply_id");--> statement-breakpoint
CREATE INDEX "idx_reply_likes_is_like" ON "reply_likes" USING btree ("is_like");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_casdoor_sub" ON "users" USING btree ("casdoor_sub");