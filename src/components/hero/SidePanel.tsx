/**
 * SidePanel.tsx — left-rail control + visualization panel for the hero.
 *
 * Round-9d: replaces the bottom strip with a dedicated left rail (~1/3
 * width). Reasons:
 *   - The bottom strip created an inconsistent layout — when the user
 *     switched from SEMANTIC to UMAP/PCA the X/Y axis selectors hid and
 *     the strip's height changed, jumping the canvas.
 *   - Controls felt detached from the canvas. A dedicated rail puts them
 *     adjacent to the chart with a consistent footprint.
 *
 * The rail contains, top to bottom:
 *   1. Layout picker (SEMANTIC | UMAP | PCA | TIMELINE)
 *   2. Axis selectors — interactive dropdowns for SEMANTIC, read-only
 *      labels for UMAP/PCA/TIMELINE so the slot height never changes.
 *   3. View toggle (DIAGRAM | TERMINAL)
 *   4. The active visualization (animated flowchart OR terminal log)
 *
 * Mobile/narrow viewports stack the rail above the canvas.
 */

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useNavStore, type LayoutKey } from "../../lib/nav-store";
import type { ThesisAxisPreset } from "../../lib/layoutData";
import EncodingConsole from "./EncodingConsole";
import ProjectionDiagram from "./ProjectionDiagram";
import {
  CATEGORY_LABELS,
  categoryKeyForProject,
  type CategoryKey,
} from "./SemanticPlane";

// Mirror of CATEGORY_COLORS in SemanticPlane.tsx (5 buckets after Round-9l).
const CATEGORY_COLORS_LOCAL: Record<CategoryKey, string> = {
  ml: "#9b6fc9",
  research: "#7aa15c",
  interaction: "#d49b50",
  design: "#cf7f54",
  architecture: "#5fa0a6",
};

interface Props {
  presets: Record<string, ThesisAxisPreset>;
  count: number;
  projects?: Array<{
    slug: string;
    title?: string;
    categories?: string[] | null;
    priority?: string;
  }>;
}

