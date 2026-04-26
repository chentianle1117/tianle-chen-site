/**
 * nav-store.ts — Zustand store for the latent-space hero.
 *
 * Owns: which layout is active, which thesis axis presets are selected,
 * which sprite is currently hovered. Components subscribe selectively.
 */

import { create } from "zustand";

export type LayoutKey = "thesis" | "umap" | "pca" | "metadata";

export interface NavStore {
  activeLayout: LayoutKey;
  /** Indices into the thesis_axes_cache keys, one per X/Y/Z axis. */
  thesisAxes: [string, string, string];
  hoveredSlug: string | null;

  setLayout: (layout: LayoutKey) => void;
  setThesisAxis: (axis: 0 | 1 | 2, presetKey: string) => void;
  setHovered: (slug: string | null) => void;
}

// Preset keys must match those produced by scripts/precompute_layouts.py and stored
// in public/data/layouts.json under thesis_axes_cache.
export const DEFAULT_THESIS_AXES: [string, string, string] = [
  "x_ml_design",
  "y_research_play",
  "z_student_production",
];

export const useNavStore = create<NavStore>((set) => ({
  activeLayout: "thesis",
  thesisAxes: DEFAULT_THESIS_AXES,
  hoveredSlug: null,

  setLayout: (layout) => set({ activeLayout: layout }),
  setThesisAxis: (axis, presetKey) =>
    set((state) => {
      const next: [string, string, string] = [...state.thesisAxes] as [
        string,
        string,
        string,
      ];
      next[axis] = presetKey;
      return { thesisAxes: next };
    }),
  setHovered: (slug) => set({ hoveredSlug: slug }),
}));
