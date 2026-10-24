"""Суурь хэрэгслүүд: координат, материалын бүртгэл, геометрийн «сав» (Bucket).

Координат:
  • Айлын «нүүрэн» (frame) координат — x фасадын дагуу (0…L), z фасадаас
    дотогш (0…D), y дээш. layouts.json энэ координаттай.
  • Blender: X = x, Y = −z, Z = y. glTF (Y-up) экспорт нь (X, Z, −Y) =
    (x, y, z) болгодог тул вэб дээр frame координаттайгаа яг давхцана.

Бүх тавилга, ханыг bmesh-ээр Bucket-д нийлүүлнэ; Bucket бүр нэг объект
(лайтмап нэг атлас) болж экспортлогдоно.
"""

import math
import bmesh
import bpy
from mathutils import Matrix, Vector


def fv(x, y, z):
    """Frame (x, y=up, z=inward) → Blender vector."""
    return Vector((x, -z, y))


def face_rot(fx, fz):
    """Тавилгын локал +Y (урд тал) frame-ийн (fx, fz) чиглэлд харах Z эргэлт."""
    bx, by = fx, -fz
    return math.atan2(-bx, by)


def place(x, z, rot=0.0, y=0.0):
    """Frame цэг (x, z) дээр, Z тэнхлэгээр rot радиан эргүүлсэн матриц."""
    return Matrix.Translation(fv(x, y, z)) @ Matrix.Rotation(rot, 4, "Z")


# ---------------------------------------------------------------- materials

def lin(c):
    """sRGB 0–255 → linear 0–1."""
    def f(v):
        v = v / 255.0
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return tuple(f(v) for v in c)


# name: (texture | None, sRGB color, tile size m, roughness, extra)
MATERIALS = {
    "paint": (None, (236, 233, 227), 1, 0.9, {}),
    "paint_ext": (None, (226, 224, 218), 1, 0.9, {}),
    "ceiling": (None, (244, 242, 237), 1, 0.95, {}),
    "oak_floor": ("oak_floor", None, 2.4, 0.42, {}),
    "oak_veneer": ("oak_veneer", None, 1.2, 0.55, {}),
    "walnut": ("walnut", None, 1.2, 0.5, {}),
    "travertine": ("travertine", None, 1.2, 0.5, {}),
    "travertine_floor": ("travertine", None, 1.2, 0.45, {}),
    "stone_floor": ("stone_floor", None, 1.2, 0.35, {}),
    "marble": ("marble", None, 1.6, 0.25, {}),
    "boucle": ("boucle", None, 0.5, 1.0, {}),
    "fabric_grey": ("fabric_grey", None, 0.5, 1.0, {}),
    "velvet_olive": ("velvet_olive", None, 0.5, 0.9, {}),
    "leather": ("leather", None, 0.5, 0.45, {}),
    "linen": ("linen", None, 0.6, 1.0, {}),
    "rug": ("rug", None, 1.0, 1.0, {}),
    "cabinet_white": (None, (236, 233, 226), 1, 0.6, {}),
    "frame_white": (None, (236, 236, 233), 1, 0.4, {}),
    "metal_black": (None, (28, 28, 28), 1, 0.35, {"metallic": 0.6}),
    "graphite": (None, (54, 54, 52), 1, 0.4, {}),
    "chrome": (None, (196, 196, 196), 1, 0.15, {"metallic": 1.0}),
    "mirror": (None, (150, 158, 162), 1, 0.03, {"metallic": 1.0}),
    "black_glass": (None, (10, 10, 11), 1, 0.06, {}),
    "ceramic": (None, (244, 244, 241), 1, 0.12, {}),
    "stone_dark": (None, (66, 62, 58), 1, 0.4, {}),
    "foliage": (None, (74, 98, 52), 1, 0.7, {}),
    "foliage2": (None, (98, 120, 64), 1, 0.7, {}),
    "trunk": (None, (96, 76, 58), 1, 0.8, {}),
    "soil": (None, (52, 42, 34), 1, 1.0, {}),
    "planter": (None, (232, 229, 222), 1, 0.6, {}),
    "rattan": (None, (186, 160, 120), 1, 0.8, {}),
    "cushion_accent": (None, (150, 78, 52), 1, 1.0, {}),
    "cushion_sage": (None, (150, 156, 128), 1, 1.0, {}),
    "throw_grey": (None, (150, 148, 142), 1, 1.0, {}),
    "clothes_a": (None, (196, 180, 160), 1, 1.0, {}),
    "clothes_b": (None, (78, 74, 70), 1, 1.0, {}),
    "clothes_c": (None, (150, 112, 86), 1, 1.0, {}),
    "book_a": (None, (190, 176, 150), 1, 0.9, {}),
    "book_b": (None, (80, 70, 60), 1, 0.9, {}),
    "radiator": ("radiator", None, 0.6, 0.4, {}),
    "art_red": ("art_red", None, 0, 0.8, {"fit": True}),
    "art_marble": ("art_marble", None, 0, 0.8, {"fit": True}),
    "art_lines": ("art_lines", None, 0, 0.8, {"fit": True}),
    "art_print": ("art_print", None, 0, 0.8, {"fit": True}),
    "art_print2": ("art_print2", None, 0, 0.8, {"fit": True}),
    # Лайтмапгүй (вэб дээр тусдаа материал)
    "cap": (None, (47, 52, 51), 1, 1.0, {"unlit": True}),
    "glass": (None, (214, 230, 236), 1, 0.0, {"glass": True}),
    "curtain": (None, (250, 249, 246), 1, 1.0, {"curtain": True}),
    "emit_warm": (None, (255, 214, 168), 1, 1.0, {"emit": 6.0}),
    "emit_soft": (None, (255, 236, 212), 1, 1.0, {"emit": 3.0}),
    "emit_cool": (None, (240, 244, 255), 1, 1.0, {"emit": 3.0}),
}


