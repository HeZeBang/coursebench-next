"use client";

import { use, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { UserProfileCard, UserCommentCard } from "@/components/user";
import EmptyState from "@/components/layout/EmptyState";
import { useUserProfile, useCommentsByUser } from "@/hooks";
import { useAuth } from "@/contexts/AuthContext";
import { sortCmp } from "@/utils";
import type { Comment, SortOrder, CommentSortKey } from "@/types";
import { Card, CardContent, Divider, Stack } from "@mui/material";
import { RateReview, ThumbUp } from "@mui/icons-material";

const SORT_OPTIONS: { value: CommentSortKey; label: string }[] = [
  { value: "post_time", label: "发布时间" },
  { value: "update_time", label: "更新时间" },
  { value: "like", label: "点赞数" },
];

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);
  const { userProfile: selfProfile } = useAuth();
  const isSelf = selfProfile?.id === userId;

  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
  } = useUserProfile(userId);
  const { data: commentsData, isLoading: commentsLoading } =
    useCommentsByUser(userId);

  const [sortKey, setSortKey] = useState<CommentSortKey>("post_time");
  const [order, setOrder] = useState<SortOrder>("desc");

  const user = profileData?.data;
  const rawComments: Comment[] = commentsData?.data ?? [];

  const comments = useMemo(() => {
    let filtered = rawComments;
    // Hide anonymous comments from non-self visitors
    if (!isSelf) {
      filtered = filtered.filter((c) => !c.is_anonymous);
    }
    return [...filtered].sort(sortCmp<Comment>(sortKey, order));
  }, [rawComments, sortKey, order, isSelf]);

  if (profileLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* UserProfileCard skeleton */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Skeleton variant="circular" width={100} height={100} sx={{ mx: "auto", mb: 2 }} />
                <Skeleton variant="text" width="60%" height={32} sx={{ mx: "auto" }} />
                <Skeleton variant="text" width="50%" height={20} sx={{ mx: "auto" }} />
                <Skeleton variant="text" width="70%" height={20} sx={{ mx: "auto" }} />
                <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 0.5 }}>
                  <Skeleton variant="rounded" width={40} height={24} />
                  <Skeleton variant="rounded" width={52} height={24} />
                </Box>
              </CardContent>
            </Card>
            {/* Achievements skeleton */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Skeleton variant="text" width="40%" height={32} />
                <Divider sx={{ my: 1 }} />
                <Stack sx={{ my: 2 }} spacing={1.5}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Skeleton variant="rounded" width={20} height={20} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Skeleton variant="rounded" width={20} height={20} />
                    <Skeleton variant="text" width="50%" height={20} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Comments skeleton */}
          <Grid size={{ xs: 12, md: 9 }}>
            {/* Sort bar skeleton */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Skeleton variant="text" width={80} height={28} />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Skeleton variant="rounded" width={120} height={40} />
                <Skeleton variant="rounded" width={100} height={40} />
              </Box>
            </Box>
            {/* UserCommentCard skeletons */}
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  {/* Header: avatar + course name + time */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Skeleton variant="rounded" width={40} height={40} />
                      <Box>
                        <Box sx={{ display: "flex", gap: 0.5, alignItems: "baseline" }}>
                          <Skeleton variant="text" width={100} height={24} />
                          <Skeleton variant="rounded" width={48} height={16} />
                        </Box>
                        <Skeleton variant="text" width={60} height={16} />
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
                      <Skeleton variant="text" width={60} height={16} />
                      <Skeleton variant="text" width={60} height={16} />
                    </Box>
                  </Box>
                  {/* Title + meta */}
                  <Skeleton variant="text" width="40%" height={32} />
                  <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                    <Skeleton variant="text" width={80} height={20} />
                    <Skeleton variant="text" width={60} height={20} />
                  </Box>
                  {/* Content */}
                  <Skeleton variant="text" width="100%" height={18} />
                  <Skeleton variant="text" width="80%" height={18} />
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (profileError || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">用户信息加载失败</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <UserProfileCard user={user} />
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6">成就</Typography>
              <Divider sx={{ my: 1 }} />
              <Stack sx={{ my: 2 }} spacing={1.5}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <ThumbUp fontSize="small" />
                  <Typography variant="body2">
                    获得{" "}
                    {comments
                      .map((i) => i.like)
                      .reduce((prev, cur) => prev + cur, 0)}{" "}
                    次赞同
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <RateReview fontSize="small" />
                  <Typography variant="body2">
                    发表{" "}
                    {comments
                      .map((i) => i.like)
                      .reduce((prev, cur) => prev + cur, 0)}{" "}
                    篇评价
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Comments */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* Sort bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              评价 ({comments.length})
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>排序</InputLabel>
                <Select
                  value={sortKey}
                  label="排序"
                  onChange={(e) => setSortKey(e.target.value as CommentSortKey)}
                >
                  {SORT_OPTIONS.map((opt) => (
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
          </Box>

          {commentsLoading ? (
            <>
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Skeleton variant="rounded" width={40} height={40} />
                        <Box>
                          <Box sx={{ display: "flex", gap: 0.5, alignItems: "baseline" }}>
                            <Skeleton variant="text" width={100} height={24} />
                            <Skeleton variant="rounded" width={48} height={16} />
                          </Box>
                          <Skeleton variant="text" width={60} height={16} />
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
                        <Skeleton variant="text" width={60} height={16} />
                        <Skeleton variant="text" width={60} height={16} />
                      </Box>
                    </Box>
                    <Skeleton variant="text" width="40%" height={32} />
                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                      <Skeleton variant="text" width={80} height={20} />
                      <Skeleton variant="text" width={60} height={20} />
                    </Box>
                    <Skeleton variant="text" width="100%" height={18} />
                    <Skeleton variant="text" width="80%" height={18} />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : comments.length === 0 ? (
            <EmptyState message="暂无评价" />
          ) : (
            comments.map((comment) => (
              <UserCommentCard key={comment.id} comment={comment} />
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
