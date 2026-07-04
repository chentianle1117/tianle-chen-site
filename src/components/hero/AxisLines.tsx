/**
 * AxisLines.tsx — subtle XYZ axis indicators for the latent-space hero.
 *
 * Renders three positive-direction lines (graphite-500) from the origin to
 * just past the unit cube edge, three short negative-direction stubs, an
 * origin marker sphere, and three reactive text labels at each positive end.
 *
 * Labels are mode-aware:
 *   - thesis   → presets[axisKey].labels[0]   (positive endpoint label)
 *   - umap     → "U1" / "U2" / "U3"
 *   - pca      → "PC1" / "PC2" / "PC3"
 *   - metadata → "DOMAIN" / "YEAR" / "TIER"
 *
 * Faded in over 600ms via group-level opacity tween. Uses drei's <Line>
 * (cross-browser reliable line widths) and drei's <Billboard> for labels.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Line, Text } from "@react-three/drei";
import * as THREE from "three";

import { useNavStore } from "../../lib/nav-store";
import type { ThesisAxisPreset } from "../../lib/layoutData";

const GRAPHITE_500 = "rgb(var(--surface-border))";
const GRAPHITE_600 = "rgb(var(--surface-border))";
const OXIDE_500 = "#f28a4a";

const POS_END = 1.05;
const NEG_END = -0.15;
const LABEL_OFFSET = 1.15;

interface AxisLinesProps {
  presets: Record<string, ThesisAxisPreset>;
}

function staticLabels(
  layout: "thesis" | "umap" | "pca" | "metadata",
): [string, string, string] {
  if (layout === "umap") return ["U1", "U2", "U3"];
  if (layout === "pca") return ["PC1", "PC2", "PC3"];
  if (layout === "metadata") return ["DOMAIN", "YEAR", "TIER"];
  return ["X", "Y", "Z"]; // fallback (thesis is handled separately)
}

export default function AxisLines({ presets }: AxisLinesProps) {
  const activeLayout = useNavStore((s) => s.activeLayout);
  const thesisAxes = useNavStore((s) => s.thesisAxes);

  // Compute labels reactively from store + presets.
  const labels = useMemo<[string, string, string]>(() => {
    if (activeLayout === "thesis") {
      return [
        presets[thesisAxes[0]]?.labels?.[0] ?? "X",
        presets[thesisAxes[1]]?.labels?.[0] ?? "Y",
        presets[thesisAxes[2]]?.labels?.[0] ?? "Z",
      ];
    }
    return staticLabels(activeLayout);
  }, [activeLayout, thesisAxes, presets]);

  // Fade-in over 600ms after mount (presets are passed once embeddings + layouts loaded).
  const groupRef = useRef<THREE.Group>(null);
  const [opacity, setOpacity] = useState(0);
  const startRef = useRef<number>(performance.now());

  useEffect(() => {
    startRef.current = performance.now();
    setOpacity(0);
  }, []);

  useFrame(() => {
    if (opacity >= 1) return;
    const t = Math.min(1, (performance.now() - startRef.current) / 600);
    setOpacity(t);
  });

  // Line geometries (computed once).
  const posLines = useMemo<Array<[[number, number, number], [number, number, number]]>>(
    () => [
      [[0, 0, 0], [POS_END, 0, 0]],
      [[0, 0, 0], [0, POS_END, 0]],
      [[0, 0, 0], [0, 0, POS_END]],
    ],
    [],
  );
  const negLines = useMemo<Array<[[number, number, number], [number, number, number]]>>(
    () => [
      [[0, 0, 0], [NEG_END, 0, 0]],
      [[0, 0, 0], [0, NEG_END, 0]],
      [[0, 0, 0], [0, 0, NEG_END]],
    ],
    [],
  );

  const labelPositions: Array<[number, number, number]> = [
    [LABEL_OFFSET, 0, 0],
    [0, LABEL_OFFSET, 0],
    [0, 0, LABEL_OFFSET],
  ];

  return (
    <group ref={groupRef}>
      {/* Positive-direction lines */}
      {posLines.map((pts, i) => (
        <Line
          key={`pos-${i}`}
          points={pts}
          color={GRAPHITE_500}
          lineWidth={1}
          transparent
          opacity={opacity * 0.85}
        />
      ))}
      {/* Negative-direction stubs */}
      {negLines.map((pts, i) => (
        <Line
          key={`neg-${i}`}
          points={pts}
          color={GRAPHITE_500}
          lineWidth={1}
          transparent
          opacity={opacity * 0.55}
        />
      ))}
      {/* Origin marker */}
      <mesh>
        <sphereGeometry args={[0.01, 12, 12]} />
        <meshBasicMaterial
          color={GRAPHITE_600}
          transparent
          opacity={opacity}
        />
      </mesh>
      {/* Labels — billboarded to face camera */}
      {labels.map((label, i) => (
        <Billboard key={`label-${i}`} position={labelPositions[i]}>
          <Text
            fontSize={0.07}
            color={OXIDE_500}
            anchorX="center"
            anchorY="middle"
            fillOpacity={opacity}
            outlineOpacity={0}
          >
            {label}
          </Text>
        </Billboard>
      ))}
    </group>
  );
}
