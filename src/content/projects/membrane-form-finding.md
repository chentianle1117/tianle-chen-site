---
_hero_curated: true
categories:
- Parametric Design
- Architecture
course: Rice studio / research
course_code: null
github: null
hero_image: /assets/membrane-form-finding/membrane-3.png
images:
- /assets/membrane-form-finding/membrane-4.png
- /assets/membrane-form-finding/membrane-1.png
- /assets/membrane-form-finding/membrane-2.png
institution: Rice University
local_path: null
notion_url: https://www.notion.so/chentianle1117/Membrane-Parametric-Form-finding-16933d12d95a81c1acdeef0748c37bc9
priority: standard
publish: true
semester: 2021-2024
slug: membrane-form-finding
status: ready
summary: A dynamic-relaxation form-finding workflow for tensile membrane structures,
  exploring equilibrium geometries achievable from simple anchor and edge-cable constraints.
  Grasshopper + Kangaroo Physics; output curated as a families taxonomy of membrane
  typologies.
tags:
- parametric-design
- membrane-structures
- tensile-architecture
- form-finding
- kangaroo
- equilibrium-form
title: Membrane Parametric Form-finding
type: portfolio-project
year: 2024
---

> Tensile-membrane architecture via parametric form-finding — Kangaroo-based physical simulation in Grasshopper for shell and membrane geometries whose form emerges from force equilibrium rather than top-down authorship.

![membrane form 1](/assets/membrane-form-finding/membrane-1.png)

Parametric form-finding for membrane structures: geometries that emerge from the equilibrium of forces rather than being explicitly modeled. Built with Kangaroo physics inside Grasshopper, the study explores a family of tensile shells — each one a stable solution to an underlying mesh + force-density problem.

![membrane form 2](/assets/membrane-form-finding/membrane-2.png)
![membrane form 3](/assets/membrane-form-finding/membrane-3.png)
![membrane form 4](/assets/membrane-form-finding/membrane-4.png)

## Approach

- **Kangaroo physics simulation** inside Grasshopper for mesh relaxation. Each shell starts as a flat triangulated mesh; springs along edges resolve to a minimal-energy configuration under the imposed boundary conditions
- **Anchor-point + force-density experiments** — pinning, tensioning, and releasing edges in different combinations produces a family of related shells. The designer's lever is not the geometry directly but the topology and force schedule that lead to it
- **Form emerging from equilibrium** — rather than explicit modeling of the final geometry, the designer sets up boundary conditions and constraints; the shape follows. This inverts the usual CAD workflow: the architect specifies *what the structure must do* and the simulation reports *what it must look like*

## Why force-driven form

Tensile membranes, cable nets, and shell structures share a property that flat-packed CAD modeling cannot fake: their geometry **is** the structural diagram. A doubly-curved minimal surface under tension carries load through pure axial force. A funicular shell in compression follows the inverted form of a hanging chain network. The same logic Antoni Gaudí used with weighted strings at Sagrada Familia — except the iteration loop now runs at thirty frames per second.

For the architecture student this means the form-finding step is also the structural-intuition step. By tuning anchor positions, edge tensions, and density, the designer learns to read the relationship between boundary topology and emergent geometry — which is the precondition for designing structurally honest membrane buildings rather than decorating them after the fact.

## Outputs

The study produced four representative shell families documented in the gallery: a saddle, a four-point pavilion, a cable-net shading screen, and a tessellated patchwork that demonstrates how multiple smaller form-found pieces can be stitched into a larger composite envelope. Each family is a parameter range, not a single geometry — the underlying Grasshopper definition exposes anchor positions, tension scalars, and mesh density as live sliders.

Independent research at Rice University, 2021–2024, advised by Prof. Juan Jose Castellon as part of the broader CNT-fiber experimental-models lab. Companion to the [[2021-2024-Rice--fiber-based-pavilion|Fiber-based Pavilion]] — both share the parametric form-finding vocabulary, with the pavilion extending the membrane logic into a fabricated full-scale prototype.

## Links

- [Notion page](https://www.notion.so/chentianle1117/Membrane-Parametric-Form-finding-16933d12d95a81c1acdeef0748c37bc9)

## Related cards

- [[2021-2024-Rice--fiber-based-pavilion]] — parallel Rice research, same form-finding vocabulary
- [[2025-Spring--generative-urbanism]] — Rice architecture studio work