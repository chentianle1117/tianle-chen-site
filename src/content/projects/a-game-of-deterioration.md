---
type: portfolio-project
title: "A Game of Deterioration — Time Reversal"
slug: a-game-of-deterioration
course: "15-112 Fundamentals of Programming and Computer Science — Final"
course_code: 15-112
semester: "Fall 2024"
year: 2024
role: individual
team_size: 1
tags: [python, game-design, procedural-textures, pillow, numpy, cmu-graphics, simulation]
categories: [Game]
github: chentianle1117/A-Game-of-Deterioration---Time-Reversal
github_url: https://github.com/chentianle1117/A-Game-of-Deterioration---Time-Reversal
notion_url: https://www.notion.so/chentianle1117/A-Game-of-Deterioration-Time-Reversal-16a33d12d95a80779ab7f488cbc13f1f
local_path: "W:\\CMU_Academics\\Fall 2024 CMU\\112 Term Project - Final - Submission"
hero_image: /assets/a-game-of-deterioration/gameplay.gif
images:
  - /assets/a-game-of-deterioration/terrain-editor.gif
  - /assets/a-game-of-deterioration/healing-gameplay.gif
  - /assets/a-game-of-deterioration/storyboard.jpg
  - /assets/a-game-of-deterioration/equipment-icons.png
  - /assets/a-game-of-deterioration/character-sprites.png
  - /assets/a-game-of-deterioration/texture-pairs.png
video: https://youtu.be/WJJb2UKv4MY
artifacts:
  - main.py
  - game.py
  - menu.py
  - character.py
  - assets/ (sprites, textures)
priority: flagship
status: draft
publish: true
---
# A Game of Deterioration — Time Reversal

> A 2D simulation game where you heal a user-generated world before it collapses. Procedural texture deterioration, real-time restoration, and survival mechanics — built in pure Python.

![gameplay](/assets/a-game-of-deterioration/gameplay.gif)

## Hook
Draw your own map Photoshop-style (white = elevated terrain, black = water), then drop in as a character with healing abilities to slow the decay. Textures visibly degrade over time. Collect power-ups to expand your radius or burst-heal. Two modes: timed survival or open-ended endurance.

## Context
**Course:** 15-112 Fundamentals of Programming and Computer Science — term project final, Fall 2024.
**Role:** solo.
**Stack:** Python 3.6+, `cmu_graphics`, `Pillow`, `NumPy`.

## Approach

**Five pillars:**

1. **User-generated terrain** — brush-based editor with contrast adjustment; bitmap → playable terrain
2. **Procedural deterioration** — Pillow image enhancements (contrast, brightness, color), Gaussian blur for water; textures fade over time
3. **Restoration mechanics** — character with healing radius; power-ups modify radius / grant bursts
4. **Two game modes** — Timed (survive until countdown with <80% global deterioration) vs. Infinite (continuous decay, sustain as long as possible)
5. **Data visualization end-screen** — charts terrain deterioration vs. player ability growth

**Technical highlights:**
- NumPy arrays for efficient brush masking + terrain upscaling
- Grid-based movement with collision against highly-deteriorated cells
- Debug keys for on-the-fly texture / zoom / terrain testing

## Outcomes
- Full playable game submitted as 15-112 final
- Procedural texture manipulation + user-generated content in pure Python
- Inspired by *Don't Starve*, *RimWorld*, *Hyper Light Drifter*
- Strong conceptual throughline with Fall 2024's *Synthetic Tool for Visualizing Texture Deterioration* and later *Spectral Facades* — "deterioration" as a cross-project motif

## Links
- [GitHub repo](https://github.com/chentianle1117/A-Game-of-Deterioration---Time-Reversal)
- [Notion page (full write-up + asset samples)](https://www.notion.so/chentianle1117/A-Game-of-Deterioration-Time-Reversal-16a33d12d95a80779ab7f488cbc13f1f)
- [YouTube demo](https://youtu.be/WJJb2UKv4MY)
- Local: `W:\CMU_Academics\Fall 2024 CMU\112 Term Project - Final - Submission\`
