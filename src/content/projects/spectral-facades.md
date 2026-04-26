---
_hero_curated: true
artifacts:
- /assets/spectral-facades/cube.pdf
- /assets/spectral-facades/1121 movie demo.mp4
- /assets/spectral-facades/mapping screenshot.png
- /assets/spectral-facades/screenshot.jpg
- /assets/spectral-facades/test1.png
- /assets/spectral-facades/papercube-test.png
- W:\CMU_Academics\Fall 2024 CMU\Mapping and TouchDesigner\Assignment 3 Projection
  Mapping\touch designer final project video.mp4 (174MB, not in vault)
- papercube.fbx + papercube1.fbx
- .toe TouchDesigner files (147KB)
categories:
- Projection Mapping
- Digital Interaction
course: 48-652 Pixels Photons (Mapping & TouchDesigner)
course_code: 48-652
gif_hero: /assets/spectral-facades/hero.gif
github: null
hero_image: /assets/spectral-facades/hero.gif
images:
- /assets/spectral-facades/screenshot.jpg
- /assets/spectral-facades/mapping screenshot.png
- /assets/spectral-facades/final-output.png
- /assets/spectral-facades/mediapipe-gestures.png
- /assets/spectral-facades/meme-collage.png
- /assets/spectral-facades/stream-diffusion-weights.png
- /assets/spectral-facades/papercube-test.png
- /assets/spectral-facades/test1.png
local_path: W:\CMU_Academics\Fall 2024 CMU\Mapping and TouchDesigner\Assignment 3
  Projection Mapping
notion_url: https://www.notion.so/chentianle1117/Spectral-Facades-16a33d12d95a800e8b5cfb0632519488
priority: standard
publish: true
role: team-member
semester: Fall 2024
slug: spectral-facades
status: ready
tags:
- projection-mapping
- stream-diffusion
- mediapipe
- gesture-control
- interactive-installation
- generative-ai
team:
- David Chen
- Risa Xie
- Carla
- Leslie
team_hierarchy: flat (no group leader)
team_size: 4
title: Spectral Facades
type: portfolio-project
video: /assets/spectral-facades/1121 movie demo.mp4
year: 2024
---

> An interactive media installation that lets a viewer sculpt architectural façades in real time using body posture and hand gestures. Stream Diffusion interpolates between two contrasting façade styles — modernist vs. radically decayed — while generative audio tracks the transition.

![hero](/assets/spectral-facades/hero.gif)

Spectral Facades merges two distinct façade styles — one modern, the other radically deteriorated — into a continuous spectrum that the viewer can control using body posture (specifically the Y-position of the tip of the nose) and hand gestures (open palm vs. closed palm). The installation blurs the boundary between participant and artwork: the viewer's presence and movement directly shape the diffusion weights and iteration counts driving the synthesized image.

## Concept & inspiration

### Two contrasting façades
The piece transitions between a sleek, modernist style and a "Bilbo-looking" dystopian façade. For the modern façade we drew inspiration from *Walden 7*, designed by the modernist architect Ricardo Bofill — a bold, geometric style that contrasts starkly with the heavily decayed, fantastical aesthetic of the other façade.

### Human posture & gesture inputs
The primary input controlling the transition is the viewer's nose height (the Y position of the tip of the nose). By moving closer or farther, or by altering posture, participants shift the façade toward either the modern or the deteriorated state. We also incorporated **hand gestures**:
- **Open palm** — reduces the "strength" of the diffusion prompt, making the output more faithful to the original input images
- **Closed palm** — increases the prompt's influence, pushing the rendered result closer to the fully synthesized façade style

### Generative sound & volume
Each façade style has its own musical layer. As viewers shift between open- and closed-palm gestures, the audio transitions alongside the imagery — volume levels track the active façade stage, so sonic and visual change are coupled.

## Process & implementation

### 1. Input image textures
We started by collecting a series of internet memes and blending them into a single cohesive texture (a collage). This meme collage is then mapped onto a physical paper-cube model as a base input. A separate "basic façade" texture is also prepared, representing the modern and deteriorated states.

![meme collage](/assets/spectral-facades/meme-collage.png)

### 2. Stream Diffusion module
We use what we refer to as *stream diffusion* to synthesize new façade images. Two prompts are fed into the diffusion model simultaneously — one capturing the modernist Walden 7 aesthetic, the other capturing a deteriorated, dystopian façade.

**Weighted prompts:** we dynamically adjust the weighting of each prompt in real time, based on posture and gesture data. This allows the final synthesized façade to morph fluidly between the two extremes rather than snap between discrete states.

![stream diffusion weights](/assets/spectral-facades/stream-diffusion-weights.png)

### 3. Gesture & posture control
- **Nose tracking** — a simple face-tracking algorithm locates the tip of the nose and uses its Y position to set the interpolation value between the two façade states
- **Open/closed palm** — a hand-tracking system detects gestures that modify how many diffusion steps are run for each frame. Closing the palm increases the prompt's effect (pushing the façade style further); opening the palm reduces it (preserving more of the original texture)

![MediaPipe gestures](/assets/spectral-facades/mediapipe-gestures.png)

### 4. Real-time output
As the participant moves and changes hand gestures, the system immediately updates both the synthesized image and the soundtrack. The final images appear on a screen (or projection), showcasing an evolving façade that shifts from crisp modern geometry to fantastical decaying structures.

![final output](/assets/spectral-facades/final-output.png)

## Outcome & significance

Spectral Facades demonstrates how generative AI can be used in real-time, interactive installations. By mapping human gestures and posture to diffusion weights and iteration counts, it blurs the boundary between participant and artwork — viewers *sculpt* architectural aesthetics on the fly. The approach offers a glimpse into a kind of generative media where human presence and embodied interaction directly shape design outputs rather than prompts alone.

## Context

**Course:** 48-652 Pixels Photons (Mapping & TouchDesigner), Fall 2024.
**Team of 4 (flat — no group leader):** David Chen, Risa Xie, Carla, Leslie.
**Prompt:** projection-mapping assignment — control-surface for interactive architectural imagery.

## Links

- [Notion page](https://www.notion.so/chentianle1117/Spectral-Facades-16a33d12d95a800e8b5cfb0632519488)
- [YouTube demo](https://youtu.be/EiQlJGqY754)
- Local: `W:\CMU_Academics\Fall 2024 CMU\Mapping and TouchDesigner\Assignment 3 Projection Mapping\`

## Related cards

- [[2024-Fall--design-the-ambience]] — same team, same semester, same course — follow-up final project that extended the gesture-to-diffusion approach from a single screen into full ambient projection