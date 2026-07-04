import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

// Feed over published projects. Fixes the previously dead /rss.xml footer link.
export async function GET(context) {
  const projects = (
    await getCollection("projects", ({ data }) => data.publish === true)
  ).sort((a, b) => (b.data.year ?? 0) - (a.data.year ?? 0));

  return rss({
    title: "Tianle (David) Chen — Selected Work",
    description:
      "Generative-ML tools, interactive systems, and computational design by Tianle (David) Chen.",
    site: context.site ?? "https://tianle-chen.com",
    items: projects.map((p) => {
      const slug = p.data.slug ?? p.id.replace(/\.md$/, "");
      return {
        title: p.data.title,
        description: typeof p.data.summary === "string" ? p.data.summary : "",
        link: `/work/${slug}`,
        ...(p.data.year ? { pubDate: new Date(Date.UTC(p.data.year, 0, 1)) } : {}),
        ...(Array.isArray(p.data.categories) && p.data.categories.length
          ? { categories: p.data.categories }
          : {}),
      };
    }),
    customData: `<language>en-us</language>`,
  });
}
