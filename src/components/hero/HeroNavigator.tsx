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
import SidePanel from "./SidePanel";

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
      <div className="hero-split">
        <div className="hero-side">
          <SidePanel
            presets={data.layouts.thesis_axes_cache}
            count={data.embeddings.projects.length}
            projects={data.embeddings.projects}
          />
        </div>
        <div className="hero-canvas">
          <SemanticPlane data={data} fillContainer />
        </div>
      </div>
      <style>{`
        /* Round-9g: full-bleed split — sidebar and canvas fill the dark
           band edge-to-edge, no inner padding. Eliminates the awkward
           gutters that made the canvas look offset and the sidebar
           floating. The canvas drives height via aspect-ratio, capped at
           a sensible max so it doesn't sprawl on tall monitors. */
        .hero-split {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .hero-side  { width: 100%; }
        .hero-canvas { width: 100%; display: flex; }
        .hero-canvas > * { width: 100%; }
        @media (min-width: 1024px) {
          .hero-split {
            flex-direction: row;
            align-items: stretch;
          }
          .hero-side {
            flex: 0 0 420px;
            max-width: 420px;
            border-right: 1px solid rgba(94, 99, 107, 0.30);
          }
          .hero-canvas {
            flex: 1 1 auto;
            min-width: 0;
            /* Tall canvas: scales with viewport so it dominates the page,
               clamped between 720px (short laptops) and 1080px (big
               monitors). 80vh feels like "almost full screen" without
               forcing the user to scroll a fixed amount past the band. */
            height: clamp(720px, 82vh, 1080px);
          }
        }
        @media (min-width: 1440px) {
          .hero-side {
            flex-basis: 480px;
            max-width: 480px;
          }
        }
      `}</style>
    </div>
  );
}
