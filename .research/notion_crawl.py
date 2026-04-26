"""Notion crawl orchestrator (Phase 2).

Reads cached page texts from notion_page_texts/<slug>.txt (saved by Claude from
notion-fetch responses), extracts media URLs, downloads them, sorts to
public/assets/<slug>/, optionally enriches project MDs, optionally promotes
GIF heroes, downloads headshot, and writes notion-additions.json.

Run: python .research/notion_crawl.py
"""

from __future__ import annotations

import hashlib
import json
import mimetypes
import re
import shutil
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import unquote, urlparse

import requests
import frontmatter

# Make _embed_common importable for safe_open.
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from _embed_common import safe_open  # noqa: E402

RESEARCH_DIR = ROOT / ".research"
PAGE_TEXTS_DIR = RESEARCH_DIR / "notion_page_texts"
DOWNLOADS_DIR = RESEARCH_DIR / "notion-downloads"
ASSETS_DIR = ROOT / "public" / "assets"
PROJECTS_DIR = ROOT / "src" / "content" / "projects"
PUBLIC_DIR = ROOT / "public"
ADDITIONS_PATH = RESEARCH_DIR / "notion-additions.json"
PAGES_INDEX = RESEARCH_DIR / "notion_pages.json"

# Slug → list of Notion page IDs/URLs (for re-fetch reference) + cached text
SLUG_TO_PAGE = {
    "generative-urbanism": "16933d12-d95a-813d-846e-fbe36700cd75",
    "design-the-ambience": "16933d12-d95a-80f4-9375-c88692b3d308",
    "spectral-facades": "16a33d12-d95a-800e-8b5c-fb0632519488",
    "skill-bridge-datavis": "16a33d12-d95a-804f-89f2-cb345dac1b3d",
    "synthetic-texture-deterioration": "16933d12-d95a-81df-bb4a-d317fa136701",
    "a-game-of-deterioration": "16a33d12-d95a-8077-9ab7-f488cbc13f1f",
    "fiber-based-pavilion": "16933d12-d95a-81b8-af48-f62d152c3998",
    "wire-bending": "16933d12-d95a-818e-afda-d039f5f65990",
    "membrane-form-finding": "16933d12-d95a-81c1-acde-ef0748c37bc9",
}

# Hero filename heuristic — substrings indicating "non-artifact" content.
NON_ARTIFACT_HERO_PATTERNS = [
    "flow", "diagram", "schema", "arch_diag", "process_chart", "flowchart",
    "story_board", "icon",
]

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}
GIF_EXTS = {".gif"}
VIDEO_EXTS = {".mp4", ".mov", ".webm", ".m4v"}


# ---------------------------------------------------------------------------
# URL extraction
# ---------------------------------------------------------------------------

# Match ![alt](url) — capture group 1 = alt, 2 = url
INLINE_IMG_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
# Match <video src="url"> and <file src="...">
VIDEO_TAG_RE = re.compile(r"<video\s+src=\"([^\"]+)\"")
FILE_TAG_RE = re.compile(r"<file\s+src=\"([^\"]+)\"")


def extract_media_urls(text: str) -> List[Tuple[str, str]]:
    """Return list of (url, kind) pairs in document order. kind in {image,video,file}."""
    out: List[Tuple[str, str]] = []
    seen = set()

    # Walk text linearly, picking up patterns in order
    pos = 0
    pattern = re.compile(
        r"(!\[([^\]]*)\]\(([^)]+)\))|(<video\s+src=\"([^\"]+)\")|(<file\s+src=\"([^\"]+)\")",
        re.IGNORECASE,
    )
    for m in pattern.finditer(text):
        if m.group(1):  # inline image
            url = m.group(3)
            kind = "image"
        elif m.group(4):  # video tag
            url = m.group(5)
            kind = "video"
        else:
            url = m.group(7)
            kind = "file"
        if url in seen:
            continue
        seen.add(url)
        out.append((url, kind))
    return out


def is_downloadable_url(url: str) -> bool:
    if url.startswith("file://"):
        # Notion file://%7B... wrappers — skip; the inner JSON has the real URL,
        # but for our purposes (we already have most asset PDFs separately), skip.
        return False
    if "youtube.com" in url or "youtu.be" in url:
        return False
    if not (url.startswith("http://") or url.startswith("https://")):
        return False
    return True


