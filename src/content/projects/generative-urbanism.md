---
_hero_curated: true
artifacts:
- Grasshopper .gh definition
- Galapagos evolutionary solver setup
categories:
- Urban Planning
course: Rice University architecture studio
course_code: null
github: null
hero_image: /assets/generative-urbanism/evolution-1.png
images:
- /assets/generative-urbanism/evolution-7.png
- /assets/generative-urbanism/evolution-5.png
- /assets/generative-urbanism/evolution-2.png
- /assets/generative-urbanism/evolution-4.png
- /assets/generative-urbanism/evolution-6.png
- /assets/generative-urbanism/evolution-3.png
image_captions:
- Optimization iteration matrix — 36 layouts from the Galapagos genetic solver, nominal
  scores rising from ~63 toward 100 across roughly 10,000 iterations; color legend keys
  the five inserted programs.
- Parcel site analysis — each emptied parcel scored on size (~200/400/600/1000+ m²),
  street access, within- and between-block relationships, population demographics, and
  program reachability within a 5-minute walk.
- Four-step process axonometrics — identify abandoned houses, scrap extraction to the
  local recycling economy, reevaluate empty parcels, then populate new public programs.
- Grasshopper definition — the modular script canvas linking input urban fabric, random
  initialization, parcel size/location relationships, accessibility analysis, and the
  Galapagos score calculation.
- New program insertion strategy — per-program placement rules (Sports Court, Green
  Spaces, Tianguis street market, Shops & Supermarkets, New Housing) keyed to footprint,
  street access, block composition, and proximity to population.
- Computational workflow diagram — the end-to-end pipeline from abandoned-parcel
  identification and quantitative site analysis through Galapagos optimization to
  qualitative adjustment.
institution: Rice University
local_path: null
notion_url: https://www.notion.so/chentianle1117/Generative-Urbanism-16933d12d95a813d846efbe36700cd75
priority: standard
publish: true
semester: Rice undergraduate (2021-2024)
slug: generative-urbanism
stats:
- value: "60%"
  label: "dwellings vacant"
- value: "10K"
  label: "solver iterations"
- value: "63→100"
  label: "layout score climb"
- value: "36"
  label: "evolved layouts"
status: ready
summary: A generative-urbanism study of the Zaragoza community in Ciudad Juarez,
  Mexico, where 60%+ of dwellings sit vacant. Abandoned houses are mapped, demolished,
  and fed into the border's existing scrap economy; emptied parcels are then scored on
  size, accessibility, and demographics, and a Galapagos genetic solver places new
  public programs to maximize a multi-criteria layout score.
tags:
- parametric-design
- grasshopper
- galapagos
- evolutionary-optimization
- urban-planning
- border
- adaptive-urbanism
title: Generative Urbanism — U.S.-Mexico Border Revitalization
type: portfolio-project
year: 2023
---

> A generative-urbanism study of the Zaragoza community in Ciudad Juarez, Mexico — where instead of drawing a master plan, the "designer" writes the scoring rules and lets a genetic solver evolve the block-by-block program layout.

![Site context map of the Zaragoza community, Ciudad Juarez, with abandoned housing mapped in red across the urban fabric](/assets/generative-urbanism/evolution-1.png)

**Revitalization as a generative, rule-based problem** — rather than propose a fixed redevelopment plan, this project maps the vacancy, recovers its material, and lets an algorithm decide what to build where. The Zaragoza community sits among the large informal residential areas of Ciudad Juarez, where up to 60% of dwellings are uninhabited — the result of a high crime rate and emigration driven by neighborhood instability.

The move begins by **selectively demolishing empty settlements** and sorting the demolition material into the local steel-recycling economy that is already prominent at the border. The emptied parcels then become a search space. Each parcel is scored on measurable qualities — size (roughly 200 to 1,000+ m²), street access, within- and between-block relationships, surrounding demographics, and how many existing programs it reaches within a five-minute walk. That quantitative site analysis becomes the database against which new public programs are placed.

## Approach

The workflow runs across three phases — **Urban Contextual Analysis → Site Quantitative Analysis → Program Layout Proposal**:

1. **Identify & recover** — GIS mapping of abandoned housing; demolished parcels feed the border scrap economy rather than landfill
2. **Score every parcel** — a Grasshopper definition evaluates parcel size, street access, inter-block relationships, and 5-minute-walk accessibility to existing programs and population
3. **Assign program rules** — each candidate program (Sports Court, Green Spaces, Tianguis street market, Shops & Supermarkets, New Housing) carries its own placement preferences for footprint, street access, block composition, and proximity to density
4. **Evolve the layout** — the Galapagos genetic solver runs a multi-criteria fitness score over the whole community, converging over ~10,000 iterations from a nominal score near 63 toward 100

## Boards

![Four-step process axonometrics — identify abandoned houses, scrap extraction, empty parcels, populate new public programs](/assets/generative-urbanism/evolution-2.png)
![Computational workflow diagram from abandoned-parcel identification through Galapagos optimization to qualitative adjustment](/assets/generative-urbanism/evolution-3.png)
![Grasshopper definition — modular script canvas for parcel scoring, accessibility analysis, and Galapagos score calculation](/assets/generative-urbanism/evolution-4.png)
![Parcel site analysis — scoring by size, street access, block relationships, demographics, and 5-minute-walk accessibility](/assets/generative-urbanism/evolution-5.png)
![New program insertion strategy — per-program placement rules for footprint, street access, block composition, and proximity](/assets/generative-urbanism/evolution-6.png)
![Optimization iteration matrix — Galapagos layouts with nominal scores rising toward 100 across ~10,000 iterations](/assets/generative-urbanism/evolution-7.png)

## Outcomes

- Urban form is **evolved, not authored** — the deliverable is a scoring system plus a solver, not a single fixed plan
- The iteration matrix makes the tradeoffs legible: 36 layouts spanning nominal scores from ~63 to 100, balancing program mix, accessibility, and demographics
- Reframes border revitalization as a data-driven, generative problem and closes the loop with a qualitative evaluation-and-adjustment step over the solver's output

## Links

- [Notion page](https://www.notion.so/chentianle1117/Generative-Urbanism-16933d12d95a813d846efbe36700cd75)

## Related cards

- [[2021-2024-Rice--fiber-based-pavilion]] — parallel Rice parametric research (published at IASS 2024)
- [[2021-2024-Rice--membrane-form-finding]] — Rice parametric studio work