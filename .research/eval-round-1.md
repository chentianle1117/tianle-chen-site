# Senior Designer Critical Review — Round 1
**Reviewer:** 15-yr senior web designer (Pentagram / W+K / IDEO context)
**Subject:** tianle-chen-site (CMU MSCD thesis portfolio)
**Date:** 2026-04-25
**Method:** Walked all 138 verification screenshots across 6 viewports + spot-checked source under `src/`.
**Verdict (one line):** Strong concept, brutal execution problems on the work the recruiter sees first. Not portfolio-ready in current state.

---

## Issue counts

| Severity | Count |
|---|---|
| CRITICAL | 14 |
| HIGH | 21 |
| MEDIUM | 15 |
| LOW | 8 |
| **Total** | **58** |

---

## Issues

### 1. CRITICAL · THUMBNAIL · all viewports · home, work, work-s25-team-26-paper-viz
ISSUE: A photograph of a baby (`/assets/s25-team-26-paper-viz/weixin-image-20250210123938.jpg`) is being used as the hero for the "Dynamic 3D Research Paper Visualization Platform" project AND as the project's thumbnail in the homepage 2D scatter plane. On the project's detail page the title "Dynamic 3D Research Paper Visualization Platform" is overlaid directly on a sleeping infant in a knit cap.
WHY IT MATTERS: This is the single most damaging thing a hiring manager will see in the first 10 seconds. It signals the candidate cannot tell representative work from a personal photo, and it makes the entire scatter plane look like a junk drawer. The brief specifically called out personal-baby photos as a red flag; it is currently ground truth.
FIX: In `src/content/projects/s25-team-26-paper-viz.md`, set `hero_image:` to `null` (so PlaceholderHero renders) OR remove the project entirely from `publish: true` until you have a real screenshot of the 3D paper viewer. Also clean `images:` of every personal photo (`weixin-image-*`, `1660615735714*.jpeg`, `default-profile.jpg`, `sio-summer-course-enrollment-proof*`). Replace homepage scatter atlas cell with a placeholder mark, or drop the project from the homepage selection until a real screenshot exists. This must be the first fix.

### 2. CRITICAL · HERO · 1920, 1440, 1024 · home
ISSUE: The AxisInputs `<select>` panel at the bottom-center of the 2D scatter has a project thumbnail rendering ON TOP of the dropdown values. On `home__1920` you can read "Desi…al ↔ ML/Code" because a tiny dark thumbnail is sitting over the middle of the X select. On `home__1440` and `home__1024` it's worse — the panel is half-occluded by a thumbnail.
WHY IT MATTERS: The hero is the centerpiece. A primary control being unreadable because layered SVG/HTML stacking is wrong is a CSS-discipline failure that signals "doesn't ship." Recruiters reaching for the controls will see broken UI on first hover.
FIX: `src/components/hero/AxisInputs.tsx` line 53 — the panel wraps with `z-20`. Verify `SemanticPlane`/`FlatScatter` thumbnail wrapper z-index is below 20, or add `pointer-events: none` + `z-index: 10` on a wrapper around the scatter so AxisInputs and ModePanel always sit above. Also extend the bottom margin of the scatter plane to `bottom-32` so projects placed at low-Y positions never reach the panel area.

### 3. CRITICAL · HERO · all viewports · thesis
ISSUE: The thesis page hero is supposed to be a full-bleed proposal video, but at 1920 it renders as a fragmented Semantic Canvas tool screenshot — left and right side panels visible, center void empty (Load Images / Export / Visual Settings panels in cream blocks). At 768 and 375 it renders as a complete black void with a tiny floating "← organic … geometric →" pill mid-frame. The video does NOT play.
WHY IT MATTERS: This page is the literal flagship — it's the thesis. A recruiter who clicks the THESIS nav item lands on a broken stage with no content above the fold. Every other site weakness is forgivable; the thesis page being broken is not.
FIX: `src/pages/thesis.astro` — verify the video element points to `/assets/thesis-flagship/proposal-presentation.mp4` and that it autoplays muted, plays inline, and `object-cover`s the hero. The thumbnails-with-dock UI is leaking through; the embedded Semantic Canvas demo iframe should be a SECONDARY block lower on the page, not the hero. Move the live demo iframe below the hero and add a poster image to the video tag so the first paint is not a black void.

### 4. CRITICAL · HERO · all viewports · work-thesis-flagship
ISSUE: The hero on the flagship MSCD thesis card is a strip of bright sneaker thumbnails (atlas-style, the dataset augmentation summary) with white title text laid on top. At 375 the title `MSCD Thesis — AI-Augmented Footwear Design` overlays directly on white sneakers and on the cream gaps between them, AND filenames `img_18_20251030_172117_622` are baked into each thumbnail and visible THROUGH the title.
WHY IT MATTERS: White-on-white text. Filenames as captions. This is the second-most-prominent project page on the site. It currently looks like a debug build.
FIX: Two problems. (a) `src/content/projects/thesis-flagship.md` line 40 — `hero_image: /assets/thesis-flagship/nano-generated-shoe.png` should resolve, but the screenshots show the dataset atlas, suggesting the image is being replaced upstream OR the actual rendered hero is the first item of `images:`. Verify `publicFileExists("/assets/thesis-flagship/nano-generated-shoe.png")` returns true at build. (b) Whatever atlas image is being shown, it has filename labels burned in — those are debug renders, not portfolio assets. Regenerate the atlas without filename overlays, or pick a single representative still (e.g. `nano-generated-shoe.png`, `concept-config-space.png`, or a frame from the proposal video).

