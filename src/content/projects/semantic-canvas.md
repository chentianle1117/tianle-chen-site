---
type: portfolio-project
title: "Semantic Canvas — Interactive Latent-Space Design Tool for AI-Augmented Footwear Design"
slug: semantic-canvas
course: "48-716 MSCD Pre-Thesis II / MSCD Thesis"
course_code: 48-716
semester: "Fall 2025 – Spring 2026"
year: 2025
role: individual
team_size: 1
institution: Carnegie Mellon School of Design
advisor: "TBD (thesis advisor)"
tags: [thesis, clip, latent-space, d3, react, fastapi, fal-ai, gemini, multi-user-study, semantic-axes, genealogy, ai-augmented-design, footwear, zappos50k]
categories: [Thesis, Interactive Tool, AI/ML, Design Research]
github: chentianle1117/Semantic_Canvas
github_url: https://github.com/chentianle1117/Semantic_Canvas
visibility: public
local_path: "W:\\CMU_Academics\\2025 Fall\\Thesis\\Semantic_Canvas"
local_path_alt: "W:\\CMU_Academics\\2025 Fall\\Thesis Demo\\Zappos50K_semantic_explorer"
deployment: "Railway (persistent volume at /app/backend/data; healthcheck /api/health)"
stack_frontend: [React 18, TypeScript, Vite, D3.js 7, Zustand]
stack_backend: [FastAPI, Uvicorn, Jina CLIP v2, Google Gemini 2.5 Flash Lite]
external_apis: [fal.ai nano-banana, fal.ai nano-banana-2, Jina AI, Google Gemini]
dataset: "Zappos50K (curated subset + generated variants)"
architecture_pattern: BFF (Backend-For-Frontend, API keys server-side)
hero_image: /assets/semantic-canvas/hero.png
images:
  - /assets/semantic-canvas/analysis_thumbs_0.png
  - /assets/semantic-canvas/analysis_thumbs_5.png
  - /assets/semantic-canvas/analysis_thumbs_10.png
  - /assets/semantic-canvas/analysis_thumbs_15.png
  - /assets/semantic-canvas/analysis_thumbs_20.png
  - /assets/semantic-canvas/frontend_public_templates_multi-view_template.png
  - /assets/semantic-canvas/frontend_public_templates_34_view_template.png
artifacts:
  - /assets/semantic-canvas/ (demo thumbnails + view templates)
related_cards:
  - "[[2025-2026--thesis-flagship]]"
  - "[[2025-Spring--live-ai-feedback-design-assistant]]"
priority: flagship
status: ready
publish: true
---
# Semantic Canvas

> **The thesis tool.** An interactive D3-based canvas for exploring and generating shoe designs in semantic latent space. Jina CLIP v2 embeddings let you define custom semantic axes ("casual ↔ formal", "dark ↔ bright") and watch your designs reposition themselves by meaning. fal.ai generates new designs from text or reference images. Gemini is a passive observer that reads your design brief and offers insights. Multi-user study mode with per-participant isolation logs every interaction — the whole thing runs in production on Railway.

![hero](/assets/semantic-canvas/analysis_thumbs_0.png)

## Hook
Design exploration is fundamentally about moving through a *space of possibilities* — but that space has historically been implicit, stored in the designer's head. What if it were real: 2D, navigable, with custom axes you define in your own words? Semantic Canvas is a thesis-scale answer. Drop an image in and it finds its place along any axis you can describe. Generate variations via fal.ai. Branch with genealogy. Study participants use it for real design tasks; every event is logged for analysis.

## Context
**Research frame:** CMU MSCD thesis, 2025–2026. Topic: **AI-augmented footwear design** — how should generative AI show up in an expert design workflow? The tool is both the research instrument and the thesis artifact. Multi-user study conducted Fall 2025 – Spring 2026.
**Role:** solo engineering + design + study execution. ~4,800+ LOC backend + full React frontend.
**Related work in vault:** pairs with [[2025-Spring--live-ai-feedback-design-assistant|Live AI Feedback]] (same observational-AI pattern at smaller scale) and precedes the thesis writeup ([[2025-2026--thesis-flagship]]).

## Features

