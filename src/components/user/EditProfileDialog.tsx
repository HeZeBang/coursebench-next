"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import type { EditProfileDialogState } from "./useEditProfileDialog";
import Turnstile from "@/components/Turnstile";

interface EditProfileDialogProps extends EditProfileDialogState {
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

const GRADE_OPTIONS = [
  { value: 0, label: "暂不透露" },
  { value: 1, label: "本科" },
  { value: 2, label: "硕士" },
  { value: 3, label: "博士" },
];

const YEAR_OPTIONS = [
  { value: 0, label: "暂不透露" },
  ...Array.from({ length: 50 }, (_, i) => ({
    value: 2025 - i,
    label: `${2025 - i} 级`,
  })),
];

export default function EditProfileDialog({
  dialogOpen,
  step,
  formData,
  passwordData,
  turnstileKey,
  isLoading,
  handleClose,
  updateFormData,
  updatePasswordData,
  handleSubmitProfile,
  handleSubmitPassword,
  handleChangePassword,
  handleBack,
  maxWidth = "sm",
}: EditProfileDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen}
    >
      {step === 0 ? (
        /* ── Step 0: Edit Profile ── */
        <>
          <DialogTitle sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
            个人信息
          </DialogTitle>
          <DialogContent dividers sx={{ py: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Nickname */}
              <TextField
                fullWidth
                label="用户名"
                value={formData.nickname}
                onChange={(e) => updateFormData({ nickname: e.target.value })}
                disabled={isLoading}
                required
                inputProps={{ maxLength: 50 }}
              />

              {/* Realname */}
              <TextField
                fullWidth
                label="真实姓名"
                value={formData.realname}
                onChange={(e) => updateFormData({ realname: e.target.value })}
                disabled={isLoading}
                inputProps={{ maxLength: 50 }}
              />

              {/* Year */}
              <FormControl fullWidth disabled={isLoading}>
                <InputLabel>入学时间</InputLabel>
                <Select
                  value={formData.year}
                  onChange={(e) => updateFormData({ year: e.target.value })}
                  label="入学时间"
                >
                  {YEAR_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Grade */}
              <FormControl fullWidth disabled={isLoading}>
                <InputLabel>学段</InputLabel>
                <Select
                  value={formData.grade}
                  onChange={(e) => updateFormData({ grade: e.target.value })}
                  label="学段"
                >
                  {GRADE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Anonymity */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_anonymous}
                    onChange={(e) =>
                      updateFormData({ is_anonymous: e.target.checked })
                    }
                    disabled={isLoading}
                  />
                }
                label="默认评价时匿名"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleChangePassword}
              disabled={isLoading}
            >
              修改密码
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button onClick={handleClose} disabled={isLoading}>
              取消
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitProfile}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : "保存"}
            </Button>
          </DialogActions>
        </>
      ) : (
        /* ── Step 1: Change Password ── */
        <>
          <DialogTitle sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
            修改密码
          </DialogTitle>
          <DialogContent dividers sx={{ py: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Old Password */}
              <TextField
                fullWidth
                label="旧密码"
                type={showOldPassword ? "text" : "password"}
                value={passwordData.oldPassword}
                onChange={(e) =>
                  updatePasswordData({ oldPassword: e.target.value })
                }
                disabled={isLoading}
                variant="standard"
                required
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showOldPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* New Password */}
              <TextField
                fullWidth
                label="新密码"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  updatePasswordData({ newPassword: e.target.value })
                }
                disabled={isLoading}
                variant="standard"
                required
                autoComplete="new-password"
                helperText="密码长度至少8个字符，需包含大小写字母和数字"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showNewPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {step === 1 && (
                <Turnstile
                  key={turnstileKey}
                  onVerify={(token) => updatePasswordData({ captcha: token })}
                  onExpire={() => updatePasswordData({ captcha: "" })}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={isLoading}
            >
              返回
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button onClick={handleClose} disabled={isLoading}>
              取消
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitPassword}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : "确认修改"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
