"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

import type { ReplyTreeNode } from "@/types";
import { unixToReadable } from "@/utils";

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
    <Box sx={{ pl: depth > 0 ? 2 : 0 }}>
      {nodes.map((node) => (
        <Box key={node.reply.id} sx={{ mb: 1 }}>
          <Card variant="outlined" sx={{ p: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <Avatar
                src={node.reply.user?.avatar || undefined}
                sx={{ width: 28, height: 28, fontSize: 14, borderRadius: 1 }}
              >
                {getDisplayName(node.reply.user).charAt(0)}
              </Avatar>
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
