/**
 * FlatScatter.tsx — SVG fallback for mobile / no-WebGL / reduced-motion.
 *
 * Drops Z, lays out 16 thumbnails as <image>s in an SVG inside a pan/zoom wrapper.
 * Reuses ModePanel + AxisInputs overlays so the UI surface is identical.
 */

import { useMemo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { LayoutDataBundle } from "../../lib/layoutData";
import { useNavStore } from "../../lib/nav-store";
import ModePanel from "./ModePanel";
import AxisInputs from "./AxisInputs";

interface FlatScatterProps {
  data: LayoutDataBundle;
}

const VIEW = 800;
const PAD = 60;
const THUMB = 64;

function pickLayout(
  data: LayoutDataBundle,
  layout: "thesis" | "umap" | "pca" | "metadata",
): Record<string, [number, number, number]> {
  if (layout === "thesis") return data.layouts.thesis_default;
  return data.layouts[layout];
}

export default function FlatScatter({ data }: FlatScatterProps) {
  const activeLayout = useNavStore((s) => s.activeLayout);
  const setHovered = useNavStore((s) => s.setHovered);

  const positions = useMemo(() => {
    const layout = pickLayout(data, activeLayout);
    return data.embeddings.projects.map((p) => {
      const c = layout[p.slug] ?? [0, 0, 0];
      // map [-1,1] -> [PAD, VIEW-PAD]
      const x = ((c[0] + 1) / 2) * (VIEW - 2 * PAD) + PAD;
      const y = (1 - (c[1] + 1) / 2) * (VIEW - 2 * PAD) + PAD;
      return { project: p, x, y };
    });
  }, [data, activeLayout]);

  return (
    <div className="relative h-[78vh] min-h-[640px] w-full overflow-hidden bg-graphite-900">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        wheel={{ step: 0.1 }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%" }}
        >
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {positions.map(({ project, x, y }) => {
              const [u, v, w, h] = project.thumbnail_uv;
              return (
                <a
                  key={project.slug}
                  href={`/work/${project.slug}`}
                  onMouseEnter={() => setHovered(project.slug)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <image
                    href="/data/atlas.png"
                    x={x - THUMB / 2}
                    y={y - THUMB / 2}
                    width={THUMB / w}
                    height={THUMB / h}
                    preserveAspectRatio="none"
                    style={{
                      clipPath: `inset(${v * 100}% ${(1 - u - w) * 100}% ${
                        (1 - v - h) * 100
                      }% ${u * 100}%)`,
                      transform: `translate(${-((u * THUMB) / w)}px, ${-(
                        (v * THUMB) /
                        h
                      )}px)`,
                      transformBox: "fill-box",
                    }}
                  />
                </a>
              );
            })}
          </svg>
        </TransformComponent>
      </TransformWrapper>
      <ModePanel presets={data.layouts.thesis_axes_cache} />
      <AxisInputs presets={data.layouts.thesis_axes_cache} />
    </div>
  );
}
