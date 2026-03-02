"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";

import type { ReplyChainData } from "@/types";
import { useReplyChain } from "@/hooks";
import { unixToReadable } from "@/utils";
import ReplyChainTree from "./ReplyChainTree";
import UserAvatar from "../user/UserAvatar";

interface ReplyChainDialogProps {
  open: boolean;
  onClose: () => void;
  replyId: number | null;
}

function getDisplayName(user: { nickname: string } | null): string {
  return user ? user.nickname : "匿名用户";
}

function ReplyCard({
  reply,
  highlight = false,
}: {
  reply: ReplyChainData["current"];
  highlight?: boolean;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1,
        ...(highlight && { borderColor: "primary.main", borderWidth: 2 }),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        <UserAvatar
          userProfile={reply.user}
          size={28}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" fontWeight="bold">
            {getDisplayName(reply.user)}
            {reply.reply_to && (
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ ml: 0.5 }}
              >
                回复 {getDisplayName(reply.reply_to.user)}
              </Typography>
            )}
          </Typography>
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {reply.content}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {unixToReadable(reply.post_time)}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

export default function ReplyChainDialog({
  open,
  onClose,
  replyId,
}: ReplyChainDialogProps) {
  const { data, isLoading } = useReplyChain(open ? replyId : null);
  const chain = data?.data;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        查看对话
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ maxHeight: "70vh" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : !chain ? (
          <Typography variant="caption" color="text.secondary">
            暂无对话内容
          </Typography>
        ) : (
          <>
            {/* Ancestors */}
            {chain.ancestors.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  上文
                </Typography>
                {chain.ancestors.map((ancestor) => (
                  <ReplyCard key={ancestor.id} reply={ancestor} />
                ))}
              </>
            )}

            {/* Current */}
            <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
              当前回复
            </Typography>
            <ReplyCard reply={chain.current} highlight />

            {/* Descendants */}
            {chain.descendants && chain.descendants.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
                  下文
                </Typography>
                <ReplyChainTree nodes={chain.descendants} depth={0} />
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
