"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

import ReplySection from "./ReplySection";

interface ReplyDialogProps {
  open: boolean;
  onClose: () => void;
  commentId: number;
}

/**
 * Full-screen (mobile) / max-width dialog that wraps ReplySection.
 * Opened from ReplyPreview when user clicks the reply button or featured replies.
 */
export default function ReplyDialog({
  open,
  onClose,
  commentId,
}: ReplyDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          sx: { height: fullScreen ? "100%" : "80vh" },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        全部回复
        <IconButton size="small" onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2 } }}>
        {open && <ReplySection commentId={commentId} />}
      </DialogContent>
    </Dialog>
  );
}
