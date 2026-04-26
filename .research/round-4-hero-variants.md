# Round 4 — Latent-Space Hero Variants

Research date: 2026-04-25
Author: hero-redesign agent (no code changes — design doc only)
Goal: address the user's complaint that "the latent space is still not so straightforward for outsiders — what's the purpose, how do I control it." Produce four+ variants, evaluate, recommend one, and provide implementation hints for the next-round build agent.

Sources for this analysis:
- `W:\tianle-chen-site\src\components\hero\HeroNavigator.tsx` (340 lines — orchestrator)
- `W:\tianle-chen-site\src\components\hero\SemanticPlane.tsx` (619 lines — primary 2D scatter)
- `W:\tianle-chen-site\src\components\hero\ModePanel.tsx` (340 lines — VIEW + LAYOUT panel)
- `W:\tianle-chen-site\src\components\hero\AxisInputs.tsx` (174 lines — X/Y dropdowns + RANDOMIZE)
- `W:\tianle-chen-site\src\components\hero\MobileStrip.tsx` (179 lines — <600px fallback)
- `W:\tianle-chen-site\src\pages\index.astro` (290 lines — homepage structure)
- `W:\tianle-chen-site\verification\home__1920.png`, `home__1440.png`, `home__375.png` (current renders)
- `W:\tianle-chen-site\.research\round-4-design-directions.md` (reference-site study from prior round)

---

## Step 1 — Outsider evaluation (brutal, fresh-eyes)

The persona: **Sasha, 35, design recruiter at Adobe.** She has a comp-sci BFA, has hired 200+ designers, knows React but has never touched UMAP or PCA. She lands on `tianlechen.com` from a LinkedIn Easy Apply and has ~8 seconds to decide whether to keep reading.

### What Sasha sees on the 1920px home capture

A near-black canvas with a thin grey grid frame. Eleven small thumbnails, mostly dark, scattered loosely across the field. One green tile sits alone in the upper-right corner like an outlier — she'll mistake it for a placeholder. The thumbnails themselves are 64×64px, so she can't read them as artwork — they read as "decorations." Top-right has a glass panel labeled **VIEW · 2D · 3D · LAYOUT · THESIS · UMAP · PCA · METADATA**. Bottom-center has **X: Design/Physical ↔ ML/Code · Y: Play ↔ Research · TIP: TRY CHANGING X/Y · RANDOMIZE**. Top-left axis label says **↑ RESEARCH**. Bottom rim: **← DESIGN/PHYSICAL · PLAY ↓ · ML/CODE →**.

### Per-element reaction (what Sasha thinks vs. what David means)

| Element | Sasha's first read | David's actual intent | Confusion score (0–5) |
|---|---|---|---|
| **The plane itself** | "It's empty. Where's the hero image? Is this loading?" | A semantic 2D projection of David's projects, axes are pickable. | 5 |
| **64×64 thumbnails** | Decorative dots. Not obvious they're images, let alone clickable. | Clickable links to project pages. | 5 |
| **Lone green tile (upper-right)** | "Bug? Outlier? Placeholder?" | The flagship thesis project, deliberately positioned at the high-research / high-ML corner. | 4 |
| **↑ RESEARCH / ↓ PLAY axis** | "Research vs Play — okay, kind of cute. Are they evaluating me?" | The Y-axis dimension. | 2 |
| **← DESIGN/PHYSICAL / ML/CODE → axis** | "Two of his skills, plotted." | The X-axis dimension. | 2 |
| **VIEW: 2D / 3D buttons** | "Why would I switch dimensions of an already-confusing chart?" | A demo of the underlying tooling — the thesis is a navigator. | 4 |
| **LAYOUT: THESIS** | "His thesis? An academic thesis? Or 'a thesis I'm proposing'?" | The custom-axes mode (thesis-flagship is the project that powers it). | 5 |
| **LAYOUT: UMAP** | "U-what? Some technical thing." Skip. | Uniform Manifold Approximation — an ML dimensionality-reduction algo. | 5 |
| **LAYOUT: PCA** | "Ah, PCA — I've heard of that. What does it do here?" | Principal Component Analysis — same purpose. | 4 |
| **LAYOUT: METADATA** | "OK, so… the data?" | Year × domain layout (a non-ML grouping). | 3 |
| **X / Y dropdowns** | "Filtering? Searching? Sorting?" Tries to click. | Remap the axes of the scatter to different semantic directions. | 4 |
| **TIP: TRY CHANGING X/Y** | "Why? Will something happen?" | If you change the axes, the thumbnails ease into new positions, demonstrating the latent-space metaphor. | 3 |
| **RANDOMIZE button (with dice glyph ⚄)** | "Randomize what? My options? The order? Don't want to lose my place." | Randomly picks two axis presets — also a demo of the swap animation. | 4 |
| **3D toggle** | "Will it eat my battery? Why?" | An aesthetic flex — the same scatter in WebGL with depth as a third axis. | 3 |
| **Hover on thumbnail** | (No tooltip until pointer is on it; tooltip appears as a label following the cursor — easy to miss.) | Reveals title / year. | 3 |
| **Mobile (375px)** | A horizontal-scroll strip with thumbnails. No mention of "latent space," no axes, no purpose. Reads as a generic carousel. | A compressed, axis-less fallback of the same data. | 3 |

