"""Elysium — айлын интерьерийг Blender-ээр (bpy модуль) бүтээж, гэрэлтүүлгийг
лайтмап болгон bake хийж, вэбэд glTF болгон гаргана.

Шаардлага: Python 3.13 + `pip install bpy==5.2.3 numpy pillow`
(Blender-ийн програм хэрэггүй — bpy модуль дотроо Cycles, OIDN-тэй).

  python scripts/interiors/build.py a                  # нэг тип, бүрэн (bake + export)
  python scripts/interiors/build.py all --samples 256  # бүх тип
  python scripts/interiors/build.py a --preview        # зөвхөн Cycles preview рендер
  python scripts/interiors/build.py a --res 1024 --samples 64   # хурдан туршилт

Гаралт (public/models/interiors/):
  <type>.gltf + <type>.bin — геометр (UV0 текстур, UV1 лайтмап)
  <type>-lightmap.webp     — гэрэлтүүлэг (sRGB, scale нь gltf scene.extras-д)
  textures/*.webp          — давталттай albedo (бүх типт дундаа)

Геометрийн эх: scripts/interiors/layouts.json (export-layouts.ts).
"""

import argparse
import json
import math
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

from lib import bake as baker  # noqa: E402
from lib import shell, textures  # noqa: E402
from lib.core import Bucket, MaterialLib, fv  # noqa: E402
from lib.furnish import Ctx, furnish_all  # noqa: E402
from lib.layout import Layout  # noqa: E402
from lib.lights import Lights  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
BUCKETS = ["interior", "ceiling", "caps", "glass", "curtain", "emit", "ceiling_emit"]
NODE_NAMES = {
    "interior": "Interior",
    "ceiling": "Ceiling",
    "caps": "Caps",
    "glass": "Glass",
    "curtain": "Curtains",
    "emit": "Emit",
    "ceiling_emit": "CeilingEmit",
}
BAKED = ("interior", "ceiling")


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.view_settings.view_transform = "AgX"
    try:
        sc.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass
    return sc


def stand_points(lay):
    """Өрөө бүрд аяллын камерын байрлал ба харах цэг: тавилгагүй (0.3 м зайтай)
    цэгүүдээс тавилгын төвөөс хамгийн хол нь (тавилга бүтнээрээ харагдана),
    харах цэг — тавилгын төв. Мөн аяллын эхлэл (зочны өрөөний ар хэсэг)."""
    obstacles = [f for r in lay.rooms for f in r.foot]

    def free(x, z, pad=0.3):
        return not any(f[0] - pad < x < f[1] + pad and f[2] - pad < z < f[3] + pad for f in obstacles)

    def grid(r, margin=0.4):
        mx = min(margin, r.w / 2 - 0.05)
        mz = min(margin, r.d / 2 - 0.05)
        pts = []
        x = r.x0 + mx
        while x <= r.x1 - mx + 1e-6:
            z = r.z0 + mz
            while z <= r.z1 - mz + 1e-6:
                pts.append((x, z))
                z += 0.1
            x += 0.1
        return [p for p in pts if free(*p)] or [p for p in pts if free(*p, pad=0.1)] or [(r.cx, r.cz)]

    def rnd(p):
        return [round(p[0], 3), round(p[1], 3)]

    out = {}
    for r in lay.rooms:
        cand = grid(r)
        if r.foot and r.kind not in ("living", "corridor"):
            area = [(f[1] - f[0]) * (f[3] - f[2]) for f in r.foot]
            tot = sum(area)
            look = (sum(a * (f[0] + f[1]) / 2 for a, f in zip(area, r.foot)) / tot,
                    sum(a * (f[2] + f[3]) / 2 for a, f in zip(area, r.foot)) / tot)
            # хол, гэхдээ өрөөний төвөөс хэт холгүй
            p = max(cand, key=lambda q: math.hypot(q[0] - look[0], q[1] - look[1])
                    - 0.35 * math.hypot(q[0] - r.cx, q[1] - r.cz))
            out[str(r.i)] = rnd(p) + rnd(look)
        else:
            p = min(cand, key=lambda q: (q[0] - r.cx) ** 2 + (q[1] - r.cz) ** 2)
            out[str(r.i)] = rnd(p)
    living = next((r for r in lay.rooms if r.kind == "living"), None)
    start = None
    if living:
        cand = grid(living)
        start = rnd(min(cand, key=lambda q: (q[0] - living.cx) ** 2 + (q[1] - (living.z1 - 0.9)) ** 2))
    return {"rooms": out, "start": start}


