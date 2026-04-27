/**
 * projectCounts.ts — single source of truth for site counts.
 *
 * Round-3 Item 7: home, /work, /architecture, /dashboard previously disagreed
 * (06 OF 11 vs 12 PROJECTS vs 15 PROJECTS). This helper computes counts once
 * from the published collection and a single architecture-tier set.
 */
import { getCollection } from "astro:content";

// Round-9d: 8 architecture studio projects from Rice (2021-2024), migrated
// from the Notion portfolio vault. Computational-design pieces (fiber
// pavilion, membrane form-finding, generative urbanism, wire bending) live
// in WORK now — they are computational design, not built architecture.
export const ARCHITECTURE_SLUGS = new Set<string>([
  "uranium-scape",
  "salt-marsh-research-center",
  "urban-streamline",
  "urban-mining",
  "spatial-bending",
  "deform",
  "interlude",
  "sound-scape",
]);

function slugFor(p: any): string {
  return (p as any).slug ?? p.data?.slug ?? "";
}

function isArchitecture(p: any): boolean {
  return ARCHITECTURE_SLUGS.has(slugFor(p));
}

export async function getProjectCounts() {
  const all = await getCollection("projects", ({ data }: { data: any }) => data.publish === true);
  const arch = all.filter(isArchitecture);
  const work = all.filter((p) => !isArchitecture(p));

  const years = all
    .map((p: any) => p.data?.year)
    .filter((y: unknown): y is number => typeof y === "number");
  const archYears = arch
    .map((p: any) => p.data?.year)
    .filter((y: unknown): y is number => typeof y === "number");
  const workYears = work
    .map((p: any) => p.data?.year)
    .filter((y: unknown): y is number => typeof y === "number");

  const yearMin = years.length ? Math.min(...years) : 2022;
  const yearMax = years.length ? Math.max(...years) : 2026;

  return {
    all,
    arch,
    work,
    counts: {
      all: all.length,
      arch: arch.length,
      work: work.length,
    },
    years: {
      all: { min: yearMin, max: yearMax },
      arch: archYears.length
        ? { min: Math.min(...archYears), max: Math.max(...archYears) }
        : { min: 2021, max: 2024 },
      work: workYears.length
        ? { min: Math.min(...workYears), max: Math.max(...workYears) }
        : { min: 2024, max: 2026 },
    },
  };
}