### Semantic Canvas (D3.js — core interaction)
- **Custom semantic axes** — user-defined text axes (e.g., `"casual ... formal"`)
- **Pure CLIP projection** — images positioned exactly at their dot product with axis vectors. No learned re-embedding, no tricks.
- **Axis tuning mode** — drag image *anchors* and edit axis endpoint sentences; AI helps refine axis descriptions
- **Genealogy lines** — Bezier curves between parent and child generations, color-coded by lineage
- **Lineage Canvas** — dedicated full-canvas tree view with D3 zoom/pan for history exploration
- **Ethereal glow system** — SVG filter-based hover / selection / parent / child glow effects

### Dual-Mode Generation (fal.ai)
- **Shoe generation** — text-to-image + reference-based iteration via `nano-banana`
- **Multi-view sheets** — 5-view and 3/4-view sheets via `nano-banana-2`
- **Mood boards** — 7 style presets (concept sheet, marker render, collage, etc.)
- **Satellite views** — 3/4-front, 3/4-back, top, outsole, medial, front, back
- **Background removal** — optional transparent-BG extraction

### AI Agent (Gemini 2.5 Flash Lite)
- **Passive observer** — monitors canvas state, generates insights without prompting
- **Design brief interpretation** — highlights primary (blue) / secondary (amber) phrases in the brief text
- **Tag suggestions** — context-aware tags for shoes and mood boards
- **Sticky insights** — timers stop when insight is displayed → zero wasted tokens

### Multi-User Study Mode
- **Per-participant isolation** — each participant gets own `AppState` via `ContextVar` middleware
- **Personal URLs** — `/?participant=Name` with per-user session persistence
- **Event logging** — JSONL per participant (session / generation / selection / feedback / ...)
- **Feedback notepad** — floating quick-note FAB with categorized feedback
- **Canvas management** — create / branch / switch / auto-save per participant

### Expert Tool Layout
- **Left toolbar** — 4 flyout panels (Generate, Files, AI Actions, Axes)
- **Right inspector** — stacked accordion (Selection deck + Genealogy tree + Actions)
- **Bottom drawer** — timeline with batch chips
- **Header bar** — settings modal, design brief, study session controls

## Architecture

```
Frontend (React 18 + TypeScript + Vite)
├── SemanticCanvas (D3.js 7)    ← 2D semantic space, zoom/pan, glow effects
├── LineageCanvas (D3.js 7)     ← Full-canvas genealogy tree view
├── Zustand                     ← Global state (appStore.ts)
├── falClient.ts                ← fal.ai proxy calls (via backend BFF)
└── apiClient.ts                ← Backend REST API client
         │
         │ HTTP + X-Participant-Id header
         ▼
Backend (FastAPI + Uvicorn)
├── Per-participant state       ← _StateProxy + ContextVar isolation
├── Jina CLIP v2 embeddings     ← 1024-dim shared text+image CLIP space
├── Semantic Axis Builder       ← text-embedding projection
├── Gemini 2.5 Flash Lite       ← AI agent, brief interpretation, tags
├── Session persistence         ← JSON per participant per canvas
└── Event logging               ← JSONL per participant
         │
         │ REST API
         ▼
External Services
├── fal.ai nano-banana          ← text-to-image & image editing (~2s/image)
├── fal.ai nano-banana-2/edit   ← multi-view sheet generation
├── Jina AI API                 ← jina-clip-v2 embeddings
└── Google Gemini API           ← AI agent & brief analysis
```

**BFF pattern:** all API keys (`FAL_KEY`, `JINA_API_KEY`, `GOOGLE_API_KEY`, `ADMIN_KEY`) live server-side; the frontend never sees credentials.

**Deployment:** Dockerized; backend serves the built frontend as static files. Persistent volume at `/app/backend/data` holds participant data across restarts. Healthcheck at `/api/health` with 300s timeout, on-failure restart.

## Study architecture

Each participant accesses a personal URL:
```
https://<domain>.railway.app/?participant=Name
```

The `X-Participant-Id` header routes to the participant's isolated `AppState`. Everything — generated images, selections, feedback notes, canvas branches — is stored per-participant. Event logs are JSONL so they can be analyzed line-by-line during thesis writeup.

## Canvas interactions (reference)

