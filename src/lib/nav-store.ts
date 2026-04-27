/**
 * nav-store.ts — Zustand store for the latent-space hero.
 *
 * Owns: which view (2D/3D), which layout, which thesis axis presets,
 * which sprite is hovered. Components subscribe selectively. The 2D view
 * is the primary; 3D is a toggle. `viewMode` is persisted to localStorage.
 */

import { create } from "zustand";

export type LayoutKey = "thesis" | "umap" | "pca" | "metadata";
export type ViewMode = "2d" | "3d";

export interface NavStore {
  viewMode: ViewMode;
  activeLayout: LayoutKey;
  /** Indices into the thesis_axes_cache keys, one per X/Y/Z axis. */
  thesisAxes: [string, string, string];
  hoveredSlug: string | null;
  /** Round-9l: legend filter. Null = no filter; a CategoryKey string
   *  means dim every dot whose primary_category doesn't match. Set
   *  imperatively from the SidePanel legend (hover OR click). */
  highlightedCategory: string | null;

  setViewMode: (mode: ViewMode) => void;
  setLayout: (layout: LayoutKey) => void;
  setThesisAxis: (axis: 0 | 1 | 2, presetKey: string) => void;
  setHovered: (slug: string | null) => void;
  setHighlightedCategory: (key: string | null) => void;
}

// Preset keys must match those produced by scripts/precompute_layouts.py and stored
// in public/data/layouts.json under thesis_axes_cache. Round-9m: refreshed defaults.
export const DEFAULT_THESIS_AXES: [string, string, string] = [
  "x_ml_algorithm",    // X — ML/Latent ↔ Algorithmic/Parametric (Carpo's frame)
  "z_screen_space",    // Y — 2D screen ↔ 3D space (strong spread)
  "x_artifact_system", // Z (3D mode only) — artifact ↔ system
];

const VIEW_STORAGE_KEY = "hero.view";

function readInitialViewMode(): ViewMode {
  if (typeof window === "undefined") return "2d";
  try {
    const v = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (v === "2d" || v === "3d") return v;
  } catch {
    // ignore — SSR / disabled storage
  }
  return "2d";
}

export const useNavStore = create<NavStore>((set) => ({
  viewMode: readInitialViewMode(),
  activeLayout: "thesis",
  thesisAxes: DEFAULT_THESIS_AXES,
  hoveredSlug: null,
  highlightedCategory: null,

  setViewMode: (mode) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
      } catch {
        // ignore
      }
    }
    set({ viewMode: mode });
  },
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
  setHighlightedCategory: (key) => set({ highlightedCategory: key }),
}));
