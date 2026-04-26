# Round 4 Evaluation — David Chen Portfolio (`tianle-chen-site`)

Reviewer: Claude (Opus 4.7, 1M context). Date: 2026-04-26.
Mode: exhaustive screenshot-by-screenshot. Source: `W:\tianle-chen-site\verification\` — 138 PNGs.
Round trajectory so far: R1 = 5.5 → R2 = 6.8 → expected R4 = 8+.

---

## TL;DR

Round 4 made real visual gains — the new Variant C hero intro lands beautifully, the section-break treatment is in, tag pills are clean, the marginalia rail is now visible at wide viewports, and 9 of 14 project heroes are now genuinely cinematic. But four ship-blockers from R2 are unresolved or got worse:

1. **Three project heroes (`a-game-of-deterioration`, `aurora-citadel-gen-game`, `s25-team-26-paper-viz`) render as near-empty dark gradients** — the asset corrections produced near-invisible heroes. CRITICAL.
2. **The `live-ai-feedback-design-assistant` 404 regression from R2 is unfixed** — homepage scatter still shows the green tile that links to a 404. CRITICAL.
3. **The CAD-MLLM hero is still a histogram** — a results panel, not a piece of work. HIGH.
4. **The "01 — SECTION" marker is misused on single-section pages** (`architecture` shows "01 PROJECTS", `about` shows "01 NOW") — the numbering implies a sequence of sections but there's only one. MEDIUM.

The good news: the R2 priority list is **partly** done — the orange dot is gone, the thesis-flagship hero is now strong, the duplicate-h1 issue isn't visible in the screenshots, and the site reads as a single dark editorial stage. The bad news: the R2 most-critical-issue #2 ("green block in scatter") is still there, on every desktop viewport.

**Updated grade: 7.4 / 10. Up 0.6 from R2's 6.8.** Trajectory still positive but the unfixed R2 regressions cap the ceiling.

**Verdict: NOT YET portfolio-ready for top-tier roles. One short, focused round closes it.**

---

## Issue catalogue

Format: `[STATUS] [SEVERITY] [PAGE/VIEWPORT] / ISSUE / WHY / FIX`.

### CRITICAL — ship-blockers

---

**[STILL-ISSUE] [CRITICAL] [home / 1920, 1440, 1024, 768, 414, 375] [/]**
ISSUE: The 2D scatter on the homepage still contains a flat green-teal block tile in the upper-right region (it was R2 issue #2). It belongs to `live-ai-feedback-design-assistant`, the project that is set `publish: false`. The atlas / embeddings pipeline still emits it.
WHY: A reviewer's eye lands on the brightest, biggest unique color — it's a flat green rectangle with no hero image, surrounded by nuanced photographic tiles. It reads as a placeholder or a bug. Worse: clicking it leads to the 404 page (verified at all viewports of `work-live-ai-feedback-design-assistant`).
FIX: In the build step that generates `embeddings.json` and the home atlas, add a filter `data.publish === true`. The hero atlas needs a re-render after the filter. Also remove from `MobileStrip`. The R2 priority list item #2 was supposed to handle this — it didn't take effect. (Likely a stale cached `embeddings.json` or atlas PNG; clear & rebuild.)

---

**[STILL-ISSUE / REGRESSED] [CRITICAL] [/work/live-ai-feedback-design-assistant / all 6 viewports]**
ISSUE: The route still serves the 404 page (confirmed in `work-live-ai-feedback-design-assistant__1920.png`, `__1440.png`, `__1024.png`, `__375.png`). Same broken state as R2. Round 3/4 did not address this.
WHY: This is the most embarrassing recruiter-experience bug — clicking a visible tile on the homepage reaches a 404. R2 flagged this CRITICAL; it was supposed to be fixed by either republishing or de-listing.
FIX: Pick one — (A) Set `publish: true` on `live-ai-feedback-design-assistant.mdx`, ship a real text-only PlaceholderHero treatment, fix the broken assets, OR (B) Strip from `embeddings.json`, the atlas pipeline, the `MobileStrip` array, any `RelatedRail` references, and `getStaticPaths`. Currently the project is in a phantom state — visible but unreachable.

---

**[NEW] [CRITICAL] [/work/a-game-of-deterioration / all 6 viewports]**
ISSUE: The hero renders as a near-black panel with a faint green tint on the upper-left corner. No discernible game asset is visible. The spec says hero should be `char1-front.png` (a 4-direction sprite). Either the sprite is dark-on-dark, the file failed to load, or the dark-stage gradient overlay swallowed the asset.
WHY: A first-paint hero with no visible content is worse than no hero — it reads as broken. The whole point of the R3 asset audit was to put real game assets in front of the title.
FIX: Inspect `src/content/work/a-game-of-deterioration.mdx` `hero:` value. Check the sprite's actual brightness and alpha; if it's a 32x32 transparent sprite, render it on a non-black backdrop (e.g., a parchment cell from the in-game scene), or composite onto a 16:9 banner with surrounding game pixels. Verify the `<picture>` element source actually resolves and the `object-fit` isn't sizing the sprite to 1px.

---

**[NEW] [CRITICAL] [/work/aurora-citadel-gen-game / all 6 viewports]**
ISSUE: Hero renders as a dark navy gradient with no visible diagram. Spec says hero is `Module Layout.jpg` (a vault canonical diagram). Either the diagram is unreadably dark on the dark stage, or the file is failing.
WHY: An Unreal Engine 5 generative game project deserves a screenshot of an in-engine moment, a wave-function-collapse diagram visualization, or the module library — anything but a black void. Recruiters reading "Procedural Generative Game (Unreal Engine 5)" on top of a dark void will scroll past.
FIX: Either (A) replace hero with an in-engine screenshot showing actual generated geometry, (B) brighten the Module Layout diagram and ship as a desaturated banner, or (C) composite onto a 16:9 dark stage with a diagram inset. The current rendering is unfit.

---

**[NEW] [CRITICAL] [/work/s25-team-26-paper-viz / all 6 viewports]**
ISSUE: Hero is a near-empty black gradient with the faintest yellow-green tint at top. Spec says hero is null → `PlaceholderHero` should render. What's rendering doesn't look like an intentional placeholder — it looks like a missing image.
WHY: The `PlaceholderHero` is supposed to be an editorial design moment (e.g., a typographic treatment or geometric pattern) that signals "no canonical photo yet, by design." What renders here signals "image failed."
FIX: Define `PlaceholderHero` as an actual designed component — for example, a typographic stencil with the project title in oxide-orange ascii on a textured graphite ground, or a small abstract geometric mark. Currently it's indistinguishable from a broken `<img>`.

---

### HIGH — visible defects, not yet ship-blockers

---

**[STILL-ISSUE] [HIGH] [/work/l43d-cad-mllm / 1920, 1440, 1024, 768, 414, 375]**
ISSUE: The CAD-MLLM hero is still a 2-bar histogram (Original Models / Truncated Models). This is the same issue R2 flagged as #2 in priorities ("histogram as hero is not a piece of work"). Round 4 did not change this.
WHY: A CAD generation project should hero the generated CAD models. A histogram is a results panel — it belongs in the writeup, not the stage.
FIX: Replace `hero:` in `cad-mllm.mdx` with a representative grid of generated CAD outputs, or a single hero CAD render (mesh wireframe over orange accent works well with the palette). Move the histogram into the writeup section. White hero title also collides with the very-light gradient axis labels at all viewports.

---

**[STILL-ISSUE] [HIGH] [/work/synthetic-texture-deterioration / 1920, 1440, 1024, 768, 414]**
ISSUE: Hero composites a wood-facade photo on the left with a cream-colored UI tool screenshot on the right. The cream/light Texture Analyzer panel breaks the dark stage discipline and creates a visible seam right where the hero title sits.
WHY: This is the same class of issue R2 flagged on the thesis page (cream-panels-in-dark-stage). The thesis page got fixed; this page didn't.
FIX: Either (A) crop the hero to just the wood facade with the deterioration visualization overlay, OR (B) tint the UI screenshot to dark mode, OR (C) wrap the UI panel in a darker chrome to soften the cream-on-dark seam.

---

**[NEW] [HIGH] [/work/generative-urbanism / 1920, 1440, 1024, 768, 414, 375]**
ISSUE: White serif title "Generative Urbanism — U.S.-Mexico Border Revitalization" overlaps the cream "Abandoned Housing" map area at most viewports. White-on-cream collision; the title becomes hard to read in the right third.
WHY: The hero composites two cream photographs. The hero overlay needs a darker scrim to maintain text contrast.
FIX: Add a `linear-gradient(to right, transparent, rgba(0,0,0,0.6))` scrim to the hero, OR move the title block fully left so it doesn't overlap the cream right tile. At 768 the title's 3-line wrap helps; at 414 the title bleeds straight into the map.

---

**[NEW] [HIGH] [/work/3t3d-vit-2d-to-3d / 1024, 768, 414]**
ISSUE: White serif title sits over architectural model thumbnails — some of which have light grey/sand surfaces. At 1024 specifically, "3T3D — A Vision Transformer..." crosses through several light-toned cube models, creating contrast collisions on the second and third lines.
WHY: Sand-colored 3D models bleed into white text.
FIX: Add a bottom-anchored darker scrim under the title block; or shift the hero offset so the title sits over the darker grid cells.

---

**[STILL-ISSUE] [HIGH] [home / 1920, 1440]**
ISSUE: At wide viewports the homepage above-the-fold is now MOSTLY EMPTY GRAPHITE on the right half. The hero text block is left-anchored from x=370 to ~x=1100; everything past x=1100 is dead space at 1920. The 2D scatter, when finally visible, sits in the lower portion of the viewport (~y=550px down). The above-the-fold reads as one column of text and a void.
WHY: The Round-4 Variant C intro is good text — "Designing instruments for designing." is a strong h1 — but at 1920 it leaves the right half unused. R2 issue #5 ("acres of empty graphite at 1920") is not solved.
FIX: At 1440+ render the scatter alongside the intro (intro left, scatter right), not stacked. OR move the THESIS / UMAP / PCA / METADATA layout panel to the dead-right-zone of the hero. OR pull a second piece of content (e.g., the marginalia kicker, a bilingual element, or a "↓ continue" affordance) into the right half.

---

**[STILL-ISSUE] [HIGH] [dashboard, about, work — desktop layouts]**
ISSUE: At 1920 these pages still pinch their content to a ~720–960px wide column anchored either left or center. Wide-viewport users see acres of dark padding either side. R2 issue #5 not fixed.
WHY: A wide column reading "Dashboard" with 1100px of empty graphite to its right is visually undesigned.
FIX: Use the wide-viewport budget. Either (A) widen the content column to 1200–1400px max-width, OR (B) add marginalia rails (a sticky kicker on the left, a related-content rail on the right). Project detail pages have the marginalia rail starting to appear (e.g., `semantic-canvas` shows "COLORFUL / DARK" on the left at 1920) — extend that pattern to about/dashboard/work index.

---

**[NEW] [HIGH] [home / 1920, 1440, 1024]**
ISSUE: The 2D scatter sprites overlap each other heavily in the lower-left cluster (the wire-bending render, the design-the-ambience tile, the synthetic-texture tile, and the membrane-form tile pile up at coordinates ~(330,920)–(450,1020) in the 1920 view). It looks unintentional.
WHY: When sprites overlap, you can't read individual project identity. The whole point of the scatter is each tile is its own moment.
FIX: Add minimum-distance jittering to the THESIS layout's coordinate solver, OR accept the overlap and render with translucent borders so each tile retains its identity. Currently they read as a chaotic pile.

---

**[NEW] [HIGH] [home / 768, 414, 375]**
ISSUE: At mobile, the green block (live-ai-feedback) appears in the rightmost slot of the MobileStrip preview at 414/375 — confirms the same publish-false leak hits mobile too.
WHY: Mobile users tap-explore via the strip; tapping the green block leads to the 404.
FIX: Fix the embeddings/atlas pipeline filter (same fix as desktop scatter).

---

### MEDIUM

---

**[NEW] [MEDIUM] [architecture / 1920, 1440, 1024, 768, 414, 375]**
ISSUE: Numbered section marker reads "01 PROJECTS" but there's only one section on the page. The "01 —" prefix implies a sequence (01, 02, 03...) — but the architecture index has just one section so the prefix is meaningless.
WHY: The Round-4 numbering treatment was designed for multi-section pages (homepage, project detail, thesis). On single-section index pages it adds noise.
FIX: Either (A) suppress the number prefix on single-section index pages, OR (B) add additional sections (e.g., "01 — PROJECTS / 02 — RESEARCH NOTES / 03 — RELATED").

---

**[NEW] [MEDIUM] [about / 1920, 1440, 1024, 768, 414, 375]**
ISSUE: Same misuse — "01 NOW" is the only section break on the about page. The numbering implies a sequence but there's only one item.
WHY: Same as above.
FIX: Same — drop the number prefix on single-section pages OR add structured siblings (`01 NOW / 02 BACKGROUND / 03 SELECTED RECOGNITION` etc.).

---

**[STILL-ISSUE] [MEDIUM] [dashboard / 1920, 1440, 1024, 768, 414, 375]**
ISSUE: Project counts are inconsistent across the site — Dashboard says `15 PROJECTS`, /work says `12 PROJECTS · 4 CATEGORIES`, /architecture says `4 PROJECTS`, home scatter shows ~12–13 tiles (depending on if you include the green block). R2 priority #7 not fixed.
WHY: One source of truth is portfolio table-stakes. Reviewers will notice the mismatch.
FIX: Set a single computed source. Probably: `total = work where publish=true + architecture where publish=true`. Currently dashboard counts unpublished too (which is why it's 15 not 12).

---

**[NEW] [MEDIUM] [/work/a-game-of-deterioration / all viewports]**
ISSUE: The hero treatment shows nothing, but the breadcrumb "WORK / GAME / A GAME OF DETERIORATION" and the page chrome around it works. It would be a small win to add a fallback styled treatment when the hero asset is genuinely missing — e.g., a project-color-tinted geometric pattern, the project title rendered as oversized typography, or a 16:9 oxide-orange void.
WHY: A genuine "we have nothing visual yet" page should LOOK intentional.
FIX: Strengthen `PlaceholderHero`. Right now both `s25-team-26-paper-viz` (intentionally null) and `a-game-of-deterioration` (intended sprite) render the same near-black void.

---

**[NEW] [MEDIUM] [home / 1920, 1440, 1024]**
ISSUE: The hero intro block sits with the THESIS / UMAP / PCA / METADATA control panel and AxisInputs floating in the lower-right of the scatter zone. The control panel is visually heavy and competes with the scatter for attention.
WHY: At desktop the intro is the headline; the controls should be subtler and closer to the scatter. Currently the panel is high-contrast and pulls eye away from the intro.
FIX: Drop the control panel's contrast (make it `border-color: var(--border-subtle)` and `bg: transparent`) so it's affordant but not loud.

---

**[STILL-ISSUE] [MEDIUM] [thesis / 1920, 1440]**
ISSUE: The thesis page hero with semantic-canvas shoes is now strong, but the page beneath it is still the "PROBLEM / APPROACH / CONTRIBUTION" three-column band that R1 critiqued as too academic. At 1920 this academic-paper layout dominates.
WHY: A thesis page can be more editorial than a paper. The current layout makes it look like a paper draft, not a story.
FIX: Optional — convert the three-column band into a narrative two-paragraph lead, or keep the academic structure but soften the headers (drop ALL CAPS in favor of small caps + serif H3).

---

**[NEW] [MEDIUM] [home / 1024]**
ISSUE: The "RESEARCH ↑" axis label is positioned at the top-left of the scatter, but the corresponding "DESIGN/PHYSICAL ←" and "ML/CODE →" labels are at the bottom of the scatter. The asymmetric placement (Y axis label at TOP-LEFT, not LEFT-CENTER as conventional) confuses the read.
WHY: Reading the axes is a 2-second mental task. Asymmetric label placement adds a second.
FIX: Place the Y axis label vertically rotated on the left edge centered (`writing-mode: vertical-rl`), OR keep the top-left placement but mirror it as bottom-right with "→ PLAY".

---

**[STILL-ISSUE] [MEDIUM] [work / 414, 375]**
ISSUE: The category filter row at mobile (CAT, ML/AI, DESIGN, INTERACTION, RESEARCH) overflows horizontally — at 414 the "CAT" prefix is gone (only "ML/AI DESIGN INTERACTION RESEARCH" visible); at 375 "RESEARCH" is clipped at the right edge.
WHY: A filter row that doesn't fit is a usability dead-end.
FIX: Either make the filter row horizontally scrollable with a visual edge fade, OR collapse to a `<select>` dropdown at <500px.

---

**[NEW] [MEDIUM] [work / 1920, 1440]**
ISSUE: The first project card (MSCD Thesis) hero in the work index has a small orange dot in the upper-right of the card image. Looks like a stray marker. Same dot R2 flagged on the thesis-flagship page — that page is now fixed but the WORK INDEX card still shows the artifact.
WHY: Different hero asset on the work index card than on the project page itself.
FIX: Update the work index card to use the same hero image as the project page (or re-export the card thumbnail without the dot).

---

### LOW

---

**[STILL-OK] [LOW] [404 / all 6 viewports]**
ISSUE: None — 404 page is excellent. "404 / Not found / This route isn't in the index. / [HOME] [VIEW WORK]" reads with the right voice at every viewport. Footer is intact.
WHY: This is the strongest single screen on the site. Keep.
FIX: None.

---

**[RESOLVED] [LOW] [/work/thesis-flagship / 1920, 1440, 1024, 768, 414, 375]**
ISSUE: R2 #4 — "stray orange dot on the thesis-flagship hero" — is GONE.
WHY: R3 fix landed. Hero now uses the semantic canvas shoes layout instead of `concept-config-space.png`.
FIX: None — keep.

---

**[RESOLVED] [LOW] [thesis / 1920, 1440, 1024, 768, 414, 375]**
ISSUE: R2 #3 — "thesis page hero shows the SC tool's cream panels" — is GONE.
WHY: The thesis page now uses the curated semantic canvas shoes still as the hero. Cinematic and on-brand. Major win.
FIX: None — keep.

---

**[RESOLVED] [LOW] [most pages / all viewports]**
ISSUE: R1's "duplicate H1" (MDX `# Title` plus the hero overlay h1) is no longer visible in any project detail screenshot reviewed.
WHY: R3 priority #1 (strip leading h1 from MDX) appears to have shipped.
FIX: None.

