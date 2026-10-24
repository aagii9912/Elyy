"""Давталттай (tileable) albedo текстурууд — numpy-гаар процедураар үүсгэнэ.

Бүх дуу чимээ FFT-ээр шүүсэн тул ирмэг дээрээ үргэлжилдэг (periodic).
Өнгөнүүд нь лавлах рендерүүдээс (public/images/interior) авсан sRGB утга.
"""

import os
import numpy as np
from PIL import Image

RNG = np.random.default_rng


def _noise(n, m, scale_u, scale_v, seed, power=2.0):
    """Periodic Gaussian-filtered noise, normalized to [-1, 1].
    scale_* — features per tile along u (columns) and v (rows)."""
    rng = RNG(seed)
    white = rng.standard_normal((m, n))
    f = np.fft.rfft2(white)
    fy = np.fft.fftfreq(m)[:, None] * m
    fx = np.fft.rfftfreq(n)[None, :] * n
    r2 = (fx / max(scale_u, 1e-3)) ** 2 + (fy / max(scale_v, 1e-3)) ** 2
    f *= np.exp(-0.5 * r2 * power)
    out = np.fft.irfft2(f, s=(m, n))
    out -= out.mean()
    out /= np.abs(out).max() + 1e-9
    return out


def _srgb(rgb):
    return np.array(rgb, dtype=np.float64) / 255.0


def _save(path, img):
    img = np.clip(img, 0, 1)
    Image.fromarray((img * 255 + 0.5).astype(np.uint8)).save(path)


