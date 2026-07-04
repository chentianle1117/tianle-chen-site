#!/usr/bin/env python3
"""Generate a light-theme twin for a dark diagram SVG via palette substitution.

Usage:
    python scripts/svg_light_twin.py public/assets/foo/architecture.svg [more.svg ...]

For each input `X.svg` (that is not already a *-light.svg) it writes `X-light.svg`
with the dark "Graphite + Oxide" palette swapped for the paper/light palette.
BaseLayout.astro swaps <img src> to the -light twin when the site theme is light.

The map is case-insensitive and matches whole hex tokens. Unknown colors pass
through unchanged, so verify the twin visually after generating.
"""
import re
import sys
from pathlib import Path

# dark hex -> light hex. Keys lower-case. Ordered longest-first not needed since
# we tokenise on #-hex boundaries.
COLOR_MAP = {
    # surfaces / backgrounds
    "#0b0d0f": "#faf9f5",  # page bg -> stone-50
    "#0d1117": "#faf9f5",
    "#07080a": "#f0efe9",
    "#12161a": "#f2f1ec",  # panel -> stone-100-ish
    "#121417": "#f2f1ec",
    "#161b22": "#ecebe4",
    "#1a1c20": "#e7e5dd",  # surface-2
    "#1a130e": "#f6ece4",  # oxide-tint panel bg -> pale oxide wash
    "#231a12": "#f2e6da",
    # text
    "#f4f5f6": "#100e0c",
    "#f0f1f2": "#100e0c",
    "#e8eaed": "#1a1714",  # primary text -> near-black
    "#e6e7e9": "#1a1714",
    "#d8dadd": "#3a3631",
    "#c8ccd0": "#3a3631",
    "#a8acb1": "#57534b",  # mono/secondary text
    "#969ba2": "#5b564f",
    "#7e828a": "#6f6a60",  # dim text
    # neutral strokes / lines
    "#5e636b": "#cbc7ba",
    "#3d4148": "#d3d0c4",
    "#30363d": "#d3d0c4",
    # accent (oxide) — darken for AA on paper
    "#cf7f54": "#b45f2c",
    "#d18260": "#b45f2c",
    "#b8623f": "#964d31",
    # category hues — darken a step so they read on light
    "#9b6fc9": "#7a4fb5",  # ml / purple
    "#7aa15c": "#5c8040",  # research / green
    "#d49b50": "#a9762a",  # interaction / amber
    "#5fa0a6": "#3c868c",  # teal
    "#58a6ff": "#1f6feb",  # blue (if used)
}


def convert(text: str) -> str:
    def repl(m: re.Match) -> str:
        tok = m.group(0)
        return COLOR_MAP.get(tok.lower(), tok)

    # match #rrggbb and #rgb hex tokens
    return re.sub(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b", repl, text)


def main(argv):
    if not argv:
        print(__doc__)
        return 1
    for arg in argv:
        p = Path(arg)
        if not p.exists():
            print(f"  SKIP (missing): {p}")
            continue
        if p.stem.endswith("-light"):
            print(f"  SKIP (already light): {p}")
            continue
        out = p.with_name(f"{p.stem}-light{p.suffix}")
        src = p.read_text(encoding="utf-8")
        dst = convert(src)
        out.write_text(dst, encoding="utf-8")
        # report unmapped dark-ish tokens for eyeballing
        print(f"  wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
