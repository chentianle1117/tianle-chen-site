#!/usr/bin/env python
"""Asset inventory for tianle-chen-site rebuild. Read-only except final manifest write."""
import os
import re
import json
import datetime
from pathlib import Path
from PIL import Image

Image.MAX_IMAGE_PIXELS = 300_000_000

VAULT = Path(r"W:\SecondBrain")
SITE = Path(r"W:\tianle-chen-site")
PORTFOLIO = VAULT / "Portfolio"
ASSETS = PORTFOLIO / "_assets"
SITE_PROJECTS = SITE / "src" / "content" / "projects"
EXTERNAL_CMU = Path(r"W:\CMU_Academics")
OUT = SITE / ".research" / "asset-manifest.json"

# Site slug -> asset folder name -> source MD basename in Portfolio (without .md)
SLUGS = [
    "3t3d-vit-2d-to-3d",
    "a-game-of-deterioration",
    "aurora-citadel-gen-game",
    "design-the-ambience",
    "fiber-based-pavilion",
    "generative-urbanism",
    "l43d-cad-mllm",
    "live-ai-feedback-design-assistant",
    "membrane-form-finding",
    "s25-team-26-paper-viz",
    "semantic-canvas",
    "skill-bridge-datavis",
    "spectral-facades",
    "synthetic-texture-deterioration",
    "thesis-flagship",
    "wire-bending",
]

# Mapping: site slug -> asset folder name in Portfolio/_assets/
ASSET_FOLDER = {
    "3t3d-vit-2d-to-3d": "3t3d",
    "a-game-of-deterioration": "a-game-of-deterioration",
    "aurora-citadel-gen-game": "aurora-citadel",
    "design-the-ambience": "design-the-ambience",
    "fiber-based-pavilion": "fiber-based-pavilion",
    "generative-urbanism": "generative-urbanism",
    "l43d-cad-mllm": "l43d-cad-mllm",
    "live-ai-feedback-design-assistant": "live-ai-feedback",
    "membrane-form-finding": "membrane-form-finding",
    "s25-team-26-paper-viz": "s25-team-26",
    "semantic-canvas": "semantic-canvas",
    "skill-bridge-datavis": "skill-bridge-datavis",
    "spectral-facades": "spectral-facades",
    "synthetic-texture-deterioration": "synthetic-texture-deterioration",
    "thesis-flagship": "thesis",
    "wire-bending": "wire-bending",
}

# Mapping: site slug -> source MD filename in Portfolio/
SOURCE_MD = {
    "3t3d-vit-2d-to-3d": "2025-Spring--3t3d-vit-2d-to-3d.md",
    "a-game-of-deterioration": "2024-Fall--a-game-of-deterioration.md",
    "aurora-citadel-gen-game": "2025-Spring--aurora-citadel-gen-game.md",
    "design-the-ambience": "2024-Fall--design-the-ambience.md",
    "fiber-based-pavilion": "2021-2024-Rice--fiber-based-pavilion.md",
    "generative-urbanism": "2025-Spring--generative-urbanism.md",
    "l43d-cad-mllm": "2025-Fall--l43d-cad-mllm.md",
    "live-ai-feedback-design-assistant": "2025-Spring--live-ai-feedback-design-assistant.md",
    "membrane-form-finding": "2021-2024-Rice--membrane-form-finding.md",
    "s25-team-26-paper-viz": "2025-Spring--s25-team-26-paper-viz.md",
    "semantic-canvas": "2025-Fall--semantic-canvas-thesis-tool.md",
    "skill-bridge-datavis": "2024-Fall--skill-bridge-datavis.md",
    "spectral-facades": "2024-Fall--spectral-facades.md",
    "synthetic-texture-deterioration": "2024-Fall--synthetic-texture-deterioration.md",
    "thesis-flagship": "2025-2026--thesis-flagship.md",
    "wire-bending": "2024-Fall--wire-bending-mixed-reality.md",
}

