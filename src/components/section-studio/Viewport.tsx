// @ts-nocheck
/**
 * Viewport.tsx — the R3F WebGL scene for Section Studio.
 *
 * Renders the active solid with a live GPU clipping plane, a translucent
 * "cap" built from the CPU-computed section, and a crisp accent outline of the
 * exact intersection contour drawn on the cut face. Orbit to inspect; the cut
 * is fixed in the model's frame so the section stays put as you rotate.
 *
 * The scene deliberately stays dark in both site themes (allowed) so the
 * geometry keeps consistent contrast; all surrounding UI chrome flips via
 * design tokens.
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { SectionResult } from "./section";

interface ViewportProps {
  geometry: THREE.BufferGeometry;
  capGeometry: THREE.BufferGeometry | null;
  section: SectionResult;
  normal: [number, number, number];
  offset: number;
  radius: number;
  showPlane: boolean;
  wireframe: boolean;
}

const SCENE_BG = "#0e1013";
const SOLID_COLOR = "#b9bec6";
const ACCENT = "#d97a4c";
const OUTLINE = "#ff9563";

/**
 * Reframe — the solids differ in scale (a small bracket vs. a larger gyroid
 * box), and OrbitControls keeps its own position across prop changes. Without
 * this, switching solids can leave the camera parked too close or too far.
 * When `radius` changes we re-seat the camera on the same illustrative angle
 * the Canvas boots with, and recentre the orbit target on the origin (every
 * generator is centred there). Purely a UX nicety — it touches nothing the
 * section math depends on.
 */
function Reframe({ radius }: { radius: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  useEffect(() => {
    const r = radius || 1.5;
    camera.position.set(r * 1.9, r * 1.35, r * 2.1);
    camera.updateProjectionMatrix();
    const c = controls as any;
    if (c && c.target) {
      c.target.set(0, 0, 0);
      c.update();
    }
  }, [radius, camera, controls]);
  return null;
}

function Scene({
  geometry,
  capGeometry,
  section,
  normal,
  offset,
  radius,
  showPlane,
  wireframe,
}: ViewportProps) {
  const nVec = useMemo(
    () => new THREE.Vector3(normal[0], normal[1], normal[2]).normalize(),
    [normal[0], normal[1], normal[2]],
  );

  // world-space clipping plane: keep the +normal half-space (normal·p >= offset)
  const clipPlane = useMemo(
    () => new THREE.Plane(nVec.clone(), -offset),
    [nVec, offset],
  );

  // crisp outline of the intersection contour (LineSegments)
  const outlineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(section.segments3D, 3),
    );
    return g;
  }, [section]);
  useEffect(() => () => outlineGeo.dispose(), [outlineGeo]);

  // plane-visualisation quad
  const planeQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nVec);
    return q;
  }, [nVec]);
  const planePos = useMemo(
    () => nVec.clone().multiplyScalar(offset),
    [nVec, offset],
  );
  const planeSize = radius * 2.4;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={0.85} />
      <directionalLight position={[-4, -2, -3]} intensity={0.25} />

      {/* the solid, clipped live by the cutting plane */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={SOLID_COLOR}
          metalness={0.12}
          roughness={0.62}
          side={THREE.DoubleSide}
          clippingPlanes={[clipPlane]}
          clipShadows
          wireframe={wireframe}
          flatShading
        />
      </mesh>

      {/* filled cut face, reconstructed from the computed section loops */}
      {capGeometry && (
        <mesh geometry={capGeometry} renderOrder={1}>
          <meshStandardMaterial
            color={ACCENT}
            metalness={0.0}
            roughness={0.8}
            side={THREE.DoubleSide}
            transparent
            opacity={0.42}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
      )}

      {/* exact section contour, drawn on the cut */}
      <lineSegments geometry={outlineGeo} renderOrder={2}>
        <lineBasicMaterial color={OUTLINE} toneMapped={false} />
      </lineSegments>

      {/* the cutting plane itself */}
      {showPlane && (
        <mesh position={planePos} quaternion={planeQuat}>
          <planeGeometry args={[planeSize, planeSize]} />
          <meshBasicMaterial
            color={ACCENT}
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={radius * 1.1}
        maxDistance={radius * 6}
        makeDefault
      />

      {/* re-seat the camera when the active solid's scale changes */}
      <Reframe radius={radius} />
    </>
  );
}

export default function Viewport(props: ViewportProps) {
  const r = props.radius || 1.5;
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 42, position: [r * 1.9, r * 1.35, r * 2.1], near: 0.05, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        gl.setClearColor(new THREE.Color(SCENE_BG), 1);
      }}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
