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

// ─────────────────────────────────────────────────────────────
// METHOD dimension — technique depth, orthogonal to the 4 domains.
// The domain says WHERE a project lives; the method says WHAT KIND OF
// ML/technique work it actually is — so a viewer can tell real model
// training from interface/API work at a glance. Ordered as a depth
// spectrum: from building/adapting models → using embeddings → agent
// orchestration → running models at inference → interface/craft.
//
// Classification is EVIDENCE-BASED and hand-authored (it cannot be
// inferred from category keywords — it needs the project's actual
// content). Kept as an explicit slug→method map, same pattern as the
// primary_category overrides. Honesty rule: only `from-scratch` or
// `fine-tuning` when the writeup clearly supports trained/adapted
// weights — never for projects that merely call an ML API.
// ─────────────────────────────────────────────────────────────

export type MethodKey =
  | "from-scratch"
  | "fine-tuning"
  | "embeddings"
  | "agentic"
  | "cv-inference"
  | "interface";

export interface MethodDef {
  key: MethodKey;
  /** Full label — matrix headers, rail metadata. */
  label: string;
  /** Compact chip label — cards + inline badges. */
  chip: string;
  /** One-line explainer — matrix lanes + legend. */
  blurb: string;
  /** "ml" tier gets the accent treatment; "craft" is the muted catch-all. */
  tier: "ml" | "craft";
}

// Depth-ordered: model-building on the left → interface craft on the right.
export const METHODS: MethodDef[] = [
  {
    key: "from-scratch",
    label: "From-scratch training",
    chip: "FROM-SCRATCH",
    blurb: "Designed and trained a model's weights from the ground up.",
    tier: "ml",
  },
  {
    key: "fine-tuning",
    label: "Fine-tuning",
    chip: "FINE-TUNED",
    blurb: "Adapted a pretrained model (LoRA, unfreezing, differentiated LRs).",
    tier: "ml",
  },
  {
    key: "embeddings",
    label: "Embeddings / latent space",
    chip: "EMBEDDINGS",
    blurb: "Builds on learned representations — projecting, navigating latent space.",
    tier: "ml",
  },
  {
    key: "agentic",
    label: "Agentic / orchestration",
    chip: "AGENTIC",
    blurb: "Agent loops, tool-calling, LLM pipelines and self-verification.",
    tier: "ml",
  },
  {
    key: "cv-inference",
    label: "CV / model inference",
    chip: "CV INFERENCE",
    blurb: "Runs vision / generative models at inference — real-time, on-device.",
    tier: "ml",
  },
  {
    key: "interface",
    label: "Interface / interaction",
    chip: "INTERFACE",
    blurb: "Interaction, dataviz, geometry and design craft — little to no ML.",
    tier: "craft",
  },
];

const METHOD_MAP: Record<MethodKey, MethodDef> = Object.fromEntries(
  METHODS.map((m) => [m.key, m])
) as Record<MethodKey, MethodDef>;

export function methodMeta(key: MethodKey): MethodDef {
  return METHOD_MAP[key];
}

// slug → [primary, secondary?] method tags. Covers published projects AND
// the standalone lab pages (vision-lab / latent-atlas / section-studio /
// design-copilot). Evidence for each is recorded in the audit; low/medium
// confidence calls are flagged there for the owner to confirm.
export const PROJECT_METHODS: Record<string, MethodKey[]> = {
  // ── flagship ML systems ───────────────────────────────────────
  // trained a custom transformer decoder from scratch; stage-2 unfreezes
  // + fine-tunes the DINOv2 encoder with differentiated LRs.
  "3t3d-vit-2d-to-3d": ["from-scratch", "fine-tuning"],
  // LoRA-fine-tuned Qwen2.5-7B; trainable multimodal projections align
  // frozen encoders into the LLM embedding space.
  "l43d-cad-mllm": ["fine-tuning", "embeddings"],
  // pure CLIP dot-projection along typed semantic axes — no retraining;
  // heavy D3 study instrument around it.
  "semantic-canvas": ["embeddings", "interface"],
  // multi-agent choreographer + workers + LLM-as-judge auditor.
  "job-search-copilot": ["agentic"],
  // Gemini Multimodal Live phased tool-calling workflow (bounded observer).
  "live-ai-feedback-design-assistant": ["agentic"],
  // Teachable-Machine classifier (transfer learning, NOT from scratch) +
  // local vision-LLM description, run live on screen capture.
  "synthetic-texture-deterioration": ["cv-inference", "interface"],

  // ── CV-at-inference installations ─────────────────────────────
  // MediaPipe tracking + real-time StreamDiffusion img2img; "no training".
  "spectral-facades": ["cv-inference", "interface"],
  "design-the-ambience": ["cv-inference", "interface"],

  // ── interface / interaction / geometry / architecture ─────────
  "a-game-of-deterioration": ["interface"],
  "aurora-citadel-gen-game": ["interface"],
  "generative-urbanism": ["interface"],
  "skill-bridge-datavis": ["interface"],
  "travel-atlas": ["interface"],
  "fiber-based-pavilion": ["interface"],
  "membrane-form-finding": ["interface"],
  "wire-bending": ["interface"],
  "spatial-bending": ["interface"],
  "sound-scape": ["interface"],
  "deform": ["interface"],
  "interlude": ["interface"],
  "salt-marsh-research-center": ["interface"],
  "uranium-scape": ["interface"],
  "urban-mining": ["interface"],
  "urban-streamline": ["interface"],

  // ── standalone lab instruments ────────────────────────────────
  "vision-lab": ["cv-inference", "embeddings"],
  "latent-atlas": ["embeddings"],
  "section-studio": ["interface"],
  "design-copilot": ["agentic"], // classified; page currently unlinked
};

export function methodsForProject(slug: string | undefined): MethodKey[] {
  if (!slug) return [];
  return PROJECT_METHODS[slug] ?? [];
}

// Lab instruments the capability matrix can surface as cross-links.
// design-copilot is deliberately omitted — it is unpublished/unlinked.
export interface LabEntry {
  slug: string;
  title: string;
  href: string;
}
export const MATRIX_LABS: LabEntry[] = [
  { slug: "latent-atlas", title: "Latent Atlas", href: "/latent-atlas" },
  { slug: "vision-lab", title: "Vision Lab", href: "/vision-lab" },
  { slug: "section-studio", title: "Section Studio", href: "/section-studio" },
];
