#!/usr/bin/env python3
"""Sync published portfolio content from the vault into this site repo.

Reads:  $VAULT/Portfolio/*.md (frontmatter + body) and $VAULT/Portfolio/_assets/<slug>/*
Writes: src/content/projects/<slug>.md (rewritten image paths)
        public/assets/<slug>/* (copied binaries)

NDA filter (per _RULEBOOK.md §19): only cards with `publish: true` AND no `hilos` tag
AND no `company: HILOS Studio` are copied. Build fails loudly on any violation.

Usage:
    python scripts/sync_from_vault.py
    VAULT=/w/SecondBrain python scripts/sync_from_vault.py   # override vault path
    python scripts/sync_from_vault.py --dry-run              # show what would happen
"""
from __future__ import annotations

import argparse
import os
import re
import shutil
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths

DEFAULT_VAULT = Path(os.environ.get("VAULT", r"W:\SecondBrain")).expanduser()
SITE = Path(__file__).resolve().parent.parent
PORTFOLIO = DEFAULT_VAULT / "Portfolio"
ASSETS_SRC = PORTFOLIO / "_assets"
CONTENT_OUT = SITE / "src" / "content" / "projects"
ASSETS_OUT = SITE / "public" / "assets"

# NDA filter config (keep in sync with _RULEBOOK.md §19)
FORBIDDEN_TAGS = {"hilos", "hilos-studio", "nda"}
FORBIDDEN_COMPANIES = {"hilos studio", "hilos"}
FORBIDDEN_ASSET_PREFIXES = ("hilos-",)


# ---------------------------------------------------------------------------
# Frontmatter parser (minimal YAML — no extra deps)

def split_frontmatter(text: str) -> tuple[dict, str]:
    """Parse `--- ... ---` frontmatter. Returns ({}, text) if none."""
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text
    fm_raw = text[3:end].strip("\n")
    body = text[end + 4 :].lstrip("\n")
    fm = _parse_yaml(fm_raw)
    return fm, body


def _parse_yaml(raw: str) -> dict:
    """Tiny YAML parser — handles scalars, quoted strings, lists, and `key:\n  - value` blocks."""
    result: dict = {}
    lines = raw.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip() or line.lstrip().startswith("#"):
            i += 1
            continue
        match = re.match(r"^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$", line)
        if not match:
            i += 1
            continue
        key, val = match.group(1), match.group(2).strip()
        # Inline array: [a, b, c]
        if val.startswith("[") and val.endswith("]"):
            inner = val[1:-1].strip()
            result[key] = [_clean(x) for x in _split_top(inner)] if inner else []
            i += 1
            continue
        # Empty value with following indented block
        if val == "" and i + 1 < len(lines) and lines[i + 1].lstrip().startswith("-"):
            items = []
            i += 1
            while i < len(lines) and (lines[i].lstrip().startswith("-") or lines[i].strip() == ""):
                if lines[i].strip():
                    items.append(_clean(lines[i].lstrip()[1:].strip()))
                i += 1
            result[key] = items
            continue
        # Scalar
        result[key] = _clean(val)
        i += 1
    return result


def _split_top(s: str) -> list[str]:
    """Split by commas respecting brackets/quotes."""
    items, depth, start, in_str = [], 0, 0, None
    for idx, ch in enumerate(s):
        if in_str:
            if ch == in_str and (idx == 0 or s[idx - 1] != "\\"):
                in_str = None
            continue
        if ch in ("'", '"'):
            in_str = ch
        elif ch in "[{":
            depth += 1
        elif ch in "]}":
            depth -= 1
        elif ch == "," and depth == 0:
            items.append(s[start:idx].strip())
            start = idx + 1
    items.append(s[start:].strip())
    return [x for x in items if x]


def _clean(v: str):
    v = v.strip()
    if not v:
        return ""
    if v in ("true", "True"):
        return True
    if v in ("false", "False"):
        return False
    if v == "null" or v == "None" or v == "~":
        return None
    if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
        return v[1:-1]
    try:
        if "." in v:
            return float(v)
        return int(v)
    except ValueError:
        return v


# ---------------------------------------------------------------------------
# Sync logic

