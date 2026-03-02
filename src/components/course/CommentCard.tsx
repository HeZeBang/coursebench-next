"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";

import { useState, useCallback } from "react";

import type { Comment, UserProfile } from "@/types";
import {
  gradingInfo,
  judgeItems,
  gradingEmojis,
  gradeItems,
} from "@/constants";
import { unixToReadable, getUserDisplayName, timeAgo } from "@/utils";
import api from "@/lib/api";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useAuth } from "@/contexts/AuthContext";
import SmartMarkdown from "@/components/mdx/SmartMarkdown";
import {
  AccessTime,
  Chat,
  ChatBubble,
  ChatBubbleOutline,
  RateReviewOutlined,
  SchoolOutlined,
  SubtitlesOutlined,
  ThumbDown,
  ThumbDownAltOutlined,
  ThumbUpAltOutlined,
  Update,
} from "@mui/icons-material";
import { Alert, Button, Divider, Link } from "@mui/material";
import { judgeToKey } from "@/constants/scores";
import UserAvatar from "../user/UserAvatar";
import { userAgent } from "next/server";
import { gradeEnum, termEnum } from "@/constants/info";
import { semesterToReadable } from "@/utils/formatTime";
import { useRouter } from "next/navigation";
import ReplyPreview from "./ReplyPreview";
import { useLazyReplies } from "@/hooks";

interface CommentCardProps {
  comment: Comment;
}

