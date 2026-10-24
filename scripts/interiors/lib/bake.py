"""Лайтмап: UV атлас → Cycles DIFFUSE (direct+indirect, өнгөгүй) → OIDN →
8 битийн sRGB WebP (скейлтэй). Вэб дээр: albedo × lightmap × scale."""

import math
import os
import time

import bmesh
import bpy
import numpy as np
from bpy_extras import bmesh_utils
from PIL import Image

# Атласын тэргүүлэх зэрэг (тэкселийн нягтын үржүүлэгч) — материал тус бүрээр.
PRIORITY = {
    "paint_ext": 0.3,
    "ceiling": 0.75,
    "oak_floor": 1.15,
    "stone_floor": 1.15,
    "travertine_floor": 1.15,
    "foliage": 0.8,
    "foliage2": 0.8,
    "trunk": 0.6,
    "soil": 0.4,
}


def _prioritize(ob):
    """Арлыг материалын зэрэглэлээр томруулах/жижигрүүлэх; шалан дээр
    наалдсан доод нүүрийг (харагдахгүй) бараг тэг болгоно."""
    me = ob.data
    bm = bmesh.new()
    bm.from_mesh(me)
    uv = bm.loops.layers.uv["Lightmap"]
    names = [m.name if m else "" for m in me.materials]
    for isl in bmesh_utils.bmesh_linked_uv_islands(bm, uv):
        hidden = all(f.normal.z < -0.9 and f.calc_center_median().z < 0.02 for f in isl)
        k = 0.05 if hidden else min(PRIORITY.get(names[f.material_index], 1.0) for f in isl)
        if k == 1.0:
            continue
        cs = [l[uv].uv.copy() for f in isl for l in f.loops]
        cx = sum(c.x for c in cs) / len(cs)
        cy = sum(c.y for c in cs) / len(cs)
        for f in isl:
            for l in f.loops:
                u, v = l[uv].uv
                l[uv].uv = ((u - cx) * k + cx, (v - cy) * k + cy)
    bm.to_mesh(me)
    bm.free()


def unwrap(objs, margin=0.0035):
    bpy.ops.object.select_all(action="DESELECT")
    for ob in objs:
        ob.select_set(True)
        ob.data.uv_layers.active = ob.data.uv_layers["Lightmap"]
    bpy.context.view_layer.objects.active = objs[0]
    t = time.time()
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.0, area_weight=0.0, scale_to_bounds=False)
    bpy.ops.uv.average_islands_scale()
    bpy.ops.object.mode_set(mode="OBJECT")
    for ob in objs:
        _prioritize(ob)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.select_all(action="SELECT")
    bpy.ops.uv.pack_islands(rotate=True, scale=True, margin=margin, shape_method="CONCAVE")
    bpy.ops.object.mode_set(mode="OBJECT")
    print(f"  uv: {time.time() - t:.1f}s")


