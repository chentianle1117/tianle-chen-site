---
_hero_curated: true
artifacts:
- /assets/l43d-cad-mllm/poster.pdf
- /assets/l43d-cad-mllm/final-report.pdf
- /assets/l43d-cad-mllm/proposal-final.pdf
- /assets/l43d-cad-mllm/proposal-v1.pdf
categories:
- ML
- Deep Learning
- CAD Generation
course: 16-825 Learning for 3D Vision — Final Project (Team 21)
course_code: 16-825
david_branches:
- autocomplete
- autocomplete_2
github: chentianle1117/CAD-MLLM-unofficial
github_personal_fork_url: https://github.com/chentianle1117/CAD-MLLM-unofficial
github_upstream: veoery/CAD-MLLM-unofficial
github_upstream_url: https://github.com/veoery/CMU16825_Final_project
github_url: https://github.com/chentianle1117/CAD-MLLM-unofficial
hero_image: /assets/l43d-cad-mllm/architecture.svg
huggingface_dataset: omnicad-lab-L3d/omnicad-multimodal-subset-fast
huggingface_org: omnicad-lab-L3d
huggingface_personal: chentianle1117/autocomplete-stage3-8000
images:
- /assets/l43d-cad-mllm/architecture.svg
- /assets/l43d-cad-mllm/combined-summary.png
- /assets/l43d-cad-mllm/data-amplification.png
- /assets/l43d-cad-mllm/operations-comparison.png
- /assets/l43d-cad-mllm/versions-per-model.png
- /assets/l43d-cad-mllm/truncation-distribution.png
- /assets/l43d-cad-mllm/poster-page-1.png
- /assets/l43d-cad-mllm/report-page-1.png
- /assets/l43d-cad-mllm/report-page-2.png
image_captions:
- System overview — three input modalities feed frozen encoders and trainable projections into Qwen2.5-7B (LoRA), which emits a parametric CAD command sequence compiled to a STEP B-Rep; plus the Intelligent-Truncation data pipeline and evaluation results.
- Dataset augmentation summary — 58,653 source models amplified to 197,546 training sequences (3.37×), with truncation-percentage, versions-per-model, and operations-per-model distributions.
- Data amplification — 3.37× growth in training sequences via Intelligent Truncation (58,653 → 197,546).
- Operations-per-model distribution before vs. after truncation (original mean approximately 5 ops; truncated partials are shorter).
- Truncation versions generated per source model (average 2.37, ranging 1–5).
- Distribution of truncation levels across the dataset, spanning roughly 1%–99% completeness.
- Final project poster (page 1), CMU 16-825 L43D poster session, December 2025.
- Final report, page 1 — abstract and introduction.
- Final report, page 2 — related work and dataset generation.
local_path: W:\CMU_Academics\2025 Fall\Learning for 3D Vision\CMU16825_Final_project
priority: flagship
proposal_doc: https://docs.google.com/document/d/1boTa8wrT7wAHUPmNzRsZQfl0koGM_CAKl-26r41-25c/edit
publish: true
reference_paper: 'CAD-MLLM: Unifying Multimodality-Conditioned CAD Generation With
  MLLM (arXiv:2411.04954)'
reference_repos:
- rundiwu/DeepCAD
- zhangshuming0668/Brep2Seq
repo_owner: Yizhuo Di (veoery) — holder of the canonical team repo; NOT team lead
role: team-member
semester: Fall 2025
slug: l43d-cad-mllm
status: ready
summary: 'Multimodality-conditioned CAD generation: a Qwen2.5-7B LLM fine-tuned with
  LoRA that produces editable parametric CAD command sequences from text, point clouds,
  or images (or any combination). Includes a synthetic multimodal data pipeline that
  amplifies a DeepCAD subset 3.37x via an Intelligent Truncation algorithm and an
  autocompletion variant. Team project, CMU 16-825.'
