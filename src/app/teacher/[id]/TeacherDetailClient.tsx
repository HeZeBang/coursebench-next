"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import { TeacherProfile, TeacherCourseCard } from "@/components/teacher";
import EmptyState from "@/components/layout/EmptyState";
import {
  getInstituteColor,
} from "@/constants";
import type { ApiResponse, Teacher } from "@/types";

interface TeacherDetailClientProps {
  teacherId: number;
  initialTeacher: Teacher;
}

export default function TeacherDetailClient({
  teacherId,
  initialTeacher,
}: TeacherDetailClientProps) {
  const { data } = useSWR<ApiResponse<Teacher>>(
    `/v1/teacher/${teacherId}`,
    fetcher,
    { fallbackData: { error: false, data: initialTeacher } },
  );

  const [selectedInstitutes, setSelectedInstitutes] = useState<string[]>([]);

  const teacher = data?.data;
  const courses = teacher?.courses ?? [];

  const instituteStats = useMemo(() => {
    const stats = new Map<string, number>();
    courses.forEach((c) => {
      stats.set(c.institute, (stats.get(c.institute) || 0) + 1);
    });
    return stats;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (selectedInstitutes.length === 0) return courses;
    return courses.filter((c) => selectedInstitutes.includes(c.institute));
  }, [courses, selectedInstitutes]);

  const handleInstituteToggle = (inst: string) => {
    setSelectedInstitutes((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst],
    );
  };

  if (!teacher) return null;

  const instColor = getInstituteColor(teacher.institute);

  return (
    <>
      <Box
        sx={{
          height: 120,
          bgcolor: instColor,
        }}
      />

      <Container maxWidth="lg" sx={{ mt: -6, pb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TeacherProfile teacher={teacher} />

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