// Each layout card: label, sub (the projection's defining ingredient), and
// a tiny inline SVG "icon" sketching the method's shape. Round-9i.
const LAYOUTS: Array<{
  key: LayoutKey;
  label: string;
  sub: string;
  icon: ReactNode;
}> = [
  {
    key: "thesis",
    label: "SEMANTIC",
    sub: "designer-typed axes",
    icon: (
      // Two axes with a labeled vector projection
      <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
        <line x1="4" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth="1" />
        <line x1="4" y1="28" x2="4" y2="4" stroke="currentColor" strokeWidth="1" />
        <circle cx="20" cy="11" r="2" fill="currentColor" />
        <circle cx="11" cy="19" r="2" fill="currentColor" />
        <line x1="20" y1="11" x2="20" y2="28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        <line x1="20" y1="11" x2="4" y2="11" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    key: "umap",
    label: "UMAP",
    sub: "non-linear neighbors",
    icon: (
      // Cluster blobs (UMAP groups by neighborhood)
      <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
        <circle cx="9"  cy="11" r="2.2" fill="currentColor" />
        <circle cx="13" cy="14" r="2.2" fill="currentColor" />
        <circle cx="10" cy="16" r="2.2" fill="currentColor" />
        <circle cx="22" cy="20" r="2.2" fill="currentColor" />
        <circle cx="25" cy="23" r="2.2" fill="currentColor" />
        <circle cx="20" cy="24" r="2.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "pca",
    label: "PCA",
    sub: "max-variance axes",
    icon: (
      // Scatter with two principal-component arrows
      <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
        <circle cx="9"  cy="22" r="1.4" fill="currentColor" />
        <circle cx="14" cy="18" r="1.4" fill="currentColor" />
        <circle cx="18" cy="14" r="1.4" fill="currentColor" />
        <circle cx="22" cy="11" r="1.4" fill="currentColor" />
        <circle cx="13" cy="22" r="1.4" fill="currentColor" />
        <circle cx="20" cy="16" r="1.4" fill="currentColor" />
        <line x1="6" y1="26" x2="26" y2="8" stroke="currentColor" strokeWidth="1.2" />
        <line x1="9" y1="11" x2="23" y2="25" stroke="currentColor" strokeWidth="0.7" />
      </svg>
    ),
  },
  {
    key: "metadata",
    label: "TIMELINE",
    sub: "year × domain",
    icon: (
      // Calendar grid: years across, domain rows
      <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
        <rect x="4" y="6" width="24" height="20" stroke="currentColor" strokeWidth="1" fill="none" />
        <line x1="4" y1="13" x2="28" y2="13" stroke="currentColor" strokeWidth="0.7" />
        <line x1="4" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="0.7" />
        <line x1="12" y1="6"  x2="12" y2="26" stroke="currentColor" strokeWidth="0.7" />
        <line x1="20" y1="6"  x2="20" y2="26" stroke="currentColor" strokeWidth="0.7" />
        <circle cx="8"  cy="23" r="1.3" fill="currentColor" />
        <circle cx="16" cy="16" r="1.3" fill="currentColor" />
        <circle cx="24" cy="9"  r="1.3" fill="currentColor" />
      </svg>
    ),
  },
];

// Round-9m: refreshed axis pool. Retired the weak / collapsed axes
// (research/play, student/production, ml/design) and surfaced the four
// with the strongest empirical spread + clearest semantics on this
// project corpus.
const ALLOWED_PRESETS = new Set([
  "x_ml_algorithm",          // ML / latent ↔ algorithmic / parametric (Carpo's frame, plain language)
  "x_artifact_system",       // single fabricated thing ↔ interactive software system
  "z_screen_space",          // 2D screen interface ↔ 3D spatial / built form
  "x_aesthetic_analytical",  // formal / sensual ↔ measured / data-informed
]);

const LAYOUT_BLURB: Record<LayoutKey, string> = {
  thesis: "Pick any two semantic axes. Tiles re-sort by dot-product against your concept vectors.",
  umap: "Non-linear neighborhood embedding. Similar projects cluster automatically.",
  pca: "First two principal components — the directions of maximum variance in the embedding.",
  metadata: "No ML — projects laid out by year × domain (architecture vs ML/AI).",
};

export default function SidePanel({ presets, count, projects = [] }: Props) {
  // Round-9l: legend pin/hover state.
  const highlightedCategory = useNavStore((s) => s.highlightedCategory);
  const setHighlightedCategory = useNavStore((s) => s.setHighlightedCategory);
  const [pinnedKey, setPinnedKey] = useState<CategoryKey | null>(null);
  const pinnedRef = pinnedKey != null;

  const categoryCounts = useMemo<Array<[CategoryKey, number]>>(() => {
    const counts: Record<CategoryKey, number> = {
      ml: 0,
      research: 0,
      interaction: 0,
      design: 0,
      architecture: 0,
    };
    for (const p of projects) {
      const k = categoryKeyForProject(p as any);
      counts[k] = (counts[k] ?? 0) + 1;
    }
    const order: CategoryKey[] = [
      "ml",
      "research",
      "interaction",
      "design",
      "architecture",
    ];
    return order
      .map((k) => [k, counts[k]] as [CategoryKey, number])
      .filter(([, n]) => n > 0);
  }, [projects]);

  const activeLayout = useNavStore((s) => s.activeLayout);
  const setLayout = useNavStore((s) => s.setLayout);
  const thesisAxes = useNavStore((s) => s.thesisAxes);
  const setThesisAxis = useNavStore((s) => s.setThesisAxis);

  const [vizMode, setVizMode] = useState<"diagram" | "terminal">("diagram");

  const presetKeys = Object.keys(presets).filter((k) => ALLOWED_PRESETS.has(k));

  function randomize() {
    if (presetKeys.length < 2) return;
    const shuffled = [...presetKeys].sort(() => Math.random() - 0.5);
    setThesisAxis(0, shuffled[0]);
    setThesisAxis(1, shuffled[1]);
  }

  // Read-only labels for non-semantic layouts. Same SLOT, different content.
  const staticAxes: Record<Exclude<LayoutKey, "thesis">, [string, string]> = {
    umap: ["UMAP-1", "UMAP-2"],
    pca: ["PC1 — max variance", "PC2 — orthogonal"],
    metadata: ["Domain (Arch ↔ ML/AI)", "Year (2022 → 2026)"],
  };

  return (
    <aside
      className="hero-sidepanel"
      style={{
        background: "rgb(var(--surface-1-rgb) / 0.92)",
        padding: "32px 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 22,
        overflowY: "auto",
        height: "100%",
      }}
    >
      {/* ─── 1. Layout picker — horizontal tab strip (Round-9o) ────────
          Replaced the 2×2 card grid with a single row of mono-caps tabs.
          SEMANTIC is the primary mode (gets a subtle oxide underline even
          when inactive); UMAP / PCA / TIMELINE read as secondary
          comparison views. Tabs use border-bottom indicator for the
          active state. The icons + sub-labels from the cards are dropped
          — the one-line description below the tabs carries the meaning. */}
      <section>
        <div
          role="tablist"
          aria-label="Layout"
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "1px solid rgb(var(--surface-border) / 0.30)",
            marginBottom: 10,
          }}
        >
          {LAYOUTS.map(({ key, label }) => {
            const active = activeLayout === key;
            const isPrimary = key === "thesis";
            return (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setLayout(key)}
                style={{
                  fontFamily:
                    "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 11,
                  fontWeight: isPrimary ? 600 : 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "8px 10px",
                  background: active ? "rgba(207, 127, 84, 0.10)" : "transparent",
                  border: "none",
                  borderBottom: active
                    ? "2px solid #cf7f54"
                    : isPrimary
                      ? "2px solid rgba(207, 127, 84, 0.32)"
                      : "2px solid transparent",
                  color: active
                    ? "#cf7f54"
                    : isPrimary
                      ? "rgb(var(--text-secondary))"
                      : "rgb(var(--text-mono))",
                  cursor: "pointer",
                  marginBottom: -1,
                  transition: "all 160ms ease",
                  flex: isPrimary ? "1.2 1 0" : "1 1 0",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p
          style={{
            fontFamily:
              "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 12,
            lineHeight: 1.5,
            color: "rgb(var(--text-mono))",
            margin: 0,
          }}
        >
          {LAYOUT_BLURB[activeLayout]}
        </p>
      </section>

      {/* ─── 1b. Categories legend ───────────────────────────────────
          Round-9k: lists every category that has at least one project,
          paired with its swatch (same color as the tile badges) and a
          count. Teaches the color code so the canvas reads at a glance
          even when individual badges scroll out of view. */}
      {categoryCounts.length > 0 && (
        <section>
          <header
            style={{
              fontFamily:
                "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgb(var(--text-mono))",
              marginBottom: 8,
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <span>Categories</span>
            {highlightedCategory != null && (
              <button
                type="button"
                onClick={() => setHighlightedCategory(null)}
                style={{
                  fontFamily: "inherit",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  color: "#cf7f54",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textTransform: "uppercase",
                }}
              >
                ✕ clear
              </button>
            )}
          </header>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px 10px",
            }}
            onMouseLeave={() => {
              // On leaving the legend block, drop the hover-only filter
              // unless the user has clicked one (pinned).
              if (!pinnedRef) setHighlightedCategory(null);
            }}
          >
            {categoryCounts.map(([key, n]) => {
              const active = highlightedCategory === key;
              const dim =
                highlightedCategory != null && highlightedCategory !== key;
              return (
                <button
                  key={key}
                  type="button"
                  onMouseEnter={() => {
                    if (!pinnedRef) setHighlightedCategory(key);
                  }}
                  onClick={() => {
                    if (pinnedKey === key) {
                      setPinnedKey(null);
                      setHighlightedCategory(null);
                    } else {
                      setPinnedKey(key);
                      setHighlightedCategory(key);
                    }
                  }}
                  aria-pressed={active}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontFamily:
                      "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    color: active ? "rgb(var(--text-primary))" : dim ? "rgb(var(--text-mono))" : "rgb(var(--text-secondary))",
                    background: active
                      ? `${CATEGORY_COLORS_LOCAL[key]}1a`
                      : "transparent",
                    border: `1px solid ${active ? CATEGORY_COLORS_LOCAL[key] : "transparent"}`,
                    borderRadius: 3,
                    padding: "3px 6px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 160ms ease",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: CATEGORY_COLORS_LOCAL[key],
                      flex: "0 0 auto",
                      opacity: dim ? 0.4 : 1,
                    }}
                  />
                  <span
                    style={{
                      flex: "1 1 auto",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {CATEGORY_LABELS[key]}
                  </span>
                  <span style={{ color: dim ? "rgb(var(--surface-border))" : "rgb(var(--text-mono))" }}>
                    {String(n).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
          <p
            style={{
              fontFamily:
                "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 10.5,
              lineHeight: 1.45,
              color: "rgb(var(--text-mono))",
              marginTop: 6,
              marginBottom: 0,
              fontStyle: "italic",
            }}
          >
            Hover to highlight · click to pin
          </p>
        </section>
      )}

      {/* ─── 2. Axes — full controls only when SEMANTIC is active.
          Round-9o: in UMAP/PCA/TIMELINE the axes are produced by the
          algorithm (or by metadata fields) and aren't tweakable, so the
          full X/Y dropdowns + RANDOMIZE button are hidden in those modes
          and replaced with a single dim caption telling the user what
          they're looking at. Removes ~90px of empty / read-only UI from
          the sidebar in non-SEMANTIC modes. */}
      {activeLayout === "thesis" ? (
        <section>
          <header
            style={{
              fontFamily:
                "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgb(var(--text-mono))",
              marginBottom: 8,
            }}
          >
            Axes
          </header>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(["X", "Y"] as const).map((label, idx) => {
              const idxNum = idx as 0 | 1;
              return (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily:
                        "'IBM Plex Mono', ui-monospace, monospace",
                      fontSize: 11,
                      color: "#cf7f54",
                      width: 18,
                      letterSpacing: "0.12em",
                    }}
                  >
                    {label}:
                  </span>
                  <select
                    value={thesisAxes[idxNum]}
                    onChange={(e) => setThesisAxis(idxNum, e.target.value)}
                    style={{
                      flex: 1,
                      fontFamily:
                        "'IBM Plex Mono', ui-monospace, monospace",
                      fontSize: 12,
                      padding: "5px 8px",
                      background: "rgb(var(--surface-1-rgb) / 0.85)",
                      border: "1px solid rgb(var(--surface-border) / 0.55)",
                      borderRadius: 3,
                      color: "rgb(var(--text-primary))",
                      cursor: "pointer",
                    }}
                  >
                    {presetKeys.map((key) => {
                      const p = presets[key];
                      return (
                        <option key={key} value={key} style={{ background: "rgb(var(--surface-bg))" }}>
                          {p.labels[1]} ↔ {p.labels[0]}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            })}
            <button
              type="button"
              onClick={randomize}
              style={{
                marginTop: 4,
                alignSelf: "flex-start",
                fontFamily:
                  "'IBM Plex Mono', ui-monospace, monospace",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "5px 10px",
                background: "transparent",
                border: "1px solid rgb(var(--surface-border) / 0.55)",
                borderRadius: 3,
                color: "rgb(var(--text-secondary))",
                cursor: "pointer",
                transition: "all 180ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#cf7f54";
                (e.currentTarget as HTMLButtonElement).style.color = "#cf7f54";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgb(var(--surface-border) / 0.55)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--text-secondary))";
              }}
            >
              ⚄ randomize
            </button>
          </div>
        </section>
      ) : (
        <p
          style={{
            fontFamily:
              "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 10.5,
            letterSpacing: "0.10em",
            color: "rgb(var(--text-mono))",
            margin: 0,
            fontStyle: "italic",
            opacity: 0.8,
          }}
        >
          auto · {staticAxes[activeLayout as Exclude<LayoutKey, "thesis">][0]}
          {"  ×  "}
          {staticAxes[activeLayout as Exclude<LayoutKey, "thesis">][1]}
        </p>
      )}

      {/* ─── 3. View toggle ────────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontFamily:
                "'IBM Plex Mono', ui-monospace, monospace",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgb(var(--text-mono))",
            }}
          >
            Inside the projection
          </span>
          <div role="tablist" style={{ display: "flex", gap: 4 }}>
            {(["diagram", "terminal"] as const).map((mode) => {
              const active = vizMode === mode;
              return (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setVizMode(mode)}
                  style={{
                    fontFamily:
                      "'IBM Plex Mono', ui-monospace, monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    background: active
                      ? "rgba(207, 127, 84, 0.15)"
                      : "transparent",
                    border: `1px solid ${active ? "#cf7f54" : "rgb(var(--surface-border) / 0.45)"}`,
                    borderRadius: 3,
                    color: active ? "#cf7f54" : "rgb(var(--text-mono))",
                    cursor: "pointer",
                    transition: "all 160ms ease",
                  }}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </header>

        {vizMode === "diagram" ? (
          <ProjectionDiagram presets={presets} count={count} />
        ) : (
          <EncodingConsole presets={presets} count={count} />
        )}
      </section>
    </aside>
  );
}
