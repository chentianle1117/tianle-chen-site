---
_hero_curated: true
artifacts:
- Game_Design_Final_Video_Demo.mp4 (324 MB, 5-minute demo, local only)
- Final_Submission_Citadel/ (~10 GB, local only)
- 10 hand-modeled FBX city modules (corners, crosses, sockets, tops — 24-61 MB each)
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
hero_image: /assets/aurora-citadel-gen-game/Module Layout.jpg
images:
- /assets/aurora-citadel-gen-game/Module Layout.jpg
- /assets/aurora-citadel-gen-game/Module Layout plan.jpg
- /assets/aurora-citadel-gen-game/a-hypermodern-brutal-0219223632-texture.png
- /assets/aurora-citadel-gen-game/a-floating-ultra-r-0219223947-texture.png
- /assets/aurora-citadel-gen-game/interstellar-cargo-cr-0219223150-texture.png
- /assets/aurora-citadel-gen-game/futuristic-cube-drone-0219222254-texture.png
image_captions:
- Module library rendered in 3D — hand-modeled ruined-city tiles (roads, towers, rubble, snow) that the solver draws from
- Tile plan view — the edge-socket grammar the WFC solver matches on; blue and red road stubs are the connectors that must line up between neighbors
- AI-generated brutalist surface — weathered concrete with red LED strips, the surveillance-state palette applied to the modules
- AI-generated texture for a floating structure module
- AI-generated texture atlas for a patrol-agent mesh (Interstellar Cargo)
- AI-generated texture for the cube/drone patrol agent
local_path: W:\CMU_Academics\2025 Spring\62706 Gen Game\Aurora Citadel
local_path_submission: W:\CMU_Academics\2025 Spring\62706 Gen Game\Final_Submission_Citadel
priority: standard
publish: true
semester: Spring 2025
slug: aurora-citadel-gen-game
stack:
- Unreal Engine 5.4
- WFCPlugin 5.4 (Wave Function Collapse)
- Behavior Trees + EQS
- PolyHaven / Megascans
- AI-generated textures
status: ready
summary: A procedural surveillance game built in Unreal Engine 5. A library of ten
  hand-modeled FBX city modules is tagged with edge sockets, then a Wave Function Collapse
  solver assembles a different ruined-city layout every run under adjacency constraints —
  patrolled by behavior-tree AI agents. Set in a post-catastrophe Nordic future ruled
  from a levitating brutalist fortress.
tags:
- unreal-engine-5
- wave-function-collapse
- procedural-generation
- ai-textures
- modular-assets
- game-design
- brutalist-architecture
title: Aurora Citadel — Procedural Generative Game (Unreal Engine 5)
type: portfolio-project
year: 2025
---

> *"A floating fortress, an analog resistance, a world ruled by digital eyes."* Aurora Citadel is a speculative surveillance game whose city builds itself. Rather than hand-authoring one level, we authored a **generator**: ten hand-modeled FBX modules, tagged with edge sockets, fed to a **Wave Function Collapse** solver that lays out a different navigable ruin every run — then patrolled by behavior-tree AI agents. Built in Unreal Engine 5.4 for CMU's 62-706 Generative System Design, Spring 2025.

![module layout](/assets/aurora-citadel-gen-game/Module Layout.jpg)

## What it is

Aurora Citadel is set in a post-catastrophic Nordic future. In the game's fiction, a quantum-fusion accident irradiates Finland's southern coast, and an authoritarian Nordic Federation deploys an all-seeing AI surveillance network from a levitating brutalist fortress — the Aurora Citadel. Semi-autonomous agents patrol the devastated cities below, tracking motion and executing directives; the player moves through the ruins between analog resistance and algorithmic control. The premise is the design brief: a city built for surveillance, whose spatial logic is itself procedurally generated so that no two playthroughs share the same map.

The technical thesis of the class was generative *systems*, not generative *content* one-off. So the deliverable is not a level — it is the machine that produces levels. You author a vocabulary of tiles plus the rules for how they may connect, and the solver produces an endless family of maps that all obey those rules while never repeating.

## The problem

Modular level generation has a standard failure mode: stitch tiles together by random placement and you get roads that dead-end into walls, buildings that clip through streets, and layouts with no coherent circulation. The interesting constraint is **legibility** — a generated city has to read as a city, with continuous roads, plausible blocks, and navigable space for the patrol AI to path through.

