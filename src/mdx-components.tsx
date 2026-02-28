import type { MDXComponents } from "mdx/types";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";

/**
 * Global MDX component mapping for @next/mdx (compile-time MDX).
 * Used by policy pages and other .mdx files.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
        {children}
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
        {children}
      </Typography>
    ),
    p: ({ children }) => (
      <Typography variant="body1" paragraph>
        {children}
      </Typography>
    ),
    a: ({ href, children }) => (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    ),
    hr: () => <Divider sx={{ my: 3 }} />,
    ...components,
  };
}
