#!/usr/bin/env python3
"""Generate public/davidchen-cv.pdf from the vault CV markdown.

Strategy (in order):
  1. pandoc -> styled HTML, then Playwright (Chromium) -> PDF.
  2. Fallback: pandoc with wkhtmltopdf engine (if installed).
  3. On total failure: print 'CV_PDF_FAILED' and exit 0 (the site falls back to
     linking the .md).

Source:  W:\\SecondBrain\\Career\\Resumes\\Tianle_Chen_Resume_2026-04.md
Output:  public/davidchen-cv.pdf
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CV_MD_PATH = Path(r"W:\SecondBrain\Career\Resumes\Tianle_Chen_Resume_2026-04.md")
PDF_OUT = PROJECT_ROOT / "public" / "davidchen-cv.pdf"
CSS_PATH = PROJECT_ROOT / "scripts" / "cv-style.css"
SCRIPT_TMP_DIR = PROJECT_ROOT / "scripts"

# Designer-clean A4 CSS — Inter / system sans, generous margins.
CV_CSS = """
@page {
  size: A4;
  margin: 0.6in 0.5in 0.6in 0.5in;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  color: #0e0e10;
  background: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
               Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 10.5pt;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}

body { padding: 0; }

h1 {
  font-size: 22pt;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0 0 2pt 0;
}

h2 {
  font-size: 12pt;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #2a2a2e;
  margin: 18pt 0 6pt 0;
  padding-bottom: 3pt;
  border-bottom: 0.5pt solid #c8c8cc;
  page-break-after: avoid;
}

h3 {
  font-size: 11pt;
  font-weight: 600;
  margin: 10pt 0 2pt 0;
  page-break-after: avoid;
}

h4 {
  font-size: 10.5pt;
  font-weight: 600;
  margin: 8pt 0 2pt 0;
}

p { margin: 4pt 0; }

ul, ol {
  margin: 4pt 0 6pt 0;
  padding-left: 16pt;
}
li { margin: 1.5pt 0; }

a {
  color: #1d4ed8;
  text-decoration: none;
}

strong, b { font-weight: 600; }

em, i { font-style: italic; }

code, kbd, samp, pre {
  font-family: 'IBM Plex Mono', 'JetBrains Mono', Menlo, Consolas, monospace;
  font-size: 9.5pt;
  background: #f4f4f6;
  padding: 1pt 3pt;
  border-radius: 2pt;
}

hr {
  border: none;
  border-top: 0.5pt solid #c8c8cc;
  margin: 14pt 0;
}

blockquote {
  border-left: 2pt solid #c8c8cc;
  margin: 6pt 0;
  padding: 2pt 0 2pt 10pt;
  color: #4a4a4e;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 6pt 0;
}
th, td {
  text-align: left;
  padding: 3pt 5pt;
  border-bottom: 0.5pt solid #e0e0e3;
  vertical-align: top;
}
th { font-weight: 600; }

/* Tighten the very-first heading — name on top with no top margin gap. */
body > h1:first-child { margin-top: 0; }

