import type { CollectionEntry } from "astro:content";

type Project = CollectionEntry<"projects">;

// Score = number of overlapping categories. Tiebreak by year proximity
// to the source project, then by year desc.
export function findRelated(
  slug: string,
  all: Project[],
  n = 3
): Project[] {
  const me = all.find((p) => ((p as any).slug ?? p.data.slug) === slug);
  // (resolved using entry.slug-or-data.slug fallback)
  if (!me) return [];
  const myCats = new Set((me.data.categories ?? []).map((c) => c.toLowerCase()));
  const myYear = me.data.year ?? 0;

  const scored = all
    .filter((p) => ((p as any).slug ?? p.data.slug) !== slug)
    .map((p) => {
      const cats = (p.data.categories ?? []).map((c) => c.toLowerCase());
      const overlap = cats.filter((c) => myCats.has(c)).length;
      const yearDist = Math.abs((p.data.year ?? 0) - myYear);
      return { p, overlap, yearDist };
    })
    .filter((s) => s.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      if (a.yearDist !== b.yearDist) return a.yearDist - b.yearDist;
      return (b.p.data.year ?? 0) - (a.p.data.year ?? 0);
    });

  return scored.slice(0, n).map((s) => s.p);
}

export function resolveBySlugs(slugs: string[], all: Project[]): Project[] {
  const out: Project[] = [];
  for (const raw of slugs) {
    // Strip wiki-link wrappers and date prefixes if present
    const cleaned = raw
      .replace(/^\[\[/, "")
      .replace(/\]\]$/, "")
      .replace(/\|.*$/, "")
      .trim();
    const found = all.find(
      (p) =>
        ((p as any).slug ?? p.data.slug) === cleaned ||
        cleaned.endsWith(((p as any).slug ?? p.data.slug)) ||
        cleaned.includes(((p as any).slug ?? p.data.slug))
    );
    if (found && !out.find((o) => o.data.slug === found.data.slug)) {
      out.push(found);
    }
  }
  return out;
}
