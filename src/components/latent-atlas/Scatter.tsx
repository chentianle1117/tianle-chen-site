// @ts-nocheck
/**
 * Scatter.tsx — the pannable / zoomable 2D field of poster tiles.
 *
 * Positions are driven imperatively via requestAnimationFrame writing to each
 * tile's DOM ref (left/top %), NOT through React state. This keeps 160 tiles
 * animating at 60fps: a layout change only re-renders React once (to update
 * dim/z on hover), while the per-frame position tween mutates the DOM directly
 * and is never clobbered because the JSX never sets left/top.
 *
 * The canvas itself stays dark in both themes (per design contract); all
 * surrounding chrome uses design tokens so it flips light/dark.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export interface AtlasPoint {
  id: string;
  thumb: string;
  x: number;
  y: number;
  params: {
    warmth: number;
    organic: number;
    density: number;
    lightness: number;
    angular: number;
  };
  embedding: number[];
}

export interface LayoutCoord {
  x: number; // normalized [-1, 1]
  y: number; // normalized [-1, 1]
}

interface ScatterProps {
  points: AtlasPoint[];
  /** Target coordinate per point, index-aligned with `points`. */
  layout: LayoutCoord[];
  /** Optional per-point axis score (axis mode) for the tooltip readout. */
  scores?: number[] | null;
  mode: "pca" | "axis";
  leftLabel: string;
  rightLabel: string;
  topLabel: string;
  bottomLabel: string;
  subtitle: string;
  reduced: boolean;
}

const EDGE = 8; // % inset from each edge so tiles + labels have breathing room
const SWAP_MS = 900;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// normalized [-1,1] → percent within the inset plot rect. Y inverted (+y up).
function toPct(x: number, y: number): { left: number; top: number } {
  const span = 100 - 2 * EDGE;
  return {
    left: EDGE + ((x + 1) / 2) * span,
    top: EDGE + ((-y + 1) / 2) * span,
  };
}

export default function Scatter({
  points,
  layout,
  scores,
  mode,
  leftLabel,
  rightLabel,
  topLabel,
  bottomLabel,
  subtitle,
  reduced,
}: ScatterProps) {
  const N = points.length;
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const curRef = useRef<{ x: number; y: number }[]>([]);
  const fromRef = useRef<{ x: number; y: number }[]>([]);
  const toRef = useRef<{ x: number; y: number }[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Write a single tile's DOM position from a normalized coord.
  const writeTile = (i: number, x: number, y: number) => {
    const el = tileRefs.current[i];
    if (!el) return;
    const { left, top } = toPct(x, y);
    el.style.left = `${left}%`;
    el.style.top = `${top}%`;
  };

  // Initialize positions synchronously on first mount so there is no 0,0 flash.
  useLayoutEffect(() => {
    if (curRef.current.length === 0 && layout.length === N) {
      curRef.current = layout.map((c) => ({ x: c.x, y: c.y }));
      for (let i = 0; i < N; i++) writeTile(i, layout[i].x, layout[i].y);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N]);

  // Animate to a new layout whenever it changes.
  useEffect(() => {
    if (layout.length !== N || curRef.current.length !== N) {
      // Sizes disagree (first render) — snap.
      curRef.current = layout.map((c) => ({ x: c.x, y: c.y }));
      for (let i = 0; i < N; i++) writeTile(i, layout[i].x, layout[i].y);
      return;
    }
    fromRef.current = curRef.current.map((c) => ({ ...c }));
    toRef.current = layout.map((c) => ({ x: c.x, y: c.y }));

    if (reduced) {
      for (let i = 0; i < N; i++) {
        curRef.current[i] = { ...toRef.current[i] };
        writeTile(i, toRef.current[i].x, toRef.current[i].y);
      }
      return;
    }

    startRef.current = performance.now();
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    const step = () => {
      const elapsed = performance.now() - startRef.current;
      let done = true;
      for (let i = 0; i < N; i++) {
        // gentle per-tile stagger so the field re-forms as a wave
        const offset = ((i * 2654435761) % 1000) / 1000 * 160;
        const t = Math.min(1, Math.max(0, (elapsed - offset) / SWAP_MS));
        const e = easeInOutCubic(t);
        const fx = fromRef.current[i].x;
        const fy = fromRef.current[i].y;
        const cx = fx + (toRef.current[i].x - fx) * e;
        const cy = fy + (toRef.current[i].y - fy) * e;
        curRef.current[i] = { x: cx, y: cy };
        writeTile(i, cx, cy);
        if (t < 1) done = false;
      }
      if (done) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, N, reduced]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const twRef = useRef<any>(null);
  const anyHover = hoveredId !== null;

  return (
    <div className="la-scatter-frame">
      <TransformWrapper
        ref={twRef}
        minScale={0.7}
        maxScale={7}
        initialScale={1}
        limitToBounds={false}
        centerOnInit
        wheel={{ step: 0.09 }}
        doubleClick={{ mode: "zoomIn", step: 0.7 }}
        panning={{ velocityDisabled: false }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          <div className="la-plane">
            {/* faint coordinate grid */}
            <div className="la-grid" aria-hidden />
            {points.map((p, i) => {
              const dimmed = anyHover && hoveredId !== p.id;
              const hovered = hoveredId === p.id;
              return (
                <div
                  key={p.id}
                  ref={(el) => (tileRefs.current[i] = el)}
                  className="la-tile"
                  style={{
                    zIndex: hovered ? 1000 : 1,
                    opacity: dimmed ? 0.28 : 1,
                  }}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() =>
                    setHoveredId((cur) => (cur === p.id ? null : cur))
                  }
                >
                  <div
                    className={`la-tile-inner${hovered ? " is-hovered" : ""}`}
                  >
                    <img
                      src={p.thumb}
                      alt=""
                      loading="eager"
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                  {hovered ? (
                    <div className="la-tip" role="status">
                      <span className="la-tip-id">{p.id}</span>
                      {mode === "axis" && scores && scores[i] != null ? (
                        <span className="la-tip-score">
                          axis score {scores[i].toFixed(3)}
                        </span>
                      ) : (
                        <span className="la-tip-score">
                          warm {p.params.warmth.toFixed(2)} · dense{" "}
                          {p.params.density.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Edge axis labels — fixed overlay, not part of the panned content. */}
      <div className="la-axis la-axis-left" aria-hidden>
        {leftLabel}
      </div>
      <div className="la-axis la-axis-right" aria-hidden>
        {rightLabel}
      </div>
      <div className="la-axis la-axis-top" aria-hidden>
        {topLabel}
      </div>
      <div className="la-axis la-axis-bottom" aria-hidden>
        {bottomLabel}
      </div>
      <div className="la-subtitle" aria-hidden>
        {subtitle}
      </div>

      {/* Zoom controls */}
      <div className="la-zoom" role="group" aria-label="Zoom controls">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => twRef.current?.zoomIn?.()}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => twRef.current?.zoomOut?.()}
        >
          −
        </button>
        <button
          type="button"
          aria-label="Reset view"
          onClick={() => twRef.current?.resetTransform?.()}
        >
          ⤢
        </button>
      </div>
    </div>
  );
}
