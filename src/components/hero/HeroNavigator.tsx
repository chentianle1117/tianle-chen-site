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

import SemanticPlane from "./SemanticPlane";
import MobileStrip from "./MobileStrip";
import HeroToolbar from "./HeroToolbar";
import HeroDrawer from "./HeroDrawer";

// Round-9q: same allow-list as the old SidePanel — only these four
// axis presets surface in the dropdowns (strongest spread + clearest
// semantics on this corpus).
const HERO_TOOLBAR_PRESETS = new Set([
  "x_ml_algorithm",
  "x_artifact_system",
  "z_screen_space",
  "x_aesthetic_analytical",
]);

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
  // Round-9c: dropped the desktop-only "overlay" controls path. The right-
  // side floating panels felt detached from the canvas. We now use a single
  // compact bar BELOW the scatter at every desktop size — axis selectors
  // and layout picker live RIGHT THERE alongside the chart, easier to
  // associate with the X/Y of the plot.
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  void reduced; // kept available for future features
  void DESKTOP_BREAKPOINT;

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

  // Desktop ≥1024: SIDEBAR + CANVAS, centered together inside a max-width
  // 1480 container so the dark band has consistent left/right margins on
  // wide screens and the plot stays aligned with the sidebar (no drifting
  // empty space on the right).
  return (
    <div
      className="hero-container relative w-full"
      style={{
        background: "#0b0d0f",
        borderTop: "1px solid rgba(94, 99, 107, 0.40)",
        borderBottom: "1px solid rgba(94, 99, 107, 0.40)",
      }}
    >
      <div className="hero-stack">
        <HeroToolbar
          presetKeys={Object.keys(data.layouts.thesis_axes_cache).filter((k) =>
            HERO_TOOLBAR_PRESETS.has(k),
          )}
          projects={data.embeddings.projects}
        />
        <div className="hero-canvas">
          <SemanticPlane data={data} fillContainer />
        </div>
        <HeroDrawer
          presets={data.layouts.thesis_axes_cache}
          count={data.embeddings.projects.length}
        />
      </div>
      <style>{`
        /* Round-9q (2026-04-30): full-width stacked layout. Top toolbar
           (mode picker, categories, randomize), full-width canvas with
           interactive axis dropdowns at the plot edges, then a
           collapsible drawer below for the projection diagram. Frees
           the canvas to claim the full container width — the side rail
           was eating ~30% on wide monitors and pinching the plot. */
        .hero-container {
          padding-block: clamp(1.5rem, 3vw, 3rem);
        }
        .hero-stack {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 2000px;
          margin-inline: auto;
          padding-inline: clamp(1.5rem, 3vw, 3rem);
        }
        .hero-canvas {
          width: 100%;
          display: flex;
          /* Canvas height scales with viewport; tighter floor than before
             since the toolbar + drawer-collapsed header eat ~80px above. */
          height: clamp(560px, 78vh, 1080px);
        }
        .hero-canvas > * { width: 100%; }
        @media (min-width: 1280px) {
          .hero-canvas {
            height: clamp(680px, 80vh, 1080px);
          }
        }
        @media (min-width: 1440px) {
          .hero-canvas {
            height: clamp(720px, 82vh, 1080px);
          }
        }
      `}</style>
    </div>
  );
}
