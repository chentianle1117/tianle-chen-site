# Round 4 — Design Directions from Reference Study

Research date: 2026-04-25
Author: reference-research subagent
Goal: source 5 concrete, low-risk design directions to fix three persistent complaints — "still not so navigable", "kind of too dark", "no clear section breaks" — without abandoning David's existing oxide-on-graphite aesthetic.

The study draws on direct fetch + reading of 13 reference sites. Each section ties an observed pattern back to a specific file in `W:\tianle-chen-site\src\`.

---

## Sites studied

1. **Pentagram (`pentagram.com/work`)** — gold-standard editorial work index. Sticky primary nav with a *secondary filter strip below* (sector × discipline). Demonstrates that two-tier navigation can coexist without feeling cluttered.
2. **Bureau Cool (`bureau.cool`)** — bracket-notation `[ ]` framing on every project; mono category-tag strings ("`web,animation,installation`") functioning as section identifiers. Strong "selected work / archive" split.
3. **Rauno Freiberg (`rauno.me`)** — minimal sticky top nav with named clusters: *Devouring Details · Craft · History of Software Design · Projects*. Section breaks are pure whitespace, no rules. One-click email-copy with "Email / Copied" toggle.
4. **Emil Kowalski (`emilkowal.ski`)** — typography-as-divider. Title-case section labels ("Projects", "Writing", "Newsletter", "More") with no rules — relies entirely on type weight + whitespace. Course CTA ("8 hours left to sign up") demonstrates how to embed a time-sensitive accent without UI clutter.
5. **Maggie Appleton (`maggieappleton.com`)** — *illustration-as-divider*. Each essay/note carries its own thumbnail graphic. Top nav and footer nav are duplicated. Custom vocabulary as memorability anchor ("Garden", "Patterns", "Smidgeons", "Antilibrary").
6. **Bruno Simon (`bruno-simon.com`)** — single-experience portfolio, drive-around 3D. Icon-based sidebar nav; keyboard shortcuts (M for Map, L for Mute, T for Whisper) signal power-user respect. Useful as the *opposite pole* — David is not this, but the keyboard-shortcut affordance is borrowable.
7. **Tim Holman (`tholman.com`)** — voice as design system. No formal nav; identity through copy ("front-end engineer who thrives on getting shit done"). Project list flat, breadth over hierarchy. Tonal variety from "Long Doge" to serious tools.
8. **SO–IL (`solidobjectives.com`)** — architecture-firm minimum viable page. *Two-city timestamps* (NY / Amsterdam) as identity anchor. Anti-bot copy "Don't fill this out if you're human" demonstrates voice in functional UI.
9. **MOA Studio (`moa.studio`)** — explicit numbered process (1–6) framework. Three featured projects in alternating landscape/portrait orientations — concrete proof that *aspect-ratio variety* breaks tile rhythm.
10. **Linked by Air (`linkedbyair.net`)** — alternating project tiles with embedded *bridging videos* between sections. Section CTAs as transitional markers ("Explore our values", "See our capabilities", "Start a conversation").
11. **Distill (`distill.pub`)** — research-publication editorial. Article entries: date label → category tag ("Peer-reviewed", "Editorial", "Commentary", "Thread") → title → authors → description. Transparency mechanism (peer-review = link to GitHub issue).
12. **Refactoring UI (`refactoringui.com/book`)** — clarity bible. Section headings in sentence case. Numbered chapters. Demonstrates that uniformity — not variety — *is* the brand when teaching is the goal.
13. **Andy Bell (`bell.bz`)** — flat horizontal nav (Home / About / Feed / Blog / Music Collection / Links). Heading-as-emphasis: "I'm \_Andy Bell\_…" with underscore decorations. Good cautionary example: heading-only hierarchy reads thin without supporting structure.

Sites attempted but unreachable (cert/DNS errors at fetch time): bureau-cool.com (cert), julianlehr.com (cert), kj.ee (refused), every-layout.dev (partial), charlap-hyman-herrero.com (refused), parrt.cs.usfca.edu (refused), linked.by.air (refused). Patterns from these are well-documented elsewhere; where I rely on prior knowledge below I flag it as such.

---

## Patterns by theme

### Section breaks (pattern matrix)

| Site | Mechanism | Whitespace | Rule | Numeral | Mono label |
|---|---|---|---|---|---|
| Pentagram | grid rhythm + filter strip | medium | no | no | discipline tag |
| Bureau Cool | bracket framing `[ ]` + tag string | medium | no | no | yes — comma-joined |
| Rauno | whitespace only | very large (~6rem) | no | no | no |
| Emil Kowalski | title-case heading, no rule | large | no | no | no |
| Maggie | illustrated thumbnail per item | medium | no | no | category label |
| Distill | date + tag pill above title | medium | implied | no | category label |
| MOA | numbered process steps (1–6) | medium | no | yes (process) | no |
| Linked by Air | bridging video clip + CTA link | large | no | no | no |
| Andy Bell | em-dash / asterisk rule | small | yes (---) | no | no |
| Refactoring UI | numbered chapters, sentence case | medium | no | yes | no |
| SO–IL | divider before contact only | very large | yes (1px) | no | no |

**Key takeaway:** the strongest sites (Rauno, Emil) use *aggressive whitespace* (>=6rem) and zero rules. Sites that show up well at scale (Bureau Cool, Distill) use a *mono category label per item*. The numeric prefix ("01 — SELECTED WORK") that David's existing `SectionBreak.astro` could carry is rare in pure form but common in spirit (Distill's date, MOA's process numerals, Refactoring UI's chapter numerals). David already has the component scaffolding — he just isn't using it consistently.

### Wide-viewport (>=1440)

- **Pentagram**: cards in a uniform grid; filter chips become a horizontal row above grid; max-width feels around 1440–1600.
- **SO–IL**: substantial whitespace; two-city timestamp clusters anchored opposite corners — uses the wide canvas as identity, not as more content.
- **Linked by Air**: alternating project tiles with text blocks; videos bridge tiles full-width.
- **MOA**: alternating landscape/portrait imagery — different *aspect ratios* exploit width.
- **Bureau Cool** (from prior knowledge of their typesetting): full-bleed top, then a marginalia column for category tags.
- **Distill**: side-margin figures and footnotes — a hallmark of the publication. Sidenotes pop into the right margin at >=1024px.
- **Rauno**: capped-reading-width with sticky in-page TOC on long-form pages (Devouring Details, Craft).

**Key takeaway:** the two best wide-viewport plays for David are (a) **right-margin sidenotes / metadata rail** on the thesis page (Distill pattern — fits the academic positioning), and (b) **alternating aspect-ratio project tiles** on the work index (MOA pattern — breaks the same-rhythm trap).

### Dark-mode strategies

David's "kind of too dark" complaint maps to a real pattern problem: very few of these sites are pure-dark. Of the 13:

- Pure light: Pentagram, Bureau Cool, Maggie, Andy Bell, MOA, SO–IL, Linked by Air, Refactoring UI, CHH (from prior knowledge), Rakhim
- Light-dominant with dark accents: Distill, Emil Kowalski, Rauno
- Pure dark: Bruno Simon, Julian (`julian.com`)
- Zoned (sections shift): Tim Holman uses tonal shifts per project block

**Anti-blur strategies in dark sites I've seen elsewhere (vercel.com, linear.app, anthropic.com):**

1. **Surface step**: page bg ≈ #0B0D0F, but sections shift to #121417 or #1A1C20 — David already has these tokens as `--surface-bg / --surface-1-rgb / --surface-2-rgb`. He's just not zoning sections with them.
2. **Brightest element rule**: in any dark UI, exactly one thing should be near-white. Title? Mono numeral? Currently David has many near-white elements competing.
3. **Accent reservation**: oxide is a navigational signal — limit to interactive states and active markers only.
4. **Hairline contrast bump**: `rgb(var(--surface-border))` at 50/54/60 is ~3.7:1 on the bg. Bumping to 60/64/72 (or alpha 0.6 on a brighter base) gives a perceptible "section starts here" without thickening the line.

**Key takeaway:** David should keep dark mode but introduce **section zoning** — alternate `var(--bg)` and `var(--surface-1)` per major section so the page reads as separated bands. The complaint "everything blurs together" is solved by two-tone, not by going light.

### Variety per project

Top sites avoid "same tile rhythm" through:

- **MOA**: alternating image orientations (landscape / portrait / landscape).
- **Maggie**: bespoke illustrated thumbnail per essay — the unit-of-variety is the artwork.
- **Linked by Air**: each project block has its own service-list bullet pattern; some have embedded video, others static.
- **Pentagram**: variety comes from photography quality (subject matter does the work) but tile size is uniform — *not* what David wants.
- **Bureau Cool**: tag-string differentiation ("`web,animation,installation`" vs. "`physical,installation`") rather than visual variety — typographic rhythm only.
- **Bruno Simon**: variety = interactivity (Circuit, Whispers, Behind-the-Scene each plays differently).
- **Distill**: variety = tag-pill (Peer-reviewed / Editorial / Thread) — a tiny chip that telegraphs *what kind of read* is coming.

**Key takeaway:** David has 7 projects, not 70. He doesn't need a uniform grid. The Distill / Bureau Cool pattern of *typographic variety per item* (kind-of-work tag) is cheap and high-readability; the MOA pattern of *aspect-ratio variety* solves the tile monotony.

### Hierarchy and type sizes

| Site | Distinct sizes | Eye-flow signal |
|---|---|---|
| Rauno | 3 (name, descriptor, body) | scale alone |
| Emil | 3 (name, section label, item title) | weight + size |
| Maggie | 4 (hero, section, item, meta) | thumbnail draws eye first |
| Distill | 4 (title, author, date, body) | date+tag-pill leads |
| Pentagram | 3 (project, description, tag) | image leads |
| Bureau Cool | 3 (client, project, tags) | client name dominant |

All converge on **3–4 sizes max**. David's `global.css` already has 6 fluid steps (`--step--1` through `--step-5`); the issue is likely *which steps appear on the page*, not the scale itself. Common hierarchy on these references:

- **H1 / hero**: 48–80px
- **Section label**: 13–14px mono uppercase tracked
- **Item title**: 18–24px
- **Body**: 16–18px
- **Meta/caption**: 12–13px

David's existing `--step-5` (clamp ~3rem → 4.8rem) and `--step--1` (clamp ~0.78rem → 0.86rem) are appropriate. The fix isn't tokens — it's **using one token per role consistently**.

### Project detail patterns

- **Pentagram**: hero photo full-bleed → title overlaid bottom-left → body in a centered ~64ch column → image-rich middle → credits/tags at end.
- **Linked by Air**: case-study format with mini-section CTAs that double as anchors.
- **Distill**: long-form research with side-margin figures, citations as hover-pop tooltips.
- **MOA**: alternating image / text pairs scrolling vertically.
- **Bureau Cool**: full-bleed hero, no body copy; each project is mostly imagery + tag string.
- **Maggie**: long-form essay with illustrated marginalia; sidenotes in right margin.

David's existing `layout-with-rails` (left rail 1fr / 72ch body / right rail 1fr) is *exactly* the Distill pattern. Underused.

### Mobile collapse

All sites collapse to single column. Standout patterns:

- **Pentagram**: filter strip becomes a hamburger.
- **Bruno Simon**: gesture controls — one-finger drive, two-finger camera.
- **Rauno**: top nav collapses to a single dot/menu icon.
- David's existing mobile already does the right thing — no change needed here.

### One memorable detail per site

1. Pentagram: "We design Everything for Everyone." inverted-syntax tagline.
2. Bureau Cool: bracket framing `[Project]` everywhere.
3. Rauno: one-click email-copy with toggle confirmation.
4. Emil: time-sensitive enrollment ("8 hours left to sign up") — urgency without ugliness.
5. Maggie: vocabulary ("Antilibrary", "Smidgeons", "Garden") as identity.
6. Bruno Simon: keyboard shortcuts published in the UI (M, L, T, H).
7. Tim Holman: irreverent voice ("thrives on getting shit done") — a portfolio with tone.
8. SO–IL: two-city timestamp panel.
9. MOA: numbered 6-step process as service explanation.
10. Linked by Air: bridging video between project sections.
11. Distill: peer-review = a link to a GitHub issue.
12. Refactoring UI: numbered chapters with one-line tagline each.
13. Andy Bell: heading underscore decoration (`I'm _Andy Bell_…`).

