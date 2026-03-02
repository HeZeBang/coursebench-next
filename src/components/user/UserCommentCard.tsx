"use client";

import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

import type { Comment } from "@/types";
import { getInstituteColor, getScoreInfo } from "@/constants";
import { unixToReadable, getUserDisplayName } from "@/utils";
import { Badge, Button, CardActions, CardMedia, Stack } from "@mui/material";
import { semesterToReadable, timeAgo } from "@/utils/formatTime";
import {
  AccessTime,
  InfoOutline,
  RateReviewOutlined,
  SchoolOutlined,
  SubtitlesOutlined,
  ThumbUp,
  Update,
} from "@mui/icons-material";
import { gradeEnum } from "@/constants/info";
import UserAvatar from "./UserAvatar";
import SmartMarkdown from "../mdx/SmartMarkdown";
import { useRouter } from "next/navigation";

interface UserCommentCardProps {
  comment: Comment;
}

export default function UserCommentCard({ comment }: UserCommentCardProps) {
  const { color: scoreColor } = getScoreInfo(
    comment.score?.[0] ?? 0,
    1, // user comments always have data
  );
  const instColor = getInstituteColor(comment.course.institute);

  // Display name
  const displayName = getUserDisplayName(
    { nickname: comment.user?.nickname, id: comment.user?.id },
    comment.is_anonymous,
  );

  const router = useRouter();

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <UserAvatar
              userProfile={comment.user}
              size={40}
              sx={{ borderRadius: 1 }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  alignItems: "baseline",
                  flexWrap: "wrap",
                }}
              >
                <Typography fontWeight={800} color="textSecondary">
                  {comment.course.name}
                </Typography>
                <Chip
                  label={comment.course.code}
                  size="small"
                  sx={{
                    backgroundColor: instColor,
                    color: "white",
                    fontSize: "0.65rem",
                    height: "1rem",
                    borderRadius: 0.8,
                    "& .MuiChip-label": {
                      px: 0.5,
                    },
                    mb: 0.3,
                  }}
                />
              </Box>
              <Typography variant="caption" color="textSecondary">
                {displayName}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: "1",
              alignItems: "end",
              gap: 0.1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Update sx={{ height: 14, mt: 0.1 }} />
              <Typography variant="caption" color="textSecondary">
                {timeAgo(comment.update_time)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <RateReviewOutlined sx={{ height: 14, mt: 0.1 }} />
              <Typography variant="caption" color="textSecondary">
                {timeAgo(comment.post_time)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="h5" fontWeight={600}>
              <SubtitlesOutlined
                sx={{ mr: 1, display: "inline-block", mb: 0.5 }}
              />
              {comment.title || "无标题"}
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              {comment.semester && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <AccessTime
                    sx={{ height: 16, width: 16, mt: 0.2, mr: 0.5 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {semesterToReadable(comment.semester)}
                  </Typography>
                </Box>
              )}

              {comment.group.teachers.length > 0 && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SchoolOutlined
                    sx={{ height: 16, width: 16, mt: 0.2, mr: 0.5 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {comment.group.teachers.map((e) => e.name).join(" ")}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Content */}
        {comment.content && (
          <SmartMarkdown content={comment.content} noExpand />
        )}
      </CardContent>
      <CardActions sx={{ mt: -5 }}>
        <Button
          onClick={() =>
            router.push(`/course/${comment.course.id}?answer=${comment.id}`)
          }
        >
          阅读更多
        </Button>
        <Box sx={{ flex: "1" }} />
        <Stack direction="row" sx={{ pr: 1 }} spacing={2}>
          <Box>
            <ThumbUp
              fontSize="small"
              sx={{ height: 16, width: 16, color: "text.secondary", mr: 1 }}
            />
            <Typography variant="caption">
              {Math.max(comment.like - comment.dislike, 0)}
            </Typography>
          </Box>
        </Stack>
      </CardActions>
    </Card>
  );
}