That framing is where the two assigned readings come in. *Served and Servant Spaces* (Lucy Lethbridge, *The Architectural Review*, 2013) takes its title from Louis Kahn's distinction between **served** spaces (primary program) and servant spaces (the circulation and infrastructure that support them). *The Shadow of Information* (Perspecta 53: *Onus*, Yale School of Architecture, 2020) frames architecture through information and observation. Together they gave the module system a rule basis: some tiles are served (the building blocks — towers, ruins, program), others are servant (the roads and open ground that connect and surveil them). The adjacency grammar encodes that split — a road socket must meet a road socket, so circulation stays continuous and the surveilled streets remain coherent.

## Architecture

<figure class="diagram">
  <img src="/assets/aurora-citadel-gen-game/architecture.svg" alt="Three-lane pipeline: hand-modeled FBX modules become edge-tagged Tile2D assets; a Wave Function Collapse solver collapses a grid under adjacency, boundary, and tag-count constraints; the solved grid is assembled in UE5 with AI-generated textures and patrolled by behavior-tree agents." />
  <figcaption>The generation pipeline — author the vocabulary, solve the grid with WFC, assemble and play in UE5.</figcaption>
</figure>

The pipeline has three stages: author the tile vocabulary, solve the grid, assemble the world.

### 1 — Author the vocabulary

The base geometry is a library of **ten hand-modeled FBX modules** (24–61 MB each): `corner`, `cross`, `linear`, `empty`, `modulea`, `moduleb`, `2socketsblack`, `2socketsredblack`, `topblack`, and `topred`. Each is a chunk of ruined Nordic city — a road segment, a building cluster, a rubble field, a snow-covered lot.