# Search keywords per slug for cross-vault discovery
KEYWORDS = {
    "3t3d-vit-2d-to-3d": ["3t3d", "triplane", "vit-2d-to-3d", "L43D_HW3", "16825_final"],
    "a-game-of-deterioration": ["deterioration", "Stream Diffusion", "stream-diffusion", "spectralfacade", "papercube"],
    "aurora-citadel-gen-game": ["aurora", "citadel", "62706"],
    "design-the-ambience": ["ambience", "physarum", "ai-design-assistant", "AI_Feedback"],
    "fiber-based-pavilion": ["fiber", "pavilion", "iass", "cnt"],
    "generative-urbanism": ["generative-urbanism", "urbanism", "11685"],
    "l43d-cad-mllm": ["l43d", "cad-mllm", "cad_mllm", "16825_final", "Learning for 3D Vision/CMU16825"],
    "live-ai-feedback-design-assistant": ["live_ai", "live-ai", "ai-feedback", "ai_feedback", "ai-design-assistant", "Live_AI_Feedback", "AI_Feedback_demo", "live-api-web-console"],
    "membrane-form-finding": ["membrane"],
    "s25-team-26-paper-viz": ["team-26", "team_26", "paper-viz", "17637"],
    "semantic-canvas": ["semantic_canvas", "semantic-canvas", "Thesis Demo", "Thesis_Material"],
    "skill-bridge-datavis": ["skill-bridge", "skill_bridge", "datavis", "Data Visualization", "DataViz-aijobs"],
    "spectral-facades": ["spectral-facade", "spectral_facade", "spectral", "papercube", "Stream Diffusion", "Mapping and TouchDesigner"],
    "synthetic-texture-deterioration": ["synthetic-texture", "synthetic_texture", "facade-aging"],
    "thesis-flagship": ["pre-thesis", "pre_thesis", "thesis_proposal", "worldmaking", "Pre-thesis I", "Pre-thesis II"],
    "wire-bending": ["wire-bending", "wire_bending", "fologram", "hololens", "Fologram Research"],
}

MEDIA_EXTS = {".gif", ".mp4", ".webm", ".mov", ".png", ".jpg", ".jpeg", ".webp"}
PDF_DOC_EXTS = {".pdf", ".docx"}
IMG_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
VIDEO_EXTS = {".mp4", ".webm", ".mov"}

def get_dimensions(path):
    if path.suffix.lower() not in IMG_EXTS:
        return None
    try:
        with Image.open(path) as im:
            return [im.width, im.height]
    except Exception:
        return None

def parse_frontmatter(text):
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    fm_raw = parts[1]
    body = parts[2].lstrip("\n")
    fm = {}
    cur_key = None
    cur_list = None
    for line in fm_raw.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("- ") and cur_list is not None:
            cur_list.append(stripped[2:].strip().strip('"').strip("'"))
            continue
        m = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$", line)
        if m:
            cur_key = m.group(1)
            val = m.group(2).strip()
            if val == "":
                cur_list = []
                fm[cur_key] = cur_list
            elif val == "[]":
                fm[cur_key] = []
                cur_list = None
            elif val.startswith("[") and val.endswith("]"):
                inside = val[1:-1].strip()
                if inside == "":
                    fm[cur_key] = []
                else:
                    fm[cur_key] = [s.strip().strip('"').strip("'") for s in inside.split(",")]
                cur_list = None
            else:
                cur_list = None
                v = val.strip().strip('"').strip("'")
                if v.lower() == "true":
                    fm[cur_key] = True
                elif v.lower() == "false":
                    fm[cur_key] = False
                else:
                    try:
                        fm[cur_key] = int(v)
                    except ValueError:
                        fm[cur_key] = v
    return fm, body

