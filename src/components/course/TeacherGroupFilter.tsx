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
  selectedGroupIds: number[];
  onSelectedChange: (ids: number[]) => void;
}

export default function TeacherGroupFilter({
  groups,
  selectedGroupIds,
  onSelectedChange,
}: TeacherGroupFilterProps) {
  const handleToggle = (groupId: number) => {
    if (selectedGroupIds.includes(groupId)) {
      onSelectedChange(selectedGroupIds.filter((id) => id !== groupId));
    } else {
      onSelectedChange([...selectedGroupIds, groupId]);
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
            const teacherName = group.teachers.map((t) => t.name).join(", ") || "未知";
            return (
              <FormControlLabel
                key={group.id}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedGroupIds.includes(group.id)}
                    onChange={() => handleToggle(group.id)}
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
