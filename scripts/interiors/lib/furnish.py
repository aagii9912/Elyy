"""Тавилга ба гэрэлтүүлэг — лавлах рендерийн хэв маяг:
цайвар царс шал/хавтан, буклэ буйдан, чидун ногоон сандал, хүрэн арьсан
S сандал, бараан хоолны ширээ, органик унжлага гэрэл, хар шилэн ТВ хана,
бараан модон толгойн хавтан + LED, травертин угаалгын өрөө.

Загварын локал координат: X — өргөн (төвлөрсөн), Y — урагш (Y=0 ханан
дээр наалдах ар тал), Z — дээш. Байрлуулахдаа place(x, z, rot).
"""

import math
import random

import bmesh
from mathutils import Matrix, Vector

from .core import (box, cyl, face_rot, fv, ico, place, quad, ribbon, sphere, superellipse, transform, tube)
from .lights import WARM


def rot_x(bm, ang, pivot=(0, 0, 0)):
    p = Vector(pivot)
    transform(bm, Matrix.Translation(p) @ Matrix.Rotation(ang, 4, "X") @ Matrix.Translation(-p))
    return bm


def rot_z(bm, ang, pivot=(0, 0, 0)):
    p = Vector(pivot)
    transform(bm, Matrix.Translation(p) @ Matrix.Rotation(ang, 4, "Z") @ Matrix.Translation(-p))
    return bm


def chaikin(pts, it=3):
    for _ in range(it):
        out = [pts[0]]
        for a, b in zip(pts[:-1], pts[1:]):
            out.append((a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25))
            out.append((a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75))
        out.append(pts[-1])
        pts = out
    return pts


class Model:
    def __init__(self):
        self.parts = []
        self.lights = []
        self.foot = None    # (x0, x1, y0, y1) локал — эзлэх талбайг гараар заах
        self.radius = None  # эргэлтээс үл хамаарах дугуй ойролцоолол

    def add(self, bm, mat, bucket="interior", smooth=True, uv=None):
        self.parts.append((bucket, bm, mat, smooth, uv))
        return self

    def light(self, kind, **kw):
        self.lights.append((kind, kw))
        return self

    def bounds(self):
        if self.foot:
            return self.foot
        xs, ys = [], []
        for bucket, bm, *_ in self.parts:
            if bucket not in ("interior",):
                continue
            for v in bm.verts:
                xs.append(v.co.x)
                ys.append(v.co.y)
        if not xs:
            return None
        return min(xs), max(xs), min(ys), max(ys)


# ====================================================================== models

def m_sofa(w, d=1.0):
    m = Model()
    m.add(box(w - 0.14, d - 0.2, 0.09, cy=d / 2 + 0.02), "graphite", smooth=False)
    n = 3 if w > 2.3 else 2
    mw = w / n
    for k in range(n):
        cx = -w / 2 + mw * (k + 0.5)
        m.add(box(mw - 0.012, d - 0.26, 0.2, cx=cx, cy=0.26 + (d - 0.26) / 2, cz=0.09, bevel=0.07, seg=4), "boucle")
        back = box(mw - 0.012, 0.27, 0.44, cx=cx, cy=0.15, cz=0.09, bevel=0.1, seg=4)
        m.add(rot_x(back, -0.08, (cx, 0.15, 0.09)), "boucle")
    rnd = random.Random(int(w * 100))
    for k, (mat, x) in enumerate((("cushion_accent", -w / 2 + 0.42), ("cushion_sage", -w / 2 + 0.85), ("boucle", w / 2 - 0.45))):
        p = box(0.46, 0.15, 0.44, cx=x, cy=0.36, cz=0.28, bevel=0.07, seg=3)
        rot_x(p, -0.3, (x, 0.36, 0.28))
        rot_z(p, (rnd.random() - 0.5) * 0.3, (x, 0.36, 0.28))
        m.add(p, mat)
    return m


def m_lounge():
    m = Model()
    m.add(cyl(0.24, 0.025, seg=32), "metal_black")
    m.add(cyl(0.035, 0.2, z0=0.025, seg=16), "metal_black")
    m.add(superellipse(0.4, 0.37, 0.15, z0=0.22, n=2.6, seg=48, bevel=0.06, cy=0.03), "velvet_olive")
    back = sphere(0.44, 0.15, 0.3, cy=-0.27, cz=0.6, seg=32, rings=16)
    m.add(rot_x(back, 0.25, (0, -0.27, 0.6)), "velvet_olive")
    m.radius = 0.42
    return m


def m_s_chair():
    pts = chaikin([(0.23, 0.012), (-0.22, 0.012), (0.2, 0.43), (-0.21, 0.45), (-0.26, 0.86)], 3)
    m = Model()
    m.add(ribbon(pts, 0.46, 0.032), "leather")
    return m


def m_dining(lt, wt=0.92):
    m = Model()
    m.add(box(lt, wt, 0.045, cz=0.71, bevel=0.01, seg=2), "walnut")
    for sx in (-1, 1):
        m.add(cyl(0.13, 0.71, cx=sx * (lt / 2 - 0.38), seg=28, r2=0.1), "stone_dark")
    # декор: ваар, цэцэг
    m.add(cyl(0.07, 0.2, z0=0.755, seg=20, r2=0.05), "ceramic")
    for i in range(5):
        a = i * 1.26
        m.add(ico(0.045, math.cos(a) * 0.05, math.sin(a) * 0.05, 1.0 + (i % 2) * 0.03, sub=1, jitter=0.2, seed=i), "linen")
    m.add(cyl(0.16, 0.05, cx=lt * 0.25, z0=0.755, seg=24, r2=0.12), "stone_dark")
    return m


def m_coffee():
    m = Model()
    m.add(box(1.1, 0.62, 0.34, bevel=0.012, seg=2), "travertine")
    m.add(box(0.32, 0.24, 0.05, cx=-0.22, cz=0.34, bevel=0.004), "book_a")
    m.add(box(0.28, 0.21, 0.04, cx=-0.22, cz=0.39, bevel=0.004), "book_b")
    m.add(sphere(0.12, 0.12, 0.05, cx=0.25, cz=0.36, seg=24, rings=8), "stone_dark")
    return m


def m_side_table(r=0.22, h=0.5, mat="stone_dark"):
    m = Model()
    m.add(cyl(r, 0.035, z0=h - 0.035, seg=32, bevel=0.008), mat)
    m.add(cyl(r * 0.45, h - 0.035, seg=24, r2=r * 0.32), mat)
    return m


