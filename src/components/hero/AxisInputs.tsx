/**
 * AxisInputs.tsx — bottom-center overlay (thesis mode only).
 *
 * Three <select>s let the user pick which thesis axis preset to use for X/Y/Z,
 * plus a randomize button. The actual layout recomputation is handled by the
 * parent ProjectCloud, which subscribes to `thesisAxes` from the store.
 */

import { useNavStore } from "../../lib/nav-store";
import type { ThesisAxisPreset } from "../../lib/layoutData";

interface AxisInputsProps {
  presets: Record<string, ThesisAxisPreset>;
}

const AXIS_LABELS = ["X", "Y", "Z"] as const;

export default function AxisInputs({ presets }: AxisInputsProps) {
  const activeLayout = useNavStore((s) => s.activeLayout);
  const thesisAxes = useNavStore((s) => s.thesisAxes);
  const setThesisAxis = useNavStore((s) => s.setThesisAxis);

  if (activeLayout !== "thesis") return null;

  const presetKeys = Object.keys(presets);
  if (presetKeys.length === 0) return null;

  function randomize() {
    if (presetKeys.length < 3) return;
    const shuffled = [...presetKeys].sort(() => Math.random() - 0.5);
    setThesisAxis(0, shuffled[0]);
    setThesisAxis(1, shuffled[1]);
    setThesisAxis(2, shuffled[2]);
  }

  return (
    <div
      className="absolute bottom-5 left-1/2 z-10 w-[360px] -translate-x-1/2 rounded-md border p-3 font-mono"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(11,13,15,0.72)",
        borderColor: "rgba(26,28,32,0.40)",
      }}
    >
      <div className="space-y-1.5">
        {AXIS_LABELS.map((axisLabel, idx) => {
          const axis = idx as 0 | 1 | 2;
          const active = thesisAxes[axis];
          return (
            <div key={axisLabel} className="flex items-center gap-2">
              <label
                htmlFor={`axis-${axisLabel}`}
                className="w-3 text-[11px] uppercase text-graphite-400"
              >
                {axisLabel}:
              </label>
              <select
                id={`axis-${axisLabel}`}
                value={active}
                onChange={(e) => setThesisAxis(axis, e.target.value)}
                className="flex-1 cursor-pointer rounded border border-graphite-700 bg-transparent px-2 py-1 text-[13px] text-graphite-200 outline-none transition-colors duration-180 hover:border-oxide-500 focus:border-oxide-500"
              >
                {presetKeys.map((key) => {
                  const preset = presets[key];
                  return (
                    <option key={key} value={key} className="bg-graphite-900">
                      {preset.labels[0]} ↔ {preset.labels[1]}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex justify-end">
        <button
          type="button"
          onClick={randomize}
          className="text-[11px] uppercase tracking-[0.08em] text-graphite-400 transition-colors duration-180 hover:text-oxide-500"
        >
          ↻ randomize
        </button>
      </div>
    </div>
  );
}
