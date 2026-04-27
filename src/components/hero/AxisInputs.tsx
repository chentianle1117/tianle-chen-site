/**
 * AxisInputs.tsx — axis-preset selectors + randomize, thesis layout only.
 *
 * View-mode aware:
 *   - 2D: shows only X and Y selectors (Z is irrelevant on the plane)
 *   - 3D: shows X, Y, Z
 *
 * Layout variants:
 *   - "overlay" (default, >=1280px): glass-blurred panel anchored at the
 *     bottom-center of the scatter, z-index 30 (above sprite layer).
 *   - "band" (<1280px): inline strip rendered BELOW the scatter, in its
 *     own bordered band (no overlay). Prevents the panel from occluding
 *     thumbnails on tablet/small-desktop widths (eval #25).
 *
 * The randomize button is a subtle outlined chip with a dice glyph (eval #24).
 * A one-line micro-tip below the chips: "tip: try changing X/Y to remap".
 */

import { useNavStore } from "../../lib/nav-store";
import type { ThesisAxisPreset } from "../../lib/layoutData";

interface AxisInputsProps {
  presets: Record<string, ThesisAxisPreset>;
  /**
   * "overlay" — absolute-positioned glass panel inside the scatter.
   * "band"    — inline strip with no glass background; sits in a section.
   */
  variant?: "overlay" | "band";
  /** Optional className override (used by HeroNavigator for positioning). */
  className?: string;
}

export default function AxisInputs({
  presets,
  variant = "overlay",
  className,
}: AxisInputsProps) {
  const viewMode = useNavStore((s) => s.viewMode);
  const activeLayout = useNavStore((s) => s.activeLayout);
  const thesisAxes = useNavStore((s) => s.thesisAxes);
  const setThesisAxis = useNavStore((s) => s.setThesisAxis);

  if (activeLayout !== "thesis") return null;

  // Round-9c: trim to 4 STRONG axis presets so the dropdowns aren't a long
  // list of mostly-redundant options. The user's feedback: "I think there
  // are too many options for both X and Y. There should be, like, oh no,
  // system versus artifacts. This is a good one." We keep the four that
  // best discriminate the work; the rest are filtered out (still in
  // layouts.json so they can be re-enabled later without rebuilding).
  const ALLOWED_PRESETS = new Set([
    "x_ml_design",
    "y_research_play",
    "x_artifact_system",
    "z_student_production",
  ]);
  const presetKeys = Object.keys(presets).filter((k) => ALLOWED_PRESETS.has(k));
  if (presetKeys.length === 0) return null;

  // 2D shows X + Y. 3D shows X + Y + Z.
  const visibleAxes: Array<{ idx: 0 | 1 | 2; label: string }> =
    viewMode === "3d"
      ? [
          { idx: 0, label: "X" },
          { idx: 1, label: "Y" },
          { idx: 2, label: "Z" },
        ]
      : [
          { idx: 0, label: "X" },
          { idx: 1, label: "Y" },
        ];

  function randomize() {
    const need = visibleAxes.length;
    if (presetKeys.length < need) return;
    const shuffled = [...presetKeys].sort(() => Math.random() - 0.5);
    visibleAxes.forEach((a, i) => setThesisAxis(a.idx, shuffled[i]));
  }

  // Container styling: overlay (glass) vs band (transparent inline).
  const containerStyle: React.CSSProperties =
    variant === "overlay"
      ? {
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(11,13,15,0.78)",
          borderColor: "rgba(94, 99, 107, 0.30)",
          // z-index 30: sits above the sprite layer (z=10) — fixes eval #2.
          zIndex: 30,
          // Opt back into pointer events; the parent wrapper in HeroNavigator
          // is pointer-events: none so it doesn't block scatter clicks.
          pointerEvents: "auto",
        }
      : {};

  // Round-8b: AxisInputs moved from bottom-center to TOP-RIGHT — the axis
  // change is the most important interaction in the scatter, and the prior
  // bottom anchor put it in conflict with the description strip below.
  // Now anchored top-right, just inside the right reservation, with
  // ModePanel stacking below it.
  const containerClass =
    variant === "overlay"
      ? `absolute right-4 top-4 w-[200px] rounded-md border p-3 font-mono ${className ?? ""}`
      : `relative w-full font-mono ${className ?? ""}`;

  return (
    <div className={containerClass} style={containerStyle}>
      <div
        className={
          variant === "band"
            ? "mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
            : "space-y-1.5"
        }
      >
        <div
          className={
            variant === "band"
              ? "flex flex-1 flex-col gap-1.5 sm:flex-row sm:gap-3"
              : "space-y-1.5"
          }
        >
          {visibleAxes.map(({ idx, label }) => {
            const active = thesisAxes[idx];
            return (
              <div
                key={label}
                className={
                  variant === "band"
                    ? "flex flex-1 items-center gap-2"
                    : "flex items-center gap-2"
                }
              >
                <label
                  htmlFor={`axis-${label}-${variant}`}
                  className="w-4 text-[11px] uppercase tracking-[0.12em] text-graphite-200"
                >
                  {label}:
                </label>
                <select
                  id={`axis-${label}-${variant}`}
                  value={active}
                  onChange={(e) => setThesisAxis(idx, e.target.value)}
                  className="flex-1 cursor-pointer rounded border border-graphite-700 bg-transparent px-2 py-1 text-[13px] text-graphite-200 outline-none transition-colors duration-180 hover:border-oxide-500 focus:border-oxide-500"
                  style={
                    variant === "band"
                      ? { background: "rgba(11,13,15,0.85)" }
                      : undefined
                  }
                >
                  {presetKeys.map((key) => {
                    const preset = presets[key];
                    return (
                      <option key={key} value={key} className="bg-graphite-900">
                        {preset.labels[1]} ↔ {preset.labels[0]}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
        </div>

        <div
          className={
            variant === "band"
              ? "flex shrink-0 items-center gap-3"
              : "mt-2.5 flex items-center justify-between"
          }
        >
          <span
            className="text-[10px] uppercase tracking-[0.12em] text-graphite-400"
            aria-hidden
          >
            tip: try changing X/Y
          </span>
          <button
            type="button"
            onClick={randomize}
            title="Shuffle axis presets"
            className="rounded border border-graphite-700 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-graphite-200 transition-colors duration-180 hover:border-oxide-500 hover:text-oxide-500"
            style={{ borderRadius: "4px" }}
          >
            <span aria-hidden style={{ marginRight: "4px" }}>
              ⚄
            </span>
            randomize
          </button>
        </div>
      </div>
    </div>
  );
}