### 5. CRITICAL · CONTRAST · all viewports · dashboard
ISSUE: The "Content Stats" panel renders `16`, `20K`, `4`, `168` as huge display numerals in what is effectively `var(--text-faint)` over `var(--surface-bg)` — they are nearly invisible. At 1920 you can barely tell there are numbers there. At 375 they vanish almost completely.
WHY IT MATTERS: A site internals dashboard with unreadable stats reads as accidental. This is the page the user explicitly wants to show off as a "design-the-interface-yourself" beat — the numbers must read.
FIX: `src/components/DashboardPanel.astro` (or the dashboard inline styles) — the stat numbers should be `color: rgb(var(--text-primary))`, not `--text-faint` / `--surface-mute`. Likely a token swap: change the stat-number rule from `--surface-fg` to `--text-primary` and step font-weight to ≥500.

### 6. CRITICAL · HERO · 375, 414, 768 · work-thesis-flagship, work-semantic-canvas
ISSUE: On mobile, the hero image filename labels (`img_20_20251030_172117_622`, etc.) overlay the project title text. The title "MSCD Thesis — AI-Augmented…" runs through `img_20251030...` overlays. Same on `work-semantic-canvas__375` — atlas overlays the title.
WHY IT MATTERS: Recruiters open portfolios on phones during commute. First hero on mobile being unreadable is a kill-shot.
FIX: Replace any atlas-with-filenames hero with a single curated still. For semantic-canvas use `semantic-canvas-ui.png` (or `p3-stage2-session2-composite.png`). For thesis-flagship use a clean rendered shoe still or the proposal video poster.

### 7. CRITICAL · CLICHÉ · all viewports · 404
ISSUE: The 404 illustration is three half-circles ("eclipses" / "moon phases"). They float in the right column with zero relationship to anything else on the site — no other phase-of-moon motif exists in the brand language.
WHY IT MATTERS: 404 is a free design moment to reinforce voice. Generic moon-phase shapes feel like a stock SVG dropped in. Doesn't read as "tasteful interactive" — reads as "ran out of time."
FIX: `src/pages/404.astro` — replace the half-circle illustration with either (a) a tiny scatter of disabled atlas dots that drifts slightly on cursor (callback to the home hero, on-brand), or (b) just typography. Keep it MORE minimal, not less.

### 8. CRITICAL · LAYOUT · 1920, 1440 · work, architecture, about, dashboard, 404, all work-* details
ISSUE: At 1920 the body content is anchored to a narrow center column (~720–960px), leaving 30–40% of the viewport as flat cream void on each side. The eye is drawn to acres of empty space, not to the work. Architecture page at 1920 is the worst — the title block consumes ~40% of width and is surrounded by symmetric cream emptiness.
WHY IT MATTERS: User explicitly flagged "stranded narrow column on wide viewports." Studio-grade portfolios (Pentagram, Bureau Cool, Linked By Air) handle wide viewports either by using the full width or by intentional wide marginalia (date stamps, callouts, atlas glyphs). This site does neither — it just stops rendering at column edge.
FIX: `src/styles/global.css` — define `.container-wide` at `max-width: 1440px` for index/list pages. For the work-detail body, push `--measure` from ~68ch to widen the lead block. Better: add a left mono rail (year, role, status) and a right rail (related links) as fixed marginalia so the cream void becomes structured side-content. This unlocks the wide viewport without dropping body width.

### 9. CRITICAL · HERO · 1920, 1440, 1024 · home
ISSUE: The "↑ RESEARCH" axis label sits at the upper-left of the scatter, but there is no "← DESIGN/PHYSICAL" / "ML/CODE →" pair on the right and bottom for clarity at quick read. The grid lines are also barely-there (very low alpha) on dark which makes the plane feel like images floating in nothing rather than a coordinate system.
WHY IT MATTERS: The semantic-axes hero IS the conceptual hook of the site. If a viewer doesn't immediately read it as a 2D plane, the whole thesis is invisible.
FIX: Bump grid stroke alpha from ~0.04 to ~0.10 on dark, ~0.08 on light. Always render all four corner labels (X-min, X-max, Y-min, Y-max) at consistent positions. Consider a faint axis tick set every 0.25 units.

### 10. CRITICAL · INFORMATION_HIERARCHY · all viewports · work
ISSUE: Each work-index card renders `2026 · 48-769` as a mono kicker, the title, then category tag chips. But the IMAGE above the title is a 4×3 atlas with EVERY filename burned in (`img_16_20251030_172040_245`, `img_18_20251030...`). Those filenames are visual noise that the eye reads first.
WHY IT MATTERS: Filenames in a portfolio thumbnail = "I shipped a debug render." It's the single most amateur tell.
FIX: Re-render every dataset-style atlas WITHOUT filename overlays. The atlas should be pure imagery. If filenames matter for provenance, put them in the body text, never in the thumbnail.

