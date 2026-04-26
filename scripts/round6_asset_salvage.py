"""Round-6 asset salvage — for projects with no real hero, render PDFs / copy
real screenshots from local source folders.

Targets:
  - aurora-citadel-gen-game: copy best AutoScreenshot from UE5 saves
  - l43d-cad-mllm: render page 1 of final-report.pdf to PNG
  - s25-team-26-paper-viz: NO source available (placeholder stays)
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

import fitz  # PyMuPDF

ROOT = Path(r"W:\tianle-chen-site")
ASSETS = ROOT / "public" / "assets"


def render_pdf_page(pdf_path: Path, out_path: Path, page_index: int = 0, zoom: float = 2.0) -> int:
    """Render a single PDF page to PNG and return file size."""
    doc = fitz.open(pdf_path)
    page = doc[page_index]
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    pix.save(out_path)
    doc.close()
    return out_path.stat().st_size


def copy_file(src: Path, dest: Path) -> int:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    return dest.stat().st_size


def fmt_size(n: int) -> str:
    if n < 1024:
        return f"{n} B"
    if n < 1024 * 1024:
        return f"{n / 1024:.1f} KB"
    return f"{n / (1024 * 1024):.1f} MB"


def main() -> None:
    actions: list[tuple[str, str]] = []

    # ── aurora-citadel-gen-game: best AutoScreenshot from UE5 saves ────────
    ue5_screenshots = [
        Path(r"W:\CMU_Academics\2025 Spring\62706 Gen Game\Final Project Level\Agent2\Saved\AutoScreenshot.png"),
        Path(r"W:\CMU_Academics\2025 Spring\62706 Gen Game\unrealgame1\Saved\AutoScreenshot.png"),
        Path(r"W:\CMU_Academics\2025 Spring\62706 Gen Game\MyProject\Saved\AutoScreenshot.png"),
        Path(r"W:\CMU_Academics\2025 Spring\62706 Gen Game\Saved\AutoScreenshot.png"),
    ]
    aurora_dir = ASSETS / "aurora-citadel-gen-game"

    # Pick the largest screenshot (proxy for "most detail / final scene")
    valid = [(p, p.stat().st_size) for p in ue5_screenshots if p.exists()]
    if valid:
        valid.sort(key=lambda x: -x[1])
        best, sz = valid[0]
        dest = aurora_dir / "ue5-viewport-final.png"
        if not dest.exists():
            copy_file(best, dest)
            actions.append((f"aurora hero: {best.name}", f"-> {dest.name} ({fmt_size(sz)})"))
        else:
            actions.append((f"aurora hero", "already exists, skipped"))

        # Also copy a second-best if available (gallery)
        if len(valid) > 1:
            second, sz2 = valid[1]
            # avoid filename collision
            if second.parent != best.parent:
                dest2 = aurora_dir / f"ue5-viewport-{second.parent.parent.name}.png"
                if not dest2.exists():
                    copy_file(second, dest2)
                    actions.append((f"aurora gallery", f"-> {dest2.name} ({fmt_size(sz2)})"))

    # Game design final demo video
    demo_mp4 = Path(r"W:\CMU_Academics\2025 Spring\62706 Gen Game\Game_Design_Final_Video_Demo.mp4")
    if demo_mp4.exists():
        dest = aurora_dir / "final-demo.mp4"
        if not dest.exists():
            sz = copy_file(demo_mp4, dest)
            actions.append(("aurora video", f"-> final-demo.mp4 ({fmt_size(sz)})"))
        else:
            actions.append(("aurora video", "already exists, skipped"))

    # ── l43d-cad-mllm: render page 1 of final-report.pdf ─────────────────────
    cad_dir = ASSETS / "l43d-cad-mllm"
    final_report = cad_dir / "final-report.pdf"
    poster = cad_dir / "poster.pdf"

    if final_report.exists():
        # Page 1 — title + lede figure
        out1 = cad_dir / "report-page-1.png"
        if not out1.exists():
            sz = render_pdf_page(final_report, out1, page_index=0, zoom=2.0)
            actions.append(("cad-mllm hero", f"-> report-page-1.png ({fmt_size(sz)})"))

        # Page 2 — usually has the framework diagram
        out2 = cad_dir / "report-page-2.png"
        if not out2.exists():
            sz = render_pdf_page(final_report, out2, page_index=1, zoom=2.0)
            actions.append(("cad-mllm gallery", f"-> report-page-2.png ({fmt_size(sz)})"))

    if poster.exists():
        out = cad_dir / "poster-page-1.png"
        if not out.exists():
            sz = render_pdf_page(poster, out, page_index=0, zoom=1.5)
            actions.append(("cad-mllm poster", f"-> poster-page-1.png ({fmt_size(sz)})"))

    # ── s25-team-26-paper-viz: no source assets available ────────────────────
    actions.append(("paper-viz", "NO source assets available — PlaceholderHero"))

    # ── Print summary ────────────────────────────────────────────────────────
    print("\n" + "=" * 64)
    print("Round-6 asset salvage summary")
    print("=" * 64)
    for label, detail in actions:
        print(f"  [{label}]: {detail}")
    print()


if __name__ == "__main__":
    main()
