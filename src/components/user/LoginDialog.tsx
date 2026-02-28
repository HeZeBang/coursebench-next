"use client";

import { useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";

import { useAuthDispatch } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { validators, validate } from "@/constants";
import api from "@/lib/api";
import type { UserProfile, CaptchaResponse } from "@/types";

const steps = ["输入邮箱", "输入密码", "验证码"];

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginDialog({
  open,
  onClose,
  onSwitchToRegister,
}: LoginDialogProps) {
  const authDispatch = useAuthDispatch();
  const showSnackbar = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Email step ──
  const [emailError, setEmailError] = useState("");
  const handleEmailNext = useCallback(() => {
    const err = validate(email, validators.email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError("");
    setActiveStep(1);
  }, [email]);

  // ── Password step ──
  const [passwordError, setPasswordError] = useState("");
  const handlePasswordNext = useCallback(async () => {
    const err = validate(password, validators.password);
    if (err) {
      setPasswordError(err);
      return;
    }
    setPasswordError("");
    // Fetch captcha
    try {
      const res = await api.post<{ data: CaptchaResponse }>(
        "/v1/user/get_captcha"
      );
      const data = (res.data as { error: boolean, data: CaptchaResponse }).data;
      setCaptchaImage(`data:image/png;base64,${data.img}`);
      setActiveStep(2);
    } catch {
      showSnackbar("获取验证码失败", "error");
    }
  }, [password, showSnackbar]);

  // ── Login ──
  const handleLogin = useCallback(async () => {
    if (!captcha) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/v1/user/login", {
        email,
        password,
        captcha,
      });
      // Get user profile
      const myIdRes = await api.get("/v1/user/my_id");
      const userId = myIdRes.data?.data?.id;
      const profileRes = await api.get(`/v1/user/profile/${userId}`);
      const profile = profileRes.data?.data;
      authDispatch({ type: "LOGIN", payload: profile });
      showSnackbar("登录成功", "success");
      handleReset();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { msg?: string } } })?.response?.data
          ?.msg ?? "登录失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [
    email,
    password,
    captcha,
    authDispatch,
    showSnackbar,
    onClose,
  ]);

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setEmail("");
    setPassword("");
    setCaptcha("");
    setCaptchaImage("");
    setError("");
    setEmailError("");
    setPasswordError("");
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>登录</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <TextField
            fullWidth
            label="邮箱"
            type="email"
            variant="filled"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError || "请使用上海科技大学邮箱"}
            onKeyDown={(e) => e.key === "Enter" && handleEmailNext()}
            autoFocus
          />
        )}

        {activeStep === 1 && (
          <TextField
            fullWidth
            label="密码"
            type="password"
            variant="filled"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            onKeyDown={(e) => e.key === "Enter" && handlePasswordNext()}
            autoFocus
          />
        )}

        {activeStep === 2 && (
          <Box>
            {captchaImage && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                  cursor: "pointer",
                }}
                onClick={handlePasswordNext}
              >
                <img
                  src={captchaImage}
                  alt="captcha"
                  style={{ height: 50, borderRadius: 4 }}
                />
              </Box>
            )}
            <TextField
              fullWidth
              label="验证码"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
              helperText="点击图片刷新验证码"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            没有账号？
            <Link
              component="button"
              variant="caption"
              onClick={onSwitchToRegister}
              sx={{ ml: 0.5 }}
            >
              立即注册
            </Link>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep((s) => s - 1)}>上一步</Button>
          )}
          {activeStep === 0 && (
            <Button variant="contained" onClick={handleEmailNext}>
              下一步
            </Button>
          )}
          {activeStep === 1 && (
            <Button variant="contained" onClick={handlePasswordNext}>
              下一步
            </Button>
          )}
          {activeStep === 2 && (
            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading || !captcha}
              startIcon={loading ? <CircularProgress size={16} /> : undefined}
            >
              登录
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
