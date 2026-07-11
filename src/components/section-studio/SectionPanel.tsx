// @ts-nocheck
/**
 * SectionPanel.tsx — the 2D readout side of Section Studio.
 *
 * Draws the live section contour as a crisp SVG line drawing (regenerated from
 * the computed loops on every plane move) and shows the derived measurements:
 * section area, perimeter, bounding-box dimensions, and loop count. Also owns
 * the "export SVG" action — the same drawing, serialized with resolved colors
 * so the downloaded file is self-contained.
 */

import { useMemo } from "react";
import { sectionToSVG } from "./section";
import type { SectionResult, SvgColors } from "./section";

interface SectionPanelProps {
  section: SectionResult;
  units: string;
  solidLabel: string;
}

const LIVE_COLORS: SvgColors = {
  bg: "rgb(var(--surface-bg))",
  grid: "rgb(var(--text-muted))",
  stroke: "rgb(var(--accent-rgb))",
  fill: "rgb(var(--accent-rgb) / 0.13)",
  text: "rgb(var(--text-mono))",
  accent: "rgb(var(--accent-rgb))",
};

function resolvedColors(): SvgColors {
  const cs = getComputedStyle(document.documentElement);
  const trip = (name: string, fallback: string) => {
    const v = cs.getPropertyValue(name).trim();
    return v ? `rgb(${v})` : fallback;
  };
  const tripA = (name: string, a: number, fallback: string) => {
    const v = cs.getPropertyValue(name).trim();
    return v ? `rgba(${v.split(/\s+/).join(",")},${a})` : fallback;
  };
  return {
    bg: trip("--surface-bg", "#0e1013"),
    grid: trip("--text-muted", "#747069"),
    stroke: trip("--accent-rgb", "#b8623f"),
    fill: tripA("--accent-rgb", 0.13, "rgba(184,98,63,0.13)"),
    text: trip("--text-mono", "#a19e94"),
    accent: trip("--accent-rgb", "#b8623f"),
  };
}

export default function SectionPanel({
  section,
  units,
  solidLabel,
}: SectionPanelProps) {
  const svg = useMemo(
    () =>
      sectionToSVG(section, {
        width: 440,
        height: 440,
        units,
        colors: LIVE_COLORS,
        showMeta: true,
      }),
    [section, units],
  );

  const bb = section.bbox;
  const dimW = bb ? bb.maxX - bb.minX : 0;
  const dimH = bb ? bb.maxY - bb.minY : 0;

  const onExport = () => {
    const out = sectionToSVG(section, {
      width: 440,
      height: 440,
      units,
      colors: resolvedColors(),
      showMeta: true,
    });
    const blob = new Blob([out], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `section-${solidLabel.toLowerCase().replace(/\s+/g, "-")}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const stats: { label: string; value: string }[] = [
    { label: "Area", value: `${section.area.toFixed(3)} ${units}²` },
    { label: "Perimeter", value: `${section.perimeter.toFixed(3)} ${units}` },
    { label: "Bounds", value: `${dimW.toFixed(2)} × ${dimH.toFixed(2)} ${units}` },
    { label: "Loops", value: String(section.loopCount) },
  ];

  return (
    <div className="ss-panel">
      <div className="ss-panel-head">
        <span className="mono-label">SECTION · 2D</span>
        <button className="btn ss-export" type="button" onClick={onExport}>
          Export SVG
        </button>
      </div>

      <div
        className="ss-svg"
        aria-label="Live cross-section contour"
        role="img"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <dl className="ss-stats">
        {stats.map((s) => (
          <div key={s.label} className="ss-stat">
            <dt className="mono-label">{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>

      <style>{`
        .ss-panel { display: flex; flex-direction: column; gap: 1rem; }
        .ss-panel-head {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        }
        .ss-export { padding: 0.35rem 0.7rem; font-size: 11px; }
        .ss-svg {
          width: 100%;
          aspect-ratio: 1 / 1;
          border: 1px solid rgb(var(--surface-border));
          border-radius: 6px;
          overflow: hidden;
          background: rgb(var(--surface-bg));
        }
        .ss-svg svg { display: block; width: 100%; height: 100%; }
        .ss-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem 1rem;
          margin: 0;
        }
        .ss-stat {
          display: flex; flex-direction: column; gap: 0.2rem;
          padding: 0.6rem 0.75rem;
          border: 1px solid rgb(var(--surface-border));
          border-radius: 5px;
          background: rgb(var(--surface-1-rgb) / 0.5);
        }
        .ss-stat dt { margin: 0; }
        .ss-stat dd {
          margin: 0;
          font-family: theme(fontFamily.mono, monospace);
          font-size: var(--step-0);
          color: rgb(var(--text-primary));
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
