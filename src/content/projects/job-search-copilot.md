---
title: Job Search Copilot
slug: job-search-copilot
summary: "A multi-agent, provider-agnostic system that runs a real job search end-to-end — discovery, résumé + cover tailoring, an adversarial LLM audit, and ATS form submission — engineered around one rule: never ship a lower-quality application to work around a technical limit."
year: 2026
semester: Personal project
role: sole engineer
github_url: https://github.com/chentianle1117/job-search-copilot
categories:
  - AI/ML
  - Interactive Tool
  - Agent
tags:
  - agents
  - multi-agent-orchestration
  - automation
  - provider-agnostic
  - llm-as-judge
  - browser-automation
  - python
priority: flagship
status: ready
publish: true
hero_image: /assets/job-search-copilot/cover.svg
images:
  - /assets/job-search-copilot/cover.svg
stats:
  - value: "8"
    label: "ATS handlers"
  - value: "13"
    label: "deterministic gates"
  - value: "7"
    label: "safety layers"
  - value: "500K"
    label: "nightly token budget"
stack:
  - Multi-agent orchestration (choreographer + workers)
  - Claude Code / Codex / Gemini (provider-agnostic router)
  - Python (deterministic gates + browser automation)
  - Patchright / Chrome DevTools Protocol
  - MCP (Notion, Gmail, LinkedIn)
---

A production-grade, multi-agent system that runs a real job search end-to-end —
discovery, résumé + cover tailoring, an adversarial quality audit, ATS form
submission, and a review dashboard — built and run nightly against an actual,
high-stakes search. Every rule in it exists because something broke once; the
whole thing is engineered around a single hard principle: **zero quality
degradation.** A technical limitation is never an excuse to ship a worse
application.

It is the piece of engineering I care most about, because it is where three
things I keep reaching for — multi-agent orchestration, provider-agnostic
infrastructure, and adversarial self-verification — get applied to a messy,
high-consequence workflow where a wrong output has a real cost. *(Everything
below is generalized: the architecture is real, the candidate's personal data is
deliberately omitted.)*

## Architecture

<figure class="diagram">
  <img src="/assets/job-search-copilot/d2-pipeline.svg" alt="The overnight pipeline: pre-flight, discovery, fit-triage, build, audit, submit, record, and a self-improve / outcome-learning step that feeds back into discovery." />
  <figcaption>The overnight pipeline — the choreographer dispatches specialist workers through eight stages, then folds outcomes back into the next run. The routing, quality wall, and submission layers are broken out in the sections below.</figcaption>
</figure>

Three git repos and two personal knowledge vaults, coordinated by a
**choreographer + specialist-workers** pattern:

- A daily "skills" engine — on-demand commands (`/evaluate`, `/tailor`,
  `/outreach`, `/apply-pipeline`) the operator drives interactively.
- An overnight autopilot — an 8-stage pipeline (pre-flight → discovery →
  fit-triage → build → audit → submit → record → self-improve) that runs
  unattended and stops itself the moment any gate fails.
- A durable memory vault — the candidate's real profile, experience, and
  voice, read at pipeline runtime so nothing is invented.

The main thread is only ever the choreographer: it dispatches workers,
merges and dedupes their output, holds the rules and the budget, relays fixes,
and records results. It does *not* run discovery itself, tailor a package
itself, or drive a form to submit itself. Those three jobs are always delegated
to fresh, single-purpose sub-agents — a bright line that came directly from
watching earlier versions drift when the orchestrator improvised.

## Provider-agnostic routing

<figure class="diagram">
  <img src="/assets/job-search-copilot/d1-engine-routing.svg" alt="Three engines (Claude Code, Codex, Gemini) behind one AI_BRAIN router, plus the benchmark-assigned model and effort routing table with the Opus master auditor pinned as the safety net." />
  <figcaption>One AI_BRAIN router in front of three interchangeable engines — plus the benchmark-assigned model/effort routing (the auditor is always Opus).</figcaption>
</figure>

