# Phase 2 Build Contracts

This file is the inter-agent contract for the parallel Phase 2 build (VIS / HERO / CONTENT). All three agents read this before writing. If any agent needs to deviate from it, they STOP and surface the conflict — they do NOT silently change the contract.

---

## Theme tokens (owned by VIS)

Two themes — `dark` (default) and `light` — controlled by `data-theme` attribute on `<html>`. Tokens defined as CSS custom properties in `global.css`:

### Surface scale

| Token              | Dark        | Light       | Use                          |
| ------------------ | ----------- | ----------- | ---------------------------- |
| `--surface-bg`     | graphite-900 | stone-50    | page background              |
| `--surface-1`      | graphite-800 | stone-100   | cards, surface-1 panels      |
| `--surface-2`      | graphite-700 | stone-200   | hover state, secondary panel |
| `--surface-border` | graphite-700/60 | stone-300/80 | hairlines on cards/images |

### Text

| Token              | Dark        | Light       |
| ------------------ | ----------- | ----------- |
| `--text-primary`   | graphite-50  | graphite-950 |
| `--text-secondary` | graphite-300 | graphite-700 |
| `--text-mono`      | graphite-400 | graphite-600 |
| `--text-muted`     | graphite-500 | graphite-500 |

### Accent

`--accent` = oxide-500 in BOTH themes (terracotta) — keeps brand consistent. Hover/active uses `--accent-hover` = oxide-400 (dark) / oxide-600 (light).

### Code

When agents write Tailwind classes:
- Use `bg-[var(--surface-bg)]`, `text-[var(--text-primary)]`, etc. for theme-reactive surfaces
- Use direct color tokens (`bg-graphite-900`, `text-oxide-400`) ONLY when the surface should NOT shift between themes (e.g. the hero canvas area always stays dark)

---

## Required utility classes (defined by VIS, used by CONTENT/HERO)

VIS defines these in `global.css`. CONTENT and HERO use the class names verbatim — do not invent variants.

### `.section-break`
Visible horizontal section divider with breathing room. 1px `--surface-border` rule, 6rem vertical margin. Use BETWEEN top-level page sections (hero ↔ work-grid, intro ↔ body, etc.). NOT inside cards.

### `.section-break-mono`
Same as `.section-break` but with a centered mono label inside the rule (e.g. `— SELECTED WORK —`). Component variant: `<SectionBreak label="SELECTED WORK" />`.

### `.hero-scrim`
Fixes white-on-white text-on-hero-image collision. Apply to absolute-positioned overlay div behind the hero title text.
Spec: `linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.20) 60%, transparent 100%)`. Bottom 60% of hero. Pointer-events none.

