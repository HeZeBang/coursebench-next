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

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const avg = averageScore(course.score);
  const score = parseScore(avg, course.comment_num);
  const { label: scoreLabel, color: scoreColor } = getScoreInfo(
    avg,
    course.comment_num
  );
  const instColor = getInstituteColor(course.institute);
  const instAbbr = getInstituteAbbr(course.institute);

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea component={Link} href={`/course/${course.id}`}>
        <CardContent>
          {/* Score badge */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Box>
              <Typography variant="h6" component="div" noWrap>
                {course.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {course.code}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 56,
              }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: scoreColor, lineHeight: 1 }}
              >
                {score > 0 ? score.toFixed(1) : "-"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: scoreColor, fontSize: "0.65rem" }}
              >
                {scoreLabel}
              </Typography>
            </Box>
          </Box>

          {/* Chips: institute, credit, comment count */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            <Chip
              label={instAbbr}
              size="small"
              sx={{
                bgcolor: instColor,
                color: "#fff",
                fontSize: "0.7rem",
                height: 22,
              }}
            />
            <Chip
              label={`${course.credit} 学分`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 22 }}
            />
            <Chip
              label={`${course.comment_num} 评价`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 22 }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
