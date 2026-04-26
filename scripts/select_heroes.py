#!/usr/bin/env python3
"""Phase 1 IMG-A: pick the best hero per project and update frontmatter.

Reads:  public/assets/<slug>/*  (the post-expansion ground truth)
        src/content/projects/<slug>.md (current frontmatter)
Writes: src/content/projects/<slug>.md  (frontmatter only — body untouched)

Hero priority:
  1. project-specific override (see HERO_OVERRIDES)
  2. high-quality GIF (avoid flowchart/diagram)
  3. MP4/WebM video (sets `video`; hero_image then = best still candidate)
  4. best still image (avoid flowchart/diagram filenames)

Sets:  hero_image, gif_hero (if GIF), video, video_proposal, images.
Always sets `_hero_curated: true` so sync_from_vault.py preserves these.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ASSETS_OUT = PROJECT_ROOT / "public" / "assets"
CONTENT_DIR = PROJECT_ROOT / "src" / "content" / "projects"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}
GIF_EXTS = {".gif"}
VIDEO_EXTS = {".mp4", ".webm", ".mov", ".mkv"}

# Filenames that suggest schematic/diagram content — avoided as hero.
DIAGRAM_HINTS = (
    "flowchart", "flow-chart", "flow_chart", "diagram",
    "schematic", "architecture-diagram", "system-diagram", "method-diagram",
    "system-loop", "architecture_diagram", "arch_diagram",
    "ch4_architecture", "ch4_system", "fusion_diagram", "decoder_diagram",
    "axis_projection_pipeline", "generation_pipeline", "axis_tuning_diagram",
    "agent_behavior_flow",
)

# Per-slug explicit hero / video selections.
# "hero" = preferred filename pattern (substring match against asset names).
# "gif"  = optional GIF-hero (sets gif_hero).
# "video" = optional non-GIF video (sets video).
# "video_proposal" = sets video_proposal frontmatter.
HERO_OVERRIDES: dict[str, dict] = {
    "semantic-canvas": {
        "hero_patterns": ["semantic-canvas-ui.png", "semantic_canvas_ui", "semantic-canvas-ui",
                          "lineage-view-ui", "ui-screenshot.png"],
        "video_proposal": "/assets/semantic-canvas/proposal-presentation.mp4",
    },
    "thesis-flagship": {
        "hero_patterns": ["nano-generated-shoe", "form-forge", "fashion-interface",
                          "deeprise-interface", "concept-config-space",
                          "territory-map", "stage1-vs-stage2-comparison"],
        "video_proposal": "/assets/thesis-flagship/proposal-presentation.mp4",
    },
    "fiber-based-pavilion": {
        "gif_patterns": ["column-form-finding.gif", "robot-simulation.gif",
                         "form-finding-detail-1.gif"],
        "hero_fallback_patterns": ["column-catalogue-1.png", "robot-fabrication.png"],
    },
    "wire-bending": {
        "gif_patterns": ["bending-process.gif"],
        "hero_fallback_patterns": ["full-installation.png", "hero.png"],
    },
    "spectral-facades": {
        "gif_patterns": ["hero.gif"],
        "hero_fallback_patterns": ["final-output.png", "screenshot.jpg"],
    },
    "design-the-ambience": {
        "gif_patterns": ["hero.gif"],
        "hero_fallback_patterns": ["trial-3-physarum.png", "trial-2-urban-plan.png"],
    },
    "skill-bridge-datavis": {
        "gif_patterns": ["dashboard-hero.gif", "dashboard-hover.gif"],
        "hero_fallback_patterns": ["integrated-dashboard.png",
                                   "circular-skill-job-linkage.png"],
    },
    "a-game-of-deterioration": {
        "gif_patterns": ["demo-09.gif", "demo-03.gif", "demo-05.gif", "demo-04.gif",
                         "img2img1.gif", "img2img2.gif"],
        "hero_fallback_patterns": ["img2img-example.png", "input.png",
                                   "papercube-test.png"],
    },
    "live-ai-feedback-design-assistant": {
        # Currently empty — let _has_assets check decide.
    },
    "s25-team-26-paper-viz": {
        # Currently empty after filtering.
    },
}


def _is_diagram(name: str) -> bool:
    n = name.lower()
    return any(h in n for h in DIAGRAM_HINTS)


def _list_assets(slug: str) -> list[Path]:
    d = ASSETS_OUT / slug
    if not d.exists():
        return []
    return sorted(p for p in d.iterdir() if p.is_file())


def _ext_class(p: Path) -> str:
    e = p.suffix.lower()
    if e in GIF_EXTS:
        return "gif"
    if e in IMAGE_EXTS:
        return "image"
    if e in VIDEO_EXTS:
        return "video"
    return "other"


def _match_pattern(files: list[Path], patterns: list[str]) -> Path | None:
    """Return first file whose name matches any of the substring patterns (case-insensitive)."""
    if not patterns:
        return None
    lower_map = {p.name.lower(): p for p in files}
    for pat in patterns:
        pat_l = pat.lower()
        # exact match
        if pat_l in lower_map:
            return lower_map[pat_l]
        # substring match
        for name_l, path in lower_map.items():
            if pat_l in name_l:
                return path
    return None


def _best_still(files: list[Path]) -> Path | None:
    candidates = [p for p in files
                  if _ext_class(p) == "image" and not _is_diagram(p.name)]
    if not candidates:
        return None
    # Prefer larger files (proxy for richer content). Filter pdf/docs already excluded.
    candidates.sort(key=lambda p: -p.stat().st_size)
    return candidates[0]


def _best_gif(files: list[Path]) -> Path | None:
    gifs = [p for p in files if _ext_class(p) == "gif" and not _is_diagram(p.name)]
    if not gifs:
        return None
    gifs.sort(key=lambda p: -p.stat().st_size)
    return gifs[0]


def _best_video(files: list[Path]) -> Path | None:
    """Best non-proposal video (i.e. NOT proposal-presentation.mp4)."""
    vids = [p for p in files
            if _ext_class(p) == "video"
            and "proposal" not in p.name.lower()]
    if not vids:
        return None
    vids.sort(key=lambda p: -p.stat().st_size)
    return vids[0]


def select_hero(slug: str, files: list[Path]) -> dict:
    """Return a dict with selected: hero_image, gif_hero, video, video_proposal."""
    overrides = HERO_OVERRIDES.get(slug, {})
    out: dict = {}

    # GIF-first slugs
    gif_patterns = overrides.get("gif_patterns") or []
    fallback_patterns = overrides.get("hero_fallback_patterns") or []
    hero_patterns = overrides.get("hero_patterns") or []

    chosen_gif = _match_pattern(files, gif_patterns)
    if chosen_gif:
        out["hero_image"] = f"/assets/{slug}/{chosen_gif.name}"
        out["gif_hero"] = f"/assets/{slug}/{chosen_gif.name}"

    if "hero_image" not in out and hero_patterns:
        chosen = _match_pattern(files, hero_patterns)
        if chosen:
            out["hero_image"] = f"/assets/{slug}/{chosen.name}"

    if "hero_image" not in out and fallback_patterns:
        chosen = _match_pattern(files, fallback_patterns)
        if chosen:
            out["hero_image"] = f"/assets/{slug}/{chosen.name}"

    # Generic priority
    if "hero_image" not in out:
        gif = _best_gif(files)
        if gif and gif.stat().st_size < 30_000_000:  # < 30 MB GIF acceptable as hero
            out["hero_image"] = f"/assets/{slug}/{gif.name}"
            out["gif_hero"] = f"/assets/{slug}/{gif.name}"
    if "hero_image" not in out:
        still = _best_still(files)
        if still:
            out["hero_image"] = f"/assets/{slug}/{still.name}"

    # Non-proposal video (if any)
    vid = _best_video(files)
    if vid and vid.stat().st_size < 30_000_000:  # don't auto-set huge videos
        out["video"] = f"/assets/{slug}/{vid.name}"

    # Proposal video (explicit override only)
    if overrides.get("video_proposal"):
        # Verify file exists
        vp_path = PROJECT_ROOT / "public" / overrides["video_proposal"].lstrip("/")
        if vp_path.exists():
            out["video_proposal"] = overrides["video_proposal"]

    # Build images list (excluding hero, proposal video, and diagram-y filenames).
    image_paths = []
    hero_name = Path(out.get("hero_image", "")).name if out.get("hero_image") else ""
    for p in files:
        cls = _ext_class(p)
        if cls not in {"image", "gif"}:
            continue
        if p.name == hero_name:
            continue
        if _is_diagram(p.name):
            continue
        # Skip the small participant-journey raster maps from semantic-canvas?
        # Keep them — interesting visual variety.
        image_paths.append(f"/assets/{slug}/{p.name}")

    # Sort: GIFs first, then by size desc.
    image_paths.sort(key=lambda s: (
        0 if s.endswith(".gif") else 1,
        -(ASSETS_OUT / slug / Path(s).name).stat().st_size,
    ))

    # Cap at 24 to keep frontmatter sane.
    out["images"] = image_paths[:24]

    return out


# ---------------------------------------------------------------------------
# Frontmatter splice (line-based, surgical).

FM_KEYS_TO_SET = ["hero_image", "gif_hero", "video", "video_proposal",
                  "images", "_hero_curated"]


def update_frontmatter(md_path: Path, updates: dict) -> bool:
    """Surgically update the listed keys inside the YAML frontmatter.

    - Removes any existing top-level lines for the keys, then inserts new ones
      just before the closing '---'.
    - For 'images' we always emit a block-style list.
    - All other keys go inline.
    Returns True if the file was modified.
    """
    text = md_path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        sys.stderr.write(f"  ! {md_path.name}: no frontmatter; skipping\n")
        return False
    end = text.find("\n---", 3)
    if end == -1:
        sys.stderr.write(f"  ! {md_path.name}: unterminated frontmatter; skipping\n")
        return False

    fm_block = text[3:end].strip("\n")
    body = text[end + 4:]  # leading newline already consumed by find pattern

    keys_to_remove = set(FM_KEYS_TO_SET) | {"hero_image", "gif_hero",
                                            "video", "video_proposal", "images"}
    new_lines: list[str] = []
    skip_block = False
    for line in fm_block.split("\n"):
        if skip_block:
            # Continue skipping list/indented-block entries
            if line.startswith("  ") or line.lstrip().startswith("- "):
                continue
            skip_block = False
        m = re.match(r"^([a-zA-Z_][a-zA-Z0-9_]*)\s*:", line)
        if m:
            key = m.group(1)
            if key in keys_to_remove:
                # Skip this scalar OR start skipping its block.
                rest = line[m.end():].strip()
                if rest == "":
                    # likely block-scalar: skip subsequent indented/dash lines.
                    skip_block = True
                continue
        new_lines.append(line)

    # Strip trailing blank lines
    while new_lines and not new_lines[-1].strip():
        new_lines.pop()

    # Build the new key lines.
    inserted: list[str] = []
    if "hero_image" in updates:
        inserted.append(f"hero_image: {updates['hero_image']}")
    if "gif_hero" in updates:
        inserted.append(f"gif_hero: {updates['gif_hero']}")
    if "video" in updates:
        inserted.append(f"video: {updates['video']}")
    if "video_proposal" in updates:
        inserted.append(f"video_proposal: {updates['video_proposal']}")
    if "images" in updates and updates["images"]:
        inserted.append("images:")
        for img in updates["images"]:
            inserted.append(f"  - {img}")
    inserted.append("_hero_curated: true")

    new_fm = "\n".join(new_lines + inserted)
    new_text = "---\n" + new_fm + "\n---" + body
    if new_text == text:
        return False
    md_path.write_text(new_text, encoding="utf-8")
    return True


# ---------------------------------------------------------------------------
# Main

def main() -> int:
    md_files = sorted(CONTENT_DIR.glob("*.md"))
    if not md_files:
        sys.stderr.write(f"no .md files in {CONTENT_DIR}\n")
        return 1

    for md in md_files:
        slug = md.stem
        files = _list_assets(slug)
        sel = select_hero(slug, files)
        hero_filename = (
            Path(sel.get("hero_image", "")).name if sel.get("hero_image") else "(none)"
        )
        hero_class = "gif" if sel.get("gif_hero") else (
            "image" if sel.get("hero_image") else "missing"
        )
        n_images = len(sel.get("images", []))
        update_frontmatter(md, sel)
        print(f"[hero] {slug}: hero={hero_filename} ({hero_class}), {n_images} images total")

    return 0


if __name__ == "__main__":
    sys.exit(main())
