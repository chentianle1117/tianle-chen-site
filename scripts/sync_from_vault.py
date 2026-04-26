#!/usr/bin/env python3
"""Sync published portfolio content from the vault into this site repo.

Reads:  $VAULT/Portfolio/*.md (frontmatter + body) and $VAULT/Portfolio/_assets/<slug>/*
        .research/asset-manifest.json (consulted, not authoritative)
Writes: src/content/projects/<slug>.md (rewritten image paths)
        public/assets/<slug>/* (vault-side binaries copied; expand_assets.py adds more)

NDA filter (per _RULEBOOK.md §19): only cards with `publish: true` AND no `hilos` tag
AND no `company: HILOS Studio` are copied. Build fails loudly on any violation.

Curation preservation:
  Any frontmatter field set by select_heroes.py is preserved IF the existing
  site-side .md has `_hero_curated: true`. Specifically:
      hero_image, gif_hero, video, video_proposal, images
  are NEVER overwritten when `_hero_curated: true` is present in the existing
  site-side file. Other fields (title, year, summary, role, categories,
  course code, body) always sync from the vault.

Usage:
    python scripts/sync_from_vault.py
    VAULT=/w/SecondBrain python scripts/sync_from_vault.py   # override vault path
    python scripts/sync_from_vault.py --dry-run
"""
from __future__ import annotations

import argparse
import json
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
MANIFEST_PATH = SITE / ".research" / "asset-manifest.json"

# NDA filter config (keep in sync with _RULEBOOK.md §19)
FORBIDDEN_TAGS = {"hilos", "hilos-studio", "nda"}
FORBIDDEN_COMPANIES = {"hilos studio", "hilos"}
FORBIDDEN_ASSET_PREFIXES = ("hilos-",)

# Frontmatter fields whose values are owned by select_heroes.py once curated.
CURATED_FIELDS = {"hero_image", "gif_hero", "video", "video_proposal", "images",
                  "_hero_curated"}


# ---------------------------------------------------------------------------
# Frontmatter parser (minimal YAML — no extra deps)

def split_frontmatter(text: str) -> tuple[dict, str, str]:
    """Parse `--- ... ---`. Returns (parsed_dict, raw_fm_block, body)."""
    if not text.startswith("---"):
        return {}, "", text
    end = text.find("\n---", 3)
    if end == -1:
        return {}, "", text
    fm_raw = text[3:end].strip("\n")
    body = text[end + 4:].lstrip("\n")
    fm = _parse_yaml(fm_raw)
    return fm, fm_raw, body


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
        # Inline array
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
    publish = fm.get("publish", False)
    tags = {str(t).lower() for t in fm.get("tags", [])}
    company = str(fm.get("company", "")).lower()
    has_forbidden_tag = bool(tags & FORBIDDEN_TAGS)
    has_forbidden_company = any(c in company for c in FORBIDDEN_COMPANIES)
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
    return re.sub(r"_assets/([^\s\)\"']+)", r"/assets/\1", body)


def _strip_curated_lines(fm_raw: str) -> str:
    """Remove curated-field lines (and their list bodies) from a raw FM block.

    Used so the vault's *future* values for these fields don't carry over when
    we're going to splice the existing site-side curated values back in.
    """
    out_lines: list[str] = []
    skip_block = False
    for line in fm_raw.split("\n"):
        if skip_block:
            if line.startswith("  ") or line.lstrip().startswith("- "):
                continue
            skip_block = False
        m = re.match(r"^([a-zA-Z_][a-zA-Z0-9_]*)\s*:", line)
        if m:
            key = m.group(1)
            if key in CURATED_FIELDS:
                rest = line[m.end():].strip()
                if rest == "":
                    skip_block = True
                continue
        out_lines.append(line)
    return "\n".join(out_lines).rstrip()


def _extract_curated_lines(existing_fm_raw: str) -> str:
    """Pull just the curated-field lines (with their block bodies) out of an FM block."""
    keep: list[str] = []
    keep_block = False
    for line in existing_fm_raw.split("\n"):
        m = re.match(r"^([a-zA-Z_][a-zA-Z0-9_]*)\s*:", line)
        if m:
            key = m.group(1)
            if key in CURATED_FIELDS:
                keep.append(line)
                rest = line[m.end():].strip()
                keep_block = (rest == "")
                continue
            else:
                keep_block = False
                continue
        if keep_block:
            keep.append(line)
            continue
    return "\n".join(keep).rstrip()


