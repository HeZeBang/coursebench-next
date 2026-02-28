"use client";

import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

import type { Course } from "@/types";
import { getScoreInfo, getInstituteColor, getInstituteAbbr } from "@/constants";
import { parseScore } from "@/utils";
import { averageScore } from "@/utils/parseScore";

interface TeacherCourseCardProps {
  course: Course;
}

export default function TeacherCourseCard({ course }: TeacherCourseCardProps) {
  const avg = averageScore(course.score);
  const score = parseScore(avg, course.comment_num);
  const { label: scoreLabel, color: scoreColor } = getScoreInfo(
    avg,
    course.comment_num
  );

  return (
    <Card variant="outlined">
      <CardActionArea component={Link} href={`/course/${course.id}`}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {course.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {course.code}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center", minWidth: 50 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: scoreColor, lineHeight: 1 }}
              >
                {score > 0 ? score.toFixed(1) : "-"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: scoreColor, fontSize: "0.6rem" }}
              >
                {scoreLabel}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
            <Chip
              label={getInstituteAbbr(course.institute)}
              size="small"
              sx={{
                bgcolor: getInstituteColor(course.institute),
                color: "#fff",
                fontSize: "0.7rem",
                height: 20,
              }}
            />
            <Chip
              label={`${course.credit} 学分`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
            <Chip
              label={`${course.comment_num} 评价`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