def m_arc_lamp(reach=1.25):
    m = Model()
    m.add(cyl(0.17, 0.035, seg=32, bevel=0.01), "stone_dark")
    pts = [(0, 0, 0.035), (0, -0.02, 0.8), (0, 0.05, 1.5), (0, 0.35, 1.92), (0, 0.8, 2.02), (0, reach, 1.82)]
    m.add(tube(pts, 0.011, seg=8), "metal_black")
    head = sphere(0.2, 0.2, 0.07, cy=reach, cz=1.78, seg=32, rings=10)
    m.add(head, "metal_black")
    m.add(cyl(0.17, 0.004, cy=reach, z0=1.705, seg=32), "emit_warm", bucket="emit", smooth=False)
    m.light("spot", center=Vector((0, reach, 1.69)), direction=Vector((0, 0, -1)), energy=40, angle=95, blend=0.8, radius=0.12)
    m.radius = 0.2
    return m


def m_tvwall(ln, H):
    m = Model()
    m.add(box(ln, 0.025, H - 0.004, cy=0.0125), "oak_veneer", smooth=False)
    m.add(box(ln - 0.3, 0.018, 0.78, cy=0.034, cz=0.98), "black_glass", smooth=False)
    cl = min(ln - 0.2, 2.8)
    m.add(box(cl, 0.42, 0.3, cy=0.025 + 0.21, cz=0.2, bevel=0.004, seg=1), "walnut", smooth=False)
    m.add(box(cl - 0.12, 0.02, 0.005, cy=0.38, cz=0.194), "emit_warm", bucket="emit", smooth=False)
    m.light("strip", a=Vector((-cl / 2 + 0.06, 0.38, 0.19)), b=Vector((cl / 2 - 0.06, 0.38, 0.19)),
            direction=Vector((0, 0.3, -1)), w_per_m=10.0)
    m.add(cyl(0.06, 0.28, cx=-cl / 2 + 0.3, cy=0.25, z0=0.5, seg=20, r2=0.04), "ceramic")
    m.add(box(0.3, 0.22, 0.06, cx=cl / 2 - 0.4, cy=0.24, cz=0.5, bevel=0.004), "book_b")
    return m


def m_bed(bw):
    m = Model()
    m.add(box(bw + 0.34, 0.15, 1.0, cy=0.075, bevel=0.07, seg=4), "fabric_grey")
    m.add(box(bw + 0.24, 2.2, 0.3, cy=0.15 + 1.1, bevel=0.08, seg=4), "fabric_grey")
    m.add(box(bw, 2.0, 0.2, cy=0.22 + 1.0, cz=0.28, bevel=0.05, seg=3), "linen")
    m.add(box(bw + 0.08, 1.5, 0.08, cy=0.68 + 0.75, cz=0.45, bevel=0.035, seg=3), "linen")
    m.add(box(bw + 0.14, 0.48, 0.03, cy=1.78, cz=0.525, bevel=0.012, seg=2), "throw_grey")
    for sx in (-1, 1):
        p = box(bw / 2 - 0.08, 0.17, 0.44, cx=sx * bw / 4, cy=0.34, cz=0.46, bevel=0.07, seg=3)
        m.add(rot_x(p, -0.35, (sx * bw / 4, 0.34, 0.46)), "linen")
    p = box(0.48, 0.14, 0.34, cx=-0.18, cy=0.56, cz=0.48, bevel=0.06, seg=3)
    m.add(rot_x(p, -0.3, (-0.18, 0.56, 0.48)), "cushion_sage")
    p = box(0.42, 0.13, 0.3, cx=0.22, cy=0.6, cz=0.48, bevel=0.06, seg=3)
    m.add(rot_x(p, -0.3, (0.22, 0.6, 0.48)), "boucle")
    return m


def m_night_lamp():
    m = m_side_table(0.24, 0.48, "stone_dark")
    m.add(cyl(0.05, 0.22, z0=0.48, seg=16, r2=0.035), "ceramic")
    m.add(cyl(0.12, 0.17, z0=0.68, seg=28, r2=0.1), "emit_soft", bucket="emit")
    m.light("point", center=Vector((0, 0, 0.77)), energy=12, radius=0.08)
    return m


def m_wardrobe(w, d, H):
    m = Model()
    m.add(box(w, d - 0.02, H - 0.006), "oak_veneer", smooth=False)
    n = max(1, round(w / 0.5))
    dw = w / n
    for k in range(n):
        cx = -w / 2 + dw * (k + 0.5)
        m.add(box(dw - 0.006, 0.02, H - 0.04, cx=cx, cy=d - 0.01, cz=0.02), "oak_veneer", smooth=False)
    return m


def m_kitchen(ln, H, tall_side, tall_w):
    """Гал тогооны мөр: ln урт, tall_side ("left"/"right"/None) талд өндөр шүүгээ."""
    m = Model()
    bx0, bx1 = -ln / 2, ln / 2
    if tall_side == "left":
        tx0, tx1 = bx0, bx0 + tall_w
        bx0 = tx1
    elif tall_side == "right":
        tx0, tx1 = bx1 - tall_w, bx1
        bx1 = tx0
    blen = bx1 - bx0
    bc = (bx0 + bx1) / 2
    if blen > 0.3:
        m.add(box(blen, 0.52, 0.1, cx=bc, cy=0.26), "graphite", smooth=False)
        m.add(box(blen, 0.56, 0.76, cx=bc, cy=0.28, cz=0.1), "cabinet_white", smooth=False)
        n = max(1, round(blen / 0.6))
        dw = blen / n
        for k in range(n):
            cx = bx0 + dw * (k + 0.5)
            m.add(box(dw - 0.005, 0.02, 0.37, cx=cx, cy=0.57, cz=0.1), "cabinet_white", smooth=False)
            m.add(box(dw - 0.005, 0.02, 0.37, cx=cx, cy=0.57, cz=0.48), "cabinet_white", smooth=False)
        m.add(box(blen, 0.62, 0.04, cx=bc, cy=0.31, cz=0.86), "marble", smooth=False)
        m.add(box(blen, 0.015, 0.56, cx=bc, cy=0.0075, cz=0.9), "marble", smooth=False)
        up0 = 1.46
        m.add(box(blen, 0.34, H - up0 - 0.004, cx=bc, cy=0.17, cz=up0), "cabinet_white", smooth=False)
        for k in range(n):
            cx = bx0 + dw * (k + 0.5)
            m.add(box(dw - 0.005, 0.02, H - up0 - 0.03, cx=cx, cy=0.35, cz=up0), "cabinet_white", smooth=False)
        m.add(box(blen - 0.1, 0.02, 0.005, cx=bc, cy=0.3, cz=up0 - 0.006), "emit_warm", bucket="emit", smooth=False)
        m.light("strip", a=Vector((bx0 + 0.05, 0.3, up0 - 0.01)), b=Vector((bx1 - 0.05, 0.3, up0 - 0.01)),
                direction=Vector((0, 0.15, -1)), w_per_m=16.0)
        hx = bx0 + blen * 0.32
        sx = bx0 + blen * 0.74
        m.add(box(0.6, 0.5, 0.006, cx=hx, cy=0.31, cz=0.9), "black_glass", smooth=False)
        m.add(box(0.62, 0.42, 0.004, cx=sx, cy=0.31, cz=0.9), "graphite", smooth=False)
        m.add(tube([(sx, 0.08, 0.9), (sx, 0.08, 1.2), (sx, 0.14, 1.27), (sx, 0.26, 1.23)], 0.012, seg=8), "metal_black")
        m.add(box(0.42, 0.28, 0.02, cx=bc + blen * 0.05, cy=0.1, cz=0.9, bevel=0.004), "walnut")
        m.add(cyl(0.09, 0.08, cx=bc - blen * 0.08, cy=0.35, z0=0.9, seg=20, r2=0.06), "ceramic")
    if tall_side:
        tc = (tx0 + tx1) / 2
        m.add(box(tx1 - tx0, 0.6, H - 0.005, cx=tc, cy=0.3), "oak_veneer", smooth=False)
        nt = max(1, round((tx1 - tx0) / 0.6))
        dw = (tx1 - tx0) / nt
        for k in range(nt):
            cx = tx0 + dw * (k + 0.5)
            m.add(box(dw - 0.006, 0.02, H - 0.04, cx=cx, cy=0.61, cz=0.02), "oak_veneer", smooth=False)
        cx = tx0 + dw * 0.5
        m.add(box(dw - 0.08, 0.012, 0.58, cx=cx, cy=0.625, cz=0.82), "black_glass", smooth=False)
        m.add(box(dw - 0.08, 0.012, 0.38, cx=cx, cy=0.625, cz=1.46), "black_glass", smooth=False)
    return m


