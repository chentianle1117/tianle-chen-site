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
const CAPTION_MAX_CHARS = 18;

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
  const out: Layout = {};
  for (const s of slugs) {
    const p = arr[s];
    out[s] = [
      Math.max(-0.98, Math.min(0.98, p.x)),
      Math.max(-0.98, Math.min(0.98, p.y)),
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

  // Initialize positions from thesis_default once.
  if (currentRef.current.length === 0) {
    const initial = data.layouts.thesis_default;
    currentRef.current = projects.map((p) => {
      const c = initial[p.slug] ?? [0, 0, 0];
      return { x: c[0], y: c[1] };
    });
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
    toRef.current = projects.map((p) => {
      const c = targetLayout[p.slug] ?? [0, 0, 0];
      return { x: c[0], y: c[1] };
    });

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
        background: PLANE_BG,
        borderTop: `1px solid ${HAIRLINE}`,
        borderBottom: `1px solid ${HAIRLINE}`,
      }}
    >
      <div
        className="relative mx-auto aspect-[4/5] w-full sm:aspect-[16/9]"
        style={{ maxWidth: "1280px" }}
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
                x={currentRef.current[i].x}
                y={currentRef.current[i].y}
                isHovered={hoveredSlug === p.slug}
                anyHovered={hoveredSlug !== null}
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
          Right reservation widens to 256px when ModePanel sits inside the
          scatter container (>=1280px). Bottom reservation widens when
          AxisInputs is overlaid (>=1280px) so sprites can never reach the
          panel area. */}
      <style>{`
        .hero-semantic-plane { --hero-plane-pad: 56px; }
        @media (min-width: 600px) { .hero-semantic-plane { --hero-plane-pad: 80px; } }
        @media (min-width: 1024px) { .hero-semantic-plane { --hero-plane-pad: 96px; } }
        @media (min-width: 1280px) {
          .hero-semantic-plane[data-reserve-right="true"] { padding-right: 240px; }
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

  // Axis label style — bumped contrast + 0.12em letter-spacing (eval #23).
  const labelStyle: React.CSSProperties = {
    position: "absolute",
    fontFamily:
      "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: LABEL_COLOR,
    whiteSpace: "nowrap",
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

      {/* X-axis labels — placed below the plot rim. Both corners always rendered. */}
      <div
        style={{
          ...labelStyle,
          left: "var(--hero-plane-pad, 64px)",
          top: "calc(100% - var(--hero-plane-pad, 64px) + 16px)",
        }}
      >
        ← {labels.xLeft}
      </div>
      <div
        style={{
          ...labelStyle,
          right: "var(--hero-plane-pad, 64px)",
          top: "calc(100% - var(--hero-plane-pad, 64px) + 16px)",
        }}
      >
        {labels.xRight} →
      </div>

      {/* Y-axis labels — top label above plot, bottom label below.
          Both corners always rendered. */}
      <div
        style={{
          ...labelStyle,
          left: "var(--hero-plane-pad, 64px)",
          top: "calc(var(--hero-plane-pad, 64px) - 22px)",
        }}
      >
        ↑ {labels.yTop}
      </div>
      <div
        style={{
          ...labelStyle,
          left: "var(--hero-plane-pad, 64px)",
          top: "calc(100% - var(--hero-plane-pad, 64px) + 36px)",
          color: LABEL_COLOR,
        }}
      >
        ↓ {labels.yBottom}
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
  x: number;
  y: number;
  isHovered: boolean;
  anyHovered: boolean;
  onHoverIn: () => void;
  onHoverOut: () => void;
  reduced: boolean;
}

// Round-8: 7-tag category palette. Each tile gets a hairline border in its
// primary category color so architecture vs ML vs research is visually
// separable at a glance, without overwhelming the dark scatter.
const CATEGORY_COLORS: Record<string, string> = {
  thesis: "#cf7f54",          // oxide accent — flagship thesis surface
  architecture: "#5fa0a6",    // teal — Rice / fabrication
  ml: "#9b6fc9",              // violet — ML/AI pipelines
  research: "#7aa15c",        // sage green — research projects
  interaction: "#d49b50",     // warm amber — interactive / projection
  design: "#a3a8af",           // graphite — design systems
  fabrication: "#8a8f96",     // dim graphite — physical fabrication
};

function colorForProject(p: ProjectEmbedding): string {
  const cats = (p.categories ?? []).map((s) => s.toLowerCase());
  const isFlagship =
    (p as ProjectEmbedding & { priority?: string }).priority === "flagship";
  if (isFlagship || cats.some((c) => c.includes("thesis"))) return CATEGORY_COLORS.thesis;
  if (cats.some((c) => c.includes("architect") || c.includes("urban") || c.includes("pavilion") || c.includes("fab"))) return CATEGORY_COLORS.architecture;
  if (cats.some((c) => c.includes("ml") || c.includes("ai") || c.includes("learning") || c.includes("cad generation"))) return CATEGORY_COLORS.ml;
  if (cats.some((c) => c.includes("interact") || c.includes("project") || c.includes("game"))) return CATEGORY_COLORS.interaction;
  if (cats.some((c) => c.includes("research") || c.includes("data viz") || c.includes("visualiz"))) return CATEGORY_COLORS.research;
  if (cats.some((c) => c.includes("design"))) return CATEGORY_COLORS.design;
  return CATEGORY_COLORS.fabrication;
}

function shortCaption(title: string, max = CAPTION_MAX_CHARS): string {
  // Prefer the cleanest leading phrase: split on em-dash, en-dash, colon,
  // double-hyphen — keep the FIRST chunk. Then truncate.
  const head = title.split(/\s+[—–:]\s+|\s+--\s+/)[0].trim();
  if (head.length <= max) return head;
  return head.slice(0, max - 1).trimEnd() + "…";
}

function Sprite({
  project,
  x,
  y,
  isHovered,
  anyHovered,
  onHoverIn,
  onHoverOut,
  reduced,
}: SpriteProps) {
  // Map embedding [-1, 1] → CSS percent [0, 100].
  // Y inverted: data y=+1 → top of plot.
  const cssLeft = ((x + 1) / 2) * 100;
  const cssTop = ((-y + 1) / 2) * 100;

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
  const dimmed = anyHovered && !isHovered;
  const opacity = dimmed ? 0.32 : 1;
  const categoryColor = colorForProject(project);
  const borderColor = isHovered ? SPRITE_BORDER_HOVER : categoryColor;
  const captionText = shortCaption(project.title);

  // Round-8b: HoverCard placement — flip to the LEFT of the tile when the
  // tile is in the right half of the scatter so the card stays on-screen.
  const cardOnLeft = cssLeft > 55;
  const summary = (project as ProjectEmbedding & { summary?: string | null })
    .summary;

  return (
    <div
      className="hero-sprite-wrapper absolute"
      style={{
        left: `${cssLeft}%`,
        top: `${cssTop}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isHovered ? 1000 : z,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        pointerEvents: "none",
        opacity,
        transition: reduced ? "none" : "opacity 220ms ease",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={onHoverIn}
        onMouseLeave={onHoverOut}
        onFocus={onHoverIn}
        onBlur={onHoverOut}
        aria-label={`Open ${project.title}`}
        className="hero-sprite"
        style={{
          width: "var(--hero-sprite-px, 64px)",
          height: "var(--hero-sprite-px, 64px)",
          transform: `scale(${scale})`,
          transformOrigin: "center",
          transition,
          backgroundImage: "url(/data/atlas.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: `${bgSizeX} ${bgSizeY}`,
          backgroundPosition: `${bgPosX} ${bgPosY}`,
          border: `${isHovered ? "2px" : "1.5px"} solid ${borderColor}`,
          borderRadius: 4,
          boxShadow: isHovered
            ? `0 14px 40px -10px ${categoryColor}66, 0 0 0 1px ${categoryColor}44`
            : "0 1px 2px rgba(0, 0, 0, 0.4)",
          cursor: "pointer",
          padding: 0,
          outline: "none",
          imageRendering: "auto",
          pointerEvents: "auto",
        }}
      >
        <span className="sr-only">{project.title}</span>
      </button>
      <div
        title={project.title}
        style={{
          fontFamily:
            "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: isHovered ? 11 : 10,
          letterSpacing: "0.04em",
          color: isHovered ? LABEL_COLOR : LABEL_DIM,
          textAlign: "center",
          maxWidth: 120,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textShadow: "0 1px 3px rgba(11, 13, 15, 0.95)",
          transition: reduced ? "none" : "color 220ms ease, font-size 220ms ease",
          padding: "1px 4px",
          borderRadius: 2,
          background: isHovered ? "rgba(11, 13, 15, 0.7)" : "transparent",
        }}
      >
        {captionText}
      </div>

      {/* Round-8b HoverCard — replaces the cursor-following Tooltip and the
          description strip below the scatter. Sits attached to the right (or
          left if near the right edge) of the hovered tile. Pointer-events on
          so the user can click the "Open project" link inside it. */}
      {isHovered && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            ...(cardOnLeft
              ? { right: "calc(50% + 88px)" }
              : { left: "calc(50% + 88px)" }),
            width: 280,
            maxHeight: 360,
            overflowY: "auto",
            padding: "14px 16px 16px",
            background: "rgba(11, 13, 15, 0.94)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${categoryColor}66`,
            borderRadius: 6,
            boxShadow: `0 12px 32px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px ${categoryColor}33`,
            zIndex: 1100,
            pointerEvents: "auto",
            color: "#e6e7e9",
            fontFamily:
              "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            // Animate in
            animation: reduced ? "none" : "hoverCardIn 180ms cubic-bezier(0.22, 1, 0.36, 1) both",
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
          </div>
          <h4
            style={{
              fontFamily: "'Domaine Display', 'Source Serif Pro', Georgia, serif",
              fontSize: 17,
              fontWeight: 380,
              lineHeight: 1.2,
              letterSpacing: "-0.005em",
              margin: 0,
              marginBottom: 10,
              color: "#f0f1f2",
            }}
          >
            {project.title}
          </h4>
          {summary && (
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.5,
                color: "#b2b6bb",
                margin: 0,
                marginBottom: 12,
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
                marginBottom: 12,
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
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: categoryColor,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Open project →
          </a>
        </div>
      )}
      <style>{`
        @keyframes hoverCardIn {
          from { opacity: 0; transform: translateY(-50%) translateX(${cardOnLeft ? "8px" : "-8px"}); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>
    </div>
  );
}
