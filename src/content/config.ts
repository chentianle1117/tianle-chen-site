import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z
    .object({
      type: z.literal("portfolio-project").optional(),
      title: z.string(),
      slug: z.string(),
      course: z.string().optional(),
      course_code: z.union([z.string(), z.number()]).optional().nullable(),
      semester: z.string().optional(),
      year: z.number().optional(),
      role: z.string().optional(),
      team_size: z.union([z.string(), z.number()]).optional(),
      team: z.array(z.string()).optional(),
      team_hierarchy: z.string().optional(),
      repo_owner: z.string().optional(),
      institution: z.string().optional(),
      tags: z.array(z.string()).default([]),
      categories: z.array(z.string()).default([]),
      github: z.string().nullable().optional(),
      github_url: z.string().url().optional(),
      live_url: z.string().url().optional(),
      video: z.string().url().optional(),
      notion_url: z.string().url().optional(),
      local_path: z.string().optional(),
      hero_image: z.string().optional(),
      images: z.array(z.string()).default([]),
      artifacts: z.array(z.string()).default([]),
      priority: z.enum(["flagship", "standard", "experimental"]).default("standard"),
      status: z.enum(["draft", "ready", "published"]).default("draft"),
      publish: z.boolean().default(false),
      publication: z.string().optional(),
      publication_url: z.string().url().optional(),
    })
    .passthrough(),
});

export const collections = { projects };