def m_vanity(w, depth=0.48):
    m = Model()
    m.add(box(w, depth, 0.36, cy=depth / 2, cz=0.5, bevel=0.004, seg=1), "oak_veneer", smooth=False)
    m.add(box(w, depth + 0.02, 0.025, cy=(depth + 0.02) / 2, cz=0.86), "marble", smooth=False)
    m.add(superellipse(min(0.24, w / 2 - 0.05), min(0.17, depth / 2 - 0.05), 0.12, z0=0.885, n=2.6, seg=40, bevel=0.02, cy=depth / 2 + 0.02), "ceramic")
    m.add(tube([(0, 0.0, 1.06), (0, 0.16, 1.06), (0, 0.2, 1.02)], 0.011, seg=8), "metal_black")
    mw = w * 0.92
    m.add(box(mw + 0.04, 0.01, 0.84, cy=0.005, cz=1.11), "emit_soft", bucket="emit", smooth=False)
    m.add(box(mw, 0.025, 0.8, cy=0.022, cz=1.13, bevel=0.01, seg=2), "mirror", smooth=False)
    m.light("rect", center=Vector((0, 0.04, 1.53)), sx=mw, sy=0.05, direction=Vector((0, 1, -0.4)), energy=18)
    m.light("strip", a=Vector((-w / 2 + 0.05, depth - 0.03, 0.49)), b=Vector((w / 2 - 0.05, depth - 0.03, 0.49)),
            direction=Vector((0, 0, -1)), w_per_m=8.0)
    m.add(box(w - 0.1, 0.02, 0.005, cy=depth - 0.03, cz=0.494), "emit_warm", bucket="emit", smooth=False)
    return m


def m_wc():
    m = Model()
    m.add(box(0.36, 0.17, 0.34, cy=0.085, cz=0.22, bevel=0.04, seg=3), "ceramic")
    m.add(sphere(0.18, 0.27, 0.15, cy=0.33, cz=0.37, seg=32, rings=12), "ceramic")
    m.add(superellipse(0.185, 0.25, 0.025, z0=0.46, n=2.2, seg=40, bevel=0.01, cy=0.34), "ceramic")
    m.add(box(0.22, 0.012, 0.15, cy=0.006, cz=0.98, bevel=0.003), "chrome", smooth=False)
    return m


def m_tub(lx, ly, h=0.56):
    """Чөлөөт ванн: гадна хана, ирмэг, дотор хөндий."""
    bm = bmesh.new()
    seg = 56
    rx, ry = lx / 2, ly / 2

    def ring(sx, sy, z, n=3.2):
        out = []
        for i in range(seg):
            t = 2 * math.pi * i / seg
            c, s = math.cos(t), math.sin(t)
            out.append(bm.verts.new((sx * math.copysign(abs(c) ** (2 / n), c), sy * math.copysign(abs(s) ** (2 / n), s), z)))
        return out

    rings = [
        ring(rx * 0.97, ry * 0.95, 0.0),
        ring(rx, ry, 0.12),
        ring(rx, ry, h - 0.04),
        ring(rx * 0.985, ry * 0.975, h),
        ring(rx - 0.06, ry - 0.06, h - 0.004),
        ring(rx - 0.07, ry - 0.07, h - 0.08),
        ring(rx - 0.12, ry - 0.1, 0.16),
    ]
    for a, b in zip(rings[:-1], rings[1:]):
        for i in range(seg):
            j = (i + 1) % seg
            bm.faces.new([a[i], a[j], b[j], b[i]])
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    m = Model()
    m.add(bm, "ceramic")
    m.add(tube([(rx - 0.15, 0, h), (rx - 0.15, 0, h + 0.25), (rx - 0.28, 0, h + 0.3)], 0.012, seg=8), "metal_black")
    return m


def m_towel_rail():
    m = Model()
    for sx in (-0.25, 0.25):
        m.add(tube([(sx, 0.05, 0.3), (sx, 0.05, 1.4)], 0.014, seg=10), "metal_black")
    for k in range(7):
        z = 0.38 + k * 0.16
        m.add(tube([(-0.25, 0.05, z), (0.25, 0.05, z)], 0.008, seg=8), "metal_black")
    m.add(box(0.44, 0.06, 0.55, cy=0.1, cz=0.72, bevel=0.025, seg=2), "linen")
    return m


def m_shower(sw, H):
    """Шүршүүрийн шил (glass), тааз руу бэхэлсэн бороон толгой (ceiling)."""
    m = Model()
    m.add(quad([(-sw / 2, 0, 0.02), (sw / 2, 0, 0.02), (sw / 2, 0, 2.05), (-sw / 2, 0, 2.05)]), "glass", bucket="glass", smooth=False)
    m.add(box(sw, 0.012, 0.03, cz=2.05), "metal_black", smooth=False)
    return m


