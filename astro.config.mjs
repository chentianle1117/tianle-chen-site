import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  site: "https://tianle-chen.com",
  // Round-6 Bug 5: thesis consolidation — there is ONE canonical thesis page
  // (/thesis), which renders from semantic-canvas.md with a custom layout.
  // The generic detail routes /work/semantic-canvas and /work/thesis-flagship
  // both redirect to /thesis so any inbound link lands on the rich page.
  redirects: {
    "/work/semantic-canvas": "/thesis",
    "/work/thesis-flagship": "/thesis",
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap(),
    react(),
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
  vite: {
    plugins: [
      glsl({
        include: ["**/*.glsl", "**/*.vert", "**/*.frag"],
        compress: false,
      }),
    ],
  },
});
