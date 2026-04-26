/**
 * HeroNavigator.tsx — Astro island root for the latent-space project navigator.
 *
 * Mounts as `<HeroNavigator client:visible />` from src/pages/index.astro.
 *
 * 2D is the PRIMARY view (per Phase 2 contract). 3D is a toggle target on
 * desktops with WebGL. Mobile, no-WebGL, or reduced-motion users always see
 * the 2D plane regardless of stored preference.
 *
 * Responsive breakpoints:
 *   - <600px (MOBILE_BREAKPOINT): static MobileStrip — scatter is unusable
 *     at this width when AxisInputs/ModePanel are present.
 *   - <1280px (DESKTOP_BREAKPOINT): scatter + bottom-band controls
 *     (ModePanel compact + AxisInputs band) below the plane.
 *   - >=1280px: scatter with overlay panels — ModePanel anchored top-right
 *     INSIDE the scatter container (right-padding reserved); AxisInputs
 *     bottom-center overlay (bottom-padding reserved).
 *
 * Loads embeddings + layouts once, then mounts:
 *   - <SemanticPlane> in 2D mode
 *   - <Canvas3D> (R3F) in 3D mode
 *   - <MobileStrip> on <600px (always 2d-equivalent)
 *
 * The hero container itself has visible top + bottom hairlines so it acts as
 * the page section break.
 */

import { useEffect, useState } from "react";

import { prefersReducedMotion } from "../../lib/detectWebGL";
import {
  loadLayoutData,
  type LayoutDataBundle,
} from "../../lib/layoutData";

import ModePanel from "./ModePanel";
import AxisInputs from "./AxisInputs";
import SemanticPlane from "./SemanticPlane";
import MobileStrip from "./MobileStrip";

// Round-8b: dropped 3D entirely. The toggle was confusing (most visitors
// never used it), and the latent-space scatter is best read at 2D + hover-
// zoom-on-tile. Canvas3D file remains in the repo for future revival but is
// no longer imported anywhere.
// Also dropped: the cursor-following Tooltip and the description strip below
// the scatter. Both were noisy and overlapped with the axis controls. The
// HoverCard rendered next to each tile (in SemanticPlane) is now the single
// detail surface.

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: LayoutDataBundle }
  | { status: "error"; message: string };

const MOBILE_BREAKPOINT = 600;
const DESKTOP_BREAKPOINT = 1280;

function useViewportWidth(): number {
  const [w, setW] = useState<number>(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  useEffect(() => {
    function onResize() {
      setW(window.innerWidth);
    }
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}

export default function HeroNavigator() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reduced, setReduced] = useState<boolean>(false);
  const viewportWidth = useViewportWidth();

  // Capability detection on mount.
  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  // Data load.
  useEffect(() => {
    let alive = true;
    loadLayoutData()
      .then((data) => {
        if (!alive) return;
        setState({ status: "ready", data });
      })
      .catch((err) => {
        if (!alive) return;
        setState({
          status: "error",
          message:
            err && typeof err === "object" && "message" in err
              ? String((err as Error).message)
              : "Hero data not generated yet. Run scripts.",
        });
      });
    return () => {
      alive = false;
    };
  }, []);

  // Round-8b: 3D toggle removed. Always 2D.
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  const isCompact = viewportWidth < DESKTOP_BREAKPOINT;
  void reduced; // kept available for future features

  if (state.status === "loading") {
    return (
      <div
        className="aspect-[16/9] w-full"
        style={{
          background: "#0b0d0f",
          borderTop: "1px solid rgba(94, 99, 107, 0.40)",
          borderBottom: "1px solid rgba(94, 99, 107, 0.40)",
        }}
      >
        <div className="flex h-full items-center justify-center font-mono text-[12px] text-graphite-400">
          loading…
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        className="aspect-[16/9] w-full"
        style={{
          background: "#0b0d0f",
          borderTop: "1px solid rgba(94, 99, 107, 0.40)",
          borderBottom: "1px solid rgba(94, 99, 107, 0.40)",
        }}
      >
        <div className="flex h-full items-center justify-center px-6 text-center font-mono text-[12px] leading-relaxed text-graphite-400">
          {state.message}
        </div>
      </div>
    );
  }

  const { data } = state;

  // Mobile path: a static strip, no overlays.
  if (isMobile) {
    return (
      <div className="hero-container relative w-full">
        <MobileStrip data={data} />
      </div>
    );
  }

  // Tablet/small-desktop: scatter + bottom-band controls (no overlays
  // occluding sprites).
  if (isCompact) {
    return (
      <div className="hero-container relative w-full">
        <SemanticPlane data={data} />
        <div
          className="border-t"
          style={{
            background: "rgba(11, 13, 15, 0.92)",
            borderColor: "rgba(94, 99, 107, 0.30)",
          }}
        >
          <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-3">
            <ModePanel
              presets={data.layouts.thesis_axes_cache}
              canToggle3D={false}
              variant="compact"
            />
            <AxisInputs
              presets={data.layouts.thesis_axes_cache}
              variant="band"
            />
          </div>
        </div>
      </div>
    );
  }

  // Desktop path: scatter + right-side stacked panels (axes on top, layouts
  // below). No more bottom-overlay AxisInputs (was overlapping with the page
  // content below). No 3D toggle. No cursor-following Tooltip.
  return (
    <div className="hero-container relative w-full">
      <SemanticPlane
        data={data}
        reserveRightForPanel
        reserveBottomForInputs={false}
      />
      {/* Right-side stacked panels.
          - AxisInputs (top) — foregrounded; this is the most important
            interaction. Anchored top-right.
          - ModePanel (below) — layout picker (Thesis / UMAP / PCA / Metadata)
            with descriptions of what each layout means.
          z-index 30 over sprite layer (z=10). */}
      <AxisInputs
        presets={data.layouts.thesis_axes_cache}
        variant="overlay"
      />
      <ModePanel
        presets={data.layouts.thesis_axes_cache}
        canToggle3D={false}
      />
    </div>
  );
}
