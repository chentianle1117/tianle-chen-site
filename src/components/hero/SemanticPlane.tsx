/**
 * SemanticPlane.tsx — primary 2D semantic-axes view for the latent-space hero.
 *
 * All-HTML approach (no SVG) so every measurement uses the same px-based
 * padding and scales identically. Hairlines, grid, ticks, labels, and
 * sprites are all absolutely-positioned <div>s inside the plot box.
 *
 * Stacking contract (z-index):
 *   - PlotFrame chrome (border, grid, ticks, labels): default flow (z=0)
 *   - Sprite layer container: z-index 10 (sprites animate within this)
 *   - HTML overlays (ModePanel/AxisInputs/Tooltip) sit OUTSIDE this component
 *     and own z-index 30+ in HeroNavigator
 *
 * Sprites are absolute-positioned <button>s with a CSS background slice
 * from /data/atlas.png. Layout swaps tween x/y for each sprite over 800ms
 * with eased interpolation (easeInOutCubic), with per-sprite stagger
 * (0–120ms) by hash(slug) so sprites ease into place in a wave.
 *
 * Hover scales 1.0 → 1.15 over 220ms but never escapes the sprite layer's
 * stacking context — sprites can't render above ModePanel/AxisInputs.
 *
 * Reduced motion: layout swaps and hover scaling collapse to instant.
 */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  type LayoutDataBundle,
  type ProjectEmbedding,
  type ProjectMedia,
  type ThesisAxisPreset,
} from "../../lib/layoutData";
import { projectThesisToLayout } from "../../lib/projectThesis";
import { useNavStore, type LayoutKey } from "../../lib/nav-store";
import { prefersReducedMotion } from "../../lib/detectWebGL";

interface SemanticPlaneProps {
  data: LayoutDataBundle;
  /** When provided, the right reservation is wider so the ModePanel never collides. */
  reserveRightForPanel?: boolean;
  /** When provided, the bottom reservation is wider so AxisInputs never collides. */
  reserveBottomForInputs?: boolean;
  /** Round-9d: when true, the plot fills the parent container (no internal
   * mx-auto centering, no max-width on the plot box). Used by the new
   * sidebar layout where the canvas already lives inside a centered
   * max-width column — internal centering would create double-padding. */
  fillContainer?: boolean;
}

type Coord = [number, number, number];
type Layout = Record<string, Coord>;

const SWAP_DURATION_MS = 800;
// Round-8: hover-zoom-on-tile replaces canvas wheel-zoom. Hovering any tile
// scales it 2.5× so the user can read it at full resolution without leaving
// the scatter. Other tiles dim. Caption stays anchored.
const HOVER_SCALE = 2.5;
const SPRITE_PX_DESKTOP = 64;
const SPRITE_PX_MOBILE = 48;
const CAPTION_MAX_CHARS = 36;

