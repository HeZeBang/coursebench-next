"use client";

import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

import type { Course } from "@/types";
import {
  getScoreInfo,
  getInstituteColor,
  getInstituteAbbr,
  ENOUGH_DATA_THRESHOLD,
  judgeItems,
  getJudgeInfo,
} from "@/constants";
import { parseScore } from "@/utils";
import { averageScore } from "@/utils/parseScore";
import { Rating } from "@mui/material";

interface TeacherCourseCardProps {
  course: Course;
}

export default function TeacherCourseCard({ course }: TeacherCourseCardProps) {
  const avg = averageScore(course.score);
  const score = parseScore(avg, course.comment_num);
  const { label: scoreLabel, color: scoreColor } = getScoreInfo(
    avg,
    course.comment_num,
  );

  return (
    <Card variant="outlined">
      <CardActionArea component={Link} href={`/course/${course.id}`}>
        <CardContent>
          <Box
            sx={{
              maxWidth: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {course.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  {course.code}
                </Typography>
                <Rating value={score} precision={0.1} size="small" readOnly />
              </Box>
            </Box>
          </Box>

          {/* Score badge */}
          <Box sx={{ display: "flex", justifyContent: "space-between", my: 1 }}>
            <Box
              sx={{
                display: "grid",
                gap: 0.5,
                width: "100%",
                gridTemplateColumns: "repeat(2, 1fr)",
                minWidth: 56,
              }}
            >
              {course.score.map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "first baseline",
                    gap: 1,
                    rowGap: 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    {judgeItems[i]}
                  </Typography>
                  <Chip
                    label={
                      course.comment_num >= ENOUGH_DATA_THRESHOLD
                        ? getJudgeInfo(i, course.score[i]).label
                        : "数据不足"
                    }
                    variant="outlined"
                    sx={{
                      color: "white",
                      borderColor:
                        course.comment_num >= ENOUGH_DATA_THRESHOLD
                          ? getJudgeInfo(i, course.score[i]).color
                          : "#8c8c8c",
                      backgroundColor:
                        course.comment_num >= ENOUGH_DATA_THRESHOLD
                          ? getJudgeInfo(i, course.score[i]).color
                          : "#8c8c8c",
                      fontSize: "0.65rem",
                      height: "1rem",
                      borderRadius: 0.8,
                      "& .MuiChip-label": {
                        px: 0.5,
                      },
                    }}
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 0.5, mt: 2 }}>
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
