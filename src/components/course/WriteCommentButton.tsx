"use client";

import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";

import type { Comment, CourseGroup } from "@/types";
import { useCommentDialog } from "./useCommentDialog";
import CommentDialog from "./CommentDialog";

interface WriteCommentButtonProps {
  courseId: number;
  groups: CourseGroup[];
  comments: Comment[];
  onSuccess: () => void;
}

/**
 * A simple "写评价 / 我的评价" button that opens the CommentDialog.
 *
 * For a SpeedDialAction trigger (or any other custom trigger),
 * use `useCommentDialog` + `CommentDialog` directly instead.
 */
export default function WriteCommentButton({
  courseId,
  groups,
  comments,
  onSuccess,
}: WriteCommentButtonProps) {
  const state = useCommentDialog({ comments, onSuccess });

  return (
    <>
      <Button
        variant="contained"
        startIcon={<EditIcon />}
        onClick={state.handleOpen}
        sx={{ mb: 2 }}
        fullWidth
      >
        {state.hasComments ? "我的评价" : "写评价"}
      </Button>

      <CommentDialog courseId={courseId} groups={groups} {...state} />
    </>
  );
}
