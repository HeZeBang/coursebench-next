"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import type { CourseGroup } from "@/types";

interface TeacherGroupFilterProps {
  groups: CourseGroup[];
  selectedTeachers: number[];
  onSelectedChange: (ids: number[]) => void;
}

export default function TeacherGroupFilter({
  groups,
  selectedTeachers,
  onSelectedChange,
}: TeacherGroupFilterProps) {
  const handleToggle = (teacherId: number) => {
    if (selectedTeachers.includes(teacherId)) {
      onSelectedChange(selectedTeachers.filter((id) => id !== teacherId));
    } else {
      onSelectedChange([...selectedTeachers, teacherId]);
    }
  };

  if (groups.length === 0) return null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          按教师筛选
        </Typography>
        <FormGroup>
          {groups.map((group) => {
            const teacherId = group.teachers[0]?.id ?? 0;
            const teacherName = group.teachers.map((t) => t.name).join(", ") || "未知";
            return (
              <FormControlLabel
                key={group.id}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedTeachers.includes(teacherId)}
                    onChange={() => handleToggle(teacherId)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {teacherName} ({group.comment_num})
                  </Typography>
                }
              />
            );
          })}
        </FormGroup>
      </CardContent>
    </Card>
  );
}
