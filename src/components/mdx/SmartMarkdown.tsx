"use client";

import { useState, useMemo } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { Button, Box, Collapse } from "@mui/material";
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {/* <Collapse in={expanded} collapsedSize={`${COLLAPSE_LINES * 1.5}em`}> */}
      {expanded ? (
        <MarkdownRenderer content={content} />
      ) : (
        <MarkdownRenderer
          content={preview}
          className="markdown-body [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)]"
        />
      )}
      {/* </Collapse> */}

      {!noExpand && (
        <Button
          onClick={() => setExpanded(!expanded)}
          size="small"
          sx={{ mt: expanded ? -1 : 1, mb: 1, alignSelf: "center" }}
          startIcon={expanded ? <KeyboardDoubleArrowUpOutlined /> : <KeyboardDoubleArrowDownOutlined />}
          variant="outlined"
        >
          {expanded ? "收起全文" : "展开全文"}
        </Button>
      )}
    </Box>
  );
}
