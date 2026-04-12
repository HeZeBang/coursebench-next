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

import Divider from "@mui/material/Divider";

import { useSnackbar } from "@/contexts/SnackbarContext";
import { validators, validate, gradeItems, yearItems } from "@/constants";
import api from "@/lib/api";
import { startCasdoorLogin } from "@/lib/casdoor";
import Logo from "../Logo";
import Turnstile from "@/components/Turnstile";
import { useMediaQuery, useTheme } from "@mui/material";

const steps = ["邮箱", "密码", "个人信息", "确认"];

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
  const [turnstileToken, setTurnstileToken] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Errors
  const [emailError, setEmailError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  // Step 2 → password
  const handlePasswordNext = useCallback(() => {
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
    setActiveStep(2);
  }, [password, confirmPassword, showSnackbar]);

  // Step 2 → personal info
  const handleInfoNext = useCallback(() => {
    const err = validate(nickname, validators.nickname);
    if (err) {
      setNicknameError(err);
      return;
    }
    setNicknameError("");
    setActiveStep(3);
  }, [nickname]);

  // Step 3 → register
  const handleRegister = useCallback(async () => {
    if (!turnstileToken || !acceptTerms) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/v1/user/register", {
        email,
        password,
        nickname,
        grade,
        year,
        captcha: turnstileToken,
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
    turnstileToken,
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
    setTurnstileToken("");
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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ display: "flex", flexDirection: "column" }}>
        <Logo width={100} />
        注册
      </DialogTitle>
      <DialogContent>
        <Stepper
          activeStep={activeStep}
          sx={{ mb: 3 }}
          alternativeLabel={fullScreen}
        >
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
            variant="standard"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError || "请使用上海科技大学邮箱"}
            onKeyDown={(e) => e.key === "Enter" && handleEmailNext()}
            autoFocus
          />
        )}

        {/* Step 1: Password */}
        {activeStep === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="密码"
              type="password"
              autoComplete="new-password"
              variant="standard"
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
              autoComplete="new-password"
              variant="standard"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordNext()}
            />
          </Box>
        )}

        {/* Step 2: Personal info */}
        {activeStep === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="用户名"
              variant="standard"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              error={!!nicknameError}
              helperText={nicknameError || "3-16位中文、字母、数字、下划线"}
              autoFocus
            />
            <FormControl fullWidth>
              <InputLabel variant="standard">年级</InputLabel>
              <Select
                value={grade}
                variant="standard"
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
              <InputLabel variant="standard">入学年份</InputLabel>
              <Select
                value={year}
                variant="standard"
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
              variant="standard"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              helperText="5位字母数字"
            />
          </Box>
        )}

        {/* Step 3: Turnstile + terms */}
        {activeStep === 3 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Turnstile
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
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

      <DialogActions sx={{ px: 3, pb: 2, flexDirection: "column", gap: 1 }}>
        <Box sx={{ width: "100%" }}>
          <Divider sx={{ mb: 1 }}>或</Divider>
          <Button fullWidth variant="outlined" onClick={startCasdoorLogin}>
            使用 GeekPie 账户注册
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
              已有账号？
            </Typography>
            <Link
              component="button"
              variant="caption"
              onClick={onSwitchToLogin}
              sx={{ ml: 0.5 }}
            >
              立即登录
            </Link>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {activeStep > 0 ? (
              <Button onClick={() => setActiveStep((s) => s - 1)}>上一步</Button>
            ) : (
              <Button variant="text" onClick={handleClose}>
                取消
              </Button>
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
              <Button variant="contained" onClick={handleInfoNext}>
                下一步
              </Button>
            )}
            {activeStep === 3 && (
              <Button
                variant="contained"
                onClick={handleRegister}
                disabled={loading || !turnstileToken || !acceptTerms}
                startIcon={loading ? <CircularProgress size={16} /> : undefined}
              >
                注册
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
