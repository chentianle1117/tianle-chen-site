/**
 * ModePanel.tsx — view + layout selector overlay.
 *
 * Two stacked groups:
 *   1. VIEW   — radio toggle between 2D (primary) and 3D (toggle target).
 *   2. LAYOUT — radio between THESIS / UMAP / PCA / METADATA.
 *
 * Plus a CAPTION row that summarizes the active layout's axis assignment.
 *
 * Stacking: z-index 30 — sits above the sprite layer (z=10) at all times.
 * Anchoring: absolute top-right at desktop (>=1280, anchor-class), or a
 * compact horizontal pill at <1280 (controlled by parent).
 *
 * 3D button has a hover tooltip with 400ms delay explaining what 3D shows
 * (eval #38).
 *
 * Glass treatment matches the existing hero overlays (backdrop-blur, dark
 * tint, hairline border). Pure HTML; no Three / no canvas dependencies.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavStore, type LayoutKey, type ViewMode } from "../../lib/nav-store";
import type { ThesisAxisPreset } from "../../lib/layoutData";

interface ModePanelProps {
  presets: Record<string, ThesisAxisPreset>;
  /** True when the user is allowed to flip to 3D (desktop, has WebGL, no reduced motion). */
  canToggle3D: boolean;
  /**
   * "panel"   — full glass panel anchored top-right of the scatter (>=1280).
   * "compact" — horizontal control row used inline in the bottom band (<1280).
   */
  variant?: "panel" | "compact";
  /** Optional positional/className override. */
  className?: string;
}

const LAYOUTS: Array<{ key: LayoutKey; label: string }> = [
  { key: "thesis", label: "THESIS" },
  { key: "umap", label: "UMAP" },
  { key: "pca", label: "PCA" },
  { key: "metadata", label: "METADATA" },
];

const VIEWS: Array<{ key: ViewMode; label: string }> = [
  { key: "2d", label: "2D" },
  { key: "3d", label: "3D" },
];

function presetLabel(
  presets: Record<string, ThesisAxisPreset>,
  key: string,
): string {
  const p = presets[key];
  if (!p) return key;
  return `${p.labels[1]} ↔ ${p.labels[0]}`;
}

/** Tooltip with 400ms hover delay for the 3D button (eval #38). */
function ThreeDHoverTip({
  active,
  message,
}: {
  active: boolean;
  message: string;
}) {
  if (!active) return null;
  return (
    <div
      role="tooltip"
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        left: "50%",
        transform: "translateX(-50%)",
        whiteSpace: "nowrap",
        fontFamily:
          "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "10px",
        letterSpacing: "0.10em",
        color: "#e6e7e9",
        background: "rgba(11,13,15,0.94)",
        border: "1px solid rgba(94, 99, 107, 0.45)",
        borderRadius: "4px",
        padding: "5px 8px",
        zIndex: 50,
        pointerEvents: "none",
        boxShadow: "0 4px 12px -4px rgba(0, 0, 0, 0.6)",
      }}
    >
      {message}
    </div>
  );
}

