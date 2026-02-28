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
    const inst = c.institute || "其他学院";
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
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          按学院筛选
        </Typography>
        <FormGroup>
          {instituteNames.map((inst) => {
            const count = instituteCounts[inst] ?? 0;
            if (count === 0) return null;
            return (
              <FormControlLabel
                key={inst}
                control={
                  <Checkbox
                    checked={selected.includes(inst)}
                    onChange={() => handleToggle(inst)}
                    size="small"
                    sx={{
                      color: getInstituteColor(inst),
                      "&.Mui-checked": { color: getInstituteColor(inst) },
                    }}
                  />
                }
                label={
                  <Badge
                    badgeContent={count}
                    color="default"
                    max={999}
                    sx={{
                      "& .MuiBadge-badge": {
                        position: "relative",
                        transform: "none",
                        ml: 1,
                        fontSize: "0.7rem",
                      },
                    }}
                  >
                    <Typography variant="body2">{inst}</Typography>
                  </Badge>
                }
              />
            );
          })}
        </FormGroup>
      </CardContent>
    </Card>
  );
}
