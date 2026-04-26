/**
 * detectWebGL.ts — feature detection for the latent-space hero.
 *
 * Returns true when the browser can give us at least a WebGL1 context.
 * We attempt WebGL2 first because the postprocessing pipeline benefits from it,
 * but fall back to WebGL1 since the sprite shader is GLES 2 compatible.
 */
export function detectWebGL(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext(
        "experimental-webgl",
      ) as WebGLRenderingContext | null);
    return !!gl;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isNarrowViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 640;
}