def m_plant(height=1.7, seed=3):
    rnd = random.Random(seed)
    m = Model()
    m.add(cyl(0.27, 0.44, seg=32, r2=0.23, bevel=0.015), "planter")
    m.add(cyl(0.235, 0.012, z0=0.42, seg=28), "soil", smooth=False)
    top = height
    pts = [(0, 0, 0.42), (0.03, 0.02, 0.8), (-0.04, 0.03, 1.2), (0.02, -0.02, top - 0.25)]
    m.add(tube(pts, 0.022, seg=8), "trunk")
    for k in range(9):
        a = rnd.random() * 2 * math.pi
        rr = 0.1 + rnd.random() * 0.22
        zz = 0.95 + (top - 0.95) * (k / 8) ** 0.8
        r = 0.16 + rnd.random() * 0.12
        x, y = math.cos(a) * rr, math.sin(a) * rr
        if rr > 0.12:
            m.add(tube([(0, 0, zz - 0.15), (x * 0.8, y * 0.8, zz)], 0.008, seg=6), "trunk")
        m.add(ico(r, x, y, zz, sub=3, squash=0.72, jitter=0.22, seed=seed * 31 + k), "foliage" if k % 3 else "foliage2")
    m.radius = 0.3
    return m


def m_small_plant(seed=5):
    m = Model()
    m.add(cyl(0.08, 0.13, seg=20, r2=0.065), "ceramic")
    for k in range(4):
        a = k * 1.7
        m.add(ico(0.065, math.cos(a) * 0.04, math.sin(a) * 0.04, 0.2 + k * 0.03, sub=1, jitter=0.3, seed=seed + k), "foliage2")
    return m


def m_art(w, h, mat, frame="metal_black"):
    m = Model()
    m.add(box(w, 0.028, h, cy=0.014), mat, smooth=False, uv="fit")
    f = 0.018
    for x0, x1, z0, z1 in ((-w / 2 - f, -w / 2, 0, h), (w / 2, w / 2 + f, 0, h), (-w / 2 - f, w / 2 + f, -f, 0), (-w / 2 - f, w / 2 + f, h, h + f)):
        m.add(box(x1 - x0, 0.034, z1 - z0, cx=(x0 + x1) / 2, cy=0.017, cz=z0), frame, smooth=False)
    return m


def m_rug(w, d):
    m = Model()
    m.add(box(w, d, 0.012, cy=0, bevel=0.004, seg=1), "rug", smooth=False)
    return m


def m_shelving(w, d, H):
    """Хувцасны нээлттэй тавиур + LED + өлгөөтэй хувцас."""
    m = Model()
    n = max(1, round(w / 0.9))
    dw = w / n
    for k in range(n + 1):
        x = -w / 2 + dw * k
        m.add(box(0.03, d, H - 0.01, cx=x, cy=d / 2), "metal_black", smooth=False)
    for z in (0.12, 1.85, 2.2):
        m.add(box(w, d, 0.025, cy=d / 2, cz=z), "walnut", smooth=False)
    rnd = random.Random(int(w * 37))
    mats = ["clothes_a", "clothes_b", "clothes_c", "linen"]
    for k in range(n):
        x0 = -w / 2 + dw * k + 0.06
        m.add(tube([(x0, d / 2, 1.75), (x0 + dw - 0.12, d / 2, 1.75)], 0.01, seg=8), "chrome")
        x = x0 + 0.04
        while x < x0 + dw - 0.14:
            t = 0.04 + rnd.random() * 0.05
            hh = 0.7 + rnd.random() * 0.35
            m.add(box(t, d * 0.8, hh, cx=x, cy=d / 2, cz=1.72 - hh, bevel=0.012, seg=1), rnd.choice(mats))
            x += t + 0.015
        m.add(box(dw - 0.1, 0.012, 0.005, cx=-w / 2 + dw * (k + 0.5), cy=d - 0.03, cz=1.83), "emit_warm", bucket="emit", smooth=False)
        m.light("strip", a=Vector((x0, d - 0.04, 1.82)), b=Vector((x0 + dw - 0.12, d - 0.04, 1.82)),
                direction=Vector((0, 0.2, -1)), w_per_m=12.0)
        for s in range(3):
            m.add(box(0.22, d * 0.6, 0.1, cx=x0 + 0.15 + s * 0.26, cy=d / 2, cz=0.145, bevel=0.01), rnd.choice(["book_b", "clothes_b", "clothes_c"]))
    return m


def m_bench(w):
    m = Model()
    m.add(box(w, 0.38, 0.06, cz=0.4, bevel=0.006), "walnut", smooth=False)
    for sx in (-1, 1):
        m.add(box(0.05, 0.36, 0.4, cx=sx * (w / 2 - 0.08)), "metal_black", smooth=False)
    return m


def m_round_mirror(r=0.38):
    m = Model()
    bm = cyl(r, 0.02, seg=48)
    transform(bm, Matrix.Rotation(math.pi / 2, 4, "X"))
    transform(bm, Matrix.Translation((0, 0.02, 0)))
    m.add(bm, "mirror", smooth=False)
    bm = cyl(r + 0.015, 0.012, seg=48)
    transform(bm, Matrix.Rotation(math.pi / 2, 4, "X"))
    transform(bm, Matrix.Translation((0, 0.008, 0)))
    m.add(bm, "metal_black", smooth=False)
    return m


def m_rattan_chair():
    m = Model()
    m.add(box(0.7, 0.72, 0.36, bevel=0.06, seg=3), "rattan")
    m.add(box(0.6, 0.55, 0.1, cy=0.04, cz=0.36, bevel=0.04, seg=3), "linen")
    back = box(0.7, 0.14, 0.42, cy=-0.29, cz=0.36, bevel=0.06, seg=3)
    m.add(rot_x(back, 0.15, (0, -0.29, 0.36)), "rattan")
    return m


# ====================================================================== context

