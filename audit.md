# Cleanup audit — 2026-04-30

Branch will be: `cleanup/2026-04-30-narrative-and-layout`

## 1. Project pages — narrative polish

Project content lives in `src/content/projects/*.md` (rendered through `src/pages/work/[slug].astro`). 25 files exist; 15 use the `## Hook` + `## Context` templated structure; 6 carry the explicit "Team of N (flat — no group leader)" + "logistics choice, not a hierarchy" wording David flagged.

### Files with the explicit team-listing weirdness (HIGH priority — exact wording David called out)

| File | Issue (line numbers) |
|---|---|
| `3t3d-vit-2d-to-3d.md` | L80 "Hook" header; L82-86 Context block lists all 4 teammates inline + "flat — no group leader" + "logistics choice, not a hierarchy" |
| `l43d-cad-mllm.md` | L81 "Hook" header; L84-87 Context lists 4 teammates + "flat — no group leader" + "logistics choice, not a hierarchy" |
| `s25-team-26-paper-viz.md` | L67-77 Context lists 3 teammates with sprint roles + "flat — no group leader" |
| `design-the-ambience.md` | L171 "Team of 4 (flat — no group leader): David Chen, Risa Xie, Carla, Leslie" |
| `spectral-facades.md` | L114 "Team of 4 (flat — no group leader): David Chen, Risa Xie, Carla, Leslie" |
| `skill-bridge-datavis.md` | L135 second redundant "Context" with "Team of 2 (flat — no group leader)" — has TWO `## Context` headers (L71 the dilemma, L132 the metadata) |

### Files with templated `## Hook` / `## Context` but no team-listing weirdness (MEDIUM priority — collapse into prose)

These have the formulaic hook+context pattern but the contents are not problematic. Will soften the headers (drop `## Hook`, fold lead into a single intro paragraph; rename `## Context` to topic-specific or move metadata into the existing left-rail and remove duplication):

- `aurora-citadel-gen-game.md` (also has "Need David input" footnote — see §2)
- `live-ai-feedback-design-assistant.md`
- `semantic-canvas.md`
- `thesis-flagship.md`
- `generative-urbanism.md` — Context is just "Institution / Role: individual"; very short, leave header but rename
- `membrane-form-finding.md` — has "Why force-driven form" + "Context"
- `synthetic-texture-deterioration.md` — short Context
- `wire-bending.md` — short Context
- `a-game-of-deterioration.md` — short Context

Note: the project rail already shows YEAR / ROLE / CONTEXT / TOOLS / COLLAB metadata at left ([slug].astro L233-282). The `## Context` block in body is duplicative of that rail. Plan: remove `## Hook` headers (keep paragraph), and remove `## Context` blocks where they only repeat rail metadata. Where Context contains substantive info (e.g. teammate context, methodological grounding), fold it into a single opening paragraph in David's voice.

### Out of scope (leave alone)

`fiber-based-pavilion.md`, `deform.md`, `interlude.md`, `salt-marsh-research-center.md`, `sound-scape.md`, `spatial-bending.md`, `urban-mining.md`, `urban-streamline.md`, `uranium-scape.md` — no `## Hook` / no team-listing weirdness; leave untouched.

## 2. "Need confirmation" / TODO sweep

### Auto-remove (clearly internal-process metadata that shouldn't ship)

