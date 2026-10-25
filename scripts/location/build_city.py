"""Төслийн орчмын бодит хотын 3D загвар (Google Maps-ийн «блок» хэв маяг).

Overture/OSM өгөгдлөөс (fetch_overture.py → .cache/*.parquet):
  • барилга — суурийн бодит хэлбэр, өндөр (байхгүй бол давхар/төрөл/талбайгаар
    тооцно); холын жижиг барилга хавтгай ул мөр (LOD);
  • зам — ангиллаар өргөн, өнгө (их зам шар, бусад цагаан), төмөр зам;
  • ус (Туул гол, суваг), цэцэрлэгт хүрээлэн, ой, зүлэг;
  • төслийн талбай дээрх одоо байгаа барилгыг хасна.

  python scripts/location/build_city.py
  → public/models/location/city.glb, src/lib/explore/location-data.json

Координат: x — зүүн, z — урд (м), төв — site-content.ts-ийн coords.
Лиценз: ODbL — © OpenStreetMap contributors, Overture Maps Foundation.
"""

import json
import math
import os
import struct
import subprocess
import zlib

import mapbox_earcut as earcut
import numpy as np
import pyarrow.parquet as pq
from shapely import wkb
from shapely.affinity import affine_transform
from shapely.geometry import Point, box
from shapely.geometry.polygon import orient

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
CACHE = os.path.join(HERE, ".cache")
OUT_GLB = os.path.join(ROOT, "public", "models", "location", "city.glb")
OUT_DATA = os.path.join(ROOT, "src", "lib", "explore", "location-data.json")

META = json.load(open(os.path.join(CACHE, "meta.json")))
LAT0, LNG0 = META["site"]
MX = 111320.0 * math.cos(math.radians(LAT0))
MY = 110574.0
TO_LOCAL = [MX, 0, 0, -MY, -LNG0 * MX, LAT0 * MY]  # (lng, lat) → (x зүүн, z урд)

# Төслийн талбай (explorer-ийн DECK + урд гудамж, site.ts FRONTAGE) — одоо
# байгаа барилга, замыг хасна.
SITE = box(-118, -86, 118, 66)
EXT = META["extent"]
CLIP = box(-EXT["west"], -EXT["north"], EXT["east"], EXT["south"])


def load(name):
    return pq.read_table(os.path.join(CACHE, f"{name}.parquet")).to_pylist()


def local(geom_wkb):
    return affine_transform(wkb.loads(geom_wkb), TO_LOCAL)


def srgb_to_linear(c):
    c = np.asarray(c, dtype=np.float64) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def h01(s):
    """id-аас тогтвортой 0…1 тоо."""
    return (zlib.crc32(s.encode()) & 0xFFFFFF) / 0xFFFFFF


# ---------------------------------------------------------------- mesh буфер

class MeshBuf:
    def __init__(self, colored=True):
        self.pos = []
        self.col = []
        self.idx = []
        self.n = 0
        self.colored = colored

    def add(self, verts, tris, color=None):
        """verts: (k, 3) float, tris: (m, 3) int (локал индекс)."""
        verts = np.asarray(verts, dtype=np.float32)
        if len(verts) == 0 or len(tris) == 0:
            return
        self.pos.append(verts)
        self.idx.append(np.asarray(tris, dtype=np.uint32) + self.n)
        if self.colored:
            c = np.broadcast_to(np.asarray(color, dtype=np.float32), (len(verts), 3))
            self.col.append(c)
        self.n += len(verts)

    def arrays(self):
        if not self.pos:
            return None
        p = np.concatenate(self.pos)
        i = np.concatenate(self.idx).reshape(-1)
        c = np.concatenate(self.col) if self.colored else None
        return p, c, i


def triangulate(poly):
    """shapely Polygon (x, z) → (verts2d, tris) earcut-аар (нүхтэй)."""
    rings = [np.asarray(poly.exterior.coords, dtype=np.float64)[:-1]]
    rings += [np.asarray(r.coords, dtype=np.float64)[:-1] for r in poly.interiors]
    rings = [r for r in rings if len(r) >= 3]
    if not rings:
        return None, None
    verts = np.concatenate(rings)
    ends = np.cumsum([len(r) for r in rings]).astype(np.uint32)
    tri = earcut.triangulate_float64(verts, ends).reshape(-1, 3)
    return verts, tri


