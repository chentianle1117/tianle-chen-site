// @ts-nocheck
/**
 * LatentAtlas.tsx — flagship interactive latent-space explorer.
 *
 * A field of ~160 procedurally generated abstract posters, embedded offline
 * with CLIP (image branch) and laid out by PCA. The signature interaction:
 * type a semantic axis as two text poles (or click a preset), and the atlas
 * reprojects — X becomes each poster's dot product against
 * normalize(embed(right) − embed(left)) in CLIP's joint image-text space,
 * Y stays the stable secondary PCA component. The CLIP TEXT encoder is loaded
 * at runtime from a CDN; image embeddings were precomputed, so no image model
 * ever loads in the browser.
 *
 * Everything degrades gracefully: the PCA scatter is fully interactive before
 * any axis is typed, and text-encoder load failures surface a clear retry
 * without breaking the view.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Scatter, { type AtlasPoint, type LayoutCoord } from "./Scatter";
import {
  buildAxis,
  loadTextEncoder,
  projectOnto,
  isEncoderReady,
  type LoadProgress,
} from "./clip";

interface PointsFile {
  model: string;
  dim: number;
  count: number;
  points: AtlasPoint[];
}

interface Chip {
  name: string;
  left: string;
  right: string;
}

// Presets chosen from offline validation — each visibly sorts the corpus
// (r shown for reference: warm 0.81, angular 0.84, dense 0.61, bright 0.64).
// "geometric ↔ organic" is deliberately included as the subtle case.
const CHIPS: Chip[] = [
  { name: "warm ↔ cool", left: "a cool colored image", right: "a warm colored image" },
  { name: "angular ↔ round", left: "soft round shapes", right: "sharp angular shapes" },
  { name: "dense ↔ sparse", left: "a sparse minimal composition", right: "a dense busy composition" },
  { name: "bright ↔ dark", left: "a dark image", right: "a bright light image" },
  { name: "playful ↔ serious", left: "serious and severe", right: "playful and fun" },
  { name: "geometric ↔ organic", left: "organic natural forms", right: "geometric shapes" },
];

const MODEL_MB = 63; // approx first-load download for the quantized text head

function normalizeScores(scores: number[]): number[] {
  const mn = Math.min(...scores);
  const mx = Math.max(...scores);
  const span = mx - mn || 1;
  return scores.map((s) => ((s - mn) / span) * 2 - 1);
}

type ModelState =
  | { phase: "idle" }
  | { phase: "loading"; progress: number; label: string }
  | { phase: "ready" }
  | { phase: "error"; message: string };

export default function LatentAtlas() {
  const [data, setData] = useState<PointsFile | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  const [leftPole, setLeftPole] = useState("a cool colored image");
  const [rightPole, setRightPole] = useState("a warm colored image");
  // The poles actually applied to the current layout (for edge labels).
  const [applied, setApplied] = useState<{ left: string; right: string } | null>(
    null,
  );
  const [mode, setMode] = useState<"pca" | "axis">("pca");
  const [scores, setScores] = useState<number[] | null>(null);
  const [model, setModel] = useState<ModelState>({ phase: "idle" });
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Load precomputed points.
  useEffect(() => {
    let alive = true;
    fetch("/data/latent-atlas/points.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: PointsFile) => {
        if (alive) setData(json);
      })
      .catch((e) => {
        if (alive) setDataError(String(e?.message ?? e));
      });
    return () => {
      alive = false;
    };
  }, []);

  const points = data?.points ?? [];

  // Compute the layout the scatter should animate toward.
  const layout: LayoutCoord[] = useMemo(() => {
    if (points.length === 0) return [];
    if (mode === "axis" && scores) {
      const nx = normalizeScores(scores);
      // X = axis score; Y = stable secondary PCA component (point.y).
      return points.map((p, i) => ({ x: nx[i], y: p.y }));
    }
    return points.map((p) => ({ x: p.x, y: p.y }));
  }, [points, mode, scores]);

  const busy = model.phase === "loading";

  async function runProjection(l: string, r: string) {
    const lp = l.trim();
    const rp = r.trim();
    if (!lp || !rp) return;
    try {
      if (!isEncoderReady()) {
        setModel({ phase: "loading", progress: 0, label: "starting" });
        await loadTextEncoder((p: LoadProgress) =>
          setModel({ phase: "loading", progress: p.progress, label: p.label }),
        );
      }
      setModel({ phase: "ready" });
      const axis = await buildAxis(lp, rp);
      const raw = points.map((p) => projectOnto(p.embedding, axis));
      setScores(raw);
      setApplied({ left: lp, right: rp });
      setMode("axis");
    } catch (e: any) {
      setModel({
        phase: "error",
        message:
          "Could not load the CLIP text encoder (network or CDN issue). The map still works — try again.",
      });
    }
  }

  function onChip(chip: Chip) {
    setLeftPole(chip.left);
    setRightPole(chip.right);
    setActiveChip(chip.name);
    runProjection(chip.left, chip.right);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActiveChip(null);
    runProjection(leftPole, rightPole);
  }

  function toOverview() {
    setMode("pca");
    setActiveChip(null);
  }

  // Edge labels per mode.
  const labels = useMemo(() => {
    if (mode === "axis" && applied) {
      return {
        left: applied.left.toUpperCase(),
        right: applied.right.toUpperCase(),
        top: "SECONDARY · PC-2",
        bottom: "",
        subtitle: "SEMANTIC AXIS · X = dot(embedding, axis)",
      };
    }
    return {
      left: "PC-1 −",
      right: "PC-1 +",
      top: "PC-2 +",
      bottom: "PC-2 −",
      subtitle: "PCA · unsupervised layout of CLIP space",
    };
  }, [mode, applied]);

  return (
    <div className="la-root">
      {/* ── Control deck ─────────────────────────────────────────────── */}
      <div className="la-deck">
        <form className="la-axisform" onSubmit={onSubmit}>
          <div className="la-poles">
            <label className="la-field">
              <span className="la-field-tag">LEFT POLE</span>
              <input
                type="text"
                value={leftPole}
                onChange={(e) => setLeftPole(e.target.value)}
                placeholder="e.g. cool"
                spellCheck={false}
                aria-label="Left pole prompt"
              />
            </label>
            <span className="la-arrow" aria-hidden>
              ⟷
            </span>
            <label className="la-field">
              <span className="la-field-tag">RIGHT POLE</span>
              <input
                type="text"
                value={rightPole}
                onChange={(e) => setRightPole(e.target.value)}
                placeholder="e.g. warm"
                spellCheck={false}
                aria-label="Right pole prompt"
              />
            </label>
            <button
              type="submit"
              className="la-project"
              disabled={busy || !leftPole.trim() || !rightPole.trim()}
            >
              {busy ? "Loading…" : "Reproject →"}
            </button>
          </div>

          <div className="la-chips" role="group" aria-label="Preset axes">
            {CHIPS.map((c) => (
              <button
                type="button"
                key={c.name}
                className={`la-chip${activeChip === c.name ? " is-active" : ""}`}
                onClick={() => onChip(c)}
                disabled={busy}
              >
                {c.name}
              </button>
            ))}
          </div>
        </form>

        <div className="la-status">
          {mode === "axis" ? (
            <button type="button" className="la-overview" onClick={toOverview}>
              ↺ Overview (PCA)
            </button>
          ) : (
            <span className="la-hint">
              Drag to pan · scroll to zoom · hover a tile to inspect
            </span>
          )}

          {model.phase === "loading" ? (
            <div className="la-progress" role="status" aria-live="polite">
              <div className="la-progress-bar">
                <span
                  style={{ width: `${Math.round(model.progress * 100)}%` }}
                />
              </div>
              <span className="la-progress-label">
                {model.label} · {Math.round(model.progress * 100)}% (~{MODEL_MB}MB
                once)
              </span>
            </div>
          ) : null}

          {model.phase === "error" ? (
            <span className="la-error" role="alert">
              {model.message}
            </span>
          ) : null}

          {model.phase === "ready" && mode === "axis" ? (
            <span className="la-ready">CLIP text encoder ready · in-browser</span>
          ) : null}
        </div>
      </div>

      {/* ── The canvas ───────────────────────────────────────────────── */}
      {dataError ? (
        <div className="la-scatter-frame la-fallback">
          <p>Could not load the atlas data ({dataError}).</p>
        </div>
      ) : points.length === 0 ? (
        <div className="la-scatter-frame la-fallback">
          <div className="la-spinner" aria-hidden />
          <p>Loading {160} embedded posters…</p>
        </div>
      ) : (
        <Scatter
          points={points}
          layout={layout}
          scores={mode === "axis" ? scores : null}
          mode={mode}
          leftLabel={labels.left}
          rightLabel={labels.right}
          topLabel={labels.top}
          bottomLabel={labels.bottom}
          subtitle={labels.subtitle}
          reduced={reduced}
        />
      )}

      {/* ── Honest annotation ────────────────────────────────────────── */}
      <p className="la-annotation">
        <strong>No training.</strong> A semantic axis is just the difference
        between two text-prompt embeddings in CLIP&apos;s joint image-text
        space; each poster&apos;s position along it is a single dot product.
        Image embeddings are precomputed ({data ? data.count : 160} ×{" "}
        {data ? data.dim : 512}-d, {data?.model ?? "clip-vit-base-patch32"});
        the text encoder runs live in your browser.
      </p>

      <style>{css}</style>
    </div>
  );
}