class Ctx:
    def __init__(self, lay, B, lights):
        self.lay = lay
        self.B = B
        self.lights = lights

    def put(self, model, x, z, rot=0.0, y=0.0, room=None, occupy=True):
        M = place(x, z, rot, y)
        R = M.to_3x3()
        rect = self.rect_of(model, M) if room is not None and occupy else None
        for bucket, bm, mat, smooth, uv in model.parts:
            self.B[bucket].add(bm, mat, M, smooth, uv)
            bm.free()
        for kind, kw in model.lights:
            kw = dict(kw)
            for k in ("center", "a", "b"):
                if k in kw:
                    kw[k] = M @ kw[k]
            if "direction" in kw:
                kw["direction"] = R @ kw["direction"]
            if "along" in kw:
                kw["along"] = R @ Vector(kw["along"])
            getattr(self.lights, kind)(**kw)
        model.parts.clear()
        if rect:
            room.occupy(rect)

    @staticmethod
    def rect_of(model, M):
        if model.radius:
            p = M @ Vector((0, 0, 0))
            r = model.radius
            return (p.x - r, p.x + r, -p.y - r, -p.y + r)
        b = model.bounds()
        if not b:
            return None
        xs, zs = [], []
        for x in (b[0], b[1]):
            for y in (b[2], b[3]):
                p = M @ Vector((x, y, 0))
                xs.append(p.x)
                zs.append(-p.y)
        return (min(xs), max(xs), min(zs), max(zs))

    def footprint(self, model, x, z, rot):
        return self.rect_of(model, place(x, z, rot))

    def blocked_any(self, rect, rooms=None, pad=0.0):
        for r in rooms or self.lay.rooms:
            if r.blocked(rect, pad):
                return True
        return False

    # ---- таазны гэрэлтүүлэг
    def cove(self, a, b, toward_wall, H=None):
        """Хана–таазны уулзварт LED: (a, b) frame (x, z) цэгүүд, toward_wall (fx, fz)."""
        H = H or self.lay.H
        tx, tz = toward_wall
        (ax, az), (bx, bz) = a, b
        ln = math.hypot(bx - ax, bz - az)
        if ln < 0.4:
            return
        bm = box(ln, 0.035, 0.004, cz=-0.004)
        ang = math.atan2(-(bz - az), bx - ax)
        M = Matrix.Translation(fv((ax + bx) / 2, H, (az + bz) / 2)) @ Matrix.Rotation(ang, 4, "Z")
        self.B["ceiling_emit"].add(bm, "emit_warm", M, False)
        bm.free()
        d = Vector((tx * 0.45, -tz * 0.45, -1.0))
        self.lights.strip(fv(ax, H - 0.02, az), fv(bx, H - 0.02, bz), d)

    def downlight(self, x, z, energy=14, angle=70):
        H = self.lay.H
        bm = cyl(0.045, 0.004, z0=-0.004, seg=24)
        self.B["ceiling_emit"].add(bm, "emit_soft", Matrix.Translation(fv(x, H, z)), False)
        bm.free()
        bm = cyl(0.06, 0.006, z0=-0.003, seg=24)
        self.B["ceiling"].add(bm, "metal_black", Matrix.Translation(fv(x, H, z)), False)
        bm.free()
        self.lights.spot(fv(x, H - 0.03, z), Vector((0, 0, -1)), energy, angle=angle, blend=0.7, radius=0.03)

    def track(self, x, z0, z1, along="z"):
        H = self.lay.H
        ln = z1 - z0
        bm = box(0.035, ln, 0.045, cz=-0.045)
        M = Matrix.Translation(fv(x, H, (z0 + z1) / 2)) if along == "z" else Matrix.Translation(fv((z0 + z1) / 2, H, x)) @ Matrix.Rotation(math.pi / 2, 4, "Z")
        self.B["ceiling"].add(bm, "metal_black", M, False)
        bm.free()
        bm = box(0.016, ln - 0.06, 0.003, cz=-0.048)
        self.B["ceiling_emit"].add(bm, "emit_warm", M, False)
        bm.free()
        if along == "z":
            a, b = fv(x, H - 0.05, z0 + 0.05), fv(x, H - 0.05, z1 - 0.05)
        else:
            a, b = fv(z0 + 0.05, H - 0.05, x), fv(z1 - 0.05, H - 0.05, x)
        self.lights.strip(a, b, Vector((0, 0, -1)), w_per_m=9.0, width=0.016, spread=110)

    def pendant(self, x, z, rx=0.62, ry=0.34, drop=0.88, rot=0.0):
        H = self.lay.H
        y = H - drop
        M = Matrix.Translation(fv(x, y, z)) @ Matrix.Rotation(rot, 4, "Z")
        bm = superellipse(rx, ry, 0.05, n=2.4, seg=64, bevel=0.022)
        self.B["ceiling"].add(bm, "frame_white", M, True)
        bm.free()
        bm = superellipse(rx - 0.04, ry - 0.04, 0.002, z0=-0.003, n=2.4, seg=64)
        self.B["ceiling_emit"].add(bm, "emit_warm", M, False)
        bm.free()
        for sx in (-rx * 0.5, rx * 0.5):
            bm = tube([(sx, 0, 0.05), (sx, 0, drop)], 0.0025, seg=6, caps=False)
            self.B["ceiling"].add(bm, "metal_black", M, False)
            bm.free()
        self.lights.rect(M @ Vector((0, 0, -0.01)), rx * 1.6, ry * 1.6, Vector((0, 0, -1)), 70,
                         along=M.to_3x3() @ Vector((1, 0, 0)), color=WARM, spread=160)
        self.lights.rect(M @ Vector((0, 0, 0.06)), rx * 1.2, ry * 1.2, Vector((0, 0, 1)), 14,
                         along=M.to_3x3() @ Vector((1, 0, 0)), color=WARM, spread=180)

    def ring_lamp(self, x, z, r=0.32):
        H = self.lay.H
        M = Matrix.Translation(fv(x, H, z))
        bm = superellipse(r, r, 0.04, z0=-0.04, n=2.0, seg=56, bevel=0.012)
        self.B["ceiling"].add(bm, "frame_white", M, True)
        bm.free()
        bm = superellipse(r - 0.03, r - 0.03, 0.002, z0=-0.043, n=2.0, seg=56)
        self.B["ceiling_emit"].add(bm, "emit_soft", M, False)
        bm.free()
        self.lights.disk(fv(x, H - 0.05, z), r - 0.03, Vector((0, 0, -1)), 45, spread=170)

    def ceiling_panel(self, r, inset=0.18, energy_per_m2=16):
        H = self.lay.H
        x0, x1 = r.face("left") + inset, r.face("right") - inset
        z0, z1 = r.face("front") + inset, r.face("back") - inset
        if x1 - x0 < 0.3 or z1 - z0 < 0.3:
            return
        bm = box(x1 - x0, z1 - z0, 0.002, cx=(x0 + x1) / 2, cy=-(z0 + z1) / 2, cz=H - 0.004)
        self.B["ceiling_emit"].add(bm, "emit_cool", None, False)
        bm.free()
        self.lights.rect(fv((x0 + x1) / 2, H - 0.01, (z0 + z1) / 2), x1 - x0, z1 - z0, Vector((0, 0, -1)),
                         energy_per_m2 * (x1 - x0) * (z1 - z0), color=(1.0, 0.92, 0.84))


# ====================================================================== rooms

def _longest(intervals, lo=None, hi=None):
    best = None
    for s, e in intervals:
        if lo is not None:
            s = max(s, lo)
        if hi is not None:
            e = min(e, hi)
        if e - s > 0 and (best is None or e - s > best[1] - best[0]):
            best = (s, e)
    return best


