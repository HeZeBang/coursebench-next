"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import ScienceIcon from "@mui/icons-material/Science";

const BANNER_VERSION = "1";

export default function NewFeatureBanner() {
  const [visible, setVisible] = useState(false);
  const storageKey = `dismissed-banner-${BANNER_VERSION}`;

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) setVisible(true);
  }, [storageKey]);

  if (!visible) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "1");
    setVisible(false);
  };

  return (
    <Alert
      severity="info"
      variant="filled"
      icon={<ScienceIcon />}
      onClose={handleDismiss}
      action={
        <Button
          color="inherit"
          size="small"
          component={Link}
          href="/lab"
        >
          去看看
        </Button>
      }
      sx={{ borderRadius: 0 }}
    >
      有新的实验功能可以体验！前往实验室查看并提交反馈。
    </Alert>
  );
}
