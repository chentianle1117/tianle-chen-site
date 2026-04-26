// sprite.frag.glsl — atlas sample with rounded-corner SDF mask.

uniform sampler2D uAtlas;
varying vec2 vAtlasUv;
varying vec2 vQuadUv;

void main() {
  vec4 c = texture2D(uAtlas, vAtlasUv);
  // Soft rounded-corner mask via SDF on the unit quad uv.
  vec2 d = abs(vQuadUv - 0.5) - 0.42;
  float corner = length(max(d, 0.0));
  float mask = 1.0 - smoothstep(0.04, 0.08, corner);
  if (mask < 0.01) discard;
  vec3 rgb = c.rgb;
  // Subtle inner border (oxide-tinted) so all sprites read as framed cards.
  vec2 borderD = abs(vQuadUv - 0.5) - 0.495;
  float borderDist = max(borderD.x, borderD.y);
  float borderMask = 1.0 - smoothstep(0.0, 0.005, borderDist);
  rgb = mix(rgb, vec3(0.95, 0.55, 0.35), borderMask * 0.10);
  gl_FragColor = vec4(rgb, c.a * mask);
}