def living(ctx, r):
    H = ctx.lay.H
    cand = []
    for side in ("left", "right"):
        for s, e in r.free(side, margin=0.08):
            s2 = max(s, r.z0 + 0.4)
            if e - s2 > 1.4:
                cand.append((e - s2, side, s2, e))
    if cand:
        _, side, s, e = max(cand)
        s = max(s, min(r.z0 + 0.95, e - 2.2))
        ln = min(e - s, 3.2)
        zc = s + ln / 2
        xf = r.face(side)
        fx, fz = r.inward(side)
        ctx.put(m_tvwall(ln, H), xf, zc, face_rot(fx, fz), room=r)
        ctx.cove((xf, zc - ln / 2), (xf, zc + ln / 2), (-fx, 0))
        _living_seating(ctx, r, side, xf, fx, zc)
    for k in (0.32, 0.68):
        ctx.track(r.x0 + r.w * k, r.z0 + 0.6, min(r.z1, ctx.lay.F) - 0.4)


def _living_seating(ctx, r, side, xf, fx, zc):
    opp = "right" if side == "left" else "left"
    width = abs(r.face(opp) - xf)
    sd = 1.0
    sw0 = min(2.6, max(1.8, r.d - 2.6))
    rot = face_rot(-fx, 0)
    sofa = None
    ub0 = width - 0.02 if width < 4.4 else min(width - 0.4, 0.45 + 3.0 + sd)
    for ub in (ub0, width - 1.0, width - 1.25):
        if ub - sd - 0.45 < 1.5:
            continue
        x = xf + fx * ub
        for w in (sw0, sw0 - 0.3, sw0 - 0.6):
            if w < 1.6:
                continue
            base = max(zc, r.z0 + 1.3 + w / 2)
            for dz in (0, -0.2, 0.2, -0.4, 0.4, -0.6, 0.6, -0.8):
                zz = base + dz
                if zz - w / 2 < r.z0 + 0.45:
                    continue
                mdl = m_sofa(w, sd)
                if ctx.blocked_any(ctx.footprint(mdl, x, zz, rot), pad=0.02):
                    mdl.parts.clear()
                    continue
                ctx.put(mdl, x, zz, rot, room=r)
                sofa = (zz, w, ub)
                break
            if sofa:
                break
        if sofa:
            break
    if not sofa:
        return
    zz, w, ub = sofa
    uf = ub - sd
    x = xf + fx * ub
    gap = uf - 0.45
    rug_u = min(gap + 0.5, 3.2)
    ctx.put(m_rug(rug_u, min(w + 0.6, r.d - 0.8)), xf + fx * (ub - 0.45 - rug_u / 2), zz, 0, room=r, occupy=False)
    if gap > 1.25:
        ctx.put(m_coffee(), xf + fx * (0.45 + gap * 0.55), zz, face_rot(0, 1), room=r)
    # кресло — цонхны дэргэд, буйдангийн талд, ТВ рүү хазгай
    ch_rot = face_rot(-fx * 0.55, 0.85)
    chair = False
    for cz in (r.z0 + 0.78, r.z0 + 0.9, zz - w / 2 - 0.5):
        for cu in (ub - 0.55, ub - 0.75, ub - 0.95):
            ch = m_lounge()
            cx = xf + fx * cu
            if cz < r.z0 + 0.6 or ctx.blocked_any(ctx.footprint(ch, cx, cz, ch_rot), pad=0.12):
                ch.parts.clear()
                continue
            ctx.put(ch, cx, cz, ch_rot, room=r)
            chair = True
            break
        if chair:
            break
    # хөнгөн ширээ ба нуман гэрэл — буйдангийн ар төгсгөлд, эс бөгөөс урд төгсгөлд
    for end_sgn in (1, -1):
        sz = zz + end_sgn * (w / 2 + 0.27)
        st = m_side_table(0.21, 0.5)
        if ctx.blocked_any(ctx.footprint(st, x - fx * 0.42, sz, 0)):
            st.parts.clear()
            continue
        ctx.put(st, x - fx * 0.42, sz, 0, room=r)
        lamp = m_arc_lamp(1.25)
        lr = face_rot(-fx * 0.8, -0.6 * end_sgn)
        if not ctx.blocked_any(ctx.footprint(lamp, x - fx * 0.1, sz + end_sgn * 0.12, lr), pad=0.08):
            ctx.put(lamp, x - fx * 0.1, sz + end_sgn * 0.12, lr, room=r, occupy=False)
        else:
            lamp.parts.clear()
        break
    if width - ub < 0.3:
        ctx.put(m_art(1.15, 0.85, "art_red"), r.face(opp), zz, face_rot(-fx, 0), y=1.25, room=r, occupy=False)
    # ургамал — ТВ талын цонхны буланд
    for pz in (r.z0 + 0.5, r.z0 + 0.65):
        pl = m_plant(1.75, seed=r.i + 3)
        px = xf + fx * 0.42
        if ctx.blocked_any(ctx.footprint(pl, px, pz, 0), pad=0.03):
            pl.parts.clear()
            continue
        ctx.put(pl, px, pz, 0, room=r)
        break


def kitchen(ctx, r):
    H = ctx.lay.H
    back = _longest(r.free("back", margin=0.05))
    if not back:
        return
    s, e = back
    left_wall = ctx.lay.wall_thickness("left", r) > 0 and any(z1 > r.z1 - 0.7 for _z0, z1 in r.solid("left"))
    right_wall = ctx.lay.wall_thickness("right", r) > 0 and any(z1 > r.z1 - 0.7 for _z0, z1 in r.solid("right"))
    if left_wall:
        s = max(s, r.face("left"))
    if right_wall:
        e = min(e, r.face("right"))
    ln = e - s
    if ln < 1.0:
        return
    tall = None
    tall_w = 1.2 if ln >= 3.4 else 0.6
    if ln >= 1.9:
        tall = "left" if left_wall else ("right" if right_wall else None)
    zf = r.face("back")
    ctx.put(m_kitchen(ln, H, tall, tall_w), (s + e) / 2, zf, face_rot(0, -1), room=r)
    ctx.cove((s, zf), (e, zf), (0, 1))
    # хоолны ширээ
    lt = min(2.1, r.w - 0.7)
    if lt < 1.2:
        return
    run_front = zf - 0.65
    tz = run_front - 1.28
    tx = r.cx
    tbl = m_dining(lt)
    rect = ctx.footprint(tbl, tx, tz, 0)
    rect = (rect[0] - 0.1, rect[1] + 0.1, rect[2] - 0.55, rect[3] + 0.55)
    if ctx.blocked_any(rect):
        tz += 0.25
        rect = (rect[0], rect[1], rect[2] + 0.25, rect[3] + 0.25)
        if ctx.blocked_any(rect):
            return
    ctx.put(tbl, tx, tz, 0, room=r)
    n = 3 if lt >= 1.9 else 2
    for k in range(n):
        x = tx - lt / 2 + lt * (k + 0.5) / n
        ctx.put(m_s_chair(), x, tz - 0.62, face_rot(0, 1), room=r)
        ctx.put(m_s_chair(), x, tz + 0.62, face_rot(0, -1), room=r)
    ctx.pendant(tx, tz, rx=min(0.7, lt * 0.36), ry=0.36)


