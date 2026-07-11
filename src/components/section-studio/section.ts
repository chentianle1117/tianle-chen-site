// @ts-nocheck
/**
 * section.ts — the computational-geometry core of Section Studio.
 *
 * Given a triangle soup and an oriented plane, this:
 *   1. intersects every triangle with the plane, producing 3D segments;
 *   2. projects those segments into the plane's 2D basis (u, v);
 *   3. welds shared endpoints and stitches the segments into closed contour
 *      loops (and any open polylines);
 *   4. measures section area (even-odd, hole-aware), perimeter, and the 2D
 *      bounding box;
 *   5. builds a filled 3D "cap" geometry (for the cut face) and an SVG string
 *      (for the live 2D drawing + file export).
 *
 * All of this runs on the CPU, in the browser, in real time as the plane moves.
 * Pure functions — no React, no side effects.
 */

import * as THREE from "three";

export interface Vec2 {
  x: number;
  y: number;
}

export interface SectionResult {
  /** closed contour loops in plane (u,v) coordinates */
  loops: Vec2[][];
  /** open polylines (only for non-watertight input) */
  open: Vec2[][];
  /** flat 3D endpoints of every raw intersection segment (for LineSegments) */
  segments3D: Float32Array;
  area: number;
  perimeter: number;
  bbox: { minX: number; minY: number; maxX: number; maxY: number } | null;
  /** plane frame in world space */
  u: [number, number, number];
  v: [number, number, number];
  n: [number, number, number];
  p0: [number, number, number];
  loopCount: number;
}

/* ── small vector helpers (plain arrays, no allocation churn) ────────────── */
function norm3(x: number, y: number, z: number): [number, number, number] {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}
function cross3(
  a: [number, number, number],
  b: [number, number, number],
): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Compute the planar section.
 *
 * @param soup     flat non-indexed triangle positions (9 floats per tri)
 * @param normal   plane normal (need not be unit)
 * @param offset   signed distance of the plane from the origin along `normal`
 * @param radius   model radius — used to scale the welding tolerance
 */
