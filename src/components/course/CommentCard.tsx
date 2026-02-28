"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState, useCallback } from "react";

import type { Comment } from "@/types";
import { gradingInfo, judgeItems, gradingEmojis } from "@/constants";
import { unixToReadable, getUserDisplayName } from "@/utils";
import api from "@/lib/api";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useAuth } from "@/contexts/AuthContext";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
import { ThumbDown } from "@mui/icons-material";

interface CommentCardProps {
  comment: Comment;
  onReplyClick?: (commentId: number) => void;
}

export default function CommentCard({
  comment,
  onReplyClick,
}: CommentCardProps) {
  const { isLogin } = useAuth();
  const showSnackbar = useSnackbar();
  const [likeStatus, setLikeStatus] = useState(comment.like_status);
  const [likeCount, setLikeCount] = useState(comment.like);
  const [expanded, setExpanded] = useState(!comment.is_fold);

  const handleLike = useCallback(async (status: number) => {
    if (!isLogin) {
      showSnackbar("请先登录", "warning");
      return;
    }
    
    // 计算新状态：如果点击的是当前状态，则取消（变为0）
    const newStatus = likeStatus === status ? 0 : status;
    
    try {
      await api.post("/v1/comment/like", { id: comment.id, status: newStatus });
      
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
  }, [comment.id, likeStatus, isLogin, showSnackbar]);

  // Display name
  const displayName = getUserDisplayName(
    { nickname: comment.user?.nickname, id: comment.user?.id },
    comment.is_anonymous
  );

  // Teacher name
  const teacherName = comment.group?.teachers?.[0]?.name ?? "";

  // Score chips
  const scoreChips = comment.score?.map((s, i) => {
    const idx = Math.round(s) - 1;
    const color = gradingInfo.color[idx] ?? "#B0B0B0";
    const emoji = gradingEmojis[idx] ?? "";
    return (
      <Chip
        key={judgeItems[i]}
        label={`${judgeItems[i]}: ${emoji}`}
        size="small"
        sx={{ bgcolor: color, color: "#fff", fontSize: "0.7rem", height: 22 }}
      />
    );
  });

  // Covered comment
  if (comment.is_covered) {
    return (
      <Card variant="outlined" sx={{ mb: 2, opacity: 0.6 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            该评论已被管理员隐藏
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {comment.title || "无标题"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {displayName} · {unixToReadable(comment.post_time)}
              {teacherName && ` · ${teacherName}`}
              {comment.semester ? ` · ${comment.semester}` : ""}
            </Typography>
          </Box>
          {comment.is_fold && (
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>

        {/* Score chips */}
        {scoreChips && scoreChips.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
            {scoreChips}
          </Box>
        )}

        {/* Content */}
        <Collapse in={expanded}>
          {comment.content && expanded && (
            <MarkdownRenderer content={comment.content} />
          )}
        </Collapse>

        {comment.is_fold && !expanded && (
          <Typography
            variant="caption"
            color="text.secondary"
            fontStyle="italic"
          >
            该评论已被折叠，点击展开
          </Typography>
        )}

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1.5,
            pt: 1,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <IconButton size="small" onClick={() => { handleLike(1) }}>
            {likeStatus === 1 ? (
              <ThumbUpIcon fontSize="small" color="primary" />
            ) : (
              <ThumbUpOutlinedIcon fontSize="small" />
            )}
          </IconButton>
          <Typography variant="caption">{likeCount}</Typography>

          <IconButton size="small" onClick={() => { handleLike(2) }}>
            {likeStatus === 2 ? (
              <ThumbDown fontSize="small" color="primary" />
            ) : (
              <ThumbDownOutlinedIcon fontSize="small" />
            )}
          </IconButton>

          {onReplyClick && (
            <IconButton
              size="small"
              onClick={() => onReplyClick(comment.id)}
            >
              <ChatBubbleOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