---

## Specific directions for David's site

Five concrete, actionable directions. Each ties to David's *existing* tokens / components — no palette swap, no framework change.

### 1. Numbered section markers (Bureau Cool / Distill / MOA — borrowed)

**The borrow:** Each major section on a page gets a mono prefix numeral plus a label. e.g. `01 — SELECTED WORK`, `02 — RESEARCH`, `03 — ABOUT`. Increments per page. Used by Bureau Cool (implied via tag-strings), Distill (date as prefix), MOA (numbered process).

**Why it solves David's complaints:**
- Navigability: a visible "where am I" counter at every break.
- Section breaks: turns the existing thin hairline into a typographic event.
- Hierarchy: gives the eye a periodic resting point.

**Implementation (specific):**
- `src/components/SectionBreak.astro`: add prop `number?: string` (e.g. `"01"`). Render as `<span class="numeral">{number}</span><span class="separator">—</span><span class="label">{label}</span>`. Numeral and label both use `theme(fontFamily.mono)`, uppercase, `letter-spacing: 0.12em`. Numeral at `var(--text-primary)`, label at `var(--text-mono)` so the *number* is the brightest element on the line.
- `global.css` `.section-break-mono`: keep the existing flex + flanking hairlines. Add a sub-rule `.section-break-mono > .numeral { color: rgb(var(--text-primary)); font-variant-numeric: tabular-nums; }`.
- Usage in `src/pages/index.astro`: pass `number="01"`, `"02"`, `"03"` to each `<SectionBreak>` instance. Same for `thesis.astro`, `about.astro`, project detail pages.

