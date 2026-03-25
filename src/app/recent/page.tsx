"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";

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
                <Skeleton variant="text" width="85%" height={18} />
                <Skeleton variant="text" width="60%" height={18} />
              </CardContent>
            </Card>
          ))}
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
