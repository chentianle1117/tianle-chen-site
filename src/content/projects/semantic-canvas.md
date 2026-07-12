---
_hero_curated: true
advisor: Prof. Daniel Cardoso Llach
architecture_pattern: BFF (Backend-For-Frontend, API keys server-side)
artifacts:
- /assets/semantic-canvas/ (demo thumbnails + view templates)
categories:
- Thesis
- Interactive Tool
- AI/ML
- Design Research
course: 48-716 MSCD Pre-Thesis II / MSCD Thesis
course_code: 48-716
dataset: Zappos50K (curated subset + generated variants)
deployment: Railway (persistent volume at /app/backend/data; healthcheck /api/health)
external_apis:
- fal.ai nano-banana
- fal.ai nano-banana-2
- Jina AI
- Google Gemini
github: chentianle1117/Semantic_Canvas
github_url: https://github.com/chentianle1117/Semantic_Canvas
gif_hero: /assets/semantic-canvas/live-demo.gif
hero_image: /assets/semantic-canvas/semantic-canvas-ui.png
images:
- /assets/semantic-canvas/p3-stage2-session2-composite.png
- /assets/semantic-canvas/stage1-vs-stage2-comparison.png
- /assets/semantic-canvas/session-summary.png
- /assets/semantic-canvas/ui-screenshot.png
- /assets/semantic-canvas/lineage-view-ui.png
- /assets/semantic-canvas/p2-journey.png
- /assets/semantic-canvas/p3-stage2-session1-composite.png
- /assets/semantic-canvas/p4-longitudinal-semantic-canvas.png
- /assets/semantic-canvas/ghost-node-agent-ui.png
- /assets/semantic-canvas/p3-journey.png
- /assets/semantic-canvas/p5-canvas.png
- /assets/semantic-canvas/p2-canvas.png
- /assets/semantic-canvas/p3-canvas.png
- /assets/semantic-canvas/p5-journey.png
- /assets/semantic-canvas/p4-journey.png
- /assets/semantic-canvas/batch-image-vs-latent-exploration.png
- /assets/semantic-canvas/p4-canvas.png
- /assets/semantic-canvas/p2-longitudinal-semantic-canvas.png
- /assets/semantic-canvas/p1-journey.png
- /assets/semantic-canvas/p4-longitudinal-lineage.png
- /assets/semantic-canvas/p1-longitudinal-lineage.png
- /assets/semantic-canvas/p1-canvas.png
- /assets/semantic-canvas/p1-longitudinal-semantic-canvas.png
image_captions:
- ''
- 'Study result — per-participant comparison of Stage 1 vs. Stage 2 sessions (P1-P4) across three logged behaviors: images generated, semantic-axis changes, and ghost-node / agent-suggestion accepts.'
- 'Study result — agent-acceptance rate plotted against design experience for each participant (P1-P5), bubbles sized by generation volume and annotated with per-participant CSI scores.'
institution: Carnegie Mellon School of Design
local_path: W:\CMU_Academics\2025 Fall\Thesis\Semantic_Canvas
local_path_alt: W:\CMU_Academics\2025 Fall\Thesis Demo\Zappos50K_semantic_explorer
priority: flagship
publish: true
related_cards:
- '[[2025-2026--thesis-flagship]]'
- '[[2025-Spring--live-ai-feedback-design-assistant]]'
semester: Fall 2025 – Spring 2026
slug: semantic-canvas
stack_backend:
- FastAPI
- Uvicorn
- Jina CLIP v2
- Google Gemini 2.5 Flash Lite
stack_frontend:
- React 18
- TypeScript
- Vite
- D3.js 7
- Zustand
status: ready
live_url: /apps/semantic-canvas/
summary: An AI-augmented design canvas where designers navigate latent space along
  their own typed semantic axes. Project image embeddings get dot-projected against
  ensemble axis vectors built from natural-language label expansions — no learned
  mapping, no dimensionality reduction, no retraining. Adding a new axis is free.
  CMU MSCD thesis.
tags:
- thesis
- clip
- latent-space
- d3
- react
- fastapi
- fal-ai
- gemini
- multi-user-study
- semantic-axes
- genealogy
- ai-augmented-design
- footwear
- zappos50k
title: Semantic Canvas — Interactive Latent-Space Design Tool for AI-Augmented Footwear
  Design
type: portfolio-project
video_proposal: /assets/semantic-canvas/proposal-presentation.mp4
visibility: public
year: 2025
---

> **The thesis tool.** An interactive D3-based canvas for exploring and generating shoe designs in semantic latent space. Jina CLIP v2 embeddings let you define custom semantic axes ("casual ↔ formal", "dark ↔ bright") and watch your designs reposition themselves by meaning. fal.ai generates new designs from text or reference images. Gemini is a passive observer that reads your design brief and offers insights. Multi-user study mode with per-participant isolation logs every interaction — the whole thing runs in production on Railway.

Design exploration is fundamentally about moving through a *space of possibilities* — but that space has historically been implicit, stored in the designer's head. Semantic Canvas is a thesis-scale attempt to make it real: 2D, navigable, with custom axes you define in your own words. Drop an image in and it finds its place along any axis you can describe; generate variations via fal.ai; branch with genealogy. Study participants use it for real design tasks, and every event is logged for analysis.

### Try the core interaction

**[▶ Open the live demo →](/apps/semantic-canvas/)** — pick two semantic axes and watch a set of shoes reposition by meaning. The projection runs **entirely in your browser** on precomputed CLIP embeddings (no backend — generation and the AI observer are omitted in this lightweight version; the full tool uses Jina CLIP v2 + fal.ai on Railway).

<figure class="embed">
  <iframe src="/apps/semantic-canvas/" title="Semantic Canvas — live client-side demo" loading="lazy"></iframe>
</figure>

Research frame: CMU MSCD thesis, 2025–2026, on AI-augmented footwear design — how generative AI should show up in an expert design workflow. The tool is both the research instrument and the thesis artifact, with the multi-user study conducted across Fall 2025 and Spring 2026. Solo engineering, design, and study execution: ~4,800+ LOC backend plus the full React frontend. Pairs with [[2025-Spring--live-ai-feedback-design-assistant|Live AI Feedback]] (same observational-AI pattern at smaller scale) and feeds the thesis writeup at [[2025-2026--thesis-flagship]].

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

<figure class="diagram">
  <img src="/assets/semantic-canvas/architecture.svg" alt="Semantic Canvas architecture — three lanes: (1) semantic-axis projection (NL endpoints → Gemini expands to 4 variants → ensemble axis → normalize(pos−neg) direction → dot-project 1024-D Jina CLIP v2 embeddings → grid-snap → D3 render); (2) BFF service (React/D3 frontend, FastAPI backend, Jina/fal.ai/Gemini external services, plus the client-only demo); (3) multi-user study instrumentation (personal URL → ContextVar-isolated AppState → JSONL event log → Railway persistent volume)." />
  <figcaption>Three lanes: the semantic-axis projection pipeline (NL endpoints → Gemini-expanded ensemble axes → dot-project against 1024-D CLIP embeddings → grid-snap → D3), the BFF service architecture, and the per-participant study instrumentation.</figcaption>
</figure>

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
- **MSCD thesis** — defended and completed (May 2026)
- **SIGRADI 2026 abstract** submitted
- **CHI 2027 paper** — in development (full-paper adaptation, "Designing with Latent Space")
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