def word_count(text):
    text = re.sub(r"```[\s\S]*?```", "", text)
    text = re.sub(r"!\[\[[^\]]+\]\]", "", text)
    text = re.sub(r"\[\[[^\]]+\]\]", "", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    text = re.sub(r"#+\s+", "", text)
    return len(re.findall(r"\b\w+\b", text))

def extract_wikilinks(text):
    return re.findall(r"\[\[([^\]\|]+)(?:\|[^\]]+)?\]\]", text)

def file_record(path, slug_assets_dir):
    s = path.stat()
    rec = {
        "path": str(path).replace("/", "\\"),
        "filename": path.name,
        "type": path.suffix.lower().lstrip("."),
        "size_bytes": s.st_size,
        "dimensions": get_dimensions(path),
        "in_portfolio_assets_dir": str(path).startswith(str(ASSETS)),
        "relative_to_portfolio_assets": (slug_assets_dir is not None and slug_assets_dir in path.parents),
    }
    return rec

def walk_files(root, exts, max_files=2000, exclude_subs=None):
    out = []
    if not root.exists():
        return out
    exclude_subs = exclude_subs or set()
    for dirpath, dirnames, filenames in os.walk(root):
        # Filter excluded dirs
        dirnames[:] = [d for d in dirnames if d not in {".git", "node_modules", "dist", ".next", "__pycache__", ".venv"}]
        for fn in filenames:
            p = Path(dirpath) / fn
            if p.suffix.lower() in exts:
                out.append(p)
                if len(out) >= max_files:
                    return out
    return out

_CANDIDATE_CACHE = None

def get_all_candidates():
    """Walk the relevant trees once and cache candidate file list."""
    global _CANDIDATE_CACHE
    if _CANDIDATE_CACHE is not None:
        return _CANDIDATE_CACHE
    out = []
    EXCLUDE = {".git", "node_modules", "dist", ".next", "__pycache__", ".venv",
               "Thesis_Vault_ARCHIVED_20260420", "ut-zap50k-data", "ut-zap50k-feats",
               "ut-zap50k-images", "ut-zap50k-images-square", "ut-zap50k-lexi",
               "$RECYCLE.BIN", "DerivedDataCache",
               # Engine and dataset noise
               "Saved", "Intermediate", "Binaries", "Plugins", "Content",
               "Omni-CAD", "Omni-CAD-subset", "render", "thumbs",
               "ExportBlock-2a39f135-1777-4084-bec7-638f1768b9c6-Part-1",
               "1d2d15ed-0881-428a-ab7a-8683bab9e66b_ExportBlock-8257c678-733d-4e89-8e45-4e21394d7d45.zip",
               "build", "resources", "3rd_party", "data",
               "study_backup_2026-04-02_1411.tar.gz",
               "longitudinal", "ThesisVault", "User Test Session",
               "advisor_meetings", "user_study_data", "audits", "post_thesis"}
    SKIP_NAMES = {"icon.png", "thumbnail.png", "favicon.png", "logo.png"}
    exts = MEDIA_EXTS | PDF_DOC_EXTS
    roots = [EXTERNAL_CMU, VAULT / "Captures", VAULT / "Career",
             VAULT / "Archive", VAULT / "MSCD_Thesis", VAULT / "Workflows"]
    for root in roots:
        if not root.exists():
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE]
            for fn in filenames:
                if fn.lower() in SKIP_NAMES:
                    continue
                p = Path(dirpath) / fn
                if p.suffix.lower() in exts:
                    out.append(p)
    _CANDIDATE_CACHE = out
    print(f"  [cached {len(out)} candidate files]")
    return out

