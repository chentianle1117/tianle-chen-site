---
_hero_curated: true
advisor: TBD (thesis committee)
artifacts:
- /assets/thesis-flagship/pre-thesis-I-David_Chen_Game_Plan_Writeup_Submission.pdf
- /assets/thesis-flagship/pre-thesis-II-A11*
- W:\CMU_Academics\2025 Fall\Thesis Demo\Proposal Final Presentation 1204.mp4 (103MB,
  local only)
- overleaf/thesis_body.tex (265 KB)
- Thesis_Material/sigradi2026_abstract.md
- Thesis_Material/study_comprehensive_report.md (31 KB)
- Thesis_Material/advisor_feedback_apr7.md
- 29 Pre-Thesis II PDFs (A1–A11 progression)
- 11 Pre-Thesis I PDFs (game plan + territory maps)
categories:
- Thesis
- Design Research
- AI/ML
course: 48-715 Pre-Thesis I + 48-716 Pre-Thesis II + 48-769 M.S. Thesis/Project
course_code: 48-769
github: null
hero_image: /assets/semantic-canvas/p3-stage2-session2-composite.png
images:
- /assets/thesis-flagship/lineage-view-ui.png
- /assets/thesis-flagship/fashion-interface.png
- /assets/thesis-flagship/form-forge.png
- /assets/thesis-flagship/deeprise-interface.png
- /assets/thesis-flagship/territory-map.png
- /assets/thesis-flagship/stage1-vs-stage2-comparison.png
- /assets/thesis-flagship/concept-config-space.png
- /assets/thesis-flagship/ch4-system-timeline.png
- /assets/thesis-flagship/ch4-generation-pipeline.png
- /assets/thesis-flagship/ch4-axis-projection-pipeline.png
institution: Carnegie Mellon School of Design
latest_draft: thesis_body.tex (265 KB, last edit 2026-04-23)
local_path: W:\CMU_Academics\2025 Fall\Thesis
local_path_demo: W:\CMU_Academics\2025 Fall\Thesis Demo
local_path_writeup: W:\CMU_Academics\2025 Fall\Thesis\Thesis_Writeup\overleaf\thesis_body.tex
priority: flagship
program: MSCD (Master of Science in Computational Design)
proposal_video: Proposal Final Presentation 1204.mp4 (103 MB, 2025-12-03, local only)
publish: true
related_cards:
- '[[2025-Fall--semantic-canvas-thesis-tool]]'
- '[[2025-Spring--live-ai-feedback-design-assistant]]'
role: individual
semester: Spring 2025 – Spring 2026
slug: thesis-flagship
status: ready
tags:
- thesis
- ai-augmented-design
- design-research
- footwear-design
- clip
- multi-user-study
- sigradi-2026
- zappos50k
- computational-design
team_size: 1
title: 'MSCD Thesis — AI-Augmented Footwear Design: Tools, Agency, and the Shape of
  Designer-AI Collaboration'
tool_artifact: '[[2025-Fall--semantic-canvas-thesis-tool]]'
type: portfolio-project
venue_target: SIGRADI 2026 (abstract submitted)
video_proposal: /assets/thesis-flagship/proposal-presentation.mp4
year: 2026
---

> Three-semester thesis project investigating **how generative AI should integrate into expert design workflows**, with footwear design as the domain. The research artifact is [[2025-Fall--semantic-canvas-thesis-tool|Semantic Canvas]] — an interactive latent-space design tool. The argument unfolds across a multi-user study, a production deployment, and chapters in active revision.

![worldmaking diagram](/assets/thesis-flagship/pre-thesis-II-A1_Worldmaking_Diagram_DavidChen.png)

## Hook
Most AI-for-design work asks "can the model make the thing?" — and the answer is yes, always. This thesis asks the harder question: **when a designer uses a generative AI tool, what shape should that collaboration take so design judgment stays intact and compounds over time?** The investigation is empirical (real designers using a real tool on real tasks) and propositional (what does a *legible* latent space buy us vs. a flat prompt-response generator?).

## Context

**Program:** CMU MSCD (Master of Science in Computational Design).
**Sequence:**
- Spring 2025 — **Pre-Thesis I (48-715)**: territory mapping, game plan, annotated bibliography, gap analysis. 11 PDFs.
- Fall 2025 — **Pre-Thesis II (48-716)**: research questions, reference models, A1–A11 progression, proposal draft (A11). **29 PDFs.**
- Fall 2025 — **Thesis Demo (48-716 deliverable)**: proposal presentation delivered 2025-12-03 (103 MB video). Tool deployed on Railway.
- Spring 2026 — **Thesis / Project (48-769, 36 units)**: refinement stage; user study executed; thesis body in overleaf; SIGRADI 2026 abstract submitted.

## The research artifact: Semantic Canvas

