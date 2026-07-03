---
title: Job Search Copilot
slug: job-search-copilot
summary: "A multi-agent, provider-agnostic system that runs a real job search end-to-end — discovery, résumé + cover tailoring, an adversarial LLM audit, and ATS form submission — engineered around one rule: never ship a lower-quality application to work around a technical limit."
year: 2026
semester: Personal project
categories:
  - AI/ML
  - Interactive Tool
  - Agent
tags:
  - agents
  - automation
  - orchestration
priority: standard
status: ready
publish: true
hero_image: /assets/job-search-copilot/cover.svg
images:
  - /assets/job-search-copilot/cover.svg
stack:
  - Multi-agent orchestration
  - Claude Code / Codex / Gemini
  - Python (Patchright browser automation)
  - MCP
---

A production-grade, multi-agent system that runs a real job search end-to-end —
discovery, résumé + cover tailoring, quality auditing, ATS form submission, and
a review dashboard — built and run nightly for an actual, high-stakes search. It
is engineered around one hard rule: **zero quality degradation.** A technical
limitation is never an excuse to ship a worse application.

## Architecture

<figure class="diagram">
  <img src="/assets/job-search-copilot/architecture.svg" alt="Job Search Copilot architecture — provider router, 8-stage pipeline, Opus auditor, 8 mechanical gates, 5-lane routing, ATS handlers, and an outcomes learning loop" />
  <figcaption>Provider router → 8-stage pipeline → Opus auditor → 8 mechanical gates → 5-lane routing → ATS submit → outcomes learning loop.</figcaption>
</figure>

Three git repos + two personal knowledge vaults, coordinated by a
**choreographer + specialist-workers** pattern:

- **A daily "skills" engine** — on-demand commands (`/evaluate`, `/tailor`,
  `/outreach`, `/apply-pipeline`) the user drives interactively.
- **An overnight autopilot** — a **13-step pipeline** (discovery → dedup →
  hard-pass filter → fit gate → build → verify → render → lane-assign → submit →
  record → brief → cost/quality log) that runs unattended.
- **A durable memory vault** — the candidate's profile, real experience, and
  voice, read at pipeline runtime so nothing is invented.

## Provider-agnostic routing

The pipeline isn't tied to one model. A thin router (`stdin context + prompt →
stdout text`) sends each step to **Claude Code, Codex, or Gemini** via a single
`AI_BRAIN` env var — `auto` falls back across providers, `native` runs inline in
Claude, `codex` uses a ChatGPT-Plus subscription. Because the three engines share
one interface, when a provider changes or a subscription lapses, **nothing else
in the system changes.** It runs cross-platform (Windows + macOS) as pure
subprocess calls.

## Dual-layer quality gates

Every application passes two independent gates before it can be submitted:

1. **Eight mechanical gates** (deterministic Python) — eligibility, tailored-PDF
   verification, résumé rules, a **substance floor** (every canonical metric must
   survive tailoring — no content thinning), cover truth, cover format/structure,
   and a last-mile check that the exact PDF being uploaded matches its source.
   *"A rule that matters must be a gate, not a sentence."*
2. **An LLM auditor** (run fresh per submission, on the most capable model) — a
   truth gate that diffs every tailored claim against the canonical source and
   fails anything fabricated, thinned, or off-voice, returning structured
   evidence the orchestrator must resolve before proceeding.

## Model routing, A/B-tested

Agents are assigned models by an actual blind A/B benchmark: the **auditor runs
on the strongest model** (it's the net that catches subtle fabrications), while
discovery / build / submit workers run on a cheaper model where the benchmark
proved identical correctness — a measured cost/quality tradeoff, not a guess.

## Five-lane submission + a learning loop

Post-audit, each role routes to one of five lanes (auto-submit, outreach-first,
package-ready, needs-decision, failed). A **clean submission pipeline** summons a
single browser instance on demand, per role, driven by a library of **8+ ATS
handlers** (Greenhouse, Lever, Ashby, Workday, LinkedIn, and more) — every action
screenshotted for proof. Outcomes (interviews, rejections) are read back each run
and folded into the next run's filters.

## Why it's here

I built this as a real tool under real stakes, not a demo — which is exactly why
it's the engineering I care most about: **multi-agent orchestration,
provider-agnostic infrastructure, and adversarial self-verification** applied to
a messy, high-consequence workflow where a wrong output has a real cost. The
reusable core (router, ATS handlers, quality-gate framework, auditor pattern) is
being extracted into an open-source project. *(Details here are generalized;
personal data is deliberately omitted.)*