def flat(buf, geom, y, color, up=True):
    """Хавтгай олон өнцөгт (шал түвшний давхарга) y өндөрт, дээшээ харсан."""
    for poly in getattr(geom, "geoms", [geom]):
        if poly.geom_type != "Polygon" or poly.area < 0.5:
            continue
        v2, tri = triangulate(poly)
        if v2 is None or len(tri) == 0:
            continue
        v3 = np.column_stack([v2[:, 0], np.full(len(v2), y), v2[:, 1]])
        tri = fix_up(v3, tri, up)
        buf.add(v3, tri, color)


def fix_up(v3, tri, up=True):
    a, b, c = v3[tri[:, 0]], v3[tri[:, 1]], v3[tri[:, 2]]
    ny = (b[:, 2] - a[:, 2]) * (c[:, 0] - a[:, 0]) - (b[:, 0] - a[:, 0]) * (c[:, 2] - a[:, 2])
    flip = ny < 0 if up else ny > 0
    tri = tri.copy()
    tri[flip] = tri[flip][:, [0, 2, 1]]
    return tri


# ---------------------------------------------------------------- барилга

def building_height(r, area):
    k = h01(r["id"] or "x")
    if r["height"]:
        return float(min(max(r["height"], 2.5), 320))
    if r["num_floors"]:
        n = int(r["num_floors"])
        return n * 3.0 + (1.2 if n > 2 else 0.4)
    cls = (r["class"] or "").lower()
    if cls == "ger":
        return 3.0
    if cls in ("house", "detached", "hut", "shed", "garage", "garages", "cabin", "bungalow", "semidetached_house"):
        return 3.2 + 2.6 * k
    if cls in ("apartments", "residential", "dormitory"):
        floors = 5 if area < 450 else 9 if area < 1000 else 12
        return floors * 3.0 + 1.2 + (3.0 if k > 0.7 else 0)
    if cls in ("commercial", "retail", "office", "hotel"):
        return 12 + 12 * k
    if cls in ("school", "kindergarten", "university", "college"):
        return 10 + 4 * k
    if cls in ("hospital",):
        return 15 + 6 * k
    if cls in ("industrial", "warehouse", "factory", "manufacture"):
        return 8 + 5 * k
    if cls in ("church", "temple", "monastery", "religious"):
        return 12 + 6 * k
    # төрөлгүй — талбайгаар
    if area < 30:
        return 2.6
    if area < 120:
        return 3.4 + 2.0 * k
    if area < 400:
        return 6 + 6 * k
    if area < 1500:
        return 9 + 9 * k
    if area < 5000:
        return 9 + 6 * k
    return 10 + 6 * k


ROOF = srgb_to_linear((242, 241, 237))
WALL = srgb_to_linear((222, 221, 216))
ROOF_TALL = srgb_to_linear((234, 236, 240))
FLAT_FP = srgb_to_linear((226, 224, 218))


def extrude(buf, poly, h, k):
    poly = orient(poly, 1.0)
    shade = 0.96 + 0.06 * k
    tall = min(max((h - 20) / 40, 0), 1)
    roof = (ROOF * (1 - tall) + ROOF_TALL * tall) * shade
    wall = WALL * shade
    # хана
    for ring in [poly.exterior, *poly.interiors]:
        c = np.asarray(ring.coords, dtype=np.float64)
        if len(c) < 4:
            continue
        a, b = c[:-1], c[1:]
        m = len(a)
        v = np.empty((m * 4, 3), dtype=np.float32)
        v[0::4] = np.column_stack([a[:, 0], np.zeros(m), a[:, 1]])
        v[1::4] = np.column_stack([a[:, 0], np.full(m, h), a[:, 1]])
        v[2::4] = np.column_stack([b[:, 0], np.full(m, h), b[:, 1]])
        v[3::4] = np.column_stack([b[:, 0], np.zeros(m), b[:, 1]])
        base = np.arange(m) * 4
        tri = np.column_stack([base, base + 1, base + 2, base, base + 2, base + 3]).reshape(-1, 3)
        buf.add(v, tri, wall)
    # дээвэр
    v2, tri = triangulate(poly)
    if v2 is not None and len(tri):
        v3 = np.column_stack([v2[:, 0], np.full(len(v2), h), v2[:, 1]])
        buf.add(v3, fix_up(v3, tri), roof)


