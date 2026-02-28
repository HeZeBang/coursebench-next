import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "next/link";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

export default function NotFound() {
  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 12,
        textAlign: "center",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SentimentDissatisfiedIcon
        sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
      />
      <Typography variant="h3" fontWeight={800} gutterBottom>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        页面不存在
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Link href="/" style={{ fontWeight: 600, fontSize: "1rem", color: "#1976d2", textDecoration: "none" }}>
          返回首页
        </Link>
      </Box>
    </Container>
  );
}
