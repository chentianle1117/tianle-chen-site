---
title: Travel Atlas
slug: travel-atlas
summary: "An interactive world map built entirely from my own data — mined from Notion via MCP, plus a metadata-only photo-geolocation harvest — tracing five years across 103 places and 10 countries on a scrubbable timeline."
year: 2026
semester: Personal project
categories:
  - Data Visualization
  - Data Engineering
  - Interactive Tool
tags:
  - data-viz
  - personal-tool
priority: standard
status: ready
publish: true
hero_image: /assets/travel-atlas/cover.svg
images:
  - /assets/travel-atlas/cover.svg
stack:
  - Leaflet
  - D3
  - Notion API / MCP
  - Python (pyicloud)
---

An interactive world map of everywhere I've lived and traveled, built entirely
from my own data — no manual entry. A time-scrubber animates the journey from
2021 to 2026; each dot is a place, sized and colored by how many weeks I spent
there.

## What it does

- **Timeline scrubber** — drag through five years and watch the map fill in;
  toggle between a cumulative view and a moving window.
- **Journey mode** — draws the routes between places (road vs. flight vs.
  uncertain), so the map reads as a path, not just a scatter.
- **Weight encoding** — dot size and color both map to time spent, so the
  places that mattered most (Houston, Pittsburgh) read instantly.

## How it's built

The location history is **mined from my Notion Weekly Reviews via the Notion
API / MCP** — years of "where was I this week" entries, geocoded into a clean
`travel-data.json`. **395 events across 103 places in 10 countries.**

A second, optional layer harvests **photo geolocation** from an iCloud library
**metadata-only** — decoding GPS coordinates straight out of the binary plist
sidecars, so it reads location density from **22,663 geotagged items out of
73,009** without ever downloading a single photo.

## Why I made it

Mostly for myself — a compounding record of a decade of moving around. But it's
also a small case study in the thing I like doing most: turning messy personal
data into a legible, interactive picture using the tools I already live in
(Notion, a bit of Python, a map).
