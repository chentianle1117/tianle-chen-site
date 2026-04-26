---
_hero_curated: true
artifacts:
- Game_Design_Final_Video_Demo.mp4 (324 MB, 5-minute demo, local only)
- Final_Submission_Citadel/ (16 GB total, local only)
- 14 FBX modules (corners, sockets, tiles — 24-61 MB each)
- AI-generated textures (4+ PNGs)
- /assets/aurora-citadel-gen-game/Served and Servant Spaces.pdf
- /assets/aurora-citadel-gen-game/The_Shadow_of_Information.pdf
categories:
- Game
- Procedural Generation
- 3D
course: 62-706 Generative System Design (Gen Sys Des)
course_code: 62-706
github: null
github_note: UE5 project — not on GitHub (repo size + binary assets prohibitive)
hero_image: null
images:
- /assets/aurora-citadel-gen-game/Module Layout.jpg
- /assets/aurora-citadel-gen-game/Module Layout plan.jpg
- /assets/aurora-citadel-gen-game/a-floating-ultra-r-0219223947-texture.png
- /assets/aurora-citadel-gen-game/a-hypermodern-brutal-0219223632-texture.png
- /assets/aurora-citadel-gen-game/futuristic-cube-drone-0219222254-texture.png
- /assets/aurora-citadel-gen-game/interstellar-cargo-cr-0219223150-texture.png
local_path: W:\CMU_Academics\2025 Spring\62706 Gen Game\Aurora Citadel
local_path_submission: W:\CMU_Academics\2025 Spring\62706 Gen Game\Final_Submission_Citadel
priority: standard
publish: true
role: team-member
semester: Spring 2025
slug: aurora-citadel-gen-game
stack:
- Unreal Engine 5
- Wave Function Collapse (WFCPlugin-main 5.4)
- PolyHaven
- Megascans
status: draft
tags:
- unreal-engine-5
- wave-function-collapse
- procedural-generation
- ai-textures
- modular-assets
- game-design
- brutalist-architecture
team_size: '>1 (team confirmed by David, collaborators TBD)'
title: Aurora Citadel — Procedural Generative Game (Unreal Engine 5)
type: portfolio-project
year: 2025
---

> A modular-architecture tower/citadel that generates itself via **Wave Function Collapse** — each play creates a new spatial configuration. Built in Unreal Engine 5 with AI-generated brutalist textures and PolyHaven materials. 324 MB demo video, 16 GB of final assets, UE5 executable delivered.

![module layout](/assets/aurora-citadel-gen-game/Module Layout.jpg)

## Hook
Level design at scale. Rather than authoring a single level, author the **generator**: tiles + adjacency constraints + WFC solver → infinite valid spatial configurations. Each run of Aurora Citadel produces a different navigable tower from the same module vocabulary.

## Context

**Course:** 62-706 Generative System Design, Spring 2025 — final project.
**Role:** team project (David confirmed — collaborators TBD; need to recover team members' names from class submissions or group emails).

**Theoretical grounding** (readings in the submission folder):
- *Served and Servant Spaces* (Louis Kahn, 2.6 MB) — architectural theory of primary vs. supporting spaces
- *The Shadow of Information* (3.4 MB) — information-theoretic framing of architectural legibility

These readings informed the module system: some tiles are "served" (primary programmatic spaces), others "servant" (circulation, infrastructure).

## Approach

**Module vocabulary:**
- 14 FBX module tiles: corners, modules, sockets (24–61 MB each)
- Each tile tagged with adjacency constraints (which tiles can connect on which face)
- Total vocabulary scales to an infinite constraint-satisfying tower

**WFC pipeline:**
1. Define tile set + adjacency rules
2. Seed empty grid; pick random starting tile
3. Propagate constraints; collapse least-entropy cells first
4. Continue until grid fully collapsed → navigable level

**Assets:**
- **AI-generated textures** (4+ PNGs): `A_floating_ultra_r_0219223947_texture.png`, `A_hypermodern_brutal_0219223632_texture.png`, `Futuristic_Cube_Drone_0219222254_texture.png`, `Interstellar_Cargo_Cr_0219223150_texture.png` — brutalist / futuristic architectural textures
- **PolyHaven materials** — brick floor + 6 texture-map channels
- **Megascans** integrations

**Stack:**
- **Unreal Engine 5** — rendering + level scripting
- **WFCPlugin-main 5.4** — Wave Function Collapse plugin (the procedural core)
- **Blueprints** (likely — no C++ source indicated)

## Outcomes

- **Playable tower** — compiled UE5 executable in `Final_Submission_Citadel/`
- **5-minute demo video** — `Game_Design_Final_Video_Demo.mp4` (324 MB)
- **Complete asset library** — 16 GB of modules + textures + materials + UE5 project files
- **Theoretical integration** — Kahn's served/servant space theory mapped onto module typology (nice move for a design-school game class)

## Artifact size (why not on GitHub)

16 GB of UE5 binaries + 324 MB video demo exceeds any reasonable git repo size — Git LFS would help but was out of scope. **Stays local only.** For portfolio: embed the 5-minute demo video on the site (hosted on YouTube or Vimeo — David to upload).

## David — confirm

- **Team members' names** — David confirmed this is a team project; need collaborator names (from Canvas group, email, or class roster)
- **YouTube / Vimeo upload** — the 5-minute demo video exists locally (324 MB); David plans to find the public upload link when time permits
- **Any final presentation slides** separate from the video?

## Links

- Local project: `W:\CMU_Academics\2025 Spring\62706 Gen Game\Aurora Citadel\`
- Final submission: `W:\CMU_Academics\2025 Spring\62706 Gen Game\Final_Submission_Citadel\`
- Demo video (local only, 324 MB): `Final_Submission_Citadel\...\Game_Design_Final_Video_Demo.mp4`
- [WFCPlugin (plugin used)](https://github.com/ikarth/WFCPlugin) — reference for the WFC integration
- Readings in vault: `/assets/aurora-citadel-gen-game/Served and Servant Spaces.pdf`, `/assets/aurora-citadel-gen-game/The_Shadow_of_Information.pdf`

## Related cards

None direct — this is an outlier in David's portfolio (game / procedural, not AI/design-tool). That isolation is actually useful: shows range.

---

*Card built 2026-04-23 from Explore agent Spring 2025 scan. Minimal external-facing content right now (no GitHub, no video URL). Card becomes portfolio-ready once David uploads the demo video to YouTube and confirms team composition.*