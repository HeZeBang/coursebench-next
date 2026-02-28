import { readFile } from "fs/promises";
import { join } from "path";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export default async function TermsOfServicePage() {
  const filePath = join(process.cwd(), "src/assets/terms_of_service.md");
  const source = await readFile(filePath, "utf-8");

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        用户协议
      </Typography>
      <article className="prose prose-sm max-w-none">
        <MDXRemote source={source} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </article>
    </Container>
  );
}
