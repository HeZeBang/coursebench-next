"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import { UserProfileCard, UserCommentCard } from "@/components/user";
import EmptyState from "@/components/layout/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { sortCmp } from "@/utils";
import type { ApiResponse, Comment, SortOrder, CommentSortKey, UserProfile } from "@/types";
import { Card, CardContent, Divider, Stack } from "@mui/material";
import { RateReview, ThumbUp } from "@mui/icons-material";

const SORT_OPTIONS: { value: CommentSortKey; label: string }[] = [
  { value: "post_time", label: "发布时间" },
  { value: "update_time", label: "更新时间" },
  { value: "like", label: "点赞数" },
];

interface UserDetailClientProps {
  userId: number;
  initialProfile: UserProfile;
  initialComments: Comment[];
}

export default function UserDetailClient({
  userId,
  initialProfile,
  initialComments,
}: UserDetailClientProps) {
  const { data: profileData } = useSWR<ApiResponse<UserProfile>>(
    `/v1/user/profile/${userId}`,
    fetcher,
    { fallbackData: { error: false, data: initialProfile } },
  );
  const { data: commentsData } = useSWR<ApiResponse<Comment[]>>(
    `/v1/comment/user/${userId}`,
    fetcher,
    { fallbackData: { error: false, data: initialComments } },
  );

  const { userProfile: selfProfile } = useAuth();
  const isSelf = selfProfile?.id === userId;

  const [sortKey, setSortKey] = useState<CommentSortKey>("post_time");
  const [order, setOrder] = useState<SortOrder>("desc");

  const user = profileData?.data;
  const rawComments: Comment[] = commentsData?.data ?? [];

  const comments = useMemo(() => {
    let filtered = rawComments;
    if (!isSelf) {
      filtered = filtered.filter((c) => !c.is_anonymous);
    }
    return [...filtered].sort(sortCmp<Comment>(sortKey, order));
  }, [rawComments, sortKey, order, isSelf]);

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
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
                    发表
                    {" "}
                    {comments.length}
                    {" "}
                    篇评价
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
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

          {comments.length === 0 ? (
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
