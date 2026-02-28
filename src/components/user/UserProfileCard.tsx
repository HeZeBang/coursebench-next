"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

import type { UserProfile } from "@/types";
import { getUserDisplayName } from "@/utils";

const gradeLabels: Record<number, string> = {
  1: "本科",
  2: "硕士",
  3: "博士",
};

interface UserProfileCardProps {
  user: UserProfile;
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const gradeLabel = gradeLabels[user.grade] ?? "";

  return (
    <Card>
      <CardContent sx={{ textAlign: "center" }}>
        <Avatar
          src={user.avatar || undefined}
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            bgcolor: "primary.main",
            fontSize: "2rem",
          }}
        >
          {getUserDisplayName(user).charAt(0)}
        </Avatar>
        <Typography variant="h5" fontWeight={700}>
          {getUserDisplayName(user)}
        </Typography>
        {user.realname && (
          <Typography variant="body2" color="text.secondary">
            {user.realname}
          </Typography>
        )}
        <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 0.5, flexWrap: "wrap" }}>
          {gradeLabel && (
            <Chip label={gradeLabel} size="small" variant="outlined" />
          )}
          {user.year > 0 && (
            <Chip label={`${user.year} 级`} size="small" variant="outlined" />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
