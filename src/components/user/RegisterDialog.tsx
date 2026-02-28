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
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import { useSnackbar } from "@/contexts/SnackbarContext";
import { validators, validate, gradeItems, yearItems } from "@/constants";
import api from "@/lib/api";
import type { CaptchaResponse } from "@/types";

const steps = ["邮箱", "个人信息", "密码", "验证码"];

interface RegisterDialogProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterDialog({
  open,
  onClose,
  onSwitchToLogin,
}: RegisterDialogProps) {
  const showSnackbar = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState(0);
  const [year, setYear] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Errors
  const [emailError, setEmailError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Step 0 → email
  const handleEmailNext = useCallback(() => {
    const err = validate(email, validators.email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError("");
    setActiveStep(1);
  }, [email]);

  // Step 1 → personal info
  const handleInfoNext = useCallback(() => {
    const err = validate(nickname, validators.nickname);
    if (err) {
      setNicknameError(err);
      return;
    }
    setNicknameError("");
    setActiveStep(2);
  }, [nickname]);

  // Step 2 → password
  const handlePasswordNext = useCallback(async () => {
    const err = validate(password, validators.password);
    if (err) {
      setPasswordError(err);
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("两次输入的密码不一致");
      return;
    }
    setPasswordError("");
    // Fetch captcha
    try {
      const res = await api.post("/v1/user/get_captcha");
      const data = (res.data as { data: CaptchaResponse }).data;
      setCaptchaId(data.captcha_id);
      setCaptchaImage(data.captcha_image);
      setActiveStep(3);
    } catch {
      showSnackbar("获取验证码失败", "error");
    }
  }, [password, confirmPassword, showSnackbar]);

  // Step 3 → register
  const handleRegister = useCallback(async () => {
    if (!captcha || !acceptTerms) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/v1/user/register", {
        email,
        password,
        nickname,
        grade,
        year,
        captcha,
        captcha_id: captchaId,
        invitation_code: invitationCode || undefined,
      });
      showSnackbar("注册成功！请查收激活邮件", "success");
      handleReset();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { msg?: string } } })?.response?.data
          ?.msg ?? "注册失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [
    email,
    password,
    nickname,
    grade,
    year,
    captcha,
    captchaId,
    invitationCode,
    acceptTerms,
    showSnackbar,
    onClose,
  ]);

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setEmail("");
    setNickname("");
    setGrade(0);
    setYear(0);
    setPassword("");
    setConfirmPassword("");
    setInvitationCode("");
    setCaptcha("");
    setCaptchaId("");
    setCaptchaImage("");
    setAcceptTerms(false);
    setError("");
    setEmailError("");
    setNicknameError("");
    setPasswordError("");
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>注册</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }} alternativeLabel>
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

        {/* Step 0: Email */}
        {activeStep === 0 && (
          <TextField
            fullWidth
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError || "请使用上海科技大学邮箱"}
            onKeyDown={(e) => e.key === "Enter" && handleEmailNext()}
            autoFocus
          />
        )}

        {/* Step 1: Personal info */}
        {activeStep === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="用户名"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              error={!!nicknameError}
              helperText={nicknameError || "3-16位中文、字母、数字、下划线"}
              autoFocus
            />
            <FormControl fullWidth>
              <InputLabel>年级</InputLabel>
              <Select
                value={grade}
                label="年级"
                onChange={(e) => setGrade(Number(e.target.value))}
              >
                {gradeItems.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>入学年份</InputLabel>
              <Select
                value={year}
                label="入学年份"
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {yearItems.map((item) => (
                  <MenuItem key={String(item.value)} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="邀请码（可选）"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              helperText="5位字母数字"
            />
          </Box>
        )}

        {/* Step 2: Password */}
        {activeStep === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError || "8-16位，须包含字母和数字"}
              autoFocus
            />
            <TextField
              fullWidth
              label="确认密码"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordNext()}
            />
          </Box>
        )}

        {/* Step 3: Captcha + terms */}
        {activeStep === 3 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {captchaImage && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
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
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              autoFocus
              helperText="点击图片刷新验证码"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  我已阅读并同意{" "}
                  <Link href="/terms-of-service" target="_blank">
                    服务条款
                  </Link>{" "}
                  和{" "}
                  <Link href="/privacy-policy" target="_blank">
                    隐私政策
                  </Link>
                </Typography>
              }
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            已有账号？
            <Link
              component="button"
              variant="caption"
              onClick={onSwitchToLogin}
              sx={{ ml: 0.5 }}
            >
              立即登录
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
            <Button variant="contained" onClick={handleInfoNext}>
              下一步
            </Button>
          )}
          {activeStep === 2 && (
            <Button variant="contained" onClick={handlePasswordNext}>
              下一步
            </Button>
          )}
          {activeStep === 3 && (
            <Button
              variant="contained"
              onClick={handleRegister}
              disabled={loading || !captcha || !acceptTerms}
              startIcon={loading ? <CircularProgress size={16} /> : undefined}
            >
              注册
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