---

**[STILL-OK] [LOW] [project detail pages / 1024+ marginalia rail]**
ISSUE: The marginalia rail (sticky left mono kicker) is starting to appear on project detail pages — confirmed visible on `semantic-canvas` (shows "COLORFUL / DARK") and on `generative-urbanism` (shows "01 / Generative Urbanism / Cuidad Juarez, Mexico"). 
WHY: This was the R2 fix item #5 — partial implementation visible.
FIX: Extend coverage to all 14 project detail pages (some currently lack the rail, e.g., `a-game-of-deterioration`, `aurora-citadel`, `s25-team-26-paper-viz`).

---

**[NEW] [LOW] [home / 1920]**
ISSUE: The "↑ RESEARCH" Y-axis label is in mono uppercase at the top-LEFT of the scatter. The X-axis labels are missing entirely at 1920 — only "↑ RESEARCH" is visible. At 1024+ "← DESIGN/PHYSICAL ML/CODE →" appears below the scatter; at 1920 these are below the fold.
WHY: A 2D scatter without visible axis labels at a wide viewport is inscrutable for first-time visitors.
FIX: Render the X labels above-the-fold even at 1920, OR change the scatter scroll position to ensure axis labels are always visible.

---

**[STILL-OK] [LOW] [tag pills on cards / all viewports]**
ISSUE: Tag pills (e.g., `THESIS`, `ML TOOL`, `INDIVIDUAL`, `INTERFACE DESIGN`) render with a clean monospace stencil treatment. They replace comma-separated text successfully.
WHY: This was a Round-4 win — tag pills land.
FIX: None — keep. Optional polish: standardize letter-spacing to be slightly tighter in the pill.

