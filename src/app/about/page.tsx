import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import MuiLink from "@mui/material/Link";

import SchoolIcon from "@mui/icons-material/School";
import ForumIcon from "@mui/icons-material/Forum";
import BarChartIcon from "@mui/icons-material/BarChart";
import TouchAppIcon from "@mui/icons-material/TouchApp";

import { parseAvatarUrl, parseHomeUrl } from "@/utils/parseContributorLink";
import contributorsData from "@/assets/contributors.json";
import v1ContributorsData from "@/assets/contributors.old.json";
import sponsorsData from "@/assets/sponsors.json";

interface Contributor {
  name: string;
  home: string;
  avatar: string;
  role: string;
}

interface Sponsor {
  name: string;
  home: string;
  avatar: string;
  role?: string;
}

const contributors = contributorsData as Contributor[];
const v1Contributors = v1ContributorsData as Contributor[];
const sponsors = sponsorsData as {
  cooperations: Sponsor[];
  individuals: Sponsor[];
};

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

      {/* Contributors */}
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          V2 开发人员
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
          {contributors.map((c) => (
            <Box
              key={c.name}
              sx={{ display: "flex", alignItems: "center", gap: 1, pr: 2 }}
            >
              <Avatar
                src={parseAvatarUrl(c.avatar)}
                alt={c.name}
                sx={{ width: 32, height: 32 }}
              >
                {c.name[0]}
              </Avatar>
              <Box>
                <Typography variant="caption" fontWeight={600} display="block" lineHeight={1.2}>
                  {c.role}
                </Typography>
                <MuiLink
                  href={parseHomeUrl(c.home)}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="text.primary"
                  variant="body2"
                >
                  {c.name}
                </MuiLink>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* V1 Contributors */}
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          V1 开发人员
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          感谢所有曾为 CourseBench 做出贡献的成员！
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {v1Contributors.map((c) => (
            <Box
              key={c.name}
              sx={{ display: "flex", alignItems: "center", gap: 1, pr: 2 }}
            >
              <Avatar
                src={parseAvatarUrl(c.avatar)}
                alt={c.name}
                sx={{ width: 32, height: 32 }}
              >
                {c.name[0]}
              </Avatar>
              <Box>
                <Typography variant="caption" fontWeight={600} display="block" lineHeight={1.2}>
                  {c.role}
                </Typography>
                <MuiLink
                  href={parseHomeUrl(c.home)}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="text.primary"
                  variant="body2"
                >
                  {c.name}
                </MuiLink>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Sponsors */}
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          友情赞助
        </Typography>

        {/* Cooperation sponsors (with logos) */}
        {sponsors.cooperations.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, mt: 2 }}>
            {sponsors.cooperations.map((s) => (
              <Box
                key={s.name}
                sx={{ display: "flex", alignItems: "center", gap: 1, pr: 2 }}
              >
                <Avatar
                  src={parseAvatarUrl(s.avatar)}
                  alt={s.name}
                  sx={{ width: 32, height: 32 }}
                >
                  {s.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="caption" fontWeight={600} display="block" lineHeight={1.2}>
                    {s.role}
                  </Typography>
                  <MuiLink
                    href={parseHomeUrl(s.home)}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    color="text.primary"
                    variant="body2"
                  >
                    {s.name}
                  </MuiLink>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Individual sponsors */}
        {sponsors.individuals.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 2,
              mt: 3,
              maxWidth: 340,
              mx: "auto",
            }}
          >
            {sponsors.individuals.map((s) => (
              <Box
                key={s.name}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Avatar
                  src={parseAvatarUrl(s.avatar)}
                  alt={s.name}
                  sx={{ width: 32, height: 32 }}
                >
                  {s.name[0]}
                </Avatar>
                <MuiLink
                  href={parseHomeUrl(s.home)}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="text.primary"
                  variant="body2"
                >
                  {s.name}
                </MuiLink>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* <Divider sx={{ my: 4 }} /> */}

      {/* Support Us */}
      {/* <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          支持我们
        </Typography>
        <Typography variant="body2" color="text.secondary">
          如果您觉得我们的网站对您有帮助，您可以通过赞助来支持我们。
        </Typography>
      </Box> */}

      <Divider sx={{ my: 4 }} />

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
          {/* <Link href="/comment-policy" style={{ color: "#1976d2" }}>
            评价规范
          </Link> */}
        </Box>
      </Box>
    </Container>
  );
}
