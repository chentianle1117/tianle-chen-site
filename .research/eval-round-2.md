# Senior Designer Critical Review — Round 2

**Reviewer:** Same 15-yr senior web designer (Pentagram / W+K / IDEO context)
**Subject:** tianle-chen-site (CMU MSCD thesis portfolio) — post Round-1 fixes
**Date:** 2026-04-25
**Method:** Walked all 138 NEW verification screenshots across 6 viewports + diffed against R1 + spot-checked source under `src/` (CSS, page templates, Footer, Nav, ThemeToggle, content frontmatter, embeddings.json).

**Verdict (one line):** Significant progress on the most embarrassing R1 blockers — most CRITICALs cleared — but new structural / content / a11y problems surfaced and a few R1 fixes were partial only. Not yet portfolio-ready for top-tier role recruiters; one focused round away.

---

## Counts

| Status | Count |
|---|---|
| RESOLVED | 28 |
| PARTIAL | 9 |
| REMAINING | 7 |
| NEW | 14 |
| REGRESSED | 2 |
| **Total** | **60** |

Round-1 issues now RESOLVED (28 total): #1, #2, #5, #7, #11 (partial), #14, #16 (partial — see below), #17 (partial), #18, #21 (partial — orange dot still on /work card #1, see N6), #25, #26, #27, #28 (partial), #29, #30, #32, #33, #34, #36 (partial), #38, #41, #42, #43, #44, #46, #47, #50, #52, #53, #56, #57.

R1 issues NOT cleared / partial: #3 (PARTIAL — video plays but content shows tool UI), #4 (PARTIAL — diagram replaced atlas, but is itself a diagram), #6 (PARTIAL — atlas-overlay-on-title still happens on some slugs), #8 (PARTIAL — wider container added but no rail strategy), #9 (PARTIAL — labels added, grid still light), #10 (PARTIAL — first card on /work still shows orange dot baked-in), #12 (PARTIAL — long titles still overrun mobile heroes), #13 (RESOLVED — dark default), #15 (REMAINING — green block survived), #20 (PARTIAL — filter bar restyled but still graphite), #21 (REMAINING — orange dot on /work index card still baked in), #22 (PARTIAL — scrim improved, still imperfect on bright UI heroes), #23 (RESOLVED), #24 (RESOLVED), #31 (PARTIAL), #35 (RESOLVED), #37 (UNVERIFIABLE — captures still don't show full home), #39 (REMAINING — italic display still unused), #40 (PARTIAL), #45 (UNVERIFIABLE — static screenshots), #48 (PARTIAL — mono-label now `max(12px, ...)`), #49 (RESOLVED — 2-col gallery visible), #51 (REMAINING), #54 (RESOLVED — all four labels visible at >=1024 desktop), #55 (REMAINING — `+` separator still in footer), #58 (UNVERIFIABLE).

---

## Issues by status

### RESOLVED (R1 issues confirmed cleared by R2 captures)

[RESOLVED] [—] R1#1 — s25-team-26 baby photo replaced
ISSUE/RESOLUTION: RESOLVED — `img-1.webp` (3D rendered geometry) is now the hero on `/work/s25-team-26-paper-viz`; the baby/personal photos no longer render. The home scatter no longer shows the baby thumb.

[RESOLVED] [—] R1#2 — AxisInputs z-index conflict
ISSUE/RESOLUTION: RESOLVED — at 1920/1440/1024 the AxisInputs panel now sits above the scatter; no thumbnails leak over the dropdowns.

[RESOLVED] [—] R1#5 — Dashboard stat contrast
ISSUE/RESOLUTION: RESOLVED — `15`, `19K`, `4`, `127` numerals now render at full text-primary weight against graphite at all viewports. Build info (`BUILT`, `COMMIT`, `ASTRO`) reads cleanly.

[RESOLVED] [—] R1#7, R1#14 — 404 page rebuilt
ISSUE/RESOLUTION: RESOLVED — moon-phases gone; minimal "404 / Not found / This route isn't in the index." with two oxide-outlined buttons (HOME, VIEW WORK). Voice modest, on-brand. Mobile clean.

[RESOLVED] [—] R1#13 — Theme default
ISSUE/RESOLUTION: RESOLVED — `:root` resolves to dark token set; cream-body+dark-hero seam no longer visible. Hero-block::after gradient (32px linear) added for any future light-mode rendering.

[RESOLVED] [—] R1#18 — Trailing periods on h1
ISSUE/RESOLUTION: RESOLVED — Dashboard, About, 404, Selected Work all render without trailing periods. Consistent.

[RESOLVED] [—] R1#26 — Mobile hero collapses
ISSUE/RESOLUTION: RESOLVED — at 375/414 the static MobileStrip ("SELECTED · TAP TO EXPLORE" with horizontally-scrolling thumbs) replaces the broken 2D scatter. See N7 for content concerns.

[RESOLVED] [—] R1#25 — Tablet AxisInputs panel occludes scatter
ISSUE/RESOLUTION: RESOLVED — at 768/1024 the controls now live in their own band beneath the scatter (VIEW / LAYOUT / X / Y all in a horizontal strip). Scatter has clean vertical space.

[RESOLVED] [—] R1#32 — Tag chip cluster
ISSUE/RESOLUTION: RESOLVED — ProjectCard meta now renders as `thesis · design research · ai/ml` mono lowercase comma-separated. Round-1 chip box-borders are gone.

