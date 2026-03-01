"use client";

import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

import type { Comment } from "@/types";
import { getScoreInfo } from "@/constants";
import { unixToReadable, getUserDisplayName } from "@/utils";

interface UserCommentCardProps {
  comment: Comment;
}

export default function UserCommentCard({ comment }: UserCommentCardProps) {
  const { color: scoreColor } = getScoreInfo(
    comment.score?.[0] ?? 0,
    1, // user comments always have data
  );

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardActionArea component={Link} href={`/course/${comment.course?.id}`}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {comment.title || "无标题"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {comment.course?.name}
                {comment.group?.teachers?.[0]?.name &&
                  ` · ${comment.group.teachers[0].name}`}
                {` · ${unixToReadable(comment.post_time)}`}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {comment.content}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                ml: 2,
                flexShrink: 0,
              }}
            >
              <Chip
                label={`${comment.like} 赞`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 22 }}
              />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
