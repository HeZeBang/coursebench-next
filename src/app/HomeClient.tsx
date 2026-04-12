"use client";

import { useMemo, useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import { useSearch } from "@/contexts/SearchContext";
import {
  useCourseFilter,
  useCourseFilterDispatch,
} from "@/contexts/CourseFilterContext";
import { CourseCard, InstituteFilter, SortBar } from "@/components/course";
import { EmptyState } from "@/components/layout";
import { averageScore } from "@/utils/parseScore";
import type { ApiResponse, Course, SortKey, SortOrder } from "@/types";
import { ENOUGH_DATA_THRESHOLD } from "@/constants/scores";
import { Card, CardActions, CardContent, Collapse, Divider, IconButton, IconButtonProps, styled } from "@mui/material";
import { instituteNames } from "@/constants";
import { ExpandMoreSharp } from "@mui/icons-material";

const ITEMS_PER_PAGE = 12;

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}
const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: 'rotate(0deg)',
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
}));

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

interface HomeClientProps {
  initialCourses: Course[];
}

export default function HomeClient({ initialCourses }: HomeClientProps) {
  const { data } = useSWR<ApiResponse<Course[]>>(
    "/v1/course/all",
    fetcher,
    { fallbackData: { error: false, data: initialCourses } },
  );
  const { keys, isRegexp } = useSearch();
  const { page, selected, sortKey, order, includeDataInsufficient } =
    useCourseFilter();
  const dispatch = useCourseFilterDispatch();

  const [collapsed, setCollapsed] = useState<boolean>(true);

  const courses = data?.data ?? [];

  // Reset page to 1 when search input changes
  useEffect(() => {
    dispatch({ type: "SET_PAGE", payload: 1 });
  }, [keys, isRegexp, dispatch]);

  // Filter, search, sort
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Institute filter
    result = result.filter((c) =>
      selected.includes(
        instituteNames.includes(c.institute) ? c.institute : "其他学院",
      ),
    );

    // Search filter
    if (keys.trim()) {
      if (isRegexp) {
        try {
          const regex = new RegExp(keys, "i");
          result = result.filter(
            (c) => regex.test(c.name) || regex.test(c.code),
          );
        } catch {
          // Invalid regex, ignore
        }
      } else {
        const keywords = keys
          .trim()
          .split(/\s+/)
          .map((k) => k.toLowerCase())
          .filter((k) => k.length > 0);

        result = result.filter((c) => {
          const name = c.name.toLowerCase();
          const code = c.code.toLowerCase();
          return keywords.every(
            (keyword) => name.includes(keyword) || code.includes(keyword),
          );
        });
      }
    }

    // Sort
    result.sort(courseComparator(sortKey, order));

    // Data insufficiency filter
    if (!includeDataInsufficient) {
      result.sort((a, b) => {
        const aInsufficient = a.comment_num < ENOUGH_DATA_THRESHOLD;
        const bInsufficient = b.comment_num < ENOUGH_DATA_THRESHOLD;
        if (aInsufficient && !bInsufficient) return 1;
        if (!aInsufficient && bInsufficient) return -1;
        return 0;
      });
    }

    return result;
  }, [
    courses,
    selected,
    keys,
    isRegexp,
    sortKey,
    order,
    includeDataInsufficient,
  ]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const pagedCourses = filteredCourses.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ position: "sticky", top: "130px" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                排序和筛选
              </Typography>

              <SortBar
                sortKey={sortKey}
                order={order}
                onSortKeyChange={(k) =>
                  dispatch({ type: "SET_SORT_KEY", payload: k })
                }
                onOrderChange={(o) =>
                  dispatch({ type: "SET_ORDER", payload: o })
                }
                includeDataInsufficient={includeDataInsufficient}
                onIncludeDataInsufficientChange={(v) =>
                  dispatch({
                    type: "SET_INCLUDE_DATA_INSUFFICIENT",
                    payload: v,
                  })
                }
              />
            </CardContent>

            <Divider variant="middle" />

            <Collapse in={collapsed} timeout="auto" unmountOnExit>
              <CardContent>
                <InstituteFilter
                  courses={courses}
                  selected={selected}
                  onSelectedChange={(s) =>
                    dispatch({ type: "SET_SELECTED", payload: s })
                  }
                />
              </CardContent>
            </Collapse>
            <CardActions sx={{ mx: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", width: "100%" }}
              >
                共 {filteredCourses.length} 门课程
              </Typography>
              <ExpandMore
                expand={collapsed}
                onClick={() => setCollapsed((prev) => !prev)}
                aria-expanded={collapsed}
                aria-label="show more"
              >
                <ExpandMoreSharp />
              </ExpandMore>
            </CardActions>
          </Card>
        </Grid>

        {/* Main content */}
        <Grid size={{ xs: 12, md: 9 }}>
          {pagedCourses.length === 0 ? (
            <EmptyState message="没有找到匹配的课程" />
          ) : (
            <>
              <Grid container spacing={2}>
                {pagedCourses.map((course) => (
                  <Grid key={course.id} size={{ xs: 12, sm: 6 }}>
                    <CourseCard course={course} />
                  </Grid>
                ))}
              </Grid>

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
