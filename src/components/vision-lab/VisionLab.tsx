// @ts-nocheck
/**
 * VisionLab.tsx — the interactive island.
 *
 * Orchestrates two client-side computer-vision tasks over a shared image and a
 * shared, lazily-loaded model cache:
 *   1. Zero-shot classification (CLIP)     → ClassifyPanel
 *   2. Monocular depth estimation (DAv2)   → DepthPanel
 *
 * Everything runs in the browser via transformers.js + ONNX Runtime Web
 * (WebGPU where available, WASM otherwise). Images — samples or uploads — are
 * processed on-device and never transmitted anywhere.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MODELS,
  loadModel,
  preferredDevice,
  friendlyError,
  type Device,
} from "./engine";
import { SAMPLES, sampleDataURL } from "./samples";
import ClassifyPanel from "./ClassifyPanel";
import DepthPanel from "./DepthPanel";

type TaskKey = "classify" | "depth";

interface LoadState {
  status: "idle" | "loading" | "ready" | "error";
  percent: number;
  note?: string;
  file?: string;
  error?: string;
}

const IDLE: LoadState = { status: "idle", percent: 0 };

interface ActiveImage {
  url: string;
  name: string;
  isSample: boolean;
}

export default function VisionLab() {
  const samples = useMemo(
    () => SAMPLES.map((s) => ({ ...s, url: sampleDataURL(s.id) })),
    []
  );

  const [task, setTask] = useState<TaskKey>("classify");
  const [image, setImage] = useState<ActiveImage>(() => ({
    url: samples[0].url,
    name: samples[0].name,
    isSample: true,
  }));
  const [load, setLoadState] = useState<Record<TaskKey, LoadState>>({
    classify: IDLE,
    depth: IDLE,
  });
  const [device, setDevice] = useState<Device>(() => preferredDevice());
  const [deviceConfirmed, setDeviceConfirmed] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [depthDisplay, setDepthDisplay] = useState({
    hasDepth: false,
    opacity: 0.85,
    split: false,
  });

  const overlayRef = useRef<HTMLCanvasElement>(null);
  const prevObjectUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current);
    };
  }, []);

  const setTaskLoad = useCallback((key: TaskKey, patch: Partial<LoadState>) => {
    setLoadState((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }, []);

  // Loads (or returns cached) the model for a task, streaming progress to the
  // status bar. Returns the pipeline.
  const ensureModel = useCallback(
    async (key: TaskKey) => {
      setTaskLoad(key, { status: "loading", percent: 0, error: undefined });
      try {
        const { pipe, device: dev } = await loadModel(key, (p) => {
          setTaskLoad(key, {
            status: "loading",
            percent: p.percent,
            note: p.note,
            file: p.file,
          });
        });
        setDevice(dev);
        setDeviceConfirmed(true);
        setTaskLoad(key, { status: "ready", percent: 100, note: undefined });
        return pipe;
      } catch (e) {
        setTaskLoad(key, { status: "error", error: friendlyError(e) });
        throw e;
      }
    },
    [setTaskLoad]
  );

  const ensureClassify = useCallback(() => ensureModel("classify"), [ensureModel]);
  const ensureDepth = useCallback(() => ensureModel("depth"), [ensureModel]);

  function selectSample(s: (typeof samples)[number]) {
    if (prevObjectUrl.current) {
      URL.revokeObjectURL(prevObjectUrl.current);
      prevObjectUrl.current = null;
    }
    setImage({ url: s.url, name: s.name, isSample: true });
    setDepthDisplay((d) => ({ ...d, hasDepth: false }));
  }

  function handleFile(file: File | null | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current);
    const url = URL.createObjectURL(file);
    prevObjectUrl.current = url;
    setImage({ url, name: file.name, isSample: false });
    setDepthDisplay((d) => ({ ...d, hasDepth: false }));
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    handleFile(f);
  }, []);

  const active = load[task];
  const isReady = active.status === "ready";
  const isLoading = active.status === "loading";
  const spec = MODELS[task];

  const showOverlay = task === "depth" && depthDisplay.hasDepth;

  return (
    <div style={{ fontFamily: "theme(fontFamily.sans)" }}>
      {/* ── Status bar ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem 1.25rem",
          padding: "0.7rem 1rem",
          borderRadius: "6px",
          border: "1px solid rgb(var(--surface-border))",
          background: "rgb(var(--surface-1-rgb) / 0.6)",
          marginBottom: "1.5rem",
        }}
      >
        <span
          className="mono-label"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "rgb(var(--text-secondary))",
          }}
        >
          <span
            aria-hidden
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background:
                device === "webgpu"
                  ? "rgb(var(--accent-rgb))"
                  : "rgb(var(--text-mono))",
            }}
          />
          {device === "webgpu" ? "WebGPU" : "CPU · WASM"}
          {!deviceConfirmed ? " (target)" : ""}
        </span>

        <span className="mono-label" style={{ color: "rgb(var(--text-mono))" }}>
          {spec.title} · ~{spec.approxMB} MB {isReady ? "· cached" : "one-time"}
        </span>

        <span style={{ flex: 1, minWidth: "120px" }}>
          {isLoading && (
            <span style={{ display: "block" }}>
              <span
                style={{
                  display: "block",
                  height: "6px",
                  borderRadius: "3px",
                  background: "rgb(var(--surface-2-rgb))",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${active.percent}%`,
                    background: "rgb(var(--accent-rgb))",
                    transition: "width 240ms ease",
                  }}
                />
              </span>
              <span
                className="mono-label"
                style={{ fontSize: "0.68rem", color: "rgb(var(--text-mono))" }}
              >
                {active.note || `downloading ${active.file || ""}`} · {active.percent}%
              </span>
            </span>
          )}
          {isReady && (
            <span className="mono-label" style={{ color: "rgb(var(--accent-rgb))" }}>
              ✓ model ready · runs locally
            </span>
          )}
          {active.status === "idle" && (
            <span className="mono-label" style={{ color: "rgb(var(--text-muted))" }}>
              model loads on first run
            </span>
          )}
          {active.status === "error" && (
            <span className="mono-label" style={{ color: "rgb(var(--accent-rgb))" }}>
              load failed — press run to retry
            </span>
          )}
        </span>
      </div>

      {/* ── Task tabs ──────────────────────────────────────────────── */}
      <div role="tablist" aria-label="Vision task" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {(
          [
            ["classify", "Zero-shot · CLIP"],
            ["depth", "Depth · monocular"],
          ] as [TaskKey, string][]
        ).map(([key, label]) => {
          const on = task === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={on}
              onClick={() => setTask(key)}
              className="mono-label"
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: "5px",
                border: `1px solid ${on ? "rgb(var(--accent-rgb) / 0.5)" : "rgb(var(--surface-border))"}`,
                background: on ? "rgb(var(--accent-rgb) / 0.12)" : "transparent",
                color: on ? "rgb(var(--accent-rgb))" : "rgb(var(--text-secondary))",
                cursor: "pointer",
                letterSpacing: "0.06em",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Two-column instrument: stage + controls ────────────────── */}
      <div className="vl-grid">
        {/* Stage */}
        <div>
          <div
            className="vl-stage"
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: depthDisplay.split && showOverlay ? "1fr 1fr" : "1fr",
              gap: depthDisplay.split && showOverlay ? "0.5rem" : 0,
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid rgb(var(--surface-border))",
              background: "rgb(var(--surface-1-rgb))",
            }}
          >
            {/* image + overlay wrapper */}
            <div style={{ position: "relative", lineHeight: 0 }}>
              {image && (
                <img
                  src={image.url}
                  alt={image.isSample ? `Procedural sample: ${image.name}` : "Uploaded image"}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              )}
              <canvas
                ref={overlayRef}
                aria-hidden={!showOverlay}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  display: showOverlay ? "block" : "none",
                  opacity: depthDisplay.split ? 1 : depthDisplay.opacity,
                  clipPath: depthDisplay.split ? "inset(0 50% 0 0)" : "none",
                }}
              />
              {depthDisplay.split && showOverlay && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: "50%",
                    width: "1px",
                    background: "rgba(255,255,255,0.5)",
                  }}
                />
              )}
            </div>
          </div>
          <p
            className="mono-label"
            style={{ marginTop: "0.6rem", color: "rgb(var(--text-mono))", letterSpacing: "0.06em" }}
          >
            {image?.isSample ? `SAMPLE · ${image.name.toUpperCase()}` : `UPLOAD · ${image?.name || ""}`}
            {" · processed locally, never uploaded"}
          </p>
        </div>

        {/* Controls */}
        <div>
          {/* Image picker */}
          <p className="mono-label" style={{ marginBottom: "0.6rem" }}>
            Sample scenes
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {samples.map((s) => {
              const on = image?.isSample && image.name === s.name;
              return (
                <button
                  key={s.id}
                  onClick={() => selectSample(s)}
                  title={s.name}
                  aria-label={`Use sample: ${s.name}`}
                  style={{
                    padding: 0,
                    border: `1px solid ${on ? "rgb(var(--accent-rgb))" : "rgb(var(--surface-border))"}`,
                    borderRadius: "5px",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "none",
                    aspectRatio: "4 / 3",
                    outline: on ? "1px solid rgb(var(--accent-rgb))" : "none",
                  }}
                >
                  <img src={s.url} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </button>
              );
            })}
          </div>

          {/* Upload / drop zone */}
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              display: "block",
              padding: "0.9rem",
              textAlign: "center",
              borderRadius: "6px",
              border: `1px dashed ${dragOver ? "rgb(var(--accent-rgb))" : "rgb(var(--surface-border))"}`,
              background: dragOver ? "rgb(var(--accent-rgb) / 0.08)" : "rgb(var(--surface-1-rgb) / 0.5)",
              cursor: "pointer",
              marginBottom: "1.5rem",
              transition: "border-color 160ms ease, background 160ms ease",
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
              style={{ display: "none" }}
            />
            <span className="mono-label" style={{ color: "rgb(var(--text-secondary))" }}>
              Drop an image or click to upload
            </span>
            <span style={{ display: "block", fontSize: "0.7rem", color: "rgb(var(--text-muted))", marginTop: "0.3rem" }}>
              Stays on your device — nothing is uploaded
            </span>
          </label>

          {/* Task-specific controls */}
          {task === "classify" ? (
            <ClassifyPanel
              imageUrl={image?.url ?? null}
              ensureModel={ensureClassify}
              ready={isReady}
              loading={isLoading}
            />
          ) : (
            <DepthPanel
              imageUrl={image?.url ?? null}
              ensureModel={ensureDepth}
              ready={isReady}
              loading={isLoading}
              overlayRef={overlayRef}
              onDisplayChange={setDepthDisplay}
            />
          )}
        </div>
      </div>

      <style>{`
        .vl-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.75rem;
        }
        @media (min-width: 900px) {
          .vl-grid {
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
            gap: 2.5rem;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}