class MaterialLib:
    def __init__(self, tex_paths):
        self.tex_paths = tex_paths
        self.cache = {}
        self.images = {}

    def image(self, name):
        if name not in self.images:
            img = bpy.data.images.load(self.tex_paths[name], check_existing=True)
            img.name = name
            self.images[name] = img
        return self.images[name]

    def get(self, name):
        if name in self.cache:
            return self.cache[name]
        tex, color, _tile, rough, extra = MATERIALS[name]
        m = bpy.data.materials.new(name)
        nt = m.node_tree
        p = nt.nodes.get("Principled BSDF")
        out = nt.nodes.get("Material Output")
        p.inputs["Roughness"].default_value = rough
        p.inputs["Metallic"].default_value = extra.get("metallic", 0.0)
        if tex:
            t = nt.nodes.new("ShaderNodeTexImage")
            t.image = self.image(tex)
            t.interpolation = "Linear"
            uv = nt.nodes.new("ShaderNodeUVMap")
            uv.uv_map = "UV0"
            nt.links.new(uv.outputs[0], t.inputs[0])
            nt.links.new(t.outputs[0], p.inputs["Base Color"])
        else:
            p.inputs["Base Color"].default_value = (*lin(color), 1)
        if "emit" in extra:
            p.inputs["Emission Color"].default_value = (*lin(color), 1)
            p.inputs["Emission Strength"].default_value = extra["emit"]
        if extra.get("glass"):
            p.inputs["Transmission Weight"].default_value = 1.0
            p.inputs["Roughness"].default_value = 0.0
        if extra.get("curtain"):
            # Нимгэн хөшиг: тунгалаг + нэвт гэрэлтэх (зөвхөн preview рендерт)
            nt.nodes.remove(p)
            tr = nt.nodes.new("ShaderNodeBsdfTransparent")
            tl = nt.nodes.new("ShaderNodeBsdfTranslucent")
            tl.inputs[0].default_value = (*lin(color), 1)
            mix = nt.nodes.new("ShaderNodeMixShader")
            mix.inputs[0].default_value = 0.45
            nt.links.new(tr.outputs[0], mix.inputs[1])
            nt.links.new(tl.outputs[0], mix.inputs[2])
            nt.links.new(mix.outputs[0], out.inputs[0])
        self.cache[name] = m
        return m