### Most damning observations (top three)

1. **There is no headline.** The page opens with a navigator, not a name. Sasha doesn't see *who this is* or *what they make* before she sees a control panel asking her to make decisions. Every reference site studied in Round 3 (Pentagram, Rauno, Emil, Maggie, Bureau Cool) opens with a name + descriptor before ANY interactive element. David's site opens with the thesis instrument as if the visitor has already read the thesis.
2. **The controls are jargon-first, payoff-second.** UMAP / PCA / METADATA are the labels of three radio buttons with no hint of what each *does* visibly different. THESIS as a layout name collides with THESIS as a top-nav item. The CAPTION row in ModePanel ("X: Design/Physical ↔ ML/Code") is help text, but it's sized identically to the buttons and tucked below — easy to miss.
3. **The thumbnails don't read as work.** At 64px on a 1920 viewport they are decorative dots. A recruiter scanning has no signal that "these are projects, click them" — there's no hover state larger than 1.15× scale, no title overlay, and the cursor only changes shape after hovering. The tooltip is pointer-following, so until you move into a sprite, nothing tells you the sprites are interactive.

### Bonus observation: the empty quadrants are loud

The current `thesis_default` layout puts most projects in the lower-left two quadrants, the flagship in the upper-right alone, and leaves the upper-left and lower-right ~80% empty. To Sasha this looks broken. The layout's *meaning* — that David has fewer pure-research-ML projects and more design-leaning play projects — is invisible without a one-line "yes this distribution is intentional" caption.

---

## Step 2 — Specific affordance gaps (concrete list)

A flat list, ordered by severity:

