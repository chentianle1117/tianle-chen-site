// @ts-nocheck
/**
 * samples.ts — built-in sample "scenes", generated PROCEDURALLY in the browser.
 *
 * There are no image files shipped with this page. Every sample is drawn from
 * scratch on a <canvas> the first time it's requested, then cached as a PNG
 * data URL. That makes the licensing trivially clean (the pixels are authored
 * by this code, CC0) and it doubles as a nice detail: the demo generates its
 * own test imagery.
 *
 * Each scene is composed with strong *monocular depth cues* — atmospheric
 * haze, size gradients, vertical placement, linear perspective, overlap — so
 * the depth model has real structure to recover, and enough semantic content
 * for CLIP to latch onto.
 */

export interface Sample {
  id: string;
  name: string;
  hint: string; // short mono caption
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

const W = 768;
const H = 576;

// Deterministic PRNG so scenes are stable across renders/sessions.
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function vGrad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  stops: [number, string][]
) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

/* ── Scene 1 — coastal horizon ─────────────────────────────────────────── */
function coast(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const horizon = h * 0.52;
  // Sky: warm at the horizon, cool up high.
  vGrad(ctx, 0, 0, w, horizon, [
    [0, "#243a5e"],
    [0.55, "#5b6f92"],
    [0.85, "#d99a6c"],
    [1, "#f2c493"],
  ]);
  // Sun low over the water.
  const sx = w * 0.68;
  const sy = horizon - 34;
  const sun = ctx.createRadialGradient(sx, sy, 4, sx, sy, 90);
  sun.addColorStop(0, "rgba(255,240,214,0.95)");
  sun.addColorStop(1, "rgba(255,240,214,0)");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sx, sy, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffeecb";
  ctx.beginPath();
  ctx.arc(sx, sy, 26, 0, Math.PI * 2);
  ctx.fill();
  // Sea: darker + nearer toward the bottom.
  vGrad(ctx, 0, horizon, w, h - horizon, [
    [0, "#c98f66"],
    [0.15, "#5c6b83"],
    [1, "#101826"],
  ]);
  // Wave bands: get taller/closer toward the viewer (size gradient = depth).
  const rnd = lcg(11);
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  for (let i = 0; i < 26; i++) {
    const t = i / 25;
    const y = horizon + t * t * (h - horizon);
    ctx.lineWidth = 0.5 + t * 2.4;
    ctx.beginPath();
    let x = 0;
    ctx.moveTo(0, y);
    while (x < w) {
      const amp = 1 + t * 6;
      x += 24 + rnd() * 40;
      ctx.lineTo(x, y + Math.sin(x * 0.05) * amp);
    }
    ctx.stroke();
  }
}

/* ── Scene 2 — layered ridges (atmospheric perspective) ────────────────── */
function ridges(ctx: CanvasRenderingContext2D, w: number, h: number) {
  vGrad(ctx, 0, 0, w, h, [
    [0, "#eaddc7"],
    [0.5, "#dcc7a8"],
    [1, "#c8a883"],
  ]);
  // Distant layers are lighter + higher; near layers darker + lower. Classic
  // haze depth cue the model keys on.
  const layers = 6;
  for (let l = 0; l < layers; l++) {
    const t = l / (layers - 1);
    const rnd = lcg(100 + l * 7);
    const baseY = h * (0.32 + t * 0.6);
    const amp = 26 + t * 60;
    // fade from pale (far) to deep (near)
    const shade = Math.round(200 - t * 150);
    const tint = Math.round(150 - t * 110);
    ctx.fillStyle = `rgb(${shade},${Math.round(shade * 0.82)},${tint})`;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, baseY);
    let x = 0;
    let y = baseY;
    while (x <= w) {
      x += 26 + rnd() * 46;
      y = baseY - amp * (0.4 + rnd()) + (rnd() - 0.5) * amp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }
}

