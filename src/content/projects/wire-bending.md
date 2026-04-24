---
type: portfolio-project
title: "Wire-bending Parametric Workflow with Mixed Reality"
slug: wire-bending
course: "48-736 Master Independent Study (research with Prof. Vernelle Noel / Fologram)"
course_code: 48-736
semester: "Fall 2024"
year: 2024
role: research-assistant
team_size: 2
collaborators: [Prof. Vernelle Noel]
tags: [mixed-reality, hololens, grasshopper, fologram, digital-fabrication, parametric-design, craft]
categories: [Mixed Reality, Digital Fabrication]
github: null
notion_url: https://www.notion.so/chentianle1117/Wire-bending-Parametric-Workflow-with-Mixed-Reality-16933d12d95a818eafdad039f5f65990
local_path: "W:\\CMU_Academics\\Fall 2024 CMU\\Fologram Research"
hero_image: /assets/wire-bending/hero.png
images:
  - /assets/wire-bending/hololens-workflow-1.png
  - /assets/wire-bending/hololens-workflow-2.png
  - /assets/wire-bending/bending-process.gif
  - /assets/wire-bending/final-detail.png
  - /assets/wire-bending/full-installation.png
artifacts:
  - /assets/wire-bending/MasterQR.pdf
  - /assets/wire-bending/recut piece 1106 [Converted].pdf
  - /assets/wire-bending/recut piece 1106 [Converted] f.pdf
  - "20241003_180350_HoloLens.mp4 (91MB, local only)"
  - "20241107_185059_HoloLens.mp4 (495MB, local only)"
  - "20241118_111306_HoloLens.mp4 (3.6GB, local only)"
  - "wirebending button update 1017.mp4 (545MB, local only)"
  - "Real Construction Details 1102 Rhino videos (3 variants, 2.5-2.8GB each, local only)"
  - "9_23_2024.obj (92MB mesh export, local only)"
  - 20+ Grasshopper .gh files (iteration: 0929, 1017, 1028, 1030, 1102)
  - Rhino 3DM files (~17-22MB each)
priority: flagship
status: draft
publish: true
---
# Wire-bending Parametric Workflow with Mixed Reality

> Integrate parametric design (Grasshopper) with HoloLens-projected digital overlays to guide **manual** wire-bending — bridging computational precision and hand craftsmanship without robotic automation.

![hero](/assets/wire-bending/hero.png)

## Hook
Rather than automate fabrication with robots, this workflow uses mixed-reality guidance: a Grasshopper model drives a HoloLens projection onto the physical workspace, giving designers real-time visual cues as they bend each wire segment by hand. Design changes propagate live into the projected guide.

## Context
**Course:** 48-736 Master Independent Study, Fall 2024.
**Research with:** Prof. Vernelle Noel (architecture + craft/making).
**Toolchain:** Grasshopper + Fologram + Microsoft HoloLens.

## Approach
1. **Parametric model** — wire geometry generated in Grasshopper with bend-point parameters
2. **Fologram bridge** — streams model geometry to HoloLens in real time
3. **Spatial anchor** — projection aligned to physical workbench; each bend point appears as an AR marker
4. **Manual fabrication** — designer bends wire to match AR guides, maintaining full hand agency
5. **Live feedback loop** — adjustments to Grasshopper model (or to the physical piece) update the AR guide in real time

## Outcomes
- Demonstrates **interactive fabrication** as an alternative to full automation — computational precision + hand agency
- Extensive HoloLens video documentation (October-November 2024 recordings)
- Argues for MR as a bridge between digital craftsmanship and traditional making
- Aligns with Prof. Noel's research on craft, making, and computational design pedagogy

## Links
- [Notion page](https://www.notion.so/chentianle1117/Wire-bending-Parametric-Workflow-with-Mixed-Reality-16933d12d95a818eafdad039f5f65990)
- Local: `W:\CMU_Academics\Fall 2024 CMU\Fologram Research\`

## Images
*Multiple HoloLens screen captures + physical installation photos. Pull via `/assets/.tools/fetch_images.py`.*
