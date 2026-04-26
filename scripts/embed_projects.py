"""Embed each project (image + text) and write public/data/embeddings.json.

Default backend: open-clip ViT-L-14 (offline).
Opt-in: Jina CLIP v2 API when JINA_API_KEY env var is set.

Usage:
    python scripts/embed_projects.py            # cached
    python scripts/embed_projects.py --force    # rebuild
"""

from __future__ import annotations

import argparse
import json
import sys
import traceback
from pathlib import Path
from typing import List

import frontmatter
import numpy as np
from PIL import Image

# Defensive PIL caps — set BEFORE any image opens. Module-load order matters
# in Python; redundant with _embed_common but cheap and explicit.
Image.MAX_IMAGE_PIXELS = 300_000_000

# Local helpers
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _embed_common import (  # noqa: E402
    ASSETS_DIR,
    CONTENT_DIR,
    DATA_DIR,
    IMAGE_EXTS,
    embed_images,
    embed_texts,
    find_hero_image,
    jina_available,
    jina_embed,
    load_clip_model,
    make_placeholder,
    normalize,
    resolve_web_path_to_fs,
    safe_open,
)


VIDEO_EXTS = {".mp4", ".webm", ".mov", ".m4v"}


def _load_project_files() -> List[dict]:
    """Read all .md files under content/projects/. Sort deterministically.

    Filters out cards with `publish: false` so the data pipeline mirrors the
    Astro content collection filter and unpublished projects don't leak into
    embeddings.json / atlas.png.
    """
    out: List[dict] = []
    for md_path in sorted(CONTENT_DIR.glob("*.md")):
        try:
            post = frontmatter.load(md_path)
        except Exception as e:
            print(f"  ! could not parse {md_path.name}: {e}")
            continue
        meta = dict(post.metadata)
        # Honor `publish: false` — same filter the Astro getCollection() uses.
        if meta.get("publish", True) is False:
            print(f"  - skip (publish:false) {md_path.name}")
            continue
        body = post.content or ""
        slug = meta.get("slug") or md_path.stem
        out.append({
            "path": md_path,
            "slug": slug,
            "title": meta.get("title", slug),
            "year": meta.get("year"),
            "categories": meta.get("categories") or [],
            "priority": meta.get("priority", "standard"),
            "meta": meta,
            "body": body,
        })

    # Sort: year DESC, title ASC. None years sink to the bottom.
    def sort_key(p: dict):
        y = p["year"] if isinstance(p["year"], int) else -10_000
        return (-y, str(p["title"]).lower())

    out.sort(key=sort_key)
    return out


def _resolve_hero_path(project: dict) -> tuple[Path | None, str]:
    """Resolve the on-disk path to embed.

    Strategy:
      1. frontmatter.hero_image — if it points to a video, skip to step 2.
      2. frontmatter.gif_hero (still useful as a static first-frame poster).
      3. find_hero_image() (frontmatter.hero_image if image, else images[0],
         else asset-dir scan).

    Returns (Path or None, reason-tag). The reason-tag is logged.
    """
    meta = project["meta"]
    slug = project["slug"]

    hero = meta.get("hero_image")
    if isinstance(hero, str):
        fs = resolve_web_path_to_fs(hero)
        if fs is not None and fs.suffix.lower() in VIDEO_EXTS:
            # Video hero — fall through to gif_hero / images[0]
            gif = meta.get("gif_hero")
            if isinstance(gif, str):
                gfs = resolve_web_path_to_fs(gif)
                if gfs is not None and gfs.exists() and gfs.suffix.lower() in IMAGE_EXTS:
                    return gfs, "video-hero->gif_hero"
            # Else fall through to find_hero_image (which scans images[] / asset dir)
            scan = find_hero_image(slug, {**meta, "hero_image": None})
            return scan, "video-hero->scan"

    fs = find_hero_image(slug, meta)
    if fs is None:
        return None, "no-hero"
    return fs, "ok"


def _hero_for(project: dict, placeholder_size: int = 256) -> tuple[Image.Image, bool]:
    """Return (PIL.Image, is_placeholder). Always succeeds."""
    fs, reason = _resolve_hero_path(project)
    if fs is not None and fs.exists():
        try:
            img = safe_open(fs)
            # Animated GIF — pin to first frame for embedding/atlas thumbnail.
            if fs.suffix.lower() == ".gif":
                try:
                    img.seek(0)
                except Exception:
                    pass
            return img.convert("RGB"), False
        except Exception as e:
            print(f"  ! could not open hero {fs}: {e}; using placeholder")
    else:
        if reason != "ok":
            print(f"  ! missing-hero anomaly slug={project['slug']} reason={reason}")
    return make_placeholder(project["slug"], project["title"], size=placeholder_size), True