def tile_of(name):
    return MATERIALS[name][2]


# ---------------------------------------------------------------- buckets

class Bucket:
    """Нэг объект болох геометрийн сан (материалын индекс + 2 UV)."""

    def __init__(self, name):
        self.name = name
        self.bm = bmesh.new()
        self.uv0 = self.bm.loops.layers.uv.new("UV0")
        self.uv1 = self.bm.loops.layers.uv.new("Lightmap")
        self.mats = []

    def mat_index(self, name):
        if name not in self.mats:
            self.mats.append(name)
        return self.mats.index(name)

    def add(self, src, mat, matrix=None, smooth=True, uv=None):
        """src bmesh-ийг (локал) matrix-аар хувиргаж нэмнэ.

        uv=None — дэлхийн координатаар хайрцган проекц (материалын tile),
        uv="fit" — локал bbox-ийн урд (+Y) нүүрт зургийг бүтэн сунгана,
        uv=callable(local_co, local_normal) → (u, v)."""
        mi = self.mat_index(mat)
        src.normal_update()
        m = matrix if matrix is not None else Matrix.Identity(4)
        nm = m.to_3x3().inverted_safe().transposed()
        tile = tile_of(mat) or 1.0
        fit = uv == "fit" or MATERIALS[mat][4].get("fit")
        if fit:
            xs = [v.co.x for v in src.verts]
            zs = [v.co.z for v in src.verts]
            bx0, bx1, bz0, bz1 = min(xs), max(xs), min(zs), max(zs)
        vmap = {}
        for v in src.verts:
            vmap[v] = self.bm.verts.new(m @ v.co)
        for f in src.faces:
            try:
                nf = self.bm.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                continue
            nf.material_index = mi
            nf.smooth = smooth
            n_local = f.normal
            n = (nm @ n_local).normalized()
            for lo, lsrc in zip(nf.loops, f.loops):
                if callable(uv):
                    u, w = uv(lsrc.vert.co, n_local)
                elif fit:
                    c = lsrc.vert.co
                    u = (c.x - bx0) / max(bx1 - bx0, 1e-6)
                    w = (c.z - bz0) / max(bz1 - bz0, 1e-6)
                    if n_local.y < -0.5:
                        u = 1 - u
                    elif abs(n_local.y) < 0.5:
                        u, w = 0.02, 0.02
                else:
                    c = lo.vert.co
                    ax, ay, az = abs(n.x), abs(n.y), abs(n.z)
                    if az >= ax and az >= ay:
                        u, w = c.x / tile, c.y / tile
                    elif ax >= ay:
                        u, w = (-c.y if n.x > 0 else c.y) / tile, c.z / tile
                    else:
                        u, w = (c.x if n.y > 0 else -c.x) / tile, c.z / tile
                lo[self.uv0].uv = (u, w)
        return self

    def to_object(self, lib, collection):
        me = bpy.data.meshes.new(self.name)
        self.bm.normal_update()
        self.bm.to_mesh(me)
        self.bm.free()
        for name in self.mats:
            me.materials.append(lib.get(name))
        ob = bpy.data.objects.new(self.name, me)
        collection.objects.link(ob)
        if hasattr(me, "set_sharp_from_angle"):
            me.set_sharp_from_angle(angle=math.radians(38))
        return ob


# ---------------------------------------------------------------- primitives (local coords, Z up)

def _bm():
    return bmesh.new()


def box(sx, sy, sz, cx=0.0, cy=0.0, cz=None, bevel=0.0, seg=2, bm=None):
    """Хайрцаг: төв (cx, cy), доод ирмэг cz (None бол 0 — шалан дээр)."""
    out = bm or _bm()
    tmp = _bm()
    bmesh.ops.create_cube(tmp, size=1.0)
    z0 = 0.0 if cz is None else cz
    for v in tmp.verts:
        v.co = Vector((cx + v.co.x * sx, cy + v.co.y * sy, z0 + (v.co.z + 0.5) * sz))
    if bevel > 0:
        r = min(bevel, sx * 0.49, sy * 0.49, sz * 0.49)
        bmesh.ops.bevel(tmp, geom=list(tmp.edges), offset=r, segments=seg, profile=0.5, affect="EDGES", clamp_overlap=True)
    _merge(out, tmp)
    return out


