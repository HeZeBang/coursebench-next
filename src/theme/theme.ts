"use client";

import { createTheme, type PaletteMode } from "@mui/material/styles";

// Create theme based on mode (light or dark)
export const getTheme = (mode: PaletteMode) => {
  return createTheme({
    cssVariables: true,
    palette: {
      mode,
      primary: {
        main: "#1976d2",
        light: "#42a5f5",
        dark: "#1565c0",
      },
      secondary: {
        main: "#9c27b0",
        light: "#ba68c8",
        dark: "#7b1fa2",
      },
      error: {
        main: "#d32f2f",
      },
      warning: {
        main: "#ed6c02",
      },
      success: {
        main: "#2e7d32",
      },
      ...(mode === "light"
        ? {
            background: {
              default: "#fafafa",
              paper: "#ffffff",
            },
          }
        : {
            background: {
              default: "#121212",
              paper: "#1e1e1e",
            },
          }),
    },
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Noto Sans SC"',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
      ].join(","),
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiCard: {
        defaultProps: {
          elevation: 1,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 1,
        },
      },
    },
  });
};

// Default light theme export for compatibility
const theme = getTheme("light");
export default theme;
