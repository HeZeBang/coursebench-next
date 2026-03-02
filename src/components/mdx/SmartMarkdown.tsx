"use client";

import { useState, useMemo } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { Button, Box } from "@mui/material";
import {
  KeyboardDoubleArrowDownOutlined,
  KeyboardDoubleArrowUpOutlined,
} from "@mui/icons-material";

const COLLAPSE_LINES = 5;

export default function SmartMarkdown({
  content,
  noExpand,
}: {
  content: string;
  noExpand?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const { lines, shouldCollapse, preview } = useMemo(() => {
    const lineArray = content.split("\n");
    const isCollapsible = lineArray.length > COLLAPSE_LINES;
    const previewText = isCollapsible
      ? lineArray.slice(0, COLLAPSE_LINES).join("\n")
      : content;
    return {
      lines: lineArray,
      shouldCollapse: isCollapsible,
      preview: previewText,
    };
  }, [content]);

  if (!shouldCollapse) {
    return <MarkdownRenderer content={content} />;
  }

  if (!expanded) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <MarkdownRenderer
          content={preview}
          className="markdown-body [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)]"
        />
        {!noExpand && (
          <Button
            onClick={() => setExpanded(true)}
            size="small"
            sx={{ mt: -1, mb: 1, alignSelf: "center" }}
            startIcon={<KeyboardDoubleArrowDownOutlined />}
            variant="outlined"
          >
            展开全文
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <MarkdownRenderer content={content} />
      <Button
        onClick={() => setExpanded(false)}
        size="small"
        sx={{ my: 1, alignSelf: "center" }}
        startIcon={<KeyboardDoubleArrowUpOutlined />}
        variant="outlined"
      >
        收起全文
      </Button>
    </Box>
  );
}
