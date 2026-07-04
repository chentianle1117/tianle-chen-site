/**
 * HeroDrawer.tsx — collapsible "inside the projection" drawer below
 * the latent-space canvas. Replaces the bottom-of-sidebar location
 * the diagram + terminal lived in. Closed by default so first-time
 * visitors see the clean plot; one click expands to reveal the
 * pipeline diagram (or terminal, via the inner toggle).
 */

import { useState } from "react";
import type { ThesisAxisPreset } from "../../lib/layoutData";
import EncodingConsole from "./EncodingConsole";
import ProjectionDiagram from "./ProjectionDiagram";

interface Props {
  presets: Record<string, ThesisAxisPreset>;
  count: number;
}

export default function HeroDrawer({ presets, count }: Props) {
  const [open, setOpen] = useState(false);
  const [vizMode, setVizMode] = useState<"diagram" | "terminal">("diagram");

  return (
    <div className="hero-drawer">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hero-drawer-toggle"
        aria-expanded={open}
      >
        <span className="hero-drawer-caret" data-open={open} aria-hidden>
          ▸
        </span>
        <span>Inside the projection</span>
        <span className="hero-drawer-hint">
          {open ? "click to collapse" : "click to expand"}
        </span>
      </button>

      {open && (
        <div className="hero-drawer-body">
          <div className="hero-drawer-tabs" role="tablist">
            {(["diagram", "terminal"] as const).map((mode) => {
              const active = vizMode === mode;
              return (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setVizMode(mode)}
                  className="hero-drawer-tab"
                  data-active={active}
                >
                  {mode}
                </button>
              );
            })}
          </div>
          <div className="hero-drawer-content">
            {vizMode === "diagram" ? (
              <ProjectionDiagram presets={presets} count={count} />
            ) : (
              <EncodingConsole presets={presets} count={count} />
            )}
          </div>
        </div>
      )}

      <style>{`
        .hero-drawer {
          border-top: 1px solid rgb(var(--surface-border) / 0.30);
          margin-top: 14px;
        }
        .hero-drawer-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 4px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          font-size: 10.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgb(var(--text-mono));
          transition: color 160ms ease;
        }
        .hero-drawer-toggle:hover {
          color: rgb(var(--text-secondary));
        }
        .hero-drawer-caret {
          color: #cf7f54;
          font-size: 12px;
          transition: transform 200ms ease;
          display: inline-block;
        }
        .hero-drawer-caret[data-open="true"] {
          transform: rotate(90deg);
        }
        .hero-drawer-hint {
          margin-left: auto;
          font-size: 9.5px;
          letter-spacing: 0.14em;
          color: rgb(var(--text-mono));
          font-style: italic;
          text-transform: lowercase;
        }
        .hero-drawer-body {
          padding: 4px 0 16px;
        }
        .hero-drawer-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 12px;
        }
        .hero-drawer-tab {
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 4px 10px;
          background: transparent;
          border: 1px solid rgb(var(--surface-border) / 0.45);
          border-radius: 3px;
          color: rgb(var(--text-mono));
          cursor: pointer;
          transition: all 160ms ease;
        }
        .hero-drawer-tab[data-active="true"] {
          background: rgba(207, 127, 84, 0.15);
          border-color: #cf7f54;
          color: #cf7f54;
        }
        .hero-drawer-content {
          /* Constrain so the pipeline diagram doesn't stretch ridiculously
             wide — it was designed for ~420px sidebar. Center it for now. */
          max-width: 720px;
        }
      `}</style>
    </div>
  );
}
