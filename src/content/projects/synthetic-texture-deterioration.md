---
_hero_curated: true
artifacts:
- /assets/synthetic-texture-deterioration/progress-report.pdf
- Svelte/Vite web UI (App.svelte + CaptureArea/AnalysisResults/TextureList components)
- FastAPI WebSocket backend (main.py)
- screen_capture.py (pyautogui region capture)
- texture_analysis.py (Ollama Llama 3 description + regex extraction)
- Teachable Machine Keras classifier (.h5, sliding-window + NMS)
- start_app.py (launches backend + frontend)
categories:
- Interface Design
course: 48-736 Master Independent Study
course_code: 48-736
github: chentianle1117/real-time-texture-analyzer
github_url: https://github.com/chentianle1117/real-time-texture-analyzer
hero_image: /assets/synthetic-texture-deterioration/facade-aging-2.png
images:
- /assets/synthetic-texture-deterioration/facade-aging-1.png
- /assets/synthetic-texture-deterioration/facade-aging-3.png
- /assets/synthetic-texture-deterioration/facade-aging-4.png
local_path: W:\CMU_Academics\Fall 2024 CMU\Independent Study\new-texture-analyzer
notion_url: https://www.notion.so/chentianle1117/Synthetic-Tool-for-Visualizing-Texture-Deterioration-16933d12d95a81dfbb4ad317fa136701
priority: experimental
progress_report: /assets/synthetic-texture-deterioration/progress-report.pdf
publish: true
semester: Fall 2024
slug: synthetic-texture-deterioration
status: ready
summary: A working real-time prototype captures a live architectural render off-screen,
  classifies the material with a sliding-window model, and asks a local vision LLM to
  describe it and estimate its age — treating facade weathering as a design input. A
  second, exploratory interface aimed to synthesize the aged version via
  ControlNet-conditioned diffusion; honest work-in-progress from Fall 2024.
image_captions:
- "System architecture I diagrammed: a real-time analysis interface (screen capture → Teachable Machine classifier → Llama 3 description) feeding a second, exploratory ComfyUI/ControlNet synthesis interface."
- "User-action flow chart: WebSocket handshake, set-capture-area, then the capture → analyze → log state machine with reconnect and abort paths."
- "Front- and back-end code: the Svelte WebSocket client and the Python routine that streams a Llama 3 description from Ollama and regex-extracts material, surface, and age."
tags:
- generative-ai
- material-aging
- architectural-facades
- weathering
- interface-design
- controlnet
- svelte
title: Synthetic Tool for Visualizing Texture Deterioration
type: portfolio-project
year: 2024
---

> Most generative models render architecture as it looks the day it opens — pristine, unweathered, out of time. This independent study asked the opposite question: *can a designer see how a facade will age before it's built, and treat that weathering as a design input rather than a render afterthought?* What I actually shipped is a real-time texture-analysis prototype; the aging-synthesis half stayed a designed-but-unbuilt second interface. This page documents both honestly.

## The problem

Current text-to-image and diffusion pipelines are very good at "new-looking" surfaces and weak at plausible decay. The progress report frames the gap directly: models "predominantly focus on generating pristine, 'new-looking' textures for architectural presentations, neglecting the critical aspect of how materials age due to environmental exposure." Where AI *does* simulate aging — human faces, for instance — architectural materials like stone, brick, and metal get "overly simplistic or stereotypical depictions of wear."

For an architect that's a real blind spot. Material choice is partly a bet on time: how a timber rainscreen greys, how a copper panel oxidizes, how a north-facing wall grows biofilm. The intent here was a tool that folds that bet into the design loop — so weathering becomes something you can anticipate and steer, not discover a decade later.

## What I built vs. what I explored

The system was scoped as two interfaces. I want to be precise about which one runs.

| Interface | What it does | Status |
|---|---|---|
| **1 — Real-time analysis** | Captures a live render off-screen, classifies the material, and asks a vision LLM to describe it and estimate its age | **Working prototype** |
| **2 — Deterioration synthesis** | Takes the detected material + target age and generates the aged texture via ControlNet-conditioned diffusion | **Explored / not integrated** |

<figure class="diagram">
  <img src="/assets/synthetic-texture-deterioration/architecture.svg" alt="Two-interface pipeline: a working real-time loop (render → screen capture → sliding-window classifier → NMS → Ollama Llama 3 description → regex extraction → Svelte UI) handing detected material and age to an explored synthesis interface (decay parameters → ControlNet Depth/Canny conditioning → Flux/ComfyUI diffusion → before/after aged facade), with an honest status footer." />
  <figcaption>The full system as scoped. The top lane shipped as a working prototype; the bottom lane — generative synthesis — stayed a design.</figcaption>
</figure>

![System architecture diagram](/assets/synthetic-texture-deterioration/facade-aging-1.png)

## Interface 1 — the real-time analysis loop (built)

The working prototype reads a facade *as it's being rendered*. Instead of an upload form, it runs as a floating window over design software (in the demo, V-Ray's frame buffer) and captures the render output live. The idea was zero friction: keep working in your renderer, and a side panel keeps telling you what it's looking at.

**Capture.** A Python backend grabs a user-defined screen region (`pyautogui` / PIL `ImageGrab`) in a roughly 10 fps loop and streams JPEG frames to the browser.

