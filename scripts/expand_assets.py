#!/usr/bin/env python3
"""Phase 1 IMG-A: expand per-project assets per .research/asset-manifest.json.

Reads:  .research/asset-manifest.json  (built by inventory.py)
Writes: public/assets/<slug>/<normalized-filename>

For each project in the manifest:
  * Copy curated external_assets that pass slug-relevance / size / NDA filters.
  * Normalize filenames to lowercase-hyphen form.
  * Special-case semantic-canvas (53 tool screenshots + 8 outputs prefixed) and
    thesis-flagship (curated striking assets only).
  * Skip videos > 50MB unless explicitly whitelisted (proposal-presentation.mp4
    for thesis-flagship + semantic-canvas).
  * Run AFTER sync_from_vault.py so existing _assets/ content is already in
    public/assets/<slug>/.

NDA: anything containing 'hilos' (case-insensitive) in filename or context is
dropped on sight. Belt-and-suspenders to RULEBOOK §19.
"""
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

# Make _embed_common importable so we can use safe_open for any inspection.
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))
from _embed_common import safe_open  # noqa: E402

PROJECT_ROOT = SCRIPT_DIR.parent
MANIFEST_PATH = PROJECT_ROOT / ".research" / "asset-manifest.json"
ASSETS_OUT = PROJECT_ROOT / "public" / "assets"

# 50 MB ordinary cap; the proposal video is 107 MB but explicitly whitelisted.
VIDEO_CAP_BYTES = 50 * 1024 * 1024
PROPOSAL_VIDEO_BASENAME = "Proposal Final Presentation 1204.mp4"
PROPOSAL_VIDEO_TARGETS = {"thesis-flagship", "semantic-canvas"}
PROPOSAL_VIDEO_OUT_NAME = "proposal-presentation.mp4"

# Filename / path bans (NDA + leaked-from-other-vault hygiene)
NDA_BANS = ("hilos",)
# Reject manifest items that look like academic course materials, not artifacts.
NOISE_PATTERNS = (
    "lecture", "quiz", "midterm", "final exam", "homework",
    "hw1", "hw2", "hw3", "hw4", "hw5", "hw_",
    "transcript", "personal statement", "research statement",
    "community essay", "contribution essay", "short essay",
    "annotated bibliography", "criteria_for_success",
    "draftreadinglist", "gapanalysis", "statementofinterest",
    "spec.pdf", "-spec.pdf", " spec.pdf",
)
# Skip these extensions entirely from external_assets (we want media, not docs).
DOC_EXTS_SKIP_FOR_GENERAL = {".docx"}

# Image / video extensions we care about (anything else copied verbatim if explicitly OK).
MEDIA_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp",
              ".mp4", ".mov", ".webm", ".mkv"}


# ---------------------------------------------------------------------------
# Project-specific selection rules

def select_for_semantic_canvas(manifest: dict) -> list[dict]:
    """Return a curated copy-list for semantic-canvas.

    Includes:
      - All 53 thesis_extras.tool_screenshots (the canvas UI).
      - All 8 thesis_extras.shoe_outputs, with 'output-' prefix on the target name.
      - The 107 MB proposal video as proposal-presentation.mp4.
    Skips anything matching NDA_BANS or NOISE_PATTERNS.
    """
    te = manifest.get("thesis_extras", {})
    out = []
    seen_targets: set[str] = set()

    for s in te.get("tool_screenshots", []):
        path = s["path"]
        fname = s["filename"]
        if _is_banned(fname, path):
            continue
        target = _normalize_name(fname)
        if target in seen_targets:
            continue
        seen_targets.add(target)
        out.append({"src": path, "target": target, "type": "image"})

    for s in te.get("shoe_outputs", []):
        path = s["path"]
        fname = s["filename"]
        if _is_banned(fname, path):
            continue
        target = "output-" + _normalize_name(fname)
        if target in seen_targets:
            continue
        seen_targets.add(target)
        out.append({"src": path, "target": target, "type": "image"})

    # Proposal video
    for v in te.get("tool_videos", []):
        if v.get("filename") == PROPOSAL_VIDEO_BASENAME and v.get("size_bytes", 0) > 0:
            out.append({
                "src": v["path"],
                "target": PROPOSAL_VIDEO_OUT_NAME,
                "type": "video",
                "video_whitelist": True,
            })
            break
    return out