- [G1] **No introductory line** explaining what the plane represents. The first text Sasha reads is "TIANLE CHEN" in the nav and "RESEARCH" as an axis label.
- [G2] **"UMAP" / "PCA" / "METADATA"** are unannotated jargon. The PCA caption "first 2 principal components" is below the radio, only visible after clicking.
- [G3] **"THESIS" as a LAYOUT label** collides with THESIS in the top nav. Two different meanings, one word, ~400px apart on screen.
- [G4] **"RANDOMIZE"** is a button without context — randomize what? The dice glyph helps a tiny bit, but doesn't say *which dice are rolling*.
- [G5] **Sprites have no "click me" hint.** No hover ring beyond a 1.15× scale, no title-overlay on hover (title appears in the pointer tooltip, which is below the sprite, requiring eye-flick).
- [G6] **TIP: "TRY CHANGING X/Y"** doesn't say WHY it's interesting. A user who hasn't internalized "the projects rearrange themselves" sees it as "change the dropdown and… something."
- [G7] **Mobile strip has no purpose statement.** It says "SELECTED · TAP TO EXPLORE" but doesn't say *latent space*, *projects*, *what kind of work*. Reads as a generic carousel.
- [G8] **No call to action besides "click a sprite."** No "see all 11 projects," "read about the thesis," or "skip to the work index." The only navigation is via thumbnails so small they don't read as nav.
- [G9] **The flagship sprite is alone.** Its isolation is meaningful (it's the thesis project, lives in the corner where ML × Research peak) but reads as a render error.
- [G10] **The 3D toggle has a hover tooltip but no label affordance.** Sasha has to *find out* it has a hover tooltip. Most users won't.
- [G11] **The plane occupies ~78vh and pushes "SELECTED WORK" off-screen.** Sasha sees only the plane in the first viewport — there's no scroll cue that the actual project list is below.
- [G12] **No visible scroll cue at all.** The hero ends at a hairline; below is "SELECTED WORK" — same dark canvas, same hairline, no visual indicator that scrolling reveals more.
- [G13] **Reduced-motion users get a static plane** with no fallback explanation — the swap animation IS the demonstration of the metaphor, so without it, the controls look pointless.
- [G14] **The CAPTION row in ModePanel** ("X: …, Y: …") duplicates information that's on the axis labels themselves. Two sources of truth, both small.
- [G15] **Empty white space** between the upper sprites and the flagship in the corner reads as broken layout, not as semantic distance.

---

## Step 3 — Variant designs (4 named + 1 invented)

For each: name, concept, layout sketch, onboarding copy, controls visible, pros, cons, implementation cost (relative to current), audience.

---

### VARIANT A — "Guided First-Run"

**Concept (one sentence):** Same hero, but a 2-sentence framing intro lives directly above the plane and a delayed pulse arrow points to the X dropdown if the user hasn't touched anything in 5 seconds.

**Layout sketch (text):**
```
+------------------------------------------------------------+
| [Nav: Tianle Chen · WORK · ARCHITECTURE · THESIS · …]      |  64px nav
+------------------------------------------------------------+
| 11 projects, mapped by meaning. ← serif intro              |
| Drag the X / Y dropdowns to remap the axes.                |  ~80px intro
| Click any tile to open a project.                          |
+------------------------------------------------------------+
|                                                            |
|  [↑ RESEARCH]                              [VIEW · LAYOUT] |
|                                                            |
|         ·   ·     ·                                        |
|              ·                       ·   ←(green sprite)   |
|     ·   ·   ·                                              |  ~70vh
|              ·                                             |    plane
|     ·                                                      |
|                                                            |
|  [← DESIGN/PHYSICAL]               [ML/CODE →]             |
|  [↓ PLAY]                                                  |
|       [X: Design/Physical ↔ ML/Code  ▼]                    |
|       [Y: Play ↔ Research  ▼]   [⚄ RANDOMIZE]              |
|       ↑ pulse arrow appears at 5s if untouched             |
+------------------------------------------------------------+
| [SECTION BREAK · 01 — SELECTED WORK]                       |
+------------------------------------------------------------+
```

**Onboarding copy (literal):**
> **11 projects, mapped by meaning.** Drag the X / Y dropdowns to remap the axes. Click any tile to open a project.

(Three sentences, ≤25 words total. Serif for the lead noun, mono for the imperatives. Sits in the same `container-display` width as the rest of the page so it visually belongs.)

After 5 seconds without interaction, a 18px oxide-colored ↓ arrow fades in below the X dropdown with the mono caption "TRY DRAGGING Y TO 2026 ↔ 2022".

**Controls visible:** unchanged from current (VIEW + LAYOUT panel, X/Y dropdowns, RANDOMIZE) PLUS the new intro PLUS the delayed pulse hint.

**Pros:**
- Lowest semantic risk — answers "what is this?" in <5 seconds.
- Reinforces the metaphor with the word "meaning" — non-jargon, doesn't paper-thesis-ify.
- The pulse hint solves G6 (the WHY) without permanent UI clutter.
- Compatible with reduced-motion (pulse becomes a static dim arrow).
- Doesn't change any underlying interaction — current users / muscle memory unaffected.

**Cons:**
- Adds vertical real estate (~80px) above the plane, pushing the scatter further down.
- The pulse-after-5s requires a timer + dismissal logic + observability into "has the user touched anything yet" — non-trivial state to thread through.
- Doesn't fix G3 (THESIS as a LAYOUT name still collides with THESIS in nav).
- Adds copy that has to ship in two themes, two languages-eventually, three viewports.
- Doesn't address mobile (G7) — strip still has no purpose statement.

**Implementation cost:** **Medium-low.**
- ~30 lines of Astro/JSX in `index.astro` for the intro block.
- ~40 lines in `HeroNavigator.tsx` for the idle-pulse timer + listener.
- ~10 lines of CSS for the pulse animation (respects `prefers-reduced-motion`).
- No data layer changes.
- ~3 hours of build time including QA.

**Best for:** **Generalist + design audience.** The intro speaks to anyone, the pulse converts the "I see controls but don't know to use them" segment. Technical visitors will still find UMAP/PCA below.

---

### VARIANT B — "Default Static + Optional Interactive"

**Concept (one sentence):** The hero loads as a STATIC named-axes scatter with no controls visible — just a clean labeled chart — and an "EXPLORE INTERACTIVELY ↗" button below unlocks the controls for engaged visitors.

**Layout sketch (text):**
```
+------------------------------------------------------------+
| [Nav]                                                      |
+------------------------------------------------------------+
|  TIANLE CHEN — Gen-AI engineer & computational designer   |  ~80px serif kicker
|                                                            |
|  These are my 11 projects, mapped by topic.               |
+------------------------------------------------------------+
|                                                            |
|  [↑ RESEARCH]                                              |
|                                                            |
|         ·   ·     ·                                        |
|     ·   ·   ·                                              |  ~64vh
|              ·                       ·                     |    plane
|     ·   ·                                                  |
|                                                            |
|  [← DESIGN/PHYSICAL]                       [ML/CODE →]     |
|  [↓ PLAY]                                                  |
|                                                            |
|        [ EXPLORE INTERACTIVELY ↗ ]                         |
|        ↑ click to unlock controls                          |
+------------------------------------------------------------+
```

After click, the controls fade in (~280ms): VIEW/LAYOUT panel slides in from right; X/Y dropdowns + RANDOMIZE slide in from bottom; the intro line dims slightly. A small "← BACK TO STATIC VIEW" link appears at top-right of the controls.

**Onboarding copy:**
> **TIANLE CHEN — Gen-AI engineer & computational designer**
> These are my 11 projects, mapped by topic.

After unlock, second-stage copy appears next to the controls:
> "X and Y are semantic axes. Try Y: 2026 ↔ 2022 to see the timeline. RANDOMIZE picks two at random."

**Controls visible:**
- **Default state:** zero controls. Just the scatter + axis labels + an unlock CTA.
- **After unlock:** all current controls (VIEW, LAYOUT, X/Y, RANDOMIZE) plus a "← BACK TO STATIC" link.

**Pros:**
- Solves G2 (jargon hidden until requested), G4 (RANDOMIZE only appears after the user has signalled interest), G6 (TIP becomes a contextual second-stage caption).
- Lowers cognitive load for the 80% who just want to see work — they get a clean named-axes scatter.
- Preserves the full power of the current system for the 20% who want to play.
- Solves G14 (CAPTION row no longer competes — it's the only label visible).
- Adds a clear CTA where there was none (G8).

**Cons:**
- The unlock CTA is itself a thing to design — a third button on the page (after Try the live tool, View all projects).
- Two states means two versions of the layout to maintain.
- Static state still relies on the current `thesis_default` layout — if that layout looks broken (G15), it's broken in both states.
- Loses the "instrument is alive" first-impression that current visitors get; the page feels less ambitious.
- "EXPLORE INTERACTIVELY" is itself slightly mysterious copy — "explore what?"

**Implementation cost:** **Medium.**
- New state in nav-store (`controlsUnlocked: boolean`) — ~10 lines.
- Conditional rendering in HeroNavigator + ModePanel + AxisInputs — ~60 lines.
- Transition animations — ~30 lines of CSS.
- Static layout = current default (no new data work).
- ~5 hours of build + QA, including animation polish and a "back to static" path.

**Best for:** **Design audience + recruiters with limited time.** Lowers the barrier of entry while preserving the geek-tier underneath. Less compatible with the thesis identity — David IS this navigator, hiding it feels like burying the lede.

---

### VARIANT C — "Title-First, Hero-Second"

**Concept (one sentence):** Lead with a small intro section ABOVE the scatter (mono kicker + serif h1 + 1-line subtitle); the latent-space scatter becomes the *second* thing the visitor sees, not the first.

**Layout sketch (text):**
```
+------------------------------------------------------------+
| [Nav: Tianle Chen · WORK · …]                              |
+------------------------------------------------------------+
|                                                            |
|  TIANLE CHEN · GEN-AI ENGINEER · PITTSBURGH—SHANGHAI       |  mono kicker
|                                                            |
|  Designing instruments for designing.                      |  serif h1, ~step-5
|                                                            |
|  These are my 11 projects, plotted by topic.               |  body line
|  Drag to remap the axes.                                   |
|                                                            |  ~120-180px intro
+------------------------------------------------------------+
|                                                            |
|         (scatter as before, full width)                    |
|                                                            |  ~64vh plane
+------------------------------------------------------------+
| [SECTION BREAK · 01 — SELECTED WORK]                       |
+------------------------------------------------------------+
```

The scatter itself is unchanged from current — same controls, same axes, same RANDOMIZE. The intro IS the change.

**Onboarding copy (literal):**
> **TIANLE CHEN · GEN-AI ENGINEER · PITTSBURGH—SHANGHAI**
> Designing instruments for designing.
> These are my 11 projects, plotted by topic. Drag to remap the axes.

(The serif h1 "Designing instruments for designing." is doing a lot — it's the single sticky phrase the visitor remembers. It also frames the latent-space hero retroactively: of course it's an instrument, that's his thing.)

**Controls visible:** unchanged from current (no removal). The kicker / h1 / subtitle is purely additive.

**Pros:**
- Solves G1 (no headline) decisively — name + role + one-line thesis appear before any control.
- Solves the strategic problem in the user's complaint: "purpose unclear" gets answered by *naming the purpose* in serif at the top.
- Reads on-pattern with every reference site studied (Pentagram, Rauno, Emil, Maggie all open with name + descriptor).
- The h1 "Designing instruments for designing" reframes the latent-space scatter as a *demonstration* of his thesis, not a confusing default.
- Compatible with mobile — the intro becomes the entire above-fold view at 375px, with the strip below it as evidence.
- Easy to A/B — flip a feature flag, intro on or off.

**Cons:**
- Adds 120–180px of vertical real estate above the plane on desktop.
- The scatter no longer commands the first impression — visitors might leave at "Designing instruments for designing" without ever scrolling.
- Doesn't fix the within-scatter affordance gaps (G2 jargon, G3 THESIS collision, G5 sprite click hint, G14 caption duplication).
- Risk of looking like a generic portfolio header glued onto a thesis instrument.
- "Designing instruments for designing" is opinionated — if David doesn't like that exact phrase, the variant has to ship with custom copy review.

**Implementation cost:** **Low.**
- ~50 lines of Astro in `index.astro` for the intro block (above the `<HeroNavigator>` section).
- ~10 lines of CSS for spacing / alignment.
- No state, no JS, no data changes.
- ~2 hours of build + copy review.

**Best for:** **All audiences.** The kicker / h1 / sub is a portfolio-table-stakes pattern — recruiters expect it, technical visitors don't lose anything, and it doesn't cost interactivity. Lowest-risk, highest-coverage move on the list.

---

### VARIANT D — "Tour Mode"

**Concept (one sentence):** Above the scatter, a small "guided tour" widget auto-cycles through 3 axis pre-sets every 6 seconds with annotation text — the auto-cycle demonstrates the affordance, and the user can pause or take control.

**Layout sketch (text):**
```
+------------------------------------------------------------+
| [Nav]                                                      |
+------------------------------------------------------------+
|                                                            |
| ┌────────────────────────────────────────────────────────┐ |
| │ ▶ TOUR · 2 of 3 · Research ↔ Play  vs  ML ↔ Design     │ |
| │ "Watching the projects rearrange shows you what they   │ |
| │  have in common."           [ ⏸ pause ]  [ ⏹ stop ]    │ |  ~96px tour
| └────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------+
|                                                            |
|         (scatter, projects easing into new positions)      |
|                                                            |  ~64vh plane
|  [← DESIGN/PHYSICAL]                       [ML/CODE →]     |
|  [↓ PLAY]                                                  |
+------------------------------------------------------------+
```

The tour cycles:
1. **Phase 1 (0–6s):** X = Research ↔ Play, Y = ML ↔ Design. Annotation: "Most of my projects are play; the thesis lives in research."
2. **Phase 2 (6–12s):** X = ML ↔ Design, Y = Solo ↔ Team. Annotation: "Solo when ML, team when design. The hybrids are at the edges."
3. **Phase 3 (12–18s):** X = 2022 ↔ 2026, Y = Architecture ↔ AI. Annotation: "I came in as an architect and left as an engineer."

Then loops. User can press `[⏸ pause]` to freeze, or `[⏹ stop]` to dismiss the tour and reveal the standard X/Y dropdowns + RANDOMIZE.

**Onboarding copy (literal):**
> **▶ TOUR · 2 of 3 · Research ↔ Play vs ML ↔ Design**
> "Watching the projects rearrange shows you what they have in common."

(Plus the per-phase annotations above.)

**Controls visible:**
- **During tour:** play/pause, stop, phase indicator (1 of 3), annotation. NO X/Y dropdowns, NO LAYOUT picker, NO RANDOMIZE.
- **After stop:** standard current controls.
- VIEW (2D/3D) toggle remains throughout (it's an aesthetic choice, not part of the tour).

**Pros:**
- Solves G6 decisively — the WHY is shown by demonstration. The user doesn't need to imagine what happens; they see it.
- Solves G1 by making the first text "TOUR · 2 of 3" + an annotation — the page tells the visitor what's happening.
- Solves G4 — RANDOMIZE is irrelevant during tour; only appears after stop.
- Solves G15 — the empty quadrants make sense once you see them as "this configuration shows X, the next configuration shows Y."
- Auto-cycling is a *demo* of the underlying tooling — reinforces the thesis identity.
- Pause/stop give explicit user control.

**Cons:**
- Auto-cycling animation is a brand risk — it can read as "marketing demo" rather than "design instrument." Bruno Simon and Linear both do auto-demos; Apple does too. Pentagram and Rauno don't.
- Reduced-motion users need a static fallback that explains all 3 phases without animation — hard.
- Adds ~96px of vertical chrome above the scatter.
- Implementation is the heaviest of the four (state machine, animation timing, pause/stop, accessibility).
- The tour annotations ("most of my projects are play") are interpretive and might not stay accurate as David's portfolio grows.
- Loses surprise — by the time the user can interact, they've seen 3 configurations, blunting the "wow, it rearranged" moment.

**Implementation cost:** **High.**
- New `TourController` component with phase state, timer, accessible pause/play — ~150 lines.
- Annotation copy file (per-phase strings) — ~30 lines.
- Reduced-motion fallback (static carousel of 3 phase screenshots?) — ~80 lines + 3 PNGs.
- Coordination with existing `nav-store` (the tour pre-empts the user's axis selection while running) — ~40 lines.
- ~12 hours of build + QA + accessibility review.

**Best for:** **Generalist visitors who came from a viral link.** The tour answers "what is this?" by showing rather than telling — but it costs the most and feels least like David's brand (which is restraint, not auto-demo).

---

### VARIANT E (invented) — "Two-Up: Grid + Map Toggle"

**Concept (one sentence):** Default the hero to a familiar 6-card grid of selected work; show a small mono toggle at top "GRID · MAP" that flips into the current latent-space scatter. The grid is the anchor; the map is the "but also, I built this thesis tool" reveal.

**Layout sketch (text):**
```
+------------------------------------------------------------+
| [Nav]                                                      |
+------------------------------------------------------------+
|                                                            |
|  TIANLE CHEN — Gen-AI engineer & computational designer   |  serif kicker
|                                                            |
|  ┌───────────────────────┬──────────────────────────────┐ |
|  │  [GRID]   [MAP]       │ 6 PROJECTS · CMU MSCD 2026   │ |  toggle row
|  └───────────────────────┴──────────────────────────────┘ |
+------------------------------------------------------------+
| (GRID — default)                                           |
| ┌──────────────┐ ┌────────────┐ ┌────────────┐            |
| │   Project 1  │ │ Project 2  │ │ Project 3  │            |
| │   (large)    │ │  (small)   │ │  (small)   │            |  ~50vh grid
| └──────────────┘ └────────────┘ └────────────┘            |
| ┌────────────┐ ┌────────────┐ ┌────────────┐              |
| │ Project 4  │ │ Project 5  │ │ Project 6  │              |
| └────────────┘ └────────────┘ └────────────┘              |
+------------------------------------------------------------+
| (MAP — toggle target = current scatter)                    |
| [scatter view as today, all controls visible]             |
+------------------------------------------------------------+
```

Click `[MAP]` and the grid cards animate from their grid positions into their semantic-scatter positions, with axes fading in. Click `[GRID]` to ease back.

**Onboarding copy:**
> **TIANLE CHEN — Gen-AI engineer & computational designer**
> 6 PROJECTS · CMU MSCD 2026

Plus a one-line MAP-mode caption when the user toggles:
> "Same projects, plotted by meaning. Drag X / Y to remap."

**Controls visible:**
- **GRID mode:** zero hero-controls. Cards have hover states, click into projects, mono labels above each.
- **MAP mode:** all current controls (VIEW, LAYOUT, X/Y, RANDOMIZE) plus a back-to-grid toggle.

**Pros:**
- Solves G1, G2, G3, G4, G6, G8, G15 in one move — the default state is a familiar portfolio, the latent-space is a deliberate reveal.
- Treats the latent-space scatter as a *feature* of the portfolio, not the entry-point. Makes the thesis identity *additive*, not *prerequisite*.
- The grid-to-map animation IS the demo — projects flying into their semantic positions is more memorable than auto-cycling axes.
- Falls back gracefully on mobile — grid IS the mobile view, no special MobileStrip needed.
- Recruiters and engineers both win: recruiters see work immediately; engineers find the toggle and play.

**Cons:**
- Significant build cost — animating 11 cards from grid layout to scatter coordinates while preserving identity (so card #3 in grid = sprite #3 in scatter) requires careful state management.
- Duplicates the work-index `<ProjectCard>` aesthetic; visitors might be confused why /work/ also has a grid below.
- "Selected Work" section break has to be re-thought (the hero IS selected work, kind of).
- The "MAP" toggle is itself a mystery word — needs subtitle or hint.
- Risks burying the thesis — the latent-space tool is now an Easter egg, not the front door.

**Implementation cost:** **High.**
- Refactor: hero now owns "selected work" too. Need to merge `featured` data with embedding data — ~80 lines.
- Layout-mode state in nav-store + animated transitions between grid CSS positions and scatter % positions — ~200 lines (FLIP technique or similar).
- Card aspect-ratio: scatter sprites are 64×64 squares; grid cards are 16:9 or 4:5 with title overlays — these have to morph too, OR we accept that the cards shrink to squares during MAP mode.
- New `<HeroToggle>` component with keyboard support — ~50 lines.
- Re-architecting the `index.astro` Selected Work section to defer to / coordinate with the hero — ~100 lines of moving things around.
- ~16 hours of build + animation polish + QA.

**Best for:** **All audiences, but at high cost.** Strategically the most ambitious — turns the homepage hero into a complete narrative arc (here's my work; oh, and also it's secretly a research tool). But the implementation effort is 4–6× Variant C.

---

## Step 4 — Recommendation

### Primary: **VARIANT C — "Title-First, Hero-Second"**

**Why C, not A / B / D / E:**

1. **It directly answers the user's complaint.** "Outsider doesn't know the purpose" is a problem of *missing context*, not of *missing controls*. C adds the smallest possible amount of context (12 words: name + role + thesis line + 11 projects line) and lets the existing controls remain unchanged for users who care.
2. **It's on-pattern with every reference site we studied** (Pentagram, Rauno, Emil, Maggie, Bureau Cool, Distill all open with name + descriptor before any interactive widget). The current site is the outlier — adding the kicker pulls it onto the standard.
3. **It doesn't hide the thesis.** Variant B and Variant E both default to a non-instrument view, which buries the very thing David is most proud of. C keeps the latent-space hero in the same vertical real estate; it just gives it a frame.
4. **It's the cheapest by far.** ~2 hours vs. 5 / 12 / 16 for B / D / E. If the next round shows it's not enough, A and D can be layered on top of C without rework.
5. **It's compatible with all the Round-3 directions.** Numbered section markers, alternating zones, sidenotes — all work with or without C. C doesn't lock the page into a tour-state-machine or a dual-layout-toggle.
6. **It pairs naturally with mobile.** On 375px the kicker + h1 + sub becomes the *entire* above-fold view, with the MobileStrip directly below as evidence ("here's some of that work"). This solves G7 (mobile has no purpose statement) for free.

### What to remix from the other variants

- **From A:** the **idle-pulse hint** at 5 seconds. After C ships, layer A's pulse on top — it converts the "I read the intro but I'm passive" segment.
- **From B:** the **"EXPLORE INTERACTIVELY"** semantic. *Don't* add a button, but *do* hide the LAYOUT picker (UMAP/PCA/METADATA radios) behind a small ⋯ "MORE LAYOUTS" link. The X/Y dropdowns + RANDOMIZE stay visible (they're the demo); the algorithmic options are advanced. This solves G2 without losing the controls.
- **From D:** the **per-phase annotation pattern.** When the user changes a layout (LAYOUT: UMAP → PCA), animate a one-line caption explaining what that layout does ("UMAP groups visually-similar projects nearby"). This solves G2 *better* than a hover tooltip.
- **From E:** the **grid-as-fallback** intuition. Don't build the toggle, but DO ensure that the section immediately below the hero (Selected Work) is a recognizable grid — so the visitor's mental model is "I see a map first, but a grid is right there for the conventional view." C plus the existing Selected Work section already does this.

### Final recommended scope

**Round 4 build (this round):** Variant C alone — kicker + h1 + sub above the existing hero. ~2 hours.

**Round 5 enhancements (next round, if C is proven insufficient):** layer A's idle-pulse + B's "MORE LAYOUTS" gating + D's per-layout caption. ~4 additional hours.

Variants D and E are noted but not recommended for this round. D risks brand drift; E is a multi-day refactor.

---

## Step 5 — Implementation hints (Variant C)

### File-level changes

| File | Change | Approx LOC |
|---|---|---|
| `W:\tianle-chen-site\src\pages\index.astro` | Insert intro block above `<section class="relative">` containing `<HeroNavigator />`. | +50 |
| `W:\tianle-chen-site\src\components\hero\HeroNavigator.tsx` | No change. The intro is a sibling element, not a child. | 0 |
| `W:\tianle-chen-site\src\styles\global.css` (if needed) | Optional `.hero-intro` utility for vertical-rhythm spacing — but inline styles in `index.astro` may suffice. | +15 |
| `W:\tianle-chen-site\src\components\SectionBreak.astro` | No change for C alone. (Round 3 Direction 1 may add a `number?` prop — independent.) | 0 |
| `W:\tianle-chen-site\src\components\hero\MobileStrip.tsx` | Optional: replace the existing "SELECTED · TAP TO EXPLORE" caption with the same kicker / sub pattern. | +20 |

### Concrete code path (rough)

In `index.astro`, between line 79 (`<BaseLayout>`) and line 80 (`{/* HERO */}`), insert:

```astro
{/* ============ INTRO ============ */}
<section class="container-display pt-12 pb-8 md:pt-16 md:pb-10" aria-labelledby="intro-h1">
  <p class="mono-label mb-4">
    TIANLE CHEN · GEN-AI ENGINEER · PITTSBURGH—SHANGHAI
  </p>
  <h1
    id="intro-h1"
    class="mb-4"
    style="font-family: theme(fontFamily.display); font-size: var(--step-5); font-weight: 380; line-height: 1.05; letter-spacing: -0.01em; color: rgb(var(--text-primary));"
  >
    Designing instruments for designing.
  </h1>
  <p style="color: rgb(var(--text-secondary)); line-height: 1.6; max-width: 56ch;">
    These are my 11 projects, plotted by topic. Drag the X / Y dropdowns to remap the axes — or click any tile to open a project.
  </p>
</section>
```

Then leave the existing `<section class="relative">` containing `<HeroNavigator />` directly below.

### Existing utilities to reuse

- `mono-label` class (already in `global.css`) for the kicker — uppercase, mono, 0.14em tracking.
- `var(--step-5)` (clamp ~3rem → 4.8rem) for the h1 — already declared in tokens.
- `container-display` (already in `global.css`) for the outer width — matches the rest of the page.
- `var(--text-primary)` / `var(--text-secondary)` — already theme-aware.
- `font-family: theme(fontFamily.display)` — Newsreader, the existing serif.

### Estimated effort

- **Build:** 1.5 hours (insertion + spacing + cross-viewport check at 375 / 768 / 1280 / 1920).
- **Copy review with David:** 0.5 hour (the h1 phrase is opinionated; it may iterate).
- **Verification screenshots regen:** 0.25 hour (re-run the existing screenshot pipeline for `home__1920.png`, `home__1440.png`, `home__1024.png`, `home__768.png`, `home__414.png`, `home__375.png`).
- **Mobile parity** (if applying the kicker to MobileStrip too): +0.5 hour.

**Total: 2.0 to 2.75 hours.**

### Risk areas

1. **Vertical rhythm:** the intro adds ~120–180px above the plane, which may push the "RESEARCH" axis label off-screen on some 1024×768 laptops in landscape. Mitigation: drop the hero `min-height` from 78vh to 64vh OR drop the intro `pt-12` to `pt-8` on small viewports. Test on actual 1024×768 before shipping.
2. **Copy ownership:** "Designing instruments for designing." is a thesis-level claim. If David disagrees with the phrase, the entire variant rests on copy he doesn't own. Mitigation: ship a placeholder (maybe `"Designer-engineer building tools for AI-augmented design."` as a safer alternative) and let David choose.
3. **Section-break duplication:** the existing `<SectionBreak label="SELECTED WORK" />` directly below the hero will now sit ~150px lower than today. If Round 3's "01 — SELECTED WORK" numeral lands in the same round, alignment with the new intro should be checked together (the kicker becomes "00" by analogy and might need a number too).
4. **No state, no JS, no race conditions.** This is the genuinely lowest-risk variant on the list — the intro is pure markup. The only risk is design (does it look right?), not engineering.

---

## Step 6 — Mobile handling for Variant C

### Current (375px) behavior

`HeroNavigator` checks `window.innerWidth < 600` and renders `MobileStrip` instead of `SemanticPlane`. The strip shows 6 thumbnails in a horizontal scroll with caption "SELECTED · TAP TO EXPLORE" above and "TAP TO EXPLORE · SCROLL ↗" below. No axes, no controls, no purpose statement.

### Variant C on mobile

The kicker / h1 / sub block sits above the strip, exactly as on desktop, just at smaller font sizes (the existing `--step-5` clamp handles this — 3rem at 375px is ~48px h1, which is still impactful). On 375px:

```
+------------------------------------+
| [hamburger nav]                    |
+------------------------------------+
| TIANLE CHEN · GEN-AI ENGINEER ·   |  ~14px mono kicker
| PITTSBURGH—SHANGHAI                |  (may wrap to 2 lines)
|                                    |
| Designing instruments              |  ~36-48px serif h1
| for designing.                     |  (will wrap on 375px)
|                                    |
| These are my 11 projects,          |  ~16px body
| plotted by topic. Tap any tile     |
| to open a project.                 |
+------------------------------------+
| (existing MobileStrip)             |
| SELECTED · TAP TO EXPLORE          |
| [card] [card] [card] →             |
+------------------------------------+
```

**Critical change for mobile:** the body line should drop "Drag the X / Y dropdowns" because there are no dropdowns on the strip. Two paths:

- **Path 1 (recommended):** detect viewport at build time (or via React `useViewportWidth` already in `HeroNavigator`) and render different copy. Mobile copy: *"These are my 11 projects. Tap any tile to open a project."* Removes the desktop-only instruction.
- **Path 2 (simpler):** keep the same copy for both. The "Drag the X/Y dropdowns" line is harmless on mobile — it's an aspirational hint that this looks different on a bigger screen. But it's slightly false to mobile users.

Recommend Path 1 — split the body line by viewport.

### Should Variant C alter MobileStrip?

**Minor change recommended:** rename the strip caption from "SELECTED · TAP TO EXPLORE" to "11 PROJECTS · TAP TO EXPLORE" so the *count* is consistent with the desktop intro. Otherwise unchanged. The strip itself is doing the right job.

### What to NOT change on mobile

- The horizontal-scroll affordance is correct.
- The card size (160×160) is correct.
- The "TAP TO EXPLORE · SCROLL ↗" footer caption is correct (and works as a redundant scroll cue).

---

## Step 7 — Outsider-test checklist (post-ship)

After Variant C ships, an outsider (Sasha or equivalent) should be able to do the following within 10 seconds of landing on `tianlechen.com`:

- [ ] **1. Identify whose site this is.** "Tianle Chen" appears in the kicker before any visualization or control. Test: ask a stranger to read the page for 5 seconds, then close the tab; ask "whose site was this?" → 100% should answer "Tianle Chen."
- [ ] **2. State the role.** "Gen-AI Engineer" appears immediately after the name. Test: same protocol; "what did this person do?" → answer should include "AI" or "engineer" or "design."
- [ ] **3. Recognize that the dots are projects.** The body line "These are my 11 projects" appears before any thumbnail interaction. Test: "what are those small images?" → answer should be "projects" or "his work."
- [ ] **4. Find the call to action.** Either click a tile (sprite) OR scroll to "SELECTED WORK" below. Test: "what would you do next on this page?" → answer should be one of "click an image" or "scroll down to see them bigger" — not "I don't know."
- [ ] **5. Survive without using the X/Y dropdowns.** A visitor who doesn't engage with the controls should still leave with a fair impression of the work. Test: instruct a stranger NOT to click the dropdowns and observe whether they reach `/work/<slug>` for at least one project. The intro plus the visible thumbnails should be enough.

A 10-second checklist for the *engaged* visitor (separate, not gating the design):

- [ ] **6. Discover the X/Y interactivity within 30 seconds.** The body line says "Drag the X / Y dropdowns to remap." Test: instruct a stranger to "mess with the page"; do they touch a dropdown within 30s?
- [ ] **7. Understand UMAP vs THESIS within 60 seconds (optional).** The CAPTION row in ModePanel + future Variant-A/B/D enhancements should explain what each layout means. *Not gated on Round 4 ship — Round 5 stretch.*

If checks 1–5 fail, Round 5 should escalate to Variant A's idle-pulse + B's gated jargon. If checks 1–5 pass, the user's complaint is resolved.

---

## Appendix — Variants summary table

| Variant | Cost | Solves G1 (no headline) | Solves G2 (jargon) | Solves G6 (TIP) | Mobile parity | Brand fit |
|---|---|---|---|---|---|---|
| A — Guided First-Run | Med-low (3h) | Partial | No | Yes | Easy | High |
| B — Default Static | Med (5h) | Yes | Yes (hidden) | Yes | Easy | Medium (buries thesis) |
| **C — Title-First (✓)** | **Low (2h)** | **Yes** | **No** | **No** | **Trivial** | **High** |
| D — Tour Mode | High (12h) | Yes | Partial | Yes | Hard | Medium (auto-demo) |
| E — Grid+Map Toggle | High (16h) | Yes | Yes | Yes | Easy | High but ambitious |

| Variant | Compatible with Round-3 Direction 1 (numbered breaks) | Compatible with Round-3 Direction 2 (alternating zones) |
|---|---|---|
| A | Yes | Yes |
| B | Yes | Yes |
| **C** | **Yes** | **Yes** |
| D | Yes | Yes |
| E | Partial — "Selected Work" section break collides with the hero's grid mode | Yes |

---

## Closing note

The user's complaint is not "the visualization doesn't work." The visualization is fine; the controls are fine; the data is fine. The complaint is "I don't see what this is." That is a *framing* problem, not an *interaction* problem. Variant C is the smallest, cheapest, lowest-risk move that adds framing without subtracting from the instrument. Layer A / B / D enhancements only if Round-5 evaluation shows that framing alone wasn't enough.

If David disagrees with the recommended primary, the next-best paths are:
- **If David wants more discovery affordance:** ship A on top of C.
- **If David wants the thesis to be a deliberate reveal rather than the front-door:** ship E (high cost, but strategically coherent).
- **If David wants the controls to feel less jargon-heavy:** ship B's "MORE LAYOUTS" gating as a remix on C.

The variants above are designed to compose, not to compete.
