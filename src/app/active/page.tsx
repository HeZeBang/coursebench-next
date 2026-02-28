"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

import api from "@/lib/api";

function ActiveContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    const code = searchParams.get("code");

    if (!id || !code) {
      setStatus("error");
      setErrorMsg("链接参数无效");
      return;
    }

    api
      .post("/v1/user/register_active", {
        id: Number(id),
        code,
      })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setErrorMsg(
          err.response?.data?.msg || err.message || "激活失败，请重试"
        );
      });
  }, [searchParams]);

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
          {status === "loading" && (
            <>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="h6">正在验证中…</Typography>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircleIcon
                color="success"
                sx={{ fontSize: 64, mb: 2 }}
              />
              <Typography variant="h6" fontWeight={600}>
                电子邮箱验证成功！
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                你现在可以登录了
              </Typography>
            </>
          )}
          {status === "error" && (
            <>
              <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" fontWeight={600}>
                验证失败
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
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={() => router.push("/")}>
              返回首页
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default function ActivePage() {
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
      <ActiveContent />
    </Suspense>
  );
}