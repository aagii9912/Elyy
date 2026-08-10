"""Axonometric renders → web assets.

Trims the empty studio backdrop around each plan (the renders are framed
loosely, so ~30% of every file is flat colour) and writes a 1600px
(lightbox) + 800px (card) JPEG pair into public/images/axono.
"""

from pathlib import Path

from PIL import Image, ImageChops

SRC = Path("~/Downloads/Elysium axonometr renders").expanduser()
OUT = Path(__file__).resolve().parent.parent / "public" / "images" / "axono"

JOBS = [
    ("type A - 2 79.70sqm.png", "a-01"),
    ("type A - 3 79.70sqm.png", "a-02"),
    ("Type B 137.59sqm - 2.png", "b-01"),
    ("Type B 137.59sqm -3.png", "b-02"),
    ("type C - 2 78.67sqm.png", "c-01"),
    ("type C - 3 78.67sqm.png", "c-02"),
    ("type D - 2 50.15sqm.png", "d-01"),
    ("type D - 3 50.15sqm.png", "d-02"),
    ("type E - 2 88.08sqm.png", "e-01"),
    ("type E - 3 88.08sqm.png", "e-02"),
    ("Elysium 2F axono render/type D 2F_1.png", "d2f-01"),
    ("Elysium 2F axono render/type D 2F_2.png", "d2f-02"),
    ("Elysium 2F axono render/type E 2F _ 1.png", "e2f-01"),
    ("Elysium 2F axono render/type E 2F _ 2.png", "e2f-02"),
]

PAD = 0.04          # breathing room around the plan, share of its long edge
SIZES = [("", 1600), ("-sm", 800)]


def content_box(im, bg_color):
    """Bounding box of everything that is not the flat studio backdrop."""
    bg = Image.new("RGB", im.size, bg_color)
    diff = ImageChops.difference(im, bg).convert("L")
    return diff.point(lambda p: 255 if p > 6 else 0).getbbox()


for name, slug in JOBS:
    im = Image.open(SRC / name).convert("RGB")
    bg_color = im.getpixel((0, 0))  # flat backdrop, identical across all 14
    left, top, right, bottom = content_box(im, bg_color)

    pad = round(max(right - left, bottom - top) * PAD)
    plan = im.crop((max(left - pad, 0), max(top - pad, 0),
                    min(right + pad, im.width), min(bottom + pad, im.height)))

    for suffix, long_edge in SIZES:
        scale = long_edge / max(plan.size)
        out = plan.resize((round(plan.width * scale), round(plan.height * scale)),
                          Image.LANCZOS)
        out.save(OUT / f"{slug}{suffix}.jpg", quality=82, optimize=True,
                 progressive=True)
    print(f"{slug}: {im.size} → {plan.size}")
