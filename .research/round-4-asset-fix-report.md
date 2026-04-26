# Round 4 Asset Fix Report

**Generated:** 2026-04-25 by ASSETS FIX agent.
**Scope:** Implements `.research/round-4-asset-audit.md` recommendations across 9 projects.
**Driver:** `scripts/round4_asset_fix.py` (idempotent, sha1-deduped, frontmatter-aware).
**Total bytes freed:** **296,662,078 bytes** (≈ **282.92 MB**).
**Pipeline status:** embeddings + atlas + layouts all rerun successfully (15 entries, atlas 4096×4096).
**Time elapsed:** 0.3 s for the asset fix; ~30 s including pipeline reruns.

---

## Per-project results

### 1. `a-game-of-deterioration` (WRONG-HERO, full reseed)

- **Files deleted:** 17 (≈ 67 MB) — every single file was a wrong-project StreamDiffusion gif from `spectral-facades`'s source folder (`cfg-conparision.png`, `demo-01.gif`…`demo-10.gif`, `img2img1/2.gif`, `img2img-example.png`, `input.png`, `papercube-test.png`, `white.jpg`).
- **Files added:** 16 — sourced from `W:\CMU_Academics\Fall 2024 CMU\112 Term Project - Final - Submission\assets\`:
  - `char1-{back,front,left,right}.png` (4-direction sprite)
  - `{speed,radius,burst,power}-icon.png` (equipment icons)
  - `texture-{bigleaves,bricks,dirt,pathrocks}-{original,deteriorated}.png` (4 paired texture sets)
- **Hero changed:** YES.
  - Old: `/assets/a-game-of-deterioration/demo-09.gif` (StreamDiffusion, wrong project)
  - New: `/assets/a-game-of-deterioration/char1-front.png` (real character sprite)
- **`gif_hero` cleared** (no real gameplay GIF available)
- **Anomaly:** No gameplay screenshots, GIFs, or storyboards exist in the actual 112 Term Project source folder — only the raw asset files (sprites, textures, icons). The Notion page references `Untitled-video-_10_.gif`, `Untitled-video-_11_.gif`, and `story_board.jpg`, but those exports were not present in the local working folder. Hero is therefore the front-facing character sprite as a placeholder; David should capture or re-export the gameplay GIFs from the running game for a stronger hero.

### 2. `aurora-citadel-gen-game` (WRONG-HERO + heavy cleanup)

- **Files deleted:** 29 (≈ 197 MB):
  - 6 PolyHaven brick PBR textures (≈ 56 MB)
  - 3 Megascans clover textures
  - 3 Rugged Terrain stock textures (one alone was 90 MB)
  - 1 weChat screenshot
  - 1 third-party WFCPlugin UI screenshot
  - 8 surplus AI-prompt input textures (vault explicitly enumerates 4 keepers)
  - 2 raw ChatGPT-generated concept inputs (one was the wrong hero)
  - `image-0.png` and `texture-0.png` (generic image-dump duplicates)
  - `module-layout.jpg`, `module-layout-plan.jpg`, `hero.jpg` — sha1-identical kebab duplicates of the canonical `Module Layout.jpg`/`Module Layout plan.jpg`
- **Files remaining (8):** the 4 keeper AI textures + `Module Layout.jpg`, `Module Layout plan.jpg`, and 2 theory PDFs (Kahn, Information Shadow).
- **Hero changed:** YES.
  - Old: `/assets/aurora-citadel-gen-game/chatgpt-image-apr-12-2025-08-36-27-pm.png`
  - New: `/assets/aurora-citadel-gen-game/Module Layout.jpg` (vault canonical, real WFC module work)
- **No live gameplay screenshot available** — the 324 MB demo MP4 is local-only and was not extracted; David needs to upload it to YouTube/Vimeo or extract a frame for a stronger hero.

### 3. `s25-team-26-paper-viz` (WRONG-HERO, no replacement available)

- **Files deleted:** 1 (164 KB) — `img-1.webp` was a HW5 social-network profile pic.
- **Files added:** 0.
- **Hero changed:** YES. Old `/assets/s25-team-26-paper-viz/img-1.webp` → `null` (PlaceholderHero will render).
- **`images:` cleared to `[]`.**
- **Body cleanup:** stripped `![hero](/assets/s25-team-26-paper-viz/hero.png)` markdown ref.
- **Anomaly:** no real Three.js paper-viz screenshots exist anywhere. The `web-app-final-project/s25_team_26/project/` folder contains backend Django code, scrape JSONs, and `react-frontend/src/assets/react.svg` — nothing visual. Project status remains `draft`; David needs to re-run the local app and capture demo screenshots.

### 4. `thesis-flagship` (WRONG-HERO + cross-project cleanup)

- **Files deleted:** 12 (≈ 2.7 MB) — all sha1-confirmed duplicates of files in `semantic-canvas/`:
  - 5 tool UI screenshots (`lineage-view-ui`, `fashion-interface`, `form-forge`, `deeprise-interface`, `nano-generated-shoe`)
  - 5 ch4-* tool architecture diagrams
  - 2 concept/analysis figures (`concept-config-space.png`, `stage1-vs-stage2-comparison.png`)
- **Files retained:** the worldmaking diagram, territory-map.png, all pre-thesis PDFs/JPGs, `proposal-presentation.mp4` (107 MB, kept per constraints), `hero.png` (sha1-identical copy of the worldmaking diagram, kept as harmless redundancy).
- **Hero changed:** YES.
  - Old: `/assets/semantic-canvas/p3-stage2-session2-composite.png` (cross-project pointer + wrong content)
  - New: `/assets/thesis-flagship/pre-thesis-II-A1_Worldmaking_Diagram_DavidChen.png` (vault canonical, lives in the project's own folder)
- **Note on `src/pages/thesis.astro`:** that file has hardcoded `/assets/semantic-canvas/p3-stage2-session*-composite.png` references (lines 32–33, 73–74). Per task constraints I did not modify `src/pages/`. Those references still resolve correctly because the participant-study composites in `semantic-canvas/` were not deleted.

### 5. `semantic-canvas` (cleanup only)

- **Files deleted:** 7 (≈ 215 KB):
  - 5 `analysis_thumbs_NN.png` debug atlas tiles
  - 2 `frontend_public_templates_*.png` debug scaffold renders
- **No exact-sha1 file-pair duplicates were found** in the dir — the 53 "extras" reported by the audit are all unique David assets (per-participant canvases, journeys, longitudinal lineages). They are correctly scoped to the tool project; thesis-flagship's duplicates were the redundancy and have been removed (above).
- **Hero unchanged** (`semantic-canvas-ui.png`).
- **`images:` validated** — all 24 entries still resolve.

### 6. `l43d-cad-mllm` (cleanup only)

- **Files deleted:** 5 sha1-confirmed underscore-named duplicates (`combined_summary.png`, `data_amplification.png`, `operations_comparison.png`, `truncation_distribution.png`, `versions_per_model.png`). Kebab-case versions kept (already referenced by site frontmatter).
- **Total freed:** ≈ 951 KB.
- **Hero unchanged** (`null`, intentional).

### 7. `fiber-based-pavilion` (cleanup only)

- **Files deleted:** 2 (≈ 366 KB) — `wood-facade-texture-...-100319045.jpg`, `...-100319121.jpg`. Both are stock Milan-Expo wood facade photos from the `Independent Study\wood texture samples\` folder; this project is CNT carbon-fiber, not wood.
- **Hero unchanged** (`column-form-finding.gif`).

### 8. `membrane-form-finding` (cleanup only)

- **Files deleted:** 2 (≈ 3 MB) — `notion-005-image.png`, `notion-006-image.png`. Generic Notion-export filenames with no provenance trail in `asset-manifest.json` (external_assets count = 0). Per audit recommendation D, dropped.
- **Hero unchanged** (`membrane-3.png`).

### 9. `skill-bridge-datavis` (cleanup only)

- **Files deleted:** 3 (≈ 1.2 MB):
  - `notion-004-image.png`, `notion-005-image.png` — unverified Notion exports
  - `background.png` — Django template static asset, not a David-authored design figure (per audit's classification of it as "borderline / not a primary content image")
- **Hero unchanged** (`dashboard-hero.gif`).

---

## Frontmatter changes summary

| Slug | hero_image change | gif_hero change | images count |
|---|---|---|---|
| a-game-of-deterioration | demo-09.gif → char1-front.png | demo-09.gif → null | 17 → 16 |
| aurora-citadel-gen-game | chatgpt-image-... → Module Layout.jpg | (n/a) | 3 → 6 |
| s25-team-26-paper-viz | img-1.webp → null | (n/a) | 1 → 0 |
| thesis-flagship | /assets/semantic-canvas/p3-...png → /assets/thesis-flagship/...Worldmaking_Diagram...png | (n/a) | 10 → 2 |
| semantic-canvas | (no change) | (no change) | 24 → 24 |
| l43d-cad-mllm | (no change, null) | (n/a) | 4 → 4 |
| fiber-based-pavilion | (no change) | (no change) | 13 → 11 |
| membrane-form-finding | (no change) | (no change) | 5 → 3 |
| skill-bridge-datavis | (no change) | (no change) | 11 → 8 |

`_hero_curated: true` preserved/set on all 9 updated frontmatter files.

---

## Verification

```
[OK] All hero_image, gif_hero, and images entries resolve to existing files.
```

Walked every `src/content/projects/*.md`; every populated `hero_image`, `gif_hero`, and `images[]` entry resolves to an existing file under `public/`.

---

## Pipeline rerun

| Script | Result |
|---|---|
| `python scripts/embed_projects.py --force` | wrote `public/data/embeddings.json` (719.3 KB → 737.8 KB after atlas UV merge), 15 entries, dim=768 |
| `python scripts/build_atlas.py` | wrote `public/data/atlas.png` (9085.4 KB, 4096×4096), updated embeddings with thumbnail UVs |
| `python scripts/precompute_layouts.py` | wrote `public/data/layouts.json` (100.8 KB), 4 layouts (thesis_default, umap, pca, metadata) + 6 axis directions |

All three scripts exited cleanly. 15 project entries; the data shape downstream consumers expect is preserved.

---

## Anomalies / open items for David

1. **No gameplay screenshots for `a-game-of-deterioration`.** Source folder has only sprites/textures/icons, no rendered gameplay. Hero is currently a character sprite as a placeholder. David should capture demo GIFs from a live run of `main.py` or pull the `Untitled-video-_10_.gif` / `_11_.gif` from the Notion page (S3 URLs expire, so re-fetch on demand).
2. **No paper-viz screenshots for `s25-team-26-paper-viz`.** Hero is `null`; PlaceholderHero will render. David needs to re-run the local Django+Three.js app and capture demo screenshots.
3. **No live `aurora-citadel` UE5 viewport screenshots.** The 324 MB `Game_Design_Final_Video_Demo.mp4` is local-only. Module Layout.jpg is a structural diagram, not an in-engine render. David should upload the demo video to YouTube and/or extract a frame as a stronger hero.
4. **`src/pages/thesis.astro` cross-project asset references** (lines 32–33, 73–74) still point into `/assets/semantic-canvas/`. They resolve correctly (those files were not deleted), but per task constraints I did not modify `src/pages/`. If a future refactor moves participant-study composites out of `semantic-canvas/`, those hardcoded astro paths will break.
5. **`thesis-flagship/hero.png`** is sha1-identical to `pre-thesis-II-A1_Worldmaking_Diagram_DavidChen.png` (both 473,997 bytes). Kept the duplicate for safety; could be deleted in a future cleanup pass without effect.

---

*Driver:* `scripts/round4_asset_fix.py`
*Log:* `.research/round-4-asset-fix-log.txt`