PROJECT_ROOT_HINTS = {
    "live-ai-feedback-design-assistant": [
        r"W:\CMU_Academics\2025 Spring\Independent Study gen Model",
    ],
    "design-the-ambience": [
        # design-the-ambience is from Fall 2024 CMU Independent Study
        r"W:\CMU_Academics\Fall 2024 CMU\Independent Study",
    ],
    "membrane-form-finding": [
        r"W:\CMU_Academics\2021 Spring\Carbon Nanotube Research",
    ],
    "synthetic-texture-deterioration": [
        # part of TouchDesigner final project chain
        r"W:\CMU_Academics\Fall 2024 CMU\Mapping and TouchDesigner",
    ],
    "wire-bending": [
        r"W:\CMU_Academics\Fall 2024 CMU\Fologram Research",
    ],
    "semantic-canvas": [
        r"W:\CMU_Academics\2025 Fall\Thesis",
        r"W:\CMU_Academics\2025 Fall\Thesis Demo",
        r"W:\CMU_Academics\2025 Fall\Pre-thesis II",
    ],
    "thesis-flagship": [
        r"W:\CMU_Academics\2025 Spring\Pre-thesis I",
        r"W:\CMU_Academics\2025 Fall\Pre-thesis II",
    ],
    "aurora-citadel-gen-game": [
        r"W:\CMU_Academics\2025 Spring\62706 Gen Game\Aurora Citadel",
    ],
    "l43d-cad-mllm": [
        r"W:\CMU_Academics\2025 Fall\Learning for 3D Vision\CMU16825_Final_project",
    ],
    "3t3d-vit-2d-to-3d": [
        r"W:\CMU_Academics\2025 Fall\Learning for 3D Vision\final project",
    ],
    "skill-bridge-datavis": [
        r"W:\CMU_Academics\Fall 2024 CMU\Data Visualization",
    ],
    "spectral-facades": [
        r"W:\CMU_Academics\Fall 2024 CMU\Mapping and TouchDesigner\Final Project",
    ],
    "fiber-based-pavilion": [
        r"W:\CMU_Academics\2021 Spring\Carbon Nanotube Research",
        r"W:\CMU_Academics\2022 Spring\Carbon Nanotube Research",
    ],
    "generative-urbanism": [
        r"W:\CMU_Academics\2025 Spring\11685 Intro to DL\Final Projects Models",
    ],
    "s25-team-26-paper-viz": [
        r"W:\CMU_Academics\2025 Spring\17637 Web App Dev",
    ],
    "a-game-of-deterioration": [
        # Fall 2024 part of an art/touchdesigner project — uncertain location
    ],
}

def search_external(slug, keywords):
    """Find media files outside Portfolio/_assets matching keywords."""
    found = []
    candidates = get_all_candidates()
    # case-insensitive substring matching against full path, considering both raw and normalized forms
    kws_raw = [k.lower() for k in keywords]
    kws_norm = [re.sub(r"[-_\s]", "", k.lower()) for k in keywords]
    seen = set()
    for c in candidates:
        sp = str(c)
        sp_lower = sp.lower()
        sp_norm = re.sub(r"[-_\s]", "", sp_lower)
        match = any(kw in sp_lower for kw in kws_raw) or any(kw in sp_norm for kw in kws_norm)
        if not match:
            continue
        if sp in seen:
            continue
        seen.add(sp)
        # Skip a few obvious noise sources
        # Skip clear noise paths
        noise_patterns = [
            "__pycache__", "node_modules", ".git\\", "/.git/",
            "thesis_vault_archived",
            "venv\\lib\\site-packages", "site-packages",
            "\\3rd_party\\", "\\3rd-party\\",
            "papers\\",  # reference papers, not assets
            "\\thumbs\\", "\\thumb\\",
            "feedback_history\\",  # generated session output
            "examples\\", "example_images\\",  # 3rd party model examples
            "checkpoints\\", "weights\\", "logs\\",
            "matplotlib", "win32com",
            "ut-zap50k",
            "/$recycle.bin/", "\\$recycle.bin\\",
            "untitled.canvas",
        ]
        if any(noise in sp_lower for noise in noise_patterns):
            continue
        # Skip files larger than 100MB to keep manifest manageable
        try:
            sz = c.stat().st_size
        except Exception:
            continue
        if sz > 100_000_000:
            continue
        found.append({
            "path": sp,
            "filename": c.name,
            "type": c.suffix.lower().lstrip("."),
            "size_bytes": sz,
            "dimensions": get_dimensions(c),
            "context": str(c.parent),
        })
        if len(found) >= 200:
            break
    return found

