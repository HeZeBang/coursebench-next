"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import type { MDXComponents } from "mdx/types";

/**
 * Component mapping for dynamic MDX content (comments, remote markdown).
 * Restricts allowed elements for security.
 */
const dynamicComponents: MDXComponents = {
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
    <Typography
      variant="subtitle1"
      component="h3"
      gutterBottom
      fontWeight={600}
    >
      {children}
    </Typography>
  ),
  a: ({ href, children }) => (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </Link>
  ),
  hr: () => <Divider sx={{ my: 2 }} />,
  // Block dangerous elements
  script: () => null,
  iframe: () => null,
  style: () => null,
};

interface MdxRendererProps {
  source: MDXRemoteSerializeResult;
  className?: string;
}

/**
 * Renders pre-serialized MDX content with safe component mapping.
 * Use `serialize()` from next-mdx-remote/serialize to prepare the source.
 */
export default function MdxRenderer({ source, className }: MdxRendererProps) {
  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className ?? ""}`}
      style={{
        lineHeight: "1.8",
        fontSize: "1rem",
      }}
    >
      <MDXRemote {...source} components={dynamicComponents} />
    </div>
  );
}
