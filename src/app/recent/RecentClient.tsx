"use client";

import { useEffect, useRef, useCallback } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import useSWRInfinite from "swr/infinite";

import { fetcher } from "@/lib/fetcher";
import { UserCommentCard } from "@/components/user";
import EmptyState from "@/components/layout/EmptyState";
import type { ApiResponse, Comment } from "@/types";

interface RecentCommentsPage {
  page_count: number;
  has_more: boolean;
  comments: Comment[];
}

interface RecentClientProps {
  firstPage: RecentCommentsPage;
}

export default function RecentClient({ firstPage }: RecentClientProps) {
  const result = useSWRInfinite<ApiResponse<RecentCommentsPage>>(
    (pageIndex, previousPageData) => {
      if (pageIndex === 0) return `/v1/comment/recent/1`;
      if (previousPageData && !previousPageData.data?.has_more) return null;
      return `/v1/comment/recent/${pageIndex + 1}`;
    },
    fetcher,
    {
      revalidateFirstPage: false,
      fallbackData: [{ error: false, data: firstPage }],
    },
  );

  const comments = result.data?.flatMap((page) => page.data?.comments ?? []) ?? [];
  const isLoadingMore = result.isLoading || (result.size > 0 && result.data && typeof result.data[result.size - 1] === "undefined");
  const hasMore = result.data ? (result.data[result.data.length - 1]?.data?.has_more ?? false) : true;

  const loadMore = () => result.setSize(result.size + 1);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    },
    [hasMore, isLoadingMore],
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

      {comments.length === 0 ? (
        <EmptyState message="暂无最近评价" />
      ) : (
        <>
          {comments.map((comment) => (
            <UserCommentCard key={comment.id} comment={comment} />
          ))}

          {isLoadingMore && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

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
