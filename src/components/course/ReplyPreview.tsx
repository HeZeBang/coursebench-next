"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import type { ApiResponse, Reply, ReplyListData } from "@/types";
import { useReplies } from "@/hooks";
import { unixToReadable, getUserDisplayName } from "@/utils";
import ReplyDialog from "./ReplySection";

interface ReplyPreviewProps {
  commentId: number;
  dialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  data: ApiResponse<ReplyListData> | undefined;
  isLoading: boolean;
}

/** Max number of featured replies to show inline */
const PREVIEW_COUNT = 3;

/**
 * Lightweight inline preview shown inside CommentCard.
 * Displays reply count + a few featured replies.
 * Clicking opens the full ReplyDialog.
 */
export default function ReplyPreview({
  data,
  isLoading,
  commentId,
  dialogOpen,
  setDialogOpen,
}: ReplyPreviewProps) {
  // Fetch only featured (filtered) replies for the preview
  const replyData = data?.data;
  const featured = replyData?.replies ?? [];
  const totalCount = replyData?.total_count ?? 0;

  const previewReplies = featured.slice(0, PREVIEW_COUNT);

  return (
    <>
      {/* Featured replies preview */}
      {!isLoading && previewReplies.length > 0 && (
        <Box
          onClick={() => setDialogOpen(true)}
          sx={{
            mt: 1.5,
            p: 1.5,
            bgcolor: "action.hover",
            borderRadius: 1,
            cursor: "pointer",
            "&:hover": { bgcolor: "action.selected" },
            transition: "background-color 0.2s",
          }}
        >
          {previewReplies.map((reply, idx) => (
            <Box key={reply.id}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <Avatar
                  src={reply.is_anonymous ? undefined : reply.user?.avatar || undefined}
                  sx={{
                    width: 22,
                    height: 22,
                    fontSize: 11,
                    borderRadius: 0.5,
                    mt: 0.25,
                    flexShrink: 0,
                  }}
                >
                  {getUserDisplayName(reply.user, reply.is_anonymous).charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    component="span"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    {getUserDisplayName(reply.user, reply.is_anonymous)}
                  </Typography>
                  {reply.reply_to && (
                    <Typography
                      variant="caption"
                      component="span"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      回复 {getUserDisplayName(reply.reply_to.user, reply.reply_to.user?.is_anonymous)}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    component="span"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    · {unixToReadable(reply.post_time)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {reply.content}
                  </Typography>
                </Box>
              </Box>
              {idx < previewReplies.length - 1 && <Divider sx={{ my: 0.75 }} />}
            </Box>
          ))}

          {totalCount > PREVIEW_COUNT && (
            <Typography
              variant="caption"
              color="primary"
              sx={{ mt: 1, display: "block" }}
            >
              查看全部 {totalCount} 条回复
            </Typography>
          )}
        </Box>
      )}

      {/* {isLoading && totalCount === 0 && (
        <Box sx={{ mt: 1 }}>
          <CircularProgress size={14} />
        </Box>
      )} */}

      {/* Full reply dialog */}
      <ReplyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        commentId={commentId}
      />
    </>
  );
}
