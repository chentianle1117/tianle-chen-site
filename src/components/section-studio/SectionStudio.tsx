// @ts-nocheck
/**
 * SectionStudio.tsx — the interactive island.
 *
 * Owns all UI state (active solid, plane orientation, plane offset, toggles),
 * derives the triangle soup + live section, and lays out the 3D viewport
 * beside the 2D readout panel. Mounted with client:only="react" — WebGL can't
 * server-render.
 *
 * All surrounding chrome (panels, labels, sliders, buttons) is painted with
 * the site's CSS design tokens so it flips correctly between light and dark.
 * The WebGL scene itself stays dark in both themes (allowed).
 */

import React, { useEffect, useMemo, useState } from "react";
import Viewport from "./Viewport";
import SectionPanel from "./SectionPanel";
import { makeSolid, toTriangleSoup, SOLIDS } from "./geometry";
import type { SolidId } from "./geometry";
import { computeSection, buildCapGeometry } from "./section";

const DEG = Math.PI / 180;

/* ── tiny error boundary so a WebGL failure degrades gracefully ──────────── */
class GLBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="ss-gl-fallback">
          <p className="mono-label">WEBGL UNAVAILABLE</p>
          <p>
            This viewport needs WebGL. The 2D section readout and measurements
            still work.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SectionStudio() {
  const [solidId, setSolidId] = useState<SolidId>("building");
  const [az, setAz] = useState(0);
  const [polar, setPolar] = useState(0);
  const [offset, setOffset] = useState(0);
  const [showPlane, setShowPlane] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  const solid = useMemo(() => makeSolid(solidId), [solidId]);
  const soup = useMemo(() => toTriangleSoup(solid.geometry), [solid]);
  const radius = solid.radius;

  // reset the cutting plane to the solid's illustrative default on switch
  useEffect(() => {
    setAz(solid.defaultAz);
    setPolar(solid.defaultPolar);
    setOffset(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solidId]);

  const normal = useMemo<[number, number, number]>(() => {
    const p = polar * DEG;
    const a = az * DEG;
    const h = Math.sin(p);
    return [h * Math.cos(a), Math.cos(p), h * Math.sin(a)];
  }, [az, polar]);

  const section = useMemo(
    () => computeSection(soup, normal, offset, radius),
    [soup, normal[0], normal[1], normal[2], offset, radius],
  );

  const capGeometry = useMemo(() => buildCapGeometry(section), [section]);
  useEffect(() => () => capGeometry?.dispose(), [capGeometry]);

  // release the previous solid's GPU buffers when switching
  useEffect(() => () => solid.geometry.dispose(), [solid]);

  // slider range = the solid's extent projected onto the current cut normal,
  // so the plane sweeps exactly the useful span for any orientation.
  const range = useMemo(() => {
    const { min, max } = solid.bbox;
    let s = 0;
    for (const x of [min[0], max[0]])
      for (const y of [min[1], max[1]])
        for (const z of [min[2], max[2]])
          s = Math.max(s, Math.abs(normal[0] * x + normal[1] * y + normal[2] * z));
    return (s || radius) * 1.001;
  }, [solid, normal[0], normal[1], normal[2], radius]);

  const setPreset = (axis: "x" | "y" | "z") => {
    if (axis === "x") {
      setAz(0);
      setPolar(90);
    } else if (axis === "y") {
      setAz(0);
      setPolar(0);
    } else {
      setAz(90);
      setPolar(90);
    }
  };

  const nStr = `(${normal[0].toFixed(2)}, ${normal[1].toFixed(2)}, ${normal[2].toFixed(2)})`;

  return (
    <div className="ss-root">
      {/* solid selector */}
      <div className="ss-solids" role="tablist" aria-label="Choose a solid">
        {SOLIDS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === solidId}
            className={"ss-solid" + (s.id === solidId ? " is-active" : "")}
            onClick={() => setSolidId(s.id)}
          >
            <span className="ss-solid-label">{s.label}</span>
            <span className="ss-solid-blurb">{s.blurb}</span>
          </button>
        ))}
      </div>

      {/* instrument: viewport + controls | section readout */}
      <div className="ss-grid">
        <div className="ss-left">
          <div className="ss-viewport">
            <div className="ss-vp-tag mono-label">LIVE · 3D · CLIPPED</div>
            <GLBoundary>
              <Viewport
                geometry={solid.geometry}
                capGeometry={capGeometry}
                section={section}
                normal={normal}
                offset={offset}
                radius={radius}
                showPlane={showPlane}
                wireframe={wireframe}
              />
            </GLBoundary>
          </div>

          <div className="ss-controls">
            <div className="ss-ctrl-row">
              <span className="mono-label ss-ctrl-key">PLANE AXIS</span>
              <div className="ss-presets">
                <button type="button" className="ss-pill" onClick={() => setPreset("x")}>
                  X
                </button>
                <button type="button" className="ss-pill" onClick={() => setPreset("y")}>
                  Y
                </button>
                <button type="button" className="ss-pill" onClick={() => setPreset("z")}>
                  Z
                </button>
                <span className="ss-normal mono-label">n = {nStr}</span>
              </div>
            </div>

            <label className="ss-slider">
              <span className="mono-label">
                OFFSET <span className="ss-val">{offset.toFixed(3)}</span>
              </span>
              <input
                type="range"
                min={-range}
                max={range}
                step={range / 240}
                value={offset}
                onChange={(e) => setOffset(parseFloat(e.target.value))}
              />
            </label>

            <label className="ss-slider">
              <span className="mono-label">
                AZIMUTH <span className="ss-val">{az.toFixed(0)}°</span>
              </span>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={az}
                onChange={(e) => setAz(parseFloat(e.target.value))}
              />
            </label>

            <label className="ss-slider">
              <span className="mono-label">
                ELEVATION <span className="ss-val">{polar.toFixed(0)}°</span>
              </span>
              <input
                type="range"
                min={0}
                max={180}
                step={1}
                value={polar}
                onChange={(e) => setPolar(parseFloat(e.target.value))}
              />
            </label>

            <div className="ss-toggles">
              <button
                type="button"
                className={"ss-toggle" + (showPlane ? " is-on" : "")}
                aria-pressed={showPlane}
                onClick={() => setShowPlane((v) => !v)}
              >
                {showPlane ? "◨" : "◻"} Cut plane
              </button>
              <button
                type="button"
                className={"ss-toggle" + (wireframe ? " is-on" : "")}
                aria-pressed={wireframe}
                onClick={() => setWireframe((v) => !v)}
              >
                {wireframe ? "▦" : "▩"} Wireframe
              </button>
            </div>
          </div>
        </div>

        <div className="ss-right">
          <SectionPanel section={section} units={solid.units} solidLabel={solid.label} />
        </div>
      </div>

      <style>{`
        .ss-root {
          --ss-gap: 1.25rem;
          border: 1px solid rgb(var(--surface-border));
          border-radius: 10px;
          background: rgb(var(--surface-1-rgb) / 0.35);
          padding: clamp(0.85rem, 2vw, 1.5rem);
          display: flex;
          flex-direction: column;
          gap: var(--ss-gap);
        }

        .ss-solids {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.6rem;
        }
        .ss-solid {
          text-align: left;
          padding: 0.7rem 0.85rem;
          border: 1px solid rgb(var(--surface-border));
          border-radius: 6px;
          background: rgb(var(--surface-bg) / 0.4);
          cursor: pointer;
          transition: border-color 180ms ease, background 180ms ease;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .ss-solid:hover { border-color: rgb(var(--accent-rgb) / 0.45); }
        .ss-solid.is-active {
          border-color: rgb(var(--accent-rgb));
          background: rgb(var(--accent-rgb) / 0.08);
        }
        .ss-solid-label {
          font-family: theme(fontFamily.display, serif);
          font-size: var(--step-1);
          color: rgb(var(--text-primary));
          line-height: 1.1;
        }
        .ss-solid-blurb {
          font-size: var(--step--1);
          color: rgb(var(--text-secondary));
          line-height: 1.35;
        }

        .ss-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(280px, 1fr);
          gap: var(--ss-gap);
          align-items: start;
        }
        @media (max-width: 900px) {
          .ss-grid { grid-template-columns: minmax(0, 1fr); }
          .ss-solids { grid-template-columns: minmax(0, 1fr); }
        }

        .ss-viewport {
          position: relative;
          width: 100%;
          height: clamp(360px, 52vh, 560px);
          border: 1px solid rgb(var(--surface-border));
          border-radius: 8px;
          overflow: hidden;
          background: #0e1013;
        }
        .ss-vp-tag {
          position: absolute;
          left: 0.75rem; top: 0.75rem;
          z-index: 5;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: rgba(14, 16, 19, 0.7);
          backdrop-filter: blur(8px);
          color: #b9bec6;
          letter-spacing: 0.14em;
          font-size: 10px;
          pointer-events: none;
        }
        .ss-gl-fallback {
          display: flex; flex-direction: column; gap: 0.5rem;
          align-items: center; justify-content: center;
          height: 100%; padding: 2rem; text-align: center;
          color: rgb(var(--text-secondary));
        }

        .ss-controls {
          margin-top: var(--ss-gap);
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .ss-ctrl-row {
          display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem 1rem;
        }
        .ss-ctrl-key { min-width: 5.5rem; }
        .ss-presets { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
        .ss-pill {
          font-family: theme(fontFamily.mono, monospace);
          font-size: var(--step--1);
          padding: 0.28rem 0.7rem;
          border: 1px solid rgb(var(--surface-border));
          border-radius: 4px;
          background: transparent;
          color: rgb(var(--text-primary));
          cursor: pointer;
          transition: border-color 160ms ease, color 160ms ease;
        }
        .ss-pill:hover { border-color: rgb(var(--accent-rgb) / 0.5); color: rgb(var(--accent-rgb)); }
        .ss-normal { color: rgb(var(--text-mono)); letter-spacing: 0.04em; }

        .ss-slider { display: flex; flex-direction: column; gap: 0.35rem; }
        .ss-slider .ss-val {
          color: rgb(var(--accent-rgb));
          font-variant-numeric: tabular-nums;
        }
        .ss-slider input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 3px;
          border-radius: 3px;
          background: rgb(var(--surface-border));
          outline-offset: 4px;
        }
        .ss-slider input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 15px; height: 15px;
          border-radius: 50%;
          background: rgb(var(--accent-rgb));
          border: 2px solid rgb(var(--surface-bg));
          cursor: pointer;
        }
        .ss-slider input[type="range"]::-moz-range-thumb {
          width: 15px; height: 15px;
          border-radius: 50%;
          background: rgb(var(--accent-rgb));
          border: 2px solid rgb(var(--surface-bg));
          cursor: pointer;
        }

        .ss-toggles { display: flex; gap: 0.6rem; flex-wrap: wrap; }
        .ss-toggle {
          font-family: theme(fontFamily.mono, monospace);
          font-size: var(--step--1);
          padding: 0.32rem 0.7rem;
          border: 1px solid rgb(var(--surface-border));
          border-radius: 4px;
          background: transparent;
          color: rgb(var(--text-secondary));
          cursor: pointer;
          transition: border-color 160ms ease, color 160ms ease;
        }
        .ss-toggle.is-on {
          border-color: rgb(var(--accent-rgb));
          color: rgb(var(--accent-rgb));
        }
      `}</style>
    </div>
  );
}
