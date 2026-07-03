---
title: Job Search Copilot
slug: job-search-copilot
year: 2026
semester: Personal project
categories:
  - AI/ML
  - Interactive Tool
  - Agent
tags:
  - agents
  - automation
priority: standard
status: ready
publish: true
hero_image: /assets/job-search-copilot/cover.svg
images:
  - /assets/job-search-copilot/cover.svg
stack:
  - Multi-agent orchestration
  - Claude Code
  - Codex
  - Gemini
  - MCP
---

A multi-agent, provider-agnostic pipeline that runs a daily job search
end-to-end — discovery, matching, tailored cover letters, application tracking,
and a digest — built to take the grind out of a real job hunt.

## What it does

Every run, the system:

1. **Discovers** new postings across sources and normalizes them.
2. **Matches & scores** them against a target profile.
3. **Drafts a tailored cover letter** for the strongest picks.
4. **Files them** through per-platform application handlers.
5. **Verifies** its own output (an adversarial pass that catches hallucinated
   or low-quality drafts before anything ships).
6. **Delivers** a bilingual digest — email, a Telegram message, and an updated
   Notion tracker.

## The interesting part: provider-agnostic routing

The pipeline isn't tied to one model. A routing layer sends each step to
whichever engine fits — **Claude Code, Codex, or Gemini** — so cheap mechanical
steps and expensive judgment steps go to the right place, and the whole thing
survives any single provider rate-limiting or changing. It spans **three repos
and two knowledge-base vaults**, wired together with MCP tooling.

## Why I made it

I built it as a real tool for a real search, not a demo — which is exactly why
it's a good showcase of the engineering I care about: **agent orchestration,
provider-agnostic infrastructure, and adversarial self-verification** applied to
a messy, high-stakes workflow. *(Details generalized; built for a specific
person's search.)*