def bedroom(ctx, r):
    H = ctx.lay.H
    order = ["back", "front", "left", "right"]
    choice = None
    for side in order:
        if side == "front" and ctx.lay.windows(r):
            continue
        along = r.w if side in ("front", "back") else r.d
        depth = r.d if side in ("front", "back") else r.w
        if depth < 2.8:
            continue
        bw = 1.8 if along >= 3.4 else 1.6
        need = bw + 0.34
        for s, e in r.free(side, margin=0.08):
            if e - s >= need + 0.1:
                mid = (r.x0 + r.x1) / 2 if side in ("front", "back") else (r.z0 + r.z1) / 2
                c = min(max(mid, s + need / 2 + 0.05), e - need / 2 - 0.05)
                choice = (side, bw, c, s, e)
                break
        if choice:
            break
    if not choice:
        return
    side, bw, c, s, e = choice
    fx, fz = r.inward(side)
    face = r.face(side)
    rot = face_rot(fx, fz)

    def at(u, v):
        """u — ханан дагуу, v — хананаас дотогш → frame (x, z)."""
        if side in ("front", "back"):
            return u, face + fz * v
        return face + fx * v, u

    # толгойн хавтан (бараан мод) + LED
    pw = min(e - s, bw + 2.2)
    pc = min(max(c, s + pw / 2), e - pw / 2)
    pm = Model()
    pm.add(box(pw, 0.022, 1.12, cy=0.011), "walnut", smooth=False)
    pm.add(box(pw - 0.04, 0.012, 0.004, cy=0.016, cz=1.118), "emit_warm", bucket="emit", smooth=False)
    pm.light("strip", a=Vector((-pw / 2 + 0.03, 0.03, 1.13)), b=Vector((pw / 2 - 0.03, 0.03, 1.13)),
             direction=Vector((0, -0.25, 1)), w_per_m=12.0)
    x, z = at(pc, 0)
    ctx.put(pm, x, z, rot, room=r, occupy=False)
    x, z = at(c, 0.022)
    ctx.put(m_bed(bw), x, z, rot, room=r)
    x, z = at(c, 1.25)
    ctx.put(m_rug(bw + 1.3, 2.3), x, z, rot, room=r, occupy=False)
    for sgn in (-1, 1):
        u = c + sgn * (bw / 2 + 0.17 + 0.32)
        if s + 0.25 < u < e - 0.25:
            x, z = at(u, 0.3)
            nl = m_night_lamp()
            rect = ctx.footprint(nl, x, z, rot)
            if not ctx.blocked_any(rect):
                ctx.put(nl, x, z, rot, room=r)
    # зураг
    for k, mat in ((-1, "art_print"), (1, "art_print2")):
        x, z = at(c + k * 0.34, 0.022)
        ctx.put(m_art(0.5, 0.66, mat), x, z, rot, y=1.38, room=r, occupy=False)
    # шүүгээ — хажуугийн хананд
    sides = [q for q in ("left", "right", "front", "back") if q != side]
    best = None
    for q in sides:
        if q == "front" and ctx.lay.windows(r):
            continue
        for a, b in r.free(q, margin=0.1):
            lo = max(a, r.z0 + 0.35) if q in ("left", "right") else a
            if b - lo >= 1.0:
                ww = min(b - lo, 2.4)
                cc = (lo + b) / 2
                wf = r.face(q)
                qx, qz = r.inward(q)
                x, z = (wf, cc) if q in ("left", "right") else (cc, wf)
                mdl = m_wardrobe(ww, 0.6, H)
                rect = ctx.footprint(mdl, x, z, face_rot(qx, qz))
                if not ctx.blocked_any(rect):
                    if best is None or ww > best[0]:
                        best = (ww, x, z, face_rot(qx, qz))
                mdl.parts.clear()
    if best:
        ww, x, z, rr = best
        ctx.put(m_wardrobe(ww, 0.6, H), x, z, rr, room=r)
    ctx.ring_lamp(r.cx, r.cz, 0.3)
    a, b = at(s + 0.05, 0.0), at(e - 0.05, 0.0)
    ctx.cove(a, b, (-fx, -fz))


def bath(ctx, r):
    H = ctx.lay.H
    long_z = r.d >= r.w
    ends = ("front", "back") if long_z else ("left", "right")
    longs = ("left", "right") if long_z else ("front", "back")
    door_side = None
    door_c = None
    for q in ("left", "right", "front", "back"):
        iv = r.doors(q)
        if iv:
            door_side = q
            door_c = (iv[0][0] + iv[0][1]) / 2
            break
    if door_side in longs:
        mid = (r.z0 + r.z1) / 2 if long_z else (r.x0 + r.x1) / 2
        wet = ends[1] if door_c < mid else ends[0]
    elif door_side in ends:
        wet = ends[0] if door_side == ends[1] else ends[1]
    else:
        wet = ends[1]
    wf = r.face(wet)
    wx, wz = r.inward(wet)
    clear = r.face(longs[1]) - r.face(longs[0])
    lo_long, hi_long = r.face(longs[0]), r.face(longs[1])
    mid_short = (lo_long + hi_long) / 2
    if clear >= 1.55 and (r.d if long_z else r.w) >= 2.3:
        tl = min(1.7, clear - 0.06)
        ty = 0.78
        u = wf + (wz if long_z else wx) * (ty / 2 + 0.06)
        x, z = (mid_short, u) if long_z else (u, mid_short)
        tub = m_tub(tl, ty)
        rr = 0.0 if long_z else face_rot(1, 0)
        ctx.put(tub, x, z, rr, room=r)
        wet_depth = ty + 0.12
    else:
        sd = 1.0
        u = wf + (wz if long_z else wx) * sd
        x, z = (mid_short, u) if long_z else (u, mid_short)
        sh = m_shower(clear, H)
        ctx.put(sh, x, z, face_rot(wx, wz), room=r, occupy=False)
        hx, hz = (mid_short, wf + wz * 0.45) if long_z else (wf + wx * 0.45, mid_short)
        m = Model()
        m.add(cyl(0.13, 0.008, z0=-0.03, seg=32), "chrome", bucket="ceiling")
        m.add(tube([(0, 0, -0.03), (0, 0, 0)], 0.01, seg=8), "chrome", bucket="ceiling")
        ctx.put(m, hx, hz, 0, y=H, occupy=False)
        r.occupy((min(x, wf) if not long_z else lo_long, max(x, wf) if not long_z else hi_long,
                  min(z, wf) if long_z else lo_long, max(z, wf) if long_z else hi_long))
        wet_depth = sd
    # угаалтуур — хаалганы эсрэг урт ханан дээр
    vside = longs[1] if door_side == longs[0] else longs[0]
    vf = r.face(vside)
    vx, vz = r.inward(vside)
    dry0 = wf + (wz if long_z else wx) * (wet_depth + 0.05)
    other_end = r.face(ends[1] if wet == ends[0] else ends[0])
    a, b = sorted((dry0, other_end))
    vw = min(1.0, b - a - 0.75) if b - a > 1.4 else min(0.8, b - a - 0.1)
    depth = 0.46 if clear >= 1.2 else 0.36
    if vw >= 0.55:
        vc = (a + vw / 2 + 0.05) if door_side in ends else min(max(door_c if door_c else (a + b) / 2, a + vw / 2), b - vw / 2)
        x, z = (vf, vc) if long_z else (vc, vf)
        ctx.put(m_vanity(vw, depth), x, z, face_rot(vx, vz), room=r)
        rest = (vc + vw / 2 + 0.25, b) if vc - a < b - vc else (a, vc - vw / 2 - 0.25)
    else:
        rest = (a, b)
    # WC — үлдсэн хэсэгт, аль нэг урт ханан дээр
    placed = False
    for q in (vside, longs[0] if vside == longs[1] else longs[1]):
        qf = r.face(q)
        qx, qz = r.inward(q)
        for cpos in ((rest[0] + rest[1]) / 2, rest[0] + 0.3, rest[1] - 0.3, (a + b) / 2):
            if not (a + 0.25 <= cpos <= b - 0.25):
                continue
            x, z = (qf, cpos) if long_z else (cpos, qf)
            wc = m_wc()
            rect = ctx.footprint(wc, x, z, face_rot(qx, qz))
            if not ctx.blocked_any(rect):
                ctx.put(wc, x, z, face_rot(qx, qz), room=r)
                placed = True
                break
        if placed:
            break
    # алчуурын хаалт
    for q in longs:
        qf = r.face(q)
        qx, qz = r.inward(q)
        for cpos in (a + 0.35, b - 0.35):
            x, z = (qf, cpos) if long_z else (cpos, qf)
            tr = m_towel_rail()
            rect = ctx.footprint(tr, x, z, face_rot(qx, qz))
            if not ctx.blocked_any(rect) and not any(r.doors(q)):
                ctx.put(tr, x, z, face_rot(qx, qz), room=r)
                break
        else:
            continue
        break
    ctx.ceiling_panel(r)


