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
import { Badge, CardMedia, Divider } from "@mui/material";
import Rating from "@mui/material/Rating";
import { ENOUGH_DATA_THRESHOLD, getJudgeInfo, judgeItems } from "@/constants/scores";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const avg = averageScore(course.score);
  const score = parseScore(avg, course.comment_num);
  const scoreList = course.score.map((s) => parseScore(s, course.comment_num));
  const { label: scoreLabel, color: scoreColor } = getScoreInfo(
    avg,
    course.comment_num
  );
  const instColor = getInstituteColor(course.institute);
  const instAbbr = getInstituteAbbr(course.institute);

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea component={Link} href={`/course/${course.id}`}>
            {/* <Box>
              <Typography variant="h6" component="div" noWrap>
                {course.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {course.code}
              </Typography>
            </Box> */}
        <CardMedia component="span" sx={{ px: 2, py: 1, backgroundColor: instColor }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="caption" color="#fff">
            {course.code}
          </Typography>
          <Typography variant="caption" color="#fff">
            {course.institute}
          </Typography>
          </Box>
        </CardMedia>
        <CardContent>
          <Typography variant="h6" component="div" sx={{ mb:1.2 }} noWrap>
            {course.name}
          </Typography>
          {/* <Rating
            name={`score-${course.code}`}
            value={avg}
            precision={0.1}
            readOnly
            size="small"
          /> */}
          {/* Score badge */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Box
              sx={{
              display: "grid",
              gap: 0.5,
              width: "100%",
              gridTemplateColumns: "repeat(2, 1fr)",
              minWidth: 56,
              }}
            >
              {scoreList.map((s, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "first baseline", gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {judgeItems[i]}
                  </Typography>
                  <Chip 
                    label={course.comment_num >= ENOUGH_DATA_THRESHOLD ? getJudgeInfo(i, course.score[i]).label : "数据不足"}
                    variant="outlined"
                    sx={{
                      color: course.comment_num >= ENOUGH_DATA_THRESHOLD ? getJudgeInfo(i, course.score[i]).color : "#8c8c8c",
                      borderColor: course.comment_num >= ENOUGH_DATA_THRESHOLD ? getJudgeInfo(i, course.score[i]).color : "#8c8c8c",
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 56,
              }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: scoreColor, lineHeight: 1 }}
              >
                {course.comment_num >= ENOUGH_DATA_THRESHOLD ? score.toFixed(1) : "-"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: scoreColor, fontSize: "0.65rem" }}
              >
                {scoreLabel}
              </Typography>
            </Box>
          </Box>

          <Divider orientation="horizontal" sx={{ my: 1 }} />

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
