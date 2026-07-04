/**
 * ProjectionDiagram.tsx — animated SVG flowchart of the projection pipeline.
 *
 * Shows the four stages of going from raw embeddings to placed sprites:
 *
 *   ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
 *   │ EMBEDDING │ →  │  PROJECT  │ →  │ NORMALIZE │ →  │  RENDER   │
 *   │ 14 × 1024 │    │ dot(v, a) │    │ to [-1,1] │    │ ease 800  │
 *   └───────────┘    └───────────┘    └───────────┘    └───────────┘
 *
 * On axis or layout change a "pulse" animates through the boxes (left → right)
 * so the user SEES the pipeline computing. The arrows have a marching-ants
 * dashed flow effect that runs continuously, matching the sense that data is
 * always flowing through.
 *
 * Companion to EncodingConsole: the diagram is the structural view, the
 * console is the textual log. The SidePanel lets the user toggle between
 * them.
 */

import { useEffect, useRef, useState } from "react";
import { useNavStore } from "../../lib/nav-store";
import type { ThesisAxisPreset } from "../../lib/layoutData";

interface Props {
  presets: Record<string, ThesisAxisPreset>;
  count: number;
}

const NODES = [
  { key: "embed", title: "EMBED", sub: "768-D" },
  { key: "project", title: "PROJECT", sub: "dot(v, axis)" },
  { key: "normalize", title: "NORMALIZE", sub: "[-1, +1]" },
  { key: "render", title: "RENDER", sub: "ease · 800ms" },
] as const;

const STAGE_INTERVAL = 220; // ms — pulse step delay
const NODE_W = 96;
const NODE_H = 56;
const GAP = 18;
const PADDING = 16;

export default function ProjectionDiagram({ presets, count }: Props) {
  const activeLayout = useNavStore((s) => s.activeLayout);
  const thesisAxes = useNavStore((s) => s.thesisAxes);

  const [activeIdx, setActiveIdx] = useState<number>(NODES.length - 1);
  const timersRef = useRef<number[]>([]);

  // Pulse through nodes when the projection signature changes.
  useEffect(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setActiveIdx(-1);
    for (let i = 0; i < NODES.length; i++) {
      const id = window.setTimeout(() => setActiveIdx(i), i * STAGE_INTERVAL);
      timersRef.current.push(id);
    }
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [activeLayout, thesisAxes]);

  const xLabel =
    activeLayout === "thesis"
      ? presets[thesisAxes[0]]?.labels?.[0]?.toLowerCase() ?? "?"
      : activeLayout === "umap"
        ? "umap-1"
        : activeLayout === "pca"
          ? "pc1"
          : "domain";
  const yLabel =
    activeLayout === "thesis"
      ? presets[thesisAxes[1]]?.labels?.[0]?.toLowerCase() ?? "?"
      : activeLayout === "umap"
        ? "umap-2"
        : activeLayout === "pca"
          ? "pc2"
          : "year";

  const totalW =
    PADDING * 2 + NODE_W * NODES.length + GAP * (NODES.length - 1);
  const totalH = PADDING * 2 + NODE_H + 36; // extra for axis labels below

  return (
    <div
      style={{
        width: "100%",
        background: "rgb(var(--surface-1-rgb) / 0.8)",
        border: "1px solid rgb(var(--surface-border) / 0.30)",
        borderRadius: 4,
        padding: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontFamily:
            "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgb(var(--text-mono))",
          marginBottom: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span>Projection pipeline</span>
        <span style={{ color: "#7aa15c" }}>{count} × 768-D</span>
      </div>

      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
        role="img"
        aria-label="Projection pipeline diagram"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#7aa15c" />
          </marker>
          <marker
            id="arrowDim"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(122, 161, 92, 0.35)" />
          </marker>
        </defs>

        {/* Arrows — drawn first so nodes overlap cleanly */}
        {NODES.map((_, i) => {
          if (i === NODES.length - 1) return null;
          const x1 = PADDING + (i + 1) * NODE_W + i * GAP;
          const x2 = PADDING + (i + 1) * NODE_W + (i + 1) * GAP - 2;
          const y = PADDING + NODE_H / 2;
          const passed = activeIdx > i;
          return (
            <line
              key={`arrow-${i}`}
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
              stroke={passed ? "#7aa15c" : "rgba(122, 161, 92, 0.35)"}
              strokeWidth={1.5}
              markerEnd={passed ? "url(#arrow)" : "url(#arrowDim)"}
              strokeDasharray={passed ? "0" : "3 3"}
            >
              {passed && (
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-12"
                  dur="0.6s"
                  repeatCount="1"
                />
              )}
            </line>
          );
        })}

        {/* Nodes */}
        {NODES.map((node, i) => {
          const x = PADDING + i * (NODE_W + GAP);
          const y = PADDING;
          const active = activeIdx === i;
          const passed = activeIdx >= i;
          const stroke = active
            ? "#cf7f54"
            : passed
              ? "#7aa15c"
              : "rgb(var(--surface-border) / 0.45)";
          const fill = active
            ? "rgba(207, 127, 84, 0.12)"
            : passed
              ? "rgba(122, 161, 92, 0.08)"
              : "rgb(var(--surface-1-rgb) / 0.4)";
          const titleColor = active
            ? "rgb(var(--text-primary))"
            : passed
              ? "rgb(var(--text-secondary))"
              : "rgb(var(--text-mono))";
          const subColor = active
            ? "#cf7f54"
            : passed
              ? "#7aa15c"
              : "rgb(var(--text-mono))";
          return (
            <g key={node.key}>
              <rect
                x={x}
                y={y}
                width={NODE_W}
                height={NODE_H}
                rx={3}
                ry={3}
                fill={fill}
                stroke={stroke}
                strokeWidth={active ? 1.5 : 1}
              >
                {active && (
                  <animate
                    attributeName="stroke-width"
                    values="1;2;1"
                    dur="0.55s"
                    repeatCount="1"
                  />
                )}
              </rect>
              <text
                x={x + NODE_W / 2}
                y={y + NODE_H / 2 - 4}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', ui-monospace, monospace"
                fontSize="11"
                fontWeight="600"
                letterSpacing="1.6"
                fill={titleColor}
              >
                {node.title}
              </text>
              <text
                x={x + NODE_W / 2}
                y={y + NODE_H / 2 + 12}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', ui-monospace, monospace"
                fontSize="9.5"
                fill={subColor}
              >
                {node.sub}
              </text>
            </g>
          );
        })}

        {/* Axis-labels below diagram — show what the projection IS for
            the current view (e.g. "x ← ml/code" / "y ← research"). */}
        <text
          x={PADDING}
          y={PADDING + NODE_H + 24}
          fontFamily="'IBM Plex Mono', ui-monospace, monospace"
          fontSize="10"
          fill="rgb(var(--text-mono))"
          letterSpacing="1"
        >
          x ← <tspan fill="#cf7f54">{xLabel}</tspan>
        </text>
        <text
          x={totalW - PADDING}
          y={PADDING + NODE_H + 24}
          textAnchor="end"
          fontFamily="'IBM Plex Mono', ui-monospace, monospace"
          fontSize="10"
          fill="rgb(var(--text-mono))"
          letterSpacing="1"
        >
          y ← <tspan fill="#cf7f54">{yLabel}</tspan>
        </text>
      </svg>
    </div>
  );
}