def buildings(stats):
    full, flatb = MeshBuf(), MeshBuf()
    kept = 0
    for r in load("building"):
        if r.get("is_underground"):
            continue
        g = local(r["geometry"])
        if not g.is_valid:
            g = g.buffer(0)
        c = g.centroid
        d = math.hypot(c.x, c.y)
        area = g.area
        if g.intersects(SITE) and (g.intersection(SITE).area > 0.4 * area or SITE.contains(c)):
            stats["site_removed"].append(((r["names"] or {}).get("primary") if r["names"] else None, round(area)))
            continue
        h = building_height(r, area)
        k = h01(r["id"] or "x")
        tol = 0.25 + d / 2500
        if d < 2000:
            if area < 8:
                continue
            mode = "full"
        else:
            if h >= 7 or area >= 250:
                mode = "full"
            elif area >= 25:
                mode = "flat"
            else:
                continue
        g = g.simplify(tol, preserve_topology=True)
        for poly in getattr(g, "geoms", [g]):
            if poly.geom_type != "Polygon" or poly.area < 4:
                continue
            if mode == "full":
                extrude(full, poly, h, k)
            else:
                # холын жижиг барилга — 2 гурвалжин тэгш өнцөгт ул мөр
                fp = poly.minimum_rotated_rectangle if poly.area < 300 else poly.simplify(1.5)
                flat(flatb, fp, 0.05, FLAT_FP * (0.97 + 0.05 * k))
        kept += 1
    stats["buildings"] = kept
    return full, flatb


# ---------------------------------------------------------------- зам, ус, ногоон

ROAD = {
    # class: (өргөн м, бүлэг, өнгө)
    "motorway": (24, "major", (249, 220, 140)),
    "trunk": (24, "major", (249, 220, 140)),
    "primary": (18, "major", (252, 232, 170)),
    "secondary": (14, "minor", (255, 255, 255)),
    "tertiary": (11, "minor", (255, 255, 255)),
    "residential": (7, "minor", (253, 253, 252)),
    "unclassified": (7, "minor", (253, 253, 252)),
    "living_street": (6, "minor", (253, 253, 252)),
    "pedestrian": (5, "path", (240, 238, 233)),
    "service": (4.5, "path", (249, 249, 247)),
    "footway": (2.2, "path", (238, 236, 231)),
    "path": (2.0, "path", (238, 236, 231)),
    "cycleway": (2.2, "path", (238, 236, 231)),
    "track": (3.0, "path", (236, 231, 219)),
}


def roads(stats):
    bufs = {"major": MeshBuf(), "minor": MeshBuf(), "path": MeshBuf(), "rail": MeshBuf()}
    ys = {"path": 0.06, "minor": 0.08, "major": 0.1, "rail": 0.11}
    labels = {}
    for r in load("segment"):
        g = local(r["geometry"])
        d = g.distance(Point(0, 0))
        if r["subtype"] == "rail":
            if d > 6000:
                continue
            geom = g.buffer(1.6, cap_style="flat").difference(SITE)
            flat(bufs["rail"], geom, ys["rail"], srgb_to_linear((190, 190, 196)))
            continue
        if r["subtype"] != "road":
            continue
        spec = ROAD.get(r["class"])
        if not spec:
            continue
        w, group, col = spec
        if group == "path" and d > 2500:
            continue
        if group == "minor" and r["class"] in ("residential", "unclassified", "living_street") and d > 4500:
            continue
        if group == "path" and r["class"] == "service" and d > 1800:
            continue
        geom = g.buffer(w / 2, cap_style="round" if group != "path" else "flat", quad_segs=2)
        geom = geom.simplify(0.3 if d < 2000 else 1.0)
        if geom.intersects(SITE):
            geom = geom.difference(SITE)
        flat(bufs[group], geom, ys[group], srgb_to_linear(col))
        nm = (r["names"] or {}).get("primary") if r["names"] else None
        if nm and r["class"] in ("motorway", "trunk", "primary", "secondary"):
            ln = g.length
            prev = labels.get(nm)
            # хамгийн урт хэсгийн дунд цэг, төслөөс 2.5 км-ийн дотор
            if d < 2500 and (prev is None or ln > prev[0]):
                mid = g.interpolate(0.5, normalized=True)
                labels[nm] = (ln, round(mid.x), round(mid.y))
    stats["road_labels"] = len(labels)
    return bufs, labels


GREEN_USE = {
    "park": (204, 228, 187), "garden": (204, 228, 187), "village_green": (204, 228, 187),
    "recreation_ground": (204, 228, 187), "grass": (212, 233, 196), "golf_course": (198, 226, 180),
    "pitch": (190, 222, 170), "playground": (210, 230, 190), "cemetery": (206, 222, 196),
    "zoo": (204, 228, 187), "flowerbed": (212, 233, 196), "meadow": (214, 232, 198),
}
COVER = {
    "forest": (184, 214, 166), "shrub": (204, 224, 184), "grass": (214, 232, 198), "moss": (210, 226, 196),
    "wetland": (196, 222, 210), "crop": (226, 234, 200), "barren": (236, 232, 220),
}