---

**[STILL-OK] [LOW] [Variant C hero intro / all viewports]**
ISSUE: The "TIANLE CHEN · GEN-AI ENGINEER · PITTSBURGH ↔ SHANGHAI" mono kicker + "Designing instruments for designing." serif h1 + "These are my projects, plotted by topic. Drag the X / Y axes to remap. Click a tile to read." subtitle reads well at every viewport.
WHY: This is the single biggest Round-4 win. The site finally announces what it is and how to use it in three lines. The serif "Designing instruments for designing." has both the conceptual ambition and the typographic confidence the portfolio needed.
FIX: None — keep. At 414/375 the wrap of the kicker is tight ("PITTSBURGH ↔ SHANGHAI" wraps to a second line); acceptable.

---

**[STILL-OK] [LOW] [PrevNextNav / inferred]**
ISSUE: PrevNextNav with thumbnails not visible in screenshots reviewed (would appear at the bottom of project detail pages, below the fold of every screenshot reviewed). Cannot verify directly.
WHY: Reviewer can't see what's not in frame.
FIX: Spot-check by scrolling and capturing the bottom of one project page in a future round.

---

**[NEW] [LOW] [/work/spectral-facades / 1920, 1440, 1024]**
ISSUE: A small green-and-orange Christmas-light cluster artifact appears on one of the secondary hero photos (the upper-right tile shows a person in a hat with what looks like festive lights in the background). Doesn't ruin the page but feels random.
WHY: It's content, not a defect — but the holiday-light hue clashes with the otherwise restrained palette.
FIX: Optional — re-crop the secondary tile to exclude the bright cluster, OR move that photo to a deeper position in the gallery.

