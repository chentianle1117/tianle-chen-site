/**
 * projectThesis.ts — dot-product projection from CLIP space onto user-chosen axes.
 *
 * Given N embeddings of dimension D and three direction vectors of dim D,
 * returns N triples of scalars. The caller is responsible for
 * normalizing the result into [-1, 1]^3 (see normalizeLayoutInPlace).
 */

export type ProjectedCoords = [number, number, number];

function dot(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `projectThesis: dim mismatch (a=${a.length}, b=${b.length})`,
    );
  }
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/**
 * Project N embeddings onto 3 direction vectors via dot product.
 *
 * @param embeddings  shape [N, dim]
 * @param directions  3 vectors of length dim, expected pre-normalized.
 *                    If a direction is not unit-length we use it as-is —
 *                    the caller-side normalization step rescales output anyway.
 */
export function projectThesis(
  embeddings: number[][],
  directions: [number[], number[], number[]],
): ProjectedCoords[] {
  const out: ProjectedCoords[] = new Array(embeddings.length);
  for (let i = 0; i < embeddings.length; i++) {
    const e = embeddings[i];
    out[i] = [
      dot(e, directions[0]),
      dot(e, directions[1]),
      dot(e, directions[2]),
    ];
  }
  return out;
}

/**
 * Convenience: project + normalize into [-1, 1]^3, returning a {slug -> coord} record.
 */
export function projectThesisToLayout(
  rows: { slug: string; embedding: number[] }[],
  directions: [number[], number[], number[]],
): Record<string, ProjectedCoords> {
  if (rows.length === 0) return {};
  const raw = projectThesis(
    rows.map((r) => r.embedding),
    directions,
  );

  const mins: [number, number, number] = [Infinity, Infinity, Infinity];
  const maxs: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const p of raw) {
    for (let i = 0; i < 3; i++) {
      if (p[i] < mins[i]) mins[i] = p[i];
      if (p[i] > maxs[i]) maxs[i] = p[i];
    }
  }

  const out: Record<string, ProjectedCoords> = {};
  for (let i = 0; i < rows.length; i++) {
    const p = raw[i];
    out[rows[i].slug] = [
      ((p[0] - mins[0]) / (maxs[0] - mins[0] || 1)) * 2 - 1,
      ((p[1] - mins[1]) / (maxs[1] - mins[1] || 1)) * 2 - 1,
      ((p[2] - mins[2]) / (maxs[2] - mins[2] || 1)) * 2 - 1,
    ];
  }
  return out;
}
