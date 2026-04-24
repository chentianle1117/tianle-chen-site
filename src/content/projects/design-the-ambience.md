---
type: portfolio-project
title: "Design the Ambience: Expanding Realities Beyond the Screen with StreamDiffusion and MediaPipe"
slug: design-the-ambience
course: "48-652 Pixels Photons (Mapping & TouchDesigner) — Final"
course_code: 48-652
semester: "Fall 2024"
year: 2024
role: team-member
team_size: 4
team: [David Chen, Risa Xie, Carla, Leslie]
tags: [stream-diffusion, projection-mapping, mediapipe, touchdesigner, ambient-computing, human-computer-interaction]
categories: [Digital Interaction]
github: null
notion_url: https://www.notion.so/chentianle1117/Design-the-Ambience-Expanding-Realities-Beyond-the-Screen-with-StreamDiffusion-and-MediaPipe-16933d12d95a80f49375c88692b3d308
local_path: "W:\\CMU_Academics\\Fall 2024 CMU\\Mapping and TouchDesigner\\Final Project\\Final Project"
hero_image: /assets/design-the-ambience/hero.gif
images:
  - /assets/design-the-ambience/bio-cybernetic-predecessor.png
  - /assets/design-the-ambience/system-loop-flowchart.png
  - /assets/design-the-ambience/streamdiffusion-mediapipe.png
  - /assets/design-the-ambience/input-output-correlation.png
  - /assets/design-the-ambience/setup-monitor-camera.jpg
  - /assets/design-the-ambience/setup-user.jpg
  - /assets/design-the-ambience/trial-1-plants-grid.png
  - /assets/design-the-ambience/trial-1-projection-natural-extension.png
  - /assets/design-the-ambience/trial-2-urban-plan.png
  - /assets/design-the-ambience/trial-3-physarum-urban.png
video: https://www.youtube.com/watch?v=OAg5alXv8xY
video_iter1: https://youtu.be/_m71EAxqBdY
video_iter2: https://youtu.be/rtAv9rF6Qvg
artifacts:
  - "FINAL FILE SUBMISSION.toe"
  - StreamDiffusionTD-0.2.2.tox
  - detection_data.json
  - audio/
  - img/
  - movie/
  - 3d_blender/
priority: flagship
status: draft
publish: true
---
# Design the Ambience

> Extend human-computer interaction **beyond the screen** — project real-time generative visuals into the physical workspace, driven by cursor/keyboard/posture telemetry.

![hero](/assets/design-the-ambience/hero.gif)

## Hook
Your cursor speed, typing rhythm, posture, and live screen content get fed into StreamDiffusion via MediaPipe + TouchDesigner. The generated imagery is projection-mapped onto the user's body + workspace, creating a feedback loop where *the act of computing reshapes the ambient environment*.

## Context
**Course:** 48-652 Pixels Photons (Mapping & TouchDesigner) — final project, Fall 2024.
**Team:** David Chen, Risa Xie, Carla, Leslie.
**Builds on:** an earlier project (*Real-Time Coding Adventure of the Bio-Cybernetic System*) inspired by *Physarum Polycephalum* — this took that bio-cybernetic feedback loop and broke it out of the screen.

## Approach

**Computational pipeline:**
1. **Input capture** — `pyQt5` + `pynput` for cursor/keyboard; TouchDesigner for screen capture + human contour segmentation; DJI Osmo camera for body tracking
2. **OSC bridge** — Python data streams into TouchDesigner via OSC
3. **Stream Diffusion** — runs at ~16 fps on a predetermined text prompt, taking all inputs as conditioning
4. **Projection mapping** — CamShnapper maps human contour onto user's back; remaining visuals onto workspace

**Input mapping** (each input contributes a distinct visual role):
- **PC screen** → composition layout (window edges = architectural scaffolding)
- **Cursor** → colored square; size = cursor speed (becomes a "standout object")
- **Human contour** → large white area (foreground topology cue)
- **Keyboard typing speed** → crystallized texture overlay

**Equipment:** projector, laptops (input preprocessing), DJI Osmo, main PC for pipeline.

## Outcomes

**Three trials, three conceptual findings:**

1. **"Plant" prompt** — system reinterpreted window edges as architectural framing for plants; cursor morphed into a lamp; projection blended into real workspace as if a natural extension
2. **"Urban plan" prompt** — human contour became *negative space* shaping urban fabric; occasional perspective output from subtle composition shifts
3. **Physarum × urban plan** — bio-sim simulation trails became green spaces in generated cityscapes; emergent relationship between simulation + generated form

**Conceptual framing:** maps onto Nelson Goodman's *Ways of Worldmaking* — inputs decomposed, reweighted, reconstructed as visual worlds. Reframes generative AI from "automated output tool" to "responsive collaborator."

**Limitations flagged:**
- Projector fixed-focus issue (projections on body blurred)
- 514×514 StreamDiffusion output too low-res for large projections
- Camera failed human recognition when user wore white hat

## Further development potential
- Additional input modalities (lighting, temperature, sound)
- Output beyond visual (audio, tactile)
- Extended user studies on behavior change
- Design-workflow applications (embodied design instead of purely cognitive)

## Links
- [Notion page (full write-up, all images, references)](https://www.notion.so/chentianle1117/Design-the-Ambience-Expanding-Realities-Beyond-the-Screen-with-StreamDiffusion-and-MediaPipe-16933d12d95a80f49375c88692b3d308)
- [YouTube — main demo](https://www.youtube.com/watch?v=OAg5alXv8xY)
- [YouTube — iteration 1 (plants)](https://youtu.be/_m71EAxqBdY)
- [YouTube — iteration 2 (urban plan)](https://youtu.be/rtAv9rF6Qvg)
- [StreamDiffusion (dependency)](https://github.com/cumulo-autumn/StreamDiffusion)
- [MediaPipe-TouchDesigner (dependency)](https://github.com/torinmb/mediapipe-touchdesigner)
- Local: `W:\CMU_Academics\Fall 2024 CMU\Mapping and TouchDesigner\Final Project\Final Project\`

## References

Ashby, *Design for a Brain* · Beer, *Brain of the Firm* · Goodman, *Ways of Worldmaking* · Pask, *Conversation Theory* · Suchman, *Human-Machine Reconfigurations*.