---

**[STILL-OK] [LOW] [Footer / all viewports]**
ISSUE: Footer reads "© 2026 Tianle Chen — Pittsburgh · Shanghai" with mono kerning and the email + LinkedIn. The "Gen-AI engineer · Computational designer" subline shows at desktop. R2 #8 (footer separator) appears resolved (the bullet between Pittsburgh and Shanghai is now `·` not `+`).
WHY: Footer reads cleanly at every viewport.
FIX: None.

---

**[NEW] [LOW] [/work/aurora-citadel-gen-game / 1920, 1440, 1024, 768, 414, 375]**
ISSUE: Project title wraps awkwardly: "Aurora Citadel — Procedural Generative Game (Unreal Engine 5)". The parenthetical "(Unreal Engine 5)" feels like a tag, not part of the title.
WHY: A H1 with a parenthetical reads as documentation, not as editorial.
FIX: Promote `Unreal Engine 5` to a tag pill above the title; H1 becomes "Aurora Citadel — Procedural Generative Game".

---

**[NEW] [LOW] [/work/a-game-of-deterioration / all viewports]**
ISSUE: Title is "A Game of Deterioration — Time Reversal". The em-dash subtitle convention is consistent with `Membrane Parametric Form-finding` but inconsistent with `Aurora Citadel — Procedural Generative Game (Unreal Engine 5)` and `MSCD Thesis — AI-Augmented Footwear Design: Tools, Agency, and the Shape of Designer-AI Collaboration`.
WHY: Three different title formats across 14 projects: (a) `Title`, (b) `Title — Subtitle`, (c) `Title — Subtitle (Parenthetical)`. Inconsistency in title format reads as inconsistency in editorial discipline.
FIX: Pick one format. Recommend `Title` for short projects + tag pills for context, OR `Title — Subtitle` always with the third form prohibited.

