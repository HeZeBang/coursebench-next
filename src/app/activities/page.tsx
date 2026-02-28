import { readFile } from "fs/promises";
import { join } from "path";
import Container from "@mui/material/Container";

export default async function ActivitiesPage() {
  const filePath = join(process.cwd(), "src/assets/bench_reviewer.md");
  const source = await readFile(filePath, "utf-8");

  // This file contains embedded HTML that MDX can't parse,
  // so we render it as dangerouslySetInnerHTML with a prose wrapper
  // A simple markdown-to-html approach: use the raw content as-is since
  // the file already contains HTML blocks
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <article
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: source }}
      />
    </Container>
  );
}
