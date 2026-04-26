/**
 * Tooltip.tsx — floating glass label that follows the cursor when a sprite is hovered.
 *
 * Compatible with both 2D and 3D modes. The tooltip subscribes to
 * `hoveredSlug` from the nav store and a global mousemove for cursor
 * coordinates, so it works regardless of whether the hover came from the
 * 2D plane (HTML buttons) or the 3D canvas (raycasting).
 *
 * Spec (Phase 2 contract):
 *   - 11px mono, uppercase weight on title via tracking
 *   - bg rgba(11,13,15,0.92) with backdrop-blur(12px)
 *   - 1px border, 4px radius, padding 6px 10px
 *   - z-index above all sprites and overlays
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
      className="pointer-events-none fixed font-mono leading-tight"
      style={{
        zIndex: 30000,
        left: pos.x + 14,
        top: pos.y + 14,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(11,13,15,0.92)",
        border: "1px solid rgba(94, 99, 107, 0.45)",
        borderRadius: "4px",
        padding: "6px 10px",
        fontSize: "11px",
        color: "#c8ccd0",
        maxWidth: "260px",
      }}
    >
      <div style={{ color: "#f4f5f6", letterSpacing: "0.02em" }}>
        {project.title}
      </div>
      <div
        style={{
          color: "#969ba2",
          marginTop: "2px",
          fontSize: "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {project.year}
      </div>
    </div>
  );
}