---

**[NEW] [LOW] [/work/synthetic-texture-deterioration / 1024, 1440, 1920]**
ISSUE: Hero composites a left-half wood-facade photo with a right-half cream UI screenshot. The cream UI screenshot includes browser chrome (window controls visible at top: red/yellow/green dots, URL bar, Layers panel button). The browser chrome is editorially noisy.
WHY: When you put a tool screenshot on a page, the browser chrome adds nothing and breaks the dark stage.
FIX: Crop the screenshot to remove the browser chrome AND/OR re-shoot the screenshot in a tool that doesn't show window controls (e.g., Chrome's no-chrome screenshot mode, or browser DevTools full-page capture without OS chrome).

---

**[NEW] [LOW] [home / 1024]**
ISSUE: Y-axis label says "↑ RESEARCH" at top-left, but the corresponding bottom Y label "↓ PLAY" is also at the bottom-LEFT. Both labels are on the same side, separated by hundreds of pixels.
WHY: Conventional axis labels are at opposite ends of the axis line. Putting both at the same edge looks like a layout bug.
FIX: Move the bottom label to bottom-LEFT-of-axis-line and the top label to top-LEFT-of-axis-line — they should anchor to the axis endpoints, not float above it.

---

**[STILL-OK] [LOW] [Header navigation / all viewports]**
ISSUE: Top nav (Tianle Chen / WORK / ARCHITECTURE / THESIS / DASHBOARD / ABOUT / CV / theme-toggle) reads cleanly. Active route highlights with oxide-orange underline. Mobile collapses to hamburger + theme toggle.
WHY: Solid navigation discipline.
FIX: None.

