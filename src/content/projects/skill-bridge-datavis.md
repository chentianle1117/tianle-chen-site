---
type: portfolio-project
title: "Skill-Bridge Data Visualization Interface"
slug: skill-bridge-datavis
course: "05-619 Data Visualization"
course_code: 05-619
semester: "Fall 2024"
year: 2024
role: team-member
team_size: 2
team: [David Chen, Risa Xie]
tags: [d3, svelte, data-visualization, job-market, linkedin, edge-bundling, geomap]
categories: [Interface Design, Data Visualization]
github: chentianle1117/Skill-Bridge-DataVis
github_url: https://github.com/chentianle1117/Skill-Bridge-DataVis
live_url: https://chentianle1117.github.io/Skill-Bridge-DataVis/
notion_url: https://www.notion.so/chentianle1117/Skill-Bridge-Data-Visualization-Interface-16a33d12d95a804f89f2cb345dac1b3d
local_path: "W:\\CMU_Academics\\Fall 2024 CMU\\Data Visualization\\Skill-Bridge-DataVis"
hero_image: /assets/skill-bridge-datavis/dashboard.gif
images:
  - /assets/skill-bridge-datavis/circular-skill-job-linkage.png
  - /assets/skill-bridge-datavis/batch-selectable-connections.png
  - /assets/skill-bridge-datavis/geomap-tech.png
  - /assets/skill-bridge-datavis/geomap-design.png
  - /assets/skill-bridge-datavis/salary-by-subcategory.png
  - /assets/skill-bridge-datavis/tech-applications.png
  - /assets/skill-bridge-datavis/design-applications.png
  - /assets/skill-bridge-datavis/salary-distribution-tech.png
  - /assets/skill-bridge-datavis/salary-distribution-design.png
  - /assets/skill-bridge-datavis/integrated-dashboard.png
artifacts:
  - /assets/skill-bridge-datavis/final-report.pdf
  - /assets/skill-bridge-datavis/presentation.pdf
  - /assets/skill-bridge-datavis/Project Thumbnail.png
  - /assets/skill-bridge-datavis/Presentation 1.png
  - /assets/skill-bridge-datavis/Presentation 2.png
  - /assets/skill-bridge-datavis/Presentation 3.png
  - /assets/skill-bridge-datavis/Presentation 4.png
  - Svelte/Vite project
  - D3.js visualizations
  - LinkedIn 2023 job postings dataset
priority: flagship
status: draft
publish: true
---
# Skill-Bridge Data Visualization Interface

> An interactive dashboard comparing tech vs. design job markets — revealing how skill requirements, salaries, and remote availability interplay across geography. Built for cross-field job seekers navigating the transition.

![dashboard](/assets/skill-bridge-datavis/dashboard.gif)

## Hook
We scraped LinkedIn 2023 job postings, extracted skill keywords, categorized into 9 skill groups × 23 job categories, and built three linked visualizations: **circular skill-job edge bundling**, **geomap by role type**, and **salary/applications distributions**. Hover a node, see every connected job, salary, and location update live.

**[Live demo](https://chentianle1117.github.io/Skill-Bridge-DataVis/)**

## Context
**Course:** 05-619 Data Visualization, Fall 2024.
**Team:** David Chen + Risa Xie. Inspired by Risa's journey as design-to-tech transitioner (David shared similar background).
**Stack:** Svelte + D3.js + LinkedIn 2023 job dataset.

## Approach

**Data pipeline:**
- Scraped + cleaned LinkedIn 2023 postings
- Keyword-based skill extraction with consistent mapping
- 9 overarching skill groups (Data Analysis, Programming, ...) × 23 job categories (Cloud DevOps, Software Engineer, Product Management, ...)

**Three linked views:**
1. **Circular edge bundling** (Risa's lead) — skills ↔ job categories with dense vs. sparse links revealing which roles are skill-diverse
2. **Geomap** (David's lead) — remote vs. non-remote distribution on a US map, separate views for tech and design
3. **Salary + applications** — bar charts, distribution plots, quartiles by subcategory

**Integrated dashboard** — all three views linked; hovering a node filters the others. Intentionally keeps surface simple; deep drill-down lives in hover/multi-select.

## Key findings

1. **Skill diversity varies drastically** — Software Engineer demands both tech *and* design skills (dense network); Interior Design is almost pure-design (sparse). Tech fields have higher skill differentiation (20+ framework variants) than design (few dominant tools like Adobe, Figma).

2. **Remote availability + geography** — tech jobs dominate totals and offer >50% remote; design <25% remote, some categories 0%. Tech concentrated east/west coasts; design spread further into Midwest + smaller cities.

3. **Salaries + competition** — tech tops out over $600K, most cluster around $150K; design caps ~$300K, majority under $100K. Tech roles can see 500+ applicants; design roles rarely exceed 50.

## Design decisions

- **Color coding** — tech (blue) / design (pink) across all views for instant identification
- **Interactive link generation** — hover/multi-select to focus; only high-level categories on default render to avoid overflow
- **Integrated dashboard** — salary × location × skills × roles all linked; macro clarity + micro depth

## Reflection
Original plan (long-term trend analysis) shifted to single-year high-quality dataset due to data gaps. Future: unified global design + reusable components earlier; deeper Svelte/D3 for more efficient collaboration.

## Links
- **[Live demo](https://chentianle1117.github.io/Skill-Bridge-DataVis/)**
- [GitHub repo](https://github.com/chentianle1117/Skill-Bridge-DataVis)
- [Notion page (full findings + all images)](https://www.notion.so/chentianle1117/Skill-Bridge-Data-Visualization-Interface-16a33d12d95a804f89f2cb345dac1b3d)
- Local: `W:\CMU_Academics\Fall 2024 CMU\Data Visualization\Skill-Bridge-DataVis\`
