"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";

import { UserCommentCard } from "@/components/user";
import EmptyState from "@/components/layout/EmptyState";
import { useRecentComments } from "@/hooks";

export default function RecentPage() {
  const { data, error, isLoading } = useRecentComments();
  const comments = data?.data ?? [];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        最近评价
      </Typography>

      {isLoading ? (
        <>
          <Skeleton variant="rounded" height={80} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={80} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={80} sx={{ mb: 2 }} />
        </>
      ) : error ? (
        <Alert severity="error">加载失败</Alert>
      ) : comments.length === 0 ? (
        <EmptyState message="暂无最近评价" />
      ) : (
        comments.map((comment) => (
          <UserCommentCard key={comment.id} comment={comment} />
        ))
      )}
    </Container>
  );
}
