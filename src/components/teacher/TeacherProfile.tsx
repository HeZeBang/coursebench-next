"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

import type { Teacher } from "@/types";
import { getInstituteColor, getInstituteAbbr } from "@/constants";

interface TeacherProfileProps {
  teacher: Teacher;
}

export default function TeacherProfile({ teacher }: TeacherProfileProps) {
  const instColor = getInstituteColor(teacher.institute);

  return (
    <Card>
      <CardContent sx={{ textAlign: "center" }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            bgcolor: instColor,
            fontSize: "2rem",
          }}
        >
          {teacher.name.charAt(0)}
        </Avatar>
        <Typography variant="h5" fontWeight={700}>
          {teacher.name}
        </Typography>
        {teacher.job && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {teacher.job}
          </Typography>
        )}
        <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 0.5 }}>
          <Chip
            label={getInstituteAbbr(teacher.institute)}
            size="small"
            sx={{ bgcolor: instColor, color: "#fff" }}
          />
        </Box>
        {teacher.introduction && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: "left" }}
          >
            {teacher.introduction}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
