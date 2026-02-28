import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";

interface EmptyStateProps {
  message?: string;
  title?: string;
}

/**
 * Empty state placeholder component.
 * Replaces the old Nothing.vue.
 */
export default function EmptyState({
  message = "这里什么都没有...",
  title,
}: EmptyStateProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <Alert severity="info" variant="outlined" sx={{ maxWidth: 400 }}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Box>
  );
}
