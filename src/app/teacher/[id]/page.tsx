"use client";

import { use, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

import { TeacherProfile, TeacherCourseCard } from "@/components/teacher";
import EmptyState from "@/components/layout/EmptyState";
import { useTeacher } from "@/hooks";
import {
  getInstituteColor,
  getInstituteAbbr,
  instituteInfo,
} from "@/constants";

export default function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, error, isLoading } = useTeacher(Number(id));
  const [selectedInstitutes, setSelectedInstitutes] = useState<string[]>([]);

  const teacher = data?.data;
  const courses = teacher?.courses ?? [];

  // Compute institute statistics
  const instituteStats = useMemo(() => {
    const stats = new Map<string, number>();
    courses.forEach((c) => {
      stats.set(c.institute, (stats.get(c.institute) || 0) + 1);
    });
    return stats;
  }, [courses]);

  // Filter courses by selected institutes
  const filteredCourses = useMemo(() => {
    if (selectedInstitutes.length === 0) return courses;
    return courses.filter((c) => selectedInstitutes.includes(c.institute));
  }, [courses, selectedInstitutes]);

  const handleInstituteToggle = (inst: string) => {
    setSelectedInstitutes((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst],
    );
  };

  if (isLoading) {
    return (
      <>
        {/* Banner skeleton */}
        <Box sx={{ height: 120, bgcolor: "grey.300" }} />
        <Container maxWidth="lg" sx={{ mt: -6, pb: 4 }}>
          <Grid container spacing={3}>
            {/* TeacherProfile skeleton */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Skeleton variant="circular" width={80} height={80} sx={{ mx: "auto", mb: 2 }} />
                  <Skeleton variant="text" width="60%" height={32} sx={{ mx: "auto" }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mx: "auto", mt: 0.5 }} />
                  <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
                    <Skeleton variant="rounded" width={80} height={24} />
                  </Box>
                  <Skeleton variant="text" width="90%" height={18} sx={{ mt: 2 }} />
                  <Skeleton variant="text" width="70%" height={18} />
                </CardContent>
              </Card>
              {/* Statistics skeleton */}
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                      <Skeleton variant="rounded" width={20} height={20} sx={{ mr: 1 }} />
                      <Skeleton variant="text" width={`${50 + i * 10}%`} height={24} />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            {/* TeacherCourseCard skeletons */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Grid container spacing={2}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <Card variant="outlined">
                      <CardContent>
                        {/* Name + code + rating */}
                        <Skeleton variant="text" width="70%" height={24} />
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <Skeleton variant="text" width={60} height={16} />
                          <Skeleton variant="rounded" width={80} height={16} />
                        </Box>
                        {/* Score grid 2x2 */}
                        <Box sx={{ display: "grid", gap: 0.5, gridTemplateColumns: "repeat(2, 1fr)", my: 1 }}>
                          {Array.from({ length: 4 }).map((_, j) => (
                            <Box key={j} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Skeleton variant="text" width={36} height={14} />
                              <Skeleton variant="rounded" width={32} height={16} />
                            </Box>
                          ))}
                        </Box>
                        {/* Chips */}
                        <Box sx={{ display: "flex", gap: 0.5, mt: 2 }}>
                          <Skeleton variant="rounded" width={36} height={20} />
                          <Skeleton variant="rounded" width={48} height={20} />
                          <Skeleton variant="rounded" width={48} height={20} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </>
    );
  }

  if (error || !teacher) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">教师信息加载失败</Alert>
      </Container>
    );
  }

  const instColor = getInstituteColor(teacher.institute);

  return (
    <>
      {/* Banner */}
      <Box
        sx={{
          height: 120,
          bgcolor: instColor,
        }}
      />

      <Container maxWidth="lg" sx={{ mt: -6, pb: 4 }}>
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <TeacherProfile teacher={teacher} />

            {/* Statistics */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  开课统计 ({courses.length})
                </Typography>
                <FormGroup>
                  {Array.from(instituteStats.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([inst, count]) => (
                      <FormControlLabel
                        key={inst}
                        control={
                          <Checkbox
                            size="small"
                            checked={
                              selectedInstitutes.length === 0 ||
                              selectedInstitutes.includes(inst)
                            }
                            onChange={() => handleInstituteToggle(inst)}
                            sx={{
                              color: getInstituteColor(inst),
                              "&.Mui-checked": {
                                color: getInstituteColor(inst),
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2">
                            {inst} ({count})
                          </Typography>
                        }
                      />
                    ))}
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>

          {/* Courses grid */}
          <Grid size={{ xs: 12, md: 9 }}>
            {filteredCourses.length === 0 ? (
              <EmptyState message="暂无课程数据" />
            ) : (
              <Grid container spacing={2}>
                {filteredCourses.map((course) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
                    <TeacherCourseCard course={course} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