tags:
- multimodal-llm
- cad-generation
- point-cloud
- curriculum-learning
- llm-finetuning
- qwen
- dinov2
- pointnet
- lora
- opencascade
- deepcad
- autocompletion
team:
- David Chen
- Karthick Raja BG
- Yizhuo Di
- Chia Hui Yen (audit)
team_hierarchy: flat (no group leader)
team_size: 3 active + 1 audit
title: 'CAD-MLLM: Unifying Multimodality-Conditioned CAD Generation with MLLM'
type: portfolio-project
year: 2025
---

> Team 21's unofficial reproduction and extension of *CAD-MLLM* (arXiv:2411.04954) for CMU 16-825, Learning for 3D Vision (Fall 2025). One large language model accepts **text, a rendered image, a point cloud, or any non-empty combination** and generates an **editable parametric CAD command sequence** that compiles to a real B-Rep solid. My contribution was the **autocompletion extension** — training the model to complete partial designs, built on the `autocomplete` / `autocomplete_2` branches.

The problem is narrow and real. Parametric CAD is authored as a *history* of construction operations (sketch a profile, extrude it, fillet an edge), but it is *stored* as a Boundary Representation (B-Rep) — a graph of faces, edges, and vertices. A graph is not a sequence, so autoregressive models can't emit it directly, and there is a genuine gap between high-level design intent ("a bracket with two mounting holes") and the precise parametric operations that realize it. CAD-MLLM closes that gap by treating CAD generation as **sequence prediction**: serialize the construction history into a command sequence an LLM can generate token by token, then compile the sequence back into geometry.

<figure class="diagram">
  <img src="/assets/l43d-cad-mllm/architecture.svg" alt="CAD-MLLM system diagram: text/image/point-cloud inputs through frozen encoders and trainable projection layers into a Qwen2.5-7B LLM with LoRA, emitting a parametric CAD command sequence compiled to a STEP B-Rep; plus the synthetic data pipeline with Intelligent Truncation and the evaluation results." />
  <figcaption>The full system — multimodal model (encoders → projection → Qwen2.5-7B + LoRA → command sequence → STEP), the Intelligent-Truncation data pipeline, two-stage curriculum training, and the evaluation trade-off. My autocompletion work sits in the truncation + training path.</figcaption>
</figure>

## What was actually built

Three pieces, in dependency order:

1. **A synthetic multimodal dataset** built on a 10% DeepCAD subset (58,653 models), because DeepCAD ships only JSON command sequences — no aligned images, point clouds, or partial-sequence pairs. The team synthesized all of them with the OpenCascade geometry kernel.
2. **An "Intelligent Truncation" algorithm** that derives *geometrically valid* partial CAD sequences from complete ones, amplifying the training set and enabling design autocompletion — a capability the original paper does not have.
3. **A multimodal LLM** — Qwen2.5-7B with LoRA plus frozen per-modality encoders and trainable projection layers — trained with a two-stage curriculum and evaluated on both geometric validity and sequence accuracy.

## CAD as a command sequence

A CAD model *M* is represented as a sequence of construction operations `S = {c1, c2, …, cN}`, where each `ci` is a command type `ti` (e.g. `Sketch`, `ExtrudeFeature`, `Line`, `Arc`, `Circle`) plus its geometric parameters `pi` (coordinates, radius, extrusion depth). Concretely the dataset carries a JSON with an `entities` dict and a `sequence` list:

```json
{
  "entities": {
    "sketch_id_0":  { "type": "Sketch", "profiles": { ... }, "reference_plane": { ... } },
    "feature_id_0": { "type": "ExtrudeFeature", "profiles": [ ... ], "extent": { ... } }
  },
  "sequence": [
    {"index": 0, "type": "Sketch",         "entity": "sketch_id_0"},
    {"index": 1, "type": "ExtrudeFeature", "entity": "feature_id_0"}
  ]
}
```