| Action | Result |
|---|---|
| Click image | Select (cyan glow) |
| Shift+Click | Add to selection |
| Click background | Deselect all |
| Hover image | Show genealogy lines + silver glow |
| Scroll wheel | Zoom in/out |
| Click + drag | Pan canvas |
| Tab | Cycle overlapping shoes |
| Esc | Close dialogs |

## Generation workflows

- **Text-to-image** (no selection) — Left toolbar → Generate → prompt → generate
- **Reference-based** (1+ selected) — selections auto-attached as references → prompt → generate
- **Mood board** — switch to mood-board mode → pick style preset → generate
- **Satellite views** — check "Also generate 3/4 views" in the dialog

## Design brief

Type a design direction in Settings → Design Brief. Gemini highlights:
- **Blue** — primary design goals
- **Amber** — secondary considerations

Highlighted phrases automatically inform generation context.

## Semantic axes (the core abstraction)

1. Left toolbar → Axes
2. Write axis text: `"casual ... formal"`
3. Images reposition by CLIP similarity to the two endpoint phrases
4. **Tune mode** — drag image anchors to refine axis endpoint sentences

The system does *pure projection* — no trained mapping. Every image's position is `dot(image_embedding, axis_endpoint1_embedding - axis_endpoint2_embedding)`. That means adding a new axis is zero-cost at inference time.

## What this enables for the thesis

- **Hypothesis testing** — does "legible latent space" actually improve designer creativity vs. a flat generative tool?
- **Behavior logging** — participant event logs are the primary quantitative data
- **Qualitative material** — feedback notepad entries + post-session interviews
- **Published artifact** — tool is public on GitHub, deployable by anyone

## Deliverables

- **Public GitHub repo** — [chentianle1117/Semantic_Canvas](https://github.com/chentianle1117/Semantic_Canvas)
- **Full README** (10.9 KB) — deployment docs + usage
- **Production deployment** on Railway (live URL — check Railway dashboard)
- **Thesis proposal presentation** — `W:\CMU_Academics\2025 Fall\Thesis Demo\Proposal Final Presentation 1204.mp4` (103 MB, 2025-12-03)
- **Thesis writeup** in progress — `overleaf/thesis_body.tex` (265 KB, last edit 2026-04-23)
- **SIGRADI 2026 abstract** submitted (see `Thesis_Material/sigradi2026_abstract.md`)
- **Pre-Thesis II progression** — 29 PDFs (A1–A11) in `W:\CMU_Academics\2025 Fall\MSCD Pre-thesis II\`

## Config + env

From `railway.toml`:
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "./Dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

Required env vars: `FAL_KEY`, `JINA_API_KEY` (free at [jina.ai](https://jina.ai), 10M tokens/key), `GOOGLE_API_KEY`, `ADMIN_KEY`.

## Tech stack tables

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| D3.js 7 | 2D canvas visualization |
| Zustand | State management |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI + Uvicorn | REST server |
| Jina CLIP v2 | 1024-dim shared text+image embeddings |
| Google Gemini 2.5 Flash Lite | AI agent + brief interpretation |
| fal.ai (nano-banana / nano-banana-2) | Image generation |

## Links

- **[GitHub: Semantic_Canvas](https://github.com/chentianle1117/Semantic_Canvas)**
- **Live deployment** — Railway (URL in Railway dashboard; add here when confirmed)
- [Jina CLIP v2](https://jina.ai) — embedding model
- [fal.ai](https://fal.ai) — generation API
- Local path: `W:\CMU_Academics\2025 Fall\Thesis\Semantic_Canvas\`
- Alt local path: `W:\CMU_Academics\2025 Fall\Thesis Demo\Zappos50K_semantic_explorer\` (same repo, second checkout with Zappos data)

## Related cards

- [[2025-2026--thesis-flagship]] — the academic argument this tool serves
- [[2025-Spring--live-ai-feedback-design-assistant]] — earlier single-user AI-observer prototype that evolved into the Gemini-agent pattern here

---

*Card built 2026-04-23 from Semantic_Canvas public README + Explore agent scan of `W:\CMU_Academics\2025 Fall\Thesis\` and `Thesis Demo\Zappos50K_semantic_explorer\`. Add Railway live URL + thesis advisor name when confirmed.*