def card_is_publishable(fm: dict, slug: str) -> tuple[bool, str]:
    """Return (publishable, reason). Also raise on RULEBOOK §19 violation."""
    publish = fm.get("publish", False)
    tags = {str(t).lower() for t in fm.get("tags", [])}
    company = str(fm.get("company", "")).lower()

    has_forbidden_tag = bool(tags & FORBIDDEN_TAGS)
    has_forbidden_company = any(c in company for c in FORBIDDEN_COMPANIES)

    # Rulebook §19 belt-and-suspenders check: fail build if publish: true AND forbidden
    if publish and (has_forbidden_tag or has_forbidden_company):
        raise RuntimeError(
            f"RULEBOOK §19 VIOLATION: card '{slug}' has publish: true AND forbidden tag/company "
            f"(tags={tags & FORBIDDEN_TAGS}, company='{company}'). Refusing to build."
        )

    if not publish:
        return False, "publish: false or missing"
    if has_forbidden_tag:
        return False, f"forbidden tag ({tags & FORBIDDEN_TAGS})"
    if has_forbidden_company:
        return False, f"forbidden company ({company})"
    return True, "ok"


def rewrite_asset_paths(body: str, slug: str) -> str:
    """Rewrite `_assets/<slug>/foo.ext` → `/assets/<slug>/foo.ext` (web-absolute)."""
    # Match _assets/... paths in markdown image refs, frontmatter-leaked paths, and plain refs
    return re.sub(
        r"_assets/([^\s\)\"']+)",
        r"/assets/\1",
        body,
    )


def sync(dry_run: bool = False) -> int:
    if not PORTFOLIO.exists():
        print(f"[sync] vault path not found: {PORTFOLIO}", file=sys.stderr)
        return 1

    if not dry_run:
        CONTENT_OUT.mkdir(parents=True, exist_ok=True)
        ASSETS_OUT.mkdir(parents=True, exist_ok=True)
        # Clean previous sync output (keep directory itself)
        for existing in CONTENT_OUT.glob("*.md"):
            existing.unlink()
        for existing in ASSETS_OUT.iterdir():
            if existing.is_dir():
                shutil.rmtree(existing)
            else:
                existing.unlink()

    published, skipped = [], []

    for card in sorted(PORTFOLIO.glob("*.md")):
        if card.name.startswith("_"):
            continue  # dashboards, strategy docs
        text = card.read_text(encoding="utf-8")
        fm, body = split_frontmatter(text)
        slug = fm.get("slug") or card.stem
        ok, reason = card_is_publishable(fm, slug)
        if not ok:
            skipped.append((slug, reason))
            continue

        # Rewrite image paths in body + frontmatter hero_image/images
        rewritten_body = rewrite_asset_paths(body, slug)
        rewritten_front = text[: text.find("\n---", 3) + 4]  # full raw frontmatter block
        rewritten_front = rewrite_asset_paths(rewritten_front, slug)
        out_text = rewritten_front + "\n" + rewritten_body

        out_path = CONTENT_OUT / f"{slug}.md"
        print(f"  [publish] {slug}")
        if not dry_run:
            out_path.write_text(out_text, encoding="utf-8")

        # Copy assets folder if present
        asset_dir = ASSETS_SRC / slug
        if asset_dir.is_dir():
            if any(asset_dir.name.startswith(p) for p in FORBIDDEN_ASSET_PREFIXES):
                raise RuntimeError(
                    f"RULEBOOK §19 VIOLATION: forbidden asset prefix in {asset_dir}"
                )
            dest = ASSETS_OUT / slug
            if not dry_run:
                shutil.copytree(asset_dir, dest, dirs_exist_ok=True)
                # Drop hidden subdirs (.tools, etc.)
                for sub in dest.iterdir():
                    if sub.name.startswith("."):
                        shutil.rmtree(sub, ignore_errors=True)
        published.append(slug)

    print()
    print(f"[sync] published: {len(published)}")
    for s in published:
        print(f"    [+] {s}")
    print(f"[sync] skipped:   {len(skipped)}")
    for s, reason in skipped:
        print(f"    [-] {s}  ({reason})")

    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    return sync(dry_run=args.dry_run)


if __name__ == "__main__":
    sys.exit(main())
