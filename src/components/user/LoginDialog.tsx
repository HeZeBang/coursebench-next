"use client";

import { useState, useCallback } from "react";
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
import Divider from "@mui/material/Divider";

import { useSnackbar } from "@/contexts/SnackbarContext";
import { validators, validate } from "@/constants";
import api from "@/lib/api";
import { startCasdoorLogin } from "@/lib/casdoor";
import { useMediaQuery, useTheme } from "@mui/material";
import Logo from "../Logo";
import Turnstile from "@/components/Turnstile";

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
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLogin = useCallback(async () => {
    const emailErr = validate(email, validators.email);
    const passwordErr = validate(password, validators.password);

    setEmailError(emailErr || "");
    setPasswordError(passwordErr || "");

    if (emailErr || passwordErr || !turnstileToken) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/v1/user/login", {
        email,
        password,
        captcha: turnstileToken,
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
      setTurnstileToken("");
      setTurnstileKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  }, [
    email,
    password,
    turnstileToken,
    authDispatch,
    showSnackbar,
    onClose,
  ]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleLogin();
    },
    [handleLogin],
  );

  const handleReset = useCallback(() => {
    setEmail("");
    setPassword("");
    setTurnstileToken("");
    setTurnstileKey((k) => k + 1);
    setError("");
    setEmailError("");
    setPasswordError("");
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ display: "flex", flexDirection: "column" }}>
        <Logo width={100} />
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

          {open && (
            <Turnstile
              key={turnstileKey}
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
            />
          )}

          <button
            type="submit"
            style={{ display: "none" }}
            aria-hidden="true"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, flexDirection: "column", gap: 1 }}>
        <Box sx={{ width: "100%" }}>
          <Divider sx={{ mb: 1 }}>或</Divider>
          <Button fullWidth variant="outlined" onClick={startCasdoorLogin}>
            使用 GeekPie 账户登录
          </Button>
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
            <Button variant="text" onClick={handleClose}>
              取消
            </Button>
            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading || !turnstileToken}
              startIcon={loading ? <CircularProgress size={16} /> : undefined}
            >
              登录
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
