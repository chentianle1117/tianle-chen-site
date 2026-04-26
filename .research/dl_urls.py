"""Download URLs from stdin (one per line) into a slug folder.

Usage:
  python dl_urls.py <slug> < urls.txt

Reads URLs (one per line) from stdin, downloads each into
public/assets/<slug>/notion-NNN-<safename>.<ext>, deduping by sha1-head and
matching content-type to extension. Skips PDFs, large videos, non-media.

Tracks new GIFs and prints a JSON summary at the end.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import unquote, urlparse

import requests

ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT / "public" / "assets"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}
GIF_EXTS = {".gif"}
VIDEO_EXTS = {".mp4", ".mov", ".webm", ".m4v"}
SKIP_HOSTS = ("youtube.com", "youtu.be")


def file_sha1_head(path: Path, head: int = 512 * 1024) -> str:
    h = hashlib.sha1()
    with path.open("rb") as f:
        h.update(f.read(head))
    return h.hexdigest()


def main():
    if len(sys.argv) < 2:
        print("usage: python dl_urls.py <slug>", file=sys.stderr)
        sys.exit(2)
    slug = sys.argv[1]
    asset_dir = ASSETS_DIR / slug
    asset_dir.mkdir(parents=True, exist_ok=True)

    # existing file hashes (head) for dedupe
    existing_hashes = {}
    for p in asset_dir.iterdir():
        if p.is_file() and p.suffix.lower() in (IMAGE_EXTS | GIF_EXTS | VIDEO_EXTS):
            try:
                existing_hashes[file_sha1_head(p)] = p.name
            except Exception:
                pass
    seen = set(existing_hashes.keys())

    new_files = []
    new_gifs = []
    skipped = []

    urls = [u.strip() for u in sys.stdin.read().splitlines() if u.strip() and not u.startswith("#")]
    for idx, url in enumerate(urls, 1):
        if not (url.startswith("http://") or url.startswith("https://")):
            skipped.append({"url": url[:100], "reason": "not-http"})
            continue
        if any(h in url for h in SKIP_HOSTS):
            skipped.append({"url": url[:100], "reason": "youtube"})
            continue

        # derive base name
        parsed = urlparse(url)
        name = unquote(parsed.path).rsplit("/", 1)[-1] or f"file-{idx}"
        # strip myportfolio's _rw_NNN.ext suffix from name? keep raw for safety
        name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
        if "." not in name:
            name = name + ".bin"

        try:
            with requests.get(url, stream=True, timeout=60) as r:
                if r.status_code != 200:
                    skipped.append({"url": url[:100], "reason": f"http {r.status_code}"})
                    continue
                ct = r.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
                ct_ext = {
                    "image/gif": ".gif", "image/png": ".png", "image/jpeg": ".jpg",
                    "image/jpg": ".jpg", "image/webp": ".webp", "image/bmp": ".bmp",
                    "video/mp4": ".mp4", "video/quicktime": ".mov", "video/webm": ".webm",
                    "application/pdf": ".pdf",
                }.get(ct)
                # adjust ext if mismatch
                cur_ext = Path(name).suffix.lower()
                if ct_ext and cur_ext != ct_ext:
                    name = Path(name).stem + ct_ext

                # classify
                ext = Path(name).suffix.lower()
                if ext == ".pdf":
                    skipped.append({"url": url[:100], "reason": "pdf"})
                    continue
                cls = "gif" if ext in GIF_EXTS else "image" if ext in IMAGE_EXTS else "video" if ext in VIDEO_EXTS else "other"
                if cls == "other":
                    skipped.append({"url": url[:100], "reason": f"unknown-ext-{ext}-ct-{ct}"})
                    continue

                # dest with prefix
                base = name[:80]
                final_name = f"notion-{idx:03d}-{base}"
                if len(final_name) > 100:
                    final_name = f"notion-{idx:03d}-" + base[-80:]
                dest = asset_dir / final_name
                if dest.exists():
                    dest = asset_dir / (dest.stem + "_n" + dest.suffix)

                # stream download
                size = 0
                with dest.open("wb") as f:
                    for chunk in r.iter_content(chunk_size=64 * 1024):
                        if chunk:
                            f.write(chunk)
                            size += len(chunk)
                            if size > 500 * 1024 * 1024:
                                f.close()
                                dest.unlink(missing_ok=True)
                                skipped.append({"url": url[:100], "reason": "too-large"})
                                size = -1
                                break
                if size <= 0:
                    continue

                # video size cap
                if cls == "video" and size > 50 * 1024 * 1024:
                    dest.unlink(missing_ok=True)
                    skipped.append({"url": url[:100], "reason": "video>50MB"})
                    continue

                # dedupe vs existing/new
                try:
                    h = file_sha1_head(dest)
                except Exception:
                    h = None
                if h and h in seen:
                    dest.unlink(missing_ok=True)
                    skipped.append({"url": url[:100], "reason": "dup"})
                    continue
                if h:
                    seen.add(h)

                rec = {
                    "filename": dest.name,
                    "web_path": f"/assets/{slug}/{dest.name}",
                    "type": cls,
                    "size_bytes": size,
                    "content_type": ct,
                    "url_origin_uuid": "/".join(parsed.path.split("/")[-3:-1]),
                }
                new_files.append(rec)
                if cls == "gif":
                    new_gifs.append(dest.name)
        except Exception as e:
            skipped.append({"url": url[:100], "reason": f"err {e}"})

    out = {
        "slug": slug,
        "downloaded": len(new_files),
        "new_gifs": len(new_gifs),
        "files": new_files,
        "gif_names": new_gifs,
        "skipped": skipped,
    }
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
