---
type: portfolio-project
title: "Spectral Facades"
slug: spectral-facades
course: "48-652 Pixels Photons (Mapping & TouchDesigner)"
course_code: 48-652
semester: "Fall 2024"
year: 2024
role: team-member
team_size: 4
team: [David Chen, Risa Xie, Carla, Leslie]
tags: [projection-mapping, stream-diffusion, mediapipe, gesture-control, interactive-installation]
categories: [Projection Mapping, Digital Interaction]
github: null
notion_url: https://www.notion.so/chentianle1117/Spectral-Facades-16a33d12d95a800e8b5cfb0632519488
local_path: "W:\\CMU_Academics\\Fall 2024 CMU\\Mapping and TouchDesigner\\Assignment 3 Projection Mapping"
hero_image: /assets/spectral-facades/hero.gif
images:
  - /assets/spectral-facades/meme-collage.png
  - /assets/spectral-facades/stream-diffusion-weights.png
  - /assets/spectral-facades/mediapipe-gestures.png
  - /assets/spectral-facades/final-output.png
video: https://youtu.be/EiQlJGqY754
artifacts:
  - /assets/spectral-facades/cube.pdf
  - /assets/spectral-facades/1121 movie demo.mp4
  - /assets/spectral-facades/mapping screenshot.png
  - /assets/spectral-facades/screenshot.jpg
  - /assets/spectral-facades/test1.png
  - /assets/spectral-facades/papercube-test.png
  - "W:\\CMU_Academics\\Fall 2024 CMU\\Mapping and TouchDesigner\\Assignment 3 Projection Mapping\\touch designer final project video.mp4 (174MB, not in vault)"
  - papercube.fbx + papercube1.fbx
  - .toe TouchDesigner files (147KB)
priority: standard
status: draft
publish: true
---
# Spectral Facades

> An interactive media installation merging modernist and dystopian architectural façades into a real-time controllable spectrum — driven by gesture and posture.

![hero](/assets/spectral-facades/hero.gif)

## Hook
Viewers sculpt architectural aesthetics on the fly using body posture (nose Y-position) and hand gestures (open/closed palm). StreamDiffusion interpolates between two weighted prompts — one Ricardo Bofill's Walden 7, one a fantastical deteriorated façade — while generative audio tracks the transition.

## Context
**Course:** 48-652 Pixels Photons (Mapping & TouchDesigner), Fall 2024.
**Team:** David Chen, Risa Xie, Carla, Leslie.
**Prompt:** projection mapping assignment — control-surface for interactive architectural imagery.

## Approach

1. **Input textures** — meme collage mapped onto physical model; basic façade textures for modern + deteriorated base states
2. **Stream Diffusion** — two prompts fed in parallel, weighted dynamically by pose data
3. **Gesture control** — MediaPipe tracks nose Y (interpolation between façade states) + palm open/closed (prompt strength / diffusion steps)
4. **Audio layer** — each façade style has its own musical layer, volume ties to active state
5. **Real-time output** — synthesized image projected, sound shifts with gesture

## Outcomes
- Demonstrates generative AI as real-time interactive medium, not static tool
- Blurs participant / artwork boundary — body becomes design instrument
- Working installation, videoed demo
- Precursor thinking for "Design the Ambience" (same semester) — extended the gesture-to-diffusion idea into full ambient projection

## Links
- [Notion page (full write-up + all images)](https://www.notion.so/chentianle1117/Spectral-Facades-16a33d12d95a800e8b5cfb0632519488)
- [YouTube demo](https://youtu.be/EiQlJGqY754)
- Local: `W:\CMU_Academics\Fall 2024 CMU\Mapping and TouchDesigner\Assignment 3 Projection Mapping\`

## Images
*(Pull fresh from Notion via `/assets/.tools/fetch_images.py`)*
- `/assets/spectral-facades/hero.gif` — main demo loop
- `/assets/spectral-facades/meme-collage.png` — input texture
- `/assets/spectral-facades/stream-diffusion-weights.png` — prompt weighting diagram
- `/assets/spectral-facades/mediapipe-gestures.png` — gesture recognition output
- `/assets/spectral-facades/final-output.png` — installation still