The model is trained with a standard **causal-LM objective** — maximize the log-likelihood of the next command token given the conditioning inputs `C ⊆ {T, I, P}` and the preceding tokens.

## Dataset — synthesizing the missing modalities

For every one of the 58,653 source models, the pipeline (`pipeline/process_cad.py`, `pipeline/render_cad.py`) generates, via `pythonocc` / OpenCascade:

- **B-Rep geometry (STEP)** — the raw JSON commands compiled into a precise boundary representation.
- **Point clouds** — surface-sampled points using DeepCAD's sampling logic, feeding the 3D encoder.
- **Multi-view renderings** — four standardized viewpoints (**Front, Top, Side, Isometric**) per model. Across the dataset this comes to **790,184 renderings**.

The result is a unified corpus where each design exists in textual (command sequence), visual (renders), and geometric (B-Rep / point cloud) form.

## Intelligent Truncation — the core data contribution

To train autocompletion you need `(partial input → complete target)` pairs. Naively cutting a parametric sequence at a random index usually breaks it — you get a sketch with no reference plane, or a fillet referencing an edge that doesn't exist yet. The Intelligent Truncation algorithm enforces **geometric validity at every cut**:

1. **Operation-boundary detection** — only cut at valid stopping points (e.g. immediately after an `ExtrudeFeature` completes), never mid-feature.
2. **Dependency tracing** — for a chosen cut, recursively walk the entity dependency graph (`ExtrudeFeature → profiles → Sketch → reference plane`) and keep everything the partial sequence needs.
3. **Entity cleanup** — prune "orphan" entities that are defined but no longer referenced, and attach truncation metadata (`original_operations`, `kept_operations`, `truncation_percentage`).

```python
def truncate_json(self, data, truncate_at_idx):
    truncated["sequence"] = data["sequence"][: truncate_at_idx + 1]
    referenced = self.get_referenced_entities(truncated["sequence"], data["entities"])
    truncated["entities"] = {eid: e for eid, e in data["entities"].items() if eid in referenced}
    kept, total = len(truncated["sequence"]), len(data["sequence"])
    truncated["truncation_metadata"] = {
        "is_truncated": True, "original_operations": total,
        "kept_operations": kept, "truncation_percentage": kept / total * 100,
    }
    return truncated
```

Each source model yields up to five evenly-spaced partial variants (roughly 25% / 50% / 75% completeness, never 100%). This produces multiple valid partial states from one model and teaches the model the *logic of incremental construction*.

### Amplification numbers (from the final report, Table 1)

| Metric | DeepCAD source | Ours | Gain |
|---|---|---|---|
| Distinct models | 58,653 | 58,653 | 1.0× |
| Training **sequences** | 58,653 | **197,546** | **3.37×** |
| B-Rep (STEP) | — | 58,653 | new |
| Point clouds | — | 58,653 | new |
| Renderings | — | 790,184 | new |
| Avg. versions / model | 1.0 | 2.37 | 2.37× |
| Completeness coverage | 100% only | 1%–99% | — |

The two multipliers describe the same result from different angles: truncation adds an **average of 2.37 partial versions per model**, so the total sequence count grows to **3.37× the source** (1.0 original + 2.37 truncated). Reported processing was fast — the full-subset truncation pass runs in roughly 10–20 minutes.

## Model architecture

The core is a pre-trained LLM backbone with separate frozen modality encoders aligned into its embedding space (`cad_mllm/model.py`).

| Component | Choice | Trainable? |
|---|---|---|
| LLM backbone | **Qwen2.5-7B** (`AutoModelForCausalLM`) | frozen weights + LoRA |
| Adaptation | **LoRA** on `q/k/v/o/gate/up/down_proj` | ✅ |
| Text | native tokenizer + LLM embedding layer (identity projector) | — |
| Image encoder | **DINOv2-large** (`facebook/dinov2-large`); patch tokens, CLS dropped; multi-view supported | frozen |
| Point-cloud encoder | **PointNet-style** Conv1d stack + global max-pool → one global token (2048 points) | frozen |
| Projection layers | 2-layer MLP (hidden 2048) mapping each encoder's output into LLM dim *D* | ✅ |
| Fusion | **concatenation** of `[E_text · E_image · E_point]` along the sequence dimension | — |