def inventory_project(slug):
    asset_folder = ASSETS / ASSET_FOLDER[slug]
    src_md = PORTFOLIO / SOURCE_MD[slug]
    site_md = SITE_PROJECTS / f"{slug}.md"

    result = {
        "frontmatter": {},
        "all_assets": [],
        "external_assets": [],
        "body": {},
        "source_md": str(src_md),
        "site_md": str(site_md),
    }

    # Site MD frontmatter and body
    site_fm = {}
    site_body = ""
    if site_md.exists():
        try:
            txt = site_md.read_text(encoding="utf-8", errors="replace")
            site_fm, site_body = parse_frontmatter(txt)
        except Exception as e:
            site_fm = {"error": str(e)}

    # Source MD frontmatter and body
    src_fm = {}
    src_body = ""
    if src_md.exists():
        try:
            txt2 = src_md.read_text(encoding="utf-8", errors="replace")
            src_fm, src_body = parse_frontmatter(txt2)
        except Exception as e:
            src_fm = {"error": str(e)}

    # Frontmatter summary
    result["frontmatter"] = {
        "title": site_fm.get("title") or src_fm.get("title"),
        "year": site_fm.get("year") or src_fm.get("year"),
        "categories": site_fm.get("categories") or src_fm.get("categories"),
        "course": src_fm.get("course"),
        "semester": src_fm.get("semester"),
        "current_hero_image": site_fm.get("hero_image"),
        "current_video": site_fm.get("video"),
        "current_images_count": len(site_fm.get("images") or []),
        "site_status": site_fm.get("status"),
        "publishable": site_fm.get("publishable"),
    }

    # All assets in slug folder
    if asset_folder.exists():
        for p in sorted(asset_folder.iterdir()):
            if p.is_file() and p.suffix.lower() in (MEDIA_EXTS | PDF_DOC_EXTS | {".ipynb"}):
                result["all_assets"].append(file_record(p, asset_folder))

    # External assets (outside _assets/<slug>/)
    result["external_assets"] = search_external(slug, KEYWORDS[slug])
    # Project root dir hints (where downstream agents should browse for richer assets)
    result["project_root_hints"] = []
    for hint in PROJECT_ROOT_HINTS.get(slug, []):
        hp = Path(hint)
        if hp.exists():
            # Surface top-level media files (one-deep)
            top_media = []
            try:
                for p in hp.iterdir():
                    if p.is_file() and p.suffix.lower() in (MEDIA_EXTS | PDF_DOC_EXTS):
                        try:
                            top_media.append({
                                "path": str(p),
                                "filename": p.name,
                                "type": p.suffix.lower().lstrip("."),
                                "size_bytes": p.stat().st_size,
                                "dimensions": get_dimensions(p) if p.suffix.lower() in IMG_EXTS else None,
                            })
                        except Exception:
                            pass
            except Exception:
                pass
            result["project_root_hints"].append({
                "path": str(hp),
                "exists": True,
                "top_level_media": top_media,
            })

    # Body completeness
    src_wc = word_count(src_body) if src_body else 0
    site_wc = word_count(site_body) if site_body else 0
    subsidiary = []
    if src_body:
        for link in extract_wikilinks(src_body):
            subsidiary.append(link.strip())
    appears_thin = site_wc < 200
    vault_more = src_wc > site_wc + 100
    result["body"] = {
        "current_word_count": site_wc,
        "vault_source_word_count": src_wc,
        "appears_thin": appears_thin,
        "vault_has_more_content": vault_more,
        "subsidiary_note_paths": subsidiary[:50],
    }
    return result

