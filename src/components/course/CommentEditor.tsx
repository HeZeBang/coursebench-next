"use client";

import { useState, useCallback, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";

import {
  judgeItems,
  gradingInfo,
  gradingEmojis,
  termItems,
  rawYearItems,
} from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import api from "@/lib/api";
import type { CourseGroup, Comment } from "@/types";
import MdxRenderer from "@/components/mdx/MdxRenderer";
import { serializeMdx } from "@/lib/mdx";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

interface CommentEditorProps {
  courseId: number;
  groups: CourseGroup[];
  /** If provided, the editor is in "edit" mode */
  existingComment?: Comment;
  onSuccess: () => void;
}

export default function CommentEditor({
  courseId,
  groups,
  existingComment,
  onSuccess,
}: CommentEditorProps) {
  const { isLogin } = useAuth();
  const showSnackbar = useSnackbar();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0); // 0: edit, 1: preview

  // Form fields
  const [title, setTitle] = useState(existingComment?.title ?? "");
  const [content, setContent] = useState(existingComment?.content ?? "");
  const [scores, setScores] = useState<number[]>(
    existingComment?.score ?? [3, 3, 3, 3],
  );
  const [groupId, setGroupId] = useState(existingComment?.group?.id ?? 0);
  const [semester, setSemester] = useState(
    existingComment?.semester ? String(existingComment.semester) : "",
  );
  const [isAnonymous, setIsAnonymous] = useState(
    existingComment?.is_anonymous ?? true,
  );
  const [previewContent, setPreviewContent] =
    useState<MDXRemoteSerializeResult | null>(null);

  // Serialize markdown for preview when content or tab changes
  useEffect(() => {
    if (tab === 1 && content) {
      serializeMdx(content)
        .then(setPreviewContent)
        .catch(() => setPreviewContent(null));
    }
  }, [content, tab]);

  const handleScoreChange = useCallback(
    (index: number, value: number) => {
      const newScores = [...scores];
      newScores[index] = value;
      setScores(newScores);
    },
    [scores],
  );

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      setError("请输入评价内容");
      return;
    }
    if (groupId === 0) {
      setError("请选择教师");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const endpoint = existingComment
        ? "/v1/comment/update"
        : "/v1/comment/post";
      const payload = {
        ...(existingComment ? { comment_id: existingComment.id } : {}),
        course_id: courseId,
        group_id: groupId,
        title,
        content,
        score: scores,
        semester: semester ? Number(semester) : 0,
        is_anonymous: isAnonymous,
      };
      await api.post(endpoint, payload);
      showSnackbar(existingComment ? "评价已更新" : "评价发布成功", "success");
      setOpen(false);
      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { msg?: string } } })?.response?.data
          ?.msg ?? "操作失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [
    content,
    groupId,
    existingComment,
    courseId,
    title,
    scores,
    semester,
    isAnonymous,
    showSnackbar,
    onSuccess,
  ]);

  const handleOpen = useCallback(() => {
    if (!isLogin) {
      showSnackbar("请先登录", "warning");
      return;
    }
    setOpen(true);
  }, [isLogin, showSnackbar]);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<EditIcon />}
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        {existingComment ? "编辑评价" : "写评价"}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{existingComment ? "编辑评价" : "写评价"}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Teacher select + Semester */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>教师</InputLabel>
              <Select
                value={groupId}
                label="教师"
                onChange={(e) => setGroupId(Number(e.target.value))}
              >
                <MenuItem value={0} disabled>
                  请选择教师
                </MenuItem>
                {groups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.teachers.map((t) => t.name).join(", ") || "未知"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>学期</InputLabel>
              <Select
                value={semester}
                label="学期"
                onChange={(e) => setSemester(e.target.value)}
              >
                <MenuItem value="">不选择</MenuItem>
                {rawYearItems.flatMap((year) =>
                  termItems.map((term) => (
                    <MenuItem
                      key={`${year}${term.value}`}
                      value={`${year}${term.value}`}
                    >
                      {year} {term.label}
                    </MenuItem>
                  )),
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Title */}
          <TextField
            fullWidth
            size="small"
            label="标题（可选）"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Score sliders */}
          <Box sx={{ mb: 2 }}>
            {judgeItems.map((label, i) => (
              <Box key={label} sx={{ mb: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2">{label}</Typography>
                  <Typography variant="body2">
                    {gradingEmojis[scores[i] - 1]}{" "}
                    {gradingInfo[
                      ["quality", "workload", "difficulty", "distribution"][
                        i
                      ] as keyof typeof gradingInfo
                    ]?.[scores[i] - 1] ?? ""}
                  </Typography>
                </Box>
                <Slider
                  value={scores[i]}
                  min={1}
                  max={5}
                  step={1}
                  onChange={(_, val) => handleScoreChange(i, val as number)}
                  marks
                  sx={{
                    color: gradingInfo.color[scores[i] - 1] ?? "#B0B0B0",
                  }}
                />
              </Box>
            ))}
          </Box>

          {/* Content: Edit / Preview tabs */}
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
            <Tab label="编辑" />
            <Tab label="预览" />
          </Tabs>

          {tab === 0 && (
            <TextField
              fullWidth
              multiline
              minRows={6}
              maxRows={20}
              placeholder="支持 Markdown 语法..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}

          {tab === 1 && (
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                p: 2,
                minHeight: 150,
              }}
            >
              {content ? (
                previewContent ? (
                  <MdxRenderer source={previewContent} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    渲染中...
                  </Typography>
                )
              ) : (
                <Typography variant="body2" color="text.secondary">
                  预览区域（无内容）
                </Typography>
              )}
            </Box>
          )}

          {/* Anonymous toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
            }
            label="匿名发布"
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {existingComment ? "更新" : "发布"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