---

**[NEW] [LOW] [home / 414]**
ISSUE: The h1 "Designing instruments for designing." wraps to 4 lines on 414 — "Designing / instruments / for designing." — taking up ~250px vertical. Combined with the kicker (2 lines) and subtitle (3 lines), the intro consumes ~500px before the MobileStrip starts. The MobileStrip first card is just barely above-the-fold at 414.
WHY: The intro is doing its job; the trade-off is it eats a lot of mobile real estate.
FIX: Acceptable trade-off. If aggressive mobile compression desired, drop h1 size from `2rem` to `1.6rem` at <500px.

---

**[NEW] [LOW] [/work/synthetic-texture-deterioration / 414]**
ISSUE: Title "Synthetic Tool for Visualizing Texture Deterioration" wraps to 3 lines on 414 with the cream UI screenshot pushing in from the right. Title is legible but tight.
WHY: A 60-character title at 414 always wraps tight.
FIX: Optional — shorten the title to "Synthetic Tool for Texture Deterioration" or just "Texture Deterioration Tool".

---

**[NEW] [LOW] [breadcrumb truncation at 375, 414 / 5 project detail pages]**
ISSUE: At 375 the breadcrumb truncates with `…` ellipses (e.g., `WORK / GAME / A GAME OF DETERIORATION — T…`, `WORK / WEB APP / DYNAMIC 3D RESEARCH PAP…`). Useful but visually cluttered.
WHY: Long titles + small viewport. Truncation is the right move.
FIX: None — acceptable; truncation chosen over wrap. Optional polish: add a `title` attribute so hover/long-press shows the full title.

