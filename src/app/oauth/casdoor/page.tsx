"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import api from "@/lib/api";
import { setPreset } from "@/lib/cookies";
import { useAuthDispatch } from "@/contexts/AuthContext";

function CasdoorCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAuthDispatch();

  useEffect(() => {
    const returnUrl = searchParams.get("return_url") || "/";

    // Validate return_url is same-origin or relative
    const isSafe =
      returnUrl.startsWith("/") ||
      returnUrl.startsWith(window.location.origin);
    const finalUrl = isSafe ? returnUrl : "/";

    (async () => {
      try {
        // Fetch user ID
        const idRes = await api.get("/v1/user/my_id");
        const userId = idRes.data?.data?.id;
        if (!userId) throw new Error("Failed to get user ID");

        // Fetch profile
        const profileRes = await api.get(`/v1/user/profile/${userId}`);
        const profile = profileRes.data?.data;
        if (!profile) throw new Error("Failed to get profile");

        // Save cookie and update state
        setPreset(profile);
        dispatch({ type: "LOGIN", payload: profile });

        // Small delay to ensure cookie is written
        setTimeout(() => {
          router.push(finalUrl);
        }, 100);
      } catch {
        router.push("/");
      }
    })();
  }, [searchParams, router, dispatch]);

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 12,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="h6">正在完成登录…</Typography>
      </Box>
    </Container>
  );
}

export default function CasdoorCallbackPage() {
  return (
    <Suspense
      fallback={
        <Container
          maxWidth="sm"
          sx={{ py: 12, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}
        >
          <CircularProgress />
        </Container>
      }
    >
      <CasdoorCallbackContent />
    </Suspense>
  );
}