def select_for_thesis_flagship(manifest: dict) -> list[dict]:
    """Curated set: striking shoe outputs + system-overview images.

    Excludes per-control UI screenshots (those belong to semantic-canvas) and
    excludes academic-process PDFs (writeups, reading lists, lectures).
    """
    te = manifest.get("thesis_extras", {})
    out = []
    seen: set[str] = set()

    # Shoe outputs (8) — these are the most striking artifacts for a hero.
    for s in te.get("shoe_outputs", []):
        path, fname = s["path"], s["filename"]
        if _is_banned(fname, path):
            continue
        target = _normalize_name(fname)
        if target in seen:
            continue
        seen.add(target)
        out.append({"src": path, "target": target, "type": "image"})

    # System-overview-style screenshots only: pick by filename keyword
    OVERVIEW_KEYS = (
        "ch4_architecture", "ch4_system", "ch4_axis_projection_pipeline",
        "ch4_generation_pipeline", "ch4_axis_tuning_diagram",
        "concept_config_space", "territory_map", "stage1_vs_stage2",
        "lineage_view_UI",
    )
    for s in te.get("tool_screenshots", []):
        path, fname = s["path"], s["filename"]
        if _is_banned(fname, path):
            continue
        if not any(k.lower() in fname.lower() for k in OVERVIEW_KEYS):
            continue
        target = _normalize_name(fname)
        if target in seen:
            continue
        seen.add(target)
        out.append({"src": path, "target": target, "type": "image"})

    # Proposal video (whitelisted >50MB)
    for v in te.get("tool_videos", []):
        if v.get("filename") == PROPOSAL_VIDEO_BASENAME and v.get("size_bytes", 0) > 0:
            out.append({
                "src": v["path"],
                "target": PROPOSAL_VIDEO_OUT_NAME,
                "type": "video",
                "video_whitelist": True,
            })
            break

    return out


def select_generic(slug: str, project: dict) -> list[dict]:
    """Copy external_assets that look relevant for `slug`.

    Heuristic: filename or context path must contain one of the slug's words
    (length >= 3), AND must not be banned, AND must be a media file (or a
    PDF for slugs where PDFs are core deliverables).
    """
    slug_words = [w for w in slug.replace("-", " ").split() if len(w) >= 3]
    out = []
    seen: set[str] = set()

    for a in project.get("external_assets", []):
        path = a.get("path", "")
        fname = a.get("filename", "")
        size = a.get("size_bytes", 0) or 0

        if _is_banned(fname, path):
            continue
        if _is_noise(fname, path):
            continue

        ext = Path(fname).suffix.lower()
        if ext in DOC_EXTS_SKIP_FOR_GENERAL:
            continue

        if ext in {".mp4", ".mov", ".webm", ".mkv"}:
            if size > VIDEO_CAP_BYTES:
                continue
        elif ext not in MEDIA_EXTS:
            # Allow PDF only if the slug already has PDFs as part of deliverables
            # (we infer this from existing _assets/ ext distribution; default skip).
            continue

        if not _slug_relevant(fname, path, slug_words, slug):
            continue

        target = _normalize_name(fname)
        if target in seen:
            continue
        seen.add(target)
        out.append({"src": path, "target": target, "type": _type_for(ext)})

    return out


def select_for_empty_slugs(slug: str, project: dict) -> list[dict]:
    """For 3 empty-asset slugs: looser relevance, accept what manifest gave us."""
    out = []
    seen: set[str] = set()
    for a in project.get("external_assets", []):
        path = a.get("path", "")
        fname = a.get("filename", "")
        size = a.get("size_bytes", 0) or 0
        if _is_banned(fname, path):
            continue
        if _is_noise(fname, path):
            continue
        ext = Path(fname).suffix.lower()
        if ext not in MEDIA_EXTS:
            continue
        if ext in {".mp4", ".mov", ".webm", ".mkv"} and size > VIDEO_CAP_BYTES:
            continue
        target = _normalize_name(fname)
        if target in seen:
            continue
        seen.add(target)
        out.append({"src": path, "target": target, "type": _type_for(ext)})
    return out


# ---------------------------------------------------------------------------
# Filters

