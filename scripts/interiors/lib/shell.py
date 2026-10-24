"""Архитектурын бүрхүүл: хана (boolean нэгтгэл), шал, тааз, цонх, хаалга, хөшиг."""

import math
import bmesh
import bpy
from mathutils import Vector

from .core import box, fv, quad, tube
from .layout import T_EXT

FLOOR_MAT = {
    "living": "oak_floor",
    "kitchen": "oak_floor",
    "bedroom": "oak_floor",
    "corridor": "oak_floor",
    "wardrobe": "oak_floor",
    "entry": "stone_floor",
    "bath": "travertine_floor",
    "loggia": "stone_floor",
}


def _box_world(bm, x0, x1, z0, z1, y0, y1):
    """Frame тэгш өнцөгт хайрцгийг (дэлхийн координатаар) bm-д нэмнэ."""
    box(x1 - x0, z1 - z0, y1 - y0, cx=(x0 + x1) / 2, cy=-(z0 + z1) / 2, cz=y0, bm=bm)


def walls(lay, B, scratch):
    """Бүх хананы хэсгийг Manifold boolean-аар нэгтгээд, өрөөний хилээр
    зүсэж, нүүр бүрийг өрөөнийх нь материалаар ангилна."""
    pieces = []
    for i, w in enumerate(lay.walls):
        bm = bmesh.new()
        _box_world(bm, w["x"] - w["sx"] / 2, w["x"] + w["sx"] / 2, w["z"] - w["sz"] / 2, w["z"] + w["sz"] / 2,
                   w["y"] - w["sy"] / 2, w["y"] + w["sy"] / 2)
        me = bpy.data.meshes.new(f"wall{i}")
        bm.to_mesh(me)
        bm.free()
        ob = bpy.data.objects.new(f"wall{i}", me)
        scratch.objects.link(ob)
        pieces.append(ob)
    base, rest = pieces[0], pieces[1:]
    coll = bpy.data.collections.new("wall_ops")
    for ob in rest:
        scratch.objects.unlink(ob)
        coll.objects.link(ob)
    mod = base.modifiers.new("union", "BOOLEAN")
    mod.operation = "UNION"
    mod.operand_type = "COLLECTION"
    mod.collection = coll
    mod.solver = "MANIFOLD"
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(base.evaluated_get(dg))
    bm = bmesh.new()
    bm.from_mesh(me)
    bpy.data.meshes.remove(me)
    for ob in pieces:
        bpy.data.objects.remove(ob)
    bpy.data.collections.remove(coll)
    bmesh.ops.dissolve_limit(bm, angle_limit=math.radians(1), verts=list(bm.verts), edges=list(bm.edges))

    # Өрөөний хилээр зүсэх (нэг нүүр хоёр өрөөнд хамаарахгүйн тулд)
    xs = sorted({round(r.x0, 4) for r in lay.rooms} | {round(r.x1, 4) for r in lay.rooms})
    zs = sorted({round(r.z0, 4) for r in lay.rooms} | {round(r.z1, 4) for r in lay.rooms})
    for x in xs:
        geom = list(bm.verts) + list(bm.edges) + list(bm.faces)
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(x, 0, 0), plane_no=(1, 0, 0))
    for z in zs:
        geom = list(bm.verts) + list(bm.edges) + list(bm.faces)
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, -z, 0), plane_no=(0, 1, 0))
    bm.normal_update()

    groups = {}
    for f in bm.faces:
        c = f.calc_center_median()
        n = f.normal
        if n.z > 0.9 and c.z > lay.H - 0.02:
            key = ("caps", "cap")
        else:
            px, pz = c.x + n.x * 0.06, -(c.y + n.y * 0.06)
            r = lay.room_at(px, pz)
            if r is None:
                key = ("interior", "paint" if lay.inside_envelope(px, pz) else "paint_ext")
            elif r.kind == "bath":
                key = ("interior", "travertine")
            else:
                key = ("interior", "paint")
        groups.setdefault(key, []).append(f)
    for (bucket, mat), faces in groups.items():
        sub = _extract(bm, faces)
        B[bucket].add(sub, mat, smooth=False)
        sub.free()
    bm.free()


def _extract(bm, faces):
    out = bmesh.new()
    vmap = {}
    for f in faces:
        vs = []
        for v in f.verts:
            if v not in vmap:
                vmap[v] = out.verts.new(v.co)
            vs.append(vmap[v])
        try:
            out.faces.new(vs)
        except ValueError:
            pass
    return out


