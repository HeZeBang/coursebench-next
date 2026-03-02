"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import type { CourseGroup } from "@/types";
import { Chip, Collapse, Stack } from "@mui/material";
import { CheckOutlined } from "@mui/icons-material";

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
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {groups.map((group) => {
        const teacherName =
          group.teachers.map((t) => t.name).join(", ") || "未知";
        return (
          <Chip
            key={group.id}
            size="medium"
            variant={selectedGroupIds.includes(group.id) ? "filled" : "outlined"}
            onClick={() => handleToggle(group.id)}
            sx={{
              height: 'auto',
              '& .MuiChip-label': {
                display: 'block',
                whiteSpace: 'normal',
              },
            }}
            label={
              <Stack direction="row" alignItems="center" sx={{ my: 1 }}>
                <Collapse in={selectedGroupIds.includes(group.id)} orientation="horizontal">
                  <CheckOutlined sx={{ mr: 1 }}/>
                </Collapse>
                <Typography variant="body2">
                  {teacherName} ({group.comment_num})
                </Typography>
              </Stack>
            }
          />
        );
      })}
    </Stack>
  );
}
