// scripts/download_arch_images_v2.mjs
//
// Round-9f: download all architecture-project images from the myportfolio
// CDN using URLs (with `?h=<token>` auth) recovered from Notion via the MCP
// fetch tool. URLs live in scripts/arch_image_manifest.json. The previous
// download attempt (v1) stripped the tokens because the .md frontmatter we
// wrote didn't include them — every request 400'd. This version reads from
// the manifest, downloads to public/assets/<slug>/, and rewrites the 8 .md
// frontmatter blocks to point at the local /assets paths.

import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "src", "content", "projects");
const ASSETS_DIR = path.join(ROOT, "public", "assets");
const MANIFEST_PATH = path.join(__dirname, "arch_image_manifest.json");

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

function parseFrontmatter(raw) {
  const m = raw.match(FRONTMATTER_RE);
  if (!m) return null;
  return { meta: yaml.load(m[1]), body: raw.slice(m[0].length) };
}

function filenameFromUrl(u) {
  const parsed = new URL(u);
  const base = path.basename(parsed.pathname);
  return decodeURIComponent(base);
}

async function downloadOne(srcUrl, destPath) {
  try {
    const st = await fs.stat(destPath);
    if (st.size > 0) return { skipped: true };
  } catch {
    /* not present */
  }
  const res = await fetch(srcUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buf);
  return { bytes: buf.length };
}

async function processSlug(slug, urls) {
  const slugDir = path.join(ASSETS_DIR, slug);
  await fs.mkdir(slugDir, { recursive: true });

  const localPaths = [];
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const u of urls) {
    const fname = filenameFromUrl(u);
    const destAbs = path.join(slugDir, fname);
    try {
      const r = await downloadOne(u, destAbs);
      const localWebPath = `/assets/${slug}/${fname}`;
      localPaths.push(localWebPath);
      if (r.skipped) {
        skipped++;
      } else {
        downloaded++;
        console.log(`  ${slug}/${fname}  ${(r.bytes / 1024).toFixed(0)}KB`);
      }
    } catch (e) {
      failed++;
      console.error(`  ! ${slug}/${fname}  ${e.message}`);
    }
  }

  // Rewrite the .md frontmatter only if at least the hero downloaded.
  if (localPaths.length === 0) {
    console.warn(`  ! ${slug}: no images downloaded, leaving .md untouched`);
    return { downloaded, skipped, failed };
  }

  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  const raw = await fs.readFile(mdPath, "utf-8");
  const parsed = parseFrontmatter(raw);
  if (!parsed) {
    console.warn(`  ! ${slug}: no frontmatter`);
    return { downloaded, skipped, failed };
  }
  const newMeta = { ...parsed.meta };
  newMeta.hero_image = localPaths[0];
  newMeta.images = localPaths;
  const newFrontmatter = yaml.dump(newMeta, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  });
  const newRaw = `---\n${newFrontmatter}---${parsed.body}`;
  await fs.writeFile(mdPath, newRaw, "utf-8");
  console.log(
    `  ${slug}  rewrote frontmatter (hero + ${localPaths.length} images)`,
  );

  return { downloaded, skipped, failed };
}

async function main() {
  const manifestRaw = await fs.readFile(MANIFEST_PATH, "utf-8");
  const manifest = JSON.parse(manifestRaw);
  let totalDl = 0,
    totalSkip = 0,
    totalFail = 0;
  for (const [slug, urls] of Object.entries(manifest)) {
    console.log(`[${slug}]  ${urls.length} URLs`);
    const r = await processSlug(slug, urls);
    totalDl += r.downloaded;
    totalSkip += r.skipped;
    totalFail += r.failed;
  }
  console.log(
    `\n[done]  downloaded:${totalDl}  skipped:${totalSkip}  failed:${totalFail}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