def sync(dry_run: bool = False) -> int:
    if not PORTFOLIO.exists():
        print(f"[sync] vault path not found: {PORTFOLIO}", file=sys.stderr)
        return 1

    if MANIFEST_PATH.exists():
        print(f"[sync] consulting manifest at {MANIFEST_PATH}")
    else:
        print(f"[sync] no manifest at {MANIFEST_PATH} (continuing — Phase 1 IMG-A may not have run yet)")

    if not dry_run:
        CONTENT_OUT.mkdir(parents=True, exist_ok=True)
        ASSETS_OUT.mkdir(parents=True, exist_ok=True)

    published, skipped = [], []

    # Snapshot existing curated frontmatter blocks BEFORE we touch anything.
    curated_snapshot: dict[str, str] = {}
    for existing in CONTENT_OUT.glob("*.md"):
        try:
            text = existing.read_text(encoding="utf-8")
            fm, fm_raw, _ = split_frontmatter(text)
            if fm.get("_hero_curated") is True:
                curated_snapshot[existing.stem] = _extract_curated_lines(fm_raw)
        except Exception as e:
            print(f"[sync] warn: could not read {existing}: {e}", file=sys.stderr)

    # NOTE: We deliberately do NOT clean previous output anymore. The vault sync
    # now overlays metadata + body; expand_assets.py adds new files without
    # removing what's there. Use `git clean -dfx public/assets src/content`
    # if a hard reset is needed.

    for card in sorted(PORTFOLIO.glob("*.md")):
        if card.name.startswith("_"):
            continue
        text = card.read_text(encoding="utf-8")
        fm, fm_raw, body = split_frontmatter(text)
        slug = fm.get("slug") or card.stem
        ok, reason = card_is_publishable(fm, slug)
        if not ok:
            skipped.append((slug, reason))
            continue

        # Rewrite paths in body and frontmatter
        rewritten_body = rewrite_asset_paths(body, slug)
        rewritten_fm = rewrite_asset_paths(fm_raw, slug)

        # If we have curated lines for this slug, strip the same-keyed lines
        # from the vault's frontmatter and append the curated ones.
        curated_block = curated_snapshot.get(slug, "")
        if curated_block:
            stripped = _strip_curated_lines(rewritten_fm).rstrip()
            new_fm = stripped + "\n" + curated_block
        else:
            new_fm = rewritten_fm.rstrip()

        out_text = "---\n" + new_fm + "\n---\n\n" + rewritten_body

        out_path = CONTENT_OUT / f"{slug}.md"
        action = "preserve-curated" if curated_block else "publish"
        print(f"  [{action}] {slug}")
        if not dry_run:
            out_path.write_text(out_text, encoding="utf-8")

        # Vault-side asset copy (overlay; does not delete pre-existing files
        # that expand_assets.py copied in).
        # Source dirs to consider: ASSETS_SRC/<slug>, plus any `_assets/<DIR>/`
        # path referenced in the vault's frontmatter or body (handles cases
        # where vault dir name differs from site slug — e.g. 3t3d vs 3t3d-vit-2d-to-3d).
        candidate_dirs: set[Path] = set()
        primary = ASSETS_SRC / slug
        if primary.is_dir():
            candidate_dirs.add(primary)
        for ref in re.findall(r"_assets/([A-Za-z0-9_\-]+)/", fm_raw + "\n" + body):
            d = ASSETS_SRC / ref
            if d.is_dir():
                candidate_dirs.add(d)

        for asset_dir in candidate_dirs:
            if any(asset_dir.name.startswith(p) for p in FORBIDDEN_ASSET_PREFIXES):
                raise RuntimeError(
                    f"RULEBOOK §19 VIOLATION: forbidden asset prefix in {asset_dir}"
                )

        # Rewrite second pass for body/frontmatter with detected dir aliases:
        # if the vault used `_assets/<other>/…`, force it to `/assets/<slug>/…`.
        # This guarantees the copied files are reachable under the slug-named dir.
        for asset_dir in candidate_dirs:
            if asset_dir.name != slug:
                pat = re.compile(r"/assets/" + re.escape(asset_dir.name) + "/")
                rewritten_body = pat.sub(f"/assets/{slug}/", rewritten_body)
                new_fm = pat.sub(f"/assets/{slug}/", new_fm)

        # Re-emit the markdown file with the fixed paths if we did rewrites.
        out_text = "---\n" + new_fm + "\n---\n\n" + rewritten_body
        if not dry_run:
            out_path.write_text(out_text, encoding="utf-8")

        if not dry_run:
            dest = ASSETS_OUT / slug
            dest.mkdir(parents=True, exist_ok=True)
            for asset_dir in candidate_dirs:
                for src_file in asset_dir.iterdir():
                    if not src_file.is_file():
                        continue
                    if src_file.name.startswith("."):
                        continue
                    target = dest / src_file.name
                    if target.exists() and target.stat().st_size == src_file.stat().st_size:
                        continue
                    shutil.copy2(src_file, target)
        published.append(slug)

    print()
    print(f"[sync] published: {len(published)}")
    for s in published:
        print(f"    [+] {s}")
    print(f"[sync] skipped:   {len(skipped)}")
    for s, reason in skipped:
        print(f"    [-] {s}  ({reason})")
    print(f"[sync] curated-preserve hits: {len(curated_snapshot)}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    return sync(dry_run=args.dry_run)


if __name__ == "__main__":
    sys.exit(main())
