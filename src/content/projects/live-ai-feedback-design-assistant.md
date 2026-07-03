---
_hero_curated: true
artifacts: []
categories:
- Interactive Tool
- AI/ML
- Desktop App
collaboration_type: Design-Copilot team + Gati's MDes thesis support
course: 51-799 Graduate Design Independent Study
course_code: 51-799
david_personal_fork: chentianle1117/AI_Feedback_demo
david_personal_fork_url: https://github.com/chentianle1117/AI_Feedback_demo
github_primary: Design-Copilot/live_ai_feedack_react_electron
github_primary_url: https://github.com/Design-Copilot/live_ai_feedack_react_electron
github_upstream: GatiAher/live_ai_feedack_react_electron
github_upstream_url: https://github.com/GatiAher/live_ai_feedack_react_electron
hero_image: /assets/live-ai-feedback-design-assistant/cover.svg
images:
- /assets/live-ai-feedback-design-assistant/cover.svg
local_path: W:\CMU_Academics\2025 Spring\Independent Study gen Model\Live_AI_Feedback_Latest
priority: standard
publish: true
related_cards:
- '[[2025-Fall--semantic-canvas-thesis-tool]]'
role: technical-lead
semester: Spring 2025
slug: live-ai-feedback-design-assistant
stack:
- Electron
- React
- TypeScript
- Vite
- Google Gemini API
status: draft
summary: A real-time design feedback assistant that watches a designer's working canvas
  and surfaces relevant suggestions inline, using an open-vocabulary visual model
  and an LLM observer. Researches how AI critique can sit alongside the designer rather
  than interrupting them.
tags:
- electron
- react
- typescript
- gemini-api
- design-feedback
- tool-calling
- screen-sharing
- ai-critique
tags_active_branch: feature/transcription
team:
- Gati Aher (lead
- upstream)
- David Chen
team_size: 2
title: Live AI Feedback — Real-Time Design Critique Assistant
type: portfolio-project
year: 2025
---

> Electron desktop app that observes a designer's screen in real-time and delivers AI-powered critique via Google Gemini. A tool-calling architecture drives a structured feedback workflow: the AI asks setup questions, narrows focus, delivers critique, then summarizes — never free-associating. Built with Gati Aher for her MDes thesis work, continuing into David's independent study.

Most AI critics dump an unstructured blob of feedback. Live AI Feedback uses a **phased tool-calling workflow** — the AI calls specific tools (`ask_initial_questions`, `provide_feedback`, `request_summary`, `list_design_critiques`) at the right moments in a critique session, and it watches your screen via the desktop capture API so the feedback stays grounded in what you're actually working on right now.

This was 51-799 Graduate Design Independent Study, Spring 2025 — a continuation of upstream work with Gati Aher (MDes Design Studies). Gati is the original author of the system; I joined to extend it and productionize it during my own Independent Study, and the project lives under the "Design-Copilot" team org on GitHub.

**Three-repo topology:**
- **Upstream (Gati's original):** [`GatiAher/live_ai_feedack_react_electron`](https://github.com/GatiAher/live_ai_feedack_react_electron)
- **Active team fork (production):** [`Design-Copilot/live_ai_feedack_react_electron`](https://github.com/Design-Copilot/live_ai_feedack_react_electron)
- **David's earlier demo:** [`chentianle1117/AI_Feedback_demo`](https://github.com/chentianle1117/AI_Feedback_demo) (Fall 2024 era prototype)

## Approach

**Phased feedback workflow** (the core design move):
1. **User setup** — AI gathers context about the project, style, constraints
2. **AI introduction** — AI positions itself as reviewer (not co-designer)
3. **Element focus** — AI narrows attention to specific UI elements / design decisions
4. **Feedback delivery** — AI provides critique via `provide_feedback` tool call
5. **Summary** — AI consolidates observations via `request_summary` tool call

**Tool-calling architecture:**
- `ask_initial_questions` — structured setup phase
- `provide_feedback` — mid-session critique delivery
- `request_summary` — session wrap-up
- `list_design_critiques` — catalog of all feedback given

**Configurable feedback modes:** Random / Curated / Specific — lets the user set how the AI selects which design elements to review.

**Configurable focus areas:** Narrows AI attention to specific design dimensions (typography, color, hierarchy, etc.).

## Stack

- **Frontend:** Electron + React + TypeScript + Vite
- **Backend:** Google Gemini API (function-calling / tool-use)
- **Capture:** Electron desktop capture for screen sharing / screen recording the design being reviewed
- **Runtime:** Desktop (macOS + Windows); local-first

## Outcomes

- **Working Electron app** delivered + active branch (`feature/transcription` — adding voice/speech capabilities)
- **Multi-phase prompt engineering** — captured in the tool schemas + system prompt; a legitimate piece of engineering craft
- **Precedent for Semantic Canvas' AI-observer pattern** — Gemini here gives *critique*; Gemini in Semantic Canvas gives *insights* on a canvas. Same bounded-observer design philosophy.
- **Cross-student collaboration** — work contributes to Gati Aher's MDes thesis + David's Independent Study simultaneously

## Relationship to thesis

This project is the **earliest prototype of David's "AI as passive observer, not delegated actor" design philosophy**. The pattern — AI reads context, delivers structured insight, never decides or generates on its own — matured into the Gemini agent in [[2025-Fall--semantic-canvas-thesis-tool|Semantic Canvas]].

## Links

- **[Design-Copilot fork (active production)](https://github.com/Design-Copilot/live_ai_feedack_react_electron)**
- [Gati Aher upstream](https://github.com/GatiAher/live_ai_feedack_react_electron)
- [David's earlier demo](https://github.com/chentianle1117/AI_Feedback_demo)
- Local path: `W:\CMU_Academics\2025 Spring\Independent Study gen Model\Live_AI_Feedback_Latest\`
- Related older work locally: `ai-design-assistant/` (local Electron app, separate repo), `Live_API_repo/` (API exploration), `multimodal-live-api-web-console-main/` (reference implementation)

## Related cards

- [[2025-Fall--semantic-canvas-thesis-tool]] — the mature version of the AI-observer pattern

---

*Card built 2026-04-23 from Explore agent Spring 2025 scan. Light on images — desktop Electron app without prominent screenshots in the local folder. Screenshots to be added when David shares them.*