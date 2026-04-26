/**
 * ModePanel.tsx — top-right HTML overlay showing layout selector + dynamic caption.
 *
 * Pure HTML, sits above the Canvas. Click handlers route through the nav store.
 */

import type { ReactNode } from "react";
import { useNavStore, type LayoutKey } from "../../lib/nav-store";
import type { ThesisAxisPreset } from "../../lib/layoutData";

interface ModePanelProps {
  presets: Record<string, ThesisAxisPreset>;
}

const LAYOUTS: Array<{ key: LayoutKey; label: string }> = [
  { key: "thesis", label: "THESIS" },
  { key: "umap", label: "UMAP" },
  { key: "pca", label: "PCA" },
  { key: "metadata", label: "METADATA" },
];

function presetLabel(
  presets: Record<string, ThesisAxisPreset>,
  key: string,
): string {
  const p = presets[key];
  if (!p) return key;
  return `${p.labels[0]} ↔ ${p.labels[1]}`;
}

export default function ModePanel({ presets }: ModePanelProps) {
  const activeLayout = useNavStore((s) => s.activeLayout);
  const thesisAxes = useNavStore((s) => s.thesisAxes);
  const setLayout = useNavStore((s) => s.setLayout);

  let captionNode: ReactNode = null;
  switch (activeLayout) {
    case "thesis":
      captionNode = (
        <>
          <span className="block">X: {presetLabel(presets, thesisAxes[0])}</span>
          <span className="block">Y: {presetLabel(presets, thesisAxes[1])}</span>
          <span className="block">Z: {presetLabel(presets, thesisAxes[2])}</span>
        </>
      );
      break;
    case "umap":
      captionNode = "neighbors=5 · cosine · 1024D→3D";
      break;
    case "pca":
      captionNode = "first 3 principal components";
      break;
    case "metadata":
      captionNode = "domain × year × tier";
      break;
  }

  return (
    <div
      className="absolute right-4 top-4 z-10 w-[220px] rounded-md border p-3 font-mono"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(11,13,15,0.72)",
        borderColor: "rgba(26,28,32,0.40)",
      }}
    >
      <header className="mb-2 text-[11px] uppercase tracking-[0.12em] text-graphite-400">
        Layout
      </header>
      <ul className="space-y-1.5">
        {LAYOUTS.map(({ key, label }) => {
          const active = key === activeLayout;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => setLayout(key)}
                className={`flex w-full items-center gap-2 text-left text-[13px] transition-colors duration-180 ${
                  active ? "text-oxide-500" : "text-graphite-300 hover:text-graphite-100"
                }`}
              >
                <span
                  aria-hidden
                  className="inline-block h-[8px] w-[8px] rounded-full"
                  style={
                    active
                      ? { background: "#b8623f" }
                      : { boxShadow: "inset 0 0 0 1px #5a5e66" }
                  }
                />
                <span className="tracking-[0.06em]">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <hr className="my-3 border-graphite-700" />
      <p className="text-[11px] leading-snug text-graphite-300">{captionNode}</p>
    </div>
  );
}
