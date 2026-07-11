// @ts-nocheck
/**
 * geometry.ts — procedural solid generators for Section Studio.
 *
 * Every solid is generated at runtime from THREE primitives / implicit fields.
 * No external model files, no licensed assets. Each generator returns a plain
 * THREE.BufferGeometry centred at the origin with identity transform, so the
 * mesh's local space == world space — which lets a single world-space cutting
 * plane drive BOTH the GPU material clipping and the CPU section computation
 * without any coordinate juggling.
 *
 * Three solids:
 *   (a) building — a stepped massing (stacked, set-back floor slabs)
 *   (b) bracket  — a mechanical plate with drilled holes (ExtrudeGeometry)
 *   (c) gyroid   — a solid slice of the gyroid TPMS field, meshed with a
 *                  self-contained marching-tetrahedra iso-surfacer
 */

import * as THREE from "three";

export type SolidId = "building" | "bracket" | "gyroid";

export interface SolidMeta {
  id: SolidId;
  label: string;
  blurb: string;
  units: string;
  /** default cutting-plane orientation (spherical, degrees) */
  defaultAz: number;
  defaultPolar: number;
}

export interface SolidResult extends SolidMeta {
  geometry: THREE.BufferGeometry;
  /** bounding-sphere radius — drives camera framing */
  radius: number;
  /** axis-aligned bounds (centred geometry) — drives the offset slider range */
  bbox: { min: [number, number, number]; max: [number, number, number] };
}

/* ────────────────────────────────────────────────────────────────────────
   Triangle-soup helpers
   ──────────────────────────────────────────────────────────────────────── */

/** Expand any (indexed or not) geometry into a flat non-indexed positions
 *  array [ax,ay,az, bx,by,bz, cx,cy,cz, …] — one triangle every 9 floats.
 *  This is the input the section solver iterates over. */
export function toTriangleSoup(geo: THREE.BufferGeometry): Float32Array {
  const pos = geo.attributes.position;
  const idx = geo.index;
  if (idx) {
    const out = new Float32Array(idx.count * 3);
    for (let i = 0; i < idx.count; i++) {
      const v = idx.getX(i);
      out[i * 3] = pos.getX(v);
      out[i * 3 + 1] = pos.getY(v);
      out[i * 3 + 2] = pos.getZ(v);
    }
    return out;
  }
  return new Float32Array(pos.array as ArrayLike<number>);
}

/** Push the 12 triangles (36 verts) of an axis-aligned box into `arr`. */
function pushBox(
  arr: number[],
  cx: number,
  cy: number,
  cz: number,
  hx: number,
  hy: number,
  hz: number,
): void {
  const x0 = cx - hx,
    x1 = cx + hx,
    y0 = cy - hy,
    y1 = cy + hy,
    z0 = cz - hz,
    z1 = cz + hz;
  // 8 corners
  const p = [
    [x0, y0, z0],
    [x1, y0, z0],
    [x1, y1, z0],
    [x0, y1, z0],
    [x0, y0, z1],
    [x1, y0, z1],
    [x1, y1, z1],
    [x0, y1, z1],
  ];
  // 6 faces, each 2 tris (CCW outward)
  const faces = [
    [0, 3, 2, 0, 2, 1], // -z
    [4, 5, 6, 4, 6, 7], // +z
    [0, 4, 7, 0, 7, 3], // -x
    [1, 2, 6, 1, 6, 5], // +x
    [0, 1, 5, 0, 5, 4], // -y
    [3, 7, 6, 3, 6, 2], // +y
  ];
  for (const f of faces) {
    for (let k = 0; k < 6; k++) {
      const v = p[f[k]];
      arr.push(v[0], v[1], v[2]);
    }
  }
}

function finalize(positions: number[]): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3),
  );
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/* ────────────────────────────────────────────────────────────────────────
   (a) Stepped building massing
   ──────────────────────────────────────────────────────────────────────── */

