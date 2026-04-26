"""Precompute 4 layouts (thesis_default, umap, pca, metadata) for the
Three.js latent-space hero. Writes public/data/layouts.json.

The thesis_default layout uses preset semantic axes (text endpoints),
re-embedded by the same model used for projects so the dot products
are meaningful. Three additional axis pairs are cached so the runtime
can swap axes client-side.
"""

from __future__ import annotations

import json
import os
import sys
import traceback
from pathlib import Path
from typing import Dict, List

import numpy as np
from PIL import Image

# Defensive PIL caps — set BEFORE any image opens.
Image.MAX_IMAGE_PIXELS = 300_000_000

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _embed_common import (  # noqa: E402
    DATA_DIR,
    embed_texts,
    jina_available,
    jina_embed,
    load_clip_model,
    normalize,
)


# ----------------------------------------------------------------------------
# Axis presets
# ----------------------------------------------------------------------------

THESIS_DEFAULT_AXES = [
    {
        "key": "x_ml_design",
        "labels": ["ML/Code", "Design/Physical"],
        "pos": "machine learning, AI, neural networks, code",
        "neg": "physical design, architecture, fabrication",
    },
    {
        "key": "y_research_play",
        "labels": ["Research", "Play"],
        "pos": "research, academic, formal",
        "neg": "playful, exploratory, generative",
    },
    {
        "key": "z_student_production",
        "labels": ["Student", "Production"],
        "pos": "early career, student work",
        "neg": "production-ready, deployed system",
    },
]

EXTRA_AXES = [
    {
        "key": "x_artifact_system",
        "labels": ["Artifact", "System"],
        "pos": "concrete artifact, fabricated object",
        "neg": "interactive system, software tool",
    },
    {
        "key": "x_solo_team",
        "labels": ["Solo", "Team"],
        "pos": "solo individual contribution",
        "neg": "team collaborative project",
    },
    {
        "key": "x_screen_space",
        "labels": ["2D Screen", "3D Space"],
        "pos": "2D screen interface",
        "neg": "3D spatial environment",
    },
]


# Coarse domain mapping for the metadata layout.
ML_CATS = {
    "ml", "deep learning", "ai/ml", "ai", "generative 3d",
    "cad generation", "machine learning", "ml/ai",
}
ARCH_CATS = {
    "architecture", "parametric design", "digital fabrication",
    "urban planning", "projection mapping",
}
DESIGN_CATS = {
    "interactive tool", "interface design", "data visualization",
    "design research", "thesis", "digital interaction",
    "mixed reality", "web app", "3d visualization",
    "data engineering", "game", "procedural generation", "3d",
    "desktop app",
}


def _category_score(cats: List[str]) -> float:
    """Map categories → x in roughly [-1, +1]. ML negative, arch positive, design 0."""
    if not cats:
        return 0.0
    score = 0.0
    n = 0
    for c in cats:
        c_l = str(c).strip().lower()
        if c_l in ML_CATS:
            score += -1.0
            n += 1
        elif c_l in ARCH_CATS:
            score += 1.0
            n += 1
        elif c_l in DESIGN_CATS:
            score += 0.0
            n += 1
        else:
            # unknown — treat as neutral
            score += 0.0
            n += 1
    return score / max(1, n)


def _priority_score(prio: str) -> float:
    p = (prio or "standard").strip().lower()
    if p == "flagship":
        return 1.0
    if p in ("experimental", "draft"):
        return -1.0
    return 0.0


def _normalize_layout(coords: np.ndarray) -> np.ndarray:
    """Center and scale coords into [-1, 1]^d."""
    coords = np.asarray(coords, dtype=np.float32)
    coords = coords - coords.mean(axis=0, keepdims=True)
    m = float(np.max(np.abs(coords)))
    if m > 0:
        coords = coords / m
    return coords


# ----------------------------------------------------------------------------
# Axis embedding (model-aware)
# ----------------------------------------------------------------------------

def _embed_axis_directions(axes: List[dict], dim: int, model_name: str) -> Dict[str, np.ndarray]:
    """Return key → (dim,) unit-norm direction vector."""
    pos_texts = [a["pos"] for a in axes]
    neg_texts = [a["neg"] for a in axes]
    all_texts = pos_texts + neg_texts

    if model_name.startswith("jina") and jina_available():
        try:
            txt_emb, _ = jina_embed(all_texts, [])
        except Exception as e:
            print(f"[layout] Jina axis embed failed ({e}); using open-clip fallback")
            txt_emb = None
    else:
        txt_emb = None

    if txt_emb is None:
        clip = load_clip_model()
        if clip["dim"] != dim:
            print(
                f"[layout] WARNING: open-clip dim {clip['dim']} != "
                f"embeddings.dim {dim}. Axes will be projected in their own space."
            )
        txt_emb = embed_texts(clip, all_texts)

    txt_emb = normalize(txt_emb)
    n = len(axes)
    pos = txt_emb[:n]
    neg = txt_emb[n:]
    directions = normalize(pos - neg)

    out = {}
    for i, a in enumerate(axes):
        out[a["key"]] = directions[i]
    return out