Each module is wrapped in a UE5 Tile2D asset (`UWFCTileAsset2D`), which is what the solver actually reasons over. The custom tile set (under the project's `WFCPlugin/2D/Tiles/`, with the imported meshes and AI textures in `Our_Tiles/`) includes `Tile2D_Corner`, `Tile2D_Cross`, `Tile2D_Straight`, `Tile2D_End`, `Tile2D_Empty`, `Tile2D_RedEnd`, `Tile2D_RedIntersect`, `Tile2D_RedIntersectLg`, and the large-corner `CornerLgA` / `CornerLgB` pieces. A tile asset stores which actor to spawn, and — crucially — edge-socket tags on each of its four faces.

The socket grammar is visible in the tile plan view: gray tiles carry colored road stubs on their edges (blue road and red road), plus wall and open-ground edges. The tag on an edge declares what may abut it. This is the served/servant split made mechanical — road edges only meet road edges, so streets stay continuous; building edges sit against ground; the two "colors" of road (blue / red) form two distinct circulation networks that don't cross-contaminate.

### 2 — Solve the grid

Generation uses WFCPlugin 5.4 (by Bohdon Sayre), an Unreal plugin implementing the [Wave Function Collapse](https://github.com/mxgmn/WaveFunctionCollapse) family of constraint-propagation algorithms. Its object model composes cleanly:

| Piece | Role |
|---|---|
| `UWFCModel` / `UWFCTileSet` | the full tile vocabulary, with rotation permutations auto-expanded |
| `UWFCGridConfig` | grid class (2D here) and dimensions |
| `UWFCConstraint[]` | the rules — edge/adjacency (matching sockets), boundary, and tag-count caps |
| `UWFCCellSelector` | picks which cell to collapse next — entropy-based |

The solve loop is the standard WFC cycle:

```
seed the grid — every cell holds all possible tiles
while any cell is unresolved:
    propagate  — for each cell, prune tiles whose sockets
                 can't match a surviving neighbor
    select     — choose the lowest-entropy cell
                 (fewest remaining options — most likely to conflict)
    collapse   — commit that cell to a single tile
→ all cells resolved and adjacency-valid, or contradiction
```

The plugin has **no backtracking**: if propagation drives a cell to zero possibilities, the generator hits a contradiction and errors out. The practical recovery — and a real part of the work — is to re-seed and to tune the tile tags and counts so contradictions become rare. Fewer over-constrained edges, sensible caps on scarce tiles, and rotation permutations all widen the solution space so a run is likely to complete. This tuning is the difference between a generator that usually produces a coherent city and one that usually deadlocks.

### 3 — Assemble and play

At runtime a `WFCGeneratorComponent` runs the generator on `BeginPlay` and, as each cell resolves, spawns the corresponding tile actor at its grid coordinate — dropping the FBX module into the world. On top of the assembled geometry:

- **Surfacing.** Modules are dressed in AI-generated brutalist textures — weathered concrete panels with red LED strips (`A_hypermodern_brutal`, `A_floating_ultra_r`, and others), matching the surveillance-state palette — plus PolyHaven and Megascans PBR materials (Fresh Windswept Snow, Rocky Ground) blended through an auto-material for the snowy ground.
- **Patrol agents.** The surveillance fiction is enforced by NPCs driven by behavior trees and EQS (Environment Query System): patrol-path following, random-location wandering, and a detect-and-chase alert state. Agent meshes (cube / drone / display units) also use AI-generated textures. The agents path through whatever street layout the solver produced that run.
- **Play surface.** The game ships as a top-down build with a minimap driven by a render-target camera, so the player reads the generated block structure from above as they evade the sensor network.

The result: same ten-module vocabulary, a new coherent ruined city every time you launch.

## Concrete decisions

- **2D grid, not 3D.** WFCPlugin supports both. A 2D grid of city blocks (rather than a 3D voxel solve) keeps the problem tractable and maps directly onto a top-down surveillance game — the plan *is* the play space.
- **Sockets carry the meaning, not just geometry.** By tagging edges with named connector types (road / wall / ground, split by color) rather than raw mesh silhouettes, the adjacency rules stay editable and the served/servant grammar is expressed in data, not baked into meshes.
- **AI textures for a specific look, PBR scans for the ground.** Generated textures gave the brutalist, red-lit surveillance aesthetic that no stock library carried; Megascans/PolyHaven handled the physically-grounded snow and rock where realism mattered more than authored style.
- **Re-seed over backtrack.** Given the plugin's no-backtracking limitation, effort went into constraint tuning to make contradictions unlikely, rather than trying to bolt on a backtracking solver.

## My contribution

This was a team final project. My work was on the **generative pipeline** that makes the case study interesting: building the module set and wrapping the FBX geometry into edge-tagged tile assets, setting up the WFC tile/adjacency configuration (sockets, constraints, and the tuning that keeps the solver from deadlocking), and the AI-texture surfacing that gives the ruins their brutalist surveillance look. The served/servant grammar from the readings is the design idea I mapped onto the socket tags.

## Outcomes

- **Playable build** — a packaged UE5 5.4 executable (`Aurora Citadel.exe`) that generates a fresh city on launch and runs the patrol AI.
- 5-minute demo video — `Game_Design_Final_Video_Demo.mp4` (324 MB), the public-facing artifact.
- Complete asset library — roughly 10 GB of modules, tile assets, AI + PBR textures, and UE5 project files.
- A working design-to-mechanics mapping — architectural theory (served/servant spaces, information/observation) translated into an executable adjacency grammar rather than left as framing.

## Why it's not on GitHub

Ten-plus GB of UE5 binaries plus a 323 MB video exceeds any reasonable git repo; Git LFS would help but was out of scope for a course deadline. The build and full asset set stay local — the demo video and the renders above are the public artifacts. There is no hosted playable build.

## Links

- [WFCPlugin — Bohdon Sayre](https://github.com/bohdon/WFCPlugin) — the UE5 Wave Function Collapse plugin used (v5.4)
- [Wave Function Collapse — mxgmn](https://github.com/mxgmn/WaveFunctionCollapse) — the original algorithm the plugin implements
- Readings: `/assets/aurora-citadel-gen-game/Served and Servant Spaces.pdf` (Lethbridge, *The Architectural Review*, 2013) · `/assets/aurora-citadel-gen-game/The_Shadow_of_Information.pdf` (Perspecta 53, Yale, 2020)
- Local project: `W:\CMU_Academics\2025 Spring\62706 Gen Game\` (Aurora Citadel build + Final_Submission_Citadel)

## Related cards

An outlier in the portfolio — game / procedural rather than AI-tooling — which is the point: it shows the same systems-thinking (author the generator, not the artifact) applied to a game engine.
