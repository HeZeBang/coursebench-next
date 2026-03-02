"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";

import type { UserProfile } from "@/types";
import { getUserDisplayName } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import { startCasdoorBind } from "@/lib/casdoor";
import { Stack } from "@mui/material";
import { useEditProfileDialog } from "./useEditProfileDialog";
import EditProfileDialog from "./EditProfileDialog";
import UserAvatar from "./UserAvatar";

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
  const { userProfile: selfProfile } = useAuth();
  const isSelf = selfProfile?.id === user.id;

  const editProfileDialog = useEditProfileDialog();

  return (
    <>
      <Card>
        <CardContent sx={{ textAlign: "center" }}>
          <UserAvatar
            userProfile={user}
            size={100}
            sx={{
              mx: "auto",
              mb: 2,
            }}
          />
          <Typography variant="h5" fontWeight={700}>
            {getUserDisplayName(user)}
          </Typography>
          {user.realname && (
            <Typography variant="body1" color="text.secondary">
              {user.realname}
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary"
            sx={{
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {user.email}
          </Typography>
          <Box
            sx={{
              mt: 1,
              display: "flex",
              justifyContent: "center",
              gap: 0.5,
              flexWrap: "wrap",
            }}
          >
            {gradeLabel && (
              <Chip label={gradeLabel} size="small" variant="outlined" />
            )}
            {user.year > 0 && (
              <Chip label={`${user.year} 级`} size="small" variant="outlined" />
            )}
          </Box>

          {/* Actions (self only) */}
          {isSelf && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* Edit Profile Button */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={editProfileDialog.handleOpen}
                fullWidth
              >
                个人设置
              </Button>

              {/* GeekPie account binding status */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {user.has_casdoor_bound ? (
                  <CheckCircleIcon fontSize="small" color="success" />
                ) : (
                  <CancelIcon fontSize="small" color="disabled" />
                )}
                <Typography variant="body2" color="text.secondary">
                  GeekPie 账户：{user.has_casdoor_bound ? "已关联" : "未关联"}
                </Typography>
              </Box>
              {!user.has_casdoor_bound && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={startCasdoorBind}
                  fullWidth
                >
                  绑定 GeekPie 账户
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <EditProfileDialog {...editProfileDialog} />
    </>
  );
}
