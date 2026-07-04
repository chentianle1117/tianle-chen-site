---
_hero_curated: true
artifacts:
- /assets/wire-bending/MasterQR.pdf
- /assets/wire-bending/recut piece 1106 [Converted].pdf
- /assets/wire-bending/recut piece 1106 [Converted] f.pdf
- 20241003_180350_HoloLens.mp4 (91MB, local only)
- 20241107_185059_HoloLens.mp4 (495MB, local only)
- 20241118_111306_HoloLens.mp4 (3.6GB, local only)
- wirebending button update 1017.mp4 (545MB, local only)
- Real Construction Details 1102 Rhino videos (3 variants, 2.5-2.8GB each, local only)
- 9_23_2024.obj (92MB mesh export, local only)
- 20+ Grasshopper .gh files (iteration: 0929, 1017, 1028, 1030, 1102)
- Rhino 3DM files (~17-22MB each)
categories:
- Mixed Reality
- Digital Fabrication
collaborators:
- Prof. Vernelle Noel
course: 48-736 Master Independent Study (research with Prof. Vernelle Noel / Fologram)
course_code: 48-736
gif_hero: /assets/wire-bending/bending-process.gif
github: null
hero_image: /assets/wire-bending/bending-process.gif
images:
- /assets/wire-bending/hololens-workflow-2.png
- /assets/wire-bending/full-installation.png
- /assets/wire-bending/hero.png
- /assets/wire-bending/hololens-workflow-1.png
- /assets/wire-bending/detail.png
image_captions:
- HoloLens view of the workbench — magenta target wireframe, teal current wire, and green gesture buttons (P/B toggles, "Part #0 / Bend #2" step readout) rendered in place over the physical desk.
- The Grasshopper definition, mapped — input-geometry organizer, the "Part to Wire-bending transfer" solver, and the Fologram interface module (part navigation + interactive gesture buttons).
- Fologram-in-HoloLens overlay at the bender — orange jig ghost registered to the physical tool, the bent-wire target, and the live "Total Length 594.2" readout beside the QR anchor.
- Top-down fabrication shot — bending steel wire by hand against the AR guide, with the manual radius bender, bolt cutters, and the printed QR spatial anchor on the bench.
- Built multi-part bent-wire form documented from the finished piece.
local_path: W:\CMU_Academics\Fall 2024 CMU\Fologram Research
notion_url: https://www.notion.so/chentianle1117/Wire-bending-Parametric-Workflow-with-Mixed-Reality-16933d12d95a818eafdad039f5f65990
priority: flagship
publish: true
role: research-assistant
semester: Fall 2024
slug: wire-bending
stats:
- value: "594.2"
  label: "wire length tracked"
- value: "190mm"
  label: "QR spatial anchor"
- value: "30°"
  label: "laser-cut jig angle"
status: ready
summary: A mixed-reality workflow for fabricating complex bent-wire forms by hand.
  A Grasshopper definition stays in live two-way sync with Microsoft HoloLens through
  Fologram, projecting the target geometry, per-bend angles, and step readouts onto
  the physical bench so a person bends steel wire to computational precision without
  robotic automation. CMU 48-736 research with Prof. Vernelle Noel.
tags:
- mixed-reality
- hololens
- grasshopper
- fologram
- digital-fabrication
- parametric-design
- craft
- interactive-fabrication
team_size: 2
title: Wire-bending Parametric Workflow with Mixed Reality
type: portfolio-project
year: 2024
---

> A mixed-reality workflow that lets a person bend steel wire to computational precision by hand. A Grasshopper definition stays in live two-way sync with a Microsoft HoloLens through Fologram, projecting the target form, per-bend angles, and step readouts directly onto the workbench. Interactive fabrication — computational precision with full hand agency, no robotic arm.

![hero](/assets/wire-bending/hero.png)

## What it is

**Mixed reality gives a human fabricator robot-grade precision** — without the robot. Bending a complex wire form by hand is hard to do accurately: there is no printed drawing to measure against in three dimensions, each bend compounds the error of the last, and a multi-part structure means keeping track of which segment and which bend you are on. The usual computational answer is to hand the geometry to a robot. This project takes the other path: keep the person as the fabricator, and use mixed reality to give them the precision a robot would have.

The workflow puts a **Grasshopper** parametric definition in continuous, two-way sync with a **Microsoft HoloLens** through **Fologram** (the Rhino/Grasshopper-to-HoloLens plug-in). The HoloLens draws the target wireframe, the current wire, the bender jig, per-bend angles, and running readouts *in place* on the physical bench. The fabricator bends the wire to match the overlay and air-taps to advance to the next bend. Editing the Grasshopper definition updates what they see live; advancing a step at the bench feeds state back into the definition. It is a loop, not a one-way export.

This was Independent Study research (48-736, Fall 2024) with Prof. Vernelle Noel, whose work centers on craft, making, and computational design — so the framing question was deliberately not "how do we automate the maker away" but "how do we give the maker computational precision while keeping the craft in their hands."

## The round-trip: HoloLens ↔ Grasshopper ↔ fabrication

