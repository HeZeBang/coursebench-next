"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import Container from "@mui/material/Container";
import ScienceIcon from "@mui/icons-material/Science";

import { useSnackbar } from "@/contexts/SnackbarContext";
import api from "@/lib/api";
import type { FeatureMeta } from "@/flags";

interface Props {
  featureMeta: FeatureMeta[];
  flagValues: Record<string, boolean>;
  userId: number;
}

export default function LabClient({ featureMeta, flagValues, userId }: Props) {
  const showSnackbar = useSnackbar();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <ScienceIcon color="primary" />
        <Typography variant="h5" fontWeight="bold">
          实验室
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        这里展示正在测试中的实验功能。欢迎体验并提交反馈，帮助我们改进！
      </Typography>

      {featureMeta.length === 0 ? (
        <Typography color="text.secondary">暂无实验功能</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {featureMeta.map((feature) => (
            <FeatureCard
              key={feature.key}
              feature={feature}
              enabled={flagValues[feature.key] ?? false}
              userId={userId}
              showSnackbar={showSnackbar}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}

function FeatureCard({
  feature,
  enabled,
  userId,
  showSnackbar,
}: {
  feature: FeatureMeta;
  enabled: boolean;
  userId: number;
  showSnackbar: (msg: string, severity?: "success" | "error" | "warning" | "info") => void;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      showSnackbar("请先选择评分", "warning");
      return;
    }
    if (userId === 0) {
      showSnackbar("请先登录", "warning");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/v1/lab/feedback", {
        featureKey: feature.key,
        rating,
        comment: comment.trim() || null,
      });
      showSnackbar("反馈提交成功，感谢！", "success");
    } catch {
      showSnackbar("提交失败，请稍后重试", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="h6">{feature.name}</Typography>
          <Chip
            label={enabled ? "已启用" : "未启用"}
            color={enabled ? "success" : "default"}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {feature.description}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">满意度：</Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
            />
          </Box>
          <TextField
            size="small"
            multiline
            minRows={2}
            maxRows={4}
            placeholder="可选：写下你的建议或想法..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          <Box>
            <Button
              variant="contained"
              size="small"
              disableElevation
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "提交中..." : "提交反馈"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
