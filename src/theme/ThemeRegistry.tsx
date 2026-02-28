"use client";

import { useMemo, type ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeModeProvider, useThemeMode } from "@/contexts/ThemeModeContext";
import { getTheme } from "./theme";

interface ThemeRegistryProps {
  children: ReactNode;
}

function ThemeContent({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  // MUI + Emotion cache for App Router SSR
  return (
    <AppRouterCacheProvider options={{ key: "mui", enableCssLayer: true }}>
      <ThemeModeProvider>
        <ThemeContent>{children}</ThemeContent>
      </ThemeModeProvider>
    </AppRouterCacheProvider>
  );
}
