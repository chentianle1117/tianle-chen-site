// @ts-nocheck
/**
 * engine.ts — the client-side inference core for Vision Lab.
 *
 * Loads transformers.js at RUNTIME from a CDN (never bundled), negotiates the
 * best available execution provider (WebGPU → WASM), and lazily instantiates +
 * caches one pipeline per task. Model weights are fetched from the Hugging Face
 * hub on first use and cached by the browser (Cache Storage), so switching
 * between tasks — or coming back later — is instant.
 *
 * Nothing here touches the network except the CDN module + the HF weight files.
 * No image ever leaves the browser: inference runs on `navigator.gpu` (WebGPU)
 * or the WASM build of ONNX Runtime Web, entirely on-device.
 */

export type Device = "webgpu" | "wasm";

export interface ModelSpec {
  /** transformers.js task id */
  task: string;
  /** HF hub model id */
  model: string;
  /** Human label for the UI */
  title: string;
  /** Approximate first-load download, quantized. Communicated to the user. */
  approxMB: number;
  /** One-line description of what the model does. */
  blurb: string;
}

export const MODELS: Record<"classify" | "depth", ModelSpec> = {
  classify: {
    task: "zero-shot-image-classification",
    model: "Xenova/clip-vit-base-patch32",
    title: "CLIP ViT-B/32",
    approxMB: 147,
    blurb:
      "OpenAI's CLIP — a joint image/text encoder. Scores an image against arbitrary text labels by cosine similarity in a shared embedding space.",
  },
  depth: {
    task: "depth-estimation",
    model: "Xenova/depth-anything-small-hf",
    title: "Depth Anything (small)",
    approxMB: 26,
    blurb:
      "Monocular depth estimation — predicts a per-pixel relative depth map from a single RGB image, no stereo or sensor data.",
  },
};

// The CDN entry point. Loaded once, memoised. `@vite-ignore` stops the dev
// server from trying to pre-bundle a bare https URL.
const CDN = "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

let _libPromise: Promise<any> | null = null;
async function lib(): Promise<any> {
  if (!_libPromise) {
    _libPromise = (async () => {
      const mod = await import(/* @vite-ignore */ CDN);
      // Remote-only: don't probe a local /models path (there isn't one), and
      // keep the browser cache on so weights persist across visits.
      try {
        mod.env.allowLocalModels = false;
        mod.env.useBrowserCache = true;
      } catch {
        /* older/newer builds may shape env differently — non-fatal */
      }
      return mod;
    })();
  }
  return _libPromise;
}

/** Detect the preferred device once. WebGPU if the browser exposes it. */
let _device: Device | null = null;
export function preferredDevice(): Device {
  if (_device) return _device;
  const hasGPU =
    typeof navigator !== "undefined" && (navigator as any).gpu != null;
  _device = hasGPU ? "webgpu" : "wasm";
  return _device;
}

/**
 * Progress reporting. transformers.js emits one event stream per file being
 * downloaded (config, tokenizer, onnx weights…). We aggregate them into a
 * single 0–100 percentage weighted by byte totals so the UI shows one smooth
 * bar rather than a flickering per-file number.
 */
export interface LoadProgress {
  percent: number; // 0..100
  file?: string; // current/last file touched
  note?: string; // status hint, e.g. "compiling shaders"
}

