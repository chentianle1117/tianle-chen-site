/**
 * Canvas3D.tsx — the WebGL toggle target for the latent-space hero.
 *
 * Round-6 split: extracted from HeroNavigator so R3F + three.js are only
 * loaded when the user toggles 3D. The 2D path no longer pulls in three.js,
 * so a Vite dep-cache hiccup on three/postprocessing can't kill the entire
 * island.
 *
 * Loaded via `React.lazy(() => import("./Canvas3D"))` from HeroNavigator.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { LayoutDataBundle } from "../../lib/layoutData";
import ProjectCloud from "./ProjectCloud";
import CameraRig from "./CameraRig";
import AxisLines from "./AxisLines";

interface Canvas3DProps {
  data: LayoutDataBundle;
  reducedMotion: boolean;
}

export default function Canvas3D({ data, reducedMotion }: Canvas3DProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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

  const bgColor = "#0b0d0f";
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
