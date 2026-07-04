import { defineCollection, z } from "astro:content";

// Permissive but type-preserving schema. Vault frontmatter is rich (86+ keys)
// with mixed types (nullable strings, non-strict URLs, mixed-shape arrays).
// We keep validation loose so sync passes, but lean heavily on .passthrough()
// for unknown keys. Consumers cast `data as any` where needed for fields we
// don't enumerate here.

const projects = defineCollection({
  type: "content",
  schema: z
    .object({
      title: z.string(),
      // `slug` is reserved in Astro 5 (auto-derived from filename). Frontmatter
      // `slug:` flows through via .passthrough() — code can still access data.slug.

      type: z.string().nullish(),
      course: z.string().nullish(),
      course_code: z.union([z.string(), z.number()]).nullish(),
      semester: z.string().nullish(),
      year: z.number().nullish(),
      institution: z.string().nullish(),
      program: z.string().nullish(),
      company: z.string().nullish(),

      role: z.string().nullish(),
      role_evolution: z.string().nullish(),
      team_size: z.union([z.string(), z.number()]).nullish(),
      team: z.array(z.string()).nullish(),
      team_hierarchy: z.string().nullish(),
      collaborators: z.array(z.string()).nullish(),
      repo_owner: z.string().nullish(),
      advisor: z.string().nullish(),

      tags: z.array(z.string()).nullish(),
      categories: z.array(z.string()).nullish(),

      github: z.string().nullish(),
      github_url: z.string().nullish(),
      live_url: z.string().nullish(),

      hero_image: z.string().nullish(),
      images: z.array(z.string()).nullish(),
      video: z.string().nullish(),
      // artifacts can be strings OR objects in vault — accept either
      artifacts: z.array(z.unknown()).nullish(),

      publication: z.string().nullish(),
      publication_url: z.string().nullish(),

      stack: z.union([z.array(z.string()), z.string()]).nullish(),
      dataset: z.string().nullish(),

      priority: z.enum(["flagship", "standard", "experimental"]).nullish(),
      status: z.enum(["draft", "ready", "published"]).nullish(),
      publish: z.boolean().nullish(),
      publish_reason: z.string().nullish(),
    })
    .passthrough(),
});

const site = defineCollection({
  type: "content",
  schema: z
    .object({
      title: z.string(),
      date: z.string().nullish(),
      body: z.string().nullish(),
    })
    .passthrough(),
});

// Writing / notes — the exposure hub. Short technical essays tied to the OSS
// repos + the second-brain system. publish:true gates visibility.
const writing = defineCollection({
  type: "content",
  schema: z
    .object({
      title: z.string(),
      date: z.string(),
      summary: z.string().nullish(),
      tags: z.array(z.string()).nullish(),
      canonical_project: z.string().nullish(),
      external_url: z.string().nullish(),
      publish: z.boolean().default(false),
    })
    .passthrough(),
});

export const collections = { projects, site, writing };
