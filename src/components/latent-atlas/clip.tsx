/**
 * clip.tsx — runtime CLIP TEXT-encoder helper for Latent Atlas.
 *
 * The transformers.js LIBRARY is loaded at runtime via a dynamic ESM import
 * (kept out of the Astro/Vite bundle with @vite-ignore), tried across an
 * ordered chain of verified CDNs so a single provider outage can't take the
 * flagship interaction down. The MODEL WEIGHTS are fetched by transformers.js
 * from the Hugging Face hub on first use. We only ever load the TEXT branch of
 * CLIP — the image embeddings
 * were precomputed offline with the matching vision branch, so a text-pole
 * embedding and a precomputed image embedding live in the SAME 512-d joint
 * space and a dot product between them is meaningful.
 *
 * This file exports no JSX (it is .tsx only to sit inside the island's
 * namespace folder). Everything is defensive: a single cached load promise,
 * a q8→fp32 dtype fallback, and typed progress reporting so the UI can show a
 * real percentage.
 */

const MODEL_ID = "Xenova/clip-vit-base-patch32";

// transformers.js 3.8.0, loaded at runtime as ESM. Ordered by preference; each
// entry is a live-verified ESM endpoint for the pinned version (200 ·
// application/javascript · exports AutoTokenizer, CLIPTextModelWithProjection,
// env), so a single CDN outage cannot kill the reprojection path:
//   1. jsDelivr bare URL — the canonical, documented transformers.js pattern.
//   2. esm.sh          — an independent provider (true cross-provider backup).
//   3. jsDelivr +esm   — alternate resolution on the primary provider.
const CDNS = [
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.0",
  "https://esm.sh/@huggingface/transformers@3.8.0",
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.0/+esm",
];

/**
 * Import the transformers.js ESM module, trying each CDN in order. Returns the
 * first module that resolves; throws only if every endpoint fails (e.g. the
 * visitor is fully offline / all CDNs blocked), so the caller can surface a
 * clean retry and the map keeps panning on the static PCA layout.
 */
async function importTransformers(): Promise<any> {
  let lastErr: unknown;
  for (const url of CDNS) {
    try {
      // @vite-ignore keeps the bundler from trying to resolve the CDN URL.
      return await import(/* @vite-ignore */ url);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("Could not load transformers.js from any CDN");
}

export interface LoadProgress {
  /** 0..1 aggregate download progress across all model files. */
  progress: number;
  /** Human-readable phase, e.g. "downloading text_model" or "ready". */
  label: string;
}

type ProgressListener = (p: LoadProgress) => void;

interface Encoder {
  tokenizer: any;
  model: any;
}

let cached: Encoder | null = null;
let inFlight: Promise<Encoder> | null = null;

// Per-file byte progress, aggregated into a single 0..1 number.
const fileTotals: Record<string, number> = {};
const fileLoaded: Record<string, number> = {};

function aggregate(): number {
  const total = Object.values(fileTotals).reduce((s, v) => s + v, 0);
  const loaded = Object.values(fileLoaded).reduce((s, v) => s + v, 0);
  if (total <= 0) return 0;
  return Math.min(1, loaded / total);
}

/**
 * Load (or return the cached) CLIP text encoder. Safe to call repeatedly —
 * only the first call triggers a network fetch; concurrent callers share one
 * in-flight promise.
 */
export async function loadTextEncoder(onProgress?: ProgressListener): Promise<Encoder> {
  if (cached) return cached;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const report = (label: string) =>
      onProgress?.({ progress: aggregate(), label });

    report("loading library");
    const TX: any = await importTransformers();

    // Hub-only: we never ship local model files for this piece.
    TX.env.allowLocalModels = false;
    if (TX.env.backends?.onnx?.wasm) {
      // A tiny thread pool keeps wasm inference smooth without spawning a farm.
      TX.env.backends.onnx.wasm.numThreads = 1;
    }

    const progress_callback = (data: any) => {
      if (data?.file && typeof data.total === "number" && data.total > 0) {
        fileTotals[data.file] = data.total;
        fileLoaded[data.file] = Math.min(data.total, data.loaded ?? 0);
      }
      const phase =
        data?.status === "ready"
          ? "initializing"
          : data?.file
            ? `downloading ${String(data.file).split("/").pop()}`
            : "downloading model";
      report(phase);
    };

    report("downloading tokenizer");
    const tokenizer = await TX.AutoTokenizer.from_pretrained(MODEL_ID, {
      progress_callback,
    });

    // Prefer the small quantized text head; fall back to full precision if a
    // given repo/runtime doesn't have the quantized artifact.
    let model: any;
    try {
      model = await TX.CLIPTextModelWithProjection.from_pretrained(MODEL_ID, {
        dtype: "q8",
        progress_callback,
      });
    } catch {
      report("retrying (fp32)");
      model = await TX.CLIPTextModelWithProjection.from_pretrained(MODEL_ID, {
        dtype: "fp32",
        progress_callback,
      });
    }

    cached = { tokenizer, model };
    onProgress?.({ progress: 1, label: "ready" });
    return cached;
  })();

  try {
    return await inFlight;
  } catch (err) {
    inFlight = null; // allow a later retry
    throw err;
  }
}

/** True once the encoder has finished loading in this session. */
export function isEncoderReady(): boolean {
  return cached !== null;
}

function l2normalize(v: number[]): number[] {
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n) || 1;
  return v.map((x) => x / n);
}

/** Embed one short text prompt into the L2-normalized 512-d joint space. */
export async function embedText(prompt: string): Promise<number[]> {
  const { tokenizer, model } = await loadTextEncoder();
  const inputs = tokenizer([prompt], { padding: true, truncation: true });
  const out = await model(inputs);
  const data: number[] = Array.from(out.text_embeds.data as Float32Array);
  return l2normalize(data);
}

/**
 * Build a semantic axis from two text poles: axis = normalize(right − left).
 * A point's coordinate on this axis is then simply dot(point.embedding, axis).
 */
export async function buildAxis(
  leftPole: string,
  rightPole: string,
): Promise<number[]> {
  const [eLeft, eRight] = await Promise.all([
    embedText(leftPole),
    embedText(rightPole),
  ]);
  const axis = eRight.map((v, i) => v - eLeft[i]);
  return l2normalize(axis);
}

/** Dot product of an embedding against a unit axis vector. */
export function projectOnto(embedding: number[], axis: number[]): number {
  let s = 0;
  const n = Math.min(embedding.length, axis.length);
  for (let i = 0; i < n; i++) s += embedding[i] * axis[i];
  return s;
}
