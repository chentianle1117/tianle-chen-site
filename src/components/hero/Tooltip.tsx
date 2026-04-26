/**
 * Tooltip.tsx — floating glass label that follows the cursor when a sprite is hovered.
 *
 * Reads `hoveredSlug` from the nav store. The position is updated from a global
 * mousemove listener; we don't need to project from world space because the tooltip
 * is an HTML overlay sitting above the canvas.
 */

import { useEffect, useState } from "react";
import { useNavStore } from "../../lib/nav-store";

interface ProjectMeta {
  slug: string;
  title: string;
  year: number;
}

interface TooltipProps {
  projects: ProjectMeta[];
}

export default function Tooltip({ projects }: TooltipProps) {
  const hoveredSlug = useNavStore((s) => s.hoveredSlug);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!hoveredSlug) return null;
  const project = projects.find((p) => p.slug === hoveredSlug);
  if (!project) return null;

  return (
    <div
      className="pointer-events-none fixed z-20 rounded-md border px-2.5 py-1.5 font-mono text-[11px] leading-tight"
      style={{
        left: pos.x + 14,
        top: pos.y + 14,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(11,13,15,0.72)",
        borderColor: "rgba(26,28,32,0.40)",
        color: "#c8ccd0",
      }}
    >
      <div className="text-graphite-100">{project.title}</div>
      <div className="text-graphite-400">{project.year}</div>
    </div>
  );
}