**Detection.** Each frame runs through a sliding-window classifier — a model I trained and exported from Google's Teachable Machine, loaded as a Keras `.h5`. It sweeps two window scales (224×224 and 448×448) at stride 112, keeps windows classified as the target material above 0.7 confidence, and merges overlapping hits with non-maximum suppression (IoU 0.5) into clean bounding boxes.

**Description.** Each detected region is sent to a locally-served vision LLM (Llama 3 via Ollama) with a set prompt — *"Describe the texture concisely, including material, surface quality, and estimated age in years."* The free-text reply is then parsed with regex into three structured fields:

```python
material = re.search(r'(wood|stone|rock|concrete|metal|fabric|plastic)', desc, re.I)
surface  = re.search(r'(smooth|rough|polished|weathered|eroded|textured|patterned)', desc, re.I)
age      = re.search(r'(\d+)\s*(years?)', desc, re.I)   # -> "5 years"
```

**Feedback.** Results land in a Svelte/Vite UI — a live preview with drawn bounding boxes plus a running "captured textures" table grouped by material (e.g. *vertical wood strips · smooth · 5 years*). Front-end and back-end talk over a single WebSocket: the browser sends control commands (`set_capture_area`, `start`/`stop_capture`, `start`/`stop_analysis`, `abort`) and the server streams back frames, boxes, and analysis results, with automatic reconnect.

![Running prototype — Texture Analyzer over a V-Ray render](/assets/synthetic-texture-deterioration/facade-aging-2.png)
![User-action flow chart](/assets/synthetic-texture-deterioration/facade-aging-3.png)
![Front- and back-end code snippets](/assets/synthetic-texture-deterioration/facade-aging-4.png)

**Stack:** Svelte 4 + Vite frontend (`lucide-svelte`); FastAPI + `uvicorn` backend over WebSocket; TensorFlow/Keras classifier; OpenCV + NumPy + Pillow for image handling; Ollama-hosted Llama 3. A `start_app.py` launches backend and `npm run dev` frontend together.

## Interface 2 — deterioration synthesis (explored, not integrated)

The second interface is the one the project is *named* for, and it's the one I did not finish. The plan: take the detected material class, site/exposure context (moisture, sunlight, pollution), and a target age, and generate the aged version of the same facade — preserving geometry so it reads as the *same* building, older.

The intended machinery, from the report's references and my architecture diagram:

- **ControlNet** conditioning (Depth + Canny) to hold the facade's structure fixed while only the surface weathers, driven through a ComfyUI graph running Flux ControlNet workflows.
- A result-evaluation loop comparing generated aged textures against real-world weathering references.
- Output surfaced back in the Svelte UI as a before/after pair with a "deteriorated years" control.

This lane produced a design, workflow references, and a mock in the UI — not a working generator. Calling it "integrated" would overstate the semester's result.

## What went wrong — and what that taught me

The progress report's reflections are the most useful part of this project, so I'm keeping them intact rather than polishing them away:

- **Local vision LLMs were impractical.** Running Llama 3 with real image-recognition capability locally needs far more compute than my machine had; the on-device vision path was "largely unsuccessful." The documented next step was moving inference to Azure (Llama 3.2 11B Vision-Instruct) rather than fighting local resource limits.
- **Single-texture ceiling.** Detection handled one material class at a time (wood in the demo). Real facades are multi-material, so the honest fix is a segmentation + classification stage *before* description — not a bigger prompt.
- **The web UI wasn't the right shell.** A browser window floating over a renderer proved less intuitive than a dedicated local application would have been.
- **The core blocker was data, not models.** There is no readily available *labeled* dataset of deteriorated architectural textures, and procedural attempts (Blender, diffusion) didn't reach a "scientifically plausible" bar for how materials actually age. That gap — not the generator — is what kept Interface 2 from shipping.

I read into adjacent work while scoping this: T2D2's facade damage-detection framework, academic texture-analysis theses, and the classic *Synthesizing Time-Varying Weathered Textures* line of graphics research — enough to conclude that scientifically grounded weathering is its own hard research problem, not a prompt-engineering one.

## Honest status

This is exploratory work, and I'm presenting it as such. The **premise holds up** — predictive material weathering as a design input rather than a post-hoc render effect — and the analysis interface genuinely runs. The synthesis interface does not, and the reasons why (compute, single-class detection, missing labeled data, plausibility of procedural aging) are documented rather than hidden. I'm keeping the card because the framing and the failure modes are worth revisiting in later thesis and material research, and because "here's exactly where it broke" is more useful to a reader than a polished demo of a thing that half-worked.

Solo work for 48-736 Master Independent Study, Fall 2024. Full progress report at `/assets/synthetic-texture-deterioration/progress-report.pdf`.

## Links

- [GitHub repo: real-time-texture-analyzer](https://github.com/chentianle1117/real-time-texture-analyzer)
- [Notion page](https://www.notion.so/chentianle1117/Synthetic-Tool-for-Visualizing-Texture-Deterioration-16933d12d95a81dfbb4ad317fa136701)
- Local: `W:\CMU_Academics\Fall 2024 CMU\Independent Study\new-texture-analyzer\`
- Progress report (in vault): `/assets/synthetic-texture-deterioration/progress-report.pdf`

## Related cards

Part of the Fall 2024 "deterioration" cluster — three different lenses on the same theme:

- [[2024-Fall--a-game-of-deterioration]] — game-simulation lens
- [[2024-Fall--spectral-facades]] — installation lens