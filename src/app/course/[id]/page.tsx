"use client";

import { useState, useMemo, use } from "react";
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
import type { Comment, CommentSortKey } from "@/types";
import { Card, CardContent, CardHeader, Divider, SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import { ArrowUpward, Edit } from "@mui/icons-material";

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
  const { data: courseData, isLoading: courseLoading, mutate: mutateCourse } = useCourse(id);
  const {
    data: commentsData,
    isLoading: commentsLoading,
    mutate: mutateComments,
  } = useCommentsByCourse(id);

  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [commentSort, setCommentSort] = useState<CommentSortKey>("post_time");
  const [isInitialized, setIsInitialized] = useState(false);

  const course = courseData?.data;
  const comments = commentsData?.data ?? [];

  // Initialize selectedGroupIds with all groups (default all selected)
  if (course && !isInitialized) {
    setSelectedGroupIds(course.groups.map(g => g.id));
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
    
    result.sort(sortCmp<Comment>(commentSort, "desc"));
    return result;
  }, [comments, selectedGroupIds, commentSort, course?.groups.length]);

  if (courseLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Skeleton variant="rounded" height={200} />
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <Skeleton variant="rounded" height={250} />
            <Skeleton variant="rounded" height={150} sx={{ mt: 2 }} />
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
        ariaLabel="SpeedDial basic example"
        sx={{ position: 'fixed', 
            bottom: { sm: 16, md: 32 }, 
            right: { sm: 16, md: 32 },
            "& .MuiSpeedDialIcon-icon": {
              mb: "4px !important"
            }
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
          onClick={() => { window?.scrollTo({ top: 0, behavior: "smooth" }) }}
        />
      </SpeedDial>
      <Grid container spacing={3}>
        <CourseDetailCard course={course} comments={displayedComments} />

        {/* Sidebar: filters */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ position: "sticky", top: "100px" }}>
            <CardContent>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel variant="standard">排序方式</InputLabel>
                <Select
                  value={commentSort}
                  label="排序方式"
                  variant="standard"
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

              <Divider variant="middle" sx={{ my: 2 }} />

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
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={120}
                  sx={{ mb: 2 }}
                />
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