def main() -> int:
    emb_path = DATA_DIR / "embeddings.json"
    if not emb_path.exists():
        print(f"[layout] missing {emb_path} — run embed_projects.py first")
        return 1

    with open(emb_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    projects = payload["projects"]
    dim = int(payload["dim"])
    model_name = payload.get("model", "")
    n = len(projects)
    print(f"[layout] {n} projects, dim={dim}, model={model_name}")

    E = np.array([p["embedding"] for p in projects], dtype=np.float32)  # (N, dim)
    slugs = [p["slug"] for p in projects]

    # ------------------------------------------------------------------
    # 1. UMAP
    # ------------------------------------------------------------------
    print("[layout] computing UMAP...")
    try:
        import umap
        n_neighbors = min(5, max(2, n - 1))
        reducer = umap.UMAP(
            n_components=3,
            n_neighbors=n_neighbors,
            min_dist=0.3,
            metric="cosine",
            random_state=42,
        )
        umap_coords = reducer.fit_transform(E)
    except Exception as e:
        print(f"  ! UMAP failed: {e}; using zeros")
        umap_coords = np.zeros((n, 3), dtype=np.float32)
    umap_coords = _normalize_layout(umap_coords)

    # ------------------------------------------------------------------
    # 2. PCA
    # ------------------------------------------------------------------
    print("[layout] computing PCA...")
    try:
        from sklearn.decomposition import PCA
        pca = PCA(n_components=3, random_state=42)
        pca_coords = pca.fit_transform(E)
    except Exception as e:
        print(f"  ! PCA failed: {e}; using zeros")
        pca_coords = np.zeros((n, 3), dtype=np.float32)
    pca_coords = _normalize_layout(pca_coords)

    # ------------------------------------------------------------------
    # 3. Metadata-deterministic layout
    # ------------------------------------------------------------------
    print("[layout] computing metadata layout...")
    meta_coords = np.zeros((n, 3), dtype=np.float32)
    for i, p in enumerate(projects):
        x = _category_score(p.get("categories") or [])
        year = p.get("year") or 2023
        try:
            year_i = int(year)
        except Exception:
            year_i = 2023
        y = (year_i - 2020) / 5.0 - 0.5
        z = _priority_score(p.get("priority", "standard"))
        meta_coords[i] = (x, y, z)
    meta_coords = _normalize_layout(meta_coords)

    # ------------------------------------------------------------------
    # 4. Thesis-default semantic-axis layout
    # ------------------------------------------------------------------
    print("[layout] computing thesis_default semantic axes...")
    all_axes = THESIS_DEFAULT_AXES + EXTRA_AXES
    directions = _embed_axis_directions(all_axes, dim=dim, model_name=model_name)

    # If a direction has wrong dim (model mismatch), skip thesis_default projection
    bad = [k for k, v in directions.items() if v.shape[0] != dim]
    if bad:
        print(f"  ! axis dim mismatch for {bad}; thesis_default falls back to PCA")
        thesis_coords = pca_coords.copy()
    else:
        thesis_coords = np.zeros((n, 3), dtype=np.float32)
        thesis_coords[:, 0] = E @ directions["x_ml_design"]
        thesis_coords[:, 1] = E @ directions["y_research_play"]
        thesis_coords[:, 2] = E @ directions["z_student_production"]
        thesis_coords = _normalize_layout(thesis_coords)

    # ------------------------------------------------------------------
    # Build payload
    # ------------------------------------------------------------------
    def to_dict(coords: np.ndarray) -> Dict[str, List[float]]:
        return {slugs[i]: [float(coords[i, 0]), float(coords[i, 1]), float(coords[i, 2])] for i in range(n)}

    axes_cache: Dict[str, dict] = {}
    for a in all_axes:
        d = directions.get(a["key"])
        axes_cache[a["key"]] = {
            "labels": a["labels"],
            "pos": a["pos"],
            "neg": a["neg"],
            "direction": (d.astype(float).tolist() if d is not None and d.shape[0] == dim else None),
        }

    out = {
        "model": model_name,
        "dim": dim,
        "thesis_default": to_dict(thesis_coords),
        "umap": to_dict(umap_coords),
        "pca": to_dict(pca_coords),
        "metadata": to_dict(meta_coords),
        "thesis_axes_cache": axes_cache,
    }

    out_path = DATA_DIR / "layouts.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))

    size_kb = out_path.stat().st_size / 1024
    print(f"[layout] wrote {out_path}  ({size_kb:.1f} KB)")
    print(f"[layout] layouts: thesis_default, umap, pca, metadata + {len(axes_cache)} axis directions")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        traceback.print_exc()
        sys.exit(1)
