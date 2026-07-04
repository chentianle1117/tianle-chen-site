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
  // Side panel collapse — persists across navigations via localStorage so
  // a returning visitor doesn't have to re-collapse on every page load.
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("hero:sidebar-collapsed") === "1";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "hero:sidebar-collapsed",
      sidebarCollapsed ? "1" : "0",
    );
  }, [sidebarCollapsed]);
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
          background: "rgb(var(--surface-bg))",
          borderTop: "1px solid rgb(var(--surface-border) / 0.40)",
          borderBottom: "1px solid rgb(var(--surface-border) / 0.40)",
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
          background: "rgb(var(--surface-bg))",
          borderTop: "1px solid rgb(var(--surface-border) / 0.40)",
          borderBottom: "1px solid rgb(var(--surface-border) / 0.40)",
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
        background: "rgb(var(--surface-bg))",
        borderTop: "1px solid rgb(var(--surface-border) / 0.40)",
        borderBottom: "1px solid rgb(var(--surface-border) / 0.40)",
      }}
    >
      <div className={`hero-split ${sidebarCollapsed ? "is-collapsed" : ""}`}>
        <div className="hero-side">
          {!sidebarCollapsed ? (
            <>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="hero-side-toggle hero-side-toggle--hide"
                title="Collapse panel"
              >
                <span aria-hidden>‹</span>
                <span>HIDE PANEL</span>
              </button>
              <SidePanel
                presets={data.layouts.thesis_axes_cache}
                count={data.embeddings.projects.length}
                projects={data.embeddings.projects}
              />
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="hero-side-toggle hero-side-toggle--show"
              title="Expand panel"
            >
              <span className="hero-side-toggle-vlabel">SHOW PANEL</span>
              <span aria-hidden>›</span>
            </button>
          )}
        </div>
        <div className="hero-canvas">
          <SemanticPlane data={data} fillContainer />
        </div>
      </div>
      <style>{`
        /* Round-9s (2026-05-01): tighter container, narrower sidebar, and a
           VISIBLE labeled toggle. Previous toggle was a tiny mid-edge arrow
           that nobody discovered. Now: an oxide-bordered "HIDE PANEL ‹"
           pill at the top of the sidebar header, and a vertical "SHOW
           PANEL ›" tab on the canvas's left edge when collapsed. */
        .hero-container {
          padding-block: clamp(1.25rem, 2.5vw, 2.5rem);
        }
        .hero-split {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 1800px;
          margin-inline: auto;
          padding-inline: clamp(1rem, 2vw, 2rem);
        }
        .hero-side {
          width: 100%;
          position: relative;
        }
        .hero-canvas {
          width: 100%;
          display: flex;
          height: clamp(560px, 75vh, 760px);
        }
        .hero-canvas > * { width: 100%; }

        /* HIDE button — sits at top-right of the expanded sidebar so it's
           discoverable in normal reading order. Pill style with oxide
           accent border telegraphs interactivity. */
        .hero-side-toggle--hide {
          position: absolute;
          top: 14px;
          right: 12px;
          z-index: 5;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: rgb(var(--surface-1-rgb) / 0.85);
          border: 1px solid rgba(207, 127, 84, 0.45);
          border-radius: 3px;
          cursor: pointer;
          color: rgb(var(--text-secondary));
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
          font-weight: 600;
          text-transform: uppercase;
          transition: all 160ms ease;
        }
        .hero-side-toggle--hide:hover {
          color: #cf7f54;
          border-color: #cf7f54;
          background: rgba(207, 127, 84, 0.10);
        }

        /* SHOW button — replaces the entire collapsed sidebar with a
           vertical tab that the visitor can't miss. */
        .hero-side-toggle--show {
          width: 100%;
          height: 100%;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 0;
          background: rgb(var(--surface-1-rgb) / 0.85);
          border: 1px solid rgba(207, 127, 84, 0.45);
          border-radius: 3px;
          cursor: pointer;
          color: rgb(var(--text-secondary));
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          font-weight: 600;
          text-transform: uppercase;
          transition: all 160ms ease;
        }
        .hero-side-toggle--show:hover {
          color: #cf7f54;
          border-color: #cf7f54;
          background: rgba(207, 127, 84, 0.10);
        }
        .hero-side-toggle-vlabel {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          letter-spacing: 0.22em;
        }

        .hero-split.is-collapsed .hero-side {
          flex: 0 0 36px !important;
          max-width: 36px !important;
          border-right: none !important;
        }

        @media (min-width: 900px) {
          .hero-split {
            flex-direction: row;
            align-items: stretch;
            gap: 14px;
          }
          .hero-side {
            flex: 0 0 320px;
            max-width: 320px;
            border-right: 1px solid rgb(var(--surface-border) / 0.30);
          }
          .hero-canvas {
            flex: 1 1 auto;
            min-width: 0;
            height: clamp(640px, 80vh, 1080px);
          }
        }
        @media (min-width: 1280px) {
          .hero-side {
            flex-basis: 360px;
            max-width: 360px;
          }
          .hero-canvas {
            height: clamp(720px, 82vh, 1080px);
          }
        }
        @media (min-width: 1440px) {
          .hero-side {
            flex-basis: 400px;
            max-width: 400px;
          }
        }
      `}</style>
    </div>
  );
}
