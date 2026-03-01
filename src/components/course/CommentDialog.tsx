"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import type { CourseGroup } from "@/types";
import { unixToReadable } from "@/utils";
import { semesterToReadable } from "@/utils/formatTime";
import CommentEditor from "./CommentEditor";
import type { CommentDialogState } from "./useCommentDialog";

interface CommentDialogProps
  extends Pick<
    CommentDialogState,
    | "dialogOpen"
    | "step"
    | "editingComment"
    | "userComments"
    | "hasComments"
    | "handleClose"
    | "handleEditComment"
    | "handleNewComment"
    | "handleBack"
    | "handleSuccess"
  > {
  courseId: number;
  groups: CourseGroup[];
}

/**
 * The dialog portion of the comment-writing flow.
 *
 * It is completely stateless — all state comes from `useCommentDialog`.
 * This means it can be rendered anywhere in the tree (outside a SpeedDial, etc.)
 * while the trigger lives elsewhere.
 */
export default function CommentDialog({
  courseId,
  groups,
  dialogOpen,
  step,
  editingComment,
  userComments,
  hasComments,
  handleClose,
  handleEditComment,
  handleNewComment,
  handleBack,
  handleSuccess,
}: CommentDialogProps) {
  return (
    <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
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
  );
}