export function computeSection(
  soup: Float32Array,
  normal: [number, number, number],
  offset: number,
  radius: number,
): SectionResult {
  const n = norm3(normal[0], normal[1], normal[2]);
  const p0: [number, number, number] = [n[0] * offset, n[1] * offset, n[2] * offset];

  // plane basis: pick the world axis least aligned with n as the seed
  const ax = Math.abs(n[0]),
    ay = Math.abs(n[1]),
    az = Math.abs(n[2]);
  const ref: [number, number, number] =
    ax <= ay && ax <= az ? [1, 0, 0] : ay <= az ? [0, 1, 0] : [0, 0, 1];
  const u = norm3(...cross3(n, ref));
  const v = cross3(n, u); // already unit (n ⟂ u, both unit)

  const nTris = (soup.length / 9) | 0;
  const seg3: number[] = []; // flat 3D segment endpoints
  const seg2: number[] = []; // flat 2D segment endpoints (u,v)
  const n0 = n[0],
    n1 = n[1],
    n2 = n[2];
  const u0 = u[0],
    u1 = u[1],
    u2 = u[2];
  const v0v = v[0],
    v1v = v[1],
    v2v = v[2];
  const px0 = p0[0],
    py0 = p0[1],
    pz0 = p0[2];

  // scratch for the (up to 3) edge crossings of one triangle — reused, no
  // per-triangle allocation (this whole loop reruns as the plane drags).
  const cxs = [0, 0, 0];
  const cys = [0, 0, 0];
  const czs = [0, 0, 0];

  for (let ti = 0; ti < nTris; ti++) {
    const o = ti * 9;
    const ax = soup[o],
      ay = soup[o + 1],
      az2 = soup[o + 2];
    const bx = soup[o + 3],
      by = soup[o + 4],
      bz = soup[o + 5];
    const cx2 = soup[o + 6],
      cy2 = soup[o + 7],
      cz2 = soup[o + 8];
    // signed distance of each vertex to the plane
    const d0 = n0 * ax + n1 * ay + n2 * az2 - offset;
    const d1 = n0 * bx + n1 * by + n2 * bz - offset;
    const d2 = n0 * cx2 + n1 * cy2 + n2 * cz2 - offset;

    // Treat d >= 0 as the positive side so a vertex exactly on the plane is
    // counted once, not twice.
    let cnt = 0;
    // edge a→b
    if (d0 >= 0 !== d1 >= 0) {
      const t = d0 / (d0 - d1);
      cxs[cnt] = ax + t * (bx - ax);
      cys[cnt] = ay + t * (by - ay);
      czs[cnt] = az2 + t * (bz - az2);
      cnt++;
    }
    // edge b→c
    if (d1 >= 0 !== d2 >= 0) {
      const t = d1 / (d1 - d2);
      cxs[cnt] = bx + t * (cx2 - bx);
      cys[cnt] = by + t * (cy2 - by);
      czs[cnt] = bz + t * (cz2 - bz);
      cnt++;
    }
    // edge c→a
    if (d2 >= 0 !== d0 >= 0) {
      const t = d2 / (d2 - d0);
      cxs[cnt] = cx2 + t * (ax - cx2);
      cys[cnt] = cy2 + t * (ay - cy2);
      czs[cnt] = cz2 + t * (az2 - cz2);
      cnt++;
    }
    if (cnt !== 2) continue; // skip non-crossing / coplanar / degenerate tris

    for (let m = 0; m < 2; m++) {
      const wx = cxs[m] - px0,
        wy = cys[m] - py0,
        wz = czs[m] - pz0;
      seg3.push(cxs[m], cys[m], czs[m]);
      seg2.push(wx * u0 + wy * u1 + wz * u2, wx * v0v + wy * v1v + wz * v2v);
    }
  }

  const result: SectionResult = {
    loops: [],
    open: [],
    segments3D: new Float32Array(seg3),
    area: 0,
    perimeter: 0,
    bbox: null,
    u,
    v,
    n,
    p0,
    loopCount: 0,
  };
  if (seg2.length === 0) return result;

  // ── weld endpoints, stitch into polylines ──────────────────────────────
  const tol = Math.max(1e-6, radius * 1e-4);
  const inv = 1 / tol;
  const keyToId = new Map<string, number>();
  const ptX: number[] = [];
  const ptY: number[] = [];
  const addPt = (x: number, y: number): number => {
    const k = Math.round(x * inv) + "," + Math.round(y * inv);
    let id = keyToId.get(k);
    if (id === undefined) {
      id = ptX.length;
      ptX.push(x);
      ptY.push(y);
      keyToId.set(k, id);
    }
    return id;
  };

  const nSeg = seg2.length / 4;
  const ea = new Int32Array(nSeg);
  const eb = new Int32Array(nSeg);
  for (let s = 0; s < nSeg; s++) {
    const a = addPt(seg2[s * 4], seg2[s * 4 + 1]);
    const b = addPt(seg2[s * 4 + 2], seg2[s * 4 + 3]);
    ea[s] = a;
    eb[s] = b;
  }

  // adjacency: point id → list of {edge, other}
  const adj: { e: number; o: number }[][] = Array.from(
    { length: ptX.length },
    () => [],
  );
  for (let s = 0; s < nSeg; s++) {
    if (ea[s] === eb[s]) continue; // zero-length
    adj[ea[s]].push({ e: s, o: eb[s] });
    adj[eb[s]].push({ e: s, o: ea[s] });
  }

  const used = new Uint8Array(nSeg);
  const nextUnused = (id: number): { e: number; o: number } | null => {
    for (const link of adj[id]) if (!used[link.e]) return link;
    return null;
  };

  for (let s = 0; s < nSeg; s++) {
    if (used[s] || ea[s] === eb[s]) continue;
    used[s] = 1;
    const path: number[] = [ea[s], eb[s]];
    let closed = false;

    // extend forward from the tail
    let cur = eb[s];
    while (true) {
      const link = nextUnused(cur);
      if (!link) break;
      used[link.e] = 1;
      cur = link.o;
      if (cur === path[0]) {
        closed = true;
        break;
      }
      path.push(cur);
    }
    // if not closed, extend backward from the head
    if (!closed) {
      cur = path[0];
      while (true) {
        const link = nextUnused(cur);
        if (!link) break;
        used[link.e] = 1;
        cur = link.o;
        if (cur === path[path.length - 1]) {
          closed = true;
          break;
        }
        path.unshift(cur);
      }
    }

    const poly: Vec2[] = path.map((id) => ({ x: ptX[id], y: ptY[id] }));
    if (closed && poly.length >= 3) result.loops.push(poly);
    else if (poly.length >= 2) result.open.push(poly);
  }

  // ── measurements ───────────────────────────────────────────────────────
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const bumpBox = (p: Vec2[]) => {
    for (const q of p) {
      if (q.x < minX) minX = q.x;
      if (q.y < minY) minY = q.y;
      if (q.x > maxX) maxX = q.x;
      if (q.y > maxY) maxY = q.y;
    }
  };
  result.loops.forEach(bumpBox);
  result.open.forEach(bumpBox);
  if (minX !== Infinity) result.bbox = { minX, minY, maxX, maxY };

  // perimeter = total length of every closed loop (+ open polylines)
  let perim = 0;
  const polyLen = (p: Vec2[], close: boolean) => {
    let L = 0;
    for (let i = 0; i < p.length - 1; i++)
      L += Math.hypot(p[i + 1].x - p[i].x, p[i + 1].y - p[i].y);
    if (close && p.length > 1)
      L += Math.hypot(p[0].x - p[p.length - 1].x, p[0].y - p[p.length - 1].y);
    return L;
  };
  result.loops.forEach((p) => (perim += polyLen(p, true)));
  result.open.forEach((p) => (perim += polyLen(p, false)));
  result.perimeter = perim;

  // area via even-odd nesting: a loop's parity of containment depth decides
  // whether it adds (solid) or subtracts (hole).
  const depths = loopDepths(result.loops);
  let area = 0;
  for (let i = 0; i < result.loops.length; i++) {
    const a = Math.abs(signedArea(result.loops[i]));
    area += (depths[i] % 2 === 0 ? 1 : -1) * a;
  }
  result.area = Math.abs(area);
  result.loopCount = result.loops.length;

  return result;
}

