"use client";

import React, { useState, useMemo, Suspense, useRef } from "react";
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
  const ref = useRef<HTMLDivElement>(null);

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
      <div ref={ref} /> {/* Anchor for scrollIntoView */}
      <Collapse
        in={expanded} 
        collapsedSize={`${COLLAPSE_LINES * 1.5}em`}
        className={!expanded ? "[mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)]" : ""}>
        <Suspense fallback={
          <MarkdownRenderer content={preview} />
        }>
          <MarkdownRenderer
            content={content}
          />
        </Suspense>
      </Collapse>

      {!noExpand && (
        <Button
          onClick={() => {
            if (expanded && ref.current) {
              const elementPosition = ref.current.getBoundingClientRect().top + window.pageYOffset;
              const offsetPosition = elementPosition - 300;

              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
              });
            }

            setExpanded(!expanded);
          }}
          size="small"
          sx={{ mb: 1, alignSelf: "center" }}
          startIcon={expanded ? <KeyboardDoubleArrowUpOutlined /> : <KeyboardDoubleArrowDownOutlined />}
          variant="outlined"
        >
          {expanded ? "收起全文" : "展开全文"}
        </Button>
      )}
    </Box>
  );
}
