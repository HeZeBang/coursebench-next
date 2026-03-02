"use client";

import { useState, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

import type { Reply } from "@/types";
import { useReplies } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { unixToReadable } from "@/utils";
import api from "@/lib/api";
import ReplyChainDialog from "./ReplyChainDialog";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import UserAvatar from "../user/UserAvatar";

interface ReplyDialogProps {
  open: boolean;
  onClose: () => void;
  commentId: number;
}

const PAGE_SIZE = 10;

function getDisplayName(user: Reply["user"]): string {
  return user ? user.nickname : "匿名用户";
}

function truncateContent(content: string, max = 100): string {
  if (!content) return "";
  const lines = content.split("\n");
  if (lines.length <= 1) {
    return content.length > max ? content.substring(0, max) + "..." : content;
  }
  const first = lines[0];
  return first.length > max ? first.substring(0, max) + "..." : first + "...";
}

export default function ReplyDialog({
  open,
  onClose,
  commentId,
}: ReplyDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { isLogin } = useAuth();
  const showSnackbar = useSnackbar();

  // Sort & pagination state
  const [sortBy, setSortBy] = useState<"latest" | "hottest">("latest");
  const [currentPage, setCurrentPage] = useState(1);

  // Reply input state
  const [replyContent, setReplyContent] = useState("");
  const [replyTarget, setReplyTarget] = useState<Reply | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Chain dialog state
  const [chainDialogOpen, setChainDialogOpen] = useState(false);
  const [chainReplyId, setChainReplyId] = useState<number | null>(null);

  const replyInputRef = useRef<HTMLDivElement>(null);

  // Fetch replies
  const { data, isLoading, mutate } = useReplies(
    commentId,
    sortBy,
    true,
  );
  const replyData = data?.data;
  const replies = replyData?.replies ?? [];
  const totalCount = replyData?.total_count ?? 0;
  const filteredCount = replyData?.filtered_count ?? 0;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(replies.length / PAGE_SIZE));
  const paginatedReplies = replies.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // ── Handlers ──

  const handleSortChange = useCallback(
    (_: React.MouseEvent, value: string | null) => {
      if (value && (value === "latest" || value === "hottest")) {
        setSortBy(value);
        setCurrentPage(1);
      }
    },
    [],
  );

  const handleSetReplyTarget = useCallback(
    (reply: Reply) => {
      if (!isLogin) {
        showSnackbar("请先登录", "warning");
        return;
      }
      setReplyTarget(reply);
      setTimeout(() => {
        replyInputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    },
    [isLogin, showSnackbar],
  );

  const handleClearReplyTarget = useCallback(() => {
    setReplyTarget(null);
  }, []);

  const handleSubmitReply = useCallback(async () => {
    if (!isLogin) {
      showSnackbar("请先登录", "warning");
      return;
    }
    if (!replyContent.trim()) {
      showSnackbar("回复内容不能为空", "warning");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/v1/comment/${commentId}/reply`, {
        parent_reply_id: replyTarget?.id ?? null,
        content: replyContent,
        is_anonymous: isAnonymous,
      });
      setReplyContent("");
      setReplyTarget(null);
      showSnackbar("回复已发布", "success");
      mutate();
    } catch (err: unknown) {
      const msg =
        err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { data?: { msg?: string } } }).response?.data?.msg
          ? (err as { response: { data: { msg: string } } }).response.data.msg
          : "回复发布失败";
      showSnackbar(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }, [commentId, replyContent, replyTarget, isAnonymous, isLogin, showSnackbar, mutate]);

  const handleToggleLike = useCallback(
    async (reply: Reply, desiredStatus: number) => {
      if (!isLogin) {
        showSnackbar("请先登录", "warning");
        return;
      }
      const newStatus = reply.like_status === desiredStatus ? 0 : desiredStatus;
      try {
        await api.post("/v1/reply/like", { id: reply.id, status: newStatus });
        mutate();
      } catch {
        showSnackbar("操作失败", "error");
      }
    },
    [isLogin, showSnackbar, mutate],
  );

  const handleOpenChain = useCallback((replyId: number) => {
    setChainReplyId(replyId);
    setChainDialogOpen(true);
  }, []);

  // ── Render ──

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          sx: { height: fullScreen ? "100%" : "80vh" },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        全部回复 {!isLoading && `(${totalCount})`}
        <IconButton size="small" onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ pt: 1, pb: 2 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : (
            <>
              {/* Sort controls */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <ToggleButtonGroup
                  value={sortBy}
                  exclusive
                  onChange={handleSortChange}
                  size="small"
                >
                  <ToggleButton value="latest">最新</ToggleButton>
                  <ToggleButton value="hottest">最热</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Paginated info */}
              {totalPages > 1 && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  第 {currentPage} 页，共 {totalPages} 页
                </Typography>
              )}

              {/* Reply cards */}
              {paginatedReplies.map((reply) => (
                <Card
                  key={reply.id}
                  variant="outlined"
                  sx={{ mb: 1, p: 1.5, bgcolor: "transparent" }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <UserAvatar
                      userProfile={reply.user}
                      size={30}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Name + reply target */}
                      <Typography variant="caption" fontWeight="bold">
                        {getDisplayName(reply.user)}
                        {reply.reply_to && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 0.5 }}
                          >
                            回复{" "}
                            {reply.reply_to.user
                              ? getDisplayName(reply.reply_to.user)
                              : "匿名用户"}
                          </Typography>
                        )}
                      </Typography>

                      {/* Content */}
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                      >
                        {reply.content}
                      </Typography>

                      {/* Timestamp */}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                        {unixToReadable(reply.post_time)}
                      </Typography>

                      {/* Action buttons */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <Button
                          size="small"
                          color={reply.like_status === 1 ? "primary" : "inherit"}
                          startIcon={
                            reply.like_status === 1 ? (
                              <ThumbUpIcon fontSize="small" />
                            ) : (
                              <ThumbUpOutlinedIcon fontSize="small" />
                            )
                          }
                          onClick={() => handleToggleLike(reply, 1)}
                          sx={{ minWidth: 0, textTransform: "none" }}
                        >
                          {reply.like > 0 && reply.like}
                        </Button>
                        <Button
                          size="small"
                          color={reply.like_status === 2 ? "primary" : "inherit"}
                          startIcon={
                            reply.like_status === 2 ? (
                              <ThumbDownIcon fontSize="small" />
                            ) : (
                              <ThumbDownOutlinedIcon fontSize="small" />
                            )
                          }
                          onClick={() => handleToggleLike(reply, 2)}
                          sx={{ minWidth: 0, textTransform: "none" }}
                        >
                          {reply.dislike > 0 && reply.dislike}
                        </Button>
                        <Button
                          size="small"
                          color="inherit"
                          startIcon={<ReplyIcon fontSize="small" />}
                          onClick={() => handleSetReplyTarget(reply)}
                          sx={{ minWidth: 0, textTransform: "none" }}
                        >
                          回复
                        </Button>
                        {(reply.has_sub_replies || reply.reply_to) && (
                          <Button
                            size="small"
                            color="inherit"
                            startIcon={<ForumOutlinedIcon fontSize="small" />}
                            onClick={() => handleOpenChain(reply.id)}
                            sx={{ minWidth: 0, textTransform: "none" }}
                          >
                            查看对话
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    size="small"
                  />
                </Box>
              )}
            </>
          )}

          {/* Reply chain dialog */}
          <ReplyChainDialog
            open={chainDialogOpen}
            onClose={() => setChainDialogOpen(false)}
            replyId={chainReplyId}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        {/* Reply input */}
        {isLogin ? (
          <Box ref={replyInputRef} sx={{ flex: "1", mx: 1 }}>
            {/* Reply target preview */}
            {replyTarget && (
              <Box sx={{ mb: 1, display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ display: "block" }}>
                    正在回复 {getDisplayName(replyTarget.user)}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={handleClearReplyTarget}
                    sx={{ ml: 1, minWidth: 0, textTransform: "none" }}
                  >
                    取消
                  </Button>
                </Box>

                <Box
                  sx={{
                    p: 1,
                    borderLeft: 3,
                    borderColor: "divider",
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    fontStyle: "italic",
                    flexGrow: "1",
                    flex: "1"
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {truncateContent(replyTarget.content)}
                  </Typography>
                </Box>
              </Box>
            )}

            <TextField
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="写下你的回复..."
              multiline
              minRows={2}
              maxRows={6}
              fullWidth
              size="small"
              variant="outlined"
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                alignItems: "center",
                mt: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    size="small"
                  />
                }
                label="匿名"
                slotProps={{ typography: { variant: "body2" } }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleSubmitReply}
                disabled={submitting}
                disableElevation
              >
                {submitting ? <CircularProgress size={16} /> : "发布回复"}
              </Button>
            </Box>
          </Box>
        ) : (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ mt: 1, cursor: "pointer" }}
            onClick={() => showSnackbar("请先登录", "warning")}
          >
            登录后发布回复
          </Alert>
        )}
      </DialogActions>
    </Dialog>
  );
}
