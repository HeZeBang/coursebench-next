"use client";

import { useState, useCallback, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import { useAuthDispatch } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { validators, validate } from "@/constants";
import api from "@/lib/api";
import type { CaptchaResponse } from "@/types";
import { Grid } from "@mui/material";
import Image from "next/image";
import Logo from "../Logo";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const res = await api.post<{ data: CaptchaResponse }>(
        "/v1/user/get_captcha"
      );
      const data = (res.data as { error: boolean; data: CaptchaResponse }).data;
      setCaptchaImage(`data:image/png;base64,${data.img}`);
      setCaptcha("");
      setCaptchaError("");
    } catch {
      showSnackbar("获取验证码失败", "error");
    } finally {
      setCaptchaLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    if (open) {
      fetchCaptcha();
    }
  }, [open, fetchCaptcha]);

  const handleLogin = useCallback(async () => {
    const emailErr = validate(email, validators.email);
    const passwordErr = validate(password, validators.password);
    const captchaErr = captcha.trim() ? "" : "请输入验证码";

    setEmailError(emailErr || "");
    setPasswordError(passwordErr || "");
    setCaptchaError(captchaErr);

    if (emailErr || passwordErr || captchaErr) {
      return;
    }

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
      fetchCaptcha();
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
    fetchCaptcha,
  ]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleLogin();
    },
    [handleLogin]
  );

  const handleReset = useCallback(() => {
    setEmail("");
    setPassword("");
    setCaptcha("");
    setCaptchaImage("");
    setError("");
    setEmailError("");
    setPasswordError("");
    setCaptchaError("");
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs">
      <DialogTitle sx={{ display: "flex", flexDirection: "column"}}>
        <Logo width={100}/>
        登录
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          autoComplete="on"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            fullWidth
            label="邮箱"
            name="email"
            type="email"
            variant="standard"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError || "请使用上海科技大学邮箱"}
            autoFocus
          />

          <TextField
            fullWidth
            label="密码"
            name="password"
            type="password"
            variant="standard"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
          />

          <Grid container spacing={1}>
            <Grid size={8}>
              <TextField
                fullWidth
                label="验证码"
                name="captcha"
                variant="standard"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                error={!!captchaError}
                helperText={captchaError || "点击图片刷新验证码"}
              />
            </Grid>
            <Grid size={4} alignContent="center" overflow="hidden">
              {captchaLoading ? (
                <Box sx={{ width: 150, alignContent: "center", alignItems: "center" }}>
                  <CircularProgress size={20} />
                </Box>
              ) : captchaImage ? (
                <img
                  src={captchaImage}
                  alt="captcha"
                  style={{ width: 150, borderRadius: 4, cursor: "pointer" }}
                  onClick={fetchCaptcha}
                />
              ) : (
                <Button variant="text" sx={{ width: 150 }}>加载验证码</Button>
              )}
            </Grid>
          </Grid>

          <button type="submit" style={{ display: "none" }} aria-hidden="true" />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            没有账号？
          </Typography>
          <Link
            component="button"
            variant="caption"
            onClick={onSwitchToRegister}
            sx={{ ml: 0.5 }}
          >
            立即注册
          </Link>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={loading || captchaLoading || !captcha}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            登录
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