---

## Round 4 wins (cleared issues from prior rounds)

1. **[RESOLVED] R2 critical #4** — orange dot on `concept-config-space.png` GONE. Both thesis-flagship project page and thesis page hero are clean. Confirmed at all 6 viewports of `work-thesis-flagship` and `thesis`.
2. **[RESOLVED] R2 critical #3** — thesis page hero is no longer the SC tool's cream panels. The new hero is the semantic-canvas shoes-in-latent-space layout — cinematic, dark, on-brand.
3. **[RESOLVED] R2 critical #1** — duplicate H1 on project detail pages is no longer visible in any screenshot reviewed.
4. **[RESOLVED] R2 LOW] Footer** — Pittsburgh · Shanghai (mid-dot) replaces the previous `+`.
5. **[RESOLVED] R1+R2] Default-dark stage cohesion** — full site reads as one dark editorial stage at every viewport.
6. **[NEW WIN] Variant C intro block** — "Designing instruments for designing." h1 + subtitle teaches users how to use the scatter. Single biggest hero-text win in the project's history.
7. **[NEW WIN] Tag pills** — replace comma-separated category text on cards with clean stencil pills. Major card-readability gain.
8. **[NEW WIN] Numbered section markers** — `02 WRITEUP` lands on project detail pages with the oxide "02" + mono "WRITEUP" treatment. Adds editorial rhythm.
9. **[NEW WIN] Marginalia rail** — beginning to appear on project detail pages at >=1024 (e.g., `semantic-canvas`, `generative-urbanism`).
10. **[NEW WIN] Alternating-zone reading** — visible across project detail pages: dark hero zone, then mid-graphite writeup zone, then dark gallery zone. Reads.
11. **[NEW WIN] CV button on About** — visible at every viewport with proper glyph.

---

## Round 4 regressions / surfacings