// Color tokens — hero stays dark in both themes per contracts.
const PLANE_BG = "#0b0d0f";
const HAIRLINE = "rgba(94, 99, 107, 0.40)";
// Bumped from 0.04 -> 0.10 alpha for visible coordinate-system grid (eval #9).
const GRID = "rgba(94, 99, 107, 0.10)";
const TICK_COLOR = "rgba(180, 185, 192, 0.65)";
// Bumped axis-label contrast from graphite-400-ish to graphite-200 (eval #23, #40).
const LABEL_COLOR = "#d8dadd";
const LABEL_DIM = "#a8acb1";
const SPRITE_BORDER = "rgba(150, 155, 162, 0.30)";
const SPRITE_BORDER_HOVER = "rgba(184, 98, 63, 0.85)"; // oxide

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Tiny deterministic hash for stable per-slug stagger. */
function hashSlug(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pickStaticLayout(data: LayoutDataBundle, layout: LayoutKey): Layout {
  if (layout === "thesis") return data.layouts.thesis_default;
  return data.layouts[layout];
}

/**
 * Round-7: anti-overlap iterative collision avoidance.
 *
 * Sprites are 64px on a ~1088px wide plot — 64 / 1088 ≈ 0.118 in normalized
 * data units (data x is [-1, +1] mapped across the inset width). With a caption
 * row beneath each sprite, ~0.22 minimum centre-to-centre keeps tile + label
 * legible.
 *
 * For each pair within minDist we push them apart by half the overlap.
 * Iterate until stable or 60 rounds. Final clamp to [-1, +1].
 */
function jitterApartLayout(layout: Layout, minDist = 0.22): Layout {
  const slugs = Object.keys(layout);
  type Pt = { x: number; y: number; z: number };
  const arr: Record<string, Pt> = {};
  for (const s of slugs) {
    const c = layout[s];
    arr[s] = { x: c[0], y: c[1], z: c[2] ?? 0 };
  }
  for (let iter = 0; iter < 60; iter++) {
    let moved = false;
    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        const a = arr[slugs[i]];
        const b = arr[slugs[j]];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        if (dist < minDist) {
          if (dist < 1e-4) {
            // perfectly stacked — nudge along a deterministic angle
            const ang = (i * 137.5 * Math.PI) / 180;
            a.x -= Math.cos(ang) * minDist * 0.5;
            a.y -= Math.sin(ang) * minDist * 0.5;
            b.x += Math.cos(ang) * minDist * 0.5;
            b.y += Math.sin(ang) * minDist * 0.5;
            dist = minDist;
          } else {
            const overlap = (minDist - dist) / 2;
            const ux = dx / dist;
            const uy = dy / dist;
            a.x -= ux * overlap;
            a.y -= uy * overlap;
            b.x += ux * overlap;
            b.y += uy * overlap;
          }
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  // Round-9: tighter clamp keeps tiles fully inside the plot inset, with
  // breathing room for hover scale (2.5×) so sprites never overlap the
  // axis-tick labels at the rim. Was ±0.98, now ±0.86.
  const out: Layout = {};
  for (const s of slugs) {
    const p = arr[s];
    out[s] = [
      Math.max(-0.86, Math.min(0.86, p.x)),
      Math.max(-0.86, Math.min(0.86, p.y)),
      p.z,
    ];
  }
  return out;
}

function computeThesisLayout(
  data: LayoutDataBundle,
  axisKeys: [string, string, string],
  presets: Record<string, ThesisAxisPreset>,
): Layout {
  const dirs: [number[], number[], number[]] = [
    presets[axisKeys[0]]?.direction ?? [],
    presets[axisKeys[1]]?.direction ?? [],
    presets[axisKeys[2]]?.direction ?? [],
  ];
  if (dirs.some((d) => d.length === 0)) return data.layouts.thesis_default;
  return projectThesisToLayout(
    data.embeddings.projects.map((p) => ({
      slug: p.slug,
      embedding: p.embedding,
    })),
    dirs,
  ) as Layout;
}

interface AxisLabelSet {
  xLeft: string;
  xRight: string;
  yTop: string;
  yBottom: string;
  /** Optional small caption shown top-right. */
  subtitle?: string;
}

function resolveAxisLabels(
  activeLayout: LayoutKey,
  thesisAxes: [string, string, string],
  presets: Record<string, ThesisAxisPreset>,
): AxisLabelSet {
  if (activeLayout === "thesis") {
    const xPreset = presets[thesisAxes[0]];
    const yPreset = presets[thesisAxes[1]];
    return {
      // labels[0] = positive direction, labels[1] = negative direction
      xLeft: (xPreset?.labels?.[1] ?? "−X").toUpperCase(),
      xRight: (xPreset?.labels?.[0] ?? "+X").toUpperCase(),
      yTop: (yPreset?.labels?.[0] ?? "+Y").toUpperCase(),
      yBottom: (yPreset?.labels?.[1] ?? "−Y").toUpperCase(),
    };
  }
  if (activeLayout === "umap") {
    return {
      xLeft: "UMAP-1",
      xRight: "UMAP-1",
      yTop: "UMAP-2",
      yBottom: "UMAP-2",
      subtitle: "NEIGHBORS=5",
    };
  }
  if (activeLayout === "pca") {
    return {
      xLeft: "PC1",
      xRight: "PC1",
      yTop: "PC2",
      yBottom: "PC2",
      subtitle: "FIRST 2 COMPONENTS",
    };
  }
  // metadata
  return {
    xLeft: "ML / AI",
    xRight: "ARCHITECTURE",
    yTop: "2026",
    yBottom: "2022",
    subtitle: "DOMAIN × YEAR",
  };
}

interface SpritePosState {
  x: number;
  y: number;
}

export default function SemanticPlane({
  data,
  reserveRightForPanel = false,
  reserveBottomForInputs = false,
  fillContainer = false,
}: SemanticPlaneProps) {
  const activeLayout = useNavStore((s) => s.activeLayout);
  const thesisAxes = useNavStore((s) => s.thesisAxes);
  const hoveredSlug = useNavStore((s) => s.hoveredSlug);
  const setHovered = useNavStore((s) => s.setHovered);

  const projects = data.embeddings.projects;
  const presets = data.layouts.thesis_axes_cache;
  const N = projects.length;

  // ──────────────────────────────────────────────────────────────────────
  // Compute the target (next) layout whenever inputs change.
  // ──────────────────────────────────────────────────────────────────────
  const targetLayout: Layout = useMemo(() => {
    const raw =
      activeLayout === "thesis"
        ? computeThesisLayout(data, thesisAxes, presets)
        : pickStaticLayout(data, activeLayout);
    // Round-7+8: post-projection anti-overlap pass. Bigger min-distance (0.32
    // vs 0.22) gives every tile + caption clear breathing room — fixes the
    // "thumbnails not matching titles" complaint, which was actually neighbor
    // captions visually merging into each other.
    return jitterApartLayout(raw, 0.32);
  }, [data, activeLayout, thesisAxes, presets]);

  // ──────────────────────────────────────────────────────────────────────
  // Per-sprite position state via refs; rAF drives a re-render via setTick.
  // ──────────────────────────────────────────────────────────────────────
  const fromRef = useRef<SpritePosState[]>([]);
  const toRef = useRef<SpritePosState[]>([]);
  const currentRef = useRef<SpritePosState[]>([]);
  const staggerRef = useRef<number[]>([]);
  const startRef = useRef<number>(0);
  const animatingRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  const reduced = useMemo(prefersReducedMotion, []);

  // Initialize positions from thesis_default once. Apply collision-resolve
  // here so the FIRST render is already non-overlapping. Subsequent
  // updates resolve on the target, not on every frame (Round-9n).
  if (currentRef.current.length === 0) {
    const initial = data.layouts.thesis_default;
    const raw = projects.map((p) => {
      const c = initial[p.slug] ?? [0, 0, 0];
      return { x: c[0], y: c[1] };
    });
    currentRef.current = resolveCollisions(raw);
    fromRef.current = currentRef.current.map((s) => ({ ...s }));
    toRef.current = currentRef.current.map((s) => ({ ...s }));
    staggerRef.current = projects.map(
      (p) => (hashSlug(p.slug) % 1000) / 1000,
    );
  }

  const [, setTick] = useState(0);

  // ──────────────────────────────────────────────────────────────────────
  // Drive layout swap when target changes.
  // ──────────────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    fromRef.current = currentRef.current.map((s) => ({ ...s }));
    // Round-9n: collision-resolve the TARGET only — once. Previously the
    // resolve ran every frame against currentRef which produced jittery
    // mid-animation paths. Now the destination is locked-in non-
    // overlapping, the animation is a clean lerp from→to, and tiles may
    // briefly cross each other in flight (acceptable: it reads as
    // "regrouping" rather than "stuttering").
    const rawTarget = projects.map((p) => {
      const c = targetLayout[p.slug] ?? [0, 0, 0];
      return { x: c[0], y: c[1] };
    });
    toRef.current = resolveCollisions(rawTarget);

    if (reduced) {
      currentRef.current = toRef.current.map((s) => ({ ...s }));
      animatingRef.current = false;
      setTick((n) => n + 1);
      return;
    }

    startRef.current = performance.now();
    animatingRef.current = true;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

    const step = () => {
      const now = performance.now();
      const elapsed = now - startRef.current;
      let allDone = true;
      for (let i = 0; i < N; i++) {
        const offset = staggerRef.current[i] * 120;
        const t = Math.min(
          1,
          Math.max(0, (elapsed - offset) / SWAP_DURATION_MS),
        );
        const e = easeInOutCubic(t);
        currentRef.current[i] = {
          x:
            fromRef.current[i].x +
            (toRef.current[i].x - fromRef.current[i].x) * e,
          y:
            fromRef.current[i].y +
            (toRef.current[i].y - fromRef.current[i].y) * e,
        };
        if (t < 1) allDone = false;
      }
      setTick((n) => n + 1);
      if (allDone) {
        animatingRef.current = false;
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLayout, N, reduced]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const labels = resolveAxisLabels(activeLayout, thesisAxes, presets);

  // Round-9l: dot outer-ring opacity encodes recency. Compute the
  // semester_recency range once here so each Sprite can normalize.
  const recencyBounds = (() => {
    const vals = projects
      .map((p) => (p as any).semester_recency)
      .filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return { min: 2022, max: 2026 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  })();

  // Round-9l: legend interactivity — a category highlighted in the side
  // panel dims all non-matching dots so the user can spot "where are my
  // ML projects?" at a glance.
  const highlightedCategory = useNavStore((s) => s.highlightedCategory);

  // Round-9m: collision-resolution pass. Text-block tiles are ~150px ×
  // 32px which is much larger than the previous 12px dots, so semantic
  // clusters now overlap visibly. After the layout interpolation places
  // tiles in [-1, +1]² normalized space, we run an iterative push-apart
  // (10 rounds, O(n²) per round, n≈14 → trivial) that nudges any pair
  // whose bounding boxes overlap. The push happens along the smaller-
  // overlap axis to minimize deviation from the semantic position.
  function resolveCollisions(
    coords: Array<{ x: number; y: number }>,
  ): Array<{ x: number; y: number }> {
    // Tile width ~150px, height ~32px. Plot is roughly 1100px wide × 720px
    // tall at desktop, so in [-1, +1] units (range 2): 150/1100 = 0.27 →
    // half-width 0.14; 32/720 = 0.044 → half-height 0.022. Pad a bit for
    // breathing room.
    const HW = 0.16;
    const HH = 0.04;
    const out = coords.map((c) => ({ x: c.x, y: c.y }));
    for (let iter = 0; iter < 14; iter++) {
      let moved = false;
      for (let i = 0; i < out.length; i++) {
        for (let j = i + 1; j < out.length; j++) {
          const dx = out[j].x - out[i].x;
          const dy = out[j].y - out[i].y;
          const overlapX = 2 * HW - Math.abs(dx);
          const overlapY = 2 * HH - Math.abs(dy);
          if (overlapX > 0 && overlapY > 0) {
            // Push along the smaller-overlap axis so we move the smaller
            // distance — preserves the semantic position better.
            if (overlapX < overlapY) {
              const sign = dx === 0 ? 1 : Math.sign(dx);
              const half = overlapX / 2 + 0.002;
              out[i].x -= half * sign;
              out[j].x += half * sign;
            } else {
              const sign = dy === 0 ? 1 : Math.sign(dy);
              const half = overlapY / 2 + 0.002;
              out[i].y -= half * sign;
              out[j].y += half * sign;
            }
            moved = true;
          }
        }
      }
      if (!moved) break;
    }
    // Clamp back into [-1, +1] in case the push pushed something out.
    for (const c of out) {
      c.x = Math.max(-1, Math.min(1, c.x));
      c.y = Math.max(-1, Math.min(1, c.y));
    }
    return out;
  }

  // ──────────────────────────────────────────────────────────────────────
  // Round-8: dropped canvas wheel-zoom + drag-pan. They conflicted with page
  // scrolling (wheel inside scatter consumed the event) and weren't actually
  // what the user wanted. Replaced with HOVER-zoom on individual tiles
  // (HOVER_SCALE = 2.5×) so detail comes from inspecting one project, not
  // navigating the whole canvas.
  // ──────────────────────────────────────────────────────────────────────

  // ──────────────────────────────────────────────────────────────────────
  // Render — the plot uses HTML absolute positioning so all measurements
  // share the same `--hero-plane-pad` px var.
  // ──────────────────────────────────────────────────────────────────────
  return (
    <div
      className="hero-semantic-plane relative w-full"
      data-reserve-right={reserveRightForPanel ? "true" : "false"}
      data-reserve-bottom={reserveBottomForInputs ? "true" : "false"}
      style={{
        background: fillContainer ? "transparent" : PLANE_BG,
        borderTop: fillContainer ? "none" : `1px solid ${HAIRLINE}`,
        borderBottom: fillContainer ? "none" : `1px solid ${HAIRLINE}`,
      }}
    >
      <div
        className={
          fillContainer
            ? "relative w-full"
            : "relative mx-auto aspect-[4/5] w-full sm:aspect-[16/9]"
        }
        style={fillContainer ? { height: "100%" } : { maxWidth: "1280px" }}
      >
        <PlotFrame labels={labels} />

        {/* Sprite layer — absolute-positioned over the plot.
            z-index 10 keeps sprites BELOW the HTML overlays (z>=30) so
            ModePanel/AxisInputs/Tooltip are never occluded. */}
        <div
          className="absolute inset-0"
          style={{
            padding: "var(--hero-plane-pad, 64px)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <div
            className="relative h-full w-full"
            style={{ pointerEvents: "auto" }}
          >
            {projects.map((p, i) => (
              <Sprite
                key={p.slug}
                project={p}
                media={data.media[p.slug]}
                x={currentRef.current[i].x}
                y={currentRef.current[i].y}
                isHovered={hoveredSlug === p.slug}
                anyHovered={hoveredSlug !== null}
                recencyBounds={recencyBounds}
                highlightedCategory={highlightedCategory}
                onHoverIn={() => setHovered(p.slug)}
                onHoverOut={() => {
                  if (useNavStore.getState().hoveredSlug === p.slug) {
                    setHovered(null);
                  }
                }}
                reduced={reduced}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Plane padding adapts at small widths.
          Round-9d: pad reduced (96 -> 72 desktop) since the centered axis
          legend was dropped and the Y pills now sit OUTSIDE the inset on
          the left — the inset has more room for sprites. */}
      <style>{`
        .hero-semantic-plane { --hero-plane-pad: 56px; }
        @media (min-width: 600px) { .hero-semantic-plane { --hero-plane-pad: 64px; } }
        @media (min-width: 1024px) { .hero-semantic-plane { --hero-plane-pad: 72px; } }
        @media (min-width: 1280px) {
          .hero-semantic-plane[data-reserve-right="true"] { padding-right: 200px; }
          .hero-semantic-plane[data-reserve-bottom="true"] { padding-bottom: 88px; }
        }
        .hero-sprite { --hero-sprite-px: ${SPRITE_PX_MOBILE}px; }
        @media (min-width: 600px) { .hero-sprite { --hero-sprite-px: ${SPRITE_PX_DESKTOP}px; } }
        .hero-sprite:focus-visible { box-shadow: 0 0 0 2px #b8623f, 0 8px 24px -8px rgba(0,0,0,0.6); }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PlotFrame — pure HTML elements positioned by CSS calc on --hero-plane-pad.
// Renders all 4 corner labels (eval #9, #54) plus a strengthened grid.
// ──────────────────────────────────────────────────────────────────────────

interface PlotFrameProps {
  labels: AxisLabelSet;
}

function PlotFrame({ labels }: PlotFrameProps) {
  const TICKS = 5;
  // Spread evenly over [0, 1] inclusive of both ends.
  const tickPositions = Array.from(
    { length: TICKS },
    (_, i) => i / (TICKS - 1),
  );
  // 8 divisions = 8x8 grid.
  const gridDivs = 8;

  // The plot inset rect sits at:
  //   left/top:  pad
  //   right/bottom: 100% - pad
  //   width/height: 100% - 2*pad
  const inset: React.CSSProperties = {
    position: "absolute",
    left: "var(--hero-plane-pad, 64px)",
    top: "var(--hero-plane-pad, 64px)",
    width: "calc(100% - 2 * var(--hero-plane-pad, 64px))",
    height: "calc(100% - 2 * var(--hero-plane-pad, 64px))",
  };

  // Round-9: axis labels were too small to read at a glance. Bumped to 13px,
  // wider tracking, and a stronger color. Corner labels now also have a
  // subtle outlined "pill" so they read as labels, not lost text.
  const labelStyle: React.CSSProperties = {
    position: "absolute",
    fontFamily:
      "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: LABEL_COLOR,
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };
  const cornerPill: React.CSSProperties = {
    padding: "5px 10px",
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 3,
    background: "rgba(11, 13, 15, 0.78)",
  };
  const arrowStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 600,
    color: "#cf7f54",
    lineHeight: 1,
  };
  return (
    <div className="absolute inset-0" aria-hidden style={{ pointerEvents: "none" }}>
      {/* Plot rectangle hairline + visible grid via repeating gradients */}
      <div
        style={{
          ...inset,
          border: `1px solid ${HAIRLINE}`,
          backgroundImage: `
            repeating-linear-gradient(to right, ${GRID} 0, ${GRID} 1px, transparent 1px, transparent calc(100% / ${gridDivs})),
            repeating-linear-gradient(to bottom, ${GRID} 0, ${GRID} 1px, transparent 1px, transparent calc(100% / ${gridDivs}))
          `,
          backgroundOrigin: "padding-box",
        }}
      />

      {/* Bottom (X) tick marks */}
      {tickPositions.map((p, i) => (
        <div
          key={`tx-${i}`}
          style={{
            position: "absolute",
            left: `calc(var(--hero-plane-pad, 64px) + ${p} * (100% - 2 * var(--hero-plane-pad, 64px)))`,
            top: "calc(100% - var(--hero-plane-pad, 64px))",
            width: "1px",
            height: "6px",
            background: TICK_COLOR,
            transform: "translateX(-0.5px)",
          }}
        />
      ))}
      {/* Left (Y) tick marks */}
      {tickPositions.map((p, i) => (
        <div
          key={`ty-${i}`}
          style={{
            position: "absolute",
            top: `calc(var(--hero-plane-pad, 64px) + ${p} * (100% - 2 * var(--hero-plane-pad, 64px)))`,
            left: "calc(var(--hero-plane-pad, 64px) - 6px)",
            height: "1px",
            width: "6px",
            background: TICK_COLOR,
            transform: "translateY(-0.5px)",
          }}
        />
      ))}

      {/* Round-9p: ONE label per axis, centered along the axis edge.
          Conventional chart-title style (matplotlib ax.set_xlabel /
          set_ylabel). No pill boxes (they competed with the tiles).
          A long arrow (`←———→`) between the two pole names makes the
          axis direction unmistakable at a glance. */}

      {/* X axis title — centered along the bottom edge, below plot rim. */}
      <div
        style={{
          ...labelStyle,
          left: "50%",
          top: "calc(100% - var(--hero-plane-pad, 64px) + 16px)",
          transform: "translateX(-50%)",
          gap: 14,
          fontSize: "12px",
        }}
      >
        <span>{labels.xLeft}</span>
        <span
          aria-hidden
          style={{
            color: "#cf7f54",
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            fontFamily:
              "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            padding: "0 4px",
          }}
        >
          ←————→
        </span>
        <span>{labels.xRight}</span>
      </div>

      {/* Y axis title — centered along the left edge, OUTSIDE the plot rim,
          rotated -90° so text reads bottom-to-top. transform combines a
          translate(-50%, -50%) for centering with rotate(-90deg) for the
          orientation; the order means the visual center of the rotated
          label ends up exactly at (left, 50%). The source string is
          ordered "yBottom ←———→ yTop" so post-rotation the yTop label
          appears at the TOP of the visual axis. */}
      <div
        style={{
          ...labelStyle,
          left: "calc(var(--hero-plane-pad, 64px) - 18px)",
          top: "50%",
          transform: "translate(-50%, -50%) rotate(-90deg)",
          transformOrigin: "center center",
          gap: 14,
          fontSize: "12px",
        }}
      >
        <span>{labels.yBottom}</span>
        <span
          aria-hidden
          style={{
            color: "#cf7f54",
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            fontFamily:
              "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            padding: "0 4px",
          }}
        >
          ←————→
        </span>
        <span>{labels.yTop}</span>
      </div>

      {/* Subtitle (top-right) — only when not reserving for ModePanel. */}
      {labels.subtitle ? (
        <div
          style={{
            ...labelStyle,
            right: "var(--hero-plane-pad, 64px)",
            top: "calc(var(--hero-plane-pad, 64px) - 22px)",
            fontSize: "10px",
            letterSpacing: "0.14em",
            color: LABEL_DIM,
          }}
        >
          {labels.subtitle}
        </div>
      ) : null}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sprite — atlas-sliced thumbnail with hover scaling.
// ──────────────────────────────────────────────────────────────────────────

interface SpriteProps {
  project: ProjectEmbedding;
  /** Optional full-resolution media (hero + images[]). When absent the
   *  HoverCard falls back to the square atlas slice. */
  media?: ProjectMedia;
  x: number;
  y: number;
  isHovered: boolean;
  anyHovered: boolean;
  /** Min/max semester_recency across all projects, used to normalize the
   *  outer-ring opacity per dot. */
  recencyBounds: { min: number; max: number };
  /** Active legend filter (from nav-store). When set, dots not in this
   *  category fade to a low opacity so the user sees the cluster. */
  highlightedCategory: string | null;
  onHoverIn: () => void;
  onHoverOut: () => void;
  reduced: boolean;
}

// Round-9l: 5-bucket palette, mapped 1:1 with CategoryKey.
const CATEGORY_COLORS: Record<string, string> = {
  ml: "#9b6fc9",              // violet — ML/AI pipelines
  research: "#7aa15c",        // sage green — research / data viz
  interaction: "#d49b50",     // warm amber — installation / MR / generative environments
  design: "#cf7f54",          // oxide — game / craft / interactive design
  architecture: "#5fa0a6",    // teal — built-form / parametric / urbanism
};

// Round-9l: 5 clean buckets keyed by an explicit `primary_category` field
// in each project's metadata (overrides applied via apply_project_overrides
// .mjs). Dropped THESIS/FABRICATION — there's only one thesis, and FAB was
// a catch-all that didn't carry meaning. Keyword matching kept ONLY as a
// fallback when primary_category is missing.
export type CategoryKey =
  | "ml"
  | "research"
  | "interaction"
  | "design"
  | "architecture";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  ml: "ML / AI",
  research: "RESEARCH",
  interaction: "INTERACTION",
  design: "DESIGN",
  architecture: "COMPUTATIONAL DESIGN",
};

export function categoryKeyForProject(p: ProjectEmbedding): CategoryKey {
  const explicit = (p as ProjectEmbedding & { primary_category?: string })
    .primary_category;
  if (explicit && (explicit as CategoryKey)) {
    const k = explicit as CategoryKey;
    if (k in CATEGORY_LABELS) return k;
  }
  // Fallback keyword matcher (older entries / future projects without the
  // override applied yet).
  const cats = (p.categories ?? []).map((s) => s.toLowerCase());
  if (cats.some((c) => c.includes("ml") || c.includes("ai") || c.includes("learning") || c.includes("cad generation"))) return "ml";
  if (cats.some((c) => c.includes("research") || c.includes("data viz") || c.includes("visualiz"))) return "research";
  if (cats.some((c) => c.includes("interact") || c.includes("mixed reality") || c.includes("installation"))) return "interaction";
  if (cats.some((c) => c.includes("game") || c.includes("design"))) return "design";
  return "architecture";
}

function colorForProject(p: ProjectEmbedding): string {
  return CATEGORY_COLORS[categoryKeyForProject(p)];
}

// Round-9m: hand-curated INFORMATIVE short labels keyed by slug. The
// abbreviated project codes (3T3D, L43D, etc.) tell you nothing on a
// canvas — these say WHAT the project is in a few words, while still
// short enough to render single-line at ~180px tile width.
const SHORT_TITLES: Record<string, string> = {
  "3t3d-vit-2d-to-3d": "ViT Floorplan → 3D",
  "l43d-cad-mllm": "Multimodal CAD LLM",
  "semantic-canvas": "Semantic Canvas",
  "spectral-facades": "Diffusion Facades",
  "s25-team-26-paper-viz": "Paper Citation Viz",
  "skill-bridge-datavis": "Skill-Bridge Dashboard",
  "synthetic-texture-deterioration": "Texture Decay Tool",
  "design-the-ambience": "Diffusion Installation",
  "wire-bending": "Wire-bending Robotics",
  "aurora-citadel-gen-game": "Procedural Game (UE5)",
  "a-game-of-deterioration": "Time-Reversal Game",
  "fiber-based-pavilion": "Fiber Pavilion (IASS)",
  "membrane-form-finding": "Membrane Form-finding",
  "generative-urbanism": "Border Urbanism Sim",
  // architecture archive
  "uranium-scape": "Uranium Scape",
  "salt-marsh-research-center": "Salt Marsh Lab",
  "urban-streamline": "Urban Streamline",
  "urban-mining": "Urban Mining",
  "spatial-bending": "Spatial Bending",
  deform: "Deform",
  interlude: "Interlude",
  "sound-scape": "Sound Scape",
};

function shortCaption(
  title: string,
  slug?: string,
  max = CAPTION_MAX_CHARS,
): string {
  if (slug && SHORT_TITLES[slug]) return SHORT_TITLES[slug];
  const head = title.split(/\s+[—–:]\s+|\s+--\s+/)[0].trim();
  if (head.length <= max) return head;
  return head.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Cover-mode atlas-slice background for a non-square container. Atlas slices
 * are 1:1 (1024×1024 cells); the HoverCard image area is wider than tall.
 * Naively setting `background-size: 400% 400%` (the per-axis fill trick used
 * for the square scatter tile) STRETCHES the slice. This helper computes a
 * uniform scale + center-crop so the slice covers the box without distortion
 * — the same semantics as `<img object-fit: cover>` but for a CSS background.
 */
function atlasSliceCoverStyle(
  uv: [number, number, number, number],
  cardW: number,
  cardH: number,
): React.CSSProperties {
  const [u, v, w, h] = uv;
  // Uniform pixel size of the FULL atlas image when rendered. Pick the
  // larger of (cardW / sliceWfrac) and (cardH / sliceHfrac) so the slice
  // covers the box on both axes. Excess in the unconstrained axis is
  // cropped by overflow:hidden on the parent.
  const bgSize = Math.max(cardW / w, cardH / h);
  const sliceRenderW = w * bgSize;
  const sliceRenderH = h * bgSize;
  // GL UV → CSS-top-left: the slice's top edge in the rendered atlas is
  // at (1 - v - h) * bgSize px.
  const sliceTopPx = (1 - v - h) * bgSize;
  const sliceLeftPx = u * bgSize;
  const bgPosX = -sliceLeftPx - (sliceRenderW - cardW) / 2;
  const bgPosY = -sliceTopPx - (sliceRenderH - cardH) / 2;
  return {
    width: "100%",
    height: "100%",
    backgroundImage: "url(/data/atlas.png)",
    backgroundRepeat: "no-repeat",
    backgroundSize: `${bgSize}px ${bgSize}px`,
    backgroundPosition: `${bgPosX}px ${bgPosY}px`,
  };
}

function Sprite({
  project,
  media,
  x,
  y,
  isHovered,
  anyHovered,
  recencyBounds,
  highlightedCategory,
  onHoverIn,
  onHoverOut,
  reduced,
}: SpriteProps) {
  // Round-9 (revised): no grace timer. Hover handlers live on the SHARED
  // .hero-sprite-wrapper, which contains the button AND the HoverCard AND
  // a transparent BRIDGE element that closes the gap between the scaled
  // button and the visible card. The cursor never enters a no-pointer-events
  // zone, so the wrapper's mouseleave never fires until the cursor exits
  // all descendants — no grace timer needed.
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  void buttonRef;
  void cardRef;

  // Cycle the visible image SET (not just one) while hovered. The card
  // shows up to 2 simultaneously — 3 was too cramped and produced "image
  // of grid of images" artifacts because many heroes are themselves grids.
  const images = media?.images ?? [];
  const visibleCount = Math.min(images.length, 2);
  const [imageIdx, setImageIdx] = useState(0);
  useEffect(() => {
    if (!isHovered || images.length <= visibleCount || reduced) {
      setImageIdx(0);
      return;
    }
    const id = window.setInterval(() => {
      setImageIdx((n) => (n + 1) % images.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [isHovered, images.length, visibleCount, reduced]);

  // Map embedding [-1, 1] → CSS percent. Round-9m: text-block tiles are
  // ~120-160px wide (vs 12px dots), so they need a bigger inset margin
  // from the plot rim or they collide with axis pills at corners and
  // overflow the right/bottom edges.
  // Y inverted: data y=+1 → top of plot.
  const TILE_INSET_X = 12; // % from each horizontal edge
  const TILE_INSET_Y = 10; // % from each vertical edge
  const SPAN_X = 100 - 2 * TILE_INSET_X;
  const SPAN_Y = 100 - 2 * TILE_INSET_Y;
  const cssLeft = TILE_INSET_X + ((x + 1) / 2) * SPAN_X;
  const cssTop = TILE_INSET_Y + ((-y + 1) / 2) * SPAN_Y;

  // Atlas slice via background-position percentages.
  // Round-8b BUGFIX: the atlas is packed in GL bottom-left UV convention
  // (v=0 at bottom). CSS background-position-y measures from TOP-LEFT, so we
  // flip: the pixel-Y of the image rectangle's top edge is (1 - v - h) * H,
  // and bgPosY% = pixel_top / (image_h - container_h) * 100
  //              = ((1 - v - h) / (1 - h)) * 100.
  // Previously the code used `v / (1 - h)`, which paired GL-up with CSS-down
  // and rendered the WRONG atlas tile per project (e.g. membrane-form-finding
  // showed semantic-canvas's hero).
  const [u, v, w, h] = project.thumbnail_uv;
  const bgSizeX = `${(1 / Math.max(w, 0.0001)) * 100}%`;
  const bgSizeY = `${(1 / Math.max(h, 0.0001)) * 100}%`;
  const bgPosX = `${(u / Math.max(1 - w, 0.0001)) * 100}%`;
  const bgPosY = `${((1 - v - h) / Math.max(1 - h, 0.0001)) * 100}%`;

  // Stable z by Y so foreground sprites occlude background ones.
  // Cap at 999 so hovered sprites (z=1000) stay above sibling sprites
  // BUT never escape the parent sprite-layer's z-index: 10 stacking context,
  // which keeps them under HTML overlays (z>=30).
  const z = Math.min(999, Math.round(cssTop * 10));

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `/work/${project.slug}`;
    const wn = window as unknown as {
      navigation?: { navigate: (u: string) => void };
    };
    try {
      if (wn.navigation && typeof wn.navigation.navigate === "function") {
        wn.navigation.navigate(url);
        return;
      }
    } catch {
      // fall through
    }
    window.location.assign(url);
  };

  const transition = reduced
    ? "none"
    : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1), border-color 220ms cubic-bezier(0.22, 1, 0.36, 1)";
  const scale = isHovered ? HOVER_SCALE : 1;

  // Round-8: dim non-hovered tiles when something is hovered, so the focused
  // project visually pops without canvas-level zoom.
  // Round-9l: dim logic now combines hover-state and legend filter. Legend
  // filter takes precedence — when the user pinned a category, only those
  // dots stay bright regardless of hover.
  const projectCategory = categoryKeyForProject(project);
  const filteredOut =
    highlightedCategory != null && highlightedCategory !== projectCategory;
  const dimmed = filteredOut || (anyHovered && !isHovered);
  const opacity = filteredOut ? 0.12 : dimmed ? 0.32 : 1;
  const categoryColor = colorForProject(project);
  const borderColor = isHovered ? SPRITE_BORDER_HOVER : categoryColor;

  // Recency-encoded ring opacity. Newer = brighter; older = fainter.
  // Floor at 0.25 so even the oldest project's ring is visible.
  const projectRecency =
    (project as ProjectEmbedding & { semester_recency?: number })
      .semester_recency ?? recencyBounds.min;
  const recencyT =
    recencyBounds.max > recencyBounds.min
      ? (projectRecency - recencyBounds.min) /
        (recencyBounds.max - recencyBounds.min)
      : 1;
  const ringOpacity = 0.25 + 0.7 * recencyT;
  const captionText = shortCaption(project.title, project.slug);

  // HoverCard placement — flip to the LEFT of the tile when the tile is in
  // the right half of the scatter so the card stays on-screen. Also flip
  // the vertical anchor: tiles in the lower half anchor the card's BOTTOM
  // at tile center (card extends UP), tiles in the upper half anchor the
  // card's TOP (card extends DOWN). Prevents tall cards from clipping the
  // top or bottom of the plot.
  const cardOnLeft = cssLeft > 55;
  const cardAbove = cssTop > 55;
  // Geometry: sprite is 64px (half = 32). Hover scales the sprite to 2.5×,
  // so the scaled-button hit edge is at half * 2.5 = 80 from center. The
  // visible HoverCard sits at center + 88 (8px breathing room past scaled
  // button). A transparent BRIDGE element fills the 56px between the
  // unscaled button hit-edge (+32) and the card visible edge (+88), so the
  // wrapper's onMouseLeave never fires while the cursor traverses gap →
  // no grace timer needed.
  // Round-9m: sprite is now a TEXT BLOCK (not a dot). Hit-edge geometry
  // is approximated by half the average tile width — the wrapper itself
  // is what the cursor leaves, and the bridge spans from wrapper edge to
  // card edge. Tile width adapts to title length but caps at TILE_MAX_W.
  const TILE_MAX_W = 168;
  const TILE_HALF_APPROX = 50; // approx half-width used for card offset
  const CARD_OFFSET_PX = 92;
  const BRIDGE_WIDTH = CARD_OFFSET_PX - TILE_HALF_APPROX;
  const SPRITE_HALF = TILE_HALF_APPROX;
  // Reference height for the hover bridge + atlas-slice fallback. The card
  // itself grows naturally now (height: auto), but the bridge and the
  // imageless fallback still need a definite pixel value to lay out.
  const CARD_HEIGHT_PX = 360;
  // Round-9c: card is now WIDE + horizontal. Three image cells stacked on
  // the side closest to the tile, text on the opposite side. Solves the
  // "too vertical" feedback — gives the user three SEPARATE images at full
  // visual fidelity (not subdivided from one block) plus more reading width
  // for the description.
  const CARD_WIDTH_PX = 560;
  // Round-9e: drop fixed height — let card size to its content so the
  // summary doesn't overflow into the Open-project button.
  const CARD_MIN_HEIGHT_PX = 320;
  const IMAGE_COL_WIDTH = 220;
  const summary = (project as ProjectEmbedding & { summary?: string | null })
    .summary;

  return (
    <div
      className="hero-sprite-wrapper absolute"
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      style={{
        left: `${cssLeft}%`,
        top: `${cssTop}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isHovered ? 1000 : z,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        pointerEvents: "none",
        opacity,
        transition: reduced ? "none" : "opacity 220ms ease",
      }}
    >
      {/* Round-9m: text-block tile replaces the dot. The button IS the
          title rectangle. Recency encoded as title brightness/weight
          (newer = brighter + heavier). Category color drives the bottom
          accent border. Hover scales the block ~1.25× and brightens. */}
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onFocus={onHoverIn}
        onBlur={onHoverOut}
        aria-label={`Open ${project.title}`}
        className="hero-sprite"
        title={project.title}
        style={{
          fontFamily:
            "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: isHovered ? 12 : 11,
          fontWeight: isHovered ? 600 : ringOpacity > 0.7 ? 500 : 400,
          letterSpacing: "0.02em",
          lineHeight: 1.25,
          color: isHovered
            ? "#f0f1f2"
            : `rgba(232, 234, 237, ${0.55 + 0.4 * ringOpacity})`,
          textAlign: "center",
          maxWidth: TILE_MAX_W,
          minWidth: 64,
          padding: isHovered ? "7px 11px" : "6px 10px",
          background: isHovered
            ? "rgba(20, 24, 28, 0.96)"
            : "rgba(11, 13, 15, 0.78)",
          border: `1px solid ${
            isHovered
              ? categoryColor
              : `rgba(94, 99, 107, ${0.35 + 0.35 * ringOpacity})`
          }`,
          borderBottom: `2px solid ${categoryColor}${
            isHovered ? "ff" : Math.round(ringOpacity * 255).toString(16).padStart(2, "0")
          }`,
          borderRadius: 3,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: isHovered
            ? `0 8px 28px -6px rgba(0, 0, 0, 0.7), 0 0 0 2px ${categoryColor}33`
            : "0 1px 3px rgba(0, 0, 0, 0.45)",
          // Single-line, no wrap. Titles in SHORT_TITLES are tuned to fit.
          whiteSpace: "nowrap",
          overflow: "hidden",
          cursor: "pointer",
          outline: "none",
          pointerEvents: "auto",
          textShadow: "0 1px 2px rgba(11, 13, 15, 0.9)",
          transform: isHovered ? "scale(1.18)" : "scale(1)",
          transformOrigin: "center",
          transition: reduced
            ? "none"
            : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), background 220ms ease, border-color 220ms ease, color 220ms ease, font-size 220ms ease, padding 220ms ease",
        }}
      >
        {captionText}
      </button>
      {/* Tag below — small monospace caps, category-tinted. Sits flush
          against the tile's bottom accent border so they read as a unit. */}
      <div
        style={{
          fontFamily:
            "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: categoryColor,
          opacity: filteredOut
            ? 0.2
            : anyHovered
              ? isHovered
                ? 1
                : 0.5
              : 0.85,
          transition: reduced ? "none" : "opacity 220ms ease",
          textShadow: "0 1px 2px rgba(11, 13, 15, 0.9)",
        }}
      >
        {CATEGORY_LABELS[projectCategory]}
      </div>

      {/* Hover BRIDGE — transparent hit area between scaled button and card.
          Closes the gap so the wrapper's onMouseLeave doesn't fire while
          the cursor traverses from tile → card. No grace timer needed.
          Bridge always centered on the wrapper vertically so it covers the
          gap regardless of card flip direction. */}
      {isHovered && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            ...(cardOnLeft
              ? { right: `calc(50% + ${SPRITE_HALF}px)`, width: BRIDGE_WIDTH }
              : { left: `calc(50% + ${SPRITE_HALF}px)`, width: BRIDGE_WIDTH }),
            height: CARD_HEIGHT_PX + 80,
            pointerEvents: "auto",
            zIndex: 1095,
          }}
        />
      )}

      {/* HoverCard — image-led with a real <img> (no atlas-stretching), a
          small carousel of project images while hovered, and NO scrollbar:
          the card grows to fit content. */}
      {isHovered && (
        <div
          ref={cardRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            ...(cardAbove
              ? { bottom: "50%", transform: "translateY(28px)" }
              : { top: "50%", transform: "translateY(-28px)" }),
            ...(cardOnLeft
              ? { right: `calc(50% + ${CARD_OFFSET_PX}px)` }
              : { left: `calc(50% + ${CARD_OFFSET_PX}px)` }),
            width: CARD_WIDTH_PX,
            minHeight: CARD_MIN_HEIGHT_PX,
            padding: 0,
            background: "rgba(11, 13, 15, 0.96)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: `1px solid ${categoryColor}66`,
            borderRadius: 6,
            boxShadow: `0 18px 44px -10px rgba(0, 0, 0, 0.75), 0 0 0 1px ${categoryColor}33`,
            zIndex: 1100,
            pointerEvents: "auto",
            color: "#e6e7e9",
            fontFamily:
              "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            animation: reduced ? "none" : "hoverCardIn 180ms cubic-bezier(0.22, 1, 0.36, 1) both",
            // Horizontal layout: images on the side CLOSEST to the tile,
            // text on the side away. row-reverse when the card is on the
            // LEFT (tile is to the right) so images face the tile.
            display: "flex",
            flexDirection: cardOnLeft ? "row-reverse" : "row",
            overflow: "hidden",
          }}
        >
          {/* IMAGE COLUMN — flex column with cells stretched via flex: 1.
              The previous CSS-grid + height:100% layout was fragile inside
              the parent flex card and ended up rendering as 0 height,
              hiding the images even though the image data was present. */}
          <div
            style={{
              flex: `0 0 ${IMAGE_COL_WIDTH}px`,
              minHeight: CARD_MIN_HEIGHT_PX,
              alignSelf: "stretch",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              background: "#0b0d0f",
              borderRight: cardOnLeft ? "none" : `1px solid ${categoryColor}55`,
              borderLeft: cardOnLeft ? `1px solid ${categoryColor}55` : "none",
            }}
          >
            {images.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  ...atlasSliceCoverStyle(
                    project.thumbnail_uv,
                    IMAGE_COL_WIDTH,
                    CARD_HEIGHT_PX,
                  ),
                }}
              />
            ) : (
              Array.from({ length: Math.max(visibleCount, 1) }).map((_, slotIdx) => {
                const targetIdx = (imageIdx + slotIdx) % images.length;
                const src = images[targetIdx];
                return (
                  <div
                    key={slotIdx}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      position: "relative",
                      overflow: "hidden",
                      background: "#0b0d0f",
                    }}
                  >
                    <img
                      key={src}
                      src={src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        animation: reduced
                          ? "none"
                          : "hoverCardImgIn 320ms ease both",
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* TEXT COLUMN — wide enough that the summary doesn't break into
              5 lines anymore. */}
          <div
            style={{
              flex: 1,
              padding: "16px 18px 16px 18px",
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontFamily:
                  "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 9,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: categoryColor,
                marginBottom: 8,
              }}
            >
              {project.year ?? ""}
              {project.categories && project.categories[0] ? (
                <> · {project.categories[0]}</>
              ) : null}
              {images.length > 0 ? <> · {images.length} IMG</> : null}
            </div>
            <h4
              style={{
                fontFamily: "'Domaine Display', 'Source Serif Pro', Georgia, serif",
                fontSize: 22,
                fontWeight: 380,
                lineHeight: 1.18,
                letterSpacing: "-0.005em",
                margin: 0,
                marginBottom: 12,
                color: "#f0f1f2",
              }}
            >
              {project.title}
            </h4>
            {summary && (
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "#b2b6bb",
                  margin: 0,
                  marginBottom: 14,
                  flex: 1,
                  minHeight: 0,
                }}
              >
                {summary}
              </p>
            )}
            {project.categories && project.categories.length > 1 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  marginBottom: 14,
                }}
              >
                {project.categories.slice(0, 4).map((c) => (
                  <span
                    key={c}
                    style={{
                      fontFamily:
                        "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 9,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      border: `1px solid ${SPRITE_BORDER}`,
                      borderRadius: 3,
                      color: "#b2b6bb",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
            <a
              href={`/work/${project.slug}`}
              style={{
                fontFamily:
                  "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: categoryColor,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                border: `1px solid ${categoryColor}66`,
                borderRadius: 3,
                alignSelf: "flex-start",
                transition: "background 180ms ease, border-color 180ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = `${categoryColor}1a`;
                (e.currentTarget as HTMLAnchorElement).style.borderColor = `${categoryColor}aa`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = `${categoryColor}66`;
              }}
            >
              Open project →
            </a>
          </div>
        </div>
      )}
      <style>{`
        @keyframes hoverCardIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hoverCardImgIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
