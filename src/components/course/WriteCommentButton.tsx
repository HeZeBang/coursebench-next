"use client";

import { useState, useMemo, useCallback } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import type { Comment, CourseGroup } from "@/types";
import { unixToReadable } from "@/utils";
import { semesterToReadable } from "@/utils/formatTime";
import CommentEditor from "./CommentEditor";

interface WriteCommentButtonProps {
  courseId: number;
  groups: CourseGroup[];
  /** All comments for this course (used to find the current user's) */
  comments: Comment[];
  onSuccess: () => void;
}

/**
 * Trigger button + two-step dialog:
 *   Step 0 — "我的评价" list (shown when user has existing comments)
 *   Step 1 — Comment editor form (create / edit)
 *
 * If the user has no comments, clicking the button skips straight to step 1.
 */
export default function WriteCommentButton({
  courseId,
  groups,
  comments,
  onSuccess,
}: WriteCommentButtonProps) {
  const { isLogin, userProfile } = useAuth();
  const showSnackbar = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<0 | 1>(0);
  const [editingComment, setEditingComment] = useState<Comment | undefined>();

  // Current user's comments for this course
  const userComments = useMemo(() => {
    if (!userProfile) return [];
    return comments.filter((c) => c.user?.id === userProfile.id);
  }, [comments, userProfile]);

  const hasComments = userComments.length > 0;

  // ── Handlers ──

  const handleOpen = useCallback(() => {
    if (!isLogin) {
      showSnackbar("请先登录", "warning");
      return;
    }
    setEditingComment(undefined);
    setStep(hasComments ? 0 : 1);
    setDialogOpen(true);
  }, [isLogin, hasComments, showSnackbar]);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleEditComment = useCallback((comment: Comment) => {
    setEditingComment(comment);
    setStep(1);
  }, []);

  const handleNewComment = useCallback(() => {
    setEditingComment(undefined);
    setStep(1);
  }, []);

  const handleBack = useCallback(() => {
    setEditingComment(undefined);
    setStep(0);
  }, []);

  const handleSuccess = useCallback(() => {
    setDialogOpen(false);
    onSuccess();
  }, [onSuccess]);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<EditIcon />}
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        {hasComments ? "我的评价" : "写评价"}
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        {step === 0 ? (
          /* ── Step 0: My comments list ── */
          <>
            <DialogTitle>我的评价</DialogTitle>
            <DialogContent dividers>
              {userComments.map((comment, index) => (
                <Box key={comment.id}>
                  {index > 0 && <Divider />}
                  <Box
                    sx={{
                      py: 2,
                      px: 1,
                      cursor: "pointer",
                      borderRadius: 1,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => handleEditComment(comment)}
                  >
                    {/* Teacher group */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <SchoolOutlinedIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {comment.group?.teachers
                          .map((t) => t.name)
                          .join(", ") || "未知教师"}
                      </Typography>
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{ "&:hover": { textDecoration: "underline" } }}
                    >
                      {comment.title || "无标题"}
                    </Typography>

                    {/* Semester + timestamps */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        mt: 0.5,
                        flexWrap: "wrap",
                      }}
                    >
                      {comment.semester > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <AccessTimeIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" color="text.secondary">
                            修读于：{semesterToReadable(comment.semester)}
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        发布于：{unixToReadable(comment.post_time)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        修改于：{unixToReadable(comment.update_time)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}

              {/* "Write new" button — only if the user hasn't commented on every group */}
              {userComments.length < groups.length && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNewComment}
                  >
                    写新评价
                  </Button>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleClose}>关闭</Button>
            </DialogActions>
          </>
        ) : (
          /* ── Step 1: Editor form ── */
          <CommentEditor
            courseId={courseId}
            groups={groups}
            existingComment={editingComment}
            onSuccess={handleSuccess}
            onClose={handleClose}
            onBack={hasComments ? handleBack : undefined}
          />
        )}
      </Dialog>
    </>
  );
}