function makeAggregator(onProgress?: (p: LoadProgress) => void) {
  const files = new Map<string, { loaded: number; total: number }>();
  let lastFile = "";
  return (data: any) => {
    if (!data) return;
    const status = data.status;
    const name: string = data.file || data.name || lastFile;
    if (name) lastFile = name;

    if (status === "progress" || status === "download") {
      const total = Number(data.total) || 0;
      const loaded = Number(data.loaded) || 0;
      if (total > 0) files.set(name, { loaded, total });
    } else if (status === "done") {
      const rec = files.get(name);
      if (rec) rec.loaded = rec.total; // clamp finished file to 100%
    }

    let sumLoaded = 0;
    let sumTotal = 0;
    files.forEach((r) => {
      sumLoaded += r.loaded;
      sumTotal += r.total;
    });
    const raw = sumTotal > 0 ? (100 * sumLoaded) / sumTotal : 0;
    // Never report a hard 100% from download alone — model still has to
    // instantiate/compile. Cap at 99 until the pipeline resolves.
    const percent = Math.min(99, Math.round(raw));
    const note =
      status === "ready" || status === "done" ? "initialising" : undefined;
    onProgress?.({
      percent,
      file: shortName(lastFile),
      note,
    });
  };
}

function shortName(f?: string): string | undefined {
  if (!f) return undefined;
  const parts = f.split("/");
  return parts[parts.length - 1] || f;
}

// One cached pipeline promise per task. Keyed so a second request reuses the
// in-flight or resolved instance — models are never loaded twice.
const _pipes: Partial<Record<"classify" | "depth", Promise<any>>> = {};
// The device each task actually ended up on (may differ from preferred if
// WebGPU init failed and we fell back to WASM).
const _actualDevice: Partial<Record<"classify" | "depth", Device>> = {};

export function actualDevice(task: "classify" | "depth"): Device | null {
  return _actualDevice[task] ?? null;
}

async function build(
  key: "classify" | "depth",
  onProgress?: (p: LoadProgress) => void
): Promise<{ pipe: any; device: Device }> {
  const spec = MODELS[key];
  const { pipeline } = await lib();
  const progress_callback = makeAggregator(onProgress);

  const tryDevice = async (device: Device) => {
    onProgress?.({ percent: 0, note: `starting on ${device.toUpperCase()}` });
    const pipe = await pipeline(spec.task, spec.model, {
      device,
      // q8 is broadly available across both providers and keeps the download
      // small; quality is more than enough for a demo.
      dtype: "q8",
      progress_callback,
    });
    return pipe;
  };

  const first = preferredDevice();
  try {
    const pipe = await tryDevice(first);
    _actualDevice[key] = first;
    return { pipe, device: first };
  } catch (err) {
    // WebGPU can fail to initialise on some drivers/browsers — fall back to
    // WASM transparently rather than surfacing an error.
    if (first === "webgpu") {
      onProgress?.({ percent: 0, note: "WebGPU unavailable — using WASM" });
      const pipe = await tryDevice("wasm");
      _actualDevice[key] = "wasm";
      return { pipe, device: "wasm" };
    }
    throw err;
  }
}

/** Load (or return the cached) pipeline for a task. */
export function loadModel(
  key: "classify" | "depth",
  onProgress?: (p: LoadProgress) => void
): Promise<{ pipe: any; device: Device }> {
  if (!_pipes[key]) {
    _pipes[key] = build(key, onProgress).catch((e) => {
      // Reset cache on failure so the user can retry.
      _pipes[key] = undefined;
      throw e;
    });
  } else if (_actualDevice[key]) {
    // Already resolved (or resolving) — jump the UI to a ready-ish state.
    onProgress?.({ percent: 100, note: "cached" });
  }
  return _pipes[key];
}

/** Turn a raw error into a friendly, actionable message. */
export function friendlyError(err: unknown): string {
  const msg = String((err as any)?.message || err || "Unknown error");
  if (/fetch|network|Failed to fetch|load model|ENOTFOUND/i.test(msg)) {
    return "Couldn't download the model. Check your connection and try again — the weights are fetched once from the Hugging Face hub.";
  }
  if (/gpu|webgpu|adapter/i.test(msg)) {
    return "GPU backend failed to start. Reload and it will retry on the WASM (CPU) backend.";
  }
  if (/memory|allocation|oom/i.test(msg)) {
    return "Ran out of memory running the model. Try a smaller image or close other tabs.";
  }
  return `Inference failed: ${msg}`;
}