/* ── polygon utilities ───────────────────────────────────────────────────── */
export function signedArea(poly: Vec2[]): number {
  let a = 0;
  for (let i = 0, n = poly.length; i < n; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % n];
    a += p.x * q.y - q.x * p.y;
  }
  return a / 2;
}

function pointInPoly(x: number, y: number, poly: Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y,
      xj = poly[j].x,
      yj = poly[j].y;
    const hit =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

/** For each loop, how many *other* loops contain its first vertex. */
function loopDepths(loops: Vec2[][]): number[] {
  const depths = new Array(loops.length).fill(0);
  for (let i = 0; i < loops.length; i++) {
    const p = loops[i][0];
    let d = 0;
    for (let j = 0; j < loops.length; j++) {
      if (i === j) continue;
      if (pointInPoly(p.x, p.y, loops[j])) d++;
    }
    depths[i] = d;
  }
  return depths;
}

/* ── 3D cap geometry: fill the cut face using the computed loops ─────────── */
export function buildCapGeometry(res: SectionResult): THREE.BufferGeometry | null {
  if (!res.loops.length) return null;
  const depths = loopDepths(res.loops);
  const outer: number[] = [];
  const inner: number[] = [];
  for (let i = 0; i < res.loops.length; i++)
    (depths[i] % 2 === 0 ? outer : inner).push(i);
  if (!outer.length) return null;

  const shapes: THREE.Shape[] = [];
  for (const oi of outer) {
    const loop = res.loops[oi];
    const shape = new THREE.Shape(loop.map((p) => new THREE.Vector2(p.x, p.y)));
    // attach holes whose depth is exactly one deeper and that sit inside `loop`
    for (const ii of inner) {
      if (depths[ii] !== depths[oi] + 1) continue;
      const hp = res.loops[ii][0];
      if (!pointInPoly(hp.x, hp.y, loop)) continue;
      shape.holes.push(
        new THREE.Path(res.loops[ii].map((p) => new THREE.Vector2(p.x, p.y))),
      );
    }
    shapes.push(shape);
  }

  let geo: THREE.BufferGeometry;
  try {
    geo = new THREE.ShapeGeometry(shapes);
  } catch {
    return null;
  }

  // map the XY cap into the plane's world frame: world = p0 + x·u + y·v
  const uV = new THREE.Vector3(...res.u);
  const vV = new THREE.Vector3(...res.v);
  const nV = new THREE.Vector3(...res.n);
  const m = new THREE.Matrix4().makeBasis(uV, vV, nV);
  m.setPosition(res.p0[0], res.p0[1], res.p0[2]);
  geo.applyMatrix4(m);
  geo.computeVertexNormals();
  return geo;
}

/* ── SVG export / live drawing ───────────────────────────────────────────── */
export interface SvgColors {
  bg: string;
  grid: string;
  stroke: string;
  fill: string;
  text: string;
  accent: string;
}

export interface SvgOptions {
  width?: number;
  height?: number;
  units?: string;
  colors: SvgColors;
  showMeta?: boolean;
}

/** Serialize the section to a standalone SVG string (used both for the live
 *  panel via innerHTML and for the downloadable .svg file). */
export function sectionToSVG(res: SectionResult, opts: SvgOptions): string {
  const W = opts.width ?? 420;
  const H = opts.height ?? 420;
  const c = opts.colors;
  const pad = 34;

  const bb = res.bbox;
  const paths: string[] = [];
  let content = "";

  if (!bb) {
    content = `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" style="fill:${c.text};font-family:monospace;font-size:12px;opacity:0.6">no intersection at this offset</text>`;
    return svgWrap(W, H, c.bg, content);
  }

  const spanX = Math.max(bb.maxX - bb.minX, 1e-4);
  const spanY = Math.max(bb.maxY - bb.minY, 1e-4);
  const s = Math.min((W - 2 * pad) / spanX, (H - 2 * pad) / spanY);
  const cxWorld = (bb.minX + bb.maxX) / 2;
  const cyWorld = (bb.minY + bb.maxY) / 2;
  // map world (u,v) → svg px. Flip Y so +v points up.
  const X = (x: number) => W / 2 + (x - cxWorld) * s;
  const Y = (y: number) => H / 2 - (y - cyWorld) * s;

  const loopPath = (p: Vec2[]) =>
    "M" +
    p.map((q) => `${X(q.x).toFixed(2)},${Y(q.y).toFixed(2)}`).join("L") +
    "Z";

  // filled area (even-odd handles holes automatically → robust regardless of
  // loop nesting analysis). Colors go in `style` (not presentation attributes)
  // so CSS custom properties resolve for the live, theme-reactive drawing.
  if (res.loops.length) {
    const dAll = res.loops.map(loopPath).join(" ");
    paths.push(
      `<path d="${dAll}" style="fill:${c.fill};fill-rule:evenodd;stroke:none" />`,
    );
    paths.push(
      `<path d="${dAll}" style="fill:none;fill-rule:evenodd;stroke:${c.stroke};stroke-width:1.6;stroke-linejoin:round" />`,
    );
  }
  for (const p of res.open) {
    const d = "M" + p.map((q) => `${X(q.x).toFixed(2)},${Y(q.y).toFixed(2)}`).join("L");
    paths.push(
      `<path d="${d}" style="fill:none;stroke:${c.stroke};stroke-width:1.6;stroke-linejoin:round" />`,
    );
  }

  // bounding-box frame + centre crosshair
  const bx0 = X(bb.minX),
    bx1 = X(bb.maxX),
    by0 = Y(bb.maxY),
    by1 = Y(bb.minY);
  const frame = `<rect x="${bx0.toFixed(1)}" y="${by0.toFixed(1)}" width="${(bx1 - bx0).toFixed(1)}" height="${(by1 - by0).toFixed(1)}" style="fill:none;stroke:${c.grid};stroke-width:1;stroke-dasharray:3 4" />`;
  const cxp = X(0),
    cyp = Y(0);
  let crosshair = "";
  if (cxp >= 0 && cxp <= W && cyp >= 0 && cyp <= H) {
    crosshair = `<g style="stroke:${c.grid};stroke-width:1;opacity:0.7"><line x1="${(cxp - 7).toFixed(1)}" y1="${cyp.toFixed(1)}" x2="${(cxp + 7).toFixed(1)}" y2="${cyp.toFixed(1)}"/><line x1="${cxp.toFixed(1)}" y1="${(cyp - 7).toFixed(1)}" x2="${cxp.toFixed(1)}" y2="${(cyp + 7).toFixed(1)}"/></g>`;
  }

  // dimension labels
  let meta = "";
  if (opts.showMeta !== false) {
    const uStr = opts.units ?? "u";
    const wDim = (bb.maxX - bb.minX).toFixed(3);
    const hDim = (bb.maxY - bb.minY).toFixed(3);
    const tStyle = `fill:${c.text};font-family:monospace;font-size:10px;opacity:0.8`;
    const cxm = (bx0 + (bx1 - bx0) / 2).toFixed(1);
    const cym = (by0 + (by1 - by0) / 2).toFixed(1);
    meta =
      `<text x="${cxm}" y="${(by0 - 8).toFixed(1)}" text-anchor="middle" style="${tStyle}">${wDim} ${uStr}</text>` +
      `<text x="${(bx1 + 8).toFixed(1)}" y="${cym}" text-anchor="start" transform="rotate(90 ${(bx1 + 8).toFixed(1)} ${cym})" style="${tStyle}">${hDim} ${uStr}</text>`;
  }

  content = frame + paths.join("") + crosshair + meta;
  return svgWrap(W, H, c.bg, content);
}

function svgWrap(W: number, H: number, bg: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><rect x="0" y="0" width="${W}" height="${H}" style="fill:${bg}"/>${body}</svg>`;
}
