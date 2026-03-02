import { useEffect, useState, useRef } from "react";
import { useReplies } from "./useApi";

/**
 * Lazy-loading wrapper around useReplies that only fetches data
 * when the element is near the viewport (using Intersection Observer).
 *
 * @param commentId - The comment ID to fetch replies for
 * @param sort - Sort order ("latest" or "hottest")
 * @param showAll - Whether to fetch all replies (true) or filtered (false)
 * @param enabled - Whether to enable the hook (defaults to true)
 * @param threshold - Distance from viewport to trigger loading (default: 200px)
 * @returns - The ref to attach to the element, along with data and loading state
 */
export function useLazyReplies(
  commentId: number | string | null,
  sort: "latest" | "hottest" = "latest",
  showAll = false,
  enabled = true,
  threshold = 200,
) {
  const [shouldFetch, setShouldFetch] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !commentId) {
      return;
    }

    const element = elementRef.current;
    if (!element) {
      return;
    }

    // Use IntersectionObserver to detect when element is near viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldFetch(true);
            // Once we start fetching, we can disconnect the observer
            observer.disconnect();
          }
        });
      },
      {
        // Extend the viewport by threshold pixels in all directions
        rootMargin: `${threshold}px`,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [commentId, enabled, threshold]);

  // Only call useReplies when shouldFetch is true
  const { data, isLoading, mutate } = useReplies(
    shouldFetch ? commentId : null,
    sort,
    showAll,
  );

  return {
    ref: elementRef,
    data,
    isLoading: shouldFetch ? isLoading : false,
    mutate,
    hasFetched: shouldFetch,
  };
}
