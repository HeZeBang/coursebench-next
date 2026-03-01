"use client";

import { useState, useMemo, useCallback } from "react";
import type { Comment, CourseGroup } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";

export interface UseCommentDialogOptions {
  comments: Comment[];
  onSuccess: () => void;
}

export interface CommentDialogState {
  /** Whether the dialog is open */
  dialogOpen: boolean;
  /** Current step: 0 = my comments list, 1 = editor */
  step: 0 | 1;
  /** The comment being edited (undefined = new comment) */
  editingComment: Comment | undefined;
  /** Current user's comments for this course */
  userComments: Comment[];
  /** Whether the user has existing comments */
  hasComments: boolean;
  /** Open the dialog (checks login, picks initial step) */
  handleOpen: () => void;
  /** Close the dialog */
  handleClose: () => void;
  /** Enter edit mode for a specific comment */
  handleEditComment: (comment: Comment) => void;
  /** Enter new-comment mode */
  handleNewComment: () => void;
  /** Go back to my-comments list */
  handleBack: () => void;
  /** Called when editor succeeds — closes dialog and triggers onSuccess */
  handleSuccess: () => void;
}

/**
 * Hook that owns all the dialog state for the comment writing flow.
 *
 * The trigger (Button, SpeedDialAction, etc.) just calls `handleOpen`.
 * The Dialog component consumes the rest of the returned state.
 */
export function useCommentDialog({
  comments,
  onSuccess,
}: UseCommentDialogOptions): CommentDialogState {
  const { isLogin, userProfile } = useAuth();
  const showSnackbar = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<0 | 1>(0);
  const [editingComment, setEditingComment] = useState<Comment | undefined>();

  const userComments = useMemo(() => {
    if (!userProfile) return [];
    return comments.filter((c) => c.user?.id === userProfile.id);
  }, [comments, userProfile]);

  const hasComments = userComments.length > 0;

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

  return {
    dialogOpen,
    step,
    editingComment,
    userComments,
    hasComments,
    handleOpen,
    handleClose,
    handleEditComment,
    handleNewComment,
    handleBack,
    handleSuccess,
  };
}
