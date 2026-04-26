"""Shared helpers for the embedding / atlas / layout pipeline.

Keep this module pure: no global mutable state, no I/O at import time.
"""

from __future__ import annotations

import colorsys
import hashlib
import io
import os
import sys
from pathlib import Path
from typing import Iterable, List, Optional, Tuple, Union

import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ----------------------------------------------------------------------------
# Defensive PIL caps — never crash on a large image again.
# Set BEFORE any other code opens an image.
# ----------------------------------------------------------------------------

Image.MAX_IMAGE_PIXELS = 300_000_000  # 300 MP — well above any realistic photo

# Hard cap for raster-processed images. Anything larger is downsized in-place.
SAFE_MAX_DIM = 4096


def safe_open(path: Union[str, Path]) -> Image.Image:
    """Open an image, downsizing in-place to SAFE_MAX_DIM if either side exceeds it.

    Use this in place of `Image.open` ANYWHERE the image will be raster-processed
    (resized, embedded, atlas-packed, hero-poster extracted). For verbatim copies
    (e.g. animated GIFs being shutil.copy2'd), no PIL touch is needed.

    Logs a stderr warning when downsizing happens so the pipeline is observable.
    Returns a (possibly downsized) PIL.Image. Caller is responsible for closing.
    """
    p = Path(path)
    img = Image.open(p)
    # Force load so we can inspect size, then convert if needed.
    try:
        img.load()
    except Exception:
        # Some animated GIFs / corrupt files — re-open lazily and let caller handle.
        img = Image.open(p)

    w, h = img.size
    if w > SAFE_MAX_DIM or h > SAFE_MAX_DIM:
        sys.stderr.write(
            f"[safe_open] downsizing {p.name}: {w}x{h} -> max {SAFE_MAX_DIM}\n"
        )
        # thumbnail mutates in-place and preserves aspect ratio.
        img.thumbnail((SAFE_MAX_DIM, SAFE_MAX_DIM), Image.Resampling.LANCZOS)
    return img

# ----------------------------------------------------------------------------
# Constants
# ----------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = PROJECT_ROOT / "src" / "content" / "projects"
ASSETS_DIR = PROJECT_ROOT / "public" / "assets"
DATA_DIR = PROJECT_ROOT / "public" / "data"

# Image extensions we'll consider as a hero candidate.
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"}

GRAPHITE_50 = (245, 245, 247)  # near-white text overlay color


# ----------------------------------------------------------------------------
# Math helpers
# ----------------------------------------------------------------------------

def normalize(x: np.ndarray, eps: float = 1e-12) -> np.ndarray:
    """L2-normalize along the last axis."""
    x = np.asarray(x, dtype=np.float32)
    n = np.linalg.norm(x, axis=-1, keepdims=True)
    return x / np.maximum(n, eps)


# ----------------------------------------------------------------------------
# Slug → deterministic visuals
# ----------------------------------------------------------------------------

def slug_to_hue(slug: str) -> int:
    """Deterministic hue [0, 360) from slug."""
    h = hashlib.sha1(slug.encode("utf-8")).digest()
    return int.from_bytes(h[:2], "big") % 360


def _hsl_to_rgb(h_deg: float, s: float, l: float) -> Tuple[int, int, int]:
    r, g, b = colorsys.hls_to_rgb(h_deg / 360.0, l, s)
    return int(round(r * 255)), int(round(g * 255)), int(round(b * 255))


def make_placeholder(slug: str, title: str, size: int = 256) -> Image.Image:
    """Render a deterministic gradient placeholder with the title text."""
    hue = slug_to_hue(slug)
    top = _hsl_to_rgb(hue, 0.55, 0.30)
    bottom = _hsl_to_rgb((hue + 35) % 360, 0.45, 0.55)

    img = Image.new("RGB", (size, size), top)
    px = img.load()
    for y in range(size):
        t = y / max(1, size - 1)
        r = int(round(top[0] * (1 - t) + bottom[0] * t))
        g = int(round(top[1] * (1 - t) + bottom[1] * t))
        b = int(round(top[2] * (1 - t) + bottom[2] * t))
        for x in range(size):
            px[x, y] = (r, g, b)

    draw = ImageDraw.Draw(img)
    font = _load_font(int(round(size / 16)))  # ~16px @ 256
    text = (title or slug).strip()
    text = _wrap_text(text, font, max_width=int(size * 0.86), draw=draw)

    # bottom-left padding
    pad = int(size * 0.06)
    bbox = draw.multiline_textbbox((0, 0), text, font=font, spacing=2)
    th = bbox[3] - bbox[1]
    draw.multiline_text(
        (pad, size - th - pad),
        text,
        fill=GRAPHITE_50,
        font=font,
        spacing=2,
    )
    return img


def _load_font(px: int) -> ImageFont.ImageFont:
    """Best-effort font load. Falls back to PIL default."""
    candidates = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/Helvetica.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, px)
        except Exception:
            continue
    return ImageFont.load_default()


def _wrap_text(text: str, font, max_width: int, draw) -> str:
    """Naive word-wrap to a pixel width."""
    words = text.split()
    lines: List[str] = []
    cur = ""
    for w in words:
        candidate = (cur + " " + w).strip()
        bbox = draw.textbbox((0, 0), candidate, font=font)
        if bbox[2] - bbox[0] <= max_width or not cur:
            cur = candidate
        else:
            lines.append(cur)
            cur = w
        if len(lines) >= 4:
            break
    if cur and len(lines) < 5:
        lines.append(cur)
    return "\n".join(lines[:5])