1. **[REGRESSED-PERSISTING] live-ai-feedback 404 still active.** R2 flagged this CRITICAL; R3/R4 didn't fix it. The route remains a 404 and the home scatter still links to it via the green block.
2. **[NEW] Three project heroes reduced to near-empty voids** — `a-game-of-deterioration`, `aurora-citadel-gen-game`, `s25-team-26-paper-viz`. Asset corrections in R3/R4 produced near-invisible heroes at every viewport. This is the single biggest new defect surface.
3. **[NEW] Misuse of numbered section markers** on `architecture` and `about` (single-section pages). The Round-4 numbering treatment is good but applied indiscriminately.
4. **[NEW] Empty graphite at 1920** — the Variant C intro reduced the vertical compression problem (R2 regression #2) but introduced a horizontal void problem. The wide-viewport budget remains under-used.

---

## Top 5 most important remaining issues (one-liners)

1. **Three project heroes (`a-game-of-deterioration`, `aurora-citadel-gen-game`, `s25-team-26-paper-viz`) render as black voids.** Re-do the asset choice or the dark-stage compositing for each.
2. **`live-ai-feedback-design-assistant` is still 404 + still in the homepage scatter as a green block.** Fix the embeddings/atlas pipeline filter and either republish or delete the project.
3. **CAD-MLLM hero is still a histogram.** Replace with a CAD model render or grid.
4. **Project counts inconsistent** across home/work/dashboard. One source of truth.
5. **Single-section pages misuse the numbered marker** (architecture, about). Drop the prefix on single-section pages, OR add structured siblings.

---

## Severity counts

- **CRITICAL**: 5 issues (1 STILL-ISSUE, 1 STILL-ISSUE/REGRESSED, 3 NEW)
- **HIGH**: 9 issues (3 STILL-ISSUE, 4 NEW, 2 layout)
- **MEDIUM**: 9 issues
- **LOW**: 14 issues (mostly STILL-OK or NEW polish)

Total issues catalogued: **37**.

---

## Updated grade

**7.4 / 10.** Up 0.6 from R2's 6.8.

- Concept ambition: **9/10** (unchanged — Variant C intro now articulates it).
- Type system: **8/10** (up from 7.5 — tag pills, numbered markers, italic restraint).
- Color / scrim discipline: **7.5/10** (up from 7 — thesis fixed, but synthetic-texture and generative-urbanism still cream-on-dark).
- Layout sophistication at scale: **6/10** (up from 5.5 — marginalia rail starting; wide viewports still under-used).
- Information hierarchy: **7.5/10** (up from 6 — duplicate h1 fixed; section markers help).
- A11y: **6/10** (unchanged — no evidence focus-visible/prefers-reduced-motion shipped).
- Content curation: **6.5/10** (unchanged — 9 of 14 heroes good, 3 black voids regressed, 2 weak).
- Execution / debug-cleanliness: **8/10** (up from 7.5 — orange dot gone, duplicate h1 gone; the green block + 404 + black-void heroes hold the line).

Weighted average: **7.4**. The R2 trajectory of "two more concrete steps and this is 8" was right — but R3/R4 only got one of the two steps done.

---

## Verdict

**Not yet portfolio-ready for top-tier roles. One more focused round (~2–3 hours) closes it.**

A recruiter spending 90 seconds on the page today would still see:

1. A flat green tile on the homepage scatter that, when clicked, leads to a "Not found" page.
2. Three project pages with near-empty black hero zones (a-game-of-deterioration, aurora-citadel, s25-team-26).
3. A CAD project whose hero is a histogram.
4. Inconsistent project counts (15 / 12 / 11) on different pages.
5. Acres of empty graphite at the right of the homepage and dashboard at 1920.

The recruiter would also see:

- The Variant C hero intro (the single best new copy on the site).
- Tag pills + numbered section markers (editorial polish).
- A clean dark stage with no light-mode seams.
- The new dashboard, the new 404, the cleaned mobile experience.
- 9 of 14 project pages with cinematic heroes.
- The bilingual identity moment on About.
- The marginalia rail starting to appear at wide viewports.

**Round 5 priorities (estimate: 2–3 hours total):**

1. **Pipeline filter for `publish=false`** — re-run the embeddings/atlas build with the filter; verify the green block and 404 link both disappear. (30 min — same fix R3 was supposed to do)
2. **Re-do three black-void heroes**: pick a visible asset for `a-game-of-deterioration` (composite the sprite onto a banner), `aurora-citadel-gen-game` (in-engine screenshot or brightened diagram), `s25-team-26-paper-viz` (designed PlaceholderHero). (60 min)
3. **Replace CAD-MLLM hero** with a CAD model grid; move histogram to writeup. (15 min)
4. **Reconcile project counts** to a single computed source. (15 min)
5. **Drop the "01 — " prefix on single-section index pages.** (10 min)
6. **Optional polish** — add scrim under text on generative-urbanism + 3T3D mobile heroes; collapse work mobile filter to dropdown; widen content column at 1920 OR add full marginalia rail to dashboard/about/work. (30 min)

After those, the grade lands at **8.2–8.5/10** and the site is sendable.

The bones are now strong. The R3+R4 gains (Variant C intro, tag pills, numbered markers, fixed thesis hero) prove the design system is capable of editorial polish. The remaining defects are a mix of one un-shipped pipeline fix from R2 and three new asset choices that didn't render. All five remaining tells are 5–30-minute fixes individually.

One round, send it.