def cv_inventory():
    md_paths = []
    for p in (VAULT / "Career" / "Resumes").glob("*.md"):
        md_paths.append(str(p))
    pdf_paths = []
    # Search in vault and W:/CMU_Academics
    pdf_search_roots = [VAULT, EXTERNAL_CMU, Path("W:/")]
    seen_pdf = set()
    for root in pdf_search_roots:
        if not root.exists():
            continue
        max_depth = 1 if root == Path("W:/") else 6
        root_str_len = len(str(root))
        for dirpath, dirnames, filenames in os.walk(root):
            depth = dirpath[root_str_len:].count(os.sep)
            if depth > max_depth:
                dirnames[:] = []
                continue
            dirnames[:] = [d for d in dirnames if d not in {".git", "node_modules", ".next", "$RECYCLE.BIN", "Bin64", "Lock", "Config.Msi", "OneDriveTemp", "Packages", "QQMusicCache", "BaiduNetdiskDownload"}]
            for fn in filenames:
                low = fn.lower()
                if not (low.endswith(".pdf") or low.endswith(".docx")):
                    continue
                if any(k in low for k in ["resume", "cv", "tianle"]):
                    sp = str(Path(dirpath) / fn)
                    if sp not in seen_pdf:
                        seen_pdf.add(sp)
                        pdf_paths.append(sp)

    md_summary = {}
    md_canonical = VAULT / "Career" / "Resumes" / "Tianle_Chen_Resume_2026-04.md"
    if md_canonical.exists():
        txt = md_canonical.read_text(encoding="utf-8", errors="replace")
        fm, body = parse_frontmatter(txt)
        md_summary["word_count"] = word_count(body)
        md_summary["sections"] = re.findall(r"^##+\s+(.+)$", body, flags=re.MULTILINE)

    # A David-Chen-specific recent PDF must NOT be Jamie's, must mention Tianle/David/resume, and have 2025/2026
    def is_david_recent(p):
        low = p.lower()
        if "jamie" in low or "yi-chieh" in low or "cheng" in low.replace("chen", ""):
            return False
        is_resume = ("resume" in low) or ("cv" in low) or ("tianle" in low)
        if not is_resume:
            return False
        return ("2026" in p) or ("2025" in p and ("tianle" in low or "david" in low or "_2025" in p))
    have_recent_pdf = any(is_david_recent(p) for p in pdf_paths)
    david_recent = [p for p in pdf_paths if is_david_recent(p)]
    return {
        "markdown_paths": md_paths,
        "pdf_paths": pdf_paths,
        "david_recent_pdfs": david_recent,
        "markdown_summary": md_summary,
        "needs_pdf_generation": not have_recent_pdf,
    }

def parse_timeline():
    entries = []
    sources_used = []

    # Extract from Career/Experience notes (canonical)
    exp_dir = VAULT / "Career" / "Experience"
    if exp_dir.exists():
        for p in exp_dir.glob("*.md"):
            sources_used.append(str(p))
            txt = p.read_text(encoding="utf-8", errors="replace")
            fm, body = parse_frontmatter(txt)
            # Heuristic: pull dates from filename pattern (YYYY-YYYY) or (YYYY-Present)
            name = p.stem
            m = re.search(r"\((\d{4})\s*-\s*(\d{4}|Present)\)", name)
            date_start = None
            date_end = None
            if m:
                date_start = m.group(1)
                date_end = m.group(2)
            else:
                # Try to find single year
                m2 = re.search(r"\((\d{4})\)", name)
                if m2:
                    date_start = m2.group(1)
                    date_end = m2.group(1)
            # Also pull dates from frontmatter if present
            if fm.get("start_date"):
                date_start = str(fm["start_date"])
            if fm.get("end_date"):
                date_end = str(fm["end_date"])
            # Try to parse role/org from filename like "HILOS Studio — Fellow to Full-Time (2025-2026)"
            head = re.sub(r"\s*\([^)]+\)\s*$", "", name)
            parts = re.split(r"\s+[—-]\s+", head, maxsplit=1)
            org = parts[0].strip() if parts else name
            role = parts[1].strip() if len(parts) > 1 else None
            entries.append({
                "date_start": date_start,
                "date_end_or_present": date_end,
                "role": role,
                "organization": org,
                "location": fm.get("location"),
                "summary": (body[:300].replace("\n", " ").strip() if body else None),
                "source_paths": [str(p)],
            })

    # Add Resume canonical source
    resume_md = VAULT / "Career" / "Resumes" / "Tianle_Chen_Resume_2026-04.md"
    if resume_md.exists():
        sources_used.append(str(resume_md))
    return entries, sources_used

