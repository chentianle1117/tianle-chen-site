# Round 4 Asset Audit — `tianle-chen-site/public/assets/`

**Generated:** 2026-04-25 by ASSETS AUDIT AGENT.
**Scope:** 15 published portfolio projects.
**Method:** triangulated each project across (1) Notion canonical page where available, (2) vault `Portfolio/<slug>.md` frontmatter + body, (3) vault `Portfolio/_assets/<vault_dir>/` file listing, (4) site `public/assets/<slug>/` file listing, (5) site `src/content/projects/<slug>.md` frontmatter, and (6) `_research/asset-manifest.json` external_assets context (where each "extra" file came from on disk).

---

## EXECUTIVE SUMMARY

**Total projects with WRONG hero (recommended swap): 4 of 15**

1. `a-game-of-deterioration` — hero `demo-09.gif` is from the StreamDiffusion installation (`spectral-facades`); the actual project is a Python/cmu_graphics 2D game.
2. `aurora-citadel-gen-game` — hero `chatgpt-image-apr-12-2025-08-36-27-pm.png` is a raw AI-generated brutalist texture (an *input* to the UE5 project), not a screenshot of David's actual playable Citadel.
3. `s25-team-26-paper-viz` — hero `img-1.webp` is a profile-picture asset from the Web App Dev HW5 social-network homework, not the team's 3D paper-viz final project.
4. `thesis-flagship` — hero is `/assets/semantic-canvas/p3-stage2-session2-composite.png` which (a) points into a *different project's directory*, and (b) is a study-participant composite, not the thesis flagship visual. Vault canonical hero is the Worldmaking Diagram.

**Total projects with EXTRANEOUS gallery files (recommended cleanup): 9 of 15**

1. `a-game-of-deterioration` — **17 of 17** site files are wrong-project (StreamDiffusion). Vault `_assets/a-game-of-deterioration/` is *empty*.
2. `aurora-citadel-gen-game` — **33 extra files**: 16 AI-prompt textures, 6 PolyHaven brick textures, 3 third-party Megascans clover textures, 3 Rugged Terrain reference textures, plus ChatGPT-generated images and a WFCPlugin screenshot. These are *upstream inputs/references*, not David's outputs.
3. `s25-team-26-paper-viz` — **1 file** (`img-1.webp`), which is wrong (profile pic from HW5 not the Paper Viz project).
4. `semantic-canvas` — **53 extra files**. Mostly David's own Semantic Canvas/thesis study artifacts (legitimate), but volume is excessive and overlaps with `thesis-flagship` (e.g., `ch4-architecture-diagram.png`, `ch4-axis-projection-pipeline.png`, etc., are duplicated across both folders).
5. `thesis-flagship` — **15 extra files**, all of which are Semantic Canvas tool screenshots (`form-forge.png`, `deeprise-interface.png`, `lineage-view-ui.png`, `fashion-interface.png`, `concept-config-space.png`, `ch4-*.png`, `proposal-presentation.mp4`, `territory-map.png`). These ARE David's work but they are duplicated with `semantic-canvas/` and conflict with the vault's hero choice (Worldmaking diagram).
6. `l43d-cad-mllm` — **5 extra files** = exact kebab-case duplicates of the 5 underscore-named originals already in the folder (`combined-summary.png` vs `combined_summary.png`, etc.). Pure duplication; same project, but cleanup needed.
7. `fiber-based-pavilion` — **2 extra files**: `wood-facade-texture-wood-texture-wood-texture-pavilion-facade-milan-expo-100319045.jpg` + `...-100319121.jpg`. These are stock-photo wood-facade reference textures from `Independent Study\wood texture samples`, NOT David's pavilion. The pavilion uses CNT carbon-fiber, not wood.
8. `membrane-form-finding` — **2 extra files**: `notion-005-image.png`, `notion-006-image.png`. Filenames are generic Notion exports — provenance unclear; should be verified or removed.
9. `skill-bridge-datavis` — **3 extra files**: `background.png` (a DataViz-aijobs Django static asset), `notion-004-image.png`, `notion-005-image.png` (generic Notion exports — uncertain provenance).

**Top 3 most egregious mismatches**

1. **`a-game-of-deterioration`** — 100% wrong: every single file in the site folder is a StreamDiffusion installation gif/png from `spectral-facades`'s source folder. Course should be a Python 2D game with hand-drawn pixel terrain; the user sees AI-generated facade gifs instead. The user explicitly flagged this and was correct.
2. **`aurora-citadel-gen-game`** — hero is an AI-generated reference image (an *input* to the UE5 game, not a screenshot of the actual playable Citadel). Folder has 33 extras: 16 AI prompt-texture files, 6 PolyHaven brick textures, 3 Megascans clover textures, plus terrain stock photos. Almost none of these are David's *output* — they're his *resources*.
3. **`s25-team-26-paper-viz`** — site has only one file (`img-1.webp`) and it is a user profile picture from `davidch2/hw5/profile_pictures/`, completely unrelated to the team's 3D paper visualization. The actual project's hero (`_assets/s25-team-26/hero.png`) doesn't exist on disk.

**Per-project recommended hero swap (15 lines)**