def floors(lay, B):
    """Шал: өрөөний хил + хананы доорх зурвасаар тор үүсгэж, нүд бүрийг
    хамгийн ойр өрөөнд хуваарилна."""
    xs = {-T_EXT, lay.L + T_EXT}
    zs = {-T_EXT, lay.D + T_EXT}
    for r in lay.rooms:
        xs |= {r.x0, r.x1}
        zs |= {r.z0, r.z1}
    xs, zs = sorted(xs), sorted(zs)
    cells = {}
    for i in range(len(xs) - 1):
        for j in range(len(zs) - 1):
            x0, x1, z0, z1 = xs[i], xs[i + 1], zs[j], zs[j + 1]
            if x1 - x0 < 1e-3 or z1 - z0 < 1e-3:
                continue
            cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
            r = lay.room_at(cx, cz)
            if r is None:
                if not lay.inside_envelope(cx, cz):
                    continue
                r = min(lay.rooms, key=lambda q: max(q.x0 - cx, 0, cx - q.x1) + max(q.z0 - cz, 0, cz - q.z1))
            cells.setdefault(FLOOR_MAT[r.kind], []).append((x0, x1, z0, z1))
    for mat, rects in cells.items():
        bm = bmesh.new()
        for x0, x1, z0, z1 in rects:
            quad([fv(x0, 0, z0), fv(x1, 0, z0), fv(x1, 0, z1), fv(x0, 0, z1)], bm=bm)
        bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=1e-4)
        bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
        for f in bm.faces:
            if f.normal.z < 0:
                f.normal_flip()
        B["interior"].add(bm, mat, smooth=False)
        bm.free()


def ceiling(lay, B):
    H = lay.H
    rects = [(-T_EXT, lay.L + T_EXT, -T_EXT, lay.D + T_EXT)]
    if lay.loggia:
        lg = lay.loggia
        rects.append((lg.x0 - 0.1, lg.x1 + 0.1, lg.z0 - 0.1, -T_EXT))
    bm = bmesh.new()
    for x0, x1, z0, z1 in rects:
        quad([fv(x0, H, z0), fv(x0, H, z1), fv(x1, H, z1), fv(x1, H, z0)], bm=bm)
    for f in bm.faces:
        if f.normal.z > 0:
            f.normal_flip()
    B["ceiling"].add(bm, "ceiling", smooth=False)
    bm.free()


def windows(lay, B, lights):
    """Цонхны хүрээ, шил, тавцан, радиатор, гэрлийн портал."""
    zc = -T_EXT / 2
    for g in lay.glass:
        along_x = g["sx"] >= g["sz"]
        y0, y1 = g["y"] - g["sy"] / 2, g["y"] + g["sy"] / 2
        if along_x:
            s, e, at = g["x"] - g["sx"] / 2, g["x"] + g["sx"] / 2, g["z"]
        else:
            s, e, at = g["z"] - g["sz"] / 2, g["z"] + g["sz"] / 2, g["x"]
        facade = along_x and abs(at - zc) < 0.03
        # шил
        bm = bmesh.new()
        if along_x:
            quad([fv(s, y0, at), fv(e, y0, at), fv(e, y1, at), fv(s, y1, at)], bm=bm)
        else:
            quad([fv(at, y0, s), fv(at, y0, e), fv(at, y1, e), fv(at, y1, s)], bm=bm)
        B["glass"].add(bm, "glass", smooth=False)
        bm.free()
        # хүрээ ба хуваагч
        fw, fd = 0.055, 0.07
        n = max(1, round((e - s) / 1.35))
        bars = [(s, s + fw), (e - fw, e)] + [(s + (e - s) * k / n - fw / 2, s + (e - s) * k / n + fw / 2) for k in range(1, n)]
        bm = bmesh.new()
        for a, b in bars:
            _frame_box(bm, along_x, a, b, at - fd / 2, at + fd / 2, y0, y1)
        _frame_box(bm, along_x, s, e, at - fd / 2, at + fd / 2, y1 - fw, y1)
        if y0 > 0.05:
            _frame_box(bm, along_x, s, e, at - fd / 2, at + fd / 2, y0, y0 + fw)
        else:
            _frame_box(bm, along_x, s, e, at - fd / 2, at + fd / 2, 0, 0.03)
        B["interior"].add(bm, "frame_white", smooth=False)
        bm.free()
        if not facade:
            continue
        # гэрлийн портал (тэнгэрийн гэрлийг цонхоор чиглүүлнэ)
        lights.portal(fv((s + e) / 2, (y0 + y1) / 2, 0.0), e - s, y1 - y0)
        if y0 > 0.3:
            # дотор тавцан
            bm = bmesh.new()
            _box_world(bm, s - 0.04, e + 0.04, zc, 0.05, y0 - 0.03, y0)
            B["interior"].add(bm, "marble", smooth=False)
            bm.free()
            # радиатор
            rw = min(e - s - 0.4, 1.6)
            if rw > 0.6:
                bm = bmesh.new()
                m = (s + e) / 2
                _box_world(bm, m - rw / 2, m + rw / 2, 0.035, 0.125, 0.12, 0.64)
                B["interior"].add(bm, "radiator", smooth=False)
                bm.free()
    # лоджийн хүрээ (layouts.json-оос)
    bm = bmesh.new()
    for p in lay.frames:
        _box_world(bm, p["x"] - p["sx"] / 2, p["x"] + p["sx"] / 2, p["z"] - p["sz"] / 2, p["z"] + p["sz"] / 2,
                   p["y"] - p["sy"] / 2, p["y"] + p["sy"] / 2)
    if lay.frames:
        B["interior"].add(bm, "frame_white", smooth=False)
    bm.free()
    if lay.loggia:
        lg = lay.loggia
        lights.portal(fv((lg.x0 + lg.x1) / 2, 1.3, lg.z0 - 0.02), lg.x1 - lg.x0, 2.3)


