import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Link from "next/link";

import SchoolIcon from "@mui/icons-material/School";
import ForumIcon from "@mui/icons-material/Forum";
import BarChartIcon from "@mui/icons-material/BarChart";
import TouchAppIcon from "@mui/icons-material/TouchApp";

const features = [
  {
    icon: <SchoolIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "真实评价",
    desc: "Real Comments",
  },
  {
    icon: <ForumIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "畅所欲言",
    desc: "Free Discussion",
  },
  {
    icon: <BarChartIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "多维评分",
    desc: "Comprehensive Grading",
  },
  {
    icon: <TouchAppIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "简明易用",
    desc: "User Friendly",
  },
];

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Hero */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          fontWeight={800}
          sx={{ fontStyle: "italic", mb: 1 }}
        >
          To be the best bench.
        </Typography>
        <Typography variant="h6" color="text.secondary">
          一个真实可靠、不断完善的多维课程评价信息库
        </Typography>
      </Box>

      {/* Features */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((f) => (
          <Grid size={{ xs: 6, md: 3 }} key={f.title}>
            <Box
              sx={{ textAlign: "center", height: "100%" }}
            >
              {f.icon}
              <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
                {f.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {f.desc}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Policies */}
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          用户协议
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
          <Link href="/terms-of-service" style={{ color: "#1976d2" }}>
            用户协议
          </Link>
          <Link href="/privacy-policy" style={{ color: "#1976d2" }}>
            隐私政策
          </Link>
          <Link href="/comment-policy" style={{ color: "#1976d2" }}>
            评价规范
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
