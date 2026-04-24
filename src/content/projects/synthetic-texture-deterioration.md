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
tags: [generative-ai, material-aging, architectural-facades, weathering, interface-design]
categories: [Interface Design]
github: chentianle1117/real-time-texture-analyzer
github_url: https://github.com/chentianle1117/real-time-texture-analyzer
notion_url: https://www.notion.so/chentianle1117/Synthetic-Tool-for-Visualizing-Texture-Deterioration-16933d12d95a81dfbb4ad317fa136701
local_path: "W:\\CMU_Academics\\Fall 2024 CMU\\Independent Study\\new-texture-analyzer"
progress_report: /assets/synthetic-texture-deterioration/progress-report.pdf
hero_image: /assets/synthetic-texture-deterioration/hero.png
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
status: draft
publish: true
note: "User self-described this as 'not really to a good quality but can be there as an attempt or idea' — include as exploratory work, not flagship."
---
# Synthetic Tool for Visualizing Texture Deterioration

> A generative-AI framework that simulates how architectural façade materials age over time — bridging a gap in design processes where existing models show only idealized textures.

![hero](/assets/synthetic-texture-deterioration/hero.png)

## Hook
Most generative models produce pristine textures. Real buildings weather. This tool uses material-aging algorithms + climate data to predict how a façade will look after years of moisture, sunlight, and pollution — interactive so designers can experiment with scenarios.

## Context
**Course:** 48-736 Master Independent Study, Fall 2024.
**Self-described status:** exploratory / in-progress. David explicitly flagged this as "not really to a good quality but can be there as an attempt or idea" — include as idea, not flagship.

## Approach
1. **Input** — designer applies a texture to a 3D model in the web UI
2. **Environmental parameters** — moisture, sunlight, pollution sliders
3. **Aging algorithm** — generative model conditioned on environmental parameters + material class
4. **Data pipeline** — `image_scraper.py` pulls training images; `image_labeling.py` + renaming for curation
5. **Real-time feedback** — designer sees predicted weathering dynamically as they adjust sliders

**Stack:** Svelte/Vite frontend + Python pipeline.

## Outcomes
- Prototype UI working; aging model is exploratory — quality not production-ready
- Idea stands: *predictive material weathering as a design input*, not a post-hoc render effect
- Could be revisited in later thesis / material research work

## Links
- [Notion page](https://www.notion.so/chentianle1117/Synthetic-Tool-for-Visualizing-Texture-Deterioration-16933d12d95a81dfbb4ad317fa136701)
- Local: `W:\CMU_Academics\Fall 2024 CMU\Independent Study\new-texture-analyzer\`
- Related public repo (earlier iteration): [real-time-texture-analyzer](https://github.com/chentianle1117/real-time-texture-analyzer) (private)
