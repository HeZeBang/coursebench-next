"use client";

import { useEffect, useRef, useCallback } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import { UserCommentCard } from "@/components/user";
import EmptyState from "@/components/layout/EmptyState";
import { useRecentCommentsInfinite } from "@/hooks";

function CommentSkeleton() {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
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
        <Skeleton variant="text" width="85%" height={18} />
        <Skeleton variant="text" width="60%" height={18} />
      </CardContent>
    </Card>
  );
}

export default function RecentPage() {
  const { comments, isLoading, isLoadingMore, hasMore, loadMore, error } =
    useRecentCommentsInfinite();

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    },
    [hasMore, isLoadingMore, loadMore],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "1000px",
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        最近评价
      </Typography>

      {/* Initial loading */}
      {isLoading && comments.length === 0 ? (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <CommentSkeleton key={i} />
          ))}
        </>
      ) : error ? (
        <Alert severity="error">加载失败</Alert>
      ) : comments.length === 0 ? (
        <EmptyState message="暂无最近评价" />
      ) : (
        <>
          {comments.map((comment) => (
            <UserCommentCard key={comment.id} comment={comment} />
          ))}

          {/* Load more indicator */}
          {isLoadingMore && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {/* Sentinel element for intersection observer */}
          {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

          {/* End of list */}
          {!hasMore && comments.length > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ py: 3 }}
            >
              已加载全部评价
            </Typography>
          )}
        </>
      )}
    </Container>
  );
}
