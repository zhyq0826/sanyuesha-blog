import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import rehypeSlug from "rehype-slug";
import remarkSmartypants from "remark-smartypants";

export default defineConfig({
  site: "https://sanyuesha.com",
  integrations: [mdx(), react()],
  markdown: {
    rehypePlugins: [rehypeSlug],
    remarkPlugins: [remarkSmartypants]
  }
});