def write_stands(type_key, data):
    path = os.path.join(ROOT, "src", "lib", "explore", "baked-stands.json")
    allp = json.load(open(path)) if os.path.exists(path) else {}
    allp[type_key] = data
    with open(path, "w") as f:
        rows = [f"  {json.dumps(k)}: {json.dumps(v, separators=(',', ':'))}" for k, v in sorted(allp.items())]
        f.write("{\n" + ",\n".join(rows) + "\n}\n")


def build(lay, cache):
    sc = reset()
    lib = MaterialLib(textures.generate(os.path.join(cache, "tex")))
    coll = bpy.data.collections.new("Interior")
    sc.collection.children.link(coll)
    lcoll = bpy.data.collections.new("Lights")
    sc.collection.children.link(lcoll)
    scratch = bpy.data.collections.new("Scratch")
    sc.collection.children.link(scratch)
    lights = Lights(lcoll)
    lights.world(sc)
    lights.sun()
    B = {k: Bucket(NODE_NAMES[k]) for k in BUCKETS}
    t = time.time()
    shell.walls(lay, B, scratch)
    shell.floors(lay, B)
    shell.ceiling(lay, B)
    shell.windows(lay, B, lights)
    shell.curtains(lay, B)
    shell.doors(lay, B)
    furnish_all(Ctx(lay, B, lights))
    objs = {}
    for k in BUCKETS:
        if len(B[k].bm.faces):
            objs[k] = B[k].to_object(lib, coll)
        else:
            B[k].bm.free()
    for k in ("glass", "curtain"):
        if k in objs:
            ob = objs[k]
            ob.visible_shadow = False
            ob.visible_diffuse = False
            ob.visible_transmission = False
    for k in ("emit", "ceiling_emit"):
        if k in objs:
            objs[k].visible_shadow = False
    tris = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in objs.values())
    print(f"  build: {time.time() - t:.1f}s, {tris} tris, {lights.n} lights")
    return sc, objs


