/**
 * EncodingConsole.tsx — terminal-style status strip for the latent-space hero.
 *
 * Sits in the controls band below the scatter. Reflects the projection
 * process: when the user changes an axis or layout, a brief "computing"
 * sequence plays out (typewriter-style lines), then settles into a
 * persistent "ready" state showing the current projection signature.
 *
 * The point: make the encoding visible. The scatter is a projection of
 * 1024-D embeddings onto two user-chosen axis vectors; the console
 * surfaces that fact in a dev-tool aesthetic so the viewer SEES that
 * a projection is happening, not just animation.
 *
 * No real ML happens here — the math is in projectThesis.ts. This is a
 * narration of that math for the viewer.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavStore } from "../../lib/nav-store";
import type { ThesisAxisPreset } from "../../lib/layoutData";

interface Props {
  presets: Record<string, ThesisAxisPreset>;
  /** Total number of projects being projected. */
  count: number;
}

const STAGE_DELAYS = [0, 110, 230, 380, 520];
const COMPLETE_AT = 720; // ms — last line stays printed

function shortLabel(s: string | undefined): string {
  if (!s) return "?";
  return s.toLowerCase().replace(/\s+/g, "·");
}

export default function EncodingConsole({ presets, count }: Props) {
  const activeLayout = useNavStore((s) => s.activeLayout);
  const thesisAxes = useNavStore((s) => s.thesisAxes);

  // Lines emitted so far. Reset to 0 when axis/layout changes; advance via
  // a small staged timeline.
  const [linesShown, setLinesShown] = useState(STAGE_DELAYS.length);
  const [done, setDone] = useState(true);
  const timersRef = useRef<number[]>([]);

  // Recompute the script every time the projection signature changes.
  const script = useMemo(() => {
    const xKey = thesisAxes[0];
    const yKey = thesisAxes[1];
    const xLabels = presets[xKey]?.labels;
    const yLabels = presets[yKey]?.labels;
    const xSig = xLabels ? `${shortLabel(xLabels[1])}↔${shortLabel(xLabels[0])}` : "—";
    const ySig = yLabels ? `${shortLabel(yLabels[1])}↔${shortLabel(yLabels[0])}` : "—";

    if (activeLayout === "thesis") {
      return [
        `▸ semantic.project(x="${xSig}", y="${ySig}")`,
        `  load embeddings · ${count} × 768-D · open-clip ViT-L-14`,
        `  dot(emb, x_axis_vec) → x_coord  · normalize [-1,+1]`,
        `  dot(emb, y_axis_vec) → y_coord  · normalize [-1,+1]`,
        `  ease ${count} sprites · 800ms · easeInOutCubic`,
      ];
    }
    if (activeLayout === "umap") {
      return [
        `▸ umap.fit_transform(embeddings, n_neighbors=5)`,
        `  ${count} × 768-D → ${count} × 2-D`,
        `  cosine metric · iterative non-linear projection`,
        `  ease ${count} sprites · 800ms`,
      ];
    }
    if (activeLayout === "pca") {
      return [
        `▸ pca.fit_transform(embeddings, n_components=2)`,
        `  ${count} × 768-D → ${count} × 2-D`,
        `  PC1 = direction of max variance · linear`,
        `  ease ${count} sprites · 800ms`,
      ];
    }
    return [
      `▸ metadata.layout(domain × year)`,
      `  ${count} projects · 2021..2026`,
      `  no ML — published facts only`,
      `  ease ${count} sprites · 800ms`,
    ];
  }, [activeLayout, thesisAxes, presets, count]);

  // Staged playback: zero-out, print line by line with delay.
  useEffect(() => {
    // Reset
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setLinesShown(0);
    setDone(false);

    const lineCount = script.length;
    for (let i = 0; i < lineCount; i++) {
      const delay = STAGE_DELAYS[Math.min(i, STAGE_DELAYS.length - 1)];
      const id = window.setTimeout(() => setLinesShown(i + 1), delay);
      timersRef.current.push(id);
    }
    const doneId = window.setTimeout(() => setDone(true), COMPLETE_AT);
    timersRef.current.push(doneId);

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [script]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "relative",
        fontFamily:
          "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        lineHeight: 1.55,
        color: "#7aa15c",  // sage green — terminal stdout
        background: "rgb(var(--surface-1-rgb) / 0.8)",
        border: "1px solid rgb(var(--surface-border) / 0.30)",
        borderRadius: 4,
        padding: "8px 12px",
        whiteSpace: "pre",
        overflow: "hidden",
        minHeight: 110,
        flex: "1 1 auto",
        minWidth: 0,
      }}
    >
      {script.slice(0, linesShown).map((line, i) => (
        <div
          key={`${i}-${line}`}
          style={{
            opacity: 1,
            color: i === 0 ? "#cf7f54" /* oxide for entry-point */ : "#7aa15c",
            animation: "consoleLineIn 220ms ease both",
          }}
        >
          {line}
        </div>
      ))}
      {done && (
        <div style={{ color: "rgb(var(--text-mono))", marginTop: 2 }}>
          ✓ projection ready
          <span
            aria-hidden
            style={{
              marginLeft: 6,
              display: "inline-block",
              width: 6,
              height: 12,
              background: "rgb(var(--text-mono))",
              verticalAlign: "middle",
              animation: "consoleBlink 1.1s steps(2) infinite",
            }}
          />
        </div>
      )}
      <style>{`
        @keyframes consoleLineIn {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes consoleBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
