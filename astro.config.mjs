import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://tianle-chen.com",
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [],
    rehypePlugins: [],
    shikiConfig: { theme: "github-dark-dimmed", wrap: true },
  },
  image: {
    domains: [],
  },
  build: {
    assets: "_astro",
  },
});