def derive_filename(url: str, content_type: Optional[str] = None) -> str:
    parsed = urlparse(url)
    path = unquote(parsed.path)
    name = path.rsplit("/", 1)[-1] or "file"
    # Notion sometimes hands back generic names like "image.png" — keep as-is.
    # Add or correct extension based on content type if obvious mismatch.
    name_lower = name.lower()
    ext = Path(name_lower).suffix
    expected_ext = None
    if content_type:
        ct = content_type.split(";", 1)[0].strip().lower()
        ext_map = {
            "image/gif": ".gif",
            "image/png": ".png",
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/webp": ".webp",
            "video/mp4": ".mp4",
            "video/quicktime": ".mov",
            "video/webm": ".webm",
        }
        expected_ext = ext_map.get(ct)
    if expected_ext and ext != expected_ext:
        name = (name if ext else name) + expected_ext
    # Sanitize: strip query string remnants and odd chars
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    return name


def safe_filename(prefix: str, idx: int, base: str) -> str:
    base = base[:80]  # cap length
    return f"notion-{idx:03d}-{base}"


# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------

def download_file(url: str, out_path: Path, timeout: int = 60, max_size: int = 500 * 1024 * 1024) -> Optional[Tuple[Path, str, int]]:
    """Stream a URL to disk. Returns (path, content_type, bytes) or None on failure."""
    try:
        with requests.get(url, stream=True, timeout=timeout) as r:
            if r.status_code != 200:
                print(f"  [skip {r.status_code}] {url[:120]}")
                return None
            ct = r.headers.get("Content-Type", "")
            size = 0
            with out_path.open("wb") as f:
                for chunk in r.iter_content(chunk_size=64 * 1024):
                    if chunk:
                        f.write(chunk)
                        size += len(chunk)
                        if size > max_size:
                            print(f"  [too large >500MB] {url[:120]}")
                            f.close()
                            out_path.unlink(missing_ok=True)
                            return None
            return out_path, ct, size
    except Exception as e:
        print(f"  [err] {e} {url[:120]}")
        return None


def file_sha1_head(path: Path, head: int = 512 * 1024) -> str:
    h = hashlib.sha1()
    with path.open("rb") as f:
        h.update(f.read(head))
    return h.hexdigest()


def classify_file(path: Path, content_type: str) -> str:
    """Return 'gif' | 'image' | 'video' | 'pdf' | 'other'."""
    ext = path.suffix.lower()
    ct = (content_type or "").lower()
    if ext in GIF_EXTS or "image/gif" in ct:
        return "gif"
    if ext in IMAGE_EXTS or ct.startswith("image/"):
        return "image"
    if ext in VIDEO_EXTS or ct.startswith("video/"):
        return "video"
    if ext == ".pdf" or "pdf" in ct:
        return "pdf"
    return "other"


# ---------------------------------------------------------------------------
# Per-slug pipeline
# ---------------------------------------------------------------------------