export default function CommentCard({ comment }: CommentCardProps) {
  const { isLogin, userProfile } = useAuth();
  const showSnackbar = useSnackbar();
  const [likeStatus, setLikeStatus] = useState(comment.like_status);
  const [likeCount, setLikeCount] = useState(comment.like);
  const [expanded, setExpanded] = useState(!comment.is_fold);
  const [commentOpen, setCommentOpen] = useState(false);
  const {
    ref: cardRef,
    data: commentData,
    isLoading: isCommentLoading,
  } = useLazyReplies(comment.id, "hottest", false);

  const router = useRouter();

  const handleLike = useCallback(
    async (status: number) => {
      if (!isLogin) {
        showSnackbar("请先登录", "warning");
        return;
      }

      // 计算新状态：如果点击的是当前状态，则取消（变为0）
      const newStatus = likeStatus === status ? 0 : status;

      try {
        await api.post("/v1/comment/like", {
          id: comment.id,
          status: newStatus,
        });

        // 计算点赞数变化
        let countChange = 0;
        if (likeStatus === 1) {
          // 之前是赞状态，现在取消了，减1
          countChange = -1;
        }
        if (newStatus === 1) {
          // 现在变为赞状态，加1
          countChange = 1;
        }

        setLikeStatus(newStatus);
        setLikeCount((c) => c + countChange);
      } catch {
        showSnackbar("操作失败", "error");
      }
    },
    [comment.id, likeStatus, isLogin, showSnackbar],
  );

  // Display name
  const displayName = getUserDisplayName(
    { nickname: comment.user?.nickname, id: comment.user?.id },
    comment.is_anonymous,
  );

  // Score chips
  const scoreChips = comment.score?.map((s, i) => {
    const idx = Math.round(s) - 1;
    const color = gradingInfo.color[idx] ?? "#B0B0B0";
    const emoji = gradingInfo[judgeToKey[judgeItems[i]]][idx] ?? "";
    return (
      <Box
        key={judgeItems[i]}
        sx={{ display: "flex", mr: 1, alignItems: "baseline" }}
      >
        <Typography variant="caption" color="textSecondary" sx={{ mr: 0.5 }}>
          {judgeItems[i]}
        </Typography>
        <Chip
          label={`${emoji}`}
          size="small"
          sx={{ bgcolor: color, color: "#fff", fontSize: "0.7rem", height: 15 }}
        />
      </Box>
    );
  });

  // Covered comment
  if (comment.is_covered) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Alert severity="error">
            由于违反
            <Link
              onClick={() => {
                router.push("/terms-of-service");
              }}
              sx={{ cursor: "pointer" }}
            >
              相关社区规定
            </Link>
            ，该评论已被隐藏
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={cardRef} variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <UserAvatar
              userProfile={comment.user}
              size={40}
              sx={{ borderRadius: 1 }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.1,
              }}
            >
              <Typography fontWeight={800} color="textSecondary">
                {displayName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {(comment.user?.year || 0 !== 0) && `${comment.user?.year} 级`}
                {(comment.user?.grade || 0 !== 0) &&
                  gradeEnum[comment.user?.grade || 0]}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Update sx={{ height: 14, mt: 0.1 }} />
              <Typography variant="caption" color="textSecondary">
                {timeAgo(comment.update_time)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <RateReviewOutlined sx={{ height: 14, mt: 0.1 }} />
              <Typography variant="caption" color="textSecondary">
                {timeAgo(comment.post_time)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Collapse in={expanded} sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="h5" fontWeight={600}>
                <SubtitlesOutlined
                  sx={{ mr: 1, display: "inline-block", mb: 0.5 }}
                />
                {comment.title || "无标题"}
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                {comment.semester && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <AccessTime
                      sx={{ height: 16, width: 16, mt: 0.2, mr: 0.5 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {semesterToReadable(comment.semester)}
                    </Typography>
                  </Box>
                )}

                {comment.group.teachers.length > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <SchoolOutlined
                      sx={{ height: 16, width: 16, mt: 0.2, mr: 0.5 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {comment.group.teachers.map((e) => e.name).join(" ")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Score chips */}
          {scoreChips && scoreChips.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
              {scoreChips}
            </Box>
          )}

          {/* Content */}
          {comment.content && <SmartMarkdown content={comment.content} />}
        </Collapse>

        {comment.is_fold && (
          <Alert sx={{ mb: 2 }} severity="warning">
            此评论可能包含违反
            <Link
              onClick={() => {
                router.push("/terms-of-service");
              }}
              sx={{ cursor: "pointer" }}
            >
              相关社区规定
            </Link>
            的内容而被折叠，
            <Link
              variant="body2"
              onClick={() => setExpanded(!expanded)}
              sx={{ cursor: "pointer" }}
            >
              点击{expanded ? "收起" : "展开"}
            </Link>
          </Alert>
        )}

        <Divider sx={{ mx: -2 }} />

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1.5,
            pt: 1,
          }}
        >
          <Button
            variant={likeStatus === 1 ? "contained" : "outlined"}
            onClick={() => {
              handleLike(1);
            }}
            startIcon={
              likeStatus === 1 ? <ThumbUpIcon /> : <ThumbUpAltOutlined />
            }
            size="small"
            disabled={!isLogin || userProfile?.id === comment.user?.id}
            disableElevation
          >
            赞同 {likeCount}
          </Button>
          <Button
            variant={likeStatus === 2 ? "contained" : "outlined"}
            onClick={() => {
              handleLike(2);
            }}
            startIcon={
              likeStatus === 2 ? <ThumbDown /> : <ThumbDownAltOutlined />
            }
            size="small"
            disabled={!isLogin || userProfile?.id === comment.user?.id}
            disableElevation
          >
            反对
          </Button>

          {/* Reply button + count */}
          <Button
            variant="text"
            size="small"
            startIcon={<ChatBubbleOutline />}
            onClick={() => setCommentOpen(true)}
            disableElevation
            sx={{ textTransform: "none" }}
            loading={isCommentLoading}
          >
            {commentData?.data.total_count ?? ""} 条回复
          </Button>
        </Box>

        {/* Reply preview: button + featured replies */}
        <ReplyPreview
          commentId={comment.id}
          data={commentData}
          isLoading={isCommentLoading}
          dialogOpen={commentOpen}
          setDialogOpen={setCommentOpen}
        />
      </CardContent>
    </Card>
  );
}