DINOv2 is used deliberately over CLIP — its self-supervised features carry stronger geometric and structural signal, which matters for CAD. Only the **projection layers and LoRA matrices** are optimized; the LLM backbone and all encoders stay frozen, which is what makes fine-tuning a 7B model feasible on a single GPU.

## Training

Everything ran in PyTorch + HuggingFace Transformers on a single **NVIDIA A100 (80 GB)** on Google Colab.

**LoRA + optimization (final report §5):**

- LoRA **rank r = 16, α = 32, dropout = 0.05**
- AdamW (β1 = 0.9, β2 = 0.95), weight decay
- **Cosine-annealing** LR, 3% warmup, peak LR **2 × 10⁻⁴**
- Global batch size **16** via gradient accumulation
- **max sequence length 4096**

**Two-stage curriculum:**

1. **Stage I — text-only alignment.** Train exclusively on Text-to-CAD pairs so the model learns the valid command-sequence syntax and a strong NL → CAD mapping before any other modality is introduced.
2. **Stage II — randomized multimodal fusion.** Introduce image and point-cloud modalities, and for each sample condition on a *random non-empty subset* `C ⊆ {T, I, P}`. This forces robustness to whatever combination is available at inference — text alone, image alone, or all three together.

## Evaluation

The eval pipeline runs seven steps per sample: text prompt → JSON inference → JSON→STEP export → 3D visualization → topology check → JSON structure validation → sequence-metric scoring. Samples are filtered to ground-truth sequences under 2048 tokens; sampling temperature 0.5.

**Topology metrics:** STEP/raw conversion rate (% of outputs that compile to a valid STEP), Dangling-Edge Length (DangEL, unclosed boundary), Self-Intersection Ratio (SIR), Flux Enclosure Error (FluxEE). **Sequence metrics:** Entity Count Accuracy, Type-Sequence Accuracy (edit-distance based), Type-Distribution Similarity (Jaccard).

Four configurations were run (final report Tables 2–4):

| Eval | Input | Max tokens | STEP conversion | Entity Acc | Type-Seq Acc | Type-Dist Sim |
|---|---|---|---|---|---|---|
| 1 | Text only | 10,240 | 40.0% (8/20) | 0.299 | 0.547 | 0.480 |
| 2 | Text only | 2,048 | **90.0%** (45/50) | 0.482 | 0.915 | 0.676 |
| 3 | PC + Image + Text | 4,096 | 33.3% (5/15) | 0.050 | 0.750 | 0.469 |
| 4 | PC + Image + Text | 4,096 | **60.0%** (9/15) | **0.727** | **0.955** | **0.758** |

Two findings hold up across the runs:

- **Text-only conditioning maximizes geometric validity** (up to 90% STEP conversion) because it produces simpler, more syntactically conservative outputs.
- **Multimodal conditioning maximizes sequence fidelity** — the best multimodal run (Eval 4) reaches the highest entity-count, type-sequence, and type-distribution accuracy — but at a lower conversion rate, because richer inputs push the model toward more detailed and therefore more fragile geometry.