def look_at(cam, target):
    d = Vector(target) - cam.location
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def preview(sc, lay, objs, outdir, samples=64, size=(960, 540), only=None, plan=True):
    """Cycles preview: зочны өрөө, гал тогоо, унтлагын өрөө, угаалгын өрөө, dollhouse."""
    os.makedirs(outdir, exist_ok=True)
    sc.render.resolution_x, sc.render.resolution_y = size
    sc.render.resolution_percentage = 100
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
    sc.render.image_settings.file_format = "JPEG"
    sc.render.image_settings.quality = 90
    shots = []
    living = next((r for r in lay.rooms if r.kind == "living"), None)
    kitchen = next((r for r in lay.rooms if r.kind == "kitchen"), None)
    beds = [r for r in lay.rooms if r.kind == "bedroom"]
    baths = [r for r in lay.rooms if r.kind == "bath"]
    if living:
        z = min(lay.D - 0.6, living.z1 + 1.0)
        shots.append(("living", (living.cx + living.w * 0.18, 1.55, z), (living.cx - living.w * 0.1, 1.15, 0.3), 70))
    if kitchen and living:
        shots.append(("kitchen", (living.cx - living.w * 0.2, 1.6, 0.7), (kitchen.cx, 1.1, kitchen.z1), 70))
    if beds:
        b = max(beds, key=lambda r: r.w * r.d)
        shots.append(("bedroom", (b.cx + b.w * 0.3, 1.55, b.z0 + 0.6), (b.cx - b.w * 0.1, 0.9, b.z1), 75))
    if baths:
        b = max(baths, key=lambda r: r.w * r.d)
        # хуурай төгсгөлийн булангаас нойтон төгсгөл рүү (угаалтуур, шүршүүр харагдана)
        if b.d >= b.w:
            pos, tgt = (b.x0 + b.w * 0.75, 1.65, b.z1 - 0.25), (b.x0 + b.w * 0.3, 1.0, b.z0)
            if any(abs(d["at"] - b.z0) < 0.2 and d["axis"] == "x" for d in lay.doors if b.i in d["rooms"]):
                pos, tgt = (b.x0 + b.w * 0.75, 1.65, b.z0 + 0.25), (b.x0 + b.w * 0.3, 1.0, b.z1)
        else:
            pos, tgt = (b.x1 - 0.25, 1.65, b.z0 + b.d * 0.75), (b.x0, 1.0, b.z0 + b.d * 0.3)
        shots.append(("bath", pos, tgt, 88))
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    sc.collection.objects.link(cam)
    sc.camera = cam
    for name, pos, tgt, fov in shots:
        if only and name not in only:
            continue
        cam.data.type = "PERSP"
        cam.data.angle = math.radians(fov)
        cam.location = fv(*pos)
        look_at(cam, fv(*tgt))
        sc.render.filepath = os.path.join(outdir, f"{lay.type}-{name}.jpg")
        t = time.time()
        bpy.ops.render.render(write_still=True)
        print(f"  preview {name}: {time.time() - t:.0f}s")
    # dollhouse — тааз нуугдсан
    for k in ("ceiling", "ceiling_emit"):
        if k in objs:
            objs[k].hide_render = True
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = max(lay.L, lay.D) * 1.25
    c = fv(lay.L / 2, 0, lay.D / 2 - 0.4)
    cam.location = c + Vector((0.45, 0.85, 1.1)).normalized() * 30
    look_at(cam, c)
    sc.render.filepath = os.path.join(outdir, f"{lay.type}-dollhouse.jpg")
    bpy.ops.render.render(write_still=True)
    if plan:
        cam.data.ortho_scale = max(lay.L, lay.D + 1.4) * 1.08
        sc.render.resolution_x = sc.render.resolution_y = 900
        c = fv(lay.L / 2, 0, (lay.D - 1.3) / 2)
        cam.location = c + Vector((0, 0, 30))
        cam.rotation_euler = (0, 0, 0)
        sc.render.filepath = os.path.join(outdir, f"{lay.type}-plan.jpg")
        bpy.ops.render.render(write_still=True)
        sc.render.resolution_x, sc.render.resolution_y = size
    for k in ("ceiling", "ceiling_emit"):
        if k in objs:
            objs[k].hide_render = False


def export(sc, lay, objs, outdir, scale, res, compress=True):
    os.makedirs(outdir, exist_ok=True)
    for k, ob in objs.items():
        me = ob.data
        if k not in BAKED and "Lightmap" in me.uv_layers:
            me.uv_layers.remove(me.uv_layers["Lightmap"])
        if "UV0" in me.uv_layers:
            me.uv_layers["UV0"].active = True
            me.uv_layers["UV0"].active_render = True
    for k in ("glass", "curtain", "emit", "ceiling_emit", "caps"):
        if k in objs:
            me = objs[k].data
            if "UV0" in me.uv_layers and not any(
                m and any(n.type == "TEX_IMAGE" for n in m.node_tree.nodes) for m in me.materials
            ):
                me.uv_layers.remove(me.uv_layers["UV0"])
    sc["lightmap_scale"] = round(scale, 5)
    sc["lightmap"] = f"{lay.type}-lightmap.webp"
    sc["type"] = lay.type
    sc["L"] = lay.L
    sc["D"] = lay.D
    sc["H"] = lay.H
    bpy.ops.object.select_all(action="DESELECT")
    for ob in objs.values():
        ob.select_set(True)
    path = os.path.join(outdir, f"{lay.type}.gltf")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLTF_SEPARATE",
        export_texture_dir="textures",
        export_image_format="WEBP",
        export_image_quality=86,
        use_selection=True,
        export_texcoords=True,
        export_normals=False,
        export_tangents=False,
        export_materials="EXPORT",
        export_extras=True,
        export_yup=True,
        export_apply=False,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
    )
    print(f"  export: {path}")
    if compress:
        # meshopt + quantization (gltf-transform) — геометр ~3 дахин жижиг
        import shutil
        import subprocess
        tmp = os.path.join(outdir, f".tmp-{lay.type}")
        os.makedirs(tmp, exist_ok=True)
        cmd = ["npx", "-y", "@gltf-transform/cli@4", "meshopt", path, os.path.join(tmp, f"{lay.type}.gltf"), "--level", "medium"]
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
        if r.returncode == 0:
            for f in (f"{lay.type}.gltf", f"{lay.type}.bin"):
                shutil.move(os.path.join(tmp, f), os.path.join(outdir, f))
            print("  meshopt: ok")
        else:
            print("  meshopt: failed —", (r.stderr or r.stdout).strip()[-300:])
        shutil.rmtree(tmp, ignore_errors=True)


