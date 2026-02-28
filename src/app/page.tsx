"use client";

import { useMemo } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

import { useCourses } from "@/hooks";
import { useSearch } from "@/contexts/SearchContext";
import {
  useCourseFilter,
  useCourseFilterDispatch,
} from "@/contexts/CourseFilterContext";
import { CourseCard, InstituteFilter, SortBar } from "@/components/course";
import { EmptyState } from "@/components/layout";
import { sortCmp } from "@/utils";
import { averageScore } from "@/utils/parseScore";
import type { Course, SortKey, SortOrder } from "@/types";

const ITEMS_PER_PAGE = 12;

function courseComparator(key: SortKey, order: SortOrder) {
  return (a: Course, b: Course) => {
    let va: number, vb: number;
    switch (key) {
      case "score":
        va = averageScore(a.score);
        vb = averageScore(b.score);
        break;
      case "count":
        va = a.comment_num;
        vb = b.comment_num;
        break;
      case "credit":
        va = a.credit;
        vb = b.credit;
        break;
      default:
        va = averageScore(a.score);
        vb = averageScore(b.score);
    }
    return order === "asc" ? va - vb : vb - va;
  };
}

export default function HomePage() {
  const { data, isLoading } = useCourses();
  const { keys, isRegexp } = useSearch();
  const { page, selected, sortKey, order } = useCourseFilter();
  const dispatch = useCourseFilterDispatch();

  const courses = data?.data ?? [];

  // Filter, search, sort
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Institute filter
    if (selected.length > 0) {
      result = result.filter((c) => selected.includes(c.institute));
    }

    // Search filter
    if (keys.trim()) {
      if (isRegexp) {
        try {
          const regex = new RegExp(keys, "i");
          result = result.filter(
            (c) => regex.test(c.name) || regex.test(c.code)
          );
        } catch {
          // Invalid regex, ignore
        }
      } else {
        const lowerKeys = keys.toLowerCase();
        result = result.filter(
          (c) =>
            c.name.toLowerCase().includes(lowerKeys) ||
            c.code.toLowerCase().includes(lowerKeys)
        );
      }
    }

    // Sort
    result.sort(courseComparator(sortKey, order));

    return result;
  }, [courses, selected, keys, isRegexp, sortKey, order]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const pagedCourses = filteredCourses.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={300} />
          ) : (
            <InstituteFilter
              courses={courses}
              selected={selected}
              onSelectedChange={(s) =>
                dispatch({ type: "SET_SELECTED", payload: s })
              }
            />
          )}
        </Grid>

        {/* Main content */}
        <Grid size={{ xs: 12, md: 9 }}>
          <SortBar
            sortKey={sortKey}
            order={order}
            onSortKeyChange={(k) =>
              dispatch({ type: "SET_SORT_KEY", payload: k })
            }
            onOrderChange={(o) =>
              dispatch({ type: "SET_ORDER", payload: o })
            }
          />

          {isLoading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Skeleton variant="rounded" height={120} />
                </Grid>
              ))}
            </Grid>
          ) : pagedCourses.length === 0 ? (
            <EmptyState message="没有找到匹配的课程" />
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                共 {filteredCourses.length} 门课程
              </Typography>
              <Grid container spacing={2}>
                {pagedCourses.map((course) => (
                  <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <CourseCard course={course} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, p) =>
                      dispatch({ type: "SET_PAGE", payload: p })
                    }
                    color="primary"
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
