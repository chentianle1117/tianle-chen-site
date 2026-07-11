/**
 * colormap.ts — a compact Turbo-style ramp for rendering depth maps.
 *
 * Turbo (Google, 2019) is a perceptually-improved rainbow: it reads as an
 * ordered near→far scale without the banding artefacts of jet. We interpolate
 * a handful of control stops into a 256-entry lookup table once, then index it
 * per pixel. Warmer = nearer (higher depth value), cooler = farther.
 */

type Stop = [number, number, number, number]; // t, r, g, b

const STOPS: Stop[] = [
  [0.0, 48, 18, 59],
  [0.125, 65, 69, 171],
  [0.25, 57, 118, 211],
  [0.375, 42, 160, 200],
  [0.5, 63, 189, 135],
  [0.625, 143, 199, 63],
  [0.75, 219, 179, 47],
  [0.875, 244, 116, 32],
  [1.0, 169, 33, 19],
];

function buildLUT(): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    // find bracketing stops
    let a = STOPS[0];
    let b = STOPS[STOPS.length - 1];
    for (let s = 0; s < STOPS.length - 1; s++) {
      if (t >= STOPS[s][0] && t <= STOPS[s + 1][0]) {
        a = STOPS[s];
        b = STOPS[s + 1];
        break;
      }
    }
    const span = b[0] - a[0] || 1;
    const f = (t - a[0]) / span;
    lut[i * 3 + 0] = a[1] + (b[1] - a[1]) * f;
    lut[i * 3 + 1] = a[2] + (b[2] - a[2]) * f;
    lut[i * 3 + 2] = a[3] + (b[3] - a[3]) * f;
  }
  return lut;
}

const LUT = buildLUT();

/** Map a 0–255 grayscale value to an [r,g,b] triple. */
export function turbo(v: number): [number, number, number] {
  const i = (v < 0 ? 0 : v > 255 ? 255 : v | 0) * 3;
  return [LUT[i], LUT[i + 1], LUT[i + 2]];
}

/**
 * Render a single-channel grayscale buffer to an RGBA ImageData through the
 * Turbo LUT. `gray` is length width*height*channels; we sample channel 0.
 */
export function depthToImageData(
  gray: Uint8Array | Uint8ClampedArray | number[],
  width: number,
  height: number,
  channels: number
): ImageData {
  const out = new ImageData(width, height);
  const px = out.data;
  const n = width * height;
  for (let i = 0; i < n; i++) {
    const g = gray[i * channels] as number;
    const c = g * 3;
    px[i * 4 + 0] = LUT[c];
    px[i * 4 + 1] = LUT[c + 1];
    px[i * 4 + 2] = LUT[c + 2];
    px[i * 4 + 3] = 255;
  }
  return out;
}