def entry(ctx, r):
    H = ctx.lay.H
    cands = []
    for q in ("left", "right", "front"):
        for a, b in r.free(q, margin=0.08):
            if b - a >= 0.8:
                cands.append((b - a, q, a, b))
    for _, q, a, b in sorted(cands, reverse=True):
        ww = min(b - a, 2.0)
        depth = 0.45 if (r.w if q in ("left", "right") else r.d) >= 1.3 else 0.36
        cc = (a + b) / 2
        qf = r.face(q)
        qx, qz = r.inward(q)
        x, z = (qf, cc) if q in ("left", "right") else (cc, qf)
        mdl = m_wardrobe(ww, depth, H)
        if not ctx.blocked_any(ctx.footprint(mdl, x, z, face_rot(qx, qz)), pad=0.02):
            ctx.put(mdl, x, z, face_rot(qx, qz), room=r)
            break
        mdl.parts.clear()
    for q in ("right", "left", "front"):
        for a, b in r.free(q, margin=0.1):
            if b - a >= 0.9:
                qf = r.face(q)
                qx, qz = r.inward(q)
                cc = (a + b) / 2
                x, z = (qf, cc) if q in ("left", "right") else (cc, qf)
                mm = m_round_mirror(0.36)
                if not ctx.blocked_any(ctx.footprint(m_bench(0.9), x, z, face_rot(qx, qz))):
                    ctx.put(mm, x, z, face_rot(qx, qz), y=1.45, room=r, occupy=False)
                    break
        else:
            continue
        break
    n = 2 if r.d > 2.4 else 1
    for k in range(n):
        ctx.downlight(r.cx, r.z0 + r.d * (k + 0.5) / n)


def corridor(ctx, r):
    for q in ("left", "right"):
        for a, b in r.free(q, margin=0.1):
            if b - a >= 0.9:
                qf = r.face(q)
                qx, qz = r.inward(q)
                ctx.put(m_art(0.7, 0.9, "art_lines"), qf, (a + b) / 2, face_rot(qx, qz), y=1.2, room=r, occupy=False)
                break
        else:
            continue
        break
    n = max(1, round(r.d / 1.6))
    for k in range(n):
        ctx.downlight(r.cx, r.z0 + r.d * (k + 0.5) / n, energy=10)


def wardrobe(ctx, r):
    H = ctx.lay.H
    long_z = r.d >= r.w
    q = "left" if long_z else "front"
    for a, b in r.free(q, margin=0.05):
        if b - a >= 0.8:
            qf = r.face(q)
            qx, qz = r.inward(q)
            depth = min(0.5, (r.w if long_z else r.d) - 0.3)
            cc = (a + b) / 2
            x, z = (qf, cc) if long_z else (cc, qf)
            ctx.put(m_shelving(b - a - 0.04, depth, H), x, z, face_rot(qx, qz), room=r)
            break
    ctx.downlight(r.cx, r.cz, energy=8)


def loggia(ctx, r):
    for sx in (-0.52, 0.52):
        ch = m_rattan_chair()
        rot = face_rot(0.2 if sx < 0 else -0.2, -1)
        rect = ctx.footprint(ch, r.cx + sx, r.z1 - 0.62, rot)
        if not ctx.blocked_any(rect, pad=0.05):
            ctx.put(ch, r.cx + sx, r.z1 - 0.62, rot, room=r)
        else:
            ch.parts.clear()
    ctx.put(m_side_table(0.18, 0.42, "stone_dark"), r.cx, r.z0 + 0.42, 0, room=r)
    pl = m_plant(1.3, seed=11)
    if not ctx.blocked_any(ctx.footprint(pl, r.x1 - 0.3, r.z0 + 0.3, 0), pad=0.02):
        ctx.put(pl, r.x1 - 0.3, r.z0 + 0.3, 0, room=r)
    else:
        pl.parts.clear()


ROOMS = {
    "living": living,
    "kitchen": kitchen,
    "bedroom": bedroom,
    "bath": bath,
    "entry": entry,
    "corridor": corridor,
    "wardrobe": wardrobe,
    "loggia": loggia,
}


def furnish_all(ctx):
    order = ["living", "bedroom", "kitchen", "bath", "entry", "wardrobe", "corridor", "loggia"]
    for kind in order:
        for r in ctx.lay.rooms:
            if r.kind == kind:
                ROOMS[kind](ctx, r)