function buildBuilding(): THREE.BufferGeometry {
  const arr: number[] = [];
  const floors = 8;
  const floorH = 0.26; // slab height
  const gap = 0.03; // reveal between slabs
  let y = -1.05;
  for (let f = 0; f < floors; f++) {
    const t = f / (floors - 1);
    // asymmetric taper + a couple of pronounced set-backs
    const setback = f === 3 ? 0.14 : f === 6 ? 0.12 : 0;
    const hx = 0.86 - t * 0.5 - setback;
    const hz = 0.62 - t * 0.34 - setback * 0.8;
    const hy = floorH / 2;
    // slight lateral shear so vertical cuts aren't a plain ziggurat
    const shift = f >= 6 ? 0.1 : 0;
    pushBox(arr, shift, y + hy, 0, hx, hy, hz);
    y += floorH + gap;
  }
  // rooftop plant + mast
  pushBox(arr, 0.1, y + 0.06, 0, 0.16, 0.06, 0.14);
  pushBox(arr, 0.1, y + 0.28, 0, 0.02, 0.16, 0.02);
  const geo = finalize(arr);
  geo.center(); // recentre so offset 0 sits mid-height
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

/* ────────────────────────────────────────────────────────────────────────
   (b) Mechanical bracket / plate with holes
   ──────────────────────────────────────────────────────────────────────── */

function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function buildBracket(): THREE.BufferGeometry {
  const w = 1.9;
  const h = 1.25;
  const shape = roundedRectShape(w, h, 0.18);

  // large central bore
  const bore = new THREE.Path();
  bore.absarc(0, 0, 0.3, 0, Math.PI * 2, true);
  shape.holes.push(bore);

  // four mounting holes near the corners
  const mx = w / 2 - 0.26;
  const my = h / 2 - 0.26;
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const hole = new THREE.Path();
    hole.absarc(sx * mx, sy * my, 0.11, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }

  // two extra lightening bores to keep sections lively along the scan axis
  for (const hx of [-0.62, 0.62]) {
    const p = new THREE.Path();
    p.absarc(hx, 0.0, 0.06, 0, Math.PI * 2, true);
    shape.holes.push(p);
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.55,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
    curveSegments: 24,
  });
  geo.center();
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/* ────────────────────────────────────────────────────────────────────────
   (c) Gyroid TPMS solid — marching tetrahedra iso-surfacer
   ──────────────────────────────────────────────────────────────────────── */

// 6-tetrahedra Freudenthal decomposition of the unit cube. Every cube uses the
// same main diagonal (corner 0 → corner 7), which keeps the mesh watertight
// across shared cube faces. Corner index → (i,j,k) offset:
const CORNER = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
];
const TETS = [
  [0, 1, 3, 7],
  [0, 3, 2, 7],
  [0, 2, 6, 7],
  [0, 6, 4, 7],
  [0, 4, 5, 7],
  [0, 5, 1, 7],
];

