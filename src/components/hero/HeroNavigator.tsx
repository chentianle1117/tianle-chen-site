/**
 * HeroNavigator.tsx — Astro island root for the latent-space project navigator.
 *
 * Mounts as `<HeroNavigator client:visible />` from src/pages/index.astro
 * (owned by another agent). Loads embeddings + layouts, gates on WebGL +
 * reduced-motion + viewport, and either renders the WebGL Canvas or the
 * SVG FlatScatter fallback.
 */

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import {
  detectWebGL,
  isNarrowViewport,
  prefersReducedMotion,
} from "../../lib/detectWebGL";
import {
  loadLayoutData,
  type LayoutDataBundle,
} from "../../lib/layoutData";

import ProjectCloud from "./ProjectCloud";
import CameraRig from "./CameraRig";
import ModePanel from "./ModePanel";
import AxisInputs from "./AxisInputs";
import Tooltip from "./Tooltip";
import FlatScatter from "./FlatScatter";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: LayoutDataBundle }
  | { status: "error"; message: string };

export default function HeroNavigator() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [useFallback, setUseFallback] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Capability detection (after mount so it's correct in the browser).
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const narrow = isNarrowViewport();
    const webgl = detectWebGL();
    setUseFallback(!webgl || reduced || narrow);
  }, []);

  // Data load
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

  if (state.status === "loading") {
    return (
      <div className="aspect-[16/10] w-full bg-graphite-900">
        <div className="flex h-full items-center justify-center font-mono text-[12px] text-graphite-400">
          loading…
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="aspect-[16/10] w-full bg-graphite-900">
        <div className="flex h-full items-center justify-center px-6 text-center font-mono text-[12px] leading-relaxed text-graphite-400">
          Hero data not generated yet. Run scripts.
        </div>
      </div>
    );
  }

  const { data } = state;
  const reduced = prefersReducedMotion();

  if (useFallback) {
    return <FlatScatter data={data} />;
  }

  return (
    <div className="relative h-[78vh] min-h-[640px] w-full">
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        camera={{
          fov: 38,
          position: [0, 0.3, 2.6],
          near: 0.1,
          far: 50,
        }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color("#0b0d0f"), 1);
          scene.fog = new THREE.Fog("#0b0d0f", 4, 8);
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={0.4} />
        <ProjectCloud
          data={data}
          controlsRef={controlsRef}
          reducedMotion={reduced}
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
        className="absolute left-4 top-4 z-10 rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite-400"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(11,13,15,0.72)",
          borderColor: "rgba(26,28,32,0.40)",
        }}
      >
        Live Thesis Demo
      </div>
      <ModePanel presets={data.layouts.thesis_axes_cache} />
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
