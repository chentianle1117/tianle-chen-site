// sprite.vert.glsl — instanced billboarded quad for the project cloud.
//
// Layout swap: each instance lerps from iPositionA -> iPositionB as uMix goes 0->1,
// with a small per-instance temporal offset (iStagger) so they don't all move in lockstep.
// The xy of `position` (the unit quad) is added in view space so quads always face camera.

attribute vec3 iPositionA;
attribute vec3 iPositionB;
attribute vec2 iUvOffset;
attribute vec2 iUvScale;
attribute float iStagger;
attribute float iScale;

uniform float uMix;

varying vec2 vAtlasUv;
varying vec2 vQuadUv;

float smoothMix(float t) {
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  float tLocal = clamp(uMix + iStagger, 0.0, 1.0);
  vec3 center = mix(iPositionA, iPositionB, smoothMix(tLocal));
  vec4 mv = modelViewMatrix * vec4(center, 1.0);
  mv.xy += position.xy * 0.12 * iScale;
  gl_Position = projectionMatrix * mv;
  vAtlasUv = iUvOffset + (uv * iUvScale);
  vQuadUv = uv;
}
