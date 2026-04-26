/**
 * ProjectCloud.tsx — instanced billboarded sprite cloud, the heart of the hero.
 *
 * Responsibilities:
 *   - Build an InstancedBufferGeometry from a unit quad
 *   - Per-instance: iPositionA, iPositionB, iUvOffset, iUvScale, iStagger, iScale
 *   - On layout swap: copy current B -> A, set new B from layouts.json (or recompute thesis),
 *     animate uMix 0->1 over 1.2s with easeInOutCubic
 *   - Raycast for hover/click; tween hovered iScale CPU-side
 *   - Click: dolly camera over 600ms toward sprite, then route via astro:navigate
 *   - Keyboard: 1/2/3/4 to swap layout, Tab to cycle hovered sprite
 *
 * Uses vite-plugin-glsl for `?raw`-free .glsl imports.
 */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import vertSrc from "./shaders/sprite.vert.glsl";
import fragSrc from "./shaders/sprite.frag.glsl";

import {
  useNavStore,
  type LayoutKey,
} from "../../lib/nav-store";
import {
  type LayoutDataBundle,
  type ThesisAxisPreset,
} from "../../lib/layoutData";
import { projectThesisToLayout } from "../../lib/projectThesis";

interface ProjectCloudProps {
  data: LayoutDataBundle;
  controlsRef: RefObject<OrbitControlsImpl | null>;
  reducedMotion: boolean;
}

