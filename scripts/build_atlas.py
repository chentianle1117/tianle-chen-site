"""Build the 4096x4096 sprite atlas, write public/data/atlas.png.

Also writes thumbnail_uv [u, v, w, h] into each project entry of
public/data/embeddings.json (GL convention: origin bottom-left).

Layout: 4x4 grid of 1024x1024 thumbnails. 16 cells total.
Project order matches embeddings.json (year DESC, title ASC).
"""

from __future__ import annotations

import json
import math
import sys
import traceback
from pathlib import Path

from PIL import Image

# Defensive PIL caps — set BEFORE any image opens.
Image.MAX_IMAGE_PIXELS = 300_000_000

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _embed_common import (  # noqa: E402
    DATA_DIR,
    IMAGE_EXTS,
    find_hero_image,
    make_placeholder,
    resolve_web_path_to_fs,
    safe_open,
)
import frontmatter  # noqa: E402
from _embed_common import CONTENT_DIR  # noqa: E402

VIDEO_EXTS = {".mp4", ".webm", ".mov", ".m4v"}

ATLAS_SIZE = 4096
GRID = 4
CELL = ATLAS_SIZE // GRID  # 1024
TOTAL_CELLS = GRID * GRID  # 16


def _load_project_meta(slug: str) -> dict:
    """Re-load .md frontmatter for hero discovery."""
    md = CONTENT_DIR / f"{slug}.md"
    if not md.exists():
        return {}
    try:
        return dict(frontmatter.load(md).metadata)
    except Exception:
        return {}


def _resolve_hero_path(slug: str, meta: dict):
    """Mirror embed_projects logic: hero_image → gif_hero (if video) → scan."""
    hero = meta.get("hero_image")
    if isinstance(hero, str):
        fs = resolve_web_path_to_fs(hero)
        if fs is not None and fs.suffix.lower() in VIDEO_EXTS:
            gif = meta.get("gif_hero")
            if isinstance(gif, str):
                gfs = resolve_web_path_to_fs(gif)
                if gfs is not None and gfs.exists() and gfs.suffix.lower() in IMAGE_EXTS:
                    return gfs
            return find_hero_image(slug, {**meta, "hero_image": None})
    return find_hero_image(slug, meta)


def _hero_for(slug: str, title: str) -> Image.Image:
    meta = _load_project_meta(slug)
    fs = _resolve_hero_path(slug, meta)
    if fs is not None and fs.exists():
        try:
            img = safe_open(fs)
            if fs.suffix.lower() == ".gif":
                try:
                    img.seek(0)
                except Exception:
                    pass
            return img.convert("RGB")
        except Exception as e:
            print(f"  ! open fail {fs}: {e}; placeholder")
    else:
        print(f"  ! missing-hero anomaly slug={slug}; placeholder")
    return make_placeholder(slug, title, size=CELL).convert("RGB")


def _fit_square(img: Image.Image, size: int) -> Image.Image:
    """Center-crop to square then resize Lanczos to (size, size)."""
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    return img.resize((size, size), Image.LANCZOS)


def main() -> int:
    emb_path = DATA_DIR / "embeddings.json"
    if not emb_path.exists():
        print(f"[atlas] missing {emb_path} — run embed_projects.py first")
        return 1

    with open(emb_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    projects = payload.get("projects", [])
    n = len(projects)
    print(f"[atlas] read {n} projects")

    atlas = Image.new("RGB", (ATLAS_SIZE, ATLAS_SIZE), (10, 10, 14))

    for i in range(TOTAL_CELLS):
        row = i // GRID
        col = i % GRID
        x = col * CELL
        y = row * CELL

        if i < n:
            p = projects[i]
            slug = p["slug"]
            title = p.get("title") or slug
            try:
                img = _hero_for(slug, title)
            except Exception as e:
                print(f"  ! cell {i} {slug}: {e}; placeholder")
                img = make_placeholder(slug, title, size=CELL)
        else:
            slug = f"_empty_{i}"
            img = make_placeholder(slug, "", size=CELL)

        thumb = _fit_square(img, CELL)
        atlas.paste(thumb, (x, y))

        # GL UV: origin bottom-left
        u = col / GRID
        v = 1.0 - (row + 1) / GRID
        w = 1.0 / GRID
        h = 1.0 / GRID
        if i < n:
            projects[i]["thumbnail_uv"] = [u, v, w, h]
            projects[i]["atlas_cell"] = {"row": row, "col": col, "size": CELL}

        if i < n:
            print(f"   pack  cell ({row},{col})  {slug}")

    out_png = DATA_DIR / "atlas.png"
    atlas.save(out_png, format="PNG", optimize=True)
    size_kb = out_png.stat().st_size / 1024
    print(f"[atlas] wrote {out_png}  ({size_kb:.1f} KB, {ATLAS_SIZE}x{ATLAS_SIZE})")

    # Inject UVs back into embeddings.json
    payload["atlas"] = {
        "size": ATLAS_SIZE,
        "grid": GRID,
        "cell": CELL,
        "convention": "uv-origin-bottom-left",
    }
    with open(emb_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, separators=(",", ":"))
    print(f"[atlas] updated {emb_path} with thumbnail_uv")

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        traceback.print_exc()
        sys.exit(1)