def _is_banned(filename: str, path: str) -> bool:
    blob = (filename + " " + path).lower()
    return any(b in blob for b in NDA_BANS)


def _is_noise(filename: str, path: str) -> bool:
    blob = (filename + " " + path).lower()
    return any(p in blob for p in NOISE_PATTERNS)


def _slug_relevant(filename: str, path: str, slug_words: list[str], slug: str) -> bool:
    """File is slug-relevant if the manifest already returned it (high signal)
    AND its filename / context path mentions a slug word OR sits in a path that
    contains the slug literal (e.g. _assets/<slug>/...).

    For permissive mode (no slug words match), allow if the source path is
    clearly the project root (manifest only returns external_assets that the
    inventory.py heuristic already filtered for the slug).
    """
    if not slug_words:
        return True
    blob = (filename + " " + path).replace("_", " ").replace("-", " ").lower()
    if slug.lower() in path.lower() or slug.lower() in filename.lower():
        return True
    return any(w in blob for w in slug_words)


def _normalize_name(name: str) -> str:
    """lowercase, spaces -> hyphens, collapse repeats, preserve extension."""
    p = Path(name)
    stem = p.stem.strip().lower()
    stem = re.sub(r"[ _]+", "-", stem)
    stem = re.sub(r"[^a-z0-9.\-]+", "-", stem)
    stem = re.sub(r"-+", "-", stem).strip("-")
    return stem + p.suffix.lower()


def _type_for(ext: str) -> str:
    if ext in {".gif"}:
        return "gif"
    if ext in {".png", ".jpg", ".jpeg", ".webp", ".bmp"}:
        return "image"
    if ext in {".mp4", ".mov", ".webm", ".mkv"}:
        return "video"
    return "other"


# ---------------------------------------------------------------------------
# Execution

def copy_one(slug: str, item: dict) -> tuple[bool, int]:
    """Copy a single item. Returns (copied?, size_kb)."""
    src = Path(item["src"])
    if not src.exists():
        sys.stderr.write(f"  ! missing source: {src}\n")
        return False, 0
    dest_dir = ASSETS_OUT / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / item["target"]
    # Idempotent: skip if same size already there.
    src_size = src.stat().st_size
    if dest.exists() and dest.stat().st_size == src_size:
        return False, src_size // 1024
    try:
        shutil.copy2(src, dest)
    except Exception as e:
        sys.stderr.write(f"  ! copy failed {src} -> {dest}: {e}\n")
        return False, 0
    print(f"[copy] {slug}/{item['target']} ({src_size // 1024} KB, {item['type']})")
    return True, src_size // 1024


def main() -> int:
    if not MANIFEST_PATH.exists():
        sys.stderr.write(f"manifest not found at {MANIFEST_PATH}\n")
        return 1
    with MANIFEST_PATH.open("r", encoding="utf-8") as fh:
        manifest = json.load(fh)

    projects = manifest.get("projects", {})
    EMPTY_SLUGS = {
        "a-game-of-deterioration",
        "live-ai-feedback-design-assistant",
        "s25-team-26-paper-viz",
    }

    total_copied = 0
    per_slug: dict[str, int] = {}

    for slug, project in projects.items():
        if slug == "semantic-canvas":
            items = select_for_semantic_canvas(manifest)
        elif slug == "thesis-flagship":
            items = select_for_thesis_flagship(manifest)
        elif slug in EMPTY_SLUGS:
            items = select_for_empty_slugs(slug, project)
        else:
            items = select_generic(slug, project)

        copied = 0
        for item in items:
            ok, _kb = copy_one(slug, item)
            if ok:
                copied += 1
        total_copied += copied
        per_slug[slug] = copied

    print()
    print(f"[expand] total newly-copied files: {total_copied}")
    for s, n in sorted(per_slug.items()):
        print(f"    [+{n:>3}] {s}")

    # Final per-slug count of files in public/assets/<slug>/
    print()
    print("[expand] final per-slug file counts in public/assets/:")
    for slug in sorted(projects.keys()):
        d = ASSETS_OUT / slug
        if d.exists():
            n = sum(1 for _ in d.iterdir() if _.is_file())
            print(f"    [{n:>3}] {slug}")
        else:
            print(f"    [  0] {slug}  (dir absent)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