def cyl(r, h, cx=0.0, cy=0.0, z0=0.0, seg=32, r2=None, bevel=0.0, bm=None):
    out = bm or _bm()
    tmp = _bm()
    bmesh.ops.create_cone(tmp, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=h)
    for v in tmp.verts:
        v.co = Vector((v.co.x + cx, v.co.y + cy, v.co.z + h / 2 + z0))
    if bevel > 0:
        rim = [e for e in tmp.edges if len(e.link_faces) == 2 and abs(e.link_faces[0].normal.dot(e.link_faces[1].normal)) < 0.5]
        bmesh.ops.bevel(tmp, geom=rim, offset=bevel, segments=2, profile=0.5, affect="EDGES", clamp_overlap=True)
    _merge(out, tmp)
    return out


def sphere(rx, ry, rz, cx=0.0, cy=0.0, cz=0.0, seg=24, rings=12, bm=None):
    out = bm or _bm()
    tmp = _bm()
    bmesh.ops.create_uvsphere(tmp, u_segments=seg, v_segments=rings, radius=1.0)
    for v in tmp.verts:
        v.co = Vector((cx + v.co.x * rx, cy + v.co.y * ry, cz + v.co.z * rz))
    _merge(out, tmp)
    return out


def ico(r, cx, cy, cz, sub=2, squash=1.0, jitter=0.0, seed=0, bm=None):
    """Бөмбөлөг; jitter — зөөлөн (бага давтамжтай) товгор, гөлгөр нормальтай."""
    import random
    rnd = random.Random(seed)
    ph = [rnd.random() * 6.283 for _ in range(6)]
    out = bm or _bm()
    tmp = _bm()
    bmesh.ops.create_icosphere(tmp, subdivisions=sub, radius=1.0)
    for v in tmp.verts:
        x, y, z = v.co
        k = 1 + jitter * (math.sin(3.1 * x + ph[0]) * math.sin(2.7 * y + ph[1]) * math.sin(3.3 * z + ph[2])
                          + 0.5 * math.sin(5.3 * x + ph[3]) * math.sin(4.9 * z + ph[4]) * math.cos(5.1 * y + ph[5]))
        v.co = Vector((cx + x * r * k, cy + y * r * k, cz + z * r * k * squash))
    _merge(out, tmp)
    return out


def superellipse(rx, ry, h, z0=0.0, n=4.0, seg=48, bevel=0.0, cx=0.0, cy=0.0, bm=None):
    """Суперэллипс хэлбэрийн хавтан (органик ширээ, гэрлийн бүрхүүл)."""
    out = bm or _bm()
    tmp = _bm()
    ring_b, ring_t = [], []
    for i in range(seg):
        t = 2 * math.pi * i / seg
        c, s = math.cos(t), math.sin(t)
        x = rx * math.copysign(abs(c) ** (2 / n), c) + cx
        y = ry * math.copysign(abs(s) ** (2 / n), s) + cy
        ring_b.append(tmp.verts.new((x, y, z0)))
        ring_t.append(tmp.verts.new((x, y, z0 + h)))
    tmp.faces.new(list(reversed(ring_b)))
    tmp.faces.new(ring_t)
    for i in range(seg):
        j = (i + 1) % seg
        tmp.faces.new([ring_b[i], ring_b[j], ring_t[j], ring_t[i]])
    if bevel > 0:
        rim = [e for e in tmp.edges if len(e.link_faces) == 2 and abs(e.link_faces[0].normal.dot(e.link_faces[1].normal)) < 0.3]
        bmesh.ops.bevel(tmp, geom=rim, offset=bevel, segments=3, profile=0.5, affect="EDGES", clamp_overlap=True)
    _merge(out, tmp)
    return out