export default function ModePanel({
  presets,
  canToggle3D,
  variant = "panel",
  className,
}: ModePanelProps) {
  const viewMode = useNavStore((s) => s.viewMode);
  const activeLayout = useNavStore((s) => s.activeLayout);
  const thesisAxes = useNavStore((s) => s.thesisAxes);
  const setLayout = useNavStore((s) => s.setLayout);
  const setViewMode = useNavStore((s) => s.setViewMode);

  // 400ms-delayed hover tooltip on the 3D button.
  const [show3DTip, setShow3DTip] = useState(false);
  const tipTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tipTimerRef.current != null) window.clearTimeout(tipTimerRef.current);
    };
  }, []);

  function on3DEnter() {
    if (tipTimerRef.current != null) window.clearTimeout(tipTimerRef.current);
    tipTimerRef.current = window.setTimeout(() => setShow3DTip(true), 400);
  }
  function on3DLeave() {
    if (tipTimerRef.current != null) {
      window.clearTimeout(tipTimerRef.current);
      tipTimerRef.current = null;
    }
    setShow3DTip(false);
  }

  let captionNode: ReactNode = null;
  switch (activeLayout) {
    case "thesis":
      captionNode = (
        <>
          <span className="block">X: {presetLabel(presets, thesisAxes[0])}</span>
          <span className="block">Y: {presetLabel(presets, thesisAxes[1])}</span>
          {viewMode === "3d" ? (
            <span className="block">Z: {presetLabel(presets, thesisAxes[2])}</span>
          ) : null}
        </>
      );
      break;
    case "umap":
      captionNode = "neighbors=5 · cosine";
      break;
    case "pca":
      captionNode =
        viewMode === "3d" ? "first 3 principal components" : "first 2 principal components";
      break;
    case "metadata":
      captionNode = viewMode === "3d" ? "domain × year × tier" : "domain × year";
      break;
  }

  const threeDDisabled = !canToggle3D;
  const threeDTipMessage = threeDDisabled
    ? "3D requires desktop + WebGL"
    : "Same projects, depth axis adds Z (e.g. complexity).";

  // ──────────────────────────────────────────────────────────────────────
  // COMPACT variant — horizontal row used in the bottom band on <1280px.
  // ──────────────────────────────────────────────────────────────────────
  if (variant === "compact") {
    return (
      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-2 font-mono ${className ?? ""}`}
        style={{ zIndex: 30 }}
      >
        {/* VIEW */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.14em] text-graphite-300">
            View
          </span>
          {VIEWS.map(({ key, label }) => {
            const active = key === viewMode;
            const disabled = key === "3d" && threeDDisabled;
            const isThreeD = key === "3d";
            return (
              <div key={key} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!disabled) setViewMode(key);
                  }}
                  disabled={disabled}
                  aria-pressed={active}
                  onMouseEnter={isThreeD ? on3DEnter : undefined}
                  onMouseLeave={isThreeD ? on3DLeave : undefined}
                  onFocus={isThreeD ? on3DEnter : undefined}
                  onBlur={isThreeD ? on3DLeave : undefined}
                  className={`rounded border px-2 py-1 text-[11px] tracking-[0.06em] transition-colors duration-180 ${
                    active
                      ? "border-oxide-500 text-oxide-500"
                      : disabled
                        ? "border-graphite-800 text-graphite-700 cursor-not-allowed"
                        : "border-graphite-700 text-graphite-200 hover:border-oxide-500 hover:text-graphite-100"
                  }`}
                >
                  {label}
                </button>
                {isThreeD ? (
                  <ThreeDHoverTip
                    active={show3DTip}
                    message={threeDTipMessage}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* LAYOUT */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.14em] text-graphite-300">
            Layout
          </span>
          {LAYOUTS.map(({ key, label }) => {
            const active = key === activeLayout;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setLayout(key)}
                aria-pressed={active}
                className={`rounded border px-2 py-1 text-[11px] uppercase tracking-[0.10em] transition-colors duration-180 ${
                  active
                    ? "border-oxide-500 text-oxide-500"
                    : "border-graphite-700 text-graphite-200 hover:border-oxide-500 hover:text-graphite-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // PANEL variant — top-right glass overlay, BELOW AxisInputs (Round-8b).
  // 3D toggle removed entirely; only Layout group remains, with one-line
  // descriptions of what each layout means and how things are encoded.
  // ──────────────────────────────────────────────────────────────────────
  const layoutDescriptions: Record<LayoutKey, string> = {
    thesis: "Custom semantic axes — type any concept and projects re-sort.",
    umap: "Auto-clustered by content similarity (non-linear neighbors).",
    pca: "Top 2 principal components of the embedding (linear).",
    metadata: "Year × category — no ML, just published facts.",
  };

  return (
    <div
      className={`absolute right-4 w-[240px] rounded-md border p-3 font-mono ${className ?? ""}`}
      style={{
        // Round-8b: anchored below AxisInputs (which sits at top: 16 with
        // ~190px height + 12px gap). 220 keeps a clean visual stack.
        top: 220,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(11,13,15,0.82)",
        borderColor: "rgba(94, 99, 107, 0.30)",
        zIndex: 30,
      }}
    >
      <header className="mb-2 text-[11px] uppercase tracking-[0.14em] text-graphite-300">
        Layout
      </header>
      <ul className="space-y-2">
        {LAYOUTS.map(({ key, label }) => {
          const active = key === activeLayout;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => setLayout(key)}
                aria-pressed={active}
                className={`flex w-full items-start gap-2 text-left transition-colors duration-180 ${
                  active
                    ? "text-oxide-500"
                    : "text-graphite-200 hover:text-graphite-100"
                }`}
              >
                <span
                  aria-hidden
                  className="mt-1.5 inline-block h-[8px] w-[8px] shrink-0 rounded-full"
                  style={
                    active
                      ? { background: "#b8623f" }
                      : { boxShadow: "inset 0 0 0 1px #5a5e66" }
                  }
                />
                <span className="flex-1">
                  <span className="block text-[12px] tracking-[0.10em]">{label}</span>
                  <span
                    className="mt-0.5 block text-[10px] leading-snug"
                    style={{
                      color: active ? "rgba(207, 127, 84, 0.85)" : "rgba(168, 172, 177, 0.7)",
                      letterSpacing: 0,
                      fontFamily:
                        "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    }}
                  >
                    {layoutDescriptions[key]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <hr className="my-3 border-graphite-700/60" />
      <p className="text-[10px] leading-snug text-graphite-300" style={{ letterSpacing: 0, fontFamily: "'Inter', sans-serif" }}>
        {captionNode}
      </p>
    </div>
  );
}