def thesis_extras():
    extras = {
        "additional_writeup_paths": [],
        "tool_screenshots": [],
        "tool_videos": [],
        "shoe_outputs": [],
        "thesis_chapters": [],
        "thesis_figures_dir": None,
    }
    # Vault MSCD_Thesis chapters
    chapters = VAULT / "MSCD_Thesis" / "Chapters"
    if chapters.exists():
        for p in chapters.glob("*.md"):
            extras["thesis_chapters"].append(str(p))
    # Concepts
    concepts = VAULT / "MSCD_Thesis" / "Concepts"
    if concepts.exists():
        for p in concepts.glob("*.md"):
            extras["additional_writeup_paths"].append(str(p))

    # Thesis Writeup figures from CMU_Academics
    figdir1 = EXTERNAL_CMU / "2025 Fall" / "Thesis" / "Thesis_Writeup" / "figures"
    figdir2 = EXTERNAL_CMU / "2025 Fall" / "Thesis Demo" / "Thesis_Material" / "figures"
    extras["thesis_figures_dir"] = str(figdir1)

    tool_keywords = ["UI", "interface", "axis", "canvas", "agent", "lineage", "ghost_node", "BLS_interface", "diagram", "pipeline", "architecture", "config_space", "system_timeline"]
    shoe_keywords = ["shoe", "nano_generated", "fashion_interface", "deeprise", "form_forge"]

    for figdir in [figdir1, figdir2]:
        if not figdir.exists():
            continue
        for dirpath, dirnames, filenames in os.walk(figdir):
            for fn in filenames:
                p = Path(dirpath) / fn
                ext = p.suffix.lower()
                if ext in IMG_EXTS:
                    rec = {"path": str(p), "filename": fn, "size_bytes": p.stat().st_size, "dimensions": get_dimensions(p)}
                    fn_lower = fn.lower()
                    if any(k.lower() in fn_lower for k in shoe_keywords):
                        extras["shoe_outputs"].append(rec)
                    elif any(k.lower() in fn_lower for k in tool_keywords):
                        extras["tool_screenshots"].append(rec)
                    else:
                        extras["tool_screenshots"].append(rec)  # default to tool category
                elif ext in VIDEO_EXTS:
                    extras["tool_videos"].append({"path": str(p), "filename": fn, "size_bytes": p.stat().st_size})
                elif ext in {".pdf", ".md"}:
                    extras["additional_writeup_paths"].append(str(p))

    # Search for additional thesis videos in CMU_Academics tree (multiple dirs)
    for thesis_root in [
        EXTERNAL_CMU / "2025 Fall" / "Thesis",
        EXTERNAL_CMU / "2025 Fall" / "Thesis Demo",
        EXTERNAL_CMU / "2025 Fall" / "Pre-thesis II",
    ]:
        if not thesis_root.exists():
            continue
        for dirpath, dirnames, filenames in os.walk(thesis_root):
            dirnames[:] = [d for d in dirnames if d not in {"node_modules", ".git", "Thesis_Vault_ARCHIVED_20260420", "ut-zap50k-data", "ut-zap50k-feats", "ut-zap50k-images", "ut-zap50k-images-square", "ut-zap50k-lexi", "longitudinal", "user_study_data", "ThesisVault"}]
            for fn in filenames:
                p = Path(dirpath) / fn
                ext = p.suffix.lower()
                if ext in VIDEO_EXTS:
                    try:
                        sz = p.stat().st_size
                    except Exception:
                        continue
                    extras["tool_videos"].append({"path": str(p), "filename": fn, "size_bytes": sz})

    return extras

