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
tags: [mixed-reality, hololens, grasshopper, fologram, digital-fabrication, parametric-design, craft, interactive-fabrication]
categories: [Mixed Reality, Digital Fabrication]
github: null
notion_url: https://www.notion.so/chentianle1117/Wire-bending-Parametric-Workflow-with-Mixed-Reality-16933d12d95a818eafdad039f5f65990
local_path: "W:\\CMU_Academics\\Fall 2024 CMU\\Fologram Research"
hero_image: /assets/wire-bending/hero.png
images:
  - /assets/wire-bending/hero.png
  - /assets/wire-bending/hololens-workflow-1.png
  - /assets/wire-bending/hololens-workflow-2.png
  - /assets/wire-bending/bending-process.gif
  - /assets/wire-bending/detail.png
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
status: ready
publish: true
---
# Wire-bending Parametric Workflow with Mixed Reality

> Parametric design tools integrated with mixed-reality guidance for precise, efficient wire-bending. Grasshopper + Microsoft HoloLens project digital models onto the physical workspace as real-time visual cues — designer-as-fabricator, guided by digital overlays.

![hero](/assets/wire-bending/hero.png)

This workflow integrates parametric design tools with mixed reality guidance to enable precise and efficient wire-bending. Using Grasshopper in combination with Microsoft HoloLens, digital models are projected onto the physical workspace, providing real-time visual cues for manual adjustments. This setup allows designers to interact directly with wire segments, ensuring consistency and accuracy in the bending process while responding dynamically to design changes.

The system emphasizes **interactive fabrication without relying on robotic automation**, enabling the creation of complex wire structures through manual techniques guided by digital overlays. The real-time adjustments and visual feedback streamline the workflow, bridging digital and physical design while achieving higher precision in wire-bending tasks. This approach showcases the potential of combining mixed reality with traditional craftsmanship to optimize fabrication processes.

![HoloLens workflow](/assets/wire-bending/hololens-workflow-1.png)
![HoloLens workflow](/assets/wire-bending/hololens-workflow-2.png)

![bending process](/assets/wire-bending/bending-process.gif)

![detail](/assets/wire-bending/detail.png)

![full installation](/assets/wire-bending/full-installation.png)

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

## Context

**Course:** 48-736 Master Independent Study, Fall 2024.
**Research with:** Prof. Vernelle Noel (architecture + craft / making).
**Toolchain:** Grasshopper + Fologram + Microsoft HoloLens + Rhino.

## Links

- [Notion page](https://www.notion.so/chentianle1117/Wire-bending-Parametric-Workflow-with-Mixed-Reality-16933d12d95a818eafdad039f5f65990)
- Local: `W:\CMU_Academics\Fall 2024 CMU\Fologram Research\`

## Related cards

- [[2024-Fall--synthetic-texture-deterioration]] — parallel 48-736 Independent Study work
