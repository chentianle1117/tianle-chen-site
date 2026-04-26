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

// ─────────────────────────────────────────────────────────────
// Round-4 Direction 4 — fixed tag-pill vocabulary for ProjectCard
// Max 2 tags per project. Uppercase mono pills above the title.
// ─────────────────────────────────────────────────────────────

export type ProjectTag =
  | "THESIS"
  | "ML TOOL"
  | "RESEARCH"
  | "ARCHITECTURE"
  | "DESIGN SYSTEM"
  | "EXPERIMENT"
  | "PHYSICAL FAB";

export const PROJECT_TAG_VOCAB: ProjectTag[] = [
  "THESIS",
  "ML TOOL",
  "RESEARCH",
  "ARCHITECTURE",
  "DESIGN SYSTEM",
  "EXPERIMENT",
  "PHYSICAL FAB",
];

interface TagInferenceInput {
  categories?: string[];
  priority?: string;
  institution?: string;
  slug?: string;
  year?: number;
}

/**
 * Map a project's `data.categories` (free-form vault strings) onto the
 * fixed 7-tag taxonomy used in the ProjectCard pills. Returns at most 2
 * tags, ordered by relevance.
 *
 * Heuristics (priority-ordered — first match wins for primary slot):
 *  1. priority === "flagship" + thesis category  → THESIS
 *  2. categories contain Architecture/Form-finding/Pavilion → ARCHITECTURE
 *  3. categories contain ML/AI/Generative/Latent/CV → ML TOOL
 *  4. categories contain Research/Thesis/Visualization → RESEARCH
 *  5. categories contain Design/Interface/System → DESIGN SYSTEM
 *  6. categories contain Fabrication/Robotic/Physical → PHYSICAL FAB
 *  7. categories contain Experiment/Game/Mixed Reality → EXPERIMENT
 *
 * Secondary tag is picked from remaining matches, deduped against primary.
 */
export function getTagsForProject(data: TagInferenceInput | any): ProjectTag[] {
  const cats: string[] = (data?.categories ?? []).map((c: string) => c.toLowerCase());
  const isThesis = cats.some((c) => c.includes("thesis")) || data?.slug === "semantic-canvas";
  const isFlagship = data?.priority === "flagship";
  const isRiceArch = data?.institution === "Rice University";

  const matchers: Array<[ProjectTag, (c: string) => boolean]> = [
    ["THESIS", (c) => c.includes("thesis")],
    ["ARCHITECTURE", (c) =>
      c.includes("architecture") ||
      c.includes("pavilion") ||
      c.includes("form-finding") ||
      c.includes("urbanism") ||
      c.includes("structural") ||
      c.includes("parametric")],
    ["ML TOOL", (c) =>
      c.includes("ml") ||
      c.includes("ai") ||
      c.includes("generative") ||
      c.includes("latent") ||
      c.includes("computer vision") ||
      c.includes("deep learning") ||
      c.includes("cad generation")],
    ["RESEARCH", (c) =>
      c.includes("research") ||
      c.includes("data visualization") ||
      c.includes("visualization") ||
      c.includes("data engineering")],
    ["DESIGN SYSTEM", (c) =>
      c.includes("design system") ||
      c.includes("interface") ||
      c.includes("desktop app") ||
      c.includes("web app") ||
      c.includes("tool")],
    ["PHYSICAL FAB", (c) =>
      c.includes("digital fabrication") ||
      c.includes("fabrication") ||
      c.includes("robotic") ||
      c.includes("wire bending") ||
      c.includes("ceramic")],
    ["EXPERIMENT", (c) =>
      c.includes("experiment") ||
      c.includes("game") ||
      c.includes("mixed reality") ||
      c.includes("projection") ||
      c.includes("mapping") ||
      c.includes("interactive") ||
      c.includes("interaction")],
  ];

  const out: ProjectTag[] = [];
  for (const [tag, test] of matchers) {
    if (cats.some(test) && !out.includes(tag)) {
      out.push(tag);
      if (out.length >= 2) break;
    }
  }

  // Forced primaries for distinctive cases
  if (isThesis && !out.includes("THESIS")) {
    out.unshift("THESIS");
  }
  if (isRiceArch && !out.includes("ARCHITECTURE")) {
    if (out.length >= 2) out.pop();
    out.push("ARCHITECTURE");
  }
  // Boost flagship ML projects up the list
  if (isFlagship && cats.some((c) => c.includes("ml") || c.includes("ai")) && !out.includes("ML TOOL")) {
    if (out.length >= 2) out.pop();
    out.unshift("ML TOOL");
  }

  return out.slice(0, 2);
}