def process_slug(slug: str, page_text: str, dry_run: bool = False) -> Dict:
    """Returns per-slug result dict for the manifest."""
    print(f"\n=== {slug} ===")
    urls = extract_media_urls(page_text)
    print(f"  {len(urls)} media URLs found")

    staging = DOWNLOADS_DIR / slug
    staging.mkdir(parents=True, exist_ok=True)

    asset_dir = ASSETS_DIR / slug
    asset_dir.mkdir(parents=True, exist_ok=True)

    # Track existing content hashes in asset_dir (head-based) to avoid dupes.
    existing_hashes = {}
    for p in asset_dir.iterdir():
        if p.is_file() and p.suffix.lower() in (IMAGE_EXTS | GIF_EXTS | VIDEO_EXTS):
            try:
                existing_hashes[file_sha1_head(p)] = p.name
            except Exception:
                pass

    new_files: List[Dict] = []
    new_gifs: List[str] = []
    skipped: List[str] = []
    seen_hashes = set(existing_hashes.keys())

    counter = 0
    for url, kind in urls:
        if not is_downloadable_url(url):
            skipped.append({"url": url[:120], "reason": "not-downloadable"})
            continue
        counter += 1
        tmp_name = derive_filename(url)
        tmp_path = staging / f"raw-{counter:03d}-{tmp_name}"
        result = download_file(url, tmp_path)
        if not result:
            continue
        path, ct, size = result

        # dedupe
        try:
            h = file_sha1_head(path)
        except Exception:
            h = None
        if h and h in seen_hashes:
            print(f"  [dup] {tmp_name}")
            path.unlink(missing_ok=True)
            continue
        if h:
            seen_hashes.add(h)

        cls = classify_file(path, ct)

        # adjust extension if content-type implied a different one
        ct_ext_map = {"image/gif": ".gif", "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "video/mp4": ".mp4"}
        ct_main = (ct or "").split(";", 1)[0].strip().lower()
        proper_ext = ct_ext_map.get(ct_main)
        if proper_ext and path.suffix.lower() != proper_ext:
            new_path = path.with_suffix(proper_ext)
            path.rename(new_path)
            path = new_path

        # decide destination
        if cls == "pdf":
            print(f"  [skip pdf] {path.name}")
            path.unlink(missing_ok=True)
            continue
        if cls == "video" and size > 50 * 1024 * 1024:
            print(f"  [skip video >50MB] {path.name} ({size/1e6:.1f}MB)")
            path.unlink(missing_ok=True)
            continue
        if cls == "other":
            print(f"  [skip other] {path.name} ct={ct}")
            path.unlink(missing_ok=True)
            continue

        # final filename in assets dir
        safe_base = re.sub(r"[^A-Za-z0-9._-]", "_", path.name.replace(f"raw-{counter:03d}-", ""))
        final_name = f"notion-{counter:03d}-{safe_base}"
        # Cap length
        if len(final_name) > 100:
            stem = Path(final_name).stem[:90]
            final_name = stem + Path(final_name).suffix
        dest = asset_dir / final_name

        # avoid overwriting an existing site asset with the same name
        if dest.exists():
            stem = dest.stem + "_n"
            dest = asset_dir / (stem + dest.suffix)

        if not dry_run:
            shutil.copy2(path, dest)
        path.unlink(missing_ok=True)

        rel_web = f"/assets/{slug}/{dest.name}"
        new_files.append({
            "url_origin": url[:200] + ("..." if len(url) > 200 else ""),
            "filename": dest.name,
            "web_path": rel_web,
            "type": cls,
            "size_bytes": size,
            "content_type": ct,
        })
        if cls == "gif":
            new_gifs.append(dest.name)
            print(f"  [GIF] {dest.name} ({size/1024:.0f}KB)")
        else:
            print(f"  [{cls}] {dest.name} ({size/1024:.0f}KB)")

    # Step 6: hero promotion if a "good" GIF was added
    hero_promoted = None
    md_path = PROJECTS_DIR / f"{slug}.md"
    if new_gifs and md_path.exists():
        try:
            post = frontmatter.load(md_path)
            current_hero = (post.metadata.get("hero_image") or "")
            current_is_gif = isinstance(current_hero, str) and current_hero.lower().endswith(".gif")
            if not current_is_gif:
                # find first new gif that's not flagged as a non-artifact
                candidate = None
                for gname in new_gifs:
                    lower = gname.lower()
                    if any(p in lower for p in NON_ARTIFACT_HERO_PATTERNS):
                        continue
                    candidate = gname
                    break
                if candidate:
                    new_path = f"/assets/{slug}/{candidate}"
                    if not dry_run:
                        post.metadata["hero_image"] = new_path
                        post.metadata["gif_hero"] = new_path
                        with md_path.open("wb") as f:
                            f.write(frontmatter.dumps(post).encode("utf-8"))
                    hero_promoted = {"new_hero": new_path, "previous_hero": current_hero}
                    print(f"  [hero promoted] -> {new_path}")
        except Exception as e:
            print(f"  [hero promote error] {e}")

    # cleanup staging
    try:
        shutil.rmtree(staging)
    except Exception:
        pass

    return {
        "page_id": SLUG_TO_PAGE.get(slug),
        "media_url_count": len(urls),
        "downloaded_count": len(new_files),
        "new_gif_count": len(new_gifs),
        "new_files": new_files,
        "new_gifs": new_gifs,
        "hero_promoted": hero_promoted,
    }


def download_headshot(page_text_root: Optional[str]) -> Dict:
    """Headshot from root page. The URL was captured in notion_pages.json but expires."""
    # Re-parse from root cached text if provided. Otherwise rely on URL passed in.
    info = json.loads(PAGES_INDEX.read_text(encoding="utf-8"))
    url = info.get("_root_headshot_url")
    if not url:
        return {"status": "no-url"}
    # Notion S3 URLs require signed query — the bare URL won't work.
    # We need to re-fetch root via Claude's MCP, but here we'll attempt and skip if 403.
    out_dir = DOWNLOADS_DIR / "_root"
    out_dir.mkdir(parents=True, exist_ok=True)
    tmp_path = out_dir / "headshot_raw.png"
    res = download_file(url, tmp_path)
    if not res:
        return {"status": "url-expired", "note": "headshot URL is signed S3; re-fetch root page for fresh URL"}
    path, ct, size = res
    # Resize and save as portrait
    try:
        img = safe_open(path)
        img.thumbnail((1024, 1024))
        is_jpg = ct and "jpeg" in ct.lower()
        ext = ".jpg" if is_jpg else ".png"
        out_path = PUBLIC_DIR / f"portrait{ext}"
        if ext == ".jpg":
            img.convert("RGB").save(out_path, format="JPEG", quality=92)
        else:
            img.save(out_path, format="PNG")
        path.unlink(missing_ok=True)
        try:
            shutil.rmtree(out_dir)
        except Exception:
            pass
        return {"status": "ok", "path": str(out_path.relative_to(ROOT)).replace("\\", "/"),
                "size_bytes": out_path.stat().st_size, "dimensions": img.size}
    except Exception as e:
        return {"status": "resize-failed", "error": str(e)}


def main():
    print(f"ROOT = {ROOT}")
    print(f"Page texts dir = {PAGE_TEXTS_DIR}")
    if not PAGE_TEXTS_DIR.exists():
        print("Missing notion_page_texts/. Aborting.")
        sys.exit(1)

    DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)

    additions = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "summary": {},
        "per_slug": {},
        "headshot": None,
        "unmapped_notion_pages": [],
        "notion_bio_text_for_reference": "",
    }

    info = json.loads(PAGES_INDEX.read_text(encoding="utf-8"))
    additions["unmapped_notion_pages"] = info.get("_unmapped_architecture", [])
    additions["notion_bio_text_for_reference"] = info.get("_root_bio", "")

    total_dl = 0
    total_gifs = 0
    total_imgs = 0
    total_videos = 0
    for slug, _pid in SLUG_TO_PAGE.items():
        text_file = PAGE_TEXTS_DIR / f"{slug}.txt"
        if not text_file.exists():
            print(f"[no text] {slug}")
            continue
        text = text_file.read_text(encoding="utf-8", errors="replace")
        result = process_slug(slug, text)
        additions["per_slug"][slug] = result
        total_dl += result["downloaded_count"]
        total_gifs += result["new_gif_count"]
        for f in result["new_files"]:
            if f["type"] == "image":
                total_imgs += 1
            elif f["type"] == "video":
                total_videos += 1

    additions["summary"] = {
        "total_files_downloaded": total_dl,
        "total_new_gifs": total_gifs,
        "total_new_images": total_imgs,
        "total_new_videos": total_videos,
        "slugs_processed": list(SLUG_TO_PAGE.keys()),
    }

    print("\n--- HEADSHOT ---")
    additions["headshot"] = download_headshot(None)
    print(additions["headshot"])

    ADDITIONS_PATH.write_text(json.dumps(additions, indent=2), encoding="utf-8")
    print(f"\nWrote {ADDITIONS_PATH}")
    print(f"Total: {total_dl} files ({total_gifs} GIFs, {total_imgs} images, {total_videos} videos)")


if __name__ == "__main__":
    main()