def _frame_box(bm, along_x, a, b, c0, c1, y0, y1):
    if along_x:
        _box_world(bm, a, b, c0, c1, y0, y1)
    else:
        _box_world(bm, c0, c1, a, b, y0, y1)


def curtains(lay, B):
    """Фасадын цонхтой өрөөнд: таазны зам, нимгэн хөшиг (хоёр захад
    хураасан), өтгөн маалинган хөшиг."""
    H = lay.H
    for r in lay.rooms:
        if r.kind not in ("living", "bedroom"):
            continue
        wins = lay.windows(r)
        if not wins:
            continue
        x0, x1 = r.face("left") + 0.04, r.face("right") - 0.04
        zt = 0.16
        bm = bmesh.new()
        _box_world(bm, x0, x1, zt - 0.02, zt + 0.02, H - 0.035, H)
        B["ceiling"].add(bm, "metal_black", smooth=False)
        bm.free()
        width = x1 - x0
        cov = min(1.4, max(0.55, width * 0.28))
        for a, b in ((x0, x0 + cov), (x1 - cov, x1)):
            B["curtain"].add(_wave(a, b, zt, 0.03, H - 0.04, amp=0.045, period=0.17), "curtain", smooth=True)
        if r.kind == "living":
            for a, b in ((x0, x0 + 0.38), (x1 - 0.38, x1)):
                B["interior"].add(_wave(a, b, zt + 0.07, 0.02, H - 0.05, amp=0.05, period=0.2, thick=0.012), "linen", smooth=True)


def _wave(a, b, zc, y0, y1, amp, period, thick=0.0):
    bm = bmesh.new()
    n = max(4, int((b - a) / period * 8))
    top, bot = [], []
    for i in range(n + 1):
        x = a + (b - a) * i / n
        z = zc + amp * math.sin(2 * math.pi * (x - a) / period)
        bot.append(bm.verts.new(fv(x, y0, z)))
        top.append(bm.verts.new(fv(x, y1, z)))
    for i in range(n):
        bm.faces.new([bot[i], bot[i + 1], top[i + 1], top[i]])
    if thick > 0:
        bmesh.ops.solidify(bm, geom=list(bm.faces), thickness=thick)
    return bm


def doors(lay, B):
    """Дотор хаалга (хаалттай, царс өнгөлгөө) ба гол хаалга (бараан)."""
    for d in lay.doors:
        w, h = d["w"], d["h"]
        c, at = d["c"], d["at"]
        main = d["main"]
        t = 0.06 if main else 0.04
        bm = bmesh.new()
        if d["axis"] == "z":
            _box_world(bm, at - t / 2, at + t / 2, c - w / 2 + 0.005, c + w / 2 - 0.005, 0.005, h - 0.005)
        else:
            _box_world(bm, c - w / 2 + 0.005, c + w / 2 - 0.005, at - t / 2, at + t / 2, 0.005, h - 0.005)
        B["interior"].add(bm, "graphite" if main else "oak_veneer", smooth=False)
        bm.free()
        # бариул (хоёр талд)
        bm = bmesh.new()
        hy = 1.0
        for sgn in (-1, 1):
            off = sgn * (t / 2 + 0.03)
            if main:
                if d["axis"] == "x":
                    p0 = fv(c - w / 2 + 0.12, 0.75, at + off)
                    tube([p0, p0 + Vector((0, 0, 0.6))], 0.012, seg=8, bm=bm)
                continue
            if d["axis"] == "z":
                _box_world(bm, at + off - 0.01, at + off + 0.01, c + w / 2 - 0.2, c + w / 2 - 0.06, hy - 0.01, hy + 0.01)
            else:
                _box_world(bm, c + w / 2 - 0.2, c + w / 2 - 0.06, at + off - 0.01, at + off + 0.01, hy - 0.01, hy + 0.01)
        if bm.faces:
            B["interior"].add(bm, "metal_black", smooth=True)
        bm.free()