| File | Line(s) | Content |
|---|---|---|
| `aurora-citadel-gen-game.md` | L67 | parenthetical "(David confirmed — collaborators TBD; need to recover team members' names from class submissions or group emails)" — strip to a clean "Role: team project (collaborators not yet recovered)." |
| `aurora-citadel-gen-game.md` | L109-113 | entire `## David — confirm` block — delete |
| `aurora-citadel-gen-game.md` | L125-129 | trailing "*Card built 2026-04-23 from Explore agent…*" italic provenance footer — delete |
| `aurora-citadel-gen-game.md` | frontmatter L51 | `team_size: '>1 (team confirmed by David, collaborators TBD)'` → `team_size: '>1'` |
| `s25-team-26-paper-viz.md` | L100-105 | "**David — confirm status:**" block (Did this ship? Demo deployment? Slides?) — delete (visitor never sees questions to David) |
| `s25-team-26-paper-viz.md` | L109 | "**GitHub repo lost** per David (previously `chentianle1117/s25_team_26`). This card is a placeholder…" — soften to public-friendly note: "*Source repository not currently public.*" |
| `dashboard.astro` | L272 | `<span class="text-graphite-500"> · MIT (TBD)</span>` — David hasn't decided on a license. Surface to David (don't auto-decide). |
| `thesis.astro` | L29 | `data.advisor !== "TBD (thesis advisor)"` — code already gracefully falls back to "Prof. Daniel Cardoso Llach"; the underlying frontmatter has the TBD string. Will fix the source of truth instead. |
| `semantic-canvas.md` | frontmatter L3 | `advisor: TBD (thesis advisor)` → `advisor: Prof. Daniel Cardoso Llach` |
| `thesis-flagship.md` | frontmatter L3 | `advisor: TBD (thesis committee)` → leave or update — surface to David |

### Surface to David (don't auto-decide)

- `dashboard.astro:272` — license string says "MIT (TBD)". David should pick a license (or remove the "(TBD)" and commit to MIT) before this stays in production. Will leave as-is.
- `thesis-flagship.md` advisor — David has a known advisor (Prof. Daniel Cardoso Llach per `thesis.astro:29` fallback). The thesis-flagship card frontmatter says "TBD (thesis committee)" which is a different field (committee, not advisor). Will leave.
- `s25-team-26-paper-viz.md` — entire card describes a project where the GitHub repo was lost. Whether to publish at all is a David decision; leaving published but cleaning the language.

### Code comments (NOT visible to visitors — leave untouched)

`PlaceholderHero.astro`, `index.astro`, `[slug].astro`, etc. all contain `placeholder` / `Verify` / similar in code comments. These are internal documentation, not visitor-facing footnotes. Leaving alone.

## 3. Semantic-axes layout — centering

The page is `src/pages/latent-space.astro`. It mounts `<HeroNavigator client:visible />` (`src/components/hero/HeroNavigator.tsx`).

**Bug:** in `HeroNavigator.tsx` L163-224, the desktop layout is:

```
.hero-container { width: 100%; ... border-top/bottom only }
  .hero-split { display: flex; flex-direction: row (>=1024px) }
    .hero-side  { flex: 0 0 420px (480px ≥1440) }   ← LEFT
    .hero-canvas { flex: 1 1 auto; height: clamp(720px, 82vh, 1080px) }   ← RIGHT
```

`.hero-split` has `width: 100%` with NO max-width and NO `margin-inline: auto`. On a 1920px-wide screen, the sidebar sits flush at viewport-left with the canvas filling the remaining ~1500px, so the visual center of the assembly is biased to the right of the sidebar — not the screen center. David sees this as "biased to the left" because the sidebar always hugs the left edge, with no consistent left margin.

**Fix:** apply a centered max-width wrapper to `.hero-split` so the combined assembly has consistent left/right margins. Use the site's existing `container-wide` (1440px) or `container-display` (1280px) sizing convention. Keep the dark band (border-top/bottom) full-bleed so the editorial line stays.

Specific change in `src/components/hero/HeroNavigator.tsx`:
- L190-194: add `max-width: 1480px; margin-inline: auto; padding-inline: clamp(1.5rem, 3vw, 3rem);` to `.hero-split`
- L211-215: also gives consistent vertical breathing — current canvas is `clamp(720px, 82vh, 1080px)`. Add matching top/bottom padding to `.hero-container` so the dark band has consistent vertical margin too. Specifically add `padding-block: 0` is already 0 — not needed; the issue is purely horizontal.

That's the minimal CSS surgery: ~3 lines added in the styled-jsx block.

## Stop & re-read summary

- 6 files get team-listing rewrites (clear scope, low ambiguity).
- ~9 additional files get header softening (mostly removing `## Hook` and reducing duplicate `## Context`). Lower-stakes pass.
- Aurora Citadel + s25-team-26 get explicit footnote sweeps with text changes cited above.
- Semantic-axes fix is a 3-line CSS change in one styled-jsx block.

All changes proposed are real (line numbers cited). Proceeding to Phase B.
