---
_hero_curated: true
artifacts:
- main.py
- game.py
- menu.py
- character.py
- assets/ (sprites, textures)
categories:
- Game
course: 15-112 Fundamentals of Programming and Computer Science — Final
course_code: 15-112
gif_hero: /assets/a-game-of-deterioration/demo-09.gif
github: chentianle1117/A-Game-of-Deterioration---Time-Reversal
github_url: https://github.com/chentianle1117/A-Game-of-Deterioration---Time-Reversal
hero_image: /assets/a-game-of-deterioration/demo-09.gif
images:
- /assets/a-game-of-deterioration/demo-06.gif
- /assets/a-game-of-deterioration/demo-01.gif
- /assets/a-game-of-deterioration/demo-07.gif
- /assets/a-game-of-deterioration/img2img1.gif
- /assets/a-game-of-deterioration/img2img2.gif
- /assets/a-game-of-deterioration/demo-08.gif
- /assets/a-game-of-deterioration/demo-02.gif
- /assets/a-game-of-deterioration/demo-10.gif
- /assets/a-game-of-deterioration/demo-04.gif
- /assets/a-game-of-deterioration/demo-05.gif
- /assets/a-game-of-deterioration/demo-03.gif
- /assets/a-game-of-deterioration/cfg-conparision.png
- /assets/a-game-of-deterioration/img2img-example.png
- /assets/a-game-of-deterioration/input.png
- /assets/a-game-of-deterioration/papercube-test.png
- /assets/a-game-of-deterioration/white.jpg
local_path: W:\CMU_Academics\Fall 2024 CMU\112 Term Project - Final - Submission
notion_url: https://www.notion.so/chentianle1117/A-Game-of-Deterioration-Time-Reversal-16a33d12d95a80779ab7f488cbc13f1f
priority: flagship
publish: true
role: individual
semester: Fall 2024
slug: a-game-of-deterioration
status: ready
tags:
- python
- game-design
- procedural-textures
- pillow
- numpy
- cmu-graphics
- simulation
- user-generated-content
team_size: 1
title: A Game of Deterioration — Time Reversal
type: portfolio-project
year: 2024
---

> A 2D simulation game where you heal a user-generated world before it collapses. Pillow + NumPy + cmu_graphics. Draw your own map, then drop in as a character with healing abilities to slow the decay.

**Deterioration & Restoration** (a.k.a. *Can You Reverse Time?*) is a 2D simulation game that challenges you to heal a user-generated world before it collapses into a fully apocalyptic state. Built in Python with **cmu_graphics**, **Pillow**, and **NumPy**, the project emphasizes procedural texture manipulation and dynamic terrain deterioration.

[GitHub repository →](https://github.com/chentianle1117/A-Game-of-Deterioration---Time-Reversal)

## Key features

### 1. User-generated terrain

Start by "drawing" your own map in an editor reminiscent of Photoshop.
- **White regions** become elevated terrain
- **Black regions** become water
- Quick brush tools and contrast adjustments let you shape a unique world before entering the game.

### 2. Deterioration & restoration

- Textures degrade over time, introducing visible wear and tear on land and foliage.
- Control a character with special healing abilities to reverse or slow the decay.
- Collect power-ups and inventory items that boost your healing radius or allow instantaneous bursts of restoration.

### 3. Multiple game modes

- **Timed Mode** — survive until the countdown expires without letting overall deterioration exceed 80%.
- **Infinite Mode** — face continuous global deterioration with no countdown. Sustain your environment as long as possible, then end the game when you're ready.

### 4. Real-time feedback

- Visual cues show deterioration in real time, from subtle texture fading to severe breakdown.
- A final results screen reveals how your world changed over time and charts your character's growth in healing power.

### 5. Easy to run & expand

- Simple Python 3.6+ codebase with clear dependencies (`cmu_graphics`, `Pillow`, `NumPy`).
- Organized file structure (`main.py`, `game.py`, `menu.py`, and an `assets/` folder for textures) for easy customization.
- Debug keys and commands allow on-the-fly testing of terrain, zoom, and texture states.

## Game assets

**Equipment icons** — speed, radius, burst, power.
**Character sprite** — four-directional sprite (back, left, front, right).
**Textures** — paired samples of original and deteriorated states (BIGLEAVES, BRICKS, DIRT, PATHROCKS).

## Technical highlights

- **Procedural texture deterioration** — implemented via Pillow image enhancements (contrast, brightness, color adjustments), plus Gaussian blur for water effects
- **NumPy-based editing** — efficient brush masking and terrain upscaling with NumPy arrays, ensuring smooth real-time drawing and quick texture generation
- **Grid-based movement & collision** — character movement is restricted by highly deteriorated cells, creating strategic challenges in navigating the environment
- **Data visualization** — end-game charts display how quickly the terrain deteriorated vs. how fast the player's abilities grew

## Inspirations

- **Don't Starve**, **RimWorld**, and **Hyper Light Drifter** for 2D aesthetic, procedural terrain ideas, and survival elements
- The concept of "time reversal" through healing is inspired by games that fuse resource management with real-time crisis mitigation

**Deterioration & Restoration** shows how iterative texture manipulation, user-generated terrain, and survival mechanics can combine into a compelling 2D experience. The balance between decay and healing — along with two distinct game modes — adds replayability, while the real-time data visualizations make each session feel unique.

## Context

**Course:** 15-112 Fundamentals of Programming and Computer Science — term project final, Fall 2024.
**Role:** solo.
**Stack:** Python 3.6+, `cmu_graphics`, `Pillow`, `NumPy`.

## Links

- [GitHub repo](https://github.com/chentianle1117/A-Game-of-Deterioration---Time-Reversal)
- [Notion page (full write-up + asset samples)](https://www.notion.so/chentianle1117/A-Game-of-Deterioration-Time-Reversal-16a33d12d95a80779ab7f488cbc13f1f)
- [YouTube demo](https://youtu.be/WJJb2UKv4MY)
- Local: `W:\CMU_Academics\Fall 2024 CMU\112 Term Project - Final - Submission\`

## Related cards

This "deterioration" theme became a cross-project motif in Fall 2024:

- [[2024-Fall--synthetic-texture-deterioration]] — the tool-side exploration (architectural texture aging as a design simulation)
- [[2024-Fall--spectral-facades]] — the installation-side exploration (diffusion-driven transition between pristine and decayed façades)