### 11. CRITICAL · HERO · all viewports · work
ISSUE: The MSCD thesis card is the very first card in the work index, and its hero is the dataset augmentation atlas, NOT a curated thesis still. There is also a stray bright-orange dot floating in the upper-right of the atlas (a corner UI element from the original render that wasn't cropped out).
WHY IT MATTERS: First card sets the tone for the entire work index. The "dot" looks like a leftover badge / a glitch.
FIX: Replace the thesis-flagship hero (in `src/content/projects/thesis-flagship.md`) with a single clean still — `nano-generated-shoe.png`, the proposal video poster, or a frame from `concept-config-space.png`. Crop or repaint the orange dot out before shipping.

### 12. CRITICAL · TYPOGRAPHY · 375 · work-thesis-flagship, work-semantic-canvas, work-live-ai-feedback-design-assistant
ISSUE: At 375 the project hero h1 wraps so aggressively that words break across 6+ lines and consume the full hero. Title takes the entire 60vh hero. There's no air. On `live-ai-feedback-design-assistant__375` the title is six lines tall.
WHY IT MATTERS: Mobile reads as broken when titles outweigh imagery. A modest hero-title tier (smaller font on narrow viewports) is studio-standard.
FIX: `src/pages/work/[slug].astro` line 175 — h1 is fixed at `var(--step-5)` (no responsive ramp). Add `clamp(2rem, 6vw, var(--step-5))` for mobile. Also reduce `font-weight: 380` to 350 on narrow viewports so the dense type doesn't stack.

### 13. CRITICAL · THEME · all viewports · work, home (lower section), about, architecture, dashboard, 404, all work-*
ISSUE: The body of nearly every page rendered as cream/stone background with graphite type — i.e. light mode appears to be the default, or the screenshots ran with `prefers-color-scheme: light`. The hero on detail pages is a separate dark "stage," but the rest of the page is cream. This creates a visible STITCH between the dark hero and the cream body — every page has a hard horizontal seam at ~60vh.
WHY IT MATTERS: User explicitly asked for both modes to work; what's shipping reads as "dark stage transplanted onto a light document." The seam is jarring at every project page.
FIX: Two options. (a) Commit to fully dark by default — change `:root { --surface-bg: ... }` to graphite. (b) If keeping the cream document with dark hero, soften the transition: add a 24px gradient fade between hero (graphite) and body (stone) instead of a hard 1px border. `src/pages/work/[slug].astro` line 109 — replace `border-bottom: 1px solid` with a 32px linear-gradient mask.

### 14. CRITICAL · BRAND_VOICE · 1920, 768, 375 · 404
ISSUE: "This route doesn't exist. The latent space might." — This is cute-coded prose. It's also incomplete (subject + might + nothing). It's trying to be clever and instead reads as a half-finished sentence.
WHY IT MATTERS: User explicitly asked for "modest text — no big marketing headlines." A line that's not even a complete sentence reads as draft copy.
FIX: `src/pages/404.astro` — change to a single complete line: "Not found. Try the work index." Or even shorter: "Not in the index." Drop the "latent space" wink — it overplays the thesis vocab.

---

### 15. HIGH · HERO · all viewports · home
ISSUE: The 2D scatter has only ~12 thumbnails despite 16 projects. Some live-AI / wire-bending / fiber-pavilion are missing from the spread, while a flat green color-block and a flat green `Skill Bridge` thumbnail dominate two cells.
WHY IT MATTERS: The whole point of "Selected Work + scatter" is that you're showing the breadth. Two flat-color tiles in a 12-tile field reads as "lazy preview tiles."
FIX: Re-curate atlas. Every cell needs visual specificity — a still, a UI screenshot, a 3D render. Pure color blocks are forbidden.

### 16. HIGH · THUMBNAIL · all viewports · home
ISSUE: One scatter tile is a flat solid green square ("Skill Bridge" thumbnail per atlas naming). Another is a flat green-gray. These are placeholder stand-ins, not portfolio thumbnails.
WHY IT MATTERS: Solid color blocks beside richly-rendered project stills tell the viewer "I didn't bother."
FIX: Generate a real still for skill-bridge from `/assets/skill-bridge-datavis/` (the actual datavis interface should be the source). Use `dl_skill-bridge.json` references in `.research/` for the original screenshots.

### 17. HIGH · LAYOUT · 1920, 1440 · home
ISSUE: The ModePanel (VIEW / LAYOUT / X / Y axis labels) sits at the top-right of the scatter. Some project thumbnails (e.g. l43d UI screenshot at upper-right and the mood-board panels) render either underneath the panel or in the gutter beside it. The panel feels unanchored — its left edge has no relationship to the grid.
WHY IT MATTERS: The mode/axis controls are the conceptual UI of the entire site. They need to read as part of the system, not a sticker stuck on top.
FIX: Pull ModePanel inside the scatter container with `padding-right: 240px` reserved on the plane so projects can never collide. Or move ModePanel to a fixed sidebar (see issue 8 — the wide-viewport rails).

### 18. HIGH · TYPOGRAPHY · all viewports · home, about, dashboard
ISSUE: Page titles inconsistently use trailing periods. "Dashboard." "About." "Not found." use periods. "Selected Work" "Architecture" "Semantic Canvas" do NOT. There's no system.
WHY IT MATTERS: Senior designers signal control through systems. Punctuation as voice is a real lever, but it must be consistent.
FIX: Pick one. For modesty, drop ALL periods on h1. The period-as-rhetoric works in editorial design but not at this density (it makes the design page sound like a sentence and the work page sound like a heading — confusing).

### 19. HIGH · LAYOUT · 1920, 1440 · architecture
ISSUE: The architecture page hero block uses ~40% of the viewport width for a 3-line description and a single-word h1 ("Architecture"). The remaining 60% is empty cream. Below that, the 2-col grid of project thumbnails is anchored to the same narrow column, leaving the same emptiness.
WHY IT MATTERS: The architecture work IS visually rich — wireframes, simulations, robotic fabrication. Showcasing it in a narrow column is the opposite of what the work needs.
FIX: Architecture page should use `container-wide` (1440px) and the project grid should be 3-col at ≥1440. Move the kicker text to a left rail, push the project grid to span the full width.

### 20. HIGH · INFORMATION_HIERARCHY · all viewports · work
ISSUE: The filter bar at the top of `/work` has a hard graphite-black background that breaks the cream/oxide brand language and doesn't match anything else on the site. It looks like it was lifted from a different template.
WHY IT MATTERS: User asked specifically for tailored over template. A filter bar with a black background on a cream page is the most template-y move possible.
FIX: `src/components/FilterBar.astro` — switch background to `rgb(var(--surface-mute))` (a half-step graphite over cream), or to transparent with `border-y: 1px solid`. Active filter state can keep the oxide accent — but the bar background must speak the same language as the page.

### 21. HIGH · HERO · 1920 · work-thesis-flagship
ISSUE: The hero stage has a stray BRIGHT ORANGE dot in the upper-right corner — looks like a notification badge. There's no notification on this page.
WHY IT MATTERS: Stray UI dots = "this was a screenshot of a different app." Detracts immediately.
FIX: That dot is baked into the source image (likely the augmentation summary panel header). Re-render or crop.

### 22. HIGH · TYPOGRAPHY · 1920, 1440, 1024 · work-thesis-flagship, work-semantic-canvas, work-l43d-cad-mllm
ISSUE: White hero title text sits on bright sneaker imagery (thesis-flagship), bright red+blue chart bars (l43d-cad-mllm), and high-key shoe imagery (semantic-canvas). The hero-scrim only covers the bottom 60%, so the upper portion of the title sits unscrimmed against bright content.
WHY IT MATTERS: Text-on-image collision is the most-cited contrast failure in design reviews.
FIX: Two options. (a) Strengthen scrim — `src/styles/global.css` line 234, change to a full-coverage radial gradient anchored at title position with ~0.5 alpha. (b) Move title OUT of hero and into a separate `border-top` block under the hero (cleaner, more editorial). Option (b) is better for a "tailored" feel.

### 23. HIGH · CONTRAST · 1920, 1440 · home
ISSUE: The mono kicker `↑ RESEARCH` and `↓ PLAY` axis labels are graphite-400 (low contrast) on a near-black scatter background. Difficult to read.
WHY IT MATTERS: Axis labels carry the entire conceptual frame. They must read at a glance.
FIX: Bump from graphite-400 to graphite-200 (or `rgb(var(--text-mono))` upgraded). Also boost letter-spacing slightly to keep them airy.

### 24. HIGH · INTERACTION · all viewports · home
ISSUE: The AxisInputs randomize button is a tiny "↻ randomize" link. The arrows for scatter axis labels (`↑ ← ↓ →`) feel disconnected from any interactive affordance. Nothing about the panel suggests "drag the axes" — which is the tool's whole story.
WHY IT MATTERS: Interactive but tasteful means viewers should discover the interaction in 3 seconds. Currently it reads as static.
FIX: Add a brief hover state + a one-line micro-label `try changing X / Y` somewhere near the panel. Bump the randomize button from ghost-link to a subtle outlined chip with the dice glyph.

### 25. HIGH · HERO · 768, 1024 · home
ISSUE: At 768 and 1024 the AxisInputs panel covers ~40% of the lower scatter, occluding 4–5 project thumbnails. The thumbnails are still rendering UNDER the panel, creating a visual mess.
WHY IT MATTERS: At tablet, the hero has half its content blocked by its own controls.
FIX: At <1280, move AxisInputs from `bottom-5 left-1/2` overlay to a fixed strip BELOW the scatter. The plane gets full vertical space; the controls live in their own band.

### 26. HIGH · MOBILE · 375, 414 · home
ISSUE: At 375 and 414 the ModePanel and AxisInputs panel together consume the entire scatter region. The semantic plane has no usable surface — it's two stacked panels with thumbnails crammed between/behind them.
WHY IT MATTERS: Mobile-first reviewers will see no scatter at all, just controls. The hero conceit collapses.
FIX: On mobile, swap the 2D scatter for a static strip of 6 representative thumbnails with a single line of axis labels. Keep the 2D plane for ≥768. The "interactive" promise is best honored on desktop where the controls have room.

### 27. HIGH · LAYOUT · 1920, 1440 · home
ISSUE: Below the scatter, the "SELECTED WORK · 06 OF 12 · 2022–2026" mono strip has the project numerator on the LEFT of the page width and the year span on the right — but the actual title "Selected work" is below in display serif, anchored left. The horizontal rule above the strip extends full-width, but the strip itself is centered. Inconsistent anchoring.
WHY IT MATTERS: Section breaks should establish a clear horizontal rhythm. Currently it reads as three different left-edges.
FIX: `src/components/SectionBreak.astro` and the Selected Work block — pick a single left edge (the body grid left edge) and align everything to it.

### 28. HIGH · IMAGE_QUALITY · all viewports · home, work
ISSUE: The atlas thumbnails look soft / slightly blurry — likely scaled UP from a 4096×4096 atlas where each cell is 1024px but rendered at 200–300px on screen. There's also visible JPEG-style ringing around hard UI edges (the `Skill-Bridge` data viz, the wire-bending screen).
WHY IT MATTERS: Crispness is table-stakes for design portfolios.
FIX: Re-export atlas at higher quality (PNG-24 or 95-quality WebP). Make sure individual thumbnails are sharp at their actual on-screen size: at 1920 the scatter cells are ~150–180px so 360×360 source is sufficient; the atlas should not be cell-padded with mip-blur.

### 29. HIGH · INFORMATION_HIERARCHY · 1920 · thesis
ISSUE: Above the broken hero, there's a strange purple-emoji bar (`✦ Semantic Latent Space · 0 images · CLIP ViT-B/32 · ✓ Ready · 2D mode`). This is the live tool's status header — leaking through to the portfolio site.
WHY IT MATTERS: A wand emoji + tool-status row in a portfolio context reads as "I forgot to clean up." It's the live demo's chrome bleeding into editorial space.
FIX: When embedding the Semantic Canvas demo on the thesis page, hide its app header bar via either (a) iframe with a clipped viewbox, (b) a wrapper that masks the top 48px, or (c) render only a video walkthrough on the public page and link to the live demo separately.

### 30. HIGH · HERO · all viewports · thesis
ISSUE: The proposal video doesn't play. The hero is either empty (mobile) or a half-rendered tool sidebar (desktop).
WHY IT MATTERS: User specifically called out "does the proposal video play full-bleed in the hero?" — answer: no.
FIX: `src/pages/thesis.astro` — verify `proposal_video: /assets/thesis-flagship/proposal-presentation.mp4` resolves at build time, mount it as the primary `<video>` with `autoplay muted loop playsinline preload="auto" poster="..."`.

### 31. HIGH · CONTRAST · all viewports · all work-* (light body sections)
ISSUE: In the body of project pages, body text appears to be `rgb(var(--text-secondary))` on cream — a graphite-on-stone that reads as muted and slightly washed at standard reading distances.
WHY IT MATTERS: Long-form project text needs ≥4.5:1 contrast. This currently reads at 3.5–4:1.
FIX: Token tweak: `--text-secondary` should not be more than 25% lighter than `--text-primary` for body copy. Reserve `--text-secondary` for tertiary metadata only.

### 32. HIGH · CLICHÉ · all viewports · work card meta strip
ISSUE: The work-index card meta uses tag chips with thin oxide borders — `THESIS` `DESIGN RESEARCH` `AI/ML`. This is acceptable, but combined with the mono filenames burnt into the atlas above and the mono `2026 · 48-769` kicker, it tips into "techy badge cluster" territory.
WHY IT MATTERS: User asked for techy without cliché. Three mono things stacked in one card feels like over-systemizing.
FIX: Drop the chip outlines; render the categories as comma-separated mono lowercase text — `thesis · design research · ai/ml`. Keeps the typographic system, drops the chip count.

### 33. HIGH · MOBILE · 375 · work-live-ai-feedback-design-assistant
ISSUE: This project has zero assets in `public/assets/live-ai-feedback-design-assistant/`. The hero rendered as a black void with a small "UNPHOTOGRAPHED" tag in the lower-right corner. Combined with a 6-line wrapped title, the page looks abandoned.
WHY IT MATTERS: An empty project page is worse than no project page. "UNPHOTOGRAPHED" as a corner tag says "I knew this was bad and shipped it anyway."
FIX: Either (a) hide this project from `publish: true` until photo'd, OR (b) render PlaceholderHero with a strong typographic treatment + one diagram from the writeup. Drop "UNPHOTOGRAPHED" — say "in progress" or just nothing.

### 34. HIGH · INFORMATION_HIERARCHY · all viewports · all work-* details
ISSUE: After the hero+title there's a "Inline mini-meta" strip with Role / Team / Stack BEFORE the body content, then the ProjectMeta horizontal strip, then the body. That's three meta blocks in a row before the user reads anything.
WHY IT MATTERS: Eyes glaze. User wanted "modest text" and got a wall of metadata.
FIX: `src/pages/work/[slug].astro` — collapse the mini-meta into ProjectMeta and lead with the project body / lead paragraph. Save the metadata strip for end-of-page reference.

### 35. HIGH · BRAND_VOICE · all viewports · about
ISSUE: The About copy is mostly tight, but `David Chen (陳天樂) is a computational designer and ML engineer working at the seam of generative AI and design tooling.` — "working at the seam" is decent. But the next clause "He is finishing an MSCD thesis at Carnegie Mellon — Semantic Canvas, an interactive latent-space interface for AI-augmented footwear design — and joins HILOS Studio full-time as an ML/AI engineer in June 2026" is one 60-word sentence with three em-dashes. It runs.
WHY IT MATTERS: Voice. About copy should read as a confident person, not a press release.
FIX: Break into 2 sentences. "He is finishing an MSCD thesis at CMU — Semantic Canvas, an interactive latent-space interface for AI-augmented footwear design. He joins HILOS Studio full-time as an ML/AI engineer in June 2026." Cut the second em-dash.

---

### 36. MEDIUM · LAYOUT · 1920 · home
ISSUE: The hero scatter takes ~700px of vertical space, then there's a huge cream gap (~150px) before "SELECTED WORK" mono strip, then "Selected work" h1 ~300px below, then the first card. Total 1100px before any content. Fold is wasted.
WHY IT MATTERS: Above-the-fold should pay rent. Currently the fold is mostly empty cream with a horizontal rule.
FIX: Tighten vertical spacing. Drop the "Selected Work" mono strip + h1 into a single line at the top of the section. Save 150–200px.

### 37. MEDIUM · LAYOUT · all viewports · home
ISSUE: After the "Selected Work" section, the homepage continues with a thesis teaser, an architecture rail, an about teaser. None of those are visible in the screenshots provided (only "Selected work" h1 was reachable in the captured fold). Suggests the screenshots are full-page but the homepage continues — fine.
WHY IT MATTERS: Verifying that the architecture rail / thesis teaser exist with proper section breaks is the user's stated concern.
FIX: Re-screenshot the homepage at full height to verify SectionBreak rhythm. (Couldn't verify from the captures provided.)

### 38. MEDIUM · INTERACTION · all viewports · home
ISSUE: The 3D toggle (`2D | 3D`) appears as a small button pair top-right. There's no visual indicator that the 3D mode is more than just rotating projects — no preview, no tooltip explaining what 3D shows.
WHY IT MATTERS: Hidden interaction = wasted feature.
FIX: Hover state on `3D` button: tooltip "Same projects, depth axis adds Z (e.g. complexity)."

### 39. MEDIUM · TYPOGRAPHY · all viewports · all
ISSUE: The display serif (Newsreader) is excellent but feels under-used. Most h1s are at one weight, one slant. No italic display moments anywhere — and Newsreader has a beautiful italic.
WHY IT MATTERS: Editorial-grade portfolios use italic display sparingly to mark voice or quote a project name. Currently feels flat.
FIX: Try italic on project titles within body text (e.g. `*Semantic Canvas*`) or on the kicker-line lead.

### 40. MEDIUM · CONTRAST · all viewports · home
ISSUE: The "↑ RESEARCH" axis label uses `mono-label` color tokens, which on dark scatter map to graphite-500-ish. They're legible but quiet.
WHY IT MATTERS: Conceptual labels carry the meaning.
FIX: Bump axis label opacity from ~0.55 to ~0.75. Or render them with a 1px graphite-700 background bar so they sit ON the grid line, not floating.

### 41. MEDIUM · INFORMATION_HIERARCHY · all viewports · about
ISSUE: The headshot is well-placed but the experience timeline below is cut off in the captures. Cannot verify mono-list legibility.
WHY IT MATTERS: User asked specifically.
FIX: Re-screenshot at full page height. (Likely OK; unverifiable from given captures.)

### 42. MEDIUM · BRAND_VOICE · 1920 · about
ISSUE: "David Chen (陳天樂)" — Chinese name in parentheses is fine; tasteful. But on screen the parenthetical sits in default body weight; could be a typographic moment with the Chinese characters at a slightly smaller size.
WHY IT MATTERS: Bilingual identity is part of the voice.
FIX: Wrap `(陳天樂)` in `<span style="font-size: 0.92em; opacity: 0.75;">`. Tiny, but it's the kind of detail Pentagram does.

### 43. MEDIUM · LAYOUT · 768, 1024 · architecture
ISSUE: At 768 the architecture project grid drops to 1-col but kicker copy still wraps awkwardly. At 1024 the 2-col grid uses small thumbs that under-sell the work.
WHY IT MATTERS: Architecture portfolio needs scale.
FIX: 768 should keep 2-col with smaller thumbs but more aspect ratio. 1024 can go 2-col at full width.

### 44. MEDIUM · INTERACTION · all viewports · all work-*
ISSUE: PrevNextNav at the bottom of every project page is functional but pure text ("← previous · next →"). No image previews of what's next. A standard pattern for design portfolios is to render a tiny thumbnail of the next project so the viewer is pulled forward.
WHY IT MATTERS: Conversion. The whole site is "view as much as possible."
FIX: `src/components/PrevNextNav.astro` — add 80×60 thumbnails of prev/next hero next to the labels.

### 45. MEDIUM · IMAGE_QUALITY · 1920 · architecture
ISSUE: The fiber-pavilion 3D simulation render in the architecture grid looks crisp; the wire-bending HoloLens GIF (assumed) — couldn't verify animation from static captures. If GIFs are static-frame at 1920, they're not earning the file size.
WHY IT MATTERS: Animated GIFs of physical fabrication are a star moment for the architecture work.
FIX: Verify all `gif_hero` projects actually animate on /architecture. Consider replacing GIF with looped MP4 (smaller, smoother).

### 46. MEDIUM · MOBILE · 375 · work
ISSUE: At 375 the filter bar wraps to two lines (CAT row + YEAR row) with the `RESEARCH` chip getting clipped on the right edge. Pixel-clip on small phones.
WHY IT MATTERS: Filter chip clipping is broken state.
FIX: `src/components/FilterBar.astro` — at <414, swap chip overflow from `flex-wrap` to horizontal scroll with a fade-mask on the right edge.

### 47. MEDIUM · INFORMATION_HIERARCHY · 1920 · dashboard
ISSUE: Dashboard panel borders use 1px solid graphite-200 outlines. They're delicate but read as "card UI" — which is template-y.
WHY IT MATTERS: User said "not template-y SaaS marketing." Bordered cards on cream is exactly that aesthetic.
FIX: Drop card borders. Use horizontal rules between sections, not enclosed boxes. Let the panels breathe in the column.

### 48. MEDIUM · TYPOGRAPHY · all viewports · all
ISSUE: Mono is IBM Plex Mono — fine. But it's used at very small sizes (~11–12px) for the `--mono-label` class, and at small sizes Plex Mono's distinctive characters get muddy on cream. The eye reads it as "noise."
WHY IT MATTERS: Mono labels are infrastructure; they need to disappear into legibility, not shout.
FIX: Bump mono-label baseline size from ~11px to 12px. Or swap to a slightly more open mono at small sizes (Berkeley Mono / Söhne Mono if licenses available).

### 49. MEDIUM · LAYOUT · all viewports · all work-*
ISSUE: Project gallery images at the bottom of detail pages render as a single column at all viewports, even on 1920. A wider viewport with a single-col gallery wastes half the surface.
WHY IT MATTERS: Project images are the second-most-important content (after the hero). They should have layout sophistication.
FIX: 2-col responsive gallery for ≥1024, with optional `:span-2` for hero-grade stills.

### 50. MEDIUM · BRAND_VOICE · 1920, 768, 375 · home
ISSUE: The mono kicker `06 of 12 · 2022–2026` on Selected Work is legibly elegant — "12" implies twelve cards, but the captured page shows "13 PROJECTS" elsewhere on /work. Inconsistency in count.
WHY IT MATTERS: Numbers must agree across pages or trust drops.
FIX: Pick one count (12 or 13) and reference a single source. If "selected" is a curated subset, label it "06 of 12 selected · 13 total."

---

### 51. LOW · TYPOGRAPHY · all viewports · all
ISSUE: Em-dashes (`—`) are used everywhere — sometimes with hair spaces, sometimes with regular spaces. Mixed.
WHY IT MATTERS: Editorial typography.
FIX: Pick one rule (em-dash with thin spaces, or em-dash with no spaces). Apply globally.

### 52. LOW · INTERACTION · all viewports · all
ISSUE: The CV link is "CV" in the top nav. Always-visible, fine. But it's a pure text link — no chevron, no download glyph, no "↗" indicator that it opens externally.
WHY IT MATTERS: Tiny affordance signal.
FIX: Append `↓` (download) glyph. Also confirm CV file exists at link target.

### 53. LOW · LAYOUT · 1920 · about
ISSUE: The headshot is square-cropped with crisp edges. Could benefit from a 1px graphite hairline border for studio-grade containment.
WHY IT MATTERS: Editorial polish.
FIX: Add `border: 1px solid rgb(var(--surface-border))` on the headshot image.

### 54. LOW · INFORMATION_HIERARCHY · all viewports · home
ISSUE: The `↑ RESEARCH` and `← DESIGN/PHYSICAL` labels could be paired with their opposites (`↓ PLAY` / `ML/CODE →`) at all four corners explicitly. Currently only two of the four are visible at once.
WHY IT MATTERS: The 2D plane reads as a quadrant only when all four anchors are present.
FIX: Always render four corner labels.

### 55. LOW · BRAND_VOICE · all viewports · footer
ISSUE: Footer reads `© 2026 Tianle Chen — Pittsburgh + Shanghai · Gen-AI engineer · Computational designer`. The `+` separator vs `·` separator within the same line is mixed.
WHY IT MATTERS: Tiny consistency.
FIX: Pick one. `Pittsburgh · Shanghai` reads more typographically.

### 56. LOW · INTERACTION · all viewports · home
ISSUE: Theme toggle is a moon icon top-right. Always good. But the icon doesn't change between modes in the screenshots — the moon is shown in both light and dark capture sets.
WHY IT MATTERS: Toggle should communicate state.
FIX: `src/components/ThemeToggle.astro` — show sun in dark mode, moon in light mode.

### 57. LOW · LAYOUT · 768 · home
ISSUE: The "Selected Work" h1 at 768 is wrapping to one line but uses ~85% of the available width. With the metadata "06 of 12" pushed to the right, the right margin disappears.
WHY IT MATTERS: Whitespace discipline.
FIX: Shrink display h1 size at 768 by 1 step.

### 58. LOW · TYPOGRAPHY · all viewports · all
ISSUE: The Newsreader serif `&` and the IBM Plex `&` differ visually. Page mixes them in some sections.
WHY IT MATTERS: A serif `&` IN a mono context is acceptable as a typographic moment, but it must be deliberate.
FIX: Audit `&` usage and standardize.

---

## Strengths

1. **Concept is genuinely original.** The 2D semantic-axes scatter as the homepage hero is the kind of conceit that gets a recruiter to forward the link to two friends. When the controls work and the thumbnails are real, this reads as a thesis statement built into the navigation. Nothing else in the portfolio space does this. Keep it; fix it.
2. **Type system bones are right.** Newsreader display + Inter Tight body + IBM Plex Mono kickers is a defensible studio-grade trio. Oxide-on-graphite is a real palette, not a theme. The infrastructure is correct — execution is what's failing.
3. **About page works.** The About page is the only page that consistently lands across all six viewports. Bilingual identity, headshot tasteful, copy modest. This is the floor; raise everything else to it.

---

## The 5 most critical issues (one-liners)

1. Baby photo is the hero of `s25-team-26-paper-viz` AND a homepage scatter thumbnail.
2. Thesis page hero is broken — proposal video doesn't play; tool sidebars leak in; mobile shows a black void.
3. AxisInputs panel on the homepage hero has thumbnails rendering ON TOP of its dropdowns at every desktop viewport.
4. Filenames (`img_18_20251030_172117_622`) are baked into the dataset atlas thumbnails on the work index AND project hero stages — debug-render leaking into portfolio.
5. Wide viewports (1920/1440) have body content stranded in a thin center column with acres of empty cream — exactly the complaint the user flagged.

---

## Overall design grade

**5.5 / 10.**

The conceptual ambition is 9/10. The typographic system and palette are 7/10. The execution — what actually rendered — is 4/10. The honest weighted average is 5.5. This is a strong concept with a midweight implementation that has 3–4 concrete blockers (issues 1–4) that any senior reviewer will flag in their first 30 seconds. The good news: the blockers are bounded. None of them require a redesign. Most are 30 minutes of work each.

---

## Verdict

**No — not portfolio-ready for top-tier roles in current state.**

I would not send this URL to a recruiter at Adobe / Figma / Apple HI / OpenAI Design / Google R&D today. A recruiter spending 90 seconds on the page would see: (a) a baby photo as a project thumbnail, (b) a broken thesis hero, (c) filenames baked into work cards, (d) text-on-image collisions on the flagship project, (e) an empty `Live AI Feedback` page tagged "UNPHOTOGRAPHED." The site would be filed under "computational designer who hasn't finished his portfolio yet." The CONCEPT would still impress whoever reads the about page, but the recruiter is a frontend pattern-matcher in their first pass — they will bounce.

**What it takes to flip the verdict.** Fix issues 1–14 (the CRITICALs). That's 1–2 days of focused work. Specifically:
1. Replace baby-photo hero (5 min — set field to null).
2. Replace dataset-atlas heroes with curated stills for thesis-flagship and semantic-canvas (30 min).
3. Fix thesis page: get proposal video playing (1 hour).
4. Strengthen hero scrim coverage to full image (10 min).
5. Pull Live AI Feedback off `publish: true` until photographed (1 min).
6. Bump dashboard stat color from faint to primary (5 min).
7. Replace 404 illustration (30 min).
8. Re-render dataset atlas without filename overlays (1 hour).
9. Add a left/right rail strategy for wide viewports OR commit to a wider container (2 hours).
10. Fix AxisInputs z-index conflict (15 min).
11. Cap project hero h1 with `clamp()` for mobile (10 min).
12. Soften the dark-hero / cream-body seam with a gradient fade (15 min).
13. Replace the work filter bar's black background with a brand-aligned color (10 min).
14. Drop the "UNPHOTOGRAPHED" corner tag (5 min).

After those 14 fixes, this becomes a 7.5–8/10 portfolio. Add the HIGH-severity fixes (issues 15–35) and it's an 8.5–9. The bones are good. The execution needs one more round.

The user is paying for the truth. The truth is: the site is one weekend away from being ready, and one bug away from being embarrassing. Do the weekend.