Token budget matters too: a very large budget (10,240) lets the model produce longer, more detailed sequences but also more inconsistent ones (Eval 1's 40% conversion), while a tighter budget (2,048) is more stable at the cost of fine detail. This is the central trade-off documented in the report: **expressiveness vs. reliability**. The honest limitation stated in the report and poster: the current pipeline reliably handles **simple shapes only**, constrained by the modest training-data size and short text prompts.

## My contribution — the autocompletion extension

My work lives on the `autocomplete` and `autocomplete_2` branches and targets the partial-to-complete task that Intelligent Truncation makes possible:

- **Truncated-text masking during training** — the training loop masks the completed portion of a partial sequence so the loss is computed only over the tokens the model must predict, teaching it to *continue* a design rather than regenerate it (`scripts/train_curriculum.py`, commit "Update: truncated_text masking").
- **Autocomplete inference + evaluation pipeline** — dedicated `scripts/inference_autocomplete.py` and `scripts/evaluate_autocomplete.py`, plus fixes to make generation work correctly under PEFT/LoRA (overriding the default `max_length=20`, switching to `max_new_tokens`, and working around a PEFT `inputs_embeds` limitation for text-only mode).
- **Hyperparameter sweeps** — an overnight sweep harness (`scripts/run_overnight_sweep.sh`, `sweep_overnight_5070ti.yaml`) run locally on an RTX 5070 Ti, with W&B logging and checkpoint cleanup utilities.
- **Published weights** — the resulting fine-tuned model is on HuggingFace as [`chentianle1117/autocomplete-stage3-8000`](https://huggingface.co/chentianle1117/autocomplete-stage3-8000).

## Results and outcomes

- A working unofficial reproduction of a multimodal CAD-generation paper — end to end, from raw DeepCAD JSON to a compiled STEP solid.
- A genuinely novel data contribution (Intelligent Truncation) that both amplifies the dataset 3.37× and unlocks autocompletion, which the original paper does not do.
- A rebuilt DeepCAD subset carrying the modalities it originally lacked: 58,653 STEP solids, 58,653 point clouds, and 790,184 multi-view renders.
- Quantified the modality trade-off (validity vs. fidelity) with four controlled eval configurations and four topology + three sequence metrics.
- Published model weights and dataset; team poster presented at the L43D poster session (December 2025); full final report delivered.

## Team and role

Flat team, no group leader. Active members: **David Chen, Karthick Raja BG, Yizhuo Di**; **Chia Hui Yen** participated as an audit. The canonical repo lives on Yizhuo's GitHub (`veoery`); a personal fork preserves the project under my name. My scope was the autocompletion extension and its training/eval tooling.

## Links

**Code**

- [Personal fork: chentianle1117/CAD-MLLM-unofficial](https://github.com/chentianle1117/CAD-MLLM-unofficial) — primary portfolio link
- [Upstream team repo: veoery/CMU16825_Final_project](https://github.com/veoery/CMU16825_Final_project)
- Branches: [`autocomplete`](https://github.com/chentianle1117/CAD-MLLM-unofficial/tree/autocomplete) · [`autocomplete_2`](https://github.com/chentianle1117/CAD-MLLM-unofficial/tree/autocomplete_2)

**Models + data**

- [HuggingFace org: `omnicad-lab-L3d`](https://huggingface.co/omnicad-lab-L3d)
- [My model: `chentianle1117/autocomplete-stage3-8000`](https://huggingface.co/chentianle1117/autocomplete-stage3-8000)
- [Dataset: `omnicad-multimodal-subset-fast`](https://huggingface.co/datasets/omnicad-lab-L3d/omnicad-multimodal-subset-fast)

**Docs**

- [Final report (PDF)](/assets/l43d-cad-mllm/final-report.pdf) · [Poster (PDF)](/assets/l43d-cad-mllm/poster.pdf) · [Project proposal (Google Doc)](https://docs.google.com/document/d/1boTa8wrT7wAHUPmNzRsZQfl0koGM_CAKl-26r41-25c/edit)
- [CAD-MLLM reference paper (arXiv:2411.04954)](https://arxiv.org/abs/2411.04954)

**References cited in the report**

- [DeepCAD (Wu et al., ICCV 2021)](https://github.com/rundiwu/DeepCAD) — source dataset and processing kernel
- Text2CAD (NeurIPS 2024) · Text-to-CadQuery (arXiv:2505.06507) · CAD-Coder (ASME 2025) — related conditioning approaches
