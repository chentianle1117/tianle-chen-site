/**
 * layoutData.ts — typed loader for the hero data bundle.
 *
 * Build Agent A produces these JSON files. We tolerate either being absent
 * (the runtime fetch logs and the UI shows an error state).
 */

export type EmbeddingModel = "open-clip-vit-l-14" | "jina-clip-v2";

export interface ProjectEmbedding {
  slug: string;
  title: string;
  year: number;
  categories: string[];
  embedding: number[];
  image_embedding: number[];
  text_embedding: number[];
  /** [u, v, w, h] in 0-1 GL convention into atlas.png */
  thumbnail_uv: [number, number, number, number];
  /** Round-7: hand-written 1-3 sentence project summary, used both for the
   * latent-space embedding source and the hero side-panel description. */
  summary?: string | null;
  priority?: string;
}

export interface EmbeddingsBundle {
  model: EmbeddingModel;
  dim: 768 | 1024;
  projects: ProjectEmbedding[];
}

export type LayoutKey = "thesis_default" | "umap" | "pca" | "metadata";

export interface ThesisAxisPreset {
  /** [pos, neg] human-readable */
  labels: [string, string];
  /** L2-normalized direction vector, length === dim */
  direction: number[];
}

export interface LayoutsBundle {
  thesis_default: Record<string, [number, number, number]>;
  umap: Record<string, [number, number, number]>;
  pca: Record<string, [number, number, number]>;
  metadata: Record<string, [number, number, number]>;
  thesis_axes_cache: Record<string, ThesisAxisPreset>;
}

/**
 * Round-9: project_media.json is a separate, lightweight side-bundle written
 * by scripts/build_project_media.mjs. It carries the project's hero_image and
 * images[] paths so the hero HoverCard can render full-resolution previews
 * (the atlas only carries one square slice per project).
 *
 * Optional: if the file is missing, we still render — the HoverCard falls
 * back to the atlas slice.
 */
export interface ProjectMedia {
  hero_image: string | null;
  images: string[];
}
export type ProjectMediaBundle = Record<string, ProjectMedia>;

export interface LayoutDataBundle {
  embeddings: EmbeddingsBundle;
  layouts: LayoutsBundle;
  media: ProjectMediaBundle;
}

const EMBEDDINGS_URL = "/data/embeddings.json";
const LAYOUTS_URL = "/data/layouts.json";
const MEDIA_URL = "/data/project_media.json";

export class LayoutDataError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "LayoutDataError";
  }
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) {
    throw new LayoutDataError(`Fetch ${url} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function loadLayoutData(): Promise<LayoutDataBundle> {
  try {
    // Round-9: media is optional. If the JSON is missing or malformed,
    // we degrade gracefully — HoverCard falls back to the atlas slice.
    const [embeddings, layouts, media] = await Promise.all([
      fetchJSON<EmbeddingsBundle>(EMBEDDINGS_URL),
      fetchJSON<LayoutsBundle>(LAYOUTS_URL),
      fetchJSON<ProjectMediaBundle>(MEDIA_URL).catch(() => ({}) as ProjectMediaBundle),
    ]);
    return { embeddings, layouts, media };
  } catch (err) {
    if (err instanceof LayoutDataError) throw err;
    throw new LayoutDataError("Failed to load layout data", err);
  }
}

/**
 * Normalize a record of 3-coords into [-1, 1]^3 in place. Caller owns the data.
 * Used when we produce a fresh thesis layout from `projectThesis`.
 */
export function normalizeLayoutInPlace(
  layout: Record<string, [number, number, number]>,
): Record<string, [number, number, number]> {
  const slugs = Object.keys(layout);
  if (slugs.length === 0) return layout;
  const mins: [number, number, number] = [Infinity, Infinity, Infinity];
  const maxs: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const slug of slugs) {
    const p = layout[slug];
    for (let i = 0; i < 3; i++) {
      if (p[i] < mins[i]) mins[i] = p[i];
      if (p[i] > maxs[i]) maxs[i] = p[i];
    }
  }
  for (const slug of slugs) {
    const p = layout[slug];
    for (let i = 0; i < 3; i++) {
      const range = maxs[i] - mins[i] || 1;
      p[i] = ((p[i] - mins[i]) / range) * 2 - 1;
    }
  }
  return layout;
}
