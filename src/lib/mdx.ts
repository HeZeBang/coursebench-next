import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import remarkPangu from "remark-pangu";
import rehypePrismPlus from "rehype-prism-plus";

/**
 * Serialize a markdown/MDX string for use with MdxRenderer.
 * Can be called in Server Components or API routes.
 */
export async function serializeMdx(source: string) {
  return serialize(source, {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkPangu],
      rehypePlugins: [[rehypePrismPlus, { ignoreMissing: true }]],
    },
  });
}
