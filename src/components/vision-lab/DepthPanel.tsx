// @ts-nocheck
/**
 * DepthPanel.tsx — monocular depth estimation with Depth Anything.
 *
 * Runs the depth-estimation pipeline on the current image, then paints the
 * predicted per-pixel depth as a Turbo heatmap on a <canvas> the caller
 * overlays on the source. Exposes overlay opacity + a split-view toggle so the
 * viewer can compare source ↔ depth.
 */

import { useEffect, useRef, useState } from "react";
import { friendlyError } from "./engine";
import { depthToImageData } from "./colormap";

interface Props {
  imageUrl: string | null;
  ensureModel: () => Promise<any>;
  ready: boolean;
  loading: boolean;
  /** Canvas the parent renders as the heatmap overlay layer. */
  overlayRef: React.RefObject<HTMLCanvasElement>;
  /** Notifies the parent how to display the overlay. */
  onDisplayChange: (d: { hasDepth: boolean; opacity: number; split: boolean }) => void;
}

export default function DepthPanel({
  imageUrl,
  ensureModel,
  ready,
  loading,
  overlayRef,
  onDisplayChange,
}: Props) {
  const [running, setRunning] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const [hasDepth, setHasDepth] = useState(false);
  const [opacity, setOpacity] = useState(0.85);
  const [split, setSplit] = useState(false);
  const lastImage = useRef<string | null>(null);

  // Reset the depth result whenever the source image changes.
  useEffect(() => {
    if (lastImage.current !== imageUrl) {
      lastImage.current = imageUrl;
      setHasDepth(false);
      setErr(null);
      setMs(null);
    }
  }, [imageUrl]);

  useEffect(() => {
    onDisplayChange({ hasDepth, opacity, split });
  }, [hasDepth, opacity, split, onDisplayChange]);

  async function run() {
    if (!imageUrl || running) return;
    setErr(null);
    setRunning(true);
    try {
      const pipe = await ensureModel();
      const t0 = performance.now();
      const out = await pipe(imageUrl);
      setMs(Math.round(performance.now() - t0));
      // transformers.js returns { depth: RawImage, predicted_depth: Tensor }.
      const depth = out?.depth ?? out;
      const w = depth.width;
      const h = depth.height;
      const channels = depth.channels ?? 1;
      const data = depth.data;
      const img = depthToImageData(data, w, h, channels);
      const canvas = overlayRef.current;
      if (canvas) {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.putImageData(img, 0, 0);
      }
      setHasDepth(true);
    } catch (e) {
      setErr(friendlyError(e));
      setHasDepth(false);
    } finally {
      setRunning(false);
    }
  }

  const busy = running || loading;
  const canRun = !!imageUrl && !busy;

  return (
    <div>
      <p style={{ fontSize: "0.85rem", color: "rgb(var(--text-secondary))", lineHeight: 1.55, margin: "0 0 0.9rem" }}>
        Predicts a relative depth value for every pixel from this single image —
        no depth sensor, no second camera. Warmer = nearer, cooler = farther.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
        <button
          className="btn btn-primary"
          onClick={run}
          disabled={!canRun}
          style={{ opacity: canRun ? 1 : 0.5, cursor: canRun ? "pointer" : "not-allowed" }}
        >
          {running ? "Estimating…" : ready ? "Estimate depth" : "Load model + estimate"}
        </button>
        {ms != null && !running && (
          <span className="mono-label" style={{ letterSpacing: "0.06em" }}>
            {ms} ms
          </span>
        )}
      </div>

      {hasDepth && (
        <div style={{ marginTop: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <label className="mono-label" htmlFor="cv-opacity" style={{ whiteSpace: "nowrap" }}>
              Overlay
            </label>
            <input
              id="cv-opacity"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              disabled={split}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: "rgb(var(--accent-rgb))", opacity: split ? 0.4 : 1 }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                fontSize: "0.75rem",
                color: "rgb(var(--text-mono))",
                width: "3ch",
                textAlign: "right",
              }}
            >
              {Math.round(opacity * 100)}
            </span>
          </div>
          <button
            className="btn"
            onClick={() => setSplit((s) => !s)}
            style={{ fontSize: "0.72rem" }}
          >
            {split ? "Overlay view" : "Split view"}
          </button>
          {/* Turbo legend */}
          <div style={{ marginTop: "1rem" }}>
            <div
              style={{
                height: "10px",
                borderRadius: "3px",
                background:
                  "linear-gradient(to right, rgb(48,18,59), rgb(57,118,211), rgb(63,189,135), rgb(219,179,47), rgb(169,33,19))",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.3rem",
                fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                fontSize: "0.68rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgb(var(--text-mono))",
              }}
            >
              <span>Far</span>
              <span>Near</span>
            </div>
          </div>
        </div>
      )}

      {err && <p style={errStyle}>{err}</p>}
    </div>
  );
}

const errStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  color: "rgb(var(--accent-rgb))",
  marginTop: "0.8rem",
  lineHeight: 1.5,
  padding: "0.6rem 0.75rem",
  border: "1px solid rgb(var(--accent-rgb) / 0.4)",
  borderRadius: "5px",
  background: "rgb(var(--accent-rgb) / 0.08)",
};