<figure class="diagram">
  <img src="/assets/wire-bending/architecture.svg" alt="System diagram of the wire-bending mixed-reality workflow: a Grasshopper parametric definition (input-geometry organization, part-to-wire-bending transfer, and Fologram interface module) syncs bidirectionally through Fologram to a HoloLens overlay on the bench (target wireframe, step readouts, gesture buttons), which guides hand fabrication at a manual radius bender registered to a printed QR spatial anchor; advancing a step at the bench loops state back to the definition." />
  <figcaption>The fabrication loop — Grasshopper defines and sequences the bends, Fologram bridges the definition to the HoloLens, the overlay guides the hand at the bench, and gesture input advances the model without leaving the tool.</figcaption>
</figure>

![HoloLens workflow](/assets/wire-bending/hololens-workflow-2.png)

### 1 · The Grasshopper definition

The Grasshopper side is organized into three parts (documented in the workflow export):

- **Input geometry organization & reorientation** — takes the input curves, sorts them into a consistent order, and regularizes them into a clean, bend-ready wireframe. This is the housekeeping that makes everything downstream deterministic.
- **Part → wire-bending transfer** — the core solver. It segments the form into *parts*, and for each part turns the geometry into an ordered sequence of bending instructions: a straight run, then a bend of a given angle, and so on. Bend radius is solved against the physical RadiusBender tool so the instructions match what the bench hardware can actually produce.
- **Fologram interface module** — the AR UI, split into part/bend-index navigation and the static-plus-interactive display. It owns the gesture-button logic and the readouts that get pushed into the headset.

The definition went through a long iteration trail across the semester (September through November 2024 `.gh` revisions), from an early `wire bending draft` to the `Master_fologram` line and, finally, a `construction details` version tuned for a real built piece.

### 2 · Fologram as the bridge

Fologram is what makes this a live workflow rather than a print-and-follow exercise. It streams the Grasshopper geometry, text, and interactive UI straight into the HoloLens with no export step, and it carries interaction back the other way — so a gesture in the headset can drive the Grasshopper definition. Crucially, Fologram registers the digital coordinate system to the real world through a printed QR marker: the project's `MasterQR` anchor is specified at **190 mm**, placed at origin (0, 0, 0), in millimeters. Placing that sheet on the bench pins Grasshopper's world origin to a known physical point, which is why the overlay lands on the actual tool instead of floating.

### 3 · The overlay on the bench

Through the headset the fabricator sees the digital model composited onto the real desk. In the captured HoloLens footage the layers read as:

- magenta — the target wireframe (the form to build),
- teal — the current wire being worked,
- orange — the bender-jig geometry, locked onto the physical bending tool,
- green — the interactive HUD: gesture buttons and step markers.

Text readouts are rendered in place too — the footage shows a live **"Total Length 594.2"** measurement and step labels like "Part #0 · Bend #2" / "Part #2 · Bend #3", so the fabricator always knows exactly which segment and bend they are on and how much wire the piece consumes.

![Fologram overlay at the bender](/assets/wire-bending/hololens-workflow-1.png)

### 4 · Hands-free control

Because both hands are on the wire, the interface is driven by HoloLens air-tap gestures rather than a keyboard. On-screen buttons — P / B toggles plus next/previous controls — step through parts and bends. Advancing a bend updates the overlay to the following segment; the fabricator never has to walk back to the laptop mid-piece.

### 5 · Manual fabrication

The wire is bent by hand at a manual radius bender on the bench, cut to length with bolt cutters, using a laser-cut angle jig for repeatable geometry. One jig detail in the sources is dimensioned at **30°** with a 2.70 / 2.18 / 0.42 proportion and a bolt hole (`recut piece 1106`, nested four-up for laser cutting). The fabricator reads the next angle and length off the HUD, bends to the magenta target, checks the fit against the overlay, and air-taps to the next step.

![bending process](/assets/wire-bending/bending-process.gif)

![detail](/assets/wire-bending/detail.png)

## My contribution

As the research assistant on this study I built the Grasshopper-and-Fologram side of the system: the input-geometry organizer, the part-to-wire-bending transfer solver, and the Fologram interface — the gesture-button logic and in-headset readouts (total length, part index, bend index) that make the overlay usable with both hands occupied. I set up the QR spatial-anchor registration so the overlay locks to the bench, iterated the definition across the semester's `.gh` revisions toward a version that drove a real built piece, and documented the workflow through HoloLens capture (October–November 2024).

## Outcomes

- A working **interactive-fabrication** pipeline: computational precision (sequenced bends, solved angles, tracked total length) delivered through hand-made construction, with no robotic arm in the loop.
- A true two-way loop — editing the Grasshopper definition updates the AR overlay live, and bench-side gestures advance the model — rather than a one-way "generate and hand off."
- Extensive HoloLens video documentation of the full bench workflow (Oct–Nov 2024), plus a `construction details` definition taken far enough to fabricate a real multi-part bent-wire form.
- A concrete argument, aligned with Prof. Noel's research, for mixed reality as a bridge between computational design and traditional craft — keeping the maker's agency instead of designing it out.

**Toolchain:** Rhino 8 · Grasshopper · Fologram · Microsoft HoloLens · manual RadiusBender + laser-cut jig. Independent Study (48-736), Fall 2024, with Prof. Vernelle Noel.

## Links

- [Notion page](https://www.notion.so/chentianle1117/Wire-bending-Parametric-Workflow-with-Mixed-Reality-16933d12d95a818eafdad039f5f65990)
- Local: `W:\CMU_Academics\Fall 2024 CMU\Fologram Research\`

## Related cards

- [[2024-Fall--synthetic-texture-deterioration]] — parallel 48-736 Independent Study work