In LIGHT theme, scrim uses `linear-gradient(to top, rgba(0,0,0,0.65) ...)`. Hero title text stays white in BOTH themes (because it's over an image scrim, not page surface).

### `.container-reading`
Reading-width container for narrative copy. `max-width: 72ch` at default. At ≥1280px viewport, expand to `max-width: 84ch` so wide screens don't have a thin lonely column. Side padding: `1.5rem` mobile, `2rem` tablet, `3rem` desktop. Centered.

### `.container-meta`
Wider container for project meta strip + dashboard tables. `max-width: 100ch`. Same padding rules.

### `.container-display`
Widest narrative container (used for project detail pages with full-bleed sections). `max-width: 1280px` capped, padding scales same.

### `.mono-label`
Already exists. Keep behavior. Confirm: `font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; font-size: var(--step--1); color: var(--text-mono);`

### `.tag`
Small inline tag chip. `font-family: var(--font-mono); font-size: 11px; padding: 2px 6px; border: 1px solid var(--surface-border); border-radius: 4px; color: var(--text-secondary);`. NO `rounded-full`.

### `.btn` / `.btn-primary` / `.btn-ghost`
Buttons. `.btn` is base (mono uppercase, 8px 16px padding, 1px border `--surface-border`, 4px radius, hover `--surface-2`). `.btn-primary` adds `background: --accent; color: white;`. `.btn-ghost` is borderless mono link.

---

## Hero component contract (owned by HERO)

CONTENT mounts the hero exactly like this on the homepage:

```astro
---
import HeroNavigator from "../components/hero/HeroNavigator";
---
<HeroNavigator client:visible />
```

HERO must export `HeroNavigator` as **default** from `src/components/hero/HeroNavigator.tsx`. No required props. No additional wrapper imports needed by CONTENT.

The component handles its own:
- WebGL detection / fallback to 2D
- View mode toggle (2D primary, 3D secondary toggle)
- Loading state (placeholder div until embeddings + layouts load)
- All overlays (mode panel, axis inputs, tooltip)
- Data fetching from `/data/embeddings.json` + `/data/layouts.json`

**View mode default: 2D** (`mode === '2d'`). Toggle button in `<ModePanel>` switches between `2d` and `3d`. Preference persisted to `localStorage['hero.view']`.

**2D view spec** (HERO must build this):
- SVG-based for crispness OR Canvas2D — agent's choice
- Plotted projects on a clearly-bounded plane with labeled axes (left/right and top/bottom labels in mono)
- Axis tick marks and a faint grid (1px, `--surface-border`)
- Hovered project shows enlarged thumbnail + title tooltip
- Click → navigate to `/work/<slug>` via `astro:navigate`
- Layout transition (Thesis ↔ UMAP ↔ PCA ↔ Metadata) animates over 800ms with eased x/y interpolation
- Hero is bounded: hero container has visible top + bottom hairlines. Below the hero, `.section-break-mono` separates from the rest of page

---

## Hero overlays — page section break

The HERO container uses inline border (top + bottom hairline) so it reads as a clear section. CONTENT does NOT add additional borders to hero on `index.astro`. CONTENT places `<SectionBreak label="SELECTED WORK" />` AFTER the hero block on the homepage.

---

## Theme toggle

VIS owns `<ThemeToggle>` component. It mounts in `<Nav>`. Pure HTML + tiny inline script (no React). Toggles `<html data-theme="...">` between `dark` and `light`. Default: respects `prefers-color-scheme` on first load, then persists to `localStorage['theme']`.

Phosphor icons: `sun` (light) / `moon` (dark). Same baseline-aligned size as other nav items.

---

## CV link

Phase 1 generated `public/davidchen-cv.pdf` (53KB). CONTENT surfaces the CV in:
- `<Nav>`: a "CV" link (or downloadable button) — VIS owns the Nav component, but CONTENT writes the link STRING. Coordination: VIS adds the slot, label = "CV", href = `/davidchen-cv.pdf`, opens in new tab.
- `/about`: prominent "Download CV (PDF)" button using `.btn` styling. Caption: `Last updated 2026-04`.
- `<Footer>`: small mono link in the secondary row.

VIS's Nav and Footer can hardcode `/davidchen-cv.pdf` directly. No content collection round-trip.

---

## Project detail page hero text fix

CONTENT applies the hero text fix on `src/pages/work/[slug].astro`:

```astro
<div class="hero-block relative">
  <!-- hero image/video/placeholder fills the block -->
  <div class="hero-scrim absolute inset-0 pointer-events-none"></div>
  <div class="absolute bottom-8 left-8 right-8 z-10">
    <h1 class="text-white">...</h1>  <!-- always white over scrim, both themes -->
    <div class="mono-label text-white/70">...</div>
  </div>
</div>
```

The `text-white` is intentional in both themes — it's over a scrim, not page surface. CONTENT must use `text-white` and NOT theme-reactive tokens for the hero title.

---

## File ownership table

| Path                                          | Owner   | Notes                                             |
| --------------------------------------------- | ------- | ------------------------------------------------- |
| `src/styles/global.css`                       | VIS     | All theme tokens, utility classes                 |
| `src/layouts/BaseLayout.astro`                | VIS     | Theme attribute, font preloads, view-transition   |
| `tailwind.config.ts`                          | VIS     | Color extend, font families, container queries   |
| `src/components/Nav.astro`                    | VIS     | Theme toggle, CV link slot                        |
| `src/components/Footer.astro`                 | VIS     | CV link                                           |
| `src/components/ThemeToggle.astro`            | VIS     | Light/dark switcher                              |
| `src/components/SectionBreak.astro`           | VIS     | NEW — variant component for `.section-break-mono` |
| `src/components/hero/**`                      | HERO    | All hero internals + 2D primary view              |
| `src/lib/nav-store.ts`                        | HERO    |                                                   |
| `src/lib/projectThesis.ts`                    | HERO    |                                                   |
| `src/lib/layoutData.ts`                       | HERO    |                                                   |
| `src/lib/detectWebGL.ts`                      | HERO    |                                                   |
| `src/pages/**`                                | CONTENT | All page templates                                |
| `src/components/ProjectCard.astro`            | CONTENT |                                                   |
| `src/components/ProjectMeta.astro`            | CONTENT |                                                   |
| `src/components/RelatedRail.astro`            | CONTENT |                                                   |
| `src/components/PrevNextNav.astro`            | CONTENT |                                                   |
| `src/components/FilterBar.astro`              | CONTENT |                                                   |
| `src/components/PlaceholderHero.astro`        | CONTENT |                                                   |
| `src/components/CiteButton.astro`             | CONTENT |                                                   |
| `src/components/CopyEmail.astro`              | CONTENT |                                                   |
| `src/components/Breadcrumb.astro`             | CONTENT |                                                   |
| `src/components/MethodDiagram.astro`          | CONTENT |                                                   |
| `src/components/IndexList.astro`              | CONTENT |                                                   |
| `src/components/NowStrip.astro`               | CONTENT |                                                   |
| `src/components/MonoLabel.astro`              | CONTENT |                                                   |
| `src/components/Reveal.astro`                 | CONTENT |                                                   |
| `src/components/Sparkline.astro`              | CONTENT |                                                   |
| `src/components/Donut.astro`                  | CONTENT |                                                   |
| `src/components/DashboardPanel.astro`         | CONTENT |                                                   |
| `src/lib/{relatedProjects,bibtex,categories}.ts` | CONTENT |                                                |
| `src/content/projects/*.md` (BODY only)       | CONTENT | Frontmatter is FROZEN by Phase 1                  |
| `src/content/site/*`                          | CONTENT |                                                   |
| `scripts/**`                                  | IMG-B   | Phase 2 IMG-B re-runs the pipeline only           |

If any agent needs to write a file outside its column, it stops and surfaces the conflict to the orchestrator.

---

## Quality bar

User said: "expert web designer, super high standard". Apply this filter at every decision:

- Layout grids must breathe — generous whitespace, never cramped
- Visual rhythm via section breaks must be obvious at a glance
- Typography hierarchy: at most 4 distinct text sizes per page (display title, body, mono label, fine print)
- Motion is restrained: no parallax, no scroll-jacking. Hover transitions max 280ms
- Every image has a `border` (1px `--surface-border`) and `loading="lazy"` (except the first hero on `index.astro`)
- Color contrast: WCAG AA minimum (4.5:1 body, 3:1 large) — verify with the actual hex values
- Light mode is NOT just "invert dark" — it's its own design with cream-warm backgrounds (stone-50/100), darker accent on light to maintain identity
- No emoji, no gimmicks, no decorative SVG except deliberate and minimal
- Mobile: every page works at 375px width. Hero on mobile = static thumbnail strip, not the 2D plane (the 2D needs minimum 600px to be readable)
