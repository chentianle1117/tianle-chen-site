// Filter categories for the /work index. Maps each surfaced category
// to a list of substring matchers checked against a project's `categories`
// array. Matching is case-insensitive. A project may live in multiple
// buckets; the FilterBar treats this as an OR over selected buckets.

export type FilterCategory = "ML/AI" | "Design" | "Interaction" | "Research";

export const FILTER_CATEGORIES: FilterCategory[] = [
  "ML/AI",
  "Design",
  "Interaction",
  "Research",
];

const matchers: Record<FilterCategory, string[]> = {
  "ML/AI": [
    "ML",
    "AI",
    "AI/ML",
    "Deep Learning",
    "Production ML",
    "Computer Vision",
    "Generative",
    "Latent",
    "CAD Generation",
  ],
  Design: [
    "Design",
    "Parametric",
    "Interface",
    "Procedural",
    "Game",
    "Digital Fabrication",
    "Mixed Reality",
  ],
  Interaction: [
    "Interaction",
    "Interactive",
    "Projection",
    "Mapping",
    "Web App",
    "Desktop App",
    "Tool",
  ],
  Research: [
    "Research",
    "Thesis",
    "Data Visualization",
    "Visualization",
    "Data Engineering",
  ],
};

const norm = (s: string) => s.toLowerCase();

export function projectCategoryBuckets(categories: string[] = []): FilterCategory[] {
  const lower = categories.map(norm);
  const out: FilterCategory[] = [];
  for (const bucket of FILTER_CATEGORIES) {
    const ms = matchers[bucket].map(norm);
    if (lower.some((c) => ms.some((m) => c.includes(m)))) {
      out.push(bucket);
    }
  }
  return out;
}

export function bucketSlug(bucket: FilterCategory): string {
  return bucket.toLowerCase().replace(/[^a-z]/g, "");
}
