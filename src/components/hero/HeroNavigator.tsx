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
      <div className={`hero-split ${sidebarCollapsed ? "is-collapsed" : ""}`}>
        <div className="hero-side">
          {!sidebarCollapsed && (
            <SidePanel
              presets={data.layouts.thesis_axes_cache}
              count={data.embeddings.projects.length}
              projects={data.embeddings.projects}
            />
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="hero-side-toggle"
            aria-label={
              sidebarCollapsed ? "Expand control panel" : "Collapse control panel"
            }
            title={sidebarCollapsed ? "Expand panel" : "Collapse panel"}
          >
            <span aria-hidden>{sidebarCollapsed ? "›" : "‹"}</span>
            {sidebarCollapsed && (
              <span className="hero-side-toggle-label">PANEL</span>
            )}
          </button>
        </div>
        <div className="hero-canvas">
          <SemanticPlane data={data} fillContainer />
        </div>
      </div>
      <style>{`
        /* Round-9r (2026-05-01): reverted to sidebar+canvas split, but now
           the sidebar collapses to a thin rail with an expand button. When
           collapsed the canvas claims the full width. Sidebar state is
           persisted in localStorage so returning visitors don't have to
           re-collapse on every page load. */
        .hero-container {
          padding-block: clamp(1.5rem, 3vw, 3rem);
        }
        .hero-split {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 1800px;
          margin-inline: auto;
          padding-inline: clamp(1.5rem, 3vw, 3rem);
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

        /* Sidebar collapse toggle — vertical strip on the right edge of
           the side panel that the user can click to hide the rail. When
           collapsed it becomes a thin tab on the left edge of the canvas
           that says "PANEL ›" to expand. */
        .hero-side-toggle {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: -1px;
          z-index: 5;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 16px 6px;
          background: rgba(11, 13, 15, 0.92);
          border: 1px solid rgba(94, 99, 107, 0.30);
          border-right: none;
          border-radius: 4px 0 0 4px;
          cursor: pointer;
          color: #a8acb1;
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
          font-weight: 600;
          transition: all 160ms ease;
          writing-mode: horizontal-tb;
        }
        .hero-side-toggle:hover {
          color: #cf7f54;
          border-color: rgba(207, 127, 84, 0.55);
        }
        .hero-side-toggle-label {
          font-size: 10px;
          letter-spacing: 0.18em;
        }
        .hero-split.is-collapsed .hero-side {
          flex: 0 0 28px !important;
          max-width: 28px !important;
          border-right: none !important;
        }
        .hero-split.is-collapsed .hero-side-toggle {
          right: -28px;
          border-radius: 0 4px 4px 0;
          border-left: none;
          border-right: 1px solid rgba(94, 99, 107, 0.30);
        }
        .hero-split.is-collapsed .hero-side-toggle:hover {
          border-right-color: rgba(207, 127, 84, 0.55);
        }

        @media (min-width: 900px) {
          .hero-split {
            flex-direction: row;
            align-items: stretch;
          }
          .hero-side {
            flex: 0 0 360px;
            max-width: 360px;
            border-right: 1px solid rgba(94, 99, 107, 0.30);
          }
          .hero-canvas {
            flex: 1 1 auto;
            min-width: 0;
            height: clamp(640px, 80vh, 1080px);
          }
        }
        @media (min-width: 1280px) {
          .hero-side {
            flex-basis: 420px;
            max-width: 420px;
          }
          .hero-canvas {
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