def main():
    out = {
        "generated_at": datetime.datetime.now().isoformat(),
        "projects": {},
        "cv": {},
        "timeline": [],
        "timeline_source_paths": [],
        "thesis_extras": {},
        "anomalies": [],
    }

    print("Inventorying projects...")
    for slug in SLUGS:
        print(f"  - {slug}")
        out["projects"][slug] = inventory_project(slug)

    print("CV inventory...")
    out["cv"] = cv_inventory()

    print("Timeline...")
    entries, srcs = parse_timeline()
    out["timeline"] = entries
    out["timeline_source_paths"] = srcs

    print("Thesis extras...")
    out["thesis_extras"] = thesis_extras()

    # Anomalies
    anomalies = []
    if (PORTFOLIO / SOURCE_MD["thesis-flagship"]).exists() and (PORTFOLIO / SOURCE_MD["semantic-canvas"]).exists():
        anomalies.append("thesis-flagship.md and semantic-canvas.md both reference the thesis. semantic-canvas appears to be the tool/system; thesis-flagship the umbrella project. Curators must decide whether to merge or differentiate.")
    # Empty asset dirs
    for slug, folder_name in ASSET_FOLDER.items():
        d = ASSETS / folder_name
        if d.exists() and not any(d.iterdir()):
            anomalies.append(f"{slug}: _assets/{folder_name}/ is empty — no thumbnails synced. Likely needs sourcing from CMU_Academics or HILOS captures.")
    # Hilos source MDs orphaned (no site equivalent)
    for hilos_md in PORTFOLIO.glob("2025-2026--hilos*.md"):
        anomalies.append(f"Vault has {hilos_md.name} but it's not in publishable site slugs. May be intentional (HILOS work hidden), confirm.")
    # check thumb mismatch known issue: thesis-flagship hero
    th_fm = out["projects"]["thesis-flagship"]["frontmatter"]
    if th_fm.get("current_hero_image"):
        if "shoe" in str(th_fm.get("current_hero_image")).lower() or "nano" in str(th_fm.get("current_hero_image")).lower():
            anomalies.append("thesis-flagship hero image appears to be a shoe output, not the canvas tool — user flagged this explicitly")
    sc_fm = out["projects"]["semantic-canvas"]["frontmatter"]
    if sc_fm.get("current_hero_image"):
        anomalies.append(f"semantic-canvas current hero: {sc_fm.get('current_hero_image')} (verify it shows tool, not shoe output)")
    # Detect 0-byte video files
    for v in out["thesis_extras"].get("tool_videos", []):
        if v.get("size_bytes") == 0:
            anomalies.append(f"Thesis video appears to be a 0-byte placeholder: {v['path']}")
    # CV note
    if out["cv"]["needs_pdf_generation"]:
        anomalies.append("CV: no recent (2025/2026) David Chen PDF found. Need to generate from Career/Resumes/Tianle_Chen_Resume_2026-04.md.")
    # Hero image filenames that look like a single shoe (user flagged)
    for slug, p in out["projects"].items():
        hero = (p["frontmatter"].get("current_hero_image") or "")
        if hero and any(k in hero.lower() for k in ["shoe", "footwear", "nano", "boot"]):
            anomalies.append(f"{slug} hero image filename suggests shoe output: {hero}")
    out["anomalies"] = anomalies

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)

    # Print short summary
    total_assets = sum(len(p["all_assets"]) for p in out["projects"].values())
    counts = sorted(len(p["all_assets"]) for p in out["projects"].values())
    n = len(counts)
    median = counts[n//2]
    bodies = [(s, p["body"]["current_word_count"]) for s, p in out["projects"].items()]
    bodies.sort(key=lambda x: x[1])
    print(f"\nSUMMARY:")
    print(f"  Total assets indexed: {total_assets}")
    print(f"  Per-project min/median/max: {min(counts)}/{median}/{max(counts)}")
    print(f"  Top 3 thinnest: {bodies[:3]}")
    print(f"  CV PDFs found: {len(out['cv']['pdf_paths'])}")
    print(f"  Needs PDF generation: {out['cv']['needs_pdf_generation']}")
    print(f"  Thesis tool screenshots: {len(out['thesis_extras']['tool_screenshots'])}")
    print(f"  Anomalies: {len(out['anomalies'])}")

if __name__ == "__main__":
    main()