def _text_blob(project: dict) -> str:
    """Round-7: prefer the hand-written `summary:` frontmatter field over the
    body text. The image-weighted embedding (0.7 image + 0.3 body) was producing
    inaccurate latent placements because sprite/poster pixels and rambling body
    prose don't capture conceptual content. A 280-char author-curated summary
    is dense, on-message, and produces meaningful axis projections."""
    title = project["title"] or project["slug"]
    summary = project["meta"].get("summary")
    if isinstance(summary, str) and summary.strip():
        # Title is already in the summary's information field; embed both for
        # robustness (model gets a small prior from the title).
        return f"{title}. {summary.strip()}"
    # Fallback: body excerpt for projects without a summary yet.
    body = project["body"] or ""
    return f"{title}\n\n{body[:1500]}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="rebuild even if output exists")
    ap.add_argument("--backend", choices=["auto", "open-clip", "jina"], default="auto")
    args = ap.parse_args()

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path = DATA_DIR / "embeddings.json"

    if out_path.exists() and not args.force:
        print(f"[embed] cache hit at {out_path} — pass --force to rebuild")
        return 0

    projects = _load_project_files()
    print(f"[embed] loaded {len(projects)} project files")
    for p in projects:
        print(f"   - {p['slug']:42s} ({p['year']})  prio={p['priority']}")

    # Decide backend
    backend = args.backend
    if backend == "auto":
        backend = "jina" if jina_available() else "open-clip"
    print(f"[embed] backend: {backend}")

    # Resolve images and text blobs first (so we can fail fast).
    heroes: List[Image.Image] = []
    placeholder_flags: List[bool] = []
    for p in projects:
        try:
            img, is_ph = _hero_for(p)
        except Exception as e:
            print(f"  ! hero fail for {p['slug']}: {e}")
            img = make_placeholder(p["slug"], p["title"])
            is_ph = True
        heroes.append(img)
        placeholder_flags.append(is_ph)
        marker = "[placeholder]" if is_ph else ""
        print(f"   hero  {p['slug']:42s} {marker}")

    texts = [_text_blob(p) for p in projects]

    # Embed
    if backend == "jina":
        try:
            text_emb, image_emb = jina_embed(texts, heroes)
            model_name = "jina-clip-v2"
            dim = int(text_emb.shape[1])
        except Exception as e:
            print(f"[embed] Jina backend failed: {e}\n[embed] falling back to open-clip")
            backend = "open-clip"

    if backend == "open-clip":
        clip = load_clip_model()
        print(f"[embed] open-clip loaded on {clip['device']}, dim={clip['dim']}")
        text_emb = embed_texts(clip, texts)
        # Embed images one at a time to print progress.
        image_emb_list = []
        for i, p in enumerate(projects):
            try:
                e = embed_images(clip, [heroes[i]])[0]
            except Exception as ex:
                print(f"  ! image embed fail for {p['slug']}: {ex}; using zero vec")
                e = np.zeros(clip["dim"], dtype=np.float32)
            image_emb_list.append(e)
            print(f"   embed {p['slug']:42s} ok")
        image_emb = np.stack(image_emb_list, axis=0)
        model_name = clip["name"]
        dim = clip["dim"]

    text_emb = normalize(text_emb)
    image_emb = normalize(image_emb)

    # Round-7: text-dominant blend (was 0.7 image + 0.3 text). Reasoning:
    # CLIP image embeddings of project hero thumbnails (sprites, posters,
    # rendered UI screenshots) reflect VISUAL similarity, not conceptual
    # similarity. A pixelated game sprite reads as "play" to CLIP regardless
    # of whether the project IS research about deterioration models. Per-axis
    # placements were misleading. We now embed each project's hand-written
    # summary (frontmatter `summary:` field, ~280 chars) and use that as the
    # primary signal. Image gets a small residual weight so visually-distinct
    # projects don't pile up at identical text-space coordinates.
    combined = 0.10 * image_emb + 0.90 * text_emb
    combined = normalize(combined)

    payload = {
        "model": model_name,
        "dim": int(dim),
        "count": len(projects),
        "projects": [],
    }
    for i, p in enumerate(projects):
        meta = p["meta"] or {}
        summary_str = meta.get("summary")
        payload["projects"].append({
            "slug": p["slug"],
            "title": p["title"],
            "year": p["year"],
            "categories": p["categories"],
            "priority": p["priority"],
            "placeholder": bool(placeholder_flags[i]),
            # Round-7: ship the summary into embeddings.json so the hero side
            # panel can render it without a second fetch.
            "summary": summary_str if isinstance(summary_str, str) else None,
            "embedding": combined[i].astype(float).tolist(),
            "image_embedding": image_emb[i].astype(float).tolist(),
            "text_embedding": text_emb[i].astype(float).tolist(),
        })

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, separators=(",", ":"))

    size_kb = out_path.stat().st_size / 1024
    print(f"[embed] wrote {out_path}  ({size_kb:.1f} KB, {len(projects)} entries, dim={dim})")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        traceback.print_exc()
        sys.exit(1)
