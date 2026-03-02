import { readFile } from "fs/promises";
import { join } from "path";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";

export default async function TermsOfServicePage() {
  const filePath = join(process.cwd(), "src/assets/terms_of_service.md");
  const source = await readFile(filePath, "utf-8");

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        用户协议
      </Typography>
      <article>
        <MarkdownRenderer content={source} />
      </article>
    </Container>
  );
}