The pipeline is not tied to one model or one vendor. A thin router exposes a
single interface — **`stdin context + prompt → stdout text`** — and sends each
step to Claude Code, Codex, or Gemini behind one `AI_BRAIN` environment
variable:

| `AI_BRAIN` | Behaviour |
|---|---|
| `auto` (default) | try Gemini → Codex → native, falling through on failure |
| `gemini` / `codex` | pin one engine (subscription-funded), native as backstop |
| `native` | the caller (Claude) does the analysis inline, no subprocess |

Because all three engines share one interface, when a provider changes, a
subscription lapses, or a free tier retires, **nothing else in the system
changes** — you flip one env var. The router is a pure `subprocess` call with no
shell, so it runs identically on Windows and macOS, and it ships with two guards
baked in: a grounding prefix ("use only what's in the provided files; if a
fact isn't there, omit it") and a cliché detector that fails output
containing recruiter-speak ("spearhead", "leverage", "results-driven", …).

## Model routing, benchmark-assigned

Agents aren't assigned models by vibe. Every role's tier comes out of a blind
A/B benchmark of full, side-by-side runs:

- The **master auditor always runs on the strongest model (Opus)** — it is the
  net that catches subtle fabrications, and a net that occasionally rationalizes
  a miss is worse than no net. The benchmark confirmed this pin: a cheaper model
  once talked itself out of a real catch.
- The choreographer, discovery, build, and submit workers run on a mid-tier
  model where the benchmark proved identical correctness at ~25–35% lower cost
  — with high-stakes builds escalated back to Opus.
- Effort is routed per role too (`low → max`): the auditor and discovery get
  deep reasoning; mechanical form-filling gets shallow, fast passes, because on a
  rote task extra "thinking" only adds wasted tool calls.

The measured cost/quality tradeoff — spend reasoning where it catches errors,
save it where it doesn't — is the whole point, and it's a decision the data
made, not a guess.

## The quality wall — two independent layers

<figure class="diagram">
  <img src="/assets/job-search-copilot/d3-quality-wall.svg" alt="Layer 1: a chain of eight-plus deterministic mechanical gates. Layer 2: an Opus master auditor returning PASS / FIX / BLOCK. Both must clear before submit." />
  <figcaption>Two independent layers — a deterministic mechanical-gate chain, then a fresh-context Opus auditor. Both must clear before anything can be submitted.</figcaption>
</figure>

Every application clears two independent gates before it can be submitted.
The principle behind the whole design: *a rule that matters must be a gate, not
a sentence.* Quality rules kept getting violated when they lived as prose the
model was trusted to honor; now each one is code that blocks.

**Layer 1 — mechanical gates** (deterministic Python, hard-fail the pipeline).
A 13-check chain, re-run by the orchestrator before every submit:

| Gate | Enforces |
|---|---|
| `eligibility` | geography, explicit no-sponsorship, and years-of-experience hard stops |
| `tailored-résumé` | the attached PDF is *this* role's tailored file, never a generic fallback |
| `résumé-rules` | bullet counts, canonical vocabulary only (no invented tools), required lines present |
| `substance-floor` | RULE −1: no content thinning — every canonical metric survives tailoring, and the package can't regress below the best prior version |
| `cover-truth` | the cover letter contains no fabricated or unsourced claim |
| `cover-format` / `cover-structure` | keyword bolding + a locked canonical skeleton (salutation, anchors, close) |
| `pdf-matches-source` | last-mile: the exact PDF being uploaded is one page, non-empty, newer than its source, and contains every metric and the right company |

…plus `mojibake`, `markup-leak`, `recency-order`, and `outreach` checks. Any
failure exits the pipeline with a non-zero code — for that role — and the fix is
always *repair the artifact* (shrink the font, re-render, swap a truthful
variant), never thin the content.

**Layer 2 — the master auditor** (LLM-as-judge, fresh context per submission).
A judgment gate for the things a regex can't see. It runs on Opus, in a
*separate context from whoever built the package*, and diffs every tailored
claim against the canonical source. It returns PASS / FIX / BLOCK, and its
verdict is:

- sha-matched to the exact files it reviewed — edit the package after the
  audit and the verdict goes stale, forcing a re-audit;
- anti-rubber-stamp — a PASS must list ≥5 concrete checks each with an
  evidence quote, and it may not contradict the mechanical substance-floor
  (auditor-PASS + mechanical-FAIL is itself a block).

The choreographer may never build-and-approve-and-submit in one pass. Approval
is a separate judgment from a separate mind — the single most important
structural rule in the system.

## Seven-layer safety architecture

The two-layer wall sits inside a larger defense in depth. Seven independent
layers each catch a different failure mode — pre-flight environment checks, a
hard-pass filter, canonical fit scoring, the dual verifier, a vision-based PDF
aesthetic check, a lane-eligibility gate, and a pre-submit form pre-flight. The
invariant: any layer failing routes the application to a *safe* lane (hold or
package-only), never to a wrong submission.

## Submission: ATS handlers + a token, not a promise

<figure class="diagram">
  <img src="/assets/job-search-copilot/d4-submission.svg" alt="Post-audit lane routing into a library of eight ATS handlers, with screenshot proof, a submit-guard clearance token bound to the gate-passed PDF, and a hard stop at interactive captchas." />
  <figcaption>Lane routing → the ATS handler library → record. Authorization is a token bound to the gate-passed PDF's hashes, not a prose instruction a fresh agent has to trust.</figcaption>
</figure>

Post-audit, each role routes to one of several lanes — auto-submit for small
firms, a high-stakes hold for anything that benefits from human judgment,
outreach-first, package-only, or closed. The tracker (Notion) is the single
source of truth; its stage select *is* the lane.

Auto-submission runs through a library of **8 ATS handlers** built on a clean
`detector → handler → runner` pattern (Greenhouse, Lever, Ashby, Workday,
LinkedIn Easy Apply, PeopleAdmin complete; iCIMS and ADP stubbed). A single
browser instance is summoned on demand per role, driven with stealth automation,
and every action is screenshotted for proof. Two rails keep a cheaper submit
model safe: a mandatory pre-submit screenshot read-back, and
"leave blank when unsure, never guess-fill" — which extends to identity
fields, after an early agent once fabricated a street address to clear a required
field. Fabricating *any* field to pass a gate is treated as the same violation as
fabricating a résumé claim.

The most interesting piece here is **authorization as an artifact, not a
sentence.** A fresh submit agent shouldn't "trust" a paragraph in its prompt
that says "you're allowed to submit" — that's injection-shaped and
unverifiable, and agents correctly refused it. Instead, after the gates pass and
the auditor PASSes, the orchestrator writes a `GATE_CLEARED` token bound to the
gate-passed PDF's hashes. The submit agent verifies that token before it
drives; a real, checkable on-disk artifact replaces an unverifiable claim. The
one hard human stop is an interactive captcha a person must physically operate —
the agent fills up to it, screenshots, and hands off.

## The outcome-learning loop

The pipeline reads its own results back. Real employer outcomes — interviews,
rejections, dead postings — are folded into the next run: they reshape the
discovery filters and raise or lower the fit bar. When the early outcome data
showed that a high-volume cold-submit lane wasn't converting, the system's fit
bar for cold submissions was raised and effort rebalanced toward warmer
channels. The loop is what keeps it from optimizing a lane that doesn't work.

## Budget & failure posture

The whole overnight run lives inside a **hard token budget** (~500K/night). If a
stage would blow the cap, the pipeline stops with a partial report rather than
silently overrunning — the same posture as everything else here: when in
doubt, stop safe and surface it, never degrade quietly.

## Why it's here

I built this under real stakes, not as a demo — which is exactly why it taught me
the most. The reusable core — the provider-agnostic router, the ATS handler
framework, the deterministic quality-gate harness, and the fresh-context auditor
pattern — is **open-sourced (MIT)** at
[github.com/chentianle1117/job-search-copilot](https://github.com/chentianle1117/job-search-copilot):
the engine only, with every candidate-specific value supplied privately at runtime.
Anyone can clone it, point it at their own profile, and run the demo end-to-end —
no personal data ever enters the repo.
