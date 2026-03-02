"use client";

import { useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Rating from "@mui/material/Rating";
import NextLink from "next/link";

import type { CourseDetail, GroupTeacher, Comment } from "@/types";
import {
  getScoreInfo,
  getInstituteColor,
  getInstituteAbbr,
  judgeItems,
  getJudgeInfo,
  ENOUGH_DATA_THRESHOLD,
  scoreInfo,
} from "@/constants";
import {
  parseScore,
  averageScore,
  calculateStarDistribution,
  starDistributionToPercentages,
} from "@/utils";
import { BarcodeReader } from "@mui/icons-material";

/* ── helpers ─────────────────────────────────────────────── */

/** Deduplicated list of teachers from all groups */
function collectTeachers(course: CourseDetail): GroupTeacher[] {
  const seen = new Set<number>();
  const result: GroupTeacher[] = [];
  for (const g of course.groups ?? []) {
    for (const t of g.teachers ?? []) {
      if (t.name === "其他") continue;
      if (!seen.has(t.id)) {
        seen.add(t.id);
        result.push(t);
      }
    }
  }
  return result;
}



/* ── component ───────────────────────────────────────────── */

interface CourseDetailCardProps {
  course: CourseDetail;
  comments?: Comment[];
}

export default function CourseDetailCard({ course, comments = [] }: CourseDetailCardProps) {
  const teachers = useMemo(() => collectTeachers(course), [course]);
  
  // Calculate dynamic scores based on filtered comments
  const dynamicScores = useMemo(() => {
    // Calculate average scores from filtered comments
    const dimensionSums = [0, 0, 0, 0];
    let validCommentCount = 0;
    
    for (const comment of comments) {
      if (comment.score && comment.score.length >= 4) {
        validCommentCount++;
        for (let i = 0; i < 4; i++) {
          dimensionSums[i] += comment.score[i];
        }
      }
    }
    
    const dimensionScores = validCommentCount > 0
      ? dimensionSums.map(sum => sum / validCommentCount)
      : [0, 0, 0, 0];
    
    const avg = averageScore(dimensionScores);
    
    return {
      avg,
      score: parseScore(avg, validCommentCount),
      hasEnoughData: validCommentCount >= ENOUGH_DATA_THRESHOLD,
      dimensionScores,
      commentCount: validCommentCount,
    };
  }, [comments, course.score, course.comment_num]);
  
  const { avg, score, hasEnoughData, dimensionScores, commentCount } = dynamicScores;
  const { label: scoreLabel, color: scoreColor } = getScoreInfo(avg, commentCount);
  
  // Calculate star distribution from comments
  const starDistribution = useMemo(
    () => calculateStarDistribution(comments),
    [comments]
  );
  const starPercentages = useMemo(
    () => starDistributionToPercentages(starDistribution),
    [starDistribution]
  );

  return (
    <Card sx={{ width: "100%" }}>
      <CardContent>
        <Grid container spacing={3}>
          {/* ─── Left column: course info ─── */}
          <Grid size={{ xs: 12, md: "grow" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              {/* Name + meta chips */}
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {course.name}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {course.code} | {course.credit} 学分 | {course.comment_num}{" "}
                  评论
                </Typography>
              </Box>

              {/* Institute */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">开课单位:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {course.institute}
                </Typography>
              </Box>

              {/* Teachers */}
              {teachers.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">授课老师:</Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    {teachers.map((t, idx) => (
                      <Chip
                        key={t.id}
                        component={NextLink}
                        href={`/teacher/${t.id}`}
                        clickable
                        size="small"
                        label={t.name}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          {/* ─── Right column: ratings ─── */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Ratings &amp; Reviews
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Overall score */}
                <Box sx={{ display: "flex", alignItems: "baseline" }}>
                  {hasEnoughData ? (
                    <>
                      <Typography
                        variant="h3"
                        fontWeight={700}
                        sx={{ fontFamily: "Arial, serif", color: scoreColor }}
                      >
                        {(score / 1).toFixed(1)}
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      variant="h3"
                      fontWeight={700}
                      sx={{ fontFamily: "Arial, serif", color: "#B0B0B0" }}
                    >
                      -
                    </Typography>
                  )}
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                      ml: 0.5,
                      color: hasEnoughData ? scoreColor : "#B0B0B0",
                    }}
                  >
                    /5
                  </Typography>
                </Box>

                {hasEnoughData && (
                  <Chip
                    label={scoreLabel}
                    size="small"
                    sx={{
                      bgcolor: scoreColor,
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  fontSize={12}
                  color="text.secondary"
                >
                  {commentCount} 人评分
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ my: 2 }} />

              {/* Star distribution bars */}
              <Box sx={{ my: 2, flexGrow: "1" }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const barColor = hasEnoughData
                    ? (scoreInfo[star + 1]?.color ?? "#B0B0B0")
                    : "#B0B0B0";
                  const percentage = hasEnoughData && comments.length > 0
                    ? starPercentages[star - 1]
                    : 0;
                  const count = hasEnoughData && comments.length > 0
                    ? starDistribution[star - 1]
                    : 0;
                  return (
                    <Box
                      key={star}
                      sx={{ display: "flex", alignItems: "center", mb: 0.25 }}
                      title={`${count} 人评为 ${star} 星`}
                    >
                      <Typography variant="body2" sx={{ mr: 0.5, minWidth: 12 }}>
                        {star}
                      </Typography>
                      <Rating
                        value={1}
                        max={1}
                        readOnly
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: `${barColor}22`,
                          "& .MuiLinearProgress-bar": { bgcolor: barColor },
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ ml: 1, minWidth: 28, fontSize: 10, color: "text.secondary" }}
                      >
                        {count > 0 ? count : ""}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Dimension scores as chips (matching Vue layout) */}
            {dimensionScores && dimensionScores.length >= 4 && (
              <Grid container spacing={1} sx={{ mt: 2 }}>
                {judgeItems.map((label, i) => {
                  const dimScore = parseScore(
                    dimensionScores[i],
                    commentCount,
                  );
                  const info =
                    dimScore > 0
                      ? getJudgeInfo(i, dimensionScores[i])
                      : { label: "数据不足", color: "#B0B0B0" };
                  return (
                    <Grid key={label} size={{ xs: 6, sm: 3, md: 6 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ minWidth: 57 }}
                        >
                          {label}
                        </Typography>
                        <Chip
                          label={info.label}
                          size="small"
                          sx={{
                            bgcolor: info.color,
                            color: "#fff",
                            fontSize: "0.75rem",
                            height: 20,
                          }}
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
