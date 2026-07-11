// @ts-nocheck
/**
 * ClassifyPanel.tsx — zero-shot image classification with CLIP.
 *
 * The user types their own candidate labels (comma-separated). CLIP encodes
 * the image and each label into a shared embedding space and scores by
 * similarity — no fine-tuning, no fixed class list. Results render as a ranked
 * horizontal bar chart of softmax probabilities.
 */

import { useState } from "react";
import { friendlyError } from "./engine";

const DEFAULT_LABELS =
  "a mountain landscape, a coastal sunset, a city street, an abstract 3D render, a dense forest, a starry night sky";

interface Result {
  label: string;
  score: number;
}

interface Props {
  imageUrl: string | null;
  ensureModel: () => Promise<any>;
  ready: boolean;
  loading: boolean;
}

export default function ClassifyPanel({ imageUrl, ensureModel, ready, loading }: Props) {
  const [labels, setLabels] = useState(DEFAULT_LABELS);
  const [results, setResults] = useState<Result[] | null>(null);
  const [running, setRunning] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ms, setMs] = useState<number | null>(null);

  const candidates = labels
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  async function run() {
    if (!imageUrl || candidates.length < 2 || running) return;
    setErr(null);
    setRunning(true);
    setResults(null);
    try {
      const pipe = await ensureModel();
      const t0 = performance.now();
      const out = await pipe(imageUrl, candidates);
      setMs(Math.round(performance.now() - t0));
      const sorted = [...out].sort((a, b) => b.score - a.score);
      setResults(sorted);
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setRunning(false);
    }
  }

  const busy = running || loading;
  const canRun = !!imageUrl && candidates.length >= 2 && !busy;

  return (
    <div>
      <label
        htmlFor="cv-labels"
        className="mono-label"
        style={{ display: "block", marginBottom: "0.5rem" }}
      >
        Candidate labels — comma separated
      </label>
      <textarea
        id="cv-labels"
        value={labels}
        onChange={(e) => setLabels(e.target.value)}
        rows={2}
        spellCheck={false}
        style={{
          width: "100%",
          resize: "vertical",
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          fontSize: "0.82rem",
          lineHeight: 1.5,
          padding: "0.6rem 0.75rem",
          color: "rgb(var(--text-primary))",
          background: "rgb(var(--surface-1-rgb))",
          border: "1px solid rgb(var(--surface-border))",
          borderRadius: "5px",
          outline: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem",
          marginTop: "0.75rem",
        }}
      >
        <button
          className="btn btn-primary"
          onClick={run}
          disabled={!canRun}
          style={{ opacity: canRun ? 1 : 0.5, cursor: canRun ? "pointer" : "not-allowed" }}
        >
          {running ? "Scoring…" : ready ? "Classify" : "Load model + classify"}
        </button>
        <span className="mono-label" style={{ letterSpacing: "0.06em" }}>
          {candidates.length} label{candidates.length === 1 ? "" : "s"}
          {ms != null && !running ? ` · ${ms} ms` : ""}
        </span>
      </div>

      {candidates.length < 2 && (
        <p style={hintStyle}>Enter at least two labels to compare.</p>
      )}

      {err && <p style={errStyle}>{err}</p>}

      {results && (
        <div style={{ marginTop: "1.25rem" }} aria-live="polite">
          {results.map((r, i) => {
            const pct = Math.round(r.score * 1000) / 10;
            const top = i === 0;
            return (
              <div key={r.label + i} style={{ marginBottom: "0.6rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "0.2rem",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: top ? "rgb(var(--text-primary))" : "rgb(var(--text-secondary))",
                      fontWeight: top ? 600 : 400,
                    }}
                  >
                    {r.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                      fontSize: "0.78rem",
                      color: top ? "rgb(var(--accent-rgb))" : "rgb(var(--text-mono))",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    borderRadius: "4px",
                    background: "rgb(var(--surface-2-rgb))",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.max(1.5, pct)}%`,
                      borderRadius: "4px",
                      background: top
                        ? "rgb(var(--accent-rgb))"
                        : "rgb(var(--accent-rgb) / 0.4)",
                      transition: "width 520ms cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                </div>
              </div>
            );
          })}
          <p style={{ ...hintStyle, marginTop: "0.9rem" }}>
            Probabilities are a softmax over cosine similarity between the image
            embedding and each label embedding — the essence of CLIP's shared
            image/text latent space.
          </p>
        </div>
      )}
    </div>
  );
}

const hintStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "rgb(var(--text-muted))",
  marginTop: "0.6rem",
  lineHeight: 1.5,
};
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