def ribbon(profile, width, thick, bm=None, seg_w=1):
    """Хажуу харагдацын 2D муруй (y, z) → X тэнхлэгийн дагуу өргөнтэй зузаан тууз
    (S хэлбэрийн сандал, муруй тавиур)."""
    out = bm or _bm()
    tmp = _bm()
    pts = [Vector((0, y, z)) for y, z in profile]
    # профилийн нормаль (y-z хавтгайд)
    norms = []
    for i in range(len(pts)):
        a = pts[max(i - 1, 0)]
        b = pts[min(i + 1, len(pts) - 1)]
        t = (b - a).normalized()
        norms.append(Vector((0, -t.z, t.y)))
    cols = [-width / 2 + width * k / seg_w for k in range(seg_w + 1)]
    grid_o, grid_i = [], []
    for p, nrm in zip(pts, norms):
        grid_o.append([tmp.verts.new((x, p.y + nrm.y * thick / 2, p.z + nrm.z * thick / 2)) for x in cols])
        grid_i.append([tmp.verts.new((x, p.y - nrm.y * thick / 2, p.z - nrm.z * thick / 2)) for x in cols])
    n = len(pts)
    for i in range(n - 1):
        for k in range(seg_w):
            tmp.faces.new([grid_o[i][k], grid_o[i + 1][k], grid_o[i + 1][k + 1], grid_o[i][k + 1]])
            tmp.faces.new([grid_i[i][k + 1], grid_i[i + 1][k + 1], grid_i[i + 1][k], grid_i[i][k]])
        tmp.faces.new([grid_o[i][0], grid_i[i][0], grid_i[i + 1][0], grid_o[i + 1][0]])
        tmp.faces.new([grid_o[i + 1][-1], grid_i[i + 1][-1], grid_i[i][-1], grid_o[i][-1]])
    tmp.faces.new([grid_o[0][k] for k in range(seg_w + 1)] + [grid_i[0][k] for k in reversed(range(seg_w + 1))])
    tmp.faces.new([grid_i[-1][k] for k in range(seg_w + 1)] + [grid_o[-1][k] for k in reversed(range(seg_w + 1))])
    bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
    _merge(out, tmp)
    return out


def tube(points, r, seg=10, bm=None, caps=True):
    """Цэгүүдийг дагасан хоолой (дэнлүүний нум, утас, алчуурын хаалт)."""
    out = bm or _bm()
    tmp = _bm()
    pts = [Vector(p) for p in points]
    rings = []
    prev_n = None
    for i, p in enumerate(pts):
        a = pts[max(i - 1, 0)]
        b = pts[min(i + 1, len(pts) - 1)]
        t = (b - a).normalized()
        ref = Vector((0, 0, 1)) if abs(t.z) < 0.9 else Vector((1, 0, 0))
        nrm = t.cross(ref).normalized() if prev_n is None else (prev_n - t * prev_n.dot(t)).normalized()
        prev_n = nrm
        bnm = t.cross(nrm)
        rings.append([tmp.verts.new(p + (nrm * math.cos(2 * math.pi * k / seg) + bnm * math.sin(2 * math.pi * k / seg)) * r) for k in range(seg)])
    for i in range(len(rings) - 1):
        for k in range(seg):
            j = (k + 1) % seg
            tmp.faces.new([rings[i][k], rings[i][j], rings[i + 1][j], rings[i + 1][k]])
    if caps:
        tmp.faces.new(list(reversed(rings[0])))
        tmp.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
    _merge(out, tmp)
    return out


def quad(corners, bm=None):
    out = bm or _bm()
    vs = [out.verts.new(c) for c in corners]
    out.faces.new(vs)
    return out


def subdivide_smooth(bm, cuts=1):
    bmesh.ops.subdivide_edges(bm, edges=list(bm.edges), cuts=cuts, use_grid_fill=True, smooth=1.0)
    return bm


def transform(bm, matrix):
    bmesh.ops.transform(bm, matrix=matrix, verts=list(bm.verts))
    return bm


def _merge(dst, src):
    vmap = {}
    for v in src.verts:
        vmap[v] = dst.verts.new(v.co)
    for f in src.faces:
        try:
            nf = dst.faces.new([vmap[v] for v in f.verts])
            nf.smooth = f.smooth
        except ValueError:
            pass
    src.free()
