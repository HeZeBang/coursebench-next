"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

import type { CourseDetail } from "@/types";
import {
  getScoreInfo,
  getInstituteColor,
  getInstituteAbbr,
  judgeItems,
  gradingInfo,
} from "@/constants";
import { parseScore } from "@/utils";
import { averageScore } from "@/utils/parseScore";

interface CourseDetailCardProps {
  course: CourseDetail;
}

export default function CourseDetailCard({ course }: CourseDetailCardProps) {
  const avg = averageScore(course.score);
  const score = parseScore(avg, course.comment_num);
  const { label: scoreLabel, color: scoreColor } = getScoreInfo(
    avg,
    course.comment_num
  );

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {course.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {course.code}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
              <Chip
                label={getInstituteAbbr(course.institute)}
                size="small"
                sx={{
                  bgcolor: getInstituteColor(course.institute),
                  color: "#fff",
                }}
              />
              <Chip
                label={`${course.credit} 学分`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${course.comment_num} 评价`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
          <Box sx={{ textAlign: "center", minWidth: 80 }}>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ color: scoreColor, lineHeight: 1 }}
            >
              {score > 0 ? score.toFixed(1) : "-"}
            </Typography>
            <Typography variant="caption" sx={{ color: scoreColor }}>
              {scoreLabel}
            </Typography>
          </Box>
        </Box>

        {/* Score dimensions */}
        {course.score && course.score.length >= 4 && (
          <Box sx={{ mt: 2 }}>
            {judgeItems.map((label, i) => {
              const dimScore = parseScore(course.score[i], course.comment_num);
              const color = gradingInfo.color[Math.round(dimScore) - 1] ?? "#B0B0B0";
              return (
                <Box key={label} sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.25,
                    }}
                  >
                    <Typography variant="caption">{label}</Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {dimScore > 0 ? dimScore.toFixed(1) : "-"}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={dimScore > 0 ? (dimScore / 5) * 100 : 0}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "grey.200",
                      "& .MuiLinearProgress-bar": { bgcolor: color },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
