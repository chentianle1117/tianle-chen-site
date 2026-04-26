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

# Local helpers
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _embed_common import (  # noqa: E402
    CONTENT_DIR,
    DATA_DIR,
    embed_images,
    embed_texts,
    find_hero_image,
    jina_available,
    jina_embed,
    load_clip_model,
    make_placeholder,
    normalize,
)


def _load_project_files() -> List[dict]:
    """Read all .md files under content/projects/. Sort deterministically."""
    out: List[dict] = []
    for md_path in sorted(CONTENT_DIR.glob("*.md")):
        try:
            post = frontmatter.load(md_path)
        except Exception as e:
            print(f"  ! could not parse {md_path.name}: {e}")
            continue
        meta = dict(post.metadata)
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


def _hero_for(project: dict, placeholder_size: int = 256) -> tuple[Image.Image, bool]:
    """Return (PIL.Image, is_placeholder). Always succeeds."""
    fs = find_hero_image(project["slug"], project["meta"])
    if fs is not None:
        try:
            return Image.open(fs).convert("RGB"), False
        except Exception as e:
            print(f"  ! could not open hero {fs}: {e}; using placeholder")
    return make_placeholder(project["slug"], project["title"], size=placeholder_size), True


def _text_blob(project: dict) -> str:
    title = project["title"] or project["slug"]
    body = project["body"] or ""
    # Strip frontmatter-leftover whitespace; keep first 1500 chars of body
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

    combined = 0.7 * image_emb + 0.3 * text_emb
    combined = normalize(combined)

    payload = {
        "model": model_name,
        "dim": int(dim),
        "count": len(projects),
        "projects": [],
    }
    for i, p in enumerate(projects):
        payload["projects"].append({
            "slug": p["slug"],
            "title": p["title"],
            "year": p["year"],
            "categories": p["categories"],
            "priority": p["priority"],
            "placeholder": bool(placeholder_flags[i]),
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