/** Tiny deterministic string hash for per-instance stagger. */
function hashSlug(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function pickStaticLayout(
  data: LayoutDataBundle,
  layout: LayoutKey,
): Record<string, [number, number, number]> {
  if (layout === "thesis") return data.layouts.thesis_default;
  return data.layouts[layout];
}

function computeThesisLayout(
  data: LayoutDataBundle,
  axisKeys: [string, string, string],
  presets: Record<string, ThesisAxisPreset>,
): Record<string, [number, number, number]> {
  const dirs: [number[], number[], number[]] = [
    presets[axisKeys[0]]?.direction ?? [],
    presets[axisKeys[1]]?.direction ?? [],
    presets[axisKeys[2]]?.direction ?? [],
  ];
  // Fall back to thesis_default if any axis is missing (shouldn't happen at runtime
  // because the AxisInputs UI only lists known presets).
  if (dirs.some((d) => d.length === 0)) return data.layouts.thesis_default;
  return projectThesisToLayout(
    data.embeddings.projects.map((p) => ({
      slug: p.slug,
      embedding: p.embedding,
    })),
    dirs,
  );
}

export default function ProjectCloud({
  data,
  controlsRef,
  reducedMotion,
}: ProjectCloudProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const geomRef = useRef<THREE.InstancedBufferGeometry | null>(null);

  // Store-driven state
  const activeLayout = useNavStore((s) => s.activeLayout);
  const thesisAxes = useNavStore((s) => s.thesisAxes);
  const setHovered = useNavStore((s) => s.setHovered);
  const setLayout = useNavStore((s) => s.setLayout);

  const projects = data.embeddings.projects;
  const N = projects.length;
  const presets = data.layouts.thesis_axes_cache;

  const atlas = useTexture("/data/atlas.png");
  useEffect(() => {
    if (!atlas) return;
    atlas.minFilter = THREE.LinearMipmapLinearFilter;
    atlas.magFilter = THREE.LinearFilter;
    atlas.anisotropy = 8;
    atlas.needsUpdate = true;
  }, [atlas]);

  // ---- Build geometry once ------------------------------------------------
  const geometry = useMemo(() => {
    const g = new THREE.InstancedBufferGeometry();
    // Unit quad covering [-0.5, 0.5]; the vertex shader scales it by 0.085 * iScale.
    const quad = new Float32Array([
      -0.5, -0.5, 0,
      0.5, -0.5, 0,
      0.5, 0.5, 0,
      -0.5, 0.5, 0,
    ]);
    const uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    g.setAttribute("position", new THREE.BufferAttribute(quad, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    g.setIndex(new THREE.BufferAttribute(indices, 1));

    const positionA = new Float32Array(N * 3);
    const positionB = new Float32Array(N * 3);
    const uvOffset = new Float32Array(N * 2);
    const uvScale = new Float32Array(N * 2);
    const stagger = new Float32Array(N);
    const scale = new Float32Array(N);

    const initial = pickStaticLayout(data, "thesis");
    for (let i = 0; i < N; i++) {
      const p = projects[i];
      const c = initial[p.slug] ?? [0, 0, 0];
      positionA.set(c, i * 3);
      positionB.set(c, i * 3);
      uvOffset.set([p.thumbnail_uv[0], p.thumbnail_uv[1]], i * 2);
      uvScale.set([p.thumbnail_uv[2], p.thumbnail_uv[3]], i * 2);
      stagger[i] = ((hashSlug(p.slug) % 1000) / 1000) * 0.3 - 0.15;
      scale[i] = 1.0;
    }

    g.setAttribute(
      "iPositionA",
      new THREE.InstancedBufferAttribute(positionA, 3),
    );
    g.setAttribute(
      "iPositionB",
      new THREE.InstancedBufferAttribute(positionB, 3),
    );
    g.setAttribute(
      "iUvOffset",
      new THREE.InstancedBufferAttribute(uvOffset, 2),
    );
    g.setAttribute(
      "iUvScale",
      new THREE.InstancedBufferAttribute(uvScale, 2),
    );
    g.setAttribute(
      "iStagger",
      new THREE.InstancedBufferAttribute(stagger, 1),
    );
    g.setAttribute("iScale", new THREE.InstancedBufferAttribute(scale, 1));
    g.instanceCount = N;

    geomRef.current = g;
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N]);

  // ---- Layout swap orchestration -----------------------------------------
  const swapState = useRef<{
    active: boolean;
    start: number;
    duration: number;
  }>({ active: false, start: 0, duration: 1200 });

  // Cache of "current world position" per instance (=iPositionB once a swap completes).
  const currentPos = useRef<Float32Array>(new Float32Array(N * 3));

  // Initialize currentPos to thesis_default.
  useLayoutEffect(() => {
    const initial = pickStaticLayout(data, "thesis");
    for (let i = 0; i < N; i++) {
      const c = initial[projects[i].slug] ?? [0, 0, 0];
      currentPos.current.set(c, i * 3);
    }
  }, [data, N, projects]);

  function startSwap(target: Record<string, [number, number, number]>) {
    const g = geomRef.current;
    if (!g) return;
    const a = g.getAttribute("iPositionA") as THREE.InstancedBufferAttribute;
    const b = g.getAttribute("iPositionB") as THREE.InstancedBufferAttribute;
    // Copy current -> A
    a.array = currentPos.current.slice();
    a.needsUpdate = true;
    // Set new -> B
    const next = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const c = target[projects[i].slug] ?? [0, 0, 0];
      next.set(c, i * 3);
    }
    (b.array as Float32Array).set(next);
    b.needsUpdate = true;
    // Cache for next swap
    currentPos.current = next;

    if (reducedMotion) {
      // Snap: set uMix=1 and skip animation.
      if (matRef.current) matRef.current.uniforms.uMix.value = 1.0;
      swapState.current.active = false;
      return;
    }
    if (matRef.current) matRef.current.uniforms.uMix.value = 0.0;
    swapState.current = { active: true, start: performance.now(), duration: 1200 };
    invalidate();
  }

  // React to layout changes
  useEffect(() => {
    let target: Record<string, [number, number, number]>;
    if (activeLayout === "thesis") {
      target = computeThesisLayout(data, thesisAxes, presets);
    } else {
      target = pickStaticLayout(data, activeLayout);
    }
    startSwap(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayout, thesisAxes]);

  // ---- Hover scale tweens (CPU side) -------------------------------------
  const hoverTargets = useRef<Float32Array>(new Float32Array(N).fill(1));
  const hoverCurrent = useRef<Float32Array>(new Float32Array(N).fill(1));

  // Subscribe to hovered slug to set targets without re-rendering.
  useEffect(() => {
    const unsub = useNavStore.subscribe((state, prev) => {
      if (state.hoveredSlug === prev.hoveredSlug) return;
      for (let i = 0; i < N; i++) {
        hoverTargets.current[i] =
          projects[i].slug === state.hoveredSlug ? 1.18 : 1.0;
      }
      invalidate();
    });
    return unsub;
  }, [N, projects]);

  // ---- Raycasting + click ------------------------------------------------
  const { camera, gl, raycaster, scene } = useThree();
  const invalidate = useThree((s) => s.invalidate);
  const pointer = useRef(new THREE.Vector2());

  useEffect(() => {
    const dom = gl.domElement;
    function onPointer(e: PointerEvent) {
      const rect = dom.getBoundingClientRect();
      pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycast();
    }
    function raycast() {
      if (!meshRef.current) return;
      raycaster.setFromCamera(pointer.current, camera);
      // Manual against instance centers (we have a single mesh of a unit quad,
      // so raycaster.intersectObject would intersect the quad itself).
      // Simpler: project each iPositionB-after-mix to NDC and find nearest within radius.
      let best = -1;
      let bestDist = 0.06;
      const mat = matRef.current;
      const mix = mat ? (mat.uniforms.uMix.value as number) : 1;
      const a = geometry.getAttribute(
        "iPositionA",
      ) as THREE.InstancedBufferAttribute;
      const b = geometry.getAttribute(
        "iPositionB",
      ) as THREE.InstancedBufferAttribute;
      const v = new THREE.Vector3();
      for (let i = 0; i < N; i++) {
        const ax = a.array[i * 3];
        const ay = a.array[i * 3 + 1];
        const az = a.array[i * 3 + 2];
        const bx = b.array[i * 3];
        const by = b.array[i * 3 + 1];
        const bz = b.array[i * 3 + 2];
        v.set(
          ax + (bx - ax) * mix,
          ay + (by - ay) * mix,
          az + (bz - az) * mix,
        ).project(camera);
        const dx = v.x - pointer.current.x;
        const dy = v.y - pointer.current.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestDist && v.z < 1) {
          bestDist = d;
          best = i;
        }
      }
      const slug = best >= 0 ? projects[best].slug : null;
      const cur = useNavStore.getState().hoveredSlug;
      if (cur !== slug) {
        setHovered(slug);
        dom.style.cursor = slug ? "pointer" : "default";
      }
    }
    function onClick(e: MouseEvent) {
      const slug = useNavStore.getState().hoveredSlug;
      if (!slug) return;
      e.preventDefault();
      const idx = projects.findIndex((p) => p.slug === slug);
      if (idx < 0) return;
      const target = new THREE.Vector3(
        currentPos.current[idx * 3],
        currentPos.current[idx * 3 + 1],
        currentPos.current[idx * 3 + 2],
      );
      dollyCamera(target, slug);
    }
    dom.addEventListener("pointermove", onPointer);
    dom.addEventListener("click", onClick);
    return () => {
      dom.removeEventListener("pointermove", onPointer);
      dom.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, raycaster, scene, geometry, N, projects]);

  // ---- Camera dolly on click ---------------------------------------------
  const dollyState = useRef<{
    active: boolean;
    start: number;
    duration: number;
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    slug: string;
  } | null>(null);

  function dollyCamera(target: THREE.Vector3, slug: string) {
    const controls = controlsRef.current;
    if (!controls) return;
    const dir = new THREE.Vector3()
      .subVectors(camera.position, controls.target)
      .normalize();
    const newPos = target.clone().add(dir.multiplyScalar(1.6));
    dollyState.current = {
      active: true,
      start: performance.now(),
      duration: 600,
      fromPos: camera.position.clone(),
      toPos: newPos,
      fromTarget: controls.target.clone(),
      toTarget: target.clone(),
      slug,
    };
    invalidate();
  }

  // ---- Frame loop ---------------------------------------------------------
  useFrame(() => {
    const now = performance.now();

    // Layout swap tween
    if (swapState.current.active && matRef.current) {
      const t = Math.min(
        1,
        (now - swapState.current.start) / swapState.current.duration,
      );
      matRef.current.uniforms.uMix.value = easeInOutCubic(t);
      if (t >= 1) swapState.current.active = false;
      invalidate();
    }

    // Hover scale CPU tween (180ms feel via lerp k=0.18)
    let dirty = false;
    for (let i = 0; i < N; i++) {
      const target = hoverTargets.current[i];
      const cur = hoverCurrent.current[i];
      if (Math.abs(target - cur) > 0.001) {
        hoverCurrent.current[i] = cur + (target - cur) * 0.18;
        dirty = true;
      }
    }
    if (dirty && geomRef.current) {
      const attr = geomRef.current.getAttribute(
        "iScale",
      ) as THREE.InstancedBufferAttribute;
      (attr.array as Float32Array).set(hoverCurrent.current);
      attr.needsUpdate = true;
      invalidate();
    }

    // Camera dolly tween
    const d = dollyState.current;
    if (d && d.active) {
      const t = Math.min(1, (now - d.start) / d.duration);
      const e = easeInOutCubic(t);
      camera.position.lerpVectors(d.fromPos, d.toPos, e);
      const controls = controlsRef.current;
      if (controls) {
        controls.target.lerpVectors(d.fromTarget, d.toTarget, e);
        controls.update();
      }
      invalidate();
      if (t >= 1) {
        d.active = false;
        // Astro view-transition navigate; fall back to plain location change.
        const slug = d.slug;
        const w = window as unknown as {
          navigation?: { navigate: (url: string) => void };
        };
        try {
          if (w.navigation && typeof w.navigation.navigate === "function") {
            w.navigation.navigate(`/work/${slug}`);
          } else {
            window.location.assign(`/work/${slug}`);
          }
        } catch {
          window.location.assign(`/work/${slug}`);
        }
      }
    }
  });

  // ---- Keyboard bindings -------------------------------------------------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't intercept while typing in a select / input.
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "select" || tag === "textarea") return;

      if (e.key === "1") setLayout("thesis");
      else if (e.key === "2") setLayout("umap");
      else if (e.key === "3") setLayout("pca");
      else if (e.key === "4") setLayout("metadata");
      else if (e.key === "Tab") {
        e.preventDefault();
        const cur = useNavStore.getState().hoveredSlug;
        const idx = cur ? projects.findIndex((p) => p.slug === cur) : -1;
        const next = projects[(idx + 1) % projects.length];
        setHovered(next.slug);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertSrc}
        fragmentShader={fragSrc}
        uniforms={{
          uAtlas: { value: atlas ?? null },
          uMix: { value: 1.0 },
        }}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
