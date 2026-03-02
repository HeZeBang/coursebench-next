"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

import type { ReplyTreeNode } from "@/types";
import { unixToReadable } from "@/utils";
import UserAvatar from "../user/UserAvatar";

interface ReplyChainTreeProps {
  nodes: ReplyTreeNode[];
  depth?: number;
}

function getDisplayName(user: { nickname: string } | null): string {
  return user ? user.nickname : "匿名用户";
}

export default function ReplyChainTree({
  nodes,
  depth = 0,
}: ReplyChainTreeProps) {
  if (!nodes || nodes.length === 0) return null;

  return (
    <Box sx={{ mt: 1 }}>
      {nodes.map((node) => (
        <Box key={node.reply.id} sx={{ mb: 1 }}>
          <Card variant="outlined" sx={{ p: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <UserAvatar userProfile={node.reply.user} size={28} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" fontWeight="bold">
                  {getDisplayName(node.reply.user)}
                  {node.reply.reply_to && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      回复 {getDisplayName(node.reply.reply_to.user)}
                    </Typography>
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {node.reply.content}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {unixToReadable(node.reply.post_time)}
                </Typography>
              </Box>
            </Box>
          </Card>
          {node.children && node.children.length > 0 && (
            <ReplyChainTree nodes={node.children} depth={depth + 1} />
          )}
        </Box>
      ))}
    </Box>
  );
}