def nature(stats):
    cover, green, water = MeshBuf(), MeshBuf(), MeshBuf()
    for r in load("land_cover"):
        col = COVER.get(r["subtype"])
        if not col:
            continue
        g = local(r["geometry"]).buffer(0).intersection(CLIP)
        flat(cover, g.simplify(4.0), 0.02, srgb_to_linear(col))
    for r in load("land_use"):
        col = GREEN_USE.get(r["class"]) or (GREEN_USE["park"] if r["subtype"] in ("park", "recreation") else None)
        if not col:
            continue
        g = local(r["geometry"]).buffer(0).intersection(CLIP)
        if g.intersects(SITE):
            g = g.difference(SITE)
        flat(green, g.simplify(0.5), 0.04, srgb_to_linear(col))
    wcol = srgb_to_linear((170, 211, 238))
    river_names = {}
    for r in load("water"):
        g = local(r["geometry"])
        if g.geom_type in ("LineString", "MultiLineString"):
            w = {"river": 22, "canal": 6, "stream": 4, "drain": 3, "ditch": 2.5}.get(r["subtype"], 3)
            g = g.buffer(w / 2, cap_style="round", quad_segs=3)
        else:
            g = g.buffer(0)
        g = g.intersection(CLIP)
        if g.intersects(SITE):
            g = g.difference(SITE)
        flat(water, g.simplify(0.8), 0.05, wcol)
        nm = (r["names"] or {}).get("primary") if r["names"] else None
        if nm and r["subtype"] == "river":
            c = g.representative_point()
            d = math.hypot(c.x, c.y)
            if nm not in river_names or d < river_names[nm][0]:
                river_names[nm] = (d, round(c.x), round(c.y))
    return cover, green, water, river_names


# ---------------------------------------------------------------- POI

POI_KEYS = {
    "Эрэл Групп": ["erel group", "эрэл групп"],
    "Поларис их дэлгүүр": ["polaris department", "поларис их дэлгүүр"],
    "Анун төв": ["анун тавилгын", "anun"],
    "Таван Богд": ["таван богд групп", "tavan bogd group"],
    "Мишээл экспо": ["мишээл экспо", "misheel expo"],
    "Номин Юнайтед": ["nomin united", "номин юнайтед"],
    "Нарны гүүр": ["нарны гүүр"],
    "Талбай": ["сүхбаатарын талбай", "чингисийн талбай"],
}


def names_of(r):
    nm = r.get("names") or {}
    out = []
    if isinstance(nm, dict):
        if nm.get("primary"):
            out.append(nm["primary"])
        common = nm.get("common")
        if isinstance(common, dict):
            out += [v for v in common.values() if v]
    return [n.lower() for n in out]


def pois():
    found = {}
    for typ in ("building", "land_use", "place"):
        for r in load(typ):
            ns = names_of(r)
            if not ns:
                continue
            for key, qs in POI_KEYS.items():
                if not any(q in n for q in qs for n in ns):
                    continue
                g = local(r["geometry"])
                c = g.representative_point() if g.geom_type != "Point" else g
                d = math.hypot(c.x, c.y)
                rank = {"building": 0, "land_use": 0, "place": 1}[typ]
                cur = found.get(key)
                if cur is None or (rank, d) < (cur[0], cur[1]):
                    found[key] = (rank, d, round(c.x), round(c.y))
    return {k: [v[2], v[3]] for k, v in found.items()}


# ---------------------------------------------------------------- glTF

