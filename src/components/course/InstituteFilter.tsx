"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Badge from "@mui/material/Badge";

import { instituteNames, getInstituteColor } from "@/constants";
import type { Course } from "@/types";
import { Box, Button, Chip, Collapse, Stack } from "@mui/material";
import { CheckCircle, CheckOutlined } from "@mui/icons-material";
import { group } from "console";

interface InstituteFilterProps {
  courses: Course[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
}

export default function InstituteFilter({
  courses,
  selected,
  onSelectedChange,
}: InstituteFilterProps) {
  // Count courses per institute
  const instituteCounts: Record<string, number> = {};
  courses.forEach((c) => {
    const inst = instituteNames.includes(c.institute)
      ? c.institute
      : "其他学院";
    instituteCounts[inst] = (instituteCounts[inst] ?? 0) + 1;
  });

  const handleToggle = (institute: string) => {
    if (selected.includes(institute)) {
      onSelectedChange(selected.filter((s) => s !== institute));
    } else {
      onSelectedChange([...selected, institute]);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <Button
          onClick={() => {
            onSelectedChange(instituteNames);
          }}
        >
          全选
        </Button>
        <Button
          onClick={() => {
            onSelectedChange([]);
          }}
        >
          全不选
        </Button>
        <Button
          onClick={() => {
            onSelectedChange(
              instituteNames.filter((s) => !selected.includes(s)),
            );
          }}
        >
          反选
        </Button>
        {/* <Chip
          label={
            <Typography variant="body2">全选</Typography>
          }
          onClick={() => { onSelectedChange(instituteNames) }}
        />
        <Chip
          label={
            <Typography variant="body2">全不选</Typography>
          }
          onClick={() => { onSelectedChange([]) }}
        />
        <Chip
          label={
            <Typography variant="body2">反选</Typography>
          }
          onClick={() => { onSelectedChange(instituteNames.filter((s) => !selected.includes(s))) }}
        /> */}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {instituteNames.map((inst) => (
          <Chip
            key={inst}
            icon={
              <Collapse in={selected.includes(inst)} orientation="horizontal">
                <CheckOutlined
                  sx={{
                    backgroundColor: getInstituteColor(inst),
                    color: "white",
                    borderRadius: "50%",
                  }}
                />
              </Collapse>
            }
            label={<Typography variant="body2">{inst}</Typography>}
            variant={selected.includes(inst) ? "filled" : "outlined"}
            onClick={() => handleToggle(inst)}
            sx={{ width: "min-content" }}
          />
        ))}
      </Box>
    </>
  );
}