# ----------------------------------------------------------------------------
# Hero image discovery
# ----------------------------------------------------------------------------

def resolve_web_path_to_fs(web_path: Optional[str]) -> Optional[Path]:
    """Map `/assets/foo/bar.png` → `<root>/public/assets/foo/bar.png`."""
    if not web_path or not isinstance(web_path, str):
        return None
    s = web_path.strip()
    if not s.startswith("/"):
        return None
    fs = PROJECT_ROOT / "public" / s.lstrip("/")
    return fs


def find_hero_image(slug: str, frontmatter: dict) -> Optional[Path]:
    """Best-effort hero image discovery.

    1. frontmatter.hero_image (if it exists on disk + is a known image ext)
    2. frontmatter.images[0]
    3. alphabetical-first image in public/assets/<slug>/
    """
    # 1. frontmatter.hero_image
    candidates: List[Optional[str]] = []
    hero = frontmatter.get("hero_image")
    if isinstance(hero, str):
        candidates.append(hero)

    images = frontmatter.get("images")
    if isinstance(images, list):
        for img in images:
            if isinstance(img, str):
                candidates.append(img)

    for cand in candidates:
        fs = resolve_web_path_to_fs(cand)
        if fs is None:
            continue
        if fs.suffix.lower() not in IMAGE_EXTS:
            continue
        if fs.exists() and fs.is_file():
            return fs

    # 3. asset-dir scan
    asset_dir = ASSETS_DIR / slug
    if asset_dir.exists() and asset_dir.is_dir():
        files = sorted(
            p for p in asset_dir.iterdir()
            if p.is_file() and p.suffix.lower() in IMAGE_EXTS
        )
        if files:
            return files[0]

    return None


# ----------------------------------------------------------------------------
# Open-CLIP loader
# ----------------------------------------------------------------------------

def load_clip_model(device: Optional[str] = None):
    """Load open-clip ViT-L-14 (laion2b_s32b_b82k).

    Returns dict: {model, preprocess, tokenizer, dim, device, name}.
    """
    import torch
    import open_clip

    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    name = "ViT-L-14"
    pretrained = "laion2b_s32b_b82k"
    model, _, preprocess = open_clip.create_model_and_transforms(
        name, pretrained=pretrained, device=device
    )
    model.eval()
    tokenizer = open_clip.get_tokenizer(name)

    # Determine output dim from a tiny dummy forward
    with torch.no_grad():
        dummy = preprocess(Image.new("RGB", (16, 16), (0, 0, 0))).unsqueeze(0).to(device)
        feats = model.encode_image(dummy)
        dim = int(feats.shape[-1])

    return {
        "model": model,
        "preprocess": preprocess,
        "tokenizer": tokenizer,
        "dim": dim,
        "device": device,
        "name": "open-clip-vit-l-14-laion2b",
    }


def embed_images(clip: dict, images: Iterable[Image.Image]) -> np.ndarray:
    """Batch image embedding (B, dim), L2-normalized."""
    import torch

    model = clip["model"]
    preprocess = clip["preprocess"]
    device = clip["device"]

    tensors = [preprocess(img.convert("RGB")) for img in images]
    if not tensors:
        return np.zeros((0, clip["dim"]), dtype=np.float32)
    batch = torch.stack(tensors).to(device)
    with torch.no_grad():
        feats = model.encode_image(batch)
        feats = feats / feats.norm(dim=-1, keepdim=True).clamp_min(1e-12)
    return feats.cpu().numpy().astype(np.float32)


def embed_texts(clip: dict, texts: List[str]) -> np.ndarray:
    """Batch text embedding (B, dim), L2-normalized."""
    import torch

    model = clip["model"]
    tokenizer = clip["tokenizer"]
    device = clip["device"]

    if not texts:
        return np.zeros((0, clip["dim"]), dtype=np.float32)
    tokens = tokenizer(texts).to(device)
    with torch.no_grad():
        feats = model.encode_text(tokens)
        feats = feats / feats.norm(dim=-1, keepdim=True).clamp_min(1e-12)
    return feats.cpu().numpy().astype(np.float32)


# ----------------------------------------------------------------------------
# Jina CLIP v2 (opt-in via env)
# ----------------------------------------------------------------------------

def jina_available() -> bool:
    return bool(os.environ.get("JINA_API_KEY"))


def jina_embed(texts: List[str], images: List[Image.Image]) -> Tuple[np.ndarray, np.ndarray]:
    """Embed texts and images via Jina CLIP v2 API. Returns (text, image) arrays.

    Raises on any HTTP / API error so the caller can fall back.
    """
    import base64
    import requests

    api_key = os.environ["JINA_API_KEY"]
    url = "https://api.jina.ai/v1/embeddings"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    def encode_image(img: Image.Image) -> str:
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode("ascii")

    def call(items: List[dict]) -> np.ndarray:
        if not items:
            return np.zeros((0, 1024), dtype=np.float32)
        payload = {
            "model": "jina-clip-v2",
            "input": items,
            "normalized": True,
        }
        r = requests.post(url, headers=headers, json=payload, timeout=60)
        r.raise_for_status()
        data = r.json()
        embs = [np.asarray(d["embedding"], dtype=np.float32) for d in data["data"]]
        return np.stack(embs, axis=0)

    text_items = [{"text": t} for t in texts]
    image_items = [{"image": encode_image(img)} for img in images]
    return call(text_items), call(image_items)
