/**
 * HeroToolbar.tsx — horizontal toolbar above the latent-space canvas.
 *
 * Replaces the left-rail SidePanel for the layout-picker, categories
 * legend, and randomize affordances. Sits as a single row above the
 * full-width plot. Axis selection itself moved INTO the plot (the axis
 * labels at the bottom/left are now clickable dropdowns), so this bar
 * never grows with axis state.
 *
 * Order, left → right:
 *   1. Layout picker   (SEMANTIC | UMAP | PCA | TIMELINE)
 *   2. Categories legend (compact colored chips with counts)
 *   3. Randomize       (visible only in SEMANTIC mode)
 *
 * Below the toolbar we render a one-line blurb describing the active
 * layout — same copy that used to live in the side rail.
 */

import { useMemo, useState } from "react";
import { useNavStore, type LayoutKey } from "../../lib/nav-store";
import {
  CATEGORY_LABELS,
  categoryKeyForProject,
  type CategoryKey,
} from "./SemanticPlane";

const CATEGORY_COLORS_LOCAL: Record<CategoryKey, string> = {
  ml: "#9b6fc9",
  research: "#7aa15c",
  interaction: "#d49b50",
  design: "#cf7f54",
  architecture: "#5fa0a6",
};

const LAYOUTS: Array<{ key: LayoutKey; label: string }> = [
  { key: "thesis", label: "SEMANTIC" },
  { key: "umap", label: "UMAP" },
  { key: "pca", label: "PCA" },
  { key: "metadata", label: "TIMELINE" },
];

const LAYOUT_BLURB: Record<LayoutKey, string> = {
  thesis:
    "Pick any two semantic axes — click the X / Y axis label on the plot to swap. Tiles re-sort by dot-product against your concept vectors.",
  umap: "Non-linear neighborhood embedding. Similar projects cluster automatically.",
  pca: "First two principal components — the directions of maximum variance in the embedding.",
  metadata: "No ML — projects laid out by year × domain (architecture vs ML/AI).",
};

interface Props {
  presetKeys: string[];
  projects: Array<{
    slug: string;
    title?: string;
    categories?: string[] | null;
    priority?: string;
  }>;
}

export default function HeroToolbar({ presetKeys, projects }: Props) {
  const activeLayout = useNavStore((s) => s.activeLayout);
  const setLayout = useNavStore((s) => s.setLayout);
  const setThesisAxis = useNavStore((s) => s.setThesisAxis);
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

  function randomize() {
    if (presetKeys.length < 2) return;
    const shuffled = [...presetKeys].sort(() => Math.random() - 0.5);
    setThesisAxis(0, shuffled[0]);
    setThesisAxis(1, shuffled[1]);
  }

  const isSemanticMode = activeLayout === "thesis";

  return (
    <div className="hero-toolbar">
      {/* ─── Layout picker ─────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Layout"
        className="hero-toolbar-layouts"
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
              className="hero-toolbar-tab"
              data-active={active}
              data-primary={isPrimary}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ─── Categories legend ────────────────────────────────────── */}
      {categoryCounts.length > 0 && (
        <div
          className="hero-toolbar-categories"
          onMouseLeave={() => {
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
                className="hero-toolbar-chip"
                style={{
                  color: active ? "rgb(var(--text-primary))" : dim ? "rgb(var(--text-mono))" : "rgb(var(--text-secondary))",
                  background: active
                    ? `${CATEGORY_COLORS_LOCAL[key]}1a`
                    : "transparent",
                  borderColor: active
                    ? CATEGORY_COLORS_LOCAL[key]
                    : "rgb(var(--surface-border) / 0.30)",
                }}
              >
                <span
                  aria-hidden
                  className="hero-toolbar-chip-dot"
                  style={{
                    background: CATEGORY_COLORS_LOCAL[key],
                    opacity: dim ? 0.4 : 1,
                  }}
                />
                <span>{CATEGORY_LABELS[key]}</span>
                <span
                  className="hero-toolbar-chip-count"
                  style={{ color: dim ? "rgb(var(--surface-border))" : "rgb(var(--text-mono))" }}
                >
                  {String(n).padStart(2, "0")}
                </span>
              </button>
            );
          })}
          {highlightedCategory != null && (
            <button
              type="button"
              onClick={() => {
                setPinnedKey(null);
                setHighlightedCategory(null);
              }}
              className="hero-toolbar-clear"
              title="Clear category filter"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* ─── Randomize (semantic only) ────────────────────────────── */}
      <div className="hero-toolbar-actions">
        {isSemanticMode && (
          <button
            type="button"
            onClick={randomize}
            className="hero-toolbar-randomize"
            title="Randomize both axes"
          >
            ⚄ RANDOMIZE
          </button>
        )}
      </div>

      {/* ─── Blurb (full-width below the row) ─────────────────────── */}
      <p className="hero-toolbar-blurb">{LAYOUT_BLURB[activeLayout]}</p>

      <style>{`
        .hero-toolbar {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 24px;
          padding: 14px 0 10px;
          border-bottom: 1px solid rgb(var(--surface-border) / 0.30);
          row-gap: 6px;
        }
        @media (max-width: 899px) {
          .hero-toolbar {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        /* Layout tabs */
        .hero-toolbar-layouts {
          display: flex;
          gap: 0;
          border-bottom: none;
        }
        .hero-toolbar-tab {
          font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 8px 12px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: rgb(var(--text-mono));
          cursor: pointer;
          transition: all 160ms ease;
          font-weight: 500;
        }
        .hero-toolbar-tab[data-primary="true"] {
          font-weight: 600;
          color: rgb(var(--text-secondary));
          border-bottom-color: rgba(207, 127, 84, 0.32);
        }
        .hero-toolbar-tab[data-active="true"] {
          background: rgba(207, 127, 84, 0.10);
          border-bottom-color: #cf7f54;
          color: #cf7f54;
        }
        .hero-toolbar-tab:hover:not([data-active="true"]) {
          color: rgb(var(--text-secondary));
        }

        /* Categories */
        .hero-toolbar-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
          justify-content: center;
        }
        .hero-toolbar-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 10.5px;
          letter-spacing: 0.06em;
          padding: 4px 8px;
          border: 1px solid;
          border-radius: 3px;
          cursor: pointer;
          transition: all 160ms ease;
          white-space: nowrap;
        }
        .hero-toolbar-chip-dot {
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 2px;
          flex: 0 0 auto;
        }
        .hero-toolbar-chip-count {
          font-size: 10px;
        }
        .hero-toolbar-clear {
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          font-size: 11px;
          color: #cf7f54;
          background: transparent;
          border: 1px solid rgba(207, 127, 84, 0.45);
          border-radius: 3px;
          padding: 3px 8px;
          cursor: pointer;
          transition: all 160ms ease;
        }
        .hero-toolbar-clear:hover {
          background: rgba(207, 127, 84, 0.12);
        }

        /* Actions */
        .hero-toolbar-actions {
          display: flex;
          gap: 8px;
          justify-self: end;
          min-height: 28px;
          align-items: center;
        }
        .hero-toolbar-randomize {
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 6px 12px;
          background: transparent;
          border: 1px solid rgb(var(--surface-border) / 0.55);
          border-radius: 3px;
          color: rgb(var(--text-secondary));
          cursor: pointer;
          transition: all 180ms ease;
        }
        .hero-toolbar-randomize:hover {
          border-color: #cf7f54;
          color: #cf7f54;
        }

        /* Blurb spans the full row */
        .hero-toolbar-blurb {
          grid-column: 1 / -1;
          margin: 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: rgb(var(--text-mono));
        }
      `}</style>
    </div>
  );
}
