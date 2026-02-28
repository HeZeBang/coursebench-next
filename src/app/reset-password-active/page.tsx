"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import api from "@/lib/api";

function ResetPasswordActiveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<
    "input" | "loading" | "success" | "error"
  >("input");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const id = searchParams.get("id");
  const code = searchParams.get("code");

  useEffect(() => {
    if (!id || !code) {
      setStatus("error");
      setErrorMsg("链接参数无效");
    }
  }, [id, code]);

  const handleSubmit = useCallback(async () => {
    // Validate password: 8-16 chars, must contain letter + digit
    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,16}$/.test(password)) {
      setErrorMsg("密码需包含字母和数字，长度 8-16 位");
      return;
    }

    setStatus("loading");
    try {
      await api.post("/v1/user/reset_password_active", {
        id: Number(id),
        code,
        password,
      });
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(
        err.response?.data?.msg || err.message || "重置失败，请重试"
      );
    }
  }, [password, id, code]);

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 8,
        display: "flex",
        justifyContent: "center",
        minHeight: "60vh",
        alignItems: "center",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 440 }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          {status === "input" && (
            <>
              <VpnKeyIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                设置新密码
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="新密码"
                placeholder="8-16 位，包含字母和数字"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                error={!!errorMsg}
                helperText={errorMsg}
                sx={{ mt: 2, mb: 2, maxWidth: 300, mx: "auto" }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                autoFocus
              />
              <Box>
                <Button variant="contained" onClick={handleSubmit}>
                  确认重置
                </Button>
              </Box>
            </>
          )}
          {status === "loading" && (
            <>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="h6">正在重置密码…</Typography>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircleIcon
                color="success"
                sx={{ fontSize: 64, mb: 2 }}
              />
              <Typography variant="h6" fontWeight={600}>
                密码重置成功！
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                请使用新密码登录
              </Typography>
            </>
          )}
          {status === "error" && (
            <>
              <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" fontWeight={600}>
                重置失败
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {errorMsg}
              </Typography>
            </>
          )}
          {(status === "success" || (status === "error" && !id)) && (
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" onClick={() => router.push("/")}>
                返回首页
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default function ResetPasswordActivePage() {
  return (
    <Suspense
      fallback={
        <Container
          maxWidth="sm"
          sx={{ py: 8, display: "flex", justifyContent: "center", minHeight: "60vh", alignItems: "center" }}
        >
          <CircularProgress />
        </Container>
      }
    >
      <ResetPasswordActiveContent />
    </Suspense>
  );
}