/* ── Scene 3 — boulevard (one-point linear perspective) ────────────────── */
function boulevard(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const vpX = w * 0.5;
  const vpY = h * 0.46;
  // sky + ground
  vGrad(ctx, 0, 0, w, vpY, [
    [0, "#8fb2d6"],
    [1, "#d7e4ee"],
  ]);
  vGrad(ctx, 0, vpY, w, h - vpY, [
    [0, "#c9c3b6"],
    [1, "#6f6a60"],
  ]);
  // road to the vanishing point
  ctx.fillStyle = "#3b3a38";
  ctx.beginPath();
  ctx.moveTo(vpX - 8, vpY);
  ctx.lineTo(vpX + 8, vpY);
  ctx.lineTo(w * 0.74, h);
  ctx.lineTo(w * 0.26, h);
  ctx.closePath();
  ctx.fill();
  // dashed centre line
  ctx.strokeStyle = "#e9d27a";
  for (let i = 1; i < 9; i++) {
    const t0 = i / 9;
    const t1 = t0 + 0.035;
    ctx.lineWidth = 1 + t0 * 5;
    ctx.beginPath();
    ctx.moveTo(vpX, vpY + t0 * (h - vpY));
    ctx.lineTo(vpX, vpY + t1 * (h - vpY));
    ctx.stroke();
  }
  // building blocks receding on both sides — nearer = taller/wider/darker
  const drawRow = (side: number) => {
    const rnd = lcg(side > 0 ? 42 : 77);
    for (let i = 0; i < 7; i++) {
      const t = i / 7; // 0 far → 1 near
      const persp = 0.06 + t * 0.9;
      const bw = 40 + persp * 150;
      const bh = 60 + persp * 240;
      const gap = 6 + persp * 40;
      const cx =
        vpX + side * (10 + persp * (w * 0.52));
      const x = side > 0 ? cx : cx - bw;
      const y = vpY - persp * 40;
      const shade = Math.round(120 - t * 55 + rnd() * 20);
      ctx.fillStyle = `rgb(${shade},${shade + 6},${shade + 14})`;
      ctx.fillRect(x + (side > 0 ? gap : -gap), y, bw, bh);
      // windows
      ctx.fillStyle = "rgba(255,236,180,0.5)";
      const cols = 3;
      const rows = Math.max(2, Math.round(bh / 40));
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          if (rnd() > 0.55) continue;
          ctx.fillRect(
            x + (side > 0 ? gap : -gap) + 6 + (c * (bw - 12)) / cols,
            y + 8 + (r * (bh - 12)) / rows,
            (bw - 12) / cols - 5,
            (bh - 12) / rows - 6
          );
        }
    }
  };
  drawRow(1);
  drawRow(-1);
}

/* ── Scene 4 — still life: shaded spheres on a plane ───────────────────── */
function spheres(ctx: CanvasRenderingContext2D, w: number, h: number) {
  vGrad(ctx, 0, 0, w, h, [
    [0, "#20242c"],
    [0.55, "#2c333d"],
    [1, "#0d0f13"],
  ]);
  // floor plane
  vGrad(ctx, 0, h * 0.62, w, h * 0.38, [
    [0, "#3a4250"],
    [1, "#11151b"],
  ]);
  const rnd = lcg(9);
  // near→far by radius + vertical position; nearer spheres drawn last (overlap)
  const balls = [
    { x: 0.28, y: 0.78, r: 118, hue: "#d98a5b" },
    { x: 0.62, y: 0.7, r: 92, hue: "#5b9bd9" },
    { x: 0.48, y: 0.58, r: 60, hue: "#9bd95b" },
    { x: 0.74, y: 0.54, r: 44, hue: "#c98fd9" },
    { x: 0.34, y: 0.5, r: 30, hue: "#d9cf5b" },
  ];
  for (const b of balls) {
    const cx = b.x * w;
    const cy = b.y * h;
    // contact shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(cx + b.r * 0.15, cy + b.r * 0.92, b.r * 1.05, b.r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    // sphere with a light from upper-left
    const g = ctx.createRadialGradient(
      cx - b.r * 0.4,
      cy - b.r * 0.45,
      b.r * 0.1,
      cx,
      cy,
      b.r
    );
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.25, b.hue);
    g.addColorStop(1, "#0c0e12");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const SAMPLES: Sample[] = [
  { id: "coast", name: "Coastal horizon", hint: "SUNSET · HORIZON DEPTH", draw: coast },
  { id: "ridges", name: "Layered ridges", hint: "ATMOSPHERIC PERSPECTIVE", draw: ridges },
  { id: "boulevard", name: "Boulevard", hint: "ONE-POINT PERSPECTIVE", draw: boulevard },
  { id: "spheres", name: "Still life", hint: "SHADING · OVERLAP · SIZE", draw: spheres },
];

// Cache generated data URLs so each scene is rasterised at most once.
const _cache = new Map<string, string>();

export function sampleDataURL(id: string): string {
  const hit = _cache.get(id);
  if (hit) return hit;
  const s = SAMPLES.find((x) => x.id === id);
  if (!s) return "";
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  s.draw(ctx, W, H);
  const url = canvas.toDataURL("image/png");
  _cache.set(id, url);
  return url;
}

export const SAMPLE_SIZE = { w: W, h: H };
