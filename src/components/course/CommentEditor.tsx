"use client";

import { useState, useCallback, useEffect } from "react";
import Button from "@mui/material/Button";
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
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  judgeItems,
  gradingInfo,
  gradingEmojis,
  termItems,
  rawYearItems,
} from "@/constants";
import { useSnackbar } from "@/contexts/SnackbarContext";
import api from "@/lib/api";
import type { CourseGroup, Comment } from "@/types";
import MdxRenderer from "@/components/mdx/MdxRenderer";
import { serializeMdx } from "@/lib/mdx";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { Grid } from "@mui/material";

/**
 * Pure editor form — renders DialogTitle + DialogContent + DialogActions.
 * Must be placed inside a MUI `<Dialog>`.
 */
interface CommentEditorProps {
  courseId: number;
  groups: CourseGroup[];
  /** If provided, the editor is in "edit" mode */
  existingComment?: Comment;
  onSuccess: () => void;
  /** Close the parent dialog */
  onClose: () => void;
  /** If provided, renders a back arrow to return to "my comments" list */
  onBack?: () => void;
}

export default function CommentEditor({
  courseId,
  groups,
  existingComment,
  onSuccess,
  onClose,
  onBack,
}: CommentEditorProps) {
  const showSnackbar = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0); // 0: edit, 1: preview

  // Form fields
  const [title, setTitle] = useState(existingComment?.title ?? "");
  const [content, setContent] = useState(existingComment?.content ?? "");
  const [scores, setScores] = useState<number[]>(
    existingComment?.score ?? [3, 3, 3, 3],
  );
  const [groupId, setGroupId] = useState(existingComment?.group?.id ?? null);
  const [year, setYear] = useState(
    existingComment?.semester ? String(Math.floor(existingComment.semester / 100)) : "",
  );
  const [semester, setSemester] = useState(
    existingComment?.semester ? String(existingComment.semester % 100).padStart(2, "0") : "",
  );
  const [isAnonymous, setIsAnonymous] = useState(
    existingComment?.is_anonymous ?? true,
  );
  const [previewContent, setPreviewContent] =
    useState<MDXRemoteSerializeResult | null>(null);

  // Reset form when switching between edit targets
  useEffect(() => {
    setTitle(existingComment?.title ?? "");
    setContent(existingComment?.content ?? "");
    setScores(existingComment?.score ?? [3, 3, 3, 3]);
    setGroupId(existingComment?.group?.id ?? null);
    setYear(
      existingComment?.semester ? String(Math.floor(existingComment.semester / 100)) : "",
    );
    setSemester(
      existingComment?.semester ? String(existingComment.semester % 100).padStart(2, "0") : "",
    );
    setIsAnonymous(existingComment?.is_anonymous ?? true);
    setError("");
    setTab(0);
  }, [existingComment]);

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
    if (groupId === null || year == "" || semester == "" || title == "") {
      setError("请填写所有必填项");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const endpoint = existingComment
        ? "/v1/comment/update"
        : "/v1/comment/post";
      const semesterValue = year && semester ? Number(year) * 100 + Number(semester) : 0;
      
      // Match backend API signature
      const payload = existingComment
        ? {
            id: existingComment.id,
            title,
            content,
            semester: semesterValue,
            is_anonymous: isAnonymous,
            scores: scores,
            student_score_ranking: 2, // Default value, not yet supported
          }
        : {
            group: groupId,
            title,
            content,
            semester: semesterValue,
            is_anonymous: isAnonymous,
            scores: scores,
            student_score_ranking: 2, // Default value, not yet supported
          };
      
      await api.post(endpoint, payload);
      showSnackbar(existingComment ? "评价已更新" : "评价发布成功", "success");
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
    title,
    scores,
    year,
    semester,
    isAnonymous,
    showSnackbar,
    onSuccess,
  ]);

  const handleDelete = useCallback(async () => {
    if (!existingComment) return;
    setDeleteLoading(true);
    setError("");
    try {
      await api.post("/v1/comment/delete", { id: existingComment.id });
      showSnackbar("评价已删除", "success");
      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { msg?: string } } })?.response?.data
          ?.msg ?? "删除失败";
      setError(msg);
    } finally {
      setDeleteLoading(false);
    }
  }, [existingComment, showSnackbar, onSuccess]);

  return (
    <>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onBack && (
            <IconButton size="small" onClick={onBack} edge="start">
              <ArrowBackIcon />
            </IconButton>
          )}
          {existingComment ? "编辑评价" : "写评价"}
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Teacher select + Year + Semester */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel variant="standard" required error={!groupId}>教师</InputLabel>
            <Select
              variant="standard"
              value={groupId}
              label="教师"
              onChange={(e) => setGroupId(Number(e.target.value))}
              disabled={!!existingComment}
              required error={!groupId}
            >
              {groups.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.teachers.map((t) => t.name).join(", ") || "未知"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel variant="standard" required error={year == ""}>修读年份</InputLabel>
            <Select
              required error={year == ""}
              variant="standard"
              value={year}
              label="修读年份"
              onChange={(e) => setYear(e.target.value)}
            >
              {rawYearItems.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel variant="standard" required error={semester == ""}>修读学期</InputLabel>
            <Select
              required error={semester == ""}
              variant="standard"
              value={semester}
              label="修读学期"
              onChange={(e) => setSemester(e.target.value)}
            >
              {termItems.map((term) => (
                <MenuItem key={term.value} value={term.value}>
                  {term.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Title */}
        <TextField
          fullWidth
          variant="standard"
          size="small"
          label="标题"
          required
          error={title == ""}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Score sliders */}
        <Grid sx={{ mb: 2 }}>
          {judgeItems.map((label, i) => (
            <Grid key={label} sx={{ mb: 1 }} size={{ sm: 6, md: 6 }}>
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
            </Grid>
          ))}
        </Grid>

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
        <Button onClick={onClose}>取消</Button>

        <Box sx={{ flex: 1 }} />

        {existingComment && (
          <Button
            color="error"
            onClick={handleDelete}
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />
            }
          >
            删除
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {existingComment ? "更新" : "发布"}
        </Button>
      </DialogActions>
    </>
  );
}
