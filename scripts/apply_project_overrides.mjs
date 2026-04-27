// scripts/apply_project_overrides.mjs
//
// Round-9l: patch each project entry in public/data/embeddings.json with
// `primary_category` and `semester_recency` from scripts/project_overrides.json.
//
// Why: the previous category logic keyword-matched the (noisy) categories[]
// array which was getting things wrong (CAD-MLLM tagged THESIS, etc.). The
// override file is the single source of truth — one explicit primary_category
// per project, and a coarse semester-grain timestamp for the year-ring
// opacity encoding on each dot's outer stroke.
//
// Idempotent: running it twice is fine. Embedding vectors are untouched.

import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EMB_PATH = path.join(ROOT, "public", "data", "embeddings.json");
const OVERRIDES_PATH = path.join(__dirname, "project_overrides.json");

const SEMESTER_OFFSET = {
  spring: 0.33,
  summer: 0.66,
  fall: 0.83,
};

function semesterRecency(year, semester) {
  if (typeof year !== "number") return null;
  const off = SEMESTER_OFFSET[String(semester ?? "").toLowerCase()] ?? 0.5;
  return year + off;
}

async function main() {
  const overrides = JSON.parse(await fs.readFile(OVERRIDES_PATH, "utf-8"));
  const emb = JSON.parse(await fs.readFile(EMB_PATH, "utf-8"));

  let touched = 0;
  let missing = [];
  for (const p of emb.projects) {
    const o = overrides[p.slug];
    if (!o) {
      missing.push(p.slug);
      continue;
    }
    p.primary_category = o.primary_category;
    p.semester = o.semester;
    p.semester_recency = semesterRecency(p.year, o.semester);
    touched++;
  }

  await fs.writeFile(EMB_PATH, JSON.stringify(emb, null, 2));
  console.log(`[overrides] patched ${touched} of ${emb.projects.length} projects`);
  if (missing.length) {
    console.warn(`[overrides] no override for: ${missing.join(", ")}`);
  }
  // Show resulting distribution
  const buckets = {};
  for (const p of emb.projects) {
    const k = p.primary_category ?? "unset";
    buckets[k] = (buckets[k] ?? 0) + 1;
  }
  console.log(`[overrides] category counts:`, buckets);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