def bake(scene, objs, res, samples, hide):
    """objs-ыг нэг атлас руу bake хийнэ. hide — bake-д оролцохгүй объектууд."""
    for ob in hide:
        ob.hide_render = True
    img = bpy.data.images.new("Lightmap", res, res, float_buffer=True, alpha=True)
    touched = []
    saved = {}
    for ob in objs:
        for m in ob.data.materials:
            if m is None or m.name in saved:
                continue
            nt = m.node_tree
            p = nt.nodes.get("Principled BSDF")
            if p:
                saved[m.name] = (p.inputs["Metallic"].default_value, p.inputs["Transmission Weight"].default_value)
                p.inputs["Metallic"].default_value = 0.0
                p.inputs["Transmission Weight"].default_value = 0.0
            else:
                saved[m.name] = None
            n = nt.nodes.new("ShaderNodeTexImage")
            n.image = img
            n.name = "__bake"
            nt.nodes.active = n
            touched.append(m)
    c = scene.cycles
    c.samples = samples
    c.use_denoising = False
    c.max_bounces = 8
    c.diffuse_bounces = 5
    c.glossy_bounces = 2
    c.transmission_bounces = 2
    c.transparent_max_bounces = 4
    c.sample_clamp_indirect = 6.0
    c.caustics_reflective = False
    c.caustics_refractive = False
    scene.render.bake.margin = 10
    scene.render.bake.margin_type = "EXTEND"
    bpy.ops.object.select_all(action="DESELECT")
    for ob in objs:
        ob.select_set(True)
        ob.data.uv_layers.active = ob.data.uv_layers["Lightmap"]
    bpy.context.view_layer.objects.active = objs[0]
    t = time.time()
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, margin=10, margin_type="EXTEND", use_clear=True)
    print(f"  bake {res}² × {samples}spp: {time.time() - t:.0f}s")
    for m in touched:
        nt = m.node_tree
        nt.nodes.remove(nt.nodes["__bake"])
        if saved.get(m.name):
            p = nt.nodes.get("Principled BSDF")
            p.inputs["Metallic"].default_value, p.inputs["Transmission Weight"].default_value = saved[m.name]
    for ob in objs:
        ob.data.uv_layers.active = ob.data.uv_layers["UV0"]
    for ob in hide:
        ob.hide_render = False
    return img


def denoise(img, workdir):
    """OIDN (Blender compositor, CPU)."""
    raw = os.path.join(workdir, "lightmap_raw.exr")
    out = os.path.join(workdir, "lightmap_dn.exr")
    img.filepath_raw = raw
    img.file_format = "OPEN_EXR"
    img.save()
    src = bpy.data.images.load(raw)
    res = src.size[0]
    ds = bpy.data.scenes.new("denoise")
    ds.render.engine = "CYCLES"
    ds.cycles.samples = 1
    ds.render.resolution_x = res
    ds.render.resolution_y = res
    ds.render.resolution_percentage = 100
    ds.render.compositor_device = "CPU"
    ds.render.image_settings.file_format = "OPEN_EXR"
    ds.render.image_settings.color_depth = "32"
    ds.render.filepath = out
    cam = bpy.data.objects.new("dn_cam", bpy.data.cameras.new("dn_cam"))
    ds.collection.objects.link(cam)
    ds.camera = cam
    tree = bpy.data.node_groups.new("denoise", "CompositorNodeTree")
    ds.compositing_node_group = tree
    a = tree.nodes.new("CompositorNodeImage")
    a.image = src
    dn = tree.nodes.new("CompositorNodeDenoise")
    dn.inputs["HDR"].default_value = True
    o = tree.nodes.new("NodeGroupOutput")
    tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    tree.links.new(a.outputs[0], dn.inputs["Image"])
    tree.links.new(dn.outputs[0], o.inputs[0])
    win_scene = bpy.context.window.scene if bpy.context.window else None
    with bpy.context.temp_override(scene=ds):
        bpy.ops.render.render(write_still=True, scene=ds.name)
    if win_scene:
        bpy.context.window.scene = win_scene
    dimg = bpy.data.images.load(out)
    px = np.array(dimg.pixels[:], dtype=np.float32).reshape(res, res, 4)
    raw_px = np.array(src.pixels[:], dtype=np.float32).reshape(res, res, 4)
    bpy.data.scenes.remove(ds)
    return px[..., :3], raw_px[..., 3]


def encode(rgb, alpha, path, quality=92, percentile=99.6):
    """Скейл S (S → 1.0) ба sRGB 8 бит → WebP. Буцаах: S."""
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    mask = alpha > 0.5
    S = float(np.percentile(lum[mask], percentile)) if mask.any() else float(lum.max())
    x = np.clip(rgb / max(S, 1e-6), 0, 1)
    srgb = np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055)
    im = (np.clip(srgb, 0, 1) * 255 + 0.5).astype(np.uint8)[::-1]
    Image.fromarray(im).save(path, "WEBP", quality=quality, method=6)
    return S
