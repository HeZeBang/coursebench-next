import { readFile } from "fs/promises";
import { join } from "path";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export default async function CommentPolicyPage() {
  const filePath = join(process.cwd(), "src/assets/comment_policy.md");
  const source = await readFile(filePath, "utf-8");

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        评价规范
      </Typography>
      <article className="prose prose-sm max-w-none">
        <MDXRemote source={source} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </article>
    </Container>
  );
}
