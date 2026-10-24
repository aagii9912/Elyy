"""Гэрэлтүүлэг: өдрийн тэнгэр + нар (цонхоор), дулаан LED (таазны cove,
трек, унжлага, тавилгын доорх зурвас). Blender-ийн гэрлүүд зөвхөн bake/preview-д;
харагдах гэрэлтэгч нь emit материалтай меш (вэб дээр unlit)."""

import math
import bpy
from mathutils import Matrix, Vector

WARM = (1.0, 0.74, 0.50)     # ~3500K LED
WARM2 = (1.0, 0.80, 0.62)    # ~4000K
SUN = (1.0, 0.93, 0.84)
SKY = (0.68, 0.80, 1.0)

# Тохируулга (preview-ээр тааруулсан)
SKY_STRENGTH = 2.2
SUN_STRENGTH = 3.2
W_PER_M_COVE = 22.0
W_PER_M_UNDER = 14.0


def _basis(direction, along=None):
    """Гэрлийн −Z тэнхлэгийг direction руу, X-ийг along-ийн дагуу."""
    z = -Vector(direction).normalized()
    if along is None:
        ref = Vector((0, 0, 1)) if abs(z.z) < 0.9 else Vector((1, 0, 0))
        x = ref.cross(z).normalized()
    else:
        a = Vector(along)
        x = (a - z * a.dot(z)).normalized()
    y = z.cross(x)
    return Matrix((x, y, z)).transposed().to_4x4()


class Lights:
    def __init__(self, coll):
        self.coll = coll
        self.n = 0

    def _add(self, data, loc, rot):
        self.n += 1
        ob = bpy.data.objects.new(f"{data.name}", data)
        ob.matrix_world = Matrix.Translation(loc) @ rot
        self.coll.objects.link(ob)
        return ob

    def world(self, scene):
        w = bpy.data.worlds.new("sky")
        scene.world = w
        bg = w.node_tree.nodes.get("Background")
        bg.inputs[0].default_value = (*SKY, 1)
        bg.inputs[1].default_value = SKY_STRENGTH

    def sun(self, facade_out=Vector((0, 1, 0))):
        """Фасадаар орж ирэх нар: 38° өндөрлөг, фасадын нормалиас 32° хазайсан."""
        d = bpy.data.lights.new("sun", "SUN")
        d.energy = SUN_STRENGTH
        d.color = SUN
        d.angle = math.radians(2.5)
        el, az = math.radians(38), math.radians(32)
        out = Vector(facade_out).normalized()
        side = Vector((out.y, -out.x, 0))
        to_sun = (out * math.cos(az) + side * math.sin(az)) * math.cos(el) + Vector((0, 0, math.sin(el)))
        self._add(d, Vector((0, 0, 10)), _basis(-to_sun))

    def portal(self, center, w, h):
        d = bpy.data.lights.new("portal", "AREA")
        d.shape = "RECTANGLE"
        d.size, d.size_y = w, h
        d.cycles.is_portal = True
        self._add(d, Vector(center), _basis((0, -1, 0), along=(1, 0, 0)))

    def strip(self, a, b, direction, w_per_m=W_PER_M_COVE, color=WARM, width=0.05, spread=150):
        """Шугаман LED: a→b, direction руу гэрэлтэнэ."""
        a, b = Vector(a), Vector(b)
        ln = (b - a).length
        if ln < 0.1:
            return
        d = bpy.data.lights.new("strip", "AREA")
        d.shape = "RECTANGLE"
        d.size, d.size_y = ln, width
        d.energy = w_per_m * ln
        d.color = color
        d.spread = math.radians(spread)
        self._add(d, (a + b) / 2, _basis(direction, along=b - a))

    def rect(self, center, sx, sy, direction, energy, along=(1, 0, 0), color=WARM2, spread=180):
        d = bpy.data.lights.new("panel", "AREA")
        d.shape = "RECTANGLE"
        d.size, d.size_y = sx, sy
        d.energy = energy
        d.color = color
        d.spread = math.radians(spread)
        self._add(d, Vector(center), _basis(direction, along=along))

    def disk(self, center, r, direction, energy, color=WARM2, spread=180):
        d = bpy.data.lights.new("disk", "AREA")
        d.shape = "DISK"
        d.size = 2 * r
        d.energy = energy
        d.color = color
        d.spread = math.radians(spread)
        self._add(d, Vector(center), _basis(direction))

    def spot(self, center, direction, energy, angle=40, blend=0.6, radius=0.02, color=WARM2):
        d = bpy.data.lights.new("spot", "SPOT")
        d.energy = energy
        d.color = color
        d.spot_size = math.radians(angle)
        d.spot_blend = blend
        d.shadow_soft_size = radius
        self._add(d, Vector(center), _basis(direction))

    def point(self, center, energy, radius=0.05, color=WARM2):
        d = bpy.data.lights.new("point", "POINT")
        d.energy = energy
        d.color = color
        d.shadow_soft_size = radius
        self._add(d, Vector(center), Matrix.Identity(4))