**Spec values:**
- Hairline: `0.5px solid rgb(var(--surface-border))` (currently 1px — Round-3 review noted heaviness).
- Vertical rhythm: `margin-block: 6rem` desktop, `4rem` mobile (already in CSS — keep).
- Numeral font-size: `var(--step--1)` (matches existing label).
- Label tracking: `0.12em` (already in CSS — keep).
- Gap between flanking rule and label cluster: `1.5rem` desktop, `1rem` mobile (already in CSS).

### 2. Alternating section zones (Distill / Linear / Vercel — borrowed)

**The borrow:** sections alternate between `var(--bg)` (page base, #0B0D0F dark) and `var(--surface-1)` (#121417). Not zebra-striped — used sparingly: hero on `--bg`, work index on `--bg`, but research preview on `--surface-1`, about on `--surface-1`, contact strip on `--bg`. Two-tone bands, not many-tone.

**Why it solves David's complaints:**
- "Too dark / blurs together": the eye sees *bands*, not a uniform field. Same darkness, different contrast.
- Section breaks: the surface change *is* the break — no rule needed inside the band, only at the boundary.

**Implementation:**
- `src/components/SectionZone.astro` (new, ~10 lines): wrapper that takes `tone: "base" | "raised"` and applies `background: rgb(var(--surface-bg))` or `rgb(var(--surface-1-rgb))` plus full-bleed via `.container-full` inside.
- Wrap each major homepage section in `<SectionZone tone="...">`. Boundaries get a `box-shadow: 0 -1px 0 rgb(var(--surface-border))` for a subtle 1px seam.
- Light-mode equivalent already works via existing token system — `--surface-bg` and `--surface-1-rgb` reactivate.
- Tested look: hero (base) → 01 work (raised) → 02 thesis (base) → 03 about (raised) → contact (base). Five bands, alternating.

**Spec values:**
- Tonal step: `--surface-1-rgb` is currently `18 20 23` vs `--surface-bg` `11 13 15` — that's only 7 luminance steps. Bumping `--surface-1-rgb` to `22 24 28` gives a perceptible shift without flat-tile feel. Test in DevTools first; if it looks like two cards, halve the step.
- Section padding-block: `5rem` mobile, `8rem` desktop — gives bands enough body to register.
- Boundary hairline: `1px` only at zone *transitions*. Inside-zone breaks revert to whitespace + numbered marker.

### 3. Right-margin sidenote rail on thesis page (Distill / Maggie — borrowed)

**The borrow:** on long-form pages (thesis, project detail), citations / definitions / footnotes appear in the right margin at >=1280px. Below that, they collapse inline. Distill is the canonical example; David's existing `layout-with-rails` already supports this — it just isn't populated.

**Why it solves David's complaints:**
- Navigability on long pages: the rail acts as in-page metadata + *visual rhythm* (text-then-margin-note breaks the wall-of-prose).
- Hierarchy: marginalia is a clear tertiary level, distinct from body and headings.
- Wide viewport: solves "1920 displays a thin column stranded in the middle."

**Implementation:**
- `src/components/Sidenote.astro` (new): inline-block in narrow viewport, absolute-positioned in right margin at `>=1280px`. Mono, `var(--step--1)`, `var(--text-mono)`.
- `src/pages/thesis.astro`: convert existing footnotes / definitions / "see also" links into `<Sidenote>` instances anchored to body paragraphs.
- Use existing `layout-with-rails` grid (already in `global.css`). Right rail container becomes the absolute positioning context for sidenotes.
- Sidenote anchor: small mono superscript number in body text (`<sup class="sidenote-anchor">1</sup>`); sidenote in margin shows the same number as a leader.

**Spec values:**
- Body column: `min(72ch, 60%)` of `1440px` cap (already exists).
- Rail width: `1fr` each side (already exists).
- Sidenote font-size: `max(12px, var(--step--1))` (matches mono label floor).
- Sidenote indent from body: `1.5rem` left margin within rail.
- Anchor superscript color: `var(--accent)` — gives oxide a *navigational* role, not a decorative one.

### 4. Tag-pill above each item (Distill / Bureau Cool — borrowed)

**The borrow:** every project / essay / item gets a single mono uppercase tag-pill above its title naming what *kind of artifact* it is. Distill: `Peer-reviewed`, `Editorial`, `Commentary`, `Thread`. Bureau Cool: `web,animation,installation`. David's portfolio mixes architecture, ML research, tools, design systems — perfect for this.

**Why it solves David's complaints:**
- Navigability: the user can scan a list and immediately filter by type without filter UI.
- Variety per project: gives each tile a distinct visual chip *without* requiring custom photography or icons.
- Hierarchy: introduces a second tertiary level (tag) between section label and item title.

**Implementation:**
- `src/components/Tag.astro` already exists (referenced by `.tag` in `global.css`). Audit its usage — currently it appears *inside* project tiles. Move it *above* the title.
- `src/components/ProjectCard.astro`: render order becomes Tag → Title → Description → Meta. Tag uses existing `.tag` class.
- Define a fixed taxonomy (5–7 tags max): `THESIS`, `ML/AI TOOL`, `RESEARCH`, `ARCHITECTURE`, `DESIGN SYSTEM`, `WRITING`, `EXPERIMENT`. Document in `src/data/taxonomy.ts` so usage is consistent.
- Color the tag border subtly per type if desired — but ship the typographic version first.

**Spec values:**
- Tag font: `IBM Plex Mono`, 11px (already in CSS).
- Tag tracking: `0.04em` (existing).
- Tag border: `1px solid rgb(var(--surface-border))` (existing).
- Tag background: `rgb(var(--surface-1-rgb) / 0.4)` — subtle, lets it sit on either zone.
- Margin-block: `0 0.5rem` (sit tight above title).

### 5. Sticky reading-rail TOC on thesis + long projects (Rauno — borrowed)

**The borrow:** Rauno's "Devouring Details" and "Craft" pages use a left-rail table-of-contents that highlights the active section as you scroll. Maggie does similar on her longer essays. This is a navigability multiplier on any page with >3 sections.

**Why it solves David's complaints:**
- Navigability: *the* fix for "I don't know where I am on this page."
- Hierarchy: the rail itself shows the page outline, doing double duty.
- Wide viewport: occupies the otherwise-empty left margin at >=1280px.

**Implementation:**
- `src/components/PageTOC.astro` (new): client-side. Reads `<h2>` and `<h3>` from main content, builds a `<nav>` of in-page anchors. Adds `IntersectionObserver` to mark the active section.
- Position: `position: sticky; top: 6rem` in left rail of `layout-with-rails`. Mono, `var(--step--1)`, `var(--text-mono)`. Active item: `var(--text-primary)` + `border-left: 2px solid rgb(var(--accent-rgb))` and `padding-left: 0.75rem`.
- Hidden below `1280px` via `@media (max-width: 1279px) { .page-toc { display: none; } }`. The `<details>` mobile fallback can come later.
- Only enable on: `thesis.astro`, project detail pages with >=4 sections (Semantic Canvas, Generative Urbanism, Skill-Bridge are the obvious candidates).

**Spec values:**
- Sticky offset: `top: 6rem` (clears the existing top nav).
- Item height: `1.6` line-height with `0.5rem` vertical gap.
- Active indicator: 2px oxide left border, `padding-left: 0.75rem` — this is the *only* spot oxide appears in the rail, reinforcing its navigational meaning.
- Anchor smooth-scroll: already enabled by `html { scroll-behavior: smooth }` (`global.css:110`).

---

## What to AVOID (anti-patterns observed)

1. **Don't add a third nav layer.** Pentagram has primary nav + secondary filter — that works for a 1000-project firm. David has 7 projects. A second strip would be visual noise.
2. **Don't go full-light.** Several reference sites are bright (Maggie, Bureau Cool, Andy Bell). David's positioning (computational designer, ML/AI engineer) reads better in dark with discipline. The fix is *zoning within dark*, not abandoning dark.
3. **Don't decorate with rules.** Andy Bell uses `---` dividers and the page reads thin. The Rauno / Emil approach (whitespace + type) is stronger. Reserve hairlines for zone boundaries only.
4. **Don't add quirky vocabulary.** Maggie's "Smidgeons" / "Antilibrary" works because she's a writer. David is a designer-engineer; quirky labels would undercut credibility with Adobe / Figma / OpenAI Design hiring committees.
5. **Don't WebGL the homepage.** Bruno Simon's drive-around is incredible *because* he's a Three.js maintainer and it's the entire portfolio thesis. David's hero (`HeroNavigator` 3D scatter) already does this in a measured way — keep restraint, don't escalate.
6. **Don't make every project a hero.** Maggie has 60+ items with tiny illustrated thumbnails; not every entry deserves full-bleed. David's "Selected Work / Archive" split (Bureau Cool pattern) is the right move — feature 3, list the rest.
7. **Don't over-tag.** A 12-category taxonomy reads like an org chart. 5–7 tags max (Direction 4).
8. **Don't sticky everything.** Pentagram sticks the nav and filter strip — fine. Sticking nav + TOC + footer-CTA = motion soup. Stick the *one* thing that earns it on each page.
9. **Don't animate section transitions.** Reveal-on-scroll (already in `global.css`) is plenty. Adding cross-section parallax or sticky-pin scrolljacking inflates JS and breaks reduced-motion guarantees.
10. **Don't lighten the accent.** Oxide on dark is the signature. Don't dilute it to "warmer beige" for a softer feel — instead, *use less of it* and reserve it for active/hover/anchor states.

---

## File-level recommendations for David's codebase

For each of the five directions, the specific files and changes:

### Direction 1 — Numbered section markers
- `src/components/SectionBreak.astro`: add `number?: string` prop; render `<span class="numeral">` before label. Update render branch.
- `src/styles/global.css` `.section-break-mono`: add `.numeral` rule with tabular-nums + `var(--text-primary)`.
- `src/pages/index.astro`: replace each `<SectionBreak label="…" />` with `<SectionBreak number="01" label="SELECTED WORK" />` etc.
- `src/pages/thesis.astro`: same — `01 INTRODUCTION`, `02 METHOD`, `03 RESULTS`, `04 DISCUSSION`.
- `src/pages/about.astro`: `01 BIO`, `02 EXPERIENCE`, `03 EDUCATION`, `04 CONTACT`.
- `src/pages/work/[slug].astro`: per-project, restart at `01`.

### Direction 2 — Alternating section zones
- `src/components/SectionZone.astro` (new file).
- `src/pages/index.astro`: wrap five top-level sections.
- `src/pages/thesis.astro`: wrap the four research phases.
- `src/styles/global.css`: bump `--surface-1-rgb` from `18 20 23` to `22 24 28` (verify in browser).
- Optional: add `.zone-base / .zone-raised` utility classes for inline use.

### Direction 3 — Right-margin sidenotes
- `src/components/Sidenote.astro` (new).
- `src/pages/thesis.astro`: convert footnotes-at-bottom to inline `<Sidenote>` calls.
- `src/styles/global.css`: extend `.layout-with-rails > .rail-right` with `position: relative` so sidenotes can absolute-position.
- `src/styles/global.css`: add `.sidenote-anchor { color: rgb(var(--accent-rgb)); font-family: theme(fontFamily.mono); font-size: 0.75em; vertical-align: super; }`.

### Direction 4 — Tag pills
- `src/data/taxonomy.ts` (new): export `TAGS = { THESIS: "Thesis", ML_TOOL: "ML/AI Tool", … }`.
- `src/components/ProjectCard.astro`: render `<Tag>` above title.
- `src/data/projects.ts` (or wherever projects are defined): add `tag: keyof typeof TAGS` field per project.
- `src/components/IndexList.astro`: render tag in list view too.

### Direction 5 — Reading-rail TOC
- `src/components/PageTOC.astro` (new) with client-side `IntersectionObserver`.
- `src/pages/thesis.astro`: place `<PageTOC>` in left rail of `layout-with-rails`.
- `src/pages/work/semantic-canvas.astro` (or whichever the long ones are): same.
- `src/styles/global.css`: add `.page-toc` and `.page-toc__item--active` rules.

---

## Quick wins (<=30 min each)

- [ ] **W1.** Add `number?` prop + numeral render to `SectionBreak.astro` (Direction 1, component only — page wiring later).
- [ ] **W2.** Bump `--surface-1-rgb` to `22 24 28` in `global.css` and view both themes; back out if too contrasty.
- [ ] **W3.** Move existing `<Tag>` placement from inside-tile to above-title in `ProjectCard.astro`.
- [ ] **W4.** Define `TAGS` taxonomy in `src/data/taxonomy.ts` and assign one tag to each project.
- [ ] **W5.** Reduce `.section-break` border from `1px` to `0.5px` (one line in `global.css`).
- [ ] **W6.** Add `font-variant-numeric: tabular-nums` to existing `.mono-label` so any future numbers align.
- [ ] **W7.** Audit `index.astro` for use of `<SectionBreak>` — flag any inconsistent vs. consistent placement.
- [ ] **W8.** Add a one-line oxide leader (`<span class="active-marker">`) to navigation when on the corresponding page (current page indicator).

## Bigger ideas (>=1 hour each)

- [ ] **B1.** Build `SectionZone.astro` and rewire homepage into 5 alternating zones (Direction 2). Test contrast on both themes.
- [ ] **B2.** Build `PageTOC.astro` with IntersectionObserver active-state. Wire into `thesis.astro` first (Direction 5).
- [ ] **B3.** Build `Sidenote.astro` with responsive collapse. Convert thesis footnotes (Direction 3).
- [ ] **B4.** Convert work index to two-tier "Selected" + "Archive" (Bureau Cool pattern) — top 3–4 projects get full cards, rest become a typographic list with tag chips.
- [ ] **B5.** Audit `HeroNavigator` brightness — is the 3D scatter the *brightest* element on the page? It probably should be (the thesis is a latent-space tool, after all). Bump particle alpha if not.
- [ ] **B6.** Add a *single* keyboard-shortcut affordance: `g h` (go home), `g w` (go work), `g t` (go thesis), `?` (show shortcut overlay). Bruno Simon pattern, scaled down. Documentable in About.
- [ ] **B7.** Per-project aspect-ratio variety on work index (MOA pattern). Mix landscape (16:9), portrait (3:4), square (1:1) — assign per project.
- [ ] **B8.** Active-section indicator in primary nav using oxide left-border (mirror of TOC active state) so the navigation rail reads as continuous with the page.

---

## Closing note

David's existing system is *closer* to the reference standard than the Round-3 critique implies. The bones are right: Newsreader + Inter Tight + IBM Plex Mono is on-pattern with Bureau Cool, Distill, and Maggie. Oxide-on-graphite is on-pattern with Rauno (his accent is similar), Emil's dark mode, and Vercel. The complaints — navigability, too-dark, no clear breaks — all resolve through *use* of tokens already declared in `global.css`, not through new tokens.

The five directions above, taken together, would shift the site from "competent dark portfolio" to "computational-research portfolio with editorial discipline." The numbered markers (1) and alternating zones (2) alone solve "no clear section breaks". The reading-rail TOC (5) and tag pills (4) solve "still not so navigable". Section zones (2) solve "kind of too dark" without a palette change.

If only one direction can ship this round: ship Direction 2 (alternating zones). It is the highest-impact, lowest-risk change, and it touches one CSS variable + one new tiny component.
