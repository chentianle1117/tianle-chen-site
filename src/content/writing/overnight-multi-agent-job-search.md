---
title: "Running a job search as an overnight multi-agent pipeline"
date: "2026-07-04"
summary: "The open-source engine behind Job Search Copilot: a provider-agnostic router, a choreographer that never does the work itself, and a wall of mechanical gates that stop the run before a bad application ever goes out."
tags: ["agents", "LLM", "systems", "open-source"]
canonical_project: "job-search-copilot"
external_url: "https://github.com/chentianle1117/job-search-copilot"
publish: true
---

A job search is a batch job. You do the same handful of steps — find a role, judge fit, tailor a résumé, write a cover letter, submit — a few hundred times, and every step has a cost when it goes wrong. That shape is exactly what an agent pipeline is good at, and exactly where a naive agent pipeline is dangerous: one hallucinated bullet on a résumé is a real, irreversible mistake.

So I built the engine around one idea: **the model is never trusted to be careful; the system is built to be careful for it.** Here's how the open-source version works.

## The choreographer never does the work

The main thread is only ever a **choreographer**. It dispatches ephemeral specialist workers, merges and dedupes their output, holds the rules and the token budget, and records results. It does *not* run discovery itself, tailor a package itself, or drive a form itself. Those three jobs are always delegated to fresh, single-purpose sub-agents.

That bright line came directly from watching earlier versions drift: the moment an orchestrator starts improvising the work instead of coordinating it, quality falls off a cliff. Keeping the coordinator dumb and the workers disposable is what makes the run reproducible.

## One interface, three interchangeable engines

Every model call goes through a thin router with a single interface — `stdin + prompt → stdout` — behind one `AI_BRAIN` environment variable. Swap the whole provider (Claude Code, Codex, Gemini) or survive a subscription lapse with a one-line change.

The model and reasoning-effort per role aren't guesses; they were **assigned by a blind A/B benchmark**. Cheap models on mechanical steps, stronger models where errors actually hurt. And one rule is non-negotiable: the **master auditor is always the strongest model available**, run at high effort, on every candidate-facing artifact. You spend the reasoning where it catches mistakes, not where it doesn't.

## An eight-stage pipeline that stops itself

The overnight autopilot runs eight stages in dependency order: **pre-flight → discovery → fit-triage → build → audit → submit → record → self-improve.** The whole thing runs inside a hard per-night token budget, and — this is the important part — it **stops with a partial report rather than silently overrunning.** No full discovery on a bad night, no final submit, no self-approve-then-submit on the main thread. Always delegated, always bounded.

The last stage folds outcomes back in: interviews and rejections reshape the next run's discovery filters and raise or lower the fit bar. The pipeline gets a little more calibrated every night.

## The quality wall comes before the model

The most important design decision is that **mechanical gates run before any model judgment.** A chain of deterministic checks — does the résumé compile, are all facts grounded in the source profile, does every claim trace back, is the ATS format valid — has to pass before a language model is even asked for an opinion. A dedicated `submit_guard` token has to be present for anything to leave the machine.

This inverts the usual order. Most agent demos let the model decide and bolt on validation as an afterthought. Here the validation is the spine, and the model is a component inside it. That's the only way I'd trust an unattended process to touch something as consequential as a job application.

## What's reusable

Strip out the job-search specifics and what's left is a pattern I now reach for whenever an agent has to do repetitive, high-consequence work unattended:

- **A dumb coordinator + disposable specialist workers.** Coordinators that do the work drift.
- **A provider-agnostic router with per-role model/effort routing.** Decouple the pipeline from any one vendor.
- **Mechanical gates before model judgment, and a physical submit token.** Determinism first, model second.
- **A hard budget that fails to a partial report.** Bounded and honest beats unbounded and silent.

The generalized engine is open source — clone it, wire in your own profile, point `AI_BRAIN` at whatever you have a subscription to: [github.com/chentianle1117/job-search-copilot](https://github.com/chentianle1117/job-search-copilot).
