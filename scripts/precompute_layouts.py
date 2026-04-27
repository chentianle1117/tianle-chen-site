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
    # Round-9m: rewrote the default axis pool. The previous defaults had
    # weak / collapsed spread on the actual project corpus (everything
    # bunched on one side of "Research/Play" and "Student/Production").
    # New defaults — verified via apply_project_overrides + projection
    # audit to give roughly symmetric spread across the 14 published
    # projects:
    #
    #   x_rice_pasta     (Mario Carpo's distinction): data-driven /
    #                    statistical / search-based methods (rice) vs.
    #                    rule-based / parametric / expert-coded methods
    #                    (pasta). Cleanly splits ML projects from
    #                    parametric-design / Grasshopper / Kangaroo work.
    #   x_concept_built  speculative / research / proposal vs. shipped /
    #                    deployed / produced. Replaces the weak
    #                    student/production axis.
    #   z_screen_space   2D screen interface vs. 3D spatial environment.
    #                    Strongest empirical spread (0.39 raw range).
    {
        # Round-9m: was rice/pasta — renamed to plain-language poles
        # because nobody outside Carpo's "Second Digital Turn" reading
        # group catches the metaphor. The split is the same: data-driven
        # / statistical / latent-space methods (ML side) vs. rule-based /
        # parametric / hand-coded methods (algorithm side). Tuned the
        # prompts harder toward METHOD vocabulary so ML projects
        # actually cluster on one end (previous version had Spectral
        # Facades reading as parametric because "facade" content
        # dominated the embedding).
        "key": "x_ml_algorithm",
        "labels": ["ML / Latent", "Algorithmic / Parametric"],
        "pos": (
            "deep learning, neural network, vision transformer, "
            "diffusion model, large language model, multimodal foundation "
            "model, fine-tuning, lora adapter, latent space, embedding, "
            "training pipeline, dataset, gradient descent, generative AI, "
            "stable diffusion, gpt, clip, jina, statistical inference, "
            "data-driven model"
        ),
        "neg": (
            "parametric design, computational geometry, grasshopper, "
            "kangaroo physics, rhino model, dynamic relaxation, "
            "form-finding, hand-coded algorithm, rule-based generation, "
            "spline modeling, NURBS surface, expert system, deterministic "
            "procedure, manual scripting, structural analysis"
        ),
    },
    {
        "key": "y_concept_built",
        "labels": ["Concept", "Built"],
        "pos": (
            "speculative proposal, research investigation, conceptual "
            "study, exploratory, paper, thesis idea, sketch, diagram, "
            "abstract concept"
        ),
        "neg": (
            "deployed product, shipped tool, production application, "
            "constructed building, fabricated object, working artifact, "
            "user-facing interface, live deployment"
        ),
    },
    {
        "key": "z_screen_space",
        "labels": ["2D Screen", "3D Space"],
        "pos": (
            "2D screen interface, dashboard, web app, browser tool, "
            "data visualization on a flat display, graphical user interface"
        ),
        "neg": (
            "3D spatial environment, physical space, built form, "
            "fabrication, immersive scene, embodied installation, "
            "architectural model, three-dimensional object"
        ),
    },
]

EXTRA_AXES = [
    # Kept the strongest of the older axes:
    {
        "key": "x_artifact_system",
        "labels": ["Artifact", "System"],
        "pos": "concrete artifact, fabricated object, single drawing, model, output image",
        "neg": "interactive system, software tool, dashboard, application, pipeline",
    },
    # Round-9m new axes:
    {
        "key": "x_aesthetic_analytical",
        "labels": ["Aesthetic", "Analytical"],
        "pos": (
            "aesthetic, formal, sensual, expressive, atmospheric, "
            "stylistic, beautiful composition"
        ),
        "neg": (
            "analytical, quantitative, measured, performance-driven, "
            "data-informed, evaluation, metric, study"
        ),
    },
    {
        "key": "x_solo_team",
        "labels": ["Solo", "Team"],
        "pos": "solo individual project, single author, personal work",
        "neg": "team collaborative project, multiple authors, group effort",
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
        thesis_coords[:, 0] = E @ directions["x_ml_algorithm"]
        thesis_coords[:, 1] = E @ directions["y_concept_built"]
        thesis_coords[:, 2] = E @ directions["z_screen_space"]
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
