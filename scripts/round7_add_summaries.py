"""Round-7: add a `summary:` field to every published project's frontmatter.

The summary is what the embedding pipeline now uses (text-only embedding —
0.7*image + 0.3*text was producing inaccurate latent-space placements because
sprite/poster pixels don't capture conceptual content).

~280 char target per summary. Hand-written drafts the user can refine.
"""
from __future__ import annotations

from pathlib import Path

import frontmatter

ROOT = Path(r"W:\tianle-chen-site")
PROJECTS = ROOT / "src" / "content" / "projects"

# slug -> ~280 char summary used both as embedding source and side-panel caption
SUMMARIES: dict[str, str] = {
    "3t3d-vit-2d-to-3d": (
        "A vision-transformer pipeline that lifts a single 2D architectural floorplan "
        "into a structured 3D massing model. Trained on a synthetic dataset of paired "
        "plans and meshes generated procedurally in Grasshopper. Tests whether ViT "
        "attention can learn architectural priors directly from 2D-3D pairs."
    ),
    "a-game-of-deterioration": (
        "A 2D simulation game where the player heals a procedurally deteriorating world "
        "before it collapses. Built in Python with cmu_graphics, Pillow, and NumPy. "
        "Real-time texture decay and restoration mechanics turn environmental survival "
        "into a time-reversal puzzle. CMU 15-112 final."
    ),
    "aurora-citadel-gen-game": (
        "A modular procedural-architecture generative game built in Unreal Engine 5 "
        "with the Wave Function Collapse plugin. Each level samples from a library of "
        "fourteen hand-crafted FBX modules under spatial-grammar constraints, exploring "
        "rule-based generation as narrative architecture."
    ),
    "design-the-ambience": (
        "A real-time generative environment that translates user behavior in physical "
        "space into projected imagery via StreamDiffusion + MediaPipe + TouchDesigner. "
        "Hand poses and movement modulate diffusion prompts on the fly, blurring the "
        "boundary between performer and projection."
    ),
    "l43d-cad-mllm": (
        "Multimodality-conditioned CAD generation: a fine-tuned multimodal LLM with "
        "LoRA adaptation that produces editable parametric CAD sequences from text, "
        "point clouds, or images. Includes a synthetic data amplification pipeline on "
        "the DeepCAD subset and an autocompletion variant. Team project, CMU 16-825."
    ),
    "live-ai-feedback-design-assistant": (
        "A real-time design feedback assistant that watches a designer's working canvas "
        "and surfaces relevant suggestions inline, using an open-vocabulary visual model "
        "and an LLM observer. Researches how AI critique can sit alongside the designer "
        "rather than interrupting them."
    ),
    "s25-team-26-paper-viz": (
        "A 3D visualization web app for academic-paper relationships. Team project for "
        "CMU 17-637 — built in Django + Three.js, visualizes citation graphs and topical "
        "similarity across a Google Scholar dataset. David served as Sprint-1 Product "
        "Owner; Graham scraped data, Sheen led UI/UX."
    ),
    "semantic-canvas": (
        "An AI-augmented design canvas where designers navigate latent space along "
        "their own typed semantic axes. Project image embeddings get dot-projected "
        "against ensemble axis vectors built from natural-language label expansions — "
        "no learned mapping, no dimensionality reduction, no retraining. Adding a new "
        "axis is free. CMU MSCD thesis."
    ),
    "skill-bridge-datavis": (
        "An interactive dashboard that visualizes cross-disciplinary tech and design "
        "job-market data — skill demands, salary trends, geographic distributions. "
        "Built with Svelte + D3, scraping live job postings. Empowers career-changers "
        "to see where their existing skills meet real demand."
    ),
    "spectral-facades": (
        "A generative-design pipeline for adaptive facade systems, training "
        "StreamDiffusion on architectural daylight-simulation outputs to produce facade "
        "variations conditioned on environmental performance. Demonstrates that "
        "diffusion models can be conditioned on continuous performance criteria."
    ),
    "synthetic-texture-deterioration": (
        "A synthetic dataset and visualization tool for material deterioration patterns. "
        "Procedurally generates paired before/after textures with physics-informed decay "
        "(oxidation, biofilm, weathering) and a UI for inspecting how each parameter "
        "shapes the deterioration. Toolkit for design educators teaching material-as-time."
    ),
    # Architecture (visible on /architecture; not in scatter but still benefit from summary)
    "fiber-based-pavilion": (
        "A parametric pavilion built from kinematic folding canopy systems and "
        "fiber-reinforced ceramic columns. Co-authored research at IASS 2024 with Prof. "
        "Castellon. Kangaroo-physics simulation drives the canopy origami; stereotomic "
        "CNT-fiber columns hold up the assembly."
    ),
    "membrane-form-finding": (
        "A dynamic-relaxation form-finding workflow for tensile membrane structures, "
        "exploring equilibrium geometries achievable from simple anchor and edge-cable "
        "constraints. Grasshopper + Kangaroo Physics; output curated as a families "
        "taxonomy of membrane typologies."
    ),
    "generative-urbanism": (
        "A territorial-scale generative-urbanism investigation along the U.S.-Mexico "
        "border, mapping informal settlements and water-infrastructure scarcity. "
        "Combines GIS data with rule-based growth simulations to project alternative "
        "urban futures across decades."
    ),
    "wire-bending": (
        "A mixed-reality robotic wire-bending workflow combining Microsoft HoloLens "
        "with a 6-axis robotic arm. The designer sketches in HoloLens; the workflow "
        "synchronizes with Grasshopper for fabrication. Bridges digital and physical "
        "for complex wire-form fabrication. CMU CodeLab research."
    ),
}


def main() -> None:
    written = 0
    skipped = 0
    for slug, summary in SUMMARIES.items():
        md = PROJECTS / f"{slug}.md"
        if not md.exists():
            print(f"  [skip] {slug}.md not found")
            skipped += 1
            continue
        post = frontmatter.load(md)
        existing = post.metadata.get("summary")
        if existing and isinstance(existing, str) and existing.strip() == summary.strip():
            print(f"  [unchanged] {slug}")
            continue
        post.metadata["summary"] = summary
        md.write_text(frontmatter.dumps(post), encoding="utf-8", newline="\n")
        chars = len(summary)
        print(f"  [write] {slug:42s} ({chars} chars)")
        written += 1
    print(f"\n[summary] wrote {written}, skipped {skipped}, total {len(SUMMARIES)}")


if __name__ == "__main__":
    main()
