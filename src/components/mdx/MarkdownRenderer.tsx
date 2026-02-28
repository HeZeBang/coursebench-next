"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkPangu from "remark-pangu";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import type { Components } from "react-markdown";

/**
 * Lightweight markdown renderer for user-generated content (comments).
 * Uses react-markdown for synchronous rendering without heavy serialization.
 * Much faster than MDX serialization for simple markdown content.
 */

const markdownComponents: Components = {
  h1: ({ children }) => (
    <Typography variant="h5" component="h1" gutterBottom>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="h6" component="h2" gutterBottom>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="subtitle1" component="h3" gutterBottom fontWeight={600}>
      {children}
    </Typography>
  ),
  h4: ({ children }) => (
    <Typography variant="subtitle2" component="h4" gutterBottom fontWeight={600}>
      {children}
    </Typography>
  ),
  p: ({ children }) => (
    <Typography variant="body2" component="p" sx={{ mb: 1 }}>
      {children}
    </Typography>
  ),
  a: ({ href, children }) => (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  ),
  hr: () => <Divider sx={{ my: 2 }} />,
  ul: ({ children }) => (
    <Box component="ul" sx={{ my: 1, pl: 2 }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ my: 1, pl: 2 }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
      {children}
    </Typography>
  ),
  blockquote: ({ children }) => (
    <Box
      component="blockquote"
      sx={{
        borderLeft: 4,
        borderColor: "divider",
        pl: 2,
        my: 1,
        color: "text.secondary",
      }}
    >
      {children}
    </Box>
  ),
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <Typography
          component="code"
          sx={{
            bgcolor: "action.hover",
            px: 0.5,
            py: 0.25,
            borderRadius: 0.5,
            fontFamily: "monospace",
            fontSize: "0.875em",
          }}
        >
          {children}
        </Typography>
      );
    }
    return (
      <Box
        component="pre"
        sx={{
          bgcolor: "action.hover",
          p: 2,
          borderRadius: 1,
          overflow: "auto",
          my: 1,
        }}
      >
        <code className={className} {...props}>
          {children}
        </code>
      </Box>
    );
  },
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown content with safe component mapping.
 * Optimized for performance - no async serialization needed.
 */
export default function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <Box className={className} sx={{ "& > *:first-of-type": { mt: 0 } }}>
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm, remarkPangu]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}