const css = `
.la-root { width: 100%; }

/* ── control deck (tokenized — flips light/dark) ───────────────────── */
.la-deck {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 1rem;
}
.la-axisform { display: flex; flex-direction: column; gap: 0.75rem; }
.la-poles {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.6rem;
}
.la-field { display: flex; flex-direction: column; gap: 0.3rem; flex: 1 1 220px; min-width: 0; }
.la-field-tag {
  font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(var(--text-mono));
}
.la-field input {
  font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
  font-size: var(--step--1);
  color: rgb(var(--text-primary));
  background: rgb(var(--surface-1-rgb));
  border: 1px solid rgb(var(--surface-border));
  border-radius: 5px;
  padding: 0.5rem 0.7rem;
  width: 100%;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.la-field input:focus {
  outline: none;
  border-color: rgb(var(--accent-rgb) / 0.6);
  box-shadow: 0 0 0 3px rgb(var(--accent-rgb) / 0.14);
}
.la-arrow {
  font-size: 1.1rem;
  color: rgb(var(--accent-rgb));
  padding-bottom: 0.5rem;
  align-self: flex-end;
}
.la-project {
  font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
  font-size: var(--step--1);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: white;
  background: rgb(var(--accent-rgb));
  border: 1px solid rgb(var(--accent-rgb));
  border-radius: 5px;
  padding: 0.55rem 1.1rem;
  cursor: pointer;
  white-space: nowrap;
  align-self: flex-end;
  transition: background 180ms ease, opacity 180ms ease;
}
.la-project:hover:not(:disabled) { background: rgb(var(--accent-hover)); border-color: rgb(var(--accent-hover)); }
.la-project:disabled { opacity: 0.5; cursor: not-allowed; }

.la-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.la-chip {
  font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgb(var(--text-secondary));
  background: rgb(var(--surface-1-rgb) / 0.5);
  border: 1px solid rgb(var(--surface-border));
  border-radius: 4px;
  padding: 0.3rem 0.65rem;
  cursor: pointer;
  transition: all 150ms ease;
}
.la-chip:hover:not(:disabled) { border-color: rgb(var(--accent-rgb) / 0.5); color: rgb(var(--text-primary)); }
.la-chip.is-active { border-color: rgb(var(--accent-rgb)); color: rgb(var(--accent-rgb)); background: rgb(var(--accent-rgb) / 0.1); }
.la-chip:disabled { opacity: 0.5; cursor: default; }

.la-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  min-height: 1.5rem;
  font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
  font-size: 11px;
  letter-spacing: 0.05em;
  color: rgb(var(--text-mono));
}
.la-hint { text-transform: uppercase; }
.la-overview {
  font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(var(--text-primary));
  background: transparent;
  border: 1px solid rgb(var(--surface-border));
  border-radius: 4px;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
  transition: border-color 150ms ease, color 150ms ease;
}
.la-overview:hover { border-color: rgb(var(--accent-rgb) / 0.5); color: rgb(var(--accent-rgb)); }
.la-progress { display: flex; align-items: center; gap: 0.6rem; flex: 1 1 240px; }
.la-progress-bar {
  position: relative;
  flex: 1;
  height: 4px;
  max-width: 220px;
  background: rgb(var(--surface-border));
  border-radius: 2px;
  overflow: hidden;
}
.la-progress-bar span {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: rgb(var(--accent-rgb));
  transition: width 200ms ease;
}
.la-progress-label { white-space: nowrap; }
.la-error { color: rgb(var(--accent-rgb)); text-transform: none; letter-spacing: 0; }
.la-ready { color: rgb(var(--text-mono)); }

/* ── canvas (intentionally dark in BOTH themes) ─────────────────────── */
.la-scatter-frame {
  position: relative;
  width: 100%;
  height: clamp(440px, 64vh, 760px);
  background:
    radial-gradient(120% 120% at 50% 0%, #14171b 0%, #0b0d0f 60%);
  border: 1px solid rgb(var(--surface-border));
  border-radius: 10px;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
}
.la-scatter-frame:active { cursor: grabbing; }
.la-plane { position: relative; width: 100%; height: 100%; }
.la-grid {
  position: absolute; inset: 0;
  background-image:
    repeating-linear-gradient(to right, rgba(255,255,255,0.035) 0 1px, transparent 1px calc(100%/12)),
    repeating-linear-gradient(to bottom, rgba(255,255,255,0.035) 0 1px, transparent 1px calc(100%/12));
  pointer-events: none;
}
.la-tile {
  position: absolute;
  transform: translate(-50%, -50%);
  will-change: left, top;
}
.la-tile-inner {
  --tile: 44px;
  width: var(--tile);
  height: var(--tile);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 2px 8px -3px rgba(0,0,0,0.6);
  transition: transform 240ms cubic-bezier(0.22,1,0.36,1), box-shadow 240ms ease, border-color 240ms ease;
  background: #0b0d0f;
}
.la-tile-inner img { width: 100%; height: 100%; object-fit: cover; display: block; user-select: none; }
.la-tile-inner.is-hovered {
  transform: scale(2.6);
  border-color: rgba(184,98,63,0.9);
  box-shadow: 0 12px 34px -8px rgba(0,0,0,0.85);
}
.la-tip {
  position: absolute;
  left: 50%;
  top: calc(50% + 62px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 4px 8px;
  background: rgba(11,13,15,0.94);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 4px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1001;
}
.la-tip-id { font-size: 10px; color: #f4f5f6; letter-spacing: 0.06em; }
.la-tip-score { font-size: 9px; color: #d18260; letter-spacing: 0.04em; }

/* Edge axis labels — fixed on the dark canvas, so fixed light colors. */
.la-axis {
  position: absolute;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(244,245,246,0.72);
  pointer-events: none;
  z-index: 40;
  max-width: 42%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.la-axis-left { left: 12px; top: 50%; transform: translateY(-50%) rotate(180deg); writing-mode: vertical-rl; }
.la-axis-right { right: 12px; top: 50%; transform: translateY(-50%); writing-mode: vertical-rl; }
.la-axis-top { top: 12px; left: 50%; transform: translateX(-50%); }
.la-axis-bottom { bottom: 12px; left: 50%; transform: translateX(-50%); }
.la-subtitle {
  position: absolute;
  right: 14px; bottom: 12px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(209,130,96,0.85);
  pointer-events: none;
  z-index: 40;
}

/* Left/right poles get an accent tint so they read as the active axis. */
.la-axis-left, .la-axis-right { color: rgba(233,164,138,0.92); }

.la-zoom {
  position: absolute;
  right: 12px; top: 12px;
  display: flex; flex-direction: column; gap: 4px;
  z-index: 45;
}
.la-zoom button {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  font-size: 15px; line-height: 1;
  color: #f4f5f6;
  background: rgba(20,23,27,0.85);
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 5px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition: background 150ms ease, border-color 150ms ease;
}
.la-zoom button:hover { background: rgba(184,98,63,0.35); border-color: rgba(184,98,63,0.7); }

.la-fallback {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1rem; color: rgba(244,245,246,0.7);
  font-family: 'IBM Plex Mono', ui-monospace, monospace; font-size: 12px;
}
.la-spinner {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
  border-top-color: #d18260;
  animation: la-spin 900ms linear infinite;
}
@keyframes la-spin { to { transform: rotate(360deg); } }

.la-annotation {
  margin-top: 1rem;
  font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
  font-size: var(--step--1);
  line-height: 1.6;
  color: rgb(var(--text-secondary));
  max-width: 70ch;
}
.la-annotation strong { color: rgb(var(--accent-rgb)); font-weight: 600; }

@media (prefers-reduced-motion: reduce) {
  .la-tile-inner, .la-progress-bar span { transition: none; }
  .la-spinner { animation: none; }
}
`;