def run(type_key, args):
    data = json.load(open(os.path.join(HERE, "layouts.json")))
    lay = Layout(data[type_key])
    cache = os.path.join(HERE, ".cache")
    work = os.path.join(cache, type_key)
    os.makedirs(work, exist_ok=True)
    print(f"== {type_key} ({data[type_key]['code']}) L={lay.L} D={lay.D}")
    sc, objs = build(lay, cache)
    write_stands(type_key, stand_points(lay))
    if args.stands_only:
        return
    if args.preview:
        size = tuple(int(v) for v in args.preview_size.split("x"))
        preview(sc, lay, objs, args.preview_dir or os.path.join(cache, "preview"), samples=args.preview_samples,
                size=size, only=args.only.split(",") if args.only else None)
        if not args.bake:
            return
    baked = [objs[k] for k in BAKED if k in objs]
    hide = [ob for k, ob in objs.items() if k not in BAKED]
    baker.unwrap(baked)
    res = args.res if args.res != 2048 or lay.L * lay.D < 120 else 2560
    img = baker.bake(sc, baked, res, args.samples, hide)
    rgb, alpha = baker.denoise(img, work)
    out = os.path.abspath(args.out)
    os.makedirs(out, exist_ok=True)
    scale = baker.encode(rgb, alpha, os.path.join(out, f"{type_key}-lightmap.webp"))
    print(f"  lightmap scale {scale:.4f}")
    if args.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(work, f"{type_key}.blend"))
    export(sc, lay, objs, out, scale, args.res, compress=not args.no_compress)


def main():
    argv = sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument("type", help="a | b | c | d | d2f | e | e2f | all")
    ap.add_argument("--res", type=int, default=2048)
    ap.add_argument("--samples", type=int, default=256)
    ap.add_argument("--out", default=os.path.join(ROOT, "public", "models", "interiors"))
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--preview-dir", default=None)
    ap.add_argument("--preview-samples", type=int, default=64)
    ap.add_argument("--preview-size", default="960x540")
    ap.add_argument("--bake", action="store_true", help="--preview-тэй хамт bake хийх")
    ap.add_argument("--only", default=None, help="preview: living,kitchen,bedroom,bath (хоосон = бүгд)")
    ap.add_argument("--save-blend", action="store_true")
    ap.add_argument("--no-compress", action="store_true", help="gltf-transform meshopt-гүй")
    ap.add_argument("--stands-only", action="store_true", help="зөвхөн baked-stands.json (bake-гүй)")
    args = ap.parse_args(argv)
    if not args.preview and not args.stands_only:
        args.bake = True
    keys = ["a", "b", "c", "d", "d2f", "e", "e2f"] if args.type == "all" else args.type.split(",")
    for k in keys:
        t = time.time()
        run(k, args)
        print(f"== {k} done in {time.time() - t:.0f}s")


if __name__ == "__main__":
    main()