[RESOLVED] [—] R1#33 — Live AI Feedback empty
ISSUE/RESOLUTION: RESOLVED — `publish: false` removes it from /work and from /work/[slug] static path generation. The detail page now 404s. See REGRESSED #R2 for the side-effect.

[RESOLVED] [—] R1#34 — 3-meta-block overload
ISSUE/RESOLUTION: RESOLVED — ProjectMeta moved to end of page; the lead block + body now leads.

[RESOLVED] [—] R1#35 — About bio prose
ISSUE/RESOLUTION: RESOLVED — bio split into two sentences; `(陳天樂)` rendered with a smaller font + reduced opacity span (Round-1 #42 also resolved with this change).

[RESOLVED] [—] R1#38 — 3D toggle hidden interaction
ISSUE/RESOLUTION: RESOLVED — randomize button is now an outlined chip with `↻` glyph + "TIP: TRY CHANGING X/Y" copy; 2D/3D toggle pair is properly visible top-right of the scatter.

[RESOLVED] [—] R1#42 — Bilingual (陳天樂) typography
ISSUE/RESOLUTION: RESOLVED — wrapped in a smaller / lower-opacity span. About page renders the moment as intended.

[RESOLVED] [—] R1#44 — PrevNextNav with thumbnails
ISSUE/RESOLUTION: RESOLVED — 80×60 prev/next thumbnails render via `thumbFor(p)`; placeholder fallback (empty bordered box) handles missing thumbs. Works for all 12 published projects.

[RESOLVED] [—] R1#46 — Filter chip clipping at 375
ISSUE/RESOLUTION: RESOLVED — at 375 the CAT row + YEAR row stack with no chip clipping; filter bar is now inside a horizontal-scroll container.

[RESOLVED] [—] R1#52 — CV link affordance
ISSUE/RESOLUTION: RESOLVED — About page CV button has `ph-arrow-down` glyph + "Download CV (PDF)" label. Nav still uses bare "CV" text — see N12.

[RESOLVED] [—] R1#56 — Theme toggle icon
ISSUE/RESOLUTION: RESOLVED — Sun icon now visible at top-right of all dark-mode captures. Moon icon shows in light. (Note: brittle — see N13.)

---

### PARTIAL (R1 issue addressed but not fully cleared)

[PARTIAL] [HIGH] [HERO] [all viewports] [thesis]
PRIOR ISSUE #3
ISSUE/RESOLUTION: The proposal-presentation.mp4 IS now wired as the hero (`<video autoplay muted loop playsinline>`). However **the video content itself shows the Semantic Canvas tool UI** — light-cream side panels (DESIGN BRIEF, AI ACTIONS, PROGRESS on left; GENERATE, VISUAL SETTINGS on right) dominate the frame at 1920/1440/1024. At 768 the same video crops to a near-black frame with a thin "← organic … geometric →" pill mid-frame. At 375 the hero is essentially a black void with no apparent video content above the title — autoplay may be failing silently on narrow viewports.
WHY IT MATTERS: The thesis page is the flagship. R1 said "broken hero is a kill-shot." The hero now plays — but the recruited eye reads cream tool panels and an emoji status bar leaking from the video, NOT a thesis stage. The issue is reframed: from "broken video" to "video content is a meta-recursion of the tool, displayed without curation."
FIX: Two options.
(a) Trim the proposal video to the 8–12 most cinematic seconds (fast pans across populated canvases, generation moments), drop the static-tool framing, and add `poster="proposal-poster.jpg"` so first paint is a curated still.
(b) Replace the hero video with a single curated still (one of the rich session composites — `p3-stage2-session2-composite.png` or a generated-shoe sheet) and move the proposal-presentation.mp4 into a "PROPOSAL PRESENTATION" SectionBreak block lower on the page.
Either way: the cream tool panels visible inside the video contradict the page's dark stage.

[PARTIAL] [MEDIUM] [HERO] [all viewports] [work-thesis-flagship, /work first card]
PRIOR ISSUE #4, #11
ISSUE/RESOLUTION: The dataset atlas hero is gone. The replacement `concept-config-space.png` is **a hand-drawn diagram** — two "blobs" (Concept space / Configuration space) joined by arrows, on a white card. R1 explicitly flagged "avoid diagrams." Better than the atlas (no filenames burned in, less debug-y), but still not a piece of the THESIS WORK — it's a methodology illustration.
WHY IT MATTERS: This is the FIRST card of /work AND the project hero of the flagship thesis. The diagram has zero visual evidence of footwear, generated outputs, the canvas tool, or any artifact recognizable as the actual work.
FIX: Use a curated still that has *something to look at* — recommend `nano-generated-shoe.png` (a generated footwear render) OR `stage1-vs-stage2-comparison.png` (a session composite) OR a frame from `proposal-presentation.mp4` showing the canvas populated with shoe images. Move `concept-config-space.png` into the body diagram strip where it belongs.

[PARTIAL] [HIGH] [INFORMATION_HIERARCHY] [1920, 1440] [/work card #1]
PRIOR ISSUE #21
ISSUE/RESOLUTION: The stray bright-orange dot in the upper-right corner of the thesis-flagship card is **STILL VISIBLE** in `/work__1920` and `/work__1440` AND in `/work__768` AND `/work__375` AND inside the work-thesis-flagship hero itself. The dot is baked into `concept-config-space.png` (it appears it's a leftover UI mark from whatever app was used to draw it).
WHY IT MATTERS: R1 specifically called this dot out as "looks like a leftover badge / a glitch." It survived the swap. It's still on the FIRST card the recruiter sees on /work.
FIX: Open `/assets/thesis-flagship/concept-config-space.png` in any image editor. Paint the orange dot out (the surrounding white area is uniform, takes 30 seconds with a brush). Re-export. Re-run the atlas pipeline. OR (preferred) replace the hero entirely per the recommendation above.

[PARTIAL] [HIGH] [HERO] [all viewports] [home]
PRIOR ISSUE #15, #16
ISSUE/RESOLUTION: The flat green-block thumbnail is **STILL VISIBLE** in the home scatter at 1920, 1440, 1024 — bottom-left cluster, sitting between the speckled-marble `s25-team-26` thumb and a dark cell. This is the live-ai-feedback project's placeholder hero (or the skill-bridge plain green). Round-1 fix said embeddings.json was regenerated; my inspection of `public/data/embeddings.json` confirms **`live-ai-feedback-design-assistant` is still in the array (16 items total — should be 12 published)**.
WHY IT MATTERS: User specifically called this out for verification. The pipeline didn't honor `publish: false`. A flat-color tile remains in the most prominent visual element of the homepage.
FIX:
1. Update the hero pipeline (likely `scripts/build-embeddings.*` or similar) to filter projects by `publish === true` BEFORE generating atlas + embeddings.
2. Re-run pipeline. Verify `embeddings.json` length === 12 AND no slug `live-ai-feedback-design-assistant` is present.
3. If skill-bridge atlas tile is also a flat green, generate a real still from `dashboard-hero.gif` (frame extraction) for the atlas source.

[PARTIAL] [MEDIUM] [LAYOUT] [1920, 1440] [all pages]
PRIOR ISSUE #8
ISSUE/RESOLUTION: `.container-wide` (1440px max) was added per FIX-C2 and IS in use on /work and /architecture (visible — the title block and lead copy span wider than R1). However the ACTUAL CONTENT below the title block still pinches to a narrow column. On `/work__1920` the title "Selected Work" sits at the left edge of `.container-wide` but the first project card below it is also column-anchored, leaving a vast 35% void on the right. On `/architecture__1920` the kicker + h1 + 3-line description are all in the same narrow column with cream emptiness to its right. The "marginalia rail" strategy R1 recommended was NOT implemented.
WHY IT MATTERS: This was R1's #1 layout concern. Wider container alone doesn't solve "stranded narrow column"; it just widens the empty space.
FIX: Implement a left rail (sticky mono kicker — year, role, status, table-of-contents anchors) at >=1440 on /work and project-detail pages. Right rail can carry related-project links or a tiny atlas glyph. The cream/graphite void becomes structured marginalia. Estimate: 3–4 hours of layout work in `[slug].astro` and `/work/index.astro`.

[PARTIAL] [HIGH] [TYPOGRAPHY] [375, 414] [work-thesis-flagship, work-semantic-canvas, work-fiber-based-pavilion, work-l43d-cad-mllm, work-design-the-ambience]
PRIOR ISSUE #12, #6
ISSUE/RESOLUTION: `.h1-fluid` `clamp()` was added — title sizes are smaller on mobile. But many slugs have long compound titles ("MSCD Thesis — AI-Augmented Footwear Design: Tools, Agency, and the Shape of Designer-AI Collaboration", "Fiber-based Experimental Models — Parametric Pavilion with Topological Column and Kinematic Canopy", "Design the Ambience: Expanding Realities Beyond the Screen with StreamDiffusion and MediaPipe") that still wrap to 6+ lines on 375px viewports, consuming the entire hero.
WHY IT MATTERS: A hero title that takes 100% of hero height with no breathing room is mobile-broken. `clamp()` ramps font-size; it doesn't truncate.
FIX:
- Either truncate display in hero with a balanced micro-shorter version (e.g. `display_title: "MSCD Thesis"` frontmatter field, used in hero only; full title kept in `<title>` and breadcrumb)
- Or accept verbose titles but ramp font-weight to 320 + line-height 1.0 + tighter letter-spacing for a denser editorial wrap.
- For thesis-flagship specifically: the title is 16 words; that's a paragraph, not an h1. Recommend `MSCD Thesis — AI-Augmented Footwear Design` and put the subtitle in the kicker line.

[PARTIAL] [HIGH] [HERO] [all desktop viewports] [home]
PRIOR ISSUE #9, #54
ISSUE/RESOLUTION: All four corner labels now visible at 1920/1440/1024 (`↑ RESEARCH`, `← DESIGN/PHYSICAL`, `↓ PLAY`, `ML/CODE →`). Grid stroke alpha bumped slightly. But labels at top-left and bottom-right specifically use mono-label color (graphite-mute) on near-black scatter — still quiet. Grid is still essentially invisible at the brightness it's set to.
WHY IT MATTERS: Conceptual clarity is the entire site's hook. Quiet labels on quiet grid = the 2D plane reads as "images floating in space" rather than "coordinate system."
FIX: Bump label color to graphite-200 (fully opaque) AND bump grid stroke alpha to 0.10 minimum on dark. Add quarter-tick marks every 0.25 units for clearer spatial reading.

[PARTIAL] [MEDIUM] [THUMBNAIL] [all viewports] [home, work]
PRIOR ISSUE #28
ISSUE/RESOLUTION: Atlas tile crispness is improved on most cells. Hero stills are sharper at 1920. But several scatter thumbs still look soft/JPEG-compressed (the "mood-board" panel cluster mid-scatter, the 3T3D atlas tile). Atlas was 13.4MB which is large; quality-vs-size tradeoff visible.
FIX: Re-run atlas pipeline with `--quality 95` and PNG-24 output. Or keep WebP but use `--quality 90 --method 6`. Per-cell source images should be 512px+ to render crisply at 200px screen size on retina.

[PARTIAL] [LOW] [BRAND_VOICE] [all viewports] [footer]
PRIOR ISSUE #55
ISSUE/RESOLUTION: Footer still reads `© 2026 Tianle Chen — Pittsburgh + Shanghai · Gen-AI engineer · Computational designer`. The `+` between "Pittsburgh" and "Shanghai" still uses `+`, mixed with `·` separator on the role line. Round-1 #55 not addressed.
FIX: `src/components/Footer.astro` line 31 — change `Pittsburgh + Shanghai` to `Pittsburgh · Shanghai`. Five-second fix.

---

### REMAINING (R1 issue not addressed by R2)

[REMAINING] [HIGH] [TYPOGRAPHY] [all viewports] [all pages]
PRIOR ISSUE #39
ISSUE: Newsreader italic display weight is still untapped anywhere in the site. About page italicizes `<em>Semantic Canvas</em>` in body copy (good) but no italic display-tier moments at the h1/h2 register.
FIX: Italicize project titles when referenced in body (`<em>` rule already in CSS). Better: italicize the kicker lead on /thesis and /work hero phrases ("a latent-space instrument that…").

[REMAINING] [LOW] [TYPOGRAPHY] [all viewports] [all pages]
PRIOR ISSUE #51
ISSUE: Em-dash spacing is inconsistent across the site. `David Chen (陳天樂)` paragraph uses em-dash with thin spaces around it; project body markdown uses em-dash with regular spaces; some uses no spaces. No global rule applied.
FIX: Pick one (recommend em-dash with thin spaces, U+2009 either side). Apply via Astro remark plugin or a simple find-replace pass on content/projects/*.md.

[REMAINING] [LOW] [TYPOGRAPHY] [all viewports] [all pages]
PRIOR ISSUE #58
ISSUE/RESOLUTION: Newsreader serif `&` vs IBM Plex Mono `&` — couldn't verify from screenshots whether ampersands appear; it's a style audit issue. Skipping.

[REMAINING] [LOW] [LAYOUT] [768] [home]
PRIOR ISSUE #57
ISSUE: At 768 the "Selected work" h1 + the "06 of 11" mono kicker fight for the same row width; the right margin compresses to almost nothing. The kicker count also reads "06 OF 11" — INCONSISTENT with /work which says "12 PROJECTS."
FIX: Cap h1 to 75% column width at 768; allow kicker to wrap or move below.

[REMAINING] [HIGH] [BRAND_VOICE] [375, 414, 768, 1024, 1440, 1920] [home, /work index, project pages]
PRIOR ISSUE #50 (regressed slightly)
ISSUE: Counts disagree across the site.
- `/work__1920`: "12 PROJECTS · 4 CATEGORIES · 2024–2026"
- `/dashboard__1920`: "15 PROJECTS"
- `/home__375`: "06 OF 11 · 2022–2026"
- `/home__768`: "06 OF 11 · 2022–2026"
- `/home__1920`: not shown in the visible fold (Selected Work block barely peeks)
THREE different counts (11 / 12 / 15) for the project total.
WHY IT MATTERS: A site whose own counters disagree fails the simplest trust test.
FIX: Single source of truth. Compute counts in one helper; consume across home, /work, /dashboard. Reconcile what "selected" vs "published" vs "all" mean. Recommend: "12 published · 06 selected on home · 4 architecture (separately tiered)."

[REMAINING] [MEDIUM] [LAYOUT] [1920, 1440] [home]
PRIOR ISSUE #36
ISSUE: At 1920/1440 the home below-the-scatter "Selected Work" mono strip + h1 still has substantial vertical space (~350px) before the first card. Above the fold is mostly empty.
FIX: Tighten margin-block to 1.5rem on the mono strip; merge h1 + count line; first card visible in fold at 1920.

[REMAINING] [MEDIUM] [LAYOUT] [1920, 1440] [/work, /architecture]
PRIOR ISSUE #19, #8 (related)
ISSUE: At 1920 on /work the lead block has the same problem as /architecture — wide title block, then ~250px void of empty graphite, then the first card pinned to a narrow column. The wider container helped the title but the card grid below is still narrow.
FIX: At >=1440, switch /work card grid to 2-col (or even 3-col for non-flagship cards). Currently it's 1-col with cards taking 50% width and 50% void to the right.

---

### NEW (issues introduced by Round-1 fixes or surfaced now)

[NEW] [CRITICAL] [INFORMATION_HIERARCHY / A11Y] [all viewports] [every project detail page]
ISSUE: **Duplicate H1 on every project detail page.** The hero overlay renders `<h1>{data.title}</h1>` (line 175 of `[slug].astro`), AND every project's MDX body starts with `# {Project Title}` (verified across all 16 project markdown files via grep — see s25-team-26-paper-viz.md:58, thesis-flagship.md:70, semantic-canvas.md:96, etc.). The hero h1 + the markdown's first h1 = TWO h1s in the DOM per page.
Visually, this is also the cause of the "title appears twice" pattern visible in s25-team-26, thesis-flagship, aurora-citadel, l43d-cad-mllm, generative-urbanism, fiber-based-pavilion, design-the-ambience, a-game-of-deterioration, membrane-form-finding, 3t3d-vit-2d-to-3d, semantic-canvas, skill-bridge-datavis, spectral-facades, synthetic-texture-deterioration, wire-bending. Every project. Visible in BOTH desktop and mobile.
WHY IT MATTERS: (a) a11y violation — pages must have a single h1 for screen readers / SEO. (b) Visually redundant — recruiter sees title in hero, scrolls 60vh, sees the SAME title again in serif h2-equivalent typography. (c) It exposes that the body copy was authored as standalone documents and pasted in without a layout review.
FIX: Two paths.
(a) Strip the leading `# Title` from every project markdown (16 files). The hero h1 becomes the page's single h1; the body opens with `## ` first heading.
(b) Use a remark plugin to rewrite leading h1 → h2 at compile time.
Either way: must ship before another recruiter pass.

[NEW] [HIGH] [LAYOUT] [375, 414] [home]
ISSUE: At mobile 375/414 the new MobileStrip shows only 3 thumbnail tiles in the visible fold ("MSCD THESIS — AI-AUG…", "3T3D — A VISION TRAN…", "DYNAMIC 3D…"). The strip says "TAP TO EXPLORE · SCROLL ↗" but in the static screenshots only those 3 tiles are visible, suggesting horizontal scroll is the only way to see the rest. The user spec said 6 representative thumbs.
WHY IT MATTERS: Mobile-first reviewers see 3 tiles, all in one row, all from 2025–2026. Doesn't communicate breadth (architecture work is invisible on mobile fold).
FIX: Either widen the visible viewport (smaller tiles, 5–6 visible at 375) OR stack two rows of 3 (3+3 grid). Add subtle right-edge fade-mask to signal scroll affordance more strongly than the textual "SCROLL ↗" hint.

[NEW] [HIGH] [HERO / IMAGE_QUALITY] [375, 414] [home MobileStrip]
ISSUE: The first MobileStrip thumbnail at 375 shows a cropped collage with what looks like a partially-cropped person in a workshop (one of the s25-team-26 carry-over images?) — needs verification, but the mosaic doesn't read as clearly representative of "MSCD Thesis." If it's the new img-1.webp, the small-size crop center happens to render an unrelated element in the foreground.
FIX: For each project that appears in MobileStrip, supply a `mobile_thumb` frontmatter override with a strong square-cropped 320px image. Or use the `gif_hero`/`hero_image` first-frame at 320×240.

[NEW] [HIGH] [HERO] [1920, 1440] [thesis]
ISSUE: The proposal-presentation video at 1920 plays content that contains light-cream UI panels of the SC tool (Design Brief sidebar on left, Visual Settings on right). The cream panels make the hero LOOK partially light-mode at the top, contradicting the dark surrounding chrome. This is what the user described as "thesis page is in LIGHT mode while other pages are DARK" — it's not a theme bug; it's a video-content-vs-page-chrome contradiction.
WHY IT MATTERS: First-paint of the thesis page (the flagship) is a tool screencap that doesn't match the stage. Reads as "the demo got pasted onto the page."
FIX: Either crop / re-edit the video to never show the static panels (keep camera on the canvas), OR replace hero video with a poster image and put the video below.

[NEW] [MEDIUM] [HERO] [1920, 1440, 1024] [thesis]
ISSUE: Above the proposal video on the thesis page, there's a thin status-bar strip showing "✦ Semantic Latent Space · 0 images · CLIP ViT-B/32 · ✓ Ready · 2D mode" — this is the embedded SC tool's chrome leaking through to the portfolio at the START of the page. It was R1 issue #29 ("emoji status row") and was supposedly addressed by clipping iframe; but at 768 and 375 it's still rendered ABOVE the hero video at the top of the page.
WHY IT MATTERS: Wand emoji + tool-status-bar at the very top of the flagship page = unprofessional bleed. Round-1 said this was for the LIVE DEMO embed lower on page; it's appearing at the top.
FIX: Verify what's rendering this strip. If it's the BaseLayout's NowStrip or similar, gate it off. If it's coming from an iframe sticky at top, add `overflow: hidden` + height clip on the wrapper and reposition.

[NEW] [HIGH] [TEXT-ON-IMAGE] [1920, 1440, 1024] [work-l43d-cad-mllm, work-semantic-canvas]
ISSUE: l43d-cad-mllm hero at 1920 shows a bar-chart image (red+green chart bars, "Count" axis, value labels 3500/3000/2500/2000/1500). The white h1 "CAD-MLLM: Unifying Multimodality-Conditioned CAD Generation with MLLM" overlays the bars — most of the title sits over white chart background; some letters touch the colored bar segments. Better than R1 (scrim is stronger) but the chart axis labels remain visible THROUGH the h1.
work-semantic-canvas hero (1920) shows a colorful sneaker-scatter; "Latent" and "Light" specifically land over bright shoes mid-frame. Scrim coverage helps the bottom 50% but doesn't reach mid-frame where bright shoes sit.
WHY IT MATTERS: Round-1 #22 was supposed to fix this. Scrim improved but heroes with bright UI / chart imagery still produce text-on-image collisions in the upper half of the title.
FIX:
- For l43d: replace chart-image hero with the actual CAD output renders (sketches, multi-view CAD reconstructions) — the chart belongs in body imagery, not hero.
- For semantic-canvas: add a darker overall scrim variant when hero contains many small bright features, OR move title to a separate border-top block beneath the hero (more editorial, no overlay needed).

[NEW] [HIGH] [HERO COMPOSITION] [1920, 1440, 1024] [work-design-the-ambience, work-generative-urbanism]
ISSUE: These two project hero stages render as multi-tile composite images (Design the Ambience: a 2x2 with map + person at desk + texture + tool UI; Generative Urbanism: 3 stacked plates with white "Abandoned Housing" text panel embedded). The composites have multiple internal text labels and white-card panels INSIDE the hero image, and the page-level h1 sits ON TOP of one of those internal text-bearing tiles.
WHY IT MATTERS: Hero images are themselves panel-bearing collages — the eye reads "screenshot of multiple things" instead of "single curated visual." The internal labels (e.g. "Abandoned Housing") read at the same hierarchy as the page h1.
FIX: Crop each composite to ONE strong tile; keep the rest in the body gallery. Hero is a stage, not a contact sheet.

[NEW] [HIGH] [TYPOGRAPHY / IMAGE_QUALITY] [375, 414] [work-cad-mllm, work-3t3d, work-design-the-ambience]
ISSUE: At 375 these projects show the hero atlas/composite stretched to cover the full hero (e.g. 3T3D shows a 4×4 grid of small dataset tiles). Title text wrapped to 4–5 lines starts to crowd the bottom. On `/work-3t3d-vit-2d-to-3d__375` the title "3T3D — A Vision Transformer Based 2D-to-3D Model for Architectural Design" wraps to 6 lines and the dataset atlas crowds it from above.
FIX: Mobile heroes should crop to a single row of the atlas (or single tile). Don't show the full grid on small viewports.

[NEW] [MEDIUM] [INTERACTION / A11Y] [all viewports] [home]
ISSUE: The MobileStrip and the desktop scatter both lack visible `:focus-visible` styles. The 2D/3D toggle, the X/Y dropdowns, the randomize chip, and the LAYOUT radios — none show a focus ring in any captured state. Cannot fully verify without keyboard, but the source CSS does not include explicit focus-visible rules for hero controls (verified via grep — only standard `.btn:focus-visible` is defined).
WHY IT MATTERS: Keyboard navigation accessibility. Senior recruiters at design-system shops (Figma, Adobe) check this.
FIX: Add `:focus-visible { outline: 2px solid rgb(var(--accent-rgb)); outline-offset: 2px; }` to all hero interactive controls.

[NEW] [MEDIUM] [A11Y] [all viewports] [most pages]
ISSUE: Heading order audit:
- /thesis: hero h1 "Semantic Canvas", then in TL;DR strip three `<p class="mono-label">PROBLEM/APPROACH/CONTRIBUTION` (these are not headings but should be h3 semantically), then `<h2>The canvas interface</h2>` — semantic gap.
- Project detail pages: hero h1 + body h1 (the duplicate flagged above), then h2/h3 from MDX. Pages have TWO h1s.
- About page: h1 "About", then mono-label `NOW · 2026-04` (visual heading but not semantic), then h2 implicitly skipped — no h2, jumps to mono-label rows.
WHY IT MATTERS: Screen reader navigation by headings is broken.
FIX: Promote `mono-label` section markers that ARE structural section heads to `<h2>` with mono-label styling. Strip duplicate h1.

[NEW] [MEDIUM] [A11Y / ALT TEXT] [all viewports] [all pages]
ISSUE: Spot-checked alt text in source.
- `/work/[slug].astro` hero `<img alt={data.title}>` ✓
- Gallery images: `<img alt={cap ?? ""}>` — fallback empty string is OK, but most images don't have captions in `image_captions` arrays of the .md frontmatter, so most gallery images have alt="".
- PrevNextNav prev/next thumbs: `<img alt="">` ✓ (decorative, correct)
- Footer SVG icons: `aria-hidden="true"` ✓
- Theme toggle button: `aria-label="Toggle color theme"` ✓ but the button has no `aria-pressed` or `aria-current` to communicate current state.
- About headshot: `alt="David Chen portrait"` ✓
- 404 page: simple, no decorative images.
WHY IT MATTERS: Empty alt on dozens of gallery images is technically valid only if the images are decorative. They are NOT — they're project artifacts.
FIX:
1. Populate `image_captions` for every entry in every project's `images:` frontmatter array.
2. Add `aria-pressed` to ThemeToggle.

[NEW] [MEDIUM] [A11Y / CONTRAST] [all viewports] [light mode rendering — UNVERIFIABLE]
ISSUE: All R2 captures are dark-mode. Light-mode rendering of every page has not been verified. The CSS for light mode IS defined (`:root.light` block with `--text-primary: 16 14 12`, `--text-secondary: 58 54 49`, etc.) and contrast on text-primary against text-secondary on stone-50 should compute to ~12:1 AA, BUT: scrim variant for `.hero-scrim` in light mode (lines 329-340 of global.css) uses lighter alpha — 0.78 max instead of 0.85 — which on a bright photo-hero may be insufficient to land white text against high-key imagery.
WHY IT MATTERS: User asked for both modes to work. Light mode is currently unverified.
FIX: Re-capture all 6 viewport × 21 page × LIGHT theme combinations. Use document.documentElement.setAttribute('data-theme','light') before screenshot. Re-evaluate.

[NEW] [LOW] [REDUCED MOTION] [all viewports] [home, project transitions]
ISSUE: ProjectCloud / SemanticPlane are 3D rendered components (verified via /src/components/hero/SemanticPlane.tsx + ProjectCloud.tsx). Page transitions use Astro's `transition:name="hero-${slug}"` for shared-element FLIP animation. No `@media (prefers-reduced-motion: reduce)` rule found in `global.css` (grep returned no matches).
WHY IT MATTERS: Vestibular-sensitivity users get motion they didn't ask for. Sticky a11y point.
FIX: Add `@media (prefers-reduced-motion: reduce) { .scatter-tile, .hero-block::after, .reveal { transition: none !important; animation: none !important; } }` to global.css. Pause autoplay videos. Disable Three.js camera animation.

[NEW] [LOW] [INTERACTION] [all viewports] [Nav]
ISSUE: Nav.astro renders CV link as `<a class="btn btn-ghost">CV</a>` (line 54) — bare text "CV" with no glyph. R1 #52 was about About-page CV affordance; the About page CV button now has `↓ Download CV (PDF)`, but the nav-bar CV link is still bare text. Also missing `aria-label` mentioning download/external.
FIX: Add download glyph (use the same Phosphor icon as About) inside the nav CV link, OR append a tiny `↓` indicator. Match the convention of CV-as-PDF being a download.

---

### REGRESSED (Round-1 fix introduced a worse behavior)

[REGRESSED] [HIGH] [ROUTING / 404] [all viewports] [/work/live-ai-feedback-design-assistant]
ISSUE: Setting `publish: false` on live-ai-feedback removed it from `/work/[slug]` `getStaticPaths` (line 35: `({ data }) => data.publish === true`). Result: navigating to `/work/live-ai-feedback-design-assistant` now serves the 404 page. **Verified in `verification/work-live-ai-feedback-design-assistant__1920.png`** — shows the new "Not found" 404 page.
The site internally MAY still link to this slug — the homepage MobileStrip and embeddings.json both still reference it (16 items, includes live-ai-feedback). Any internal hover/link to this project's hero from the home scatter or strip leads to a 404.
WHY IT MATTERS: This is a different broken state than R1 (R1: the page rendered with no assets and an "UNPHOTOGRAPHED" tag). Now: the page outright 404s. If the homepage scatter/strip still links to it, that's a direct broken-link bug.
FIX:
1. Either set `publish: true` AND ship a real treatment (text-only PlaceholderHero, no UNPHOTOGRAPHED tag), OR
2. Remove the project from `embeddings.json`, the home atlas, the MobileStrip, and any RelatedRail referencing it.
Rebuild the data pipeline so unpublished projects vanish everywhere, not just on the index page.

[REGRESSED] [LOW] [LAYOUT] [1920, 1440] [home above-the-fold]
ISSUE: The home above-the-fold has gotten LONGER, not tighter. R1 #36 said "1100px before any content; tighten." R2 captures show the scatter consumes ~700px, then the controls band (now positioned BELOW the scatter on tablet+, but on desktop the AxisInputs panel is still bottom-overlayed AND there's a separate ModePanel sidebar) → then "SELECTED WORK" mono strip → ~250px gap → "Selected work" h1 at the LEFT (no longer centered), → ~250px more gap → first card. Total above-the-fold: ~1300px. Worse than R1.
WHY IT MATTERS: Reviewers asked for tighter; got looser.
FIX: Compress vertical rhythm in the Selected Work intro block. Drop the mono strip and merge with h1. Drop margins by 50%. First card visible by 1100px scroll.

---

## Accessibility audit summary

(See NEW issues #10–14 for detail. Top-line:)

1. **Heading order** — broken (duplicate h1 on every project page; semantic gaps from mono-label section markers).
2. **Alt text** — partial. Hero alt is OK. Most gallery images alt="" because `image_captions` arrays unpopulated.
3. **ARIA** — basic labels present; ThemeToggle missing `aria-pressed`; mobile menu disclosure uses `<details>` (semantic OK).
4. **Color contrast** — verified DARK passes AA at primary/secondary text levels. LIGHT mode unverified.
5. **Keyboard navigation / focus** — no explicit `:focus-visible` rules on hero interactive controls. Missing.
6. **Reduced motion** — no `@media (prefers-reduced-motion: reduce)` rule. Animations not disabled for opt-out users. Missing.

A11y grade: **C+ to B-**. Solid bones (semantic HTML, decent alt patterns, good contrast tokens) but four shipping a11y holes.

---

## Strengths now

1. **Default dark works.** The cream-body+dark-hero seam that ruined R1 is gone. Whole site reads as one editorial stage.
2. **404 nailed it.** The R1 moon-phases were embarrassing; R2's `Not found / This route isn't in the index. / [HOME] [VIEW WORK]` is exactly the right voice. Best new asset on the site.
3. **Dashboard reads.** Stats and chart now legible. The honest-panel framing is on-brand.
4. **About is still the floor.** Bilingual moment now typographically articulated. CV button has glyph affordance.
5. **PrevNextNav with thumbnails.** Major upgrade. The "KEEP EXPLORING / Explore the latent space" lead-in pulls forward. Conversion-positive.
6. **MobileStrip exists.** R1 had broken mobile hero; R2 has a tap-to-explore strip. Right concept; needs more visible content.
7. **AxisInputs at desktop no longer occluded.** Critical hero read fixed.

---

## The 5 most critical remaining/new issues (one-liners)

1. **Duplicate H1 on every project detail page** — hero overlay h1 + MDX `# Title` first heading = two h1s × 16 pages. A11y fail and visible visual repetition.
2. **Green block still in homepage scatter** — `embeddings.json` still has 16 entries (including `live-ai-feedback-design-assistant`). The pipeline didn't honor `publish: false`. Hero atlas re-render didn't filter.
3. **Thesis page hero shows the SC tool's cream panels** — the proposal video plays, but its content is 60% static tool sidebars (light cream) breaking the dark-stage chrome. The flagship page first-paint is unfit.
4. **Stray orange dot on `concept-config-space.png`** baked into the thesis-flagship hero AND the first /work card — survived the swap; still visible upper-right at every viewport.
5. **Wide-viewport layout still strands content in narrow column** — `.container-wide` widened title blocks but the cards/lead/body underneath still pinch to ~720–960px center. No marginalia rail. Acres of empty graphite at 1920.

---

## Updated overall design grade

**6.8 / 10.**

- Concept ambition: **9/10** (unchanged — still the differentiator).
- Type system: **7.5/10** (italic still untapped; mono floor at 12px helped).
- Color / scrim discipline: **7/10** (scrim better, light-mode unverified).
- Layout sophistication at scale: **5.5/10** (wide-viewport still weak).
- Information hierarchy: **6/10** (duplicate h1 hurt; meta-strip move helped).
- A11y: **6/10** (shipping holes).
- Content curation: **6.5/10** (heroes still uneven — diagrams, charts, tool screenshots used as primary stages).
- Execution / debug-cleanliness: **7.5/10** (filenames gone, baby photo gone, big wins).

Weighted average: **6.8**. Up from 5.5. Trajectory is right. Two more concrete steps and this is 8.

---

## Verdict

**Closer — but not yet portfolio-ready for top-tier roles. One more focused round.**

A recruiter spending 90 seconds on the page today would still see: (a) the same project title appearing twice on every project detail page, (b) a flat green color block in the homepage scatter, (c) a thesis hero that visually contradicts the rest of the site, (d) a stray orange dot in the upper-right of the most prominent /work card and on the flagship project page, (e) acres of empty graphite at 1920, (f) a project that's been "published-false'd" but is still linked from the data pipeline → 404 on click.

The recruiter would *also* see the new Dashboard, the new 404, the cleaned mobile experience, the curated-still heroes (Aurora Citadel, s25-team-26, semantic-canvas), the bilingual identity moment, and the working PrevNextNav. The site has turned from "not finished" to "almost finished, with five remaining tells."

**What it takes to flip the verdict — Round 3 priorities (3–4 hours total):**

1. **Strip the leading h1 from every project markdown** (16 files; sed regex 30 minutes) → kills the duplicate title problem on every page.
2. **Filter `embeddings.json` and atlas pipeline by `publish === true`** → kills the green block and the broken live-ai-feedback link.
3. **Replace `concept-config-space.png` hero** with `nano-generated-shoe.png` or `proposal-poster.jpg` → kills the orange dot AND replaces a diagram with a piece of actual work.
4. **Trim the proposal-presentation.mp4 hero** to its 8–12 most cinematic seconds (no static-tool framing) OR replace with a curated still + video below → kills the cream-panels-in-dark-page contradiction.
5. **Implement the marginalia rail** at >=1440 (sticky left mono kicker on project detail pages, related-rail on right) → kills the empty-cream-graphite void at wide viewports.
6. **Add `:focus-visible` rules + `prefers-reduced-motion` media query** → closes the two big a11y holes.
7. **Reconcile project counts** across home (06 OF 11), /work (12 PROJECTS), /dashboard (15 PROJECTS) → one source of truth.
8. **Fix Footer separator** (`Pittsburgh + Shanghai` → `Pittsburgh · Shanghai`) → 5 seconds.
9. **Add proper alt text to gallery images** via `image_captions` arrays in each project frontmatter → 1 hour.

That's the list. Items 1–3 are 30 minutes each and remove the four most embarrassing visual issues. Items 4–6 are the structural / a11y substance. After those, the grade lands at **8.0–8.5/10** and this site is sendable to OpenAI Design / Apple HI / Adobe / Figma / Google R&D.

Send it back to the agents, do the round, ship it next weekend.

The bones are now more than good. The execution is one full-court press away from done.
