"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";

export default function Footer() {
  const version = process.env.NEXT_PUBLIC_VERSION ?? "dev";
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE ?? "";

  return (
    <Box component="footer" sx={{ mt: "auto", py: 3 }}>
      <Divider />
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()}{" "}
          <Link href="/" color="inherit" underline="hover">
            CourseBench
          </Link>
          {" · "}v{version}
          {buildDate && ` · ${buildDate}`}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
          sx={{ mt: 0.5 }}
        >
          To be the best bench.
        </Typography>
      </Container>
    </Box>
  );
}