def write_glb(path, layers):
    """layers: [(name, MeshBuf | None, material)] → нэг .glb (node бүр нэг mesh)."""
    bin_parts, views, accessors, meshes, nodes, materials = [], [], [], [], [], []
    offset = 0

    def push(data, target, comp, count, typ, mn=None, mx=None, normalized=False):
        nonlocal offset
        raw = data.tobytes()
        pad = (-len(raw)) % 4
        bin_parts.append(raw + b"\0" * pad)
        views.append({"buffer": 0, "byteOffset": offset, "byteLength": len(raw), "target": target})
        offset += len(raw) + pad
        acc = {"bufferView": len(views) - 1, "componentType": comp, "count": count, "type": typ}
        if mn is not None:
            acc["min"], acc["max"] = mn, mx
        if normalized:
            acc["normalized"] = True
        accessors.append(acc)
        return len(accessors) - 1

    mat_ix = {}
    for name, buf, mat in layers:
        if buf is None:
            continue
        arr = buf.arrays()
        if arr is None:
            continue
        p, c, i = arr
        if mat not in mat_ix:
            materials.append({"name": mat, "pbrMetallicRoughness": {"baseColorFactor": [1, 1, 1, 1], "metallicFactor": 0, "roughnessFactor": 1}})
            mat_ix[mat] = len(materials) - 1
        attrs = {"POSITION": push(p.astype(np.float32), 34962, 5126, len(p), "VEC3", p.min(0).tolist(), p.max(0).tolist())}
        if c is not None:
            c8 = np.clip(np.round(c * 255), 0, 255).astype(np.uint8)
            c8 = np.column_stack([c8, np.full(len(c8), 255, np.uint8)])
            attrs["COLOR_0"] = push(c8, 34962, 5121, len(c8), "VEC4", normalized=True)
        ind = push(i.astype(np.uint32), 34963, 5125, len(i), "SCALAR")
        meshes.append({"name": name, "primitives": [{"attributes": attrs, "indices": ind, "material": mat_ix[mat]}]})
        nodes.append({"name": name, "mesh": len(meshes) - 1})
    gl = {
        "asset": {"version": "2.0", "generator": "elysium scripts/location/build_city.py",
                  "copyright": "© OpenStreetMap contributors, Overture Maps Foundation (ODbL)"},
        "scene": 0,
        "scenes": [{"nodes": list(range(len(nodes)))}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": materials,
        "accessors": accessors,
        "bufferViews": views,
        "buffers": [{"byteLength": offset}],
    }
    js = json.dumps(gl, separators=(",", ":")).encode()
    js += b" " * ((-len(js)) % 4)
    binb = b"".join(bin_parts)
    out = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(binb))
    out += struct.pack("<II", len(js), 0x4E4F534A) + js
    out += struct.pack("<II", len(binb), 0x004E4942) + binb
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(out)


def main():
    stats = {"site_removed": []}
    full, flatb = buildings(stats)
    rb, road_labels = roads(stats)
    cover, green, water, rivers = nature(stats)
    layers = [
        ("Cover", cover, "cover"),
        ("Green", green, "green"),
        ("Water", water, "water"),
        ("RoadsPath", rb["path"], "road_path"),
        ("RoadsMinor", rb["minor"], "road_minor"),
        ("RoadsMajor", rb["major"], "road_major"),
        ("Rail", rb["rail"], "rail"),
        ("BuildingsFlat", flatb, "building_flat"),
        ("Buildings", full, "building"),
    ]
    tris = {n: (len(b.arrays()[2]) // 3 if b and b.arrays() else 0) for n, b, _ in layers}
    raw = OUT_GLB.replace(".glb", ".raw.glb")
    write_glb(raw, layers)
    r = subprocess.run(["npx", "-y", "@gltf-transform/cli@4", "meshopt", raw, OUT_GLB, "--level", "medium", "--quantize-position", "16"],
                       cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        print("meshopt failed:", (r.stderr or r.stdout)[-400:])
        os.replace(raw, OUT_GLB)
    else:
        os.remove(raw)
    labels = [{"name": n, "x": x, "z": z, "kind": "road"} for n, (_ln, x, z) in sorted(road_labels.items(), key=lambda kv: -kv[1][0])]
    labels += [{"name": n, "x": x, "z": z, "kind": "water"} for n, (_d, x, z) in rivers.items()]
    data = {
        "source": "© OpenStreetMap contributors · Overture Maps Foundation",
        "release": META["release"],
        "site": [LAT0, LNG0],
        "extent": META["extent"],
        "pois": pois(),
        "labels": labels,
    }
    with open(OUT_DATA, "w") as f:
        rows = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False, separators=(',', ':'))}" for k, v in data.items() if k != "labels"]
        rows.append('  "labels": [\n' + ",\n".join("    " + json.dumps(l, ensure_ascii=False, separators=(",", ":")) for l in data["labels"]) + "\n  ]")
        f.write("{\n" + ",\n".join(rows) + "\n}\n")
    print("triangles", tris, "total", sum(tris.values()))
    print("buildings kept", stats["buildings"], "removed on site", stats["site_removed"])
    print("glb", os.path.getsize(OUT_GLB) // 1024, "KB;", "pois", data["pois"])


if __name__ == "__main__":
    main()
