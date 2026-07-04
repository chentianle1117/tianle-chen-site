// 2026 taxonomy — 4 domains + cross-cutting tags.
// A DOMAIN is where a project lives (one per project, drives the scatter color
// and the /work filter). Research / Thesis / Game / Data-Viz / Fabrication etc.
// are TAGS that describe what a project IS, shown as pills on the card.

export type FilterCategory =
  | "AI / ML"
  | "Interactive"
  | "Computational Design"
  | "Architecture";

export const FILTER_CATEGORIES: FilterCategory[] = [
  "AI / ML",
  "Interactive",
  "Computational Design",
  "Architecture",
];

// The authoritative domain lives in scripts/project_overrides.json as
// `primary_category` (also drives the home scatter). This maps those keys to
// the filter labels so /work and the scatter agree exactly.
export const PRIMARY_TO_FILTER: Record<string, FilterCategory> = {
  ml: "AI / ML",
  interactive: "Interactive",
  compdesign: "Computational Design",
  architecture: "Architecture",
};

// Fallback keyword matchers for projects without an explicit primary_category
// (also used by the dashboard donut). Maps free-form vault `categories` onto
// the 4 domains.
const matchers: Record<FilterCategory, string[]> = {
  "AI / ML": [
    "ML", "AI", "AI/ML", "Deep Learning", "Computer Vision", "CAD Generation",
    "Generative 3D", "Agent", "Latent",
  ],
  Interactive: [
    "Interactive", "Interaction", "Projection Mapping", "Game",
    "Data Visualization", "Data Engineering", "Desktop App", "Web App",
    "Interface Design", "Personal",
  ],
  "Computational Design": [
    "Parametric", "Digital Fabrication", "Fabrication", "Mixed Reality",
    "Form-finding", "Acoustic", "Procedural Generation", "Urban Planning",
    "Computational",
  ],
  Architecture: ["Architecture", "Interior", "Urban Design"],
};

const norm = (s: string) => s.toLowerCase();

export function projectCategoryBuckets(categories: string[] = []): FilterCategory[] {
  const lower = categories.map(norm);
  const out: FilterCategory[] = [];
  for (const bucket of FILTER_CATEGORIES) {
    const ms = matchers[bucket].map(norm);
    if (lower.some((c) => ms.some((m) => c.includes(m)))) out.push(bucket);
  }
  return out;
}

/** Single domain for a project: explicit primary_category wins, else first
 *  keyword-matched bucket, else Architecture. Used by /work so each card sits
 *  in exactly one filter bucket, matching its scatter color. */
export function domainForProject(
  primaryCategory: string | undefined,
  categories: string[] = []
): FilterCategory {
  if (primaryCategory && PRIMARY_TO_FILTER[primaryCategory]) {
    return PRIMARY_TO_FILTER[primaryCategory];
  }
  return projectCategoryBuckets(categories)[0] ?? "Architecture";
}

export function bucketSlug(bucket: FilterCategory): string {
  return bucket.toLowerCase().replace(/[^a-z]/g, "");
}

// ─────────────────────────────────────────────────────────────
// Card tag pills — cross-cutting descriptors (max 2, most distinctive first).
// RESEARCH is gated on an ACTUAL paper/publication signal — not the word
// "Research" appearing in a studio project's categories. That is the
// "research = papers" rule, made mechanical.
// ─────────────────────────────────────────────────────────────

interface TagInferenceInput {
  categories?: string[];
  slug?: string;
  publication?: string;
  publication_url?: string;
  reference_paper?: string;
  github_upstream_url?: string;
}

export function getTagsForProject(data: TagInferenceInput | any): string[] {
  const cats: string[] = (data?.categories ?? []).map((c: string) => c.toLowerCase());
  const has = (needle: string) => cats.some((c) => c.includes(needle));
  const isThesis = has("thesis") || data?.slug === "semantic-canvas";
  const isAcademic = Boolean(
    data?.publication || data?.publication_url || data?.reference_paper || data?.github_upstream_url
  );

  // ordered by distinctiveness — the first two that match win
  const tests: Array<[string, boolean]> = [
    ["THESIS", isThesis],
    ["RESEARCH", isAcademic],
    ["AGENT", has("agent")],
    ["GAME", has("game")],
    ["DATA VIZ", has("data visualization") || has("data viz")],
    ["MIXED REALITY", has("mixed reality")],
    ["COMPUTER VISION", has("computer vision")],
    ["GENERATIVE", has("generative") || has("procedural")],
    ["FABRICATION", has("fabrication")],
    ["PARAMETRIC", has("parametric")],
    ["INSTALLATION", has("projection") || has("installation") || has("digital interaction")],
    ["PERSONAL", has("personal")],
    ["ML", has("ml") || has("ai") || has("deep learning") || has("cad generation")],
    ["ACOUSTIC", has("acoustic")],
    ["URBAN", has("urban")],
    ["INTERIOR", has("interior")],
    ["ARCHITECTURE", has("architecture")],
  ];

  const out: string[] = [];
  for (const [tag, ok] of tests) {
    if (ok && !out.includes(tag)) {
      out.push(tag);
      if (out.length >= 2) break;
    }
  }
  return out;
}