function buildGyroid(): THREE.BufferGeometry {
  const half = 1.12; // box half-extent
  const res = 36; // cells per axis (res+1 samples)
  const n1 = res + 1;
  const periods = 1.45; // gyroid periods across the box
  const a = (Math.PI * 2 * periods) / (2 * half);
  const iso = 0.0; // level set → ~50% volume fraction
  const BIG = 1e6;

  // sample field: value < 0 == inside the solid channel {g < iso}
  const val = new Float32Array(n1 * n1 * n1);
  const gx = new Float32Array(n1);
  for (let i = 0; i < n1; i++) gx[i] = -half + (2 * half * i) / res;
  const idx = (i: number, j: number, k: number) => (i * n1 + j) * n1 + k;
  for (let i = 0; i < n1; i++) {
    const x = gx[i];
    const border_i = i === 0 || i === res;
    for (let j = 0; j < n1; j++) {
      const y = gx[j];
      const border_j = j === 0 || j === res;
      for (let k = 0; k < n1; k++) {
        const z = gx[k];
        // guard ring → forced "outside" so the solid caps cleanly at the box
        if (border_i || border_j || k === 0 || k === res) {
          val[idx(i, j, k)] = BIG;
          continue;
        }
        const g =
          Math.sin(a * x) * Math.cos(a * y) +
          Math.sin(a * y) * Math.cos(a * z) +
          Math.sin(a * z) * Math.cos(a * x);
        val[idx(i, j, k)] = g - iso;
      }
    }
  }

  const out: number[] = [];
  const cp = [0, 0, 0]; // scratch
  const pos = (c: number, i: number, j: number, k: number) => {
    const o = CORNER[c];
    cp[0] = gx[i + o[0]];
    cp[1] = gx[j + o[1]];
    cp[2] = gx[k + o[2]];
    return cp;
  };
  const valAt = (c: number, i: number, j: number, k: number) => {
    const o = CORNER[c];
    return val[idx(i + o[0], j + o[1], k + o[2])];
  };

  // interpolate the crossing point on the edge between corners ca,cb
  const P = new Float32Array(3);
  const lerpEdge = (
    ca: number,
    cb: number,
    i: number,
    j: number,
    k: number,
    valA: number,
    valB: number,
    dst: number[],
  ) => {
    const oa = CORNER[ca];
    const ob = CORNER[cb];
    const ax = gx[i + oa[0]],
      ay = gx[j + oa[1]],
      az = gx[k + oa[2]];
    const bx = gx[i + ob[0]],
      by = gx[j + ob[1]],
      bz = gx[k + ob[2]];
    const t = valA / (valA - valB);
    dst[0] = ax + t * (bx - ax);
    dst[1] = ay + t * (by - ay);
    dst[2] = az + t * (bz - az);
  };

  const e0: number[] = [0, 0, 0];
  const e1: number[] = [0, 0, 0];
  const e2: number[] = [0, 0, 0];
  const e3: number[] = [0, 0, 0];

  for (let i = 0; i < res; i++) {
    for (let j = 0; j < res; j++) {
      for (let k = 0; k < res; k++) {
        for (let t = 0; t < 6; t++) {
          const tet = TETS[t];
          const v0 = valAt(tet[0], i, j, k);
          const v1 = valAt(tet[1], i, j, k);
          const v2 = valAt(tet[2], i, j, k);
          const v3 = valAt(tet[3], i, j, k);
          const in0 = v0 < 0,
            in1 = v1 < 0,
            in2 = v2 < 0,
            in3 = v3 < 0;
          const count = (in0 ? 1 : 0) + (in1 ? 1 : 0) + (in2 ? 1 : 0) + (in3 ? 1 : 0);
          if (count === 0 || count === 4) continue;

          const vv = [v0, v1, v2, v3];
          const ins = [in0, in1, in2, in3];
          const inside: number[] = [];
          const outside: number[] = [];
          for (let m = 0; m < 4; m++) (ins[m] ? inside : outside).push(m);

          if (count === 1 || count === 3) {
            // one inside vs three outside (or its complement) → single triangle
            const single = count === 1 ? inside[0] : outside[0];
            const others = count === 1 ? outside : inside;
            lerpEdge(tet[single], tet[others[0]], i, j, k, vv[single], vv[others[0]], e0);
            lerpEdge(tet[single], tet[others[1]], i, j, k, vv[single], vv[others[1]], e1);
            lerpEdge(tet[single], tet[others[2]], i, j, k, vv[single], vv[others[2]], e2);
            out.push(e0[0], e0[1], e0[2], e1[0], e1[1], e1[2], e2[0], e2[1], e2[2]);
          } else {
            // two inside, two outside → quad → two triangles
            const [a0, b0] = inside;
            const [c0, d0] = outside;
            lerpEdge(tet[a0], tet[c0], i, j, k, vv[a0], vv[c0], e0);
            lerpEdge(tet[a0], tet[d0], i, j, k, vv[a0], vv[d0], e1);
            lerpEdge(tet[b0], tet[d0], i, j, k, vv[b0], vv[d0], e2);
            lerpEdge(tet[b0], tet[c0], i, j, k, vv[b0], vv[c0], e3);
            // quad order e0,e1,e2,e3 walks around shared tet vertices → convex
            out.push(e0[0], e0[1], e0[2], e1[0], e1[1], e1[2], e2[0], e2[1], e2[2]);
            out.push(e0[0], e0[1], e0[2], e2[0], e2[1], e2[2], e3[0], e3[1], e3[2]);
          }
        }
      }
    }
  }
  return finalize(out);
}

/* ────────────────────────────────────────────────────────────────────────
   Registry
   ──────────────────────────────────────────────────────────────────────── */

export const SOLIDS: SolidMeta[] = [
  {
    id: "building",
    label: "Stepped massing",
    blurb: "Stacked, set-back floor slabs — an architectural massing study.",
    units: "m",
    defaultAz: 0,
    defaultPolar: 90, // vertical cut (normal = +X) → the stepped silhouette
  },
  {
    id: "bracket",
    label: "Machined bracket",
    blurb: "An extruded plate with a central bore, mounting holes, and reliefs.",
    units: "mm",
    defaultAz: 0,
    defaultPolar: 90, // cut scans across the extrusion (normal = +X)
  },
  {
    id: "gyroid",
    label: "Gyroid lattice",
    blurb: "A solid slice of the gyroid TPMS field — a minimal-surface lattice.",
    units: "mm",
    defaultAz: 90,
    defaultPolar: 90, // normal = +Z
  },
];

export function makeSolid(id: SolidId): SolidResult {
  let geometry: THREE.BufferGeometry;
  if (id === "building") geometry = buildBuilding();
  else if (id === "bracket") geometry = buildBracket();
  else geometry = buildGyroid();

  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
  const radius = geometry.boundingSphere ? geometry.boundingSphere.radius : 1.5;
  const bb = geometry.boundingBox;
  const bbox = bb
    ? {
        min: [bb.min.x, bb.min.y, bb.min.z] as [number, number, number],
        max: [bb.max.x, bb.max.y, bb.max.z] as [number, number, number],
      }
    : {
        min: [-radius, -radius, -radius] as [number, number, number],
        max: [radius, radius, radius] as [number, number, number],
      };
  const meta = SOLIDS.find((s) => s.id === id)!;
  return { ...meta, geometry, radius, bbox };
}
