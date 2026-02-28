"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert, { type AlertColor } from "@mui/material/Alert";

// ── Types ──
interface SnackbarMessage {
  message: string;
  severity: AlertColor;
}

type ShowSnackbar = (message: string, severity?: AlertColor) => void;

// ── Context ──
const SnackbarContext = createContext<ShowSnackbar>(() => {});

// ── Provider ──
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [snack, setSnack] = useState<SnackbarMessage>({
    message: "",
    severity: "info",
  });

  const showSnackbar: ShowSnackbar = useCallback(
    (message, severity = "info") => {
      setSnack({ message, severity });
      setOpen(true);
    },
    []
  );

  const handleClose = useCallback(
    (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") return;
      setOpen(false);
    },
    []
  );

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

// ── Hook ──
export function useSnackbar() {
  return useContext(SnackbarContext);
}
