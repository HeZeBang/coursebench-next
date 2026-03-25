"use client";

import { useState, useMemo, use, useEffect } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import { useCourse, useCommentsByCourse } from "@/hooks";
import {
  CourseDetailCard,
  TeacherGroupFilter,
  CommentCard,
  CommentDialog,
  WriteCommentButton,
  useCommentDialog,
} from "@/components/course";
import { EmptyState } from "@/components/layout";
import { sortCmp } from "@/utils";
import type { Comment, CommentSortKey, SortOrder } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Slider,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { ArrowUpward, Edit } from "@mui/icons-material";
import { nowYear, startYear } from "@/constants/forms";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

const sortOptions: { label: string; value: CommentSortKey }[] = [
  { label: "发布时间", value: "post_time" },
  { label: "修改时间", value: "update_time" },
  { label: "赞同数", value: "like" },
];

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = use(params);
  const {
    data: courseData,
    isLoading: courseLoading,
    mutate: mutateCourse,
  } = useCourse(id);
  const {
    data: commentsData,
    isLoading: commentsLoading,
    mutate: mutateComments,
  } = useCommentsByCourse(id);

  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [commentSort, setCommentSort] = useState<CommentSortKey>("post_time");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [yearRange, setYearRange] = useState<number[]>([startYear, nowYear]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Scroll to comment anchored in URL hash after loading
  useEffect(() => {
    if (commentsLoading || !isInitialized) return;
    const hash = window.location.hash;
    if (!hash) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        // el.scrollIntoView({ behavior: "smooth", block: "start" });
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 100;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [commentsLoading, isInitialized]);

  const course = courseData?.data;
  const comments = commentsData?.data ?? [];

  // Initialize selectedGroupIds with all groups (default all selected)
  if (course && !isInitialized) {
    setSelectedGroupIds(course.groups.map((g) => g.id));
    setIsInitialized(true);
  }

  // Handler to refresh both course and comments data
  const handleDataRefresh = () => {
    mutateComments();
    mutateCourse();
  };

  const commentDialog = useCommentDialog({
    comments,
    onSuccess: handleDataRefresh,
  });

  // Filter + sort comments
  // - All selected (selectedGroupIds.length === groups.length): show all
  // - None selected (selectedGroupIds.length === 0): show none
  // - Partial selection: show filtered
  const displayedComments = useMemo(() => {
    let result = [...comments];
    const totalGroups = course?.groups.length ?? 0;

    // If none selected, return empty
    if (selectedGroupIds.length === 0) {
      return [];
    }

    // If not all selected, filter by selected groups
    if (selectedGroupIds.length < totalGroups) {
      result = result.filter((c) =>
        selectedGroupIds.includes(c.group?.id ?? 0),
      );
    }

    result.sort(sortCmp<Comment>(commentSort, order));

    return result.filter(
      (i) =>
        i.semester / 100 >= (yearRange.at(0) || startYear) &&
        i.semester / 100 <= (yearRange.at(1) || nowYear),
    );
  }, [
    comments,
    selectedGroupIds,
    commentSort,
    course?.groups.length,
    order,
    yearRange,
  ]);

  if (courseLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* CourseDetailCard skeleton */}
          <Card sx={{ width: "100%" }}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Left: course info */}
                <Grid size={{ xs: 12, md: "grow" }}>
                  <Skeleton variant="text" width="50%" height={48} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 0.5 }} />
                  <Skeleton variant="text" width={80} height={24} sx={{ mt: 3 }} />
                  <Skeleton variant="text" width="30%" height={20} />
                  <Skeleton variant="text" width={80} height={24} sx={{ mt: 2 }} />
                  <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                    <Skeleton variant="rounded" width={56} height={24} />
                    <Skeleton variant="rounded" width={56} height={24} />
                    <Skeleton variant="rounded" width={56} height={24} />
                  </Box>
                </Grid>
                {/* Right: ratings */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "center", mt: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "7rem" }}>
                      <Skeleton variant="text" width={60} height={56} />
                      <Skeleton variant="rounded" width={60} height={24} />
                      <Skeleton variant="text" width={50} height={16} sx={{ mt: 0.5 }} />
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ my: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      {[5, 4, 3, 2, 1].map((star) => (
                        <Box key={star} sx={{ display: "flex", alignItems: "center", mb: 0.25 }}>
                          <Skeleton variant="text" width={12} height={16} sx={{ mr: 0.5 }} />
                          <Skeleton variant="circular" width={18} height={18} sx={{ mr: 1 }} />
                          <Skeleton variant="rounded" height={4} sx={{ flex: 1, borderRadius: 2 }} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  {/* Dimension scores */}
                  <Grid container spacing={1} sx={{ mt: 2 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Grid key={i} size={{ xs: 6, sm: 3, md: 6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                          <Skeleton variant="text" width={57} height={20} />
                          <Skeleton variant="rounded" width={44} height={20} />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Sidebar filter skeleton */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Skeleton variant="rounded" width={120} height={40} />
                  <Skeleton variant="rounded" width={100} height={40} />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                  <Skeleton variant="text" width={30} />
                  <Skeleton variant="rounded" height={4} sx={{ flex: 1 }} />
                  <Skeleton variant="text" width={30} />
                </Box>
                {/* TeacherGroupFilter skeleton */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Skeleton variant="rounded" width={20} height={20} sx={{ mr: 1 }} />
                    <Skeleton variant="text" width={`${40 + i * 15}%`} height={24} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Comments skeleton */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ mt: 3 }}>
              <Skeleton variant="rounded" width={120} height={36} sx={{ mb: 2 }} />
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    {/* Header: avatar + name + time */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Skeleton variant="rounded" width={40} height={40} />
                        <Box>
                          <Skeleton variant="text" width={80} height={22} />
                          <Skeleton variant="text" width={60} height={16} />
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
                        <Skeleton variant="text" width={60} height={16} />
                        <Skeleton variant="text" width={60} height={16} />
                      </Box>
                    </Box>
                    {/* Title + meta */}
                    <Skeleton variant="text" width="50%" height={32} sx={{ mt: 2 }} />
                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                      <Skeleton variant="text" width={80} height={20} />
                      <Skeleton variant="text" width={60} height={20} />
                    </Box>
                    {/* Score chips */}
                    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} variant="rounded" width={56} height={15} />
                      ))}
                    </Box>
                    {/* Content lines */}
                    <Skeleton variant="text" width="100%" height={18} />
                    <Skeleton variant="text" width="90%" height={18} />
                    <Skeleton variant="text" width="75%" height={18} />
                    <Divider sx={{ mx: -2, mt: 1 }} />
                    {/* Action buttons */}
                    <Box sx={{ display: "flex", gap: 1, mt: 1.5, pt: 1 }}>
                      <Skeleton variant="rounded" width={80} height={30} />
                      <Skeleton variant="rounded" width={60} height={30} />
                      <Skeleton variant="rounded" width={40} height={30} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <EmptyState message="课程不存在" />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Dialog lives outside SpeedDial so it doesn't break the action list */}
      <CommentDialog
        courseId={course.id}
        groups={course.groups}
        {...commentDialog}
      />

      <SpeedDial
        ariaLabel="More Actions"
        sx={{
          position: "fixed",
          bottom: { xs: 16, md: 32 },
          right: { xs: 16, md: 32 },
          "& .MuiSpeedDialIcon-icon": {
            mb: "4px !important",
          },
        }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          key="comment"
          icon={<Edit />}
          slotProps={{
            tooltip: {
              open: true,
              title: commentDialog.hasComments ? "我的评价" : "写评价",
            },
          }}
          onClick={commentDialog.handleOpen}
        />
        <SpeedDialAction
          key="edit"
          icon={<ArrowUpward />}
          slotProps={{
            tooltip: {
              open: true,
              title: "返回顶部",
            },
          }}
          onClick={() => {
            window?.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </SpeedDial>
      <Grid container spacing={3}>
        <CourseDetailCard course={course} comments={displayedComments} />

        {/* Sidebar: filters */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: "sticky", top: "100px" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                排序和筛选
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>排序方式</InputLabel>
                  <Select
                    value={commentSort}
                    label="排序方式"
                    onChange={(e) =>
                      setCommentSort(e.target.value as CommentSortKey)
                    }
                  >
                    {sortOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <ToggleButtonGroup
                  value={order}
                  exclusive
                  onChange={(_, v) => v && setOrder(v)}
                  size="small"
                >
                  <ToggleButton value="desc">降序</ToggleButton>
                  <ToggleButton value="asc">升序</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Divider variant="fullWidth" sx={{ my: 2 }} />

              <Box
                sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}
              >
                <Typography variant="caption" color="textSecondary">
                  {startYear}
                </Typography>
                <Slider
                  value={yearRange}
                  onChange={(_, v) => setYearRange(v)}
                  valueLabelDisplay="auto"
                  min={startYear}
                  max={nowYear}
                />
                <Typography variant="caption" color="textSecondary">
                  {nowYear}
                </Typography>
              </Box>

              <TeacherGroupFilter
                groups={course.groups}
                selectedGroupIds={selectedGroupIds}
                onSelectedChange={setSelectedGroupIds}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Main: detail + comments */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Comment section */}
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <WriteCommentButton
                courseId={course.id}
                groups={course.groups}
                comments={comments}
                onSuccess={handleDataRefresh}
              />
            </Box>

            {commentsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    {/* Header: avatar + name + time */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Skeleton variant="rounded" width={40} height={40} />
                        <Box>
                          <Skeleton variant="text" width={80} height={22} />
                          <Skeleton variant="text" width={60} height={16} />
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
                        <Skeleton variant="text" width={60} height={16} />
                        <Skeleton variant="text" width={60} height={16} />
                      </Box>
                    </Box>
                    {/* Title */}
                    <Skeleton variant="text" width="45%" height={32} sx={{ mt: 2 }} />
                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                      <Skeleton variant="text" width={80} height={20} />
                      <Skeleton variant="text" width={60} height={20} />
                    </Box>
                    {/* Score chips */}
                    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} variant="rounded" width={56} height={15} />
                      ))}
                    </Box>
                    {/* Content */}
                    <Skeleton variant="text" width="100%" height={18} />
                    <Skeleton variant="text" width="85%" height={18} />
                    <Skeleton variant="text" width="70%" height={18} />
                    <Divider sx={{ mx: -2, mt: 1 }} />
                    {/* Actions */}
                    <Box sx={{ display: "flex", gap: 1, mt: 1.5, pt: 1 }}>
                      <Skeleton variant="rounded" width={80} height={30} />
                      <Skeleton variant="rounded" width={60} height={30} />
                      <Skeleton variant="rounded" width={40} height={30} />
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : displayedComments.length === 0 ? (
              <EmptyState message="暂无评价，来写第一条吧！" />
            ) : (
              displayedComments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
