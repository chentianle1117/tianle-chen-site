---
_hero_curated: true
artifacts:
- First-Sprint-Log.txt
- Product-Backlog.txt
categories:
- Web App
- 3D Visualization
- Data Engineering
course: 17-637 Web Application Development — Team Project
course_code: 17-637
data_source: Google Scholar
github: null
github_note: GitHub repo lost per David (was chentianle1117/s25_team_26 per inventory,
  but not accessible / deleted). Local files are the source of truth.
hero_image: /assets/s25-team-26-paper-viz/img-1.webp
images:
- /assets/s25-team-26-paper-viz/img-1.webp
local_path: W:\CMU_Academics\2025 Spring\17637 Web App Dev\s25_team_26
priority: standard
publish: true
role: team-member
semester: Spring 2025
slug: s25-team-26-paper-viz
sprint_roles:
- David Chen — Product Owner role on First Sprint (sprint-level responsibility, not
  team lead)
- Graham — Data Scraping & Database
- Sheen — UI/UX Prototyping
stack_backend:
- Django
- SQL/PostgreSQL
- Python
stack_frontend:
- Three.js
- JavaScript
status: draft
tags:
- django
- threejs
- python
- postgresql
- data-visualization
- research-discovery
- citation-networks
- academic-search
team:
- David Chen
- Graham
- Sheen
team_hierarchy: flat (no group leader — Agile sprint roles were distributed, not hierarchical)
team_size: 3
title: Dynamic 3D Research Paper Visualization Platform
type: portfolio-project
year: 2025
---

> Browse academic research as a 3D landscape rather than a flat list. Papers positioned by metadata (year, citations, length); filter by topic; visualize citation networks; save + collect papers per user. Team project for Web App Dev, Spring 2025 — David as Product Owner.

![hero](/assets/s25-team-26-paper-viz/hero.png)

## Hook
Academic search UIs are flat: a list of titles + abstracts, ordered by relevance. What if research discovery were *spatial* — papers as 3D objects you fly through, with citation edges connecting them, and year/citation-count/length driving position + size? Team 26's Web App Dev final project builds exactly that.

## Context

**Course:** 17-637 Web Application Development, Spring 2025 — team final project.
**Team of 3 (flat — no group leader).** Sprint roles were distributed Agile-style, not hierarchically:
- **David Chen** (`davich2`) — held the Product Owner sprint role: scope, sprint planning, product backlog
- **Graham** — Data Scraping & Database
- **Sheen** — UI/UX Prototyping

The "Product Owner" title is a sprint-level responsibility label (standard Scrum role), not a team-leadership designation — work division was peer-to-peer.

**Planning artifacts in repo:**
- `First-Sprint-Log.txt` — sprint roles, objectives, acceptance criteria
- `Product-Backlog.txt` — full feature list

## Product backlog (from First-Sprint-Log)

- **3D paper visualization** driven by metadata: year, citation count, paper length
- **Filtering** by topic / field / date range
- **Citation network visualization** — edges between cited/citing papers
- **User accounts** — login / signup / per-user persistence
- **Paper collections** — save papers into user-curated sets
- **Search** — query by title / author / abstract
- **Detail view** — full paper metadata, abstract, citation list

## Stack

- **Backend:** Django + SQL (likely PostgreSQL) + Python
- **Frontend:** Three.js for 3D visualization + vanilla JS for app logic
- **Data source:** Google Scholar (scraped — Graham's responsibility)
- **Auth:** Django auth (standard session-based)

## Status

**In-progress as of scan.** Only the Sprint 1 planning documents are detailed in the repo — README is a 1-line summary. Team roles + backlog set; implementation was underway.

**David — confirm status:**
- Did this project ship by end of semester?
- Is there a demo deployment (Heroku / Railway / EC2)?
- Final presentation slides?

## Links

- **GitHub repo lost** per David (previously `chentianle1117/s25_team_26`). This card is a placeholder based on local files until the repo is recovered or the project is reconstructed.
- Local path: `W:\CMU_Academics\2025 Spring\17637 Web App Dev\s25_team_26\`
- Related local folder: `Web-Dev-Paper-Visualizer/` (appears to be an older mirror/backup; contains `s25_team_26` subfolder)

## Related cards

- [[2024-Fall--skill-bridge-datavis]] — David's prior data-viz team project (same David-plus-partner pattern, different domain)
- [[2025-Fall--semantic-canvas-thesis-tool]] — thematic sibling (both are "flatten → spatialize" visualizations)

---

*Card built 2026-04-23 from Explore agent Spring 2025 scan. Status marked `draft` pending David's confirmation that this project shipped. If it did, add final demo URL + screenshots.*