def oak_floor(n=1024, seed=1):
    """2.4 × 2.4 m: 12 planks across (20 cm), 2 per length (1.2 m), staggered."""
    cols, rows = 12, 2
    pw = n // cols
    rng = RNG(seed)
    base = _srgb((204, 170, 131))
    v = np.arange(n)[:, None]
    u = np.arange(n)[None, :]
    col = np.minimum(u // pw, cols - 1)
    offs = (rng.random(cols) * n).astype(int)
    vv = (v + offs[col]) % n
    row = vv // (n // rows)
    plank = col * rows + row
    lum = rng.normal(0, 0.045, cols * rows)
    warm = rng.normal(0, 0.018, cols * rows)
    # банз бүр өөр годтой: багана бүрт тусдаа v-шилжилт
    g1 = _noise(n, n, 220, 5, seed + 1)
    g2 = _noise(n, n, 70, 2, seed + 2)
    g3 = _noise(n, n, 14, 1.2, seed + 4)
    sh = (rng.random(cols) * n).astype(int)
    gi = (v + sh[col]) % n
    g = 0.45 * g1[gi, u] + 0.35 * g2[gi, u] + 0.2 * g3[gi, u]
    blotch = _noise(n, n, 8, 3, seed + 3)
    img = np.ones((n, n, 3)) * base
    img *= (1 + lum[plank])[..., None]
    img *= (1 + warm[plank][..., None] * np.array([1.0, 0.2, -1.2]))
    img *= 1 - 0.16 * (np.clip(g, 0, 1) ** 1.6)[..., None] + 0.03 * blotch[..., None]
    img *= 1 + 0.04 * np.clip(-g, 0, 1)[..., None]
    seam_u = ((u % pw) < 1.2) | ((u % pw) > pw - 1.2)
    seam_v = ((vv % (n // rows)) < 1.5)
    seam = (seam_u | seam_v).astype(float)
    img *= (1 - 0.28 * seam[..., None])
    return img


def veneer(n=512, seed=4, base=(216, 190, 156), contrast=0.10):
    """Босоо нарийн судалтай өнгөлгөө (шүүгээ, хаалга, хананы хавтан)."""
    g1 = _noise(n, n, 120, 3, seed)
    g2 = _noise(n, n, 30, 1.5, seed + 1)
    bl = _noise(n, n, 6, 2, seed + 2)
    g = 0.6 * g1 + 0.4 * g2
    img = np.ones((n, n, 3)) * _srgb(base)
    img *= 1 - contrast * np.clip(g, 0, 1)[..., None] ** 1.5 + 0.03 * bl[..., None]
    return img


def walnut(n=512, seed=7):
    return veneer(n, seed, base=(82, 60, 47), contrast=0.22)


def travertine(n=1024, seed=10, tiles=(2, 1), grout=(232, 222, 205)):
    """1.2 × 1.2 м: 60 × 120 см хавтан (босоо), хэвтээ судал, нүх сүв."""
    rng = RNG(seed)
    base = _srgb((203, 186, 162))
    band = _noise(n, n, 2, 70, seed + 1)   # хэвтээ (v тэнхлэгийн) судал
    band2 = _noise(n, n, 5, 180, seed + 2)
    mott = _noise(n, n, 18, 18, seed + 3)
    img = np.ones((n, n, 3)) * base
    img *= 1 + (0.09 * band + 0.05 * band2 + 0.035 * mott)[..., None]
    warm = np.clip(band, 0, 1)[..., None] * np.array([0.02, -0.005, -0.03])
    img += warm
    pores = rng.random((n, n)) < 0.0018
    pores = pores | np.roll(pores, 1, 1) | np.roll(pores, 1, 0)
    img *= 1 - 0.18 * pores[..., None]
    tu, tv = tiles
    u = np.arange(n)[None, :] % (n // tu)
    v = np.arange(n)[:, None] % (n // tv)
    g = ((u < 1.5) | (v < 1.5)).astype(float)[..., None]
    img = img * (1 - g) + _srgb(grout) * g
    # хавтан бүр бага зэрэг өөр өнгө
    ti = (np.arange(n)[None, :] // (n // tu)) + tu * (np.arange(n)[:, None] // (n // tv))
    tone = rng.normal(0, 0.025, tu * tv)
    img *= (1 + tone[ti])[..., None]
    return img


def stone_floor(n=1024, seed=20):
    """1.2 × 1.2 м: 60 × 60 см том хавтан, саарал-бор."""
    rng = RNG(seed)
    base = _srgb((206, 201, 192))
    mott = _noise(n, n, 14, 14, seed + 1)
    fine = _noise(n, n, 120, 120, seed + 2)
    img = np.ones((n, n, 3)) * base
    img *= 1 + (0.035 * mott + 0.02 * fine)[..., None]
    u = np.arange(n)[None, :] % (n // 2)
    v = np.arange(n)[:, None] % (n // 2)
    g = ((u < 1.5) | (v < 1.5)).astype(float)[..., None]
    img = img * (1 - g) + _srgb((176, 172, 164)) * g
    ti = (np.arange(n)[None, :] // (n // 2)) + 2 * (np.arange(n)[:, None] // (n // 2))
    img *= (1 + rng.normal(0, 0.02, 4)[ti])[..., None]
    return img


def marble(n=1024, seed=30):
    """Цагаан гантиг — цөөн зөөлөн саарал судалтай (тавцан, арын хавтан)."""
    base = _srgb((237, 235, 231))
    w1 = _noise(n, n, 2.5, 2.5, seed)
    w2 = _noise(n, n, 7, 7, seed + 1)
    w3 = _noise(n, n, 20, 20, seed + 2)
    f = w1 + 0.35 * w2 + 0.12 * w3
    vein = np.exp(-(f / 0.035) ** 2) * 0.9 + np.exp(-((f - 0.45) / 0.02) ** 2) * 0.5
    haze = np.exp(-(f / 0.18) ** 2)
    img = np.ones((n, n, 3)) * base
    img *= (1 - 0.22 * vein[..., None] - 0.04 * haze[..., None])
    img *= 1 + 0.012 * _noise(n, n, 60, 60, seed + 3)[..., None]
    return img


def fabric(n=512, seed=40, base=(226, 218, 204), grain=0.07, loop=0.06):
    """Буклэ / даавуу — жижиг гогцоот бүтэц."""
    a = _noise(n, n, 160, 160, seed)
    b = _noise(n, n, 40, 40, seed + 1)
    img = np.ones((n, n, 3)) * _srgb(base)
    img *= 1 + (loop * a + grain * 0.5 * b)[..., None]
    return img


def linen(n=512, seed=50):
    a = _noise(n, n, 200, 20, seed)
    b = _noise(n, n, 6, 10, seed + 1)
    img = np.ones((n, n, 3)) * _srgb((240, 238, 233))
    img *= 1 + (0.025 * a + 0.03 * b)[..., None]
    return img


def rug(n=1024, seed=60):
    """1 × 1 м: нэхмэл ёлкан хээ (herringbone), цайвар саарал."""
    base = _srgb((210, 204, 192))
    dark = _srgb((176, 170, 158))
    u = np.arange(n)[None, :]
    v = np.arange(n)[:, None]
    p = 32  # хээний алхам (px)
    band = (u // p) % 2
    diag = ((u + np.where(band == 0, v, -v)) // 8) % 2
    t = 0.5 + 0.5 * diag
    img = base * (1 - 0.26 * (1 - t))[..., None] + 0 * dark
    img *= 1 + 0.05 * _noise(n, n, 300, 300, seed)[..., None]
    img *= 1 + 0.03 * _noise(n, n, 6, 6, seed + 1)[..., None]
    return img


def art_red(w=512, h=768, seed=70):
    """Улаан босоо зураастай хийсвэр зураг (зочны өрөө)."""
    a = _noise(w, h, 140, 4, seed)
    b = _noise(w, h, 20, 2, seed + 1)
    y = np.linspace(0, 1, h)[:, None]
    base = np.array([0.44, 0.10, 0.08]) * (0.75 + 0.35 * y)[..., None]
    img = base * (1 + 0.45 * a[..., None] + 0.25 * b[..., None])
    light = np.clip(a, 0.55, 1) - 0.55
    img += light[..., None] * np.array([0.9, 0.55, 0.45])
    return img


def art_marble(w=1024, h=512, seed=80):
    """Хар цагаан эргэлдсэн гантиг маягийн хийсвэр зураг."""
    w1 = _noise(w, h, 2, 2, seed)
    w2 = _noise(w, h, 5, 5, seed + 1)
    x = np.linspace(0, 1, w)[None, :]
    y = np.linspace(0, 1, h)[:, None]
    p = np.sin(2 * np.pi * (x * 1.5 + 1.8 * w1 + 0.6 * w2) * 2.0 + y * 6)
    t = 0.5 + 0.5 * np.tanh(3 * p)
    img = np.ones((h, w, 3)) * t[..., None] * np.array([0.93, 0.92, 0.9]) + (1 - t)[..., None] * np.array([0.08, 0.08, 0.09])
    img = img * (1 - 0.12 * np.exp(-((p) ** 2) * 30))[..., None] + np.exp(-((p - 0.2) ** 2) * 60)[..., None] * np.array([0.25, 0.18, 0.1])
    return img


def art_lines(w=512, h=640, seed=90):
    """Хар дэвсгэр дээр цагаан чөлөөт шугам (унтлагын өрөө)."""
    rng = RNG(seed)
    img = np.ones((h, w, 3)) * 0.055
    yy, xx = np.mgrid[0:h, 0:w]
    for _ in range(14):
        cx, cy = rng.random() * w, rng.random() * h
        ang = rng.random() * np.pi
        ln = 60 + rng.random() * 220
        t = np.linspace(-0.5, 0.5, 220)
        px = cx + np.cos(ang) * t * ln + 25 * np.sin(t * 9 + rng.random() * 6)
        py = cy + np.sin(ang) * t * ln + 25 * np.cos(t * 7 + rng.random() * 6)
        for x, y in zip(px, py):
            xi, yi = int(x), int(y)
            if 2 <= xi < w - 2 and 2 <= yi < h - 2:
                img[yi - 1:yi + 2, xi - 1:xi + 2] = 0.86
    return img


def art_print(w=384, h=512, seed=100):
    """Цайвар цаасан дээрх хар хийсвэр хэлбэр (жааз)."""
    rng = RNG(seed)
    img = np.ones((h, w, 3)) * _srgb((236, 230, 220))
    yy, xx = np.mgrid[0:h, 0:w]
    for i in range(3):
        cx, cy = w * (0.3 + 0.4 * rng.random()), h * (0.25 + 0.5 * rng.random())
        rx, ry = w * (0.08 + 0.15 * rng.random()), h * (0.05 + 0.12 * rng.random())
        m = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 < 1
        col = [0.06, 0.06, 0.06] if i < 2 else [0.62, 0.45, 0.3]
        img[m] = col
    return img


def radiator(n=256):
    """0.6 м: 5 см тутамд босоо хонхорхой (цагаан радиатор)."""
    u = np.arange(n)[None, :] % (n // 12)
    g = np.where(u < 3, 0.8, 1.0)
    img = np.ones((n, n, 3)) * 0.95 * g[..., None]
    return img


TEXTURES = {
    "oak_floor": oak_floor,
    "oak_veneer": veneer,
    "walnut": walnut,
    "travertine": travertine,
    "stone_floor": stone_floor,
    "marble": marble,
    "boucle": fabric,
    "fabric_grey": lambda: fabric(seed=41, base=(196, 192, 184), grain=0.08, loop=0.05),
    "velvet_olive": lambda: fabric(seed=42, base=(96, 98, 62), grain=0.12, loop=0.04),
    "leather": lambda: fabric(seed=43, base=(104, 54, 36), grain=0.10, loop=0.02),
    "linen": linen,
    "rug": rug,
    "art_red": art_red,
    "art_marble": art_marble,
    "art_lines": art_lines,
    "art_print": art_print,
    "art_print2": lambda: art_print(seed=101),
    "radiator": radiator,
}


def generate(out_dir, names=None, force=False):
    os.makedirs(out_dir, exist_ok=True)
    paths = {}
    for name, fn in TEXTURES.items():
        if names and name not in names:
            continue
        p = os.path.join(out_dir, f"{name}.png")
        if force or not os.path.exists(p):
            _save(p, fn())
        paths[name] = p
    return paths


if __name__ == "__main__":
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", ".cache", "tex")
    ps = generate(out, force=True)
    print("\n".join(ps.values()))
