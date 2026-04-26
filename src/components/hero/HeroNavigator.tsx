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

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import {
  detectWebGL,
  prefersReducedMotion,
} from "../../lib/detectWebGL";
import {
  loadLayoutData,
  type LayoutDataBundle,
} from "../../lib/layoutData";
import { useNavStore } from "../../lib/nav-store";

import ProjectCloud from "./ProjectCloud";
import CameraRig from "./CameraRig";
import ModePanel from "./ModePanel";
import AxisInputs from "./AxisInputs";
import AxisLines from "./AxisLines";
import Tooltip from "./Tooltip";
import SemanticPlane from "./SemanticPlane";
import MobileStrip from "./MobileStrip";

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
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [reduced, setReduced] = useState<boolean>(false);
  const viewportWidth = useViewportWidth();

  const storedView = useNavStore((s) => s.viewMode);

  // Capability detection on mount.
  useEffect(() => {
    setHasWebGL(detectWebGL());
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

  // Effective view: only allow 3D if desktop + WebGL + not reduced-motion.
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  const isCompact = viewportWidth < DESKTOP_BREAKPOINT;
  const canToggle3D = !isMobile && !isCompact && hasWebGL && !reduced;
  const effectiveView: "2d" | "3d" =
    !canToggle3D ? "2d" : storedView;

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
        <Tooltip
          projects={data.embeddings.projects.map((p) => ({
            slug: p.slug,
            title: p.title,
            year: p.year,
          }))}
        />
      </div>
    );
  }

  // Tablet/small-desktop: stage with bottom-band controls (no overlays
  // occluding sprites). 3D is forced off here so we render SemanticPlane only.
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
              canToggle3D={canToggle3D}
              variant="compact"
            />
            <AxisInputs
              presets={data.layouts.thesis_axes_cache}
              variant="band"
            />
          </div>
        </div>
        <Tooltip
          projects={data.embeddings.projects.map((p) => ({
            slug: p.slug,
            title: p.title,
            year: p.year,
          }))}
        />
      </div>
    );
  }

  // Desktop path: full overlay treatment.
  return (
    <div className="hero-container relative w-full">
      {effectiveView === "2d" ? (
        <SemanticPlane
          data={data}
          reserveRightForPanel
          reserveBottomForInputs
        />
      ) : (
        <Canvas3D data={data} reducedMotion={reduced} />
      )}

      {/* Shared overlays — z-index contract:
            sprite layer (in SemanticPlane): z=10
            ModePanel, AxisInputs:           z=30
            Tooltip:                         z=30000
          Each sets its own z via its component props. */}
      <ModePanel
        presets={data.layouts.thesis_axes_cache}
        canToggle3D={canToggle3D}
      />
      <AxisInputs presets={data.layouts.thesis_axes_cache} />
      <Tooltip
        projects={data.embeddings.projects.map((p) => ({
          slug: p.slug,
          title: p.title,
          year: p.year,
        }))}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Canvas3D — the existing WebGL view, now a toggle target rather than the
// primary. Kept inline so HeroNavigator can swap views without re-mounting
// shared overlays.
// ──────────────────────────────────────────────────────────────────────────

interface Canvas3DProps {
  data: LayoutDataBundle;
  reducedMotion: boolean;
}

function Canvas3D({ data, reducedMotion }: Canvas3DProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Theme reactivity (3D scene background follows theme on light mode the
  // hero container itself stays dark per contracts; we keep the canvas dark
  // too for consistency with the 2D plane).
  useEffect(() => {
    const root = document.documentElement;
    setTheme(root.classList.contains("light") ? "light" : "dark");
    const handler = (e: Event) => {
      const next = (e as CustomEvent<{ theme: "dark" | "light" }>).detail
        ?.theme;
      if (next === "dark" || next === "light") setTheme(next);
    };
    window.addEventListener("theme-change", handler);
    return () => window.removeEventListener("theme-change", handler);
  }, []);

  // Hero stays dark in both themes (contract). bgColor is fixed to graphite-900.
  const bgColor = "#0b0d0f";
  // theme is observed but only relevant if we ever want to react; kept for
  // future-proofing. Acknowledge to satisfy the linter.
  void theme;

  const presetCache = useMemo(
    () => data.layouts.thesis_axes_cache,
    [data],
  );

  return (
    <div
      className="relative h-[78vh] min-h-[640px] w-full"
      style={{
        background: bgColor,
        borderTop: "1px solid rgba(94, 99, 107, 0.40)",
        borderBottom: "1px solid rgba(94, 99, 107, 0.40)",
      }}
    >
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        camera={{
          fov: 38,
          position: [0, 0.2, 2.3],
          near: 0.1,
          far: 50,
        }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color(bgColor), 1);
          scene.fog = new THREE.Fog(bgColor, 4, 8);
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={0.4} />
        <AxisLines presets={presetCache} />
        <ProjectCloud
          data={data}
          controlsRef={controlsRef}
          reducedMotion={reducedMotion}
        />
        <CameraRig ref={controlsRef} />
        <EffectComposer>
          <Bloom
            intensity={0.08}
            luminanceThreshold={0.85}
            luminanceSmoothing={0.2}
            mipmapBlur
          />
          <Noise
            premultiply
            blendFunction={BlendFunction.MULTIPLY}
            opacity={0.025}
          />
        </EffectComposer>
      </Canvas>
      <div
        className="absolute left-4 top-4 rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite-300"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(11,13,15,0.72)",
          borderColor: "rgba(94, 99, 107, 0.30)",
          zIndex: 30,
        }}
      >
        Live Thesis Demo · 3D
      </div>
    </div>
  );
}