See **[[2025-Fall--semantic-canvas-thesis-tool|Semantic Canvas card]]** for full technical detail. Summary: React+FastAPI app deployed on Railway, uses Jina CLIP v2 for user-defined semantic axes, fal.ai for generation, Gemini as a passive observer, multi-user study mode with JSONL event logging per participant. Repo: [chentianle1117/Semantic_Canvas](https://github.com/chentianle1117/Semantic_Canvas).

The tool is both the instrument (how the study collects data) and the artifact (what the thesis proposes as a better design interaction).

## The argument (three moves)

1. **Latent space is the right abstraction** — not prompts, not menus. Designers already think in dimensions ("more formal," "darker," "more sporty"); the tool surfaces those dimensions as first-class citizens.

2. **Legibility matters more than capability** — a tool that *shows its reasoning* (where an image sits on your axes, why) beats a tool that just generates well. Legibility supports iteration; iteration supports craft.

3. **AI agency should be bounded observer, not delegated actor** — Gemini in Semantic Canvas *reads* the designer's brief + canvas state and offers insights; it does not generate, pick, or decide. Keeps the designer in the judgment seat while giving them a second reader.

## Methodology

**Empirical:**
- **Multi-user study** — per-participant canvases, isolated state, JSONL event logs
- **Design brief protocol** — each participant given real footwear brief
- **Longitudinal analysis** — `longitudinal/` folder tracks behavior across sessions
- Study data: `Thesis_Material/study_comprehensive_report.md` (31 KB synthesis)

**Argumentative:**
- **Literature grounding** — Pre-Thesis I annotated bibliography + Pre-Thesis II reference model writeup
- **Proposition mapping** — Pre-Thesis I territory maps visualize the intellectual landscape
- **Chapter-by-chapter build** — thesis_body.tex currently 265 KB (2026-04-23)

## Chapters (in progress)

From `Thesis_Writeup/chapters/` and overleaf:
- Argument frame (research question, positioning)
- Literature review (AI-for-design historiography)
- Tool design (Semantic Canvas architecture and design rationale)
- Study protocol + results
- Discussion + implications
- Conclusion

**Latest:** `thesis_body.tex`, 265 KB, last edited 2026-04-23.

## Deliverables + venues

- **SIGRADI 2026** — abstract submitted (see `Thesis_Material/sigradi2026_abstract.md`, 5.1 KB)
- **Public research tool** — Semantic Canvas repo on GitHub, deployable to any Railway
- **Thesis defense** — Spring 2026 (materials in `Thesis/post_thesis/`, `Thesis/presentation/`)
- **Thesis proposal presentation** — 103 MB video, 2025-12-03

## Pre-Thesis progression (paper trail)

### Pre-Thesis I (Spring 2025) — 11 deliverables
Core proposal track: Statement of Interest → Draft Reading List → Annotated Bibliography → Gap Analysis → Developing the Proposed Investigation → Criteria for Success → Preliminary Game Plan → Game Plan Draft → **Game Plan Writeup Submission** (final, `/assets/thesis-flagship/pre-thesis-I-David_Chen_Game_Plan_Writeup_Submission.pdf`).

Visual synthesis: territory map (4 versions — JPG, PDF, AI). Foundational reference: *Form+Code in Design, Art, and Architecture* (3 MB reading).

### Pre-Thesis II (Fall 2025) — 29 deliverables (A1–A11)
- **A1** — Worldmaking & Anatomy of a Thesis (writeup + diagram)
- **A2** — Reference Model Writeup
- **A3** — Writing Submission
- **A4** — Research Questions (slides 6.4 MB + writeup)
- **A5** — Presentation + Writeup
- **A10** — Models Diagrams + presentation
- **A11** — **Final Thesis Proposal Draft** (2.3 MB, `/assets/thesis-flagship/pre-thesis-II-A11...`)

## Study artifacts (local)

`Thesis_Material/`:
- `thesis_draft.md` — main working draft (125 KB)
- `advisor_feedback_apr7.md` — advisor meeting notes (5.9 KB)
- `ch5_raw_data.md` — Chapter 5 raw findings (46 KB)
- `project_timeline.md` — full timeline (19 KB)
- `study_comprehensive_report.md` — study results synthesis (31 KB)
- `references.md` — bibliography (8.5 KB)
- `user_study_data/` — per-session participant logs
- `papers/` — PDF references
- `figures/` — thesis visualizations

## Data + code

- **Dataset:** curated Zappos50K subset + generated variants (ut-zap50k-* data bundles, ~700 MB zips in `Thesis Demo/`)
- **Code:** [chentianle1117/Semantic_Canvas](https://github.com/chentianle1117/Semantic_Canvas) (~4,800+ LOC backend + React frontend)
- **Study backup:** `study_backup_2026-04-02_1411.tar.gz` (34 MB)

## Links

- **Tool:** [[2025-Fall--semantic-canvas-thesis-tool]] + [GitHub](https://github.com/chentianle1117/Semantic_Canvas)
- Local paths:
  - Writeup: `W:\CMU_Academics\2025 Fall\Thesis\Thesis_Writeup\`
  - Overleaf source: `Thesis_Writeup/overleaf/thesis_body.tex`
  - Study materials: `Thesis Demo\Thesis_Material\`
  - Pre-Thesis I: `W:\CMU_Academics\2025 Spring\Pre-thesis I\`
  - Pre-Thesis II: `W:\CMU_Academics\2025 Fall\Pre-thesis II\`
- Proposal video (not in vault — 103 MB): `Thesis Demo\Proposal Final Presentation 1204.mp4`

## Related cards

- [[2025-Fall--semantic-canvas-thesis-tool]] — the tool that carries the argument
- [[2025-Spring--live-ai-feedback-design-assistant]] — earlier AI-as-observer prototype
- [[2025-Fall--l43d-cad-mllm]] — parallel generative-3D research with a different AI-role framing (LLM-as-generator, not observer)
- [[2025-Spring--3t3d-vit-2d-to-3d]] — parallel sketch-to-3D research with same core ML team

---

*Card built 2026-04-23 from Pre-Thesis I/II PDF trail, overleaf writeup, Thesis_Material analysis, and Semantic Canvas deployment. Add thesis committee names + SIGRADI accept/reject + final defense date when confirmed.*