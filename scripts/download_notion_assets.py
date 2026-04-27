"""Download specific Notion S3 assets before signed URLs expire (~1 hour).

Round-6 asset salvage. Pulls real gameplay GIFs + storyboard for
a-game-of-deterioration from David's Notion portfolio page.

NOTE: Notion-issued pre-signed S3 URLs expire ~1 hour after they're minted.
Embedding them in source got flagged by GitHub secret scanning (the temp
STS credentials in the URL match the AWS-key pattern, even though they're
Notion's, not ours, and already expired).

To re-run this script:
  1. Open the Notion page in a browser, right-click each asset, copy the
     fresh signed URL.
  2. Paste into the SIGNED_URLS dict below (keyed by output filename), or
     pass via env var NOTION_ASSET_URLS as JSON.
  3. Run within the hour.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(r"W:\tianle-chen-site")
ASSETS = ROOT / "public" / "assets"

# (slug, filename) — order preserves the original Round-6 salvage list.
DOWNLOADS = [
    ("a-game-of-deterioration", "gameplay-terrain-editor.gif"),
    ("a-game-of-deterioration", "gameplay-deterioration-restoration.gif"),
    ("a-game-of-deterioration", "story-board.jpg"),
]

# Paste fresh Notion-signed URLs here, keyed by filename. Leave empty to
# read from the NOTION_ASSET_URLS env var instead (JSON dict: {filename: url}).
SIGNED_URLS: dict[str, str] = {
    # "gameplay-terrain-editor.gif": "https://prod-files-secure.s3.us-west-2.amazonaws.com/...",
}


def resolve_url(filename: str) -> str | None:
    if filename in SIGNED_URLS and SIGNED_URLS[filename]:
        return SIGNED_URLS[filename]
    env_blob = os.environ.get("NOTION_ASSET_URLS")
    if env_blob:
        try:
            return json.loads(env_blob).get(filename)
        except json.JSONDecodeError:
            print("  WARN: NOTION_ASSET_URLS is not valid JSON", file=sys.stderr)
    return None


def main() -> None:
    for slug, filename in DOWNLOADS:
        out = ASSETS / slug / filename
        out.parent.mkdir(parents=True, exist_ok=True)
        if out.exists():
            print(f"[skip] {out.relative_to(ROOT)} already exists ({out.stat().st_size:,} bytes)")
            continue
        url = resolve_url(filename)
        if not url:
            print(f"[miss] no signed URL for {filename} — paste one into SIGNED_URLS or set NOTION_ASSET_URLS", file=sys.stderr)
            continue
        print(f"[fetch] {slug}/{filename}")
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (asset-salvage)"},
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            out.write_bytes(data)
            print(f"  -> {len(data):,} bytes")
        except Exception as e:
            print(f"  ERROR: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