```
3t3d-vit-2d-to-3d              → keep (data_3d.png; vault prefers arch_diagram.jpg, both fine; consider swap to arch_diagram.jpg for aesthetic alignment with vault)
a-game-of-deterioration        → SWAP to gameplay.gif (AND repopulate _assets dir from local_path: W:\CMU_Academics\Fall 2024 CMU\112 Term Project - Final - Submission\)
aurora-citadel-gen-game        → SWAP to "Module Layout.jpg" (vault canonical) — captures David's WFC modular tower work, not a third-party AI texture
design-the-ambience            → keep (hero.gif)
fiber-based-pavilion           → keep (column-form-finding.gif works; vault hints column-catalogue-1.png)
generative-urbanism            → keep (evolution-1.png)
l43d-cad-mllm                  → keep (no hero set; poster-driven gallery is fine; pick combined_summary.png or operations_comparison.png if a hero is needed)
membrane-form-finding          → keep (membrane-3.png; vault wants membrane-1.png — minor)
s25-team-26-paper-viz          → SWAP — current `img-1.webp` is a HW5 profile pic. Need a real hero from W:\CMU_Academics\2025 Spring\17637 Web App Dev\web-app-final-project\s25_team_26\ (actual Three.js paper viz); user must source from project demo screenshots
semantic-canvas                → keep (semantic-canvas-ui.png) — but DEDUPE 53 extras and decide canonical location for ch4 diagrams (semantic-canvas vs thesis-flagship)
skill-bridge-datavis           → keep (dashboard-hero.gif; matches vault)
spectral-facades               → keep (hero.gif; matches vault and Notion)
synthetic-texture-deterioration → keep (facade-aging-2.png; vault wants facade-aging-1.png — equivalent)
thesis-flagship                → SWAP to /assets/thesis-flagship/pre-thesis-II-A1_Worldmaking_Diagram_DavidChen.png (vault canonical) — current `/assets/semantic-canvas/p3-stage2-session2-composite.png` is wrong-folder + wrong-content
wire-bending                   → keep (bending-process.gif; vault wants hero.png — both are legitimate, GIF is more dynamic)
```

**Estimated asset-correction effort**

| Effort tier | Projects | Rough work |
|---|---|---|
| **High (need new assets)** | `a-game-of-deterioration`, `s25-team-26-paper-viz` | Need to recover/locate David's actual project screenshots from `W:\CMU_Academics\Fall 2024 CMU\112 Term Project - Final - Submission\` and `W:\CMU_Academics\2025 Spring\17637 Web App Dev\web-app-final-project\s25_team_26\`. Run capture/extraction. ~1–2 hours each. |
| **Medium (swap hero + cleanup)** | `aurora-citadel-gen-game`, `thesis-flagship` | Swap hero pointer in site frontmatter; for Aurora, decide which AI textures to keep as "process" material vs. delete. Remove duplicate files. ~30 min each. |
| **Low (dedupe / cleanup only)** | `l43d-cad-mllm`, `fiber-based-pavilion`, `membrane-form-finding`, `skill-bridge-datavis`, `semantic-canvas` | Delete duplicate/stock/notion-export files; no hero change. ~15 min total. |
| **None** | 6 projects with clean assets | n/a |

**Total estimated time:** 4–5 hours of cleanup work across all 15 projects.

---

## Per-project audit

Notation:
- **NOTION HERO**: an inline-image hint from the published Notion page (URLs are S3-signed and expire, so we describe by alt text or surrounding context).
- **VAULT _assets COUNT** vs **SITE public/assets COUNT** show fan-out from broadened copy script.
- **EXTRA in site (NOT in vault)** = files added by external_assets sweep.

---

## 1. `3t3d-vit-2d-to-3d`

CURRENT SITE HERO: `/assets/3t3d-vit-2d-to-3d/data_3d.png`
NOTION HERO: not in public Notion portfolio (CMU 16-825 final project, 2025 Fall)
VAULT FRONTMATTER hero_image: `_assets/3t3d/arch_diagram.jpg`
VAULT _assets COUNT: 12 files (`_assets/3t3d/`)
SITE public/assets COUNT: 13 files (gained `hero.jpg`)

ASSESSMENT:
- HERO CORRECT? **Yes-ish.** `data_3d.png` is a real David asset (3D dataset visualization, 1979x940). However, vault prefers `arch_diagram.jpg` (model architecture diagram, 9432x2303 — wide banner). Either works as hero; vault's choice is more banner-friendly.
- Recommended: keep `data_3d.png` OR swap to `arch_diagram.jpg` for stronger "I built this model" framing. Either is correct.

GALLERY ASSESSMENT:
- Site `images:` array: `data_sketch.png`, `hero.jpg`, `comparison.jpg`, `dataset_creation1.jpg`, `val_train_loss.png` — all David's.
- Files in public NOT in vault: `hero.jpg` only. Origin: this is from `W:\CMU_Academics\2025 Fall\Learning for 3D Vision\CMU16825_Final_project\poster_materials` (per asset-manifest external_assets list — the poster materials folder is the *correct* project source despite the course-code mismatch in vault frontmatter, see ANOMALIES).
- Externals **not** in scope for this project — none.

ANOMALIES:
- Course name mismatch in frontmatter: vault says `11-685 Introduction to Deep Learning` but the actual external assets are from `16-825 Learning for 3D Vision`. Need David to confirm. Likely the project served as both courses' final, or the inventory tagged a different folder. Worth a 30-second clarification but does not affect asset correctness.

---

## 2. `a-game-of-deterioration`  ⚠️  USER-FLAGGED, CRITICAL

CURRENT SITE HERO: `/assets/a-game-of-deterioration/demo-09.gif`
NOTION HERO: published Notion page `https://www.notion.so/16a33d12d95a80779ab7f488cbc13f1f`. Embedded images (verified via MCP fetch):
  - `Untitled-video-_10_.gif` — gameplay GIF #1 (drawing terrain → entering game)
  - `Untitled-video-_11_.gif` — deterioration & restoration gameplay GIF
  - `speed_icon.png`, `radius_icon.png`, `burst_icon.png`, `power_icon.png` — 4 equipment icons
  - `Char1_back.png`, `Char1_left.png`, `Char1_front.png`, `Char1_right.png` — 4-direction sprite
  - `BIGLEAVES.png` (×2 pristine/deteriorated), `BRICKS.png` (×2), `DIRT.png` (×2), `PATHROCKS.png` (×2) — texture pairs
  - `story_board.jpg` — game workflow storyboard