/* Avoid orphans/widows around section breaks */
section, article { page-break-inside: avoid; }
"""

# JS used to drive Playwright Chromium for HTML -> PDF.
PLAYWRIGHT_RENDER_JS = r"""
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const args = JSON.parse(process.argv[2]);
  const { htmlPath, pdfPath } = args;
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0.6in', right: '0.5in', bottom: '0.6in', left: '0.5in' },
    });
    console.log('OK');
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err); process.exit(1); });
"""


def _exists_in_path(cmd: str) -> bool:
    return shutil.which(cmd) is not None


def write_css() -> None:
    CSS_PATH.write_text(CV_CSS, encoding="utf-8")


def pandoc_to_html(md_path: Path, html_path: Path) -> bool:
    """Run pandoc to produce a self-contained styled HTML file."""
    if not _exists_in_path("pandoc"):
        sys.stderr.write("pandoc not found in PATH\n")
        return False
    cmd = [
        "pandoc",
        str(md_path),
        "-o", str(html_path),
        "--standalone",
        "--metadata", "title=Tianle (David) Chen — Resume",
        "--css", str(CSS_PATH),
        "--embed-resources",
    ]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    except Exception as e:
        sys.stderr.write(f"pandoc launch failed: {e}\n")
        return False
    if r.returncode != 0:
        sys.stderr.write(f"pandoc failed (code {r.returncode}):\n{r.stderr}\n")
        return False
    return html_path.exists() and html_path.stat().st_size > 0


def html_to_pdf_playwright(html_path: Path, pdf_path: Path) -> bool:
    """Drive a Node Playwright script to render HTML -> PDF.

    Requires `playwright` already installed (it is — checked at script top).
    Returns True on success.
    """
    # Find a Node we can call. On Windows from Anaconda bash, prefer node.exe.
    if not _exists_in_path("node"):
        sys.stderr.write("node not found in PATH; Playwright route unavailable\n")
        return False

    # Verify chromium is installed for Playwright; install if not.
    pw_dir = Path(os.environ.get("PLAYWRIGHT_BROWSERS_PATH", "")) if os.environ.get("PLAYWRIGHT_BROWSERS_PATH") else None
    # Best-effort install (no-op if already installed). Don't fail if this returns nonzero.
    npx = shutil.which("npx") or shutil.which("npx.cmd")
    if npx:
        try:
            subprocess.run([npx, "playwright", "install", "chromium"],
                           cwd=str(PROJECT_ROOT), capture_output=True, timeout=300)
        except Exception:
            pass

    # Put the temp JS INSIDE the project so Node can resolve node_modules/playwright.
    js_path = SCRIPT_TMP_DIR / "_render_cv.cjs"
    js_path.write_text(PLAYWRIGHT_RENDER_JS, encoding="utf-8")

    try:
        args_json = json.dumps({
            "htmlPath": str(html_path.resolve()),
            "pdfPath": str(pdf_path.resolve()),
        })
        node = shutil.which("node") or "node"
        r = subprocess.run(
            [node, str(js_path), args_json],
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            timeout=180,
        )
        if r.returncode != 0:
            sys.stderr.write(
                f"Playwright render failed (code {r.returncode}):\n"
                f"STDOUT: {r.stdout}\nSTDERR: {r.stderr}\n"
            )
            return False
        return pdf_path.exists() and pdf_path.stat().st_size > 0
    finally:
        try:
            if js_path.exists():
                js_path.unlink()
        except Exception:
            pass


def pandoc_wkhtmltopdf_fallback(md_path: Path, pdf_path: Path) -> bool:
    """Last-resort: ask pandoc to use wkhtmltopdf directly."""
    if not _exists_in_path("pandoc"):
        return False
    if not _exists_in_path("wkhtmltopdf"):
        return False
    cmd = [
        "pandoc", str(md_path),
        "-o", str(pdf_path),
        "--pdf-engine=wkhtmltopdf",
        "--css", str(CSS_PATH),
        "--metadata", "title=Tianle (David) Chen — Resume",
        "-V", "margin-top=15mm",
        "-V", "margin-bottom=15mm",
        "-V", "margin-left=12mm",
        "-V", "margin-right=12mm",
    ]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    except Exception as e:
        sys.stderr.write(f"pandoc/wkhtmltopdf launch failed: {e}\n")
        return False
    if r.returncode != 0:
        sys.stderr.write(f"pandoc/wkhtmltopdf failed (code {r.returncode}):\n{r.stderr}\n")
        return False
    return pdf_path.exists() and pdf_path.stat().st_size > 0


def main() -> int:
    if not CV_MD_PATH.exists():
        sys.stderr.write(f"CV markdown not found: {CV_MD_PATH}\n")
        print("CV_PDF_FAILED")
        return 0

    PDF_OUT.parent.mkdir(parents=True, exist_ok=True)
    write_css()

    # Route 1: pandoc -> HTML -> Playwright -> PDF
    with tempfile.TemporaryDirectory() as tmp:
        html_path = Path(tmp) / "cv.html"
        if pandoc_to_html(CV_MD_PATH, html_path):
            if html_to_pdf_playwright(html_path, PDF_OUT):
                size_kb = PDF_OUT.stat().st_size // 1024
                if size_kb > 50:
                    print(f"[cv] OK: {PDF_OUT} ({size_kb} KB) via Playwright")
                    return 0
                sys.stderr.write(
                    f"[cv] PDF generated but suspiciously small ({size_kb} KB); trying fallback\n"
                )

    # Route 2: pandoc + wkhtmltopdf
    if pandoc_wkhtmltopdf_fallback(CV_MD_PATH, PDF_OUT):
        size_kb = PDF_OUT.stat().st_size // 1024
        if size_kb > 50:
            print(f"[cv] OK: {PDF_OUT} ({size_kb} KB) via pandoc/wkhtmltopdf")
            return 0

    print("CV_PDF_FAILED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
