// scripts/download_arch_images.mjs
//
// Round-9e: download all architecture-project images from the myportfolio
// CDN (referenced in src/content/projects/<arch>.md frontmatter) into
// public/assets/<slug>/, then rewrite the frontmatter to point at the
// local /assets paths. Browser was blocking the external URLs as broken
// images — local paths fix that.
//
// Idempotent: re-running skips already-downloaded files.

import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "src", "content", "projects");
const ASSETS_DIR = path.join(ROOT, "public", "assets");

const ARCH_SLUGS = [
  "uranium-scape",
  "salt-marsh-research-center",
  "urban-streamline",
  "urban-mining",
  "spatial-bending",
  "deform",
  "interlude",
  "sound-scape",
];

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

function parseFrontmatter(raw) {
  const m = raw.match(FRONTMATTER_RE);
  if (!m) return null;
  return { meta: yaml.load(m[1]), body: raw.slice(m[0].length) };
}

function filenameFromUrl(u) {
  // myportfolio URLs: .../<uuid>/<image-uuid>_rw_NNNN.jpg?h=hash
  // Take the path basename, strip query, decode URL.
  const parsed = new URL(u);
  const base = path.basename(parsed.pathname);
  return decodeURIComponent(base);
}

async function downloadOne(srcUrl, destPath) {
  // Skip if exists
  try {
    const st = await fs.stat(destPath);
    if (st.size > 0) return { skipped: true };
  } catch {
    /* not present, continue */
  }
  const res = await fetch(srcUrl, {
    headers: {
      // Some CDNs block requests without a UA / referer. myportfolio is
      // permissive but pass them anyway.
      "User-Agent":
        "Mozilla/5.0 (compatible; SiteBuild/1.0; +https://tianle-chen.com)",
      Referer: "https://tianle-chen.com/",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${srcUrl}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buf);
  return { bytes: buf.length };
}

async function processSlug(slug) {
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  const raw = await fs.readFile(mdPath, "utf-8");
  const parsed = parseFrontmatter(raw);
  if (!parsed) {
    console.warn(`! no frontmatter in ${slug}.md, skipping`);
    return;
  }
  const meta = parsed.meta;

  const slugDir = path.join(ASSETS_DIR, slug);
  await fs.mkdir(slugDir, { recursive: true });

  // Build URL list: hero_image first, then images[]; dedupe.
  const urls = [];
  const seen = new Set();
  if (typeof meta.hero_image === "string") {
    if (!seen.has(meta.hero_image)) {
      seen.add(meta.hero_image);
      urls.push(meta.hero_image);
    }
  }
  if (Array.isArray(meta.images)) {
    for (const im of meta.images) {
      if (typeof im === "string" && !seen.has(im)) {
        seen.add(im);
        urls.push(im);
      }
    }
  }

  // Download each external URL → local file. Build a map from URL → /assets path.
  const map = new Map();
  for (const u of urls) {
    if (!/^https?:\/\//i.test(u)) {
      // Already local — keep as-is
      map.set(u, u);
      continue;
    }
    const fname = filenameFromUrl(u);
    const destAbs = path.join(slugDir, fname);
    try {
      const r = await downloadOne(u, destAbs);
      const localWebPath = `/assets/${slug}/${fname}`;
      map.set(u, localWebPath);
      const tag = r.skipped ? "skip" : `${(r.bytes / 1024).toFixed(0)}KB`;
      console.log(`  ${slug}  ${tag}  ${fname}`);
    } catch (e) {
      console.error(`  ! ${slug}  FAIL  ${u}: ${e.message}`);
    }
  }

  // Rewrite frontmatter with local paths.
  const newMeta = { ...meta };
  if (typeof newMeta.hero_image === "string" && map.has(newMeta.hero_image)) {
    newMeta.hero_image = map.get(newMeta.hero_image);
  }
  if (Array.isArray(newMeta.images)) {
    newMeta.images = newMeta.images.map((im) =>
      typeof im === "string" && map.has(im) ? map.get(im) : im,
    );
  }

  const newFrontmatter = yaml.dump(newMeta, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  });
  const newRaw = `---\n${newFrontmatter}---${parsed.body}`;
  await fs.writeFile(mdPath, newRaw, "utf-8");
  console.log(`  ${slug}  ✓ rewrote frontmatter`);
}

async function main() {
  for (const slug of ARCH_SLUGS) {
    console.log(`[${slug}]`);
    await processSlug(slug);
  }
  console.log("[done]");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
