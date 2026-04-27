// scripts/build_project_media.mjs
//
// Round-9: write public/data/project_media.json — a small map keyed by slug
// with the project's hero_image, gif_hero, and images[] array. The hero
// HoverCard reads this so it can render multiple full-resolution previews
// per project (the atlas only carries one square slice per project).
//
// Only emits paths that resolve to files in public/. Strips entries with
// publish:false to mirror the Astro content collection filter.

import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "src", "content", "projects");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT = path.join(PUBLIC_DIR, "data", "project_media.json");

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

function parseFrontmatter(raw) {
  const m = raw.match(FRONTMATTER_RE);
  if (!m) return null;
  try {
    return yaml.load(m[1]);
  } catch (e) {
    return null;
  }
}

async function fileExistsInPublic(webPath) {
  if (typeof webPath !== "string") return false;
  // External URLs (Notion CDN etc.) — accept as-is; the browser fetches them.
  if (/^https?:\/\//i.test(webPath)) return true;
  if (!webPath.startsWith("/")) return false;
  const fs_path = path.join(PUBLIC_DIR, webPath);
  try {
    await fs.access(fs_path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const out = {};
  const entries = await fs.readdir(CONTENT_DIR);
  for (const fname of entries.sort()) {
    if (!fname.endsWith(".md")) continue;
    const fp = path.join(CONTENT_DIR, fname);
    const raw = await fs.readFile(fp, "utf-8");
    const meta = parseFrontmatter(raw);
    if (!meta) {
      console.warn(`! could not parse frontmatter for ${fname}`);
      continue;
    }
    if (meta.publish === false) continue;
    const slug = meta.slug || fname.replace(/\.md$/, "");

    const candidates = [];
    if (typeof meta.hero_image === "string") candidates.push(meta.hero_image);
    if (typeof meta.gif_hero === "string") candidates.push(meta.gif_hero);
    if (Array.isArray(meta.images)) {
      for (const im of meta.images) {
        if (typeof im === "string") candidates.push(im);
      }
    }

    // Verify each, dedupe, drop videos (we want still images for the card).
    const seen = new Set();
    const filtered = [];
    for (const c of candidates) {
      if (seen.has(c)) continue;
      seen.add(c);
      // Strip query string before checking extension (Notion CDN URLs often
      // have ?h=hash or ?X-Amz-...).
      const cleanPath = c.split("?")[0];
      const ext = path.extname(cleanPath).toLowerCase();
      if ([".mp4", ".webm", ".mov", ".m4v"].includes(ext)) continue;
      if (![".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)) continue;
      if (!(await fileExistsInPublic(c))) continue;
      filtered.push(c);
    }

    out[slug] = {
      hero_image: filtered[0] ?? null,
      images: filtered,
    };
    console.log(`  ${slug}  ${filtered.length} image(s)`);
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out));
  console.log(`[project_media] wrote ${OUT}  (${Object.keys(out).length} projects)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
