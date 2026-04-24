---
type: portfolio-project
title: "Synthetic Tool for Visualizing Texture Deterioration"
slug: synthetic-texture-deterioration
course: "48-736 Master Independent Study"
course_code: 48-736
semester: "Fall 2024"
year: 2024
role: individual
team_size: 1
tags: [generative-ai, material-aging, architectural-facades, weathering, interface-design, controlnet, svelte]
categories: [Interface Design]
github: chentianle1117/real-time-texture-analyzer
github_url: https://github.com/chentianle1117/real-time-texture-analyzer
notion_url: https://www.notion.so/chentianle1117/Synthetic-Tool-for-Visualizing-Texture-Deterioration-16933d12d95a81dfbb4ad317fa136701
local_path: "W:\\CMU_Academics\\Fall 2024 CMU\\Independent Study\\new-texture-analyzer"
progress_report: /assets/synthetic-texture-deterioration/progress-report.pdf
hero_image: /assets/synthetic-texture-deterioration/facade-aging-1.png
images:
  - /assets/synthetic-texture-deterioration/facade-aging-1.png
  - /assets/synthetic-texture-deterioration/facade-aging-2.png
  - /assets/synthetic-texture-deterioration/facade-aging-3.png
  - /assets/synthetic-texture-deterioration/facade-aging-4.png
artifacts:
  - /assets/synthetic-texture-deterioration/progress-report.pdf
  - Svelte/Vite web UI
  - image_labeling.py
  - image_scraper.py
  - renaming_images.py
  - JSON workflow configs
  - texture sample folders (wood, metal, brick)
  - ControlNet-main.zip (98MB, integrated for image generation)
priority: experimental
status: ready
publish: true
---
# Synthetic Tool for Visualizing Texture Deterioration

> A generative-AI framework for simulating and visualizing the long-term aging of architectural façades. Unlike existing generative models that present idealized, pristine textures, this tool emphasizes realistic deterioration driven by environmental exposure.

![facade aging 1](/assets/synthetic-texture-deterioration/facade-aging-1.png)

This project focuses on developing a generative-AI framework to realistically simulate and visualize the long-term aging of architectural façades. Unlike existing generative models — which often present idealized, pristine textures — this tool emphasizes the realistic deterioration of materials due to environmental exposure. By incorporating material-aging algorithms and data on climate conditions, the tool aims to bridge a critical gap in existing design processes: letting architects and designers anticipate how different materials weather over time.

The tool is interactive. It provides real-time feedback to designers as they apply textures to their models. By adjusting environmental parameters — moisture, sunlight, pollution — users can visualize texture evolution dynamically and experiment with different aging scenarios. The feature enhances decision-making by offering a predictive understanding of material behavior, helping designers refine their choices and improve the long-term resilience and aesthetic quality of their projects.

**(Project in progress.)**

![facade aging 2](/assets/synthetic-texture-deterioration/facade-aging-2.png)
![facade aging 3](/assets/synthetic-texture-deterioration/facade-aging-3.png)
![facade aging 4](/assets/synthetic-texture-deterioration/facade-aging-4.png)

## Approach

1. **Input** — designer applies a texture to a 3D model in the web UI
2. **Environmental parameters** — moisture, sunlight, pollution sliders
3. **Aging algorithm** — generative model conditioned on environmental parameters + material class
4. **Data pipeline** — `image_scraper.py` pulls training images; `image_labeling.py` + renaming for curation
5. **Real-time feedback** — designer sees predicted weathering dynamically as they adjust sliders

**Stack:** Svelte/Vite frontend + Python pipeline. ControlNet integrated for conditioned image generation.

## Status note

Self-described as exploratory / in-progress. The idea stands — *predictive material weathering as a design input* rather than a post-hoc render effect — but the quality bar for a production-ready tool isn't met yet. Card included as an attempt + idea worth revisiting in later thesis/material research.

## Context

**Course:** 48-736 Master Independent Study, Fall 2024.
**Role:** solo.
**Full progress report:** `/assets/synthetic-texture-deterioration/progress-report.pdf` (2.1 MB — Independent Study Progress Report).

## Links

- [GitHub repo: real-time-texture-analyzer](https://github.com/chentianle1117/real-time-texture-analyzer)
- [Notion page](https://www.notion.so/chentianle1117/Synthetic-Tool-for-Visualizing-Texture-Deterioration-16933d12d95a81dfbb4ad317fa136701)
- Local: `W:\CMU_Academics\Fall 2024 CMU\Independent Study\new-texture-analyzer\`
- Progress report (in vault): `/assets/synthetic-texture-deterioration/progress-report.pdf`

## Related cards

Part of the Fall 2024 "deterioration" cluster — three different lenses on the same theme:

- [[2024-Fall--a-game-of-deterioration]] — game-simulation lens
- [[2024-Fall--spectral-facades]] — installation lens