VAULT FRONTMATTER hero_image: `_assets/a-game-of-deterioration/gameplay.gif`
VAULT _assets COUNT: **0 files** — vault folder is EMPTY.
SITE public/assets COUNT: 17 files. **NONE match what Notion or vault expect.**

ASSESSMENT:
- HERO CORRECT? **NO. CATEGORICALLY WRONG.** `demo-09.gif` is from `W:\CMU_Academics\Fall 2024 CMU\Mapping and TouchDesigner\Stream Diffusion Installation\StreamDiffusion\assets\` — that's the source folder for the **`spectral-facades`** project (Mapping & TouchDesigner / StreamDiffusion installation). The current site hero is a real-time AI-generated façade gif, not a Python game with hand-drawn terrain.
- Recommended: `recommended_hero = gameplay.gif` (or `terrain-editor.gif`, or one of the Notion `Untitled-video-_10_/_11_.gif` exports). Reason: project is a 2D Python game; hero must be a screenshot/GIF of the actual game.

GALLERY ASSESSMENT:
- Site's `images:` array currently includes 16 files; **all 16 are wrong-project** (StreamDiffusion gifs, papercube test, white background, input.png).
- Files in public/assets/ NOT in vault: all 17 (`cfg-conparision.png`, `demo-01.gif` through `demo-10.gif`, `img2img-example.png`, `img2img1.gif`, `img2img2.gif`, `input.png`, `papercube-test.png`, `white.jpg`).
- Are any clearly NOT this project? **All 17 are wrong-project.** Per asset-manifest external_assets, all came from `W:\CMU_Academics\Fall 2024 CMU\Mapping and TouchDesigner\Stream Diffusion Installation\` (which is `spectral-facades`'s source) and `W:\CMU_Academics\Fall 2024 CMU\Mapping and TouchDesigner\Assignment 3 Projection Mapping\` (which is also `spectral-facades`-adjacent).

ANOMALIES:
- Vault `_assets/a-game-of-deterioration/` is **completely empty**. The project's actual local source is `W:\CMU_Academics\Fall 2024 CMU\112 Term Project - Final - Submission\` (per vault frontmatter `local_path`). The Phase 1 IMG-A asset sweep apparently couldn't find files there and broadened to *Stream Diffusion* (probably from a fuzzy match on the word "deterioration" — which appears in both projects' descriptions).
- Recovery path: need to capture screenshots/GIFs from the actual game's Submission folder, or download the 6 expected images by alt-text from the Notion page (Notion has `Untitled-video-_10_.gif` and `_11_.gif` as the canonical gameplay GIFs).
- Note: these files ARE legitimately David's work — but they belong to `spectral-facades`, NOT this project. They should remain in `spectral-facades/` (where they are correctly placed already; spectral has 11 site files, 11 vault files, 0 extras — clean).

---

## 3. `aurora-citadel-gen-game`

CURRENT SITE HERO: `/assets/aurora-citadel-gen-game/chatgpt-image-apr-12-2025-08-36-27-pm.png`
NOTION HERO: not in public Notion portfolio (no public Aurora Citadel page; the Notion search returned only an `HW1` page mentioning "the Aurora Citadel" in narrative context — not a dedicated portfolio page).
VAULT FRONTMATTER hero_image: `_assets/aurora-citadel/Module Layout.jpg`
VAULT _assets COUNT: 4 files (`Module Layout.jpg`, `Module Layout plan.jpg`, `Served and Servant Spaces.pdf`, `The_Shadow_of_Information (1).pdf`)
SITE public/assets COUNT: 37 files (33 extras)

ASSESSMENT:
- HERO CORRECT? **NO.** Current hero is a raw ChatGPT-generated brutalist scene (no UE5, no WFC modules visible). It's an *input/inspiration* to David's Citadel work, not a screenshot of his actual playable WFC tower.
- Recommended: `recommended_hero = module-layout.jpg`, reason = vault canonical, shows David's WFC module vocabulary (the actual project artifact). Alternative: extract a frame from the local 324 MB demo video `Game_Design_Final_Video_Demo.mp4`.

GALLERY ASSESSMENT:
- Site's `images:` array: `chatgpt-image-apr-12-2025-08-36-27-pm.png`, `image-0.png`, `chatgpt-image-apr-12-2025-08-54-13-pm.png` — all are reference/input images, not David's WFC outputs.
- Files in public NOT in vault (33):
  - **16 AI-prompt textures** with naming convention `<descriptor>-MMDDhhmmss-texture.png`: `a-floating-ultra-r-...`, `a-hypermodern-brutal-...`, `abandoned-structure-i-...`, `brutalist-ruin-...`, `desolate-ruin-...`, `forgotten-structure-...`, `fragmented-structure-...`, `frostbound-monument-...`, `futuristic-cube-drone-...`, `interstellar-cargo-cr-...`, `ruined-wall-fragment-...`, `scandinavian-winter-t-...` — these are AI-generated input textures David fed to the UE5 modules.
  - **2 ChatGPT scene images**: `chatgpt-image-apr-12-2025-08-36-27-pm.png`, `chatgpt-image-apr-12-2025-08-54-13-pm.png` — generated reference scenes.
  - **6 PolyHaven brick textures** (`worn-brick-floor-ao-4k.jpg` through `worn-brick-floor-rough-4k.jpg`) — third-party PBR materials, free-to-use but NOT David's authored content.
  - **3 third-party clover textures** (`t-clovers-d.tga.png`, `t-clovers-n.tga.png`, `t-clovers-roughness.tga.png`) — third-party Unreal foliage.
  - **3 Rugged Terrain stock textures** (`rugged-terrain-with-rocky-peaks-diffuse-png.png`, `...height-map-png.png`, `rugged-terrain-with-rocky-peaks.jpg`) — heightmap / terrain stock.
  - **1 weChat screenshot** (`weixin-screenshot-20250128223450.png`) — irrelevant content.
  - **1 WFC plugin screenshot** (`wfcplugin.png`) — UI screenshot of the third-party WFCPlugin (David didn't author it).
  - **3 generic** (`hero.jpg`, `image-0.png`, `module-layout.jpg`, `module-layout-plan.jpg`, `texture-0.png`) — duplicates of vault canonicals (camelCase vs space-separated names).
- Are any clearly NOT this project? **Most are tangentially related** (David fed AI textures into the UE5 game, used PolyHaven for materials), so they're *process* assets — not project *outputs*. For a portfolio page, audience cares about David's *level/module designs*, not his texture inputs.

ANOMALIES:
- David's most representative assets (`Module Layout.jpg`, `Module Layout plan.jpg`) are in the folder under both their original (capitalized, spaced) and slugified (lowercase, hyphenated) names — duplicates `module-layout.jpg` and `module-layout-plan.jpg` are the same images as the vault canonicals.
- The 5-minute demo video `Game_Design_Final_Video_Demo.mp4` (324 MB, local-only per vault md) is the **actual hero artifact** for this project but is not yet uploaded anywhere public. Until David uploads to YouTube/Vimeo, the closest visual proxy is `Module Layout.jpg` or `Module Layout plan.jpg`.
- Vault md explicitly notes "AI-generated textures (4+ PNGs)" as project assets — so 4 of the AI-texture files ARE legitimately project material. The other 12 textures, 6 PolyHaven, 3 Megascans, 3 Rugged Terrain, etc. are over-broad.

---

## 4. `design-the-ambience`

CURRENT SITE HERO: `/assets/design-the-ambience/hero.gif`
NOTION HERO: published Notion page exists (`Design the Ambience: Expanding Realities Beyond the Screen with StreamDiffusion and MediaPipe`). Page is a sibling to `spectral-facades` (also a Mapping & TouchDesigner project, but different theme).
VAULT FRONTMATTER hero_image: `_assets/design-the-ambience/hero.gif`
VAULT _assets COUNT: 5 files
SITE public/assets COUNT: 5 files

ASSESSMENT:
- HERO CORRECT? **Yes.** Vault, site, and likely Notion all use `hero.gif`.

GALLERY ASSESSMENT:
- Site `images:` (3): `trial-3-physarum.png`, `trial-2-urban-plan.png`, `trial-1-plants.png` — all match vault.
- Files in public NOT in vault: 0.
- Clean project. Vault list is 5 (hero + system-loop-flowchart + 3 trials); site site shows 4 in body via images + 1 as hero. Site dropped `system-loop-flowchart.png` from `images:` array, but the file IS in `public/assets/design-the-ambience/`. Cosmetic gap only.

ANOMALIES: none.

---

## 5. `fiber-based-pavilion`

CURRENT SITE HERO: `/assets/fiber-based-pavilion/column-form-finding.gif`
NOTION: published Notion page `Fiber-based Experimental Models - Parametric Pavilion with Topological Column and Kinematic Canopy` exists.
VAULT FRONTMATTER hero_image: `_assets/fiber-based-pavilion/column-catalogue-1.png`
VAULT _assets COUNT: 12 files
SITE public/assets COUNT: 14 files (2 extras)

ASSESSMENT:
- HERO CORRECT? **Yes.** `column-form-finding.gif` is David's Kangaroo simulation; works well as a kinetic banner. Vault's `column-catalogue-1.png` is also valid — more "static portfolio shot." Either is correct.

GALLERY ASSESSMENT:
- Site `images:` (13): mostly David's pavilion content. **2 problematic entries:**
  - `wood-facade-texture-wood-texture-wood-texture-pavilion-facade-milan-expo-100319045.jpg`
  - `wood-facade-texture-wood-texture-wood-texture-pavilion-facade-milan-expo-100319121.jpg`
- Files in public NOT in vault (2): same two wood-facade textures.
- Per asset-manifest, these came from `W:\CMU_Academics\Fall 2024 CMU\Independent Study\wood texture samples\`. They are stock photos of an unrelated wood-facade pavilion at Milan Expo, NOT David's CNT carbon-nanotube fiber pavilion.
- Are any clearly NOT this project? **Yes — both wood-facade textures.** They belong (if anywhere) to `synthetic-texture-deterioration` or to a generic "texture references" folder, not to this CNT carbon-fiber pavilion.

ANOMALIES:
- Vault md describes pavilion as "Computational Research Assistantship — Rice University" with CNT carbon-nanotube + Kangaroo physics. The 17 external_assets in asset-manifest include 11 CNT papers/PDFs (`180521 IASS Paper FM.pdf`, `IASS2018_FullPaper_442.pdf`, `CNT ceramic column catalogue sheets`, etc.) plus `CNT Submission photos-01.jpg` ... `-05.jpg`. None of those photos made it into `public/`; perhaps consider adding 1–2 of the CNT submission photos to the gallery if rights permit, since they show real fabricated pavilion components.

---

## 6. `generative-urbanism`

CURRENT SITE HERO: `/assets/generative-urbanism/evolution-1.png`
NOTION HERO: published Notion page `Generative Urbanism` exists. Notion shows 7 cdn.myportfolio.com images (mid-resolution PNGs).
VAULT FRONTMATTER hero_image: `_assets/generative-urbanism/evolution-1.png`
VAULT _assets COUNT: 7 files (`evolution-1.png` through `evolution-7.png`)
SITE public/assets COUNT: 7 files

ASSESSMENT:
- HERO CORRECT? **Yes.** Site, vault, Notion all converge on the evolution sequence; hero is the leader image.

GALLERY ASSESSMENT:
- Site `images:` (6): `evolution-2.png` through `evolution-7.png`. Matches vault exactly.
- Files in public NOT in vault: 0.
- Clean.

ANOMALIES:
- asset-manifest's `external_assets` lists 198 files for this project, all under `W:\CMU_Academics\Fall 2024 CMU\Independent Study\`. Asset sweep clearly searched too broadly here, but **none of those 198 made it into `public/assets/generative-urbanism/`** — only the 7 canonical evolution images did. Clean copy.

---

## 7. `l43d-cad-mllm`

CURRENT SITE HERO: `null` in frontmatter; uses `poster.pdf` per vault. Card likely renders without an image hero.
NOTION HERO: not in public Notion portfolio (CMU 16-825 final project, Fall 2025).
VAULT FRONTMATTER hero_image: `_assets/l43d-cad-mllm/poster.pdf`
VAULT _assets COUNT: 9 files (4 PDFs + 5 result PNGs)
SITE public/assets COUNT: 14 files (5 extras)

ASSESSMENT:
- HERO CORRECT? **Yes** (null hero is intentional — vault frontmatter `hero_image: poster.pdf` doesn't render a hero image, the card uses gallery images instead). If a hero image is desired, recommend `combined_summary.png` or `operations_comparison.png` from David's poster.

GALLERY ASSESSMENT:
- Site `images:` (4): `operations-comparison.png`, `data-amplification.png`, `truncation-distribution.png`, `versions-per-model.png` — all David's poster figures. Note kebab-case naming.
- Files in public NOT in vault (5): `combined-summary.png`, `data-amplification.png`, `operations-comparison.png`, `truncation-distribution.png`, `versions-per-model.png` — these are kebab-case duplicates of the underscore-named originals (`combined_summary.png`, `data_amplification.png`, `operations_comparison.png`, `truncation_distribution.png`, `versions_per_model.png`). Same images, different filenames. **Pure duplication.**
- Are any clearly NOT this project? **No** — all are David's. But they are duplicated. Need to choose one naming convention.

ANOMALIES:
- The `external_assets` for this project also include 22 files from `L43D_HW3` (`part_1.gif` through `part_7_geometry_20views.gif`, `color.png`, `depth.png`, `grid.png`, etc.). Those are **homework 3** material, NOT the final project. Currently NOT copied into `public/` — clean here.
- Recommend: keep underscore versions, delete kebab versions (or vice versa) — pick one and update site `images:` references accordingly.

---

## 8. `membrane-form-finding`

CURRENT SITE HERO: `/assets/membrane-form-finding/membrane-3.png`
NOTION HERO: published Notion page `Membrane Parametric Form-finding` exists.
VAULT FRONTMATTER hero_image: `_assets/membrane-form-finding/membrane-1.png`
VAULT _assets COUNT: 4 files (`membrane-1.png` through `membrane-4.png`)
SITE public/assets COUNT: 6 files (2 extras)

ASSESSMENT:
- HERO CORRECT? **Yes/equivalent.** Site uses `membrane-3.png`, vault prefers `membrane-1.png`. Both are David's Rice membrane form-finding images. Minor discrepancy.

GALLERY ASSESSMENT:
- Site `images:` (3): `membrane-4.png`, `membrane-1.png`, `membrane-2.png` — match vault.
- Files in public NOT in vault (2): `notion-005-image.png`, `notion-006-image.png`. Generic Notion-export filenames; provenance unclear (asset-manifest reports 0 external_assets — these likely came from a different copy script, possibly the Notion downloader).
- Are any clearly NOT this project? **Uncertain** — without inspecting them visually, the names tell us only that they were exported from a Notion page. Could be related (Notion membrane page) or unrelated. **Recommend: verify content, then either rename to `membrane-5.png`/`membrane-6.png` and add to gallery, or remove.**

ANOMALIES:
- Notion-export filenames (`notion-NNN-image.png`) are a recurring pattern across membrane, skill-bridge, and other projects — likely from a half-completed Notion image-pull script that left numeric naming.

---

## 9. `s25-team-26-paper-viz`  ⚠️  CRITICAL

CURRENT SITE HERO: `/assets/s25-team-26-paper-viz/img-1.webp`
NOTION HERO: not in public Notion portfolio.
VAULT FRONTMATTER hero_image: `_assets/s25-team-26/hero.png` (file does not exist on disk)
VAULT _assets COUNT: **0 files** — vault folder empty.
SITE public/assets COUNT: 1 file.

ASSESSMENT:
- HERO CORRECT? **NO.** `img-1.webp` per asset-manifest came from `W:\CMU_Academics\2025 Spring\17637 Web App Dev\davidch2\hw5\profile_pictures\` — that's a HW5 social-network homework profile-picture asset. The actual project (Three.js 3D paper visualization) is in a different subdirectory (`web-app-final-project\s25_team_26\`). Wrong file entirely.
- Recommended: must source actual screenshots from the team's final project. `s25_team_26\project\media\profile_avatars\` (per asset-manifest) only has more profile pictures. The Three.js viz screenshots/recording must be elsewhere — possibly in a `static/` or `screenshots/` folder, or never captured. **Need David to capture demo screenshots from the running project.**

GALLERY ASSESSMENT:
- Site `images:` array: just `img-1.webp` (the wrong file).
- Files in public NOT in vault: 1 (the wrong file).
- Are any clearly NOT this project? **Yes — the only file is wrong-project.**

ANOMALIES:
- Per vault md, vault frontmatter says GitHub repo is lost (`chentianle1117/s25_team_26` no longer accessible). Local files are the only source. Project status is `draft` in vault — recommend matching that on the site, OR generating new screenshots from a re-run of the local Django+Three.js app.

---

## 10. `semantic-canvas`

CURRENT SITE HERO: `/assets/semantic-canvas/semantic-canvas-ui.png`
NOTION HERO: not in public Notion portfolio (thesis tool, in development; some sub-pages exist like `Multi-View & Concept Exploration: Design Rationale for the Semantic Canvas`).
VAULT FRONTMATTER hero_image: `_assets/semantic-canvas/hero.png`
VAULT _assets COUNT: 7 files
SITE public/assets COUNT: 60 files (53 extras)

ASSESSMENT:
- HERO CORRECT? **Yes.** Both `semantic-canvas-ui.png` and `hero.png` exist in the public dir. `hero.png` is the vault canonical. Either works; `semantic-canvas-ui.png` is more of a UI screenshot.

GALLERY ASSESSMENT:
- Site `images:` (24): mix of David's user study P1–P5 canvases, journey screenshots, longitudinal lineage views, output interface screenshots (deeprise, fashion, runway). All ARE David's thesis work.
- Files in public NOT in vault (53): many groups —
  - **Per-participant study artifacts**: `p1-canvas.png` through `p5-canvas.png`, `p1-journey.png` through `p5-journey.png`, `p1-longitudinal-*.png`, `p2-longitudinal-*.png`, `p3-stage2-session*-composite.png`, `p4-longitudinal-*.png`, `p1-multisession-timeline-cropped.png`, etc.
  - **UI screenshots**: `analyse-reference-ai-ui.png`, `axis-suggestion-agent-ui.png`, `axis-tuning-ui.png`, `bls-interface.png`, `design-brief-area-ui.png`, `generate-from-references-ui.png`, `generate-from-text-ui.png`, `ghost-node-agent-ui.png`, `lineage-view-ui.png`, `runway-interface.png`, `semantic-canvas-ui.png`, `session-summary.png`, `ui-screenshot.png`.
  - **Comparison/analysis figures**: `batch-image-vs-latent-exploration.png`, `stage1-compare-batch-tree-cropped.png`, `stage1-compare-csi-radar-cropped.png`, `stage1-compare-cumulative-generation-rate-cropped.png`, `stage1-compare-session-timelines-cropped.png`, `stage1-vs-stage2-comparison.png`, `stage2-event-comparison-cropped.png`.
  - **Thesis figures (chapter 4)**: `ch4-agent-behavior-flow.png`, `ch4-architecture-diagram.png`, `ch4-axis-projection-pipeline.png`, `ch4-axis-tuning-diagram.png`, `ch4-generation-pipeline.png`, `ch4-system-timeline.png`. These also appear in `thesis-flagship/` — duplication.
  - **Output interfaces**: `output-deeprise-interface.png`, `output-fashion-interface.png`, `output-form-forge.png`, `output-nano-generated-shoe.png`. Also in `thesis-flagship/` (without `output-` prefix) — duplication.
  - **Concept/territory**: `concept-config-space.png`, `territory-map.png`. Also in `thesis-flagship/` — duplication.
  - **Video**: `proposal-presentation.mp4`. Also in `thesis-flagship/` — duplication.
- Are any clearly NOT this project? **No — all are David's thesis work.** But the duplication with `thesis-flagship/` is wasteful (~12 files duplicated 1:1).

ANOMALIES:
- 53 files added to a project that the vault expected to have 7 — that's a 8.6x fan-out. The cause is that the actual `Thesis_Material/figures/` folder exists alongside `Semantic_Canvas/`, and the asset sweep found both sets of figures.
- Recommend: decide whether `ch4-*` and tool UI screenshots belong to **`semantic-canvas`** (the tool itself) or **`thesis-flagship`** (the academic argument that uses the tool). They probably belong to one or the other, not both. Suggest: tool/UI screenshots → `semantic-canvas/`; chapter diagrams + thesis writeup figures → `thesis-flagship/`. Then delete duplicates from the other folder.

---

## 11. `skill-bridge-datavis`

CURRENT SITE HERO: `/assets/skill-bridge-datavis/dashboard-hero.gif`
NOTION HERO: published Notion page `Skill-Bridge Data Visualization Interface` exists. Notion embeds a Circular Skill-Job Linkage chart, a Batch-selectable Skill-to-job-categories graph, geo maps (tech + design), salary distribution charts, integrated dashboard, and the circular skill-job linkage graph (×2).
VAULT FRONTMATTER hero_image: `_assets/skill-bridge-datavis/dashboard-hero.gif`
VAULT _assets COUNT: 11 files
SITE public/assets COUNT: 14 files (3 extras)

ASSESSMENT:
- HERO CORRECT? **Yes.** Site, vault, Notion alignment confirmed.

GALLERY ASSESSMENT:
- Site `images:` (9): `dashboard-hover.gif`, `integrated-dashboard.png`, `Presentation 4.png`, `circular-skill-job-linkage.png`, `Presentation 3.png`, `Project Thumbnail.png`, `Presentation 1.png`, `background.png`, `Presentation 2.png`. 8 of 9 are vault canonicals; 1 (`background.png`) is a Django template asset.
- Files in public NOT in vault (3):
  - `background.png` — per asset-manifest, came from `W:\CMU_Academics\Fall 2024 CMU\Data Visualization\DataViz-aijobs-demo\myapp\static\Img\` and 2 sibling Django static dirs. This is the Django app's hero/background image — possibly used legitimately, but it's a static template asset rather than a David-authored design figure.
  - `notion-004-image.png`, `notion-005-image.png` — generic Notion-export filenames, provenance unclear.
- Are any clearly NOT this project? **`background.png` is borderline** — it IS from this project's source code, but it's a static template asset, not a design exploration screenshot. The two `notion-NNN-image.png` files are uncertain.

ANOMALIES:
- Vault md `images` list does NOT include `background.png` or the two notion-image files; they were added by the asset sweep but never validated by David.
- Recommend: drop `notion-004-image.png` and `notion-005-image.png` from the gallery (rename + add back if visually valid), and decide whether `background.png` adds value (it's the Django app banner — could work as a "deployment context" image but not as a primary content image).

---

## 12. `spectral-facades`

CURRENT SITE HERO: `/assets/spectral-facades/hero.gif`
NOTION HERO: published Notion page `Spectral Facades` exists. Embeds (per MCP fetch): `Untitled-video-_9_.gif` (hero gameplay GIF showing facade transition), `image.png` (meme collage), `image.png` (stream-diffusion weights visualization), `image.png` (MediaPipe gesture output), `image.png` (final synthesized facade output).
VAULT FRONTMATTER hero_image: `_assets/spectral-facades/hero.gif`
VAULT _assets COUNT: 11 files
SITE public/assets COUNT: 11 files (0 extras)

ASSESSMENT:
- HERO CORRECT? **Yes.** Site, vault, and Notion all converge on `hero.gif`.

GALLERY ASSESSMENT:
- Site `images:` (8): `screenshot.jpg`, `mapping screenshot.png`, `final-output.png`, `mediapipe-gestures.png`, `meme-collage.png`, `stream-diffusion-weights.png`, `papercube-test.png`, `test1.png`. All match vault. All match Notion-page intents.
- Files in public NOT in vault: 0.
- Clean project.

ANOMALIES: none directly. Note: `papercube-test.png` is also referenced (incorrectly) in `a-game-of-deterioration/` — that's a `a-game-of-deterioration` problem, not a `spectral-facades` problem.

---

## 13. `synthetic-texture-deterioration`

CURRENT SITE HERO: `/assets/synthetic-texture-deterioration/facade-aging-2.png`
NOTION HERO: published Notion page `Synthetic Tool for Visualizing Texture Deterioration` exists.
VAULT FRONTMATTER hero_image: `_assets/synthetic-texture-deterioration/facade-aging-1.png`
VAULT _assets COUNT: 5 files
SITE public/assets COUNT: 5 files (0 extras)

ASSESSMENT:
- HERO CORRECT? **Yes/equivalent.** Site uses `facade-aging-2.png`, vault `facade-aging-1.png`. Both are David's facade-aging renders. Minor.

GALLERY ASSESSMENT:
- Site `images:` (3): `facade-aging-4.png`, `facade-aging-1.png`, `facade-aging-3.png`. Match vault.
- Files in public NOT in vault: 0.
- Clean project.

ANOMALIES: none.

---

## 14. `thesis-flagship`  ⚠️  HERO POINTS TO WRONG FOLDER

CURRENT SITE HERO: `/assets/semantic-canvas/p3-stage2-session2-composite.png`  ← points to a *different project's directory*
NOTION HERO: not in public Notion portfolio (thesis is in active development — only sub-pages like `Thesis Milestone`, `Worldmaking A1-2`, etc.).
VAULT FRONTMATTER hero_image: `_assets/thesis/pre-thesis-II-A1_Worldmaking_Diagram_DavidChen.png`
VAULT _assets COUNT: 8 files (3 territory map JPGs, 4 PDFs, 1 Worldmaking PNG)
SITE public/assets COUNT: 23 files (15 extras)

ASSESSMENT:
- HERO CORRECT? **NO.** Two compounding problems:
  1. The hero pointer goes into `/assets/semantic-canvas/...` — that's *another project's* asset folder. Cross-project asset references are fragile (will break if `semantic-canvas` is restructured).
  2. The chosen image (`p3-stage2-session2-composite.png`) is a Participant 3 stage-2 session-2 composite — a study artifact, not a thesis flagship visual. The vault's canonical hero is the Worldmaking Diagram.
- Recommended: `recommended_hero = /assets/thesis-flagship/pre-thesis-II-A1_Worldmaking_Diagram_DavidChen.png`. Reason: vault canonical, correctly scoped to `thesis-flagship/`, conceptually represents the thesis (worldmaking is a thesis-level frame, not a per-participant study output).

GALLERY ASSESSMENT:
- Site `images:` (10): all currently within `/assets/thesis-flagship/`. Mix of:
  - Tool UI screenshots: `lineage-view-ui.png`, `fashion-interface.png`, `form-forge.png`, `deeprise-interface.png` — these duplicate `semantic-canvas/output-fashion-interface.png`, `semantic-canvas/output-form-forge.png`, etc. (different filenames, likely same content).
  - Thesis chapter diagrams: `ch4-system-timeline.png`, `ch4-generation-pipeline.png`, `ch4-axis-projection-pipeline.png` — duplicate `semantic-canvas/ch4-*.png`.
  - Concept frames: `concept-config-space.png`, `territory-map.png`, `stage1-vs-stage2-comparison.png` — also duplicated in `semantic-canvas/`.
- Files in public NOT in vault (15):
  - `ch4-architecture-diagram.png`, `ch4-axis-projection-pipeline.png`, `ch4-axis-tuning-diagram.png`, `ch4-generation-pipeline.png`, `ch4-system-timeline.png` (5 chapter diagrams)
  - `concept-config-space.png`, `territory-map.png` (2 concept maps)
  - `deeprise-interface.png`, `fashion-interface.png`, `form-forge.png`, `lineage-view-ui.png`, `nano-generated-shoe.png` (5 tool UI / output screenshots)
  - `proposal-presentation.mp4` (proposal video — also in `semantic-canvas/`)
  - `stage1-vs-stage2-comparison.png` (analysis figure)
  - `hero.png` (a generic-named file — likely the Worldmaking diagram renamed, but uncertain since vault canonical is the longer filename)
- Are any clearly NOT this project? **No — all are David's thesis-related work.** But ~10 of them are *exact duplicates* of files in `semantic-canvas/` (sometimes with slightly different names, sometimes identical).

ANOMALIES:
- Cross-project hero reference (`/assets/semantic-canvas/p3-...`) is a footgun. Should be self-contained.
- The 15 extras heavily overlap with `semantic-canvas/`. Recommend: treat `thesis-flagship/` as the academic-argument project (territory maps, worldmaking diagram, A1–A11 PDFs) and `semantic-canvas/` as the tool project (UI screenshots, generation outputs, chapter diagrams of tool architecture). Then deduplicate.
- Vault md notes `Proposal Final Presentation 1204.mp4` is local-only (103 MB) — but `proposal-presentation.mp4` (in both site dirs) is presumably a smaller compressed version. Confirm content.

---

## 15. `wire-bending`

CURRENT SITE HERO: `/assets/wire-bending/bending-process.gif`
NOTION HERO: published Notion page `Wire-bending Parametric Workflow with Mixed Reality` exists.
VAULT FRONTMATTER hero_image: `_assets/wire-bending/hero.png`
VAULT _assets COUNT: 9 files
SITE public/assets COUNT: 9 files (0 extras)

ASSESSMENT:
- HERO CORRECT? **Yes/equivalent.** Site picks the GIF (more dynamic), vault picks `hero.png` (static). Both legit.

GALLERY ASSESSMENT:
- Site `images:` (5): `hololens-workflow-2.png`, `full-installation.png`, `hero.png`, `hololens-workflow-1.png`, `detail.png`. Match vault.
- Files in public NOT in vault: 0.
- Clean project.

ANOMALIES: none.

---

## Cross-cutting patterns

1. **The "deterioration" fuzzy match.** `a-game-of-deterioration` and `spectral-facades` both have "deterioration"-themed descriptions; the asset sweep apparently couldn't distinguish them and shoved StreamDiffusion files into both projects. `synthetic-texture-deterioration` was probably the third candidate but happens to have its own canonical assets so it survived. Result: `a-game-of-deterioration` got 17 wrong files.

2. **CamelCase vs kebab-case vs underscore_case duplicates.** `l43d-cad-mllm` has 5 files double-named (`combined_summary.png` AND `combined-summary.png`). `aurora-citadel-gen-game` has both `Module Layout.jpg` and `module-layout.jpg`. Probably a normalization pass collided with the original copy.

3. **`notion-NNN-image.png` ghost files.** Multiple projects (`membrane-form-finding`, `skill-bridge-datavis`) have these generic Notion-exported images. Provenance unclear, content uncertain. Either rename meaningfully or remove.

4. **Cross-project hero references.** `thesis-flagship` points its hero to `/assets/semantic-canvas/...`. Self-contained per-project assets are safer.

5. **`thesis-flagship` ↔ `semantic-canvas` duplication.** ~10 files duplicated 1:1 across both folders. Need a project-boundary decision: which artifacts belong to the *tool* vs the *argument*?

6. **Empty vault dirs that triggered over-broad sweeps.** `_assets/a-game-of-deterioration/` (0 files) and `_assets/s25-team-26/` (0 files) both produced wrong heroes because the sweep had to look elsewhere. Recommend: never auto-import for a project with empty vault `_assets`; instead, mark it for manual capture.

---

## Implementation suggestions for the next agent (DO NOT IMPLEMENT HERE)

For the agent that fixes these issues, the work breaks down as:

**A. Hero swaps in `src/content/projects/<slug>.md` frontmatter (4 files):**
- `a-game-of-deterioration.md`: `hero_image: /assets/a-game-of-deterioration/gameplay.gif` (after asset is sourced)
- `aurora-citadel-gen-game.md`: `hero_image: /assets/aurora-citadel-gen-game/module-layout.jpg`
- `s25-team-26-paper-viz.md`: needs a real screenshot first; until then mark `publish: false` or use a placeholder
- `thesis-flagship.md`: `hero_image: /assets/thesis-flagship/pre-thesis-II-A1_Worldmaking_Diagram_DavidChen.png`

**B. Asset deletions (uncontroversial):**
- `aurora-citadel-gen-game/`: delete the 6 PolyHaven brick textures, 3 t-clovers textures, 3 Rugged Terrain textures, weChat screenshot, `wfcplugin.png`. Keep the 4 AI-generated brutalist textures David explicitly mentions in vault md.
- `fiber-based-pavilion/`: delete 2 `wood-facade-texture-...` files.
- `l43d-cad-mllm/`: delete the 5 kebab-case duplicates (or the 5 underscore originals — pick a convention).
- `a-game-of-deterioration/`: delete all 17 wrong-project files. Then reseed from the actual project's source.

**C. Asset captures needed (David's involvement):**
- `a-game-of-deterioration`: capture 2 gameplay GIFs + 4 equipment icons + 4-direction sprite + 4 texture-pair images + 1 storyboard from `W:\CMU_Academics\Fall 2024 CMU\112 Term Project - Final - Submission\`. (Or download the 6 expected files from the Notion page by URL — note Notion S3 URLs expire after ~1 hour but can be re-fetched.)
- `s25-team-26-paper-viz`: capture demo screenshots from the local Django+Three.js app at `W:\CMU_Academics\2025 Spring\17637 Web App Dev\web-app-final-project\s25_team_26\`.
- `aurora-citadel-gen-game`: extract a frame or two from `Game_Design_Final_Video_Demo.mp4` (324 MB local) for a true "in-game" hero. Or upload the video to YouTube and use a YouTube embed.

**D. Project-boundary decisions (David's call):**
- `thesis-flagship` vs `semantic-canvas`: which folder owns the ch4-*, output-*, and territory-map files? Recommend tool screenshots → `semantic-canvas/`, thesis-argument figures → `thesis-flagship/`.
- `membrane-form-finding/notion-005-image.png` and `notion-006-image.png`: keep (rename to `membrane-5/-6`) or drop?
- `skill-bridge-datavis/background.png`, `notion-004-image.png`, `notion-005-image.png`: same question.

**E. Verify (low-stakes):**
- Confirm `3t3d-vit-2d-to-3d` course is `11-685` (vault) vs `16-825` (asset-manifest external_assets). Likely both — different terms.

---

*Audit complete. Read-only on source. Audit written to this file. No code changes were made.*
