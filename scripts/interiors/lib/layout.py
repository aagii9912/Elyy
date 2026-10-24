"""layouts.json-ийн нэг типийг уншиж өрөө, хана, хаалга, цонхны асуулгад бэлтгэнэ."""

T_EXT = 0.24
T_INT = 0.12
PUBLIC = {"living", "kitchen", "entry", "corridor"}


def _union(iv):
    iv = sorted(iv)
    out = []
    for s, e in iv:
        if out and s <= out[-1][1] + 1e-3:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return [(s, e) for s, e in out]


def _subtract(iv, cuts):
    out = []
    for s, e in iv:
        parts = [(s, e)]
        for cs, ce in cuts:
            nxt = []
            for a, b in parts:
                if ce <= a or cs >= b:
                    nxt.append((a, b))
                    continue
                if cs > a:
                    nxt.append((a, cs))
                if ce < b:
                    nxt.append((ce, b))
            parts = nxt
        out += [(a, b) for a, b in parts if b - a > 0.02]
    return out


class Room:
    def __init__(self, r, lay):
        self.lay = lay
        self.i = r["index"]
        self.no = r["no"]
        self.kind = r["kind"]
        self.name = r["name"]
        self.x0, self.x1, self.z0, self.z1 = r["x0"], r["x1"], r["z0"], r["z1"]
        self.w = self.x1 - self.x0
        self.d = self.z1 - self.z0
        self.cx = (self.x0 + self.x1) / 2
        self.cz = (self.z0 + self.z1) / 2
        self.foot = []  # эзэлсэн тэгш өнцөгтүүд (x0, x1, z0, z1)

    # ---- талууд: "front" (z0), "back" (z1), "left" (x0), "right" (x1)
    def line(self, side):
        return {"front": self.z0, "back": self.z1, "left": self.x0, "right": self.x1}[side]

    def span(self, side):
        return (self.x0, self.x1) if side in ("front", "back") else (self.z0, self.z1)

    def inward(self, side):
        """Тухайн ханаас өрөө рүү чиглэсэн (fx, fz)."""
        return {"front": (0, 1), "back": (0, -1), "left": (1, 0), "right": (-1, 0)}[side]

    def face(self, side):
        """Хананы дотор нүүрний координат (хана байхгүй бол хил).
        Гадна хана хилийн гадна талд, дотор хана хил дээр төвлөрдөг."""
        return self.lay.wall_face(self, side)

    def solid(self, side, min_top=None):
        """Бүтэн өндөртэй (эсвэл min_top хүртэл) ханатай интервалууд."""
        return self.lay.solid_intervals(self, side, min_top)

    def doors(self, side):
        return self.lay.door_intervals(self, side)

    def free(self, side, margin=0.15, min_top=None):
        """Хаалганы нүх ба түүний ойр орчмыг хассан, хана бүхий интервалууд."""
        cuts = [(s - margin, e + margin) for s, e in self.doors(side)]
        return _subtract(self.solid(side, min_top), cuts)

    def door_zones(self):
        """Хаалганы өмнөх чөлөөт талбай (тавилга тавихгүй)."""
        out = []
        for d in self.lay.doors:
            if self.i not in d["rooms"]:
                continue
            h = d["w"] / 2
            depth = 0.95
            if d["axis"] == "z":
                if abs(d["at"] - self.x0) < 0.2:
                    out.append((self.x0, self.x0 + depth, d["c"] - h - 0.05, d["c"] + h + 0.05))
                elif abs(d["at"] - self.x1) < 0.2:
                    out.append((self.x1 - depth, self.x1, d["c"] - h - 0.05, d["c"] + h + 0.05))
            else:
                if abs(d["at"] - self.z0) < 0.2:
                    out.append((d["c"] - h - 0.05, d["c"] + h + 0.05, self.z0, self.z0 + depth))
                elif abs(d["at"] - self.z1) < 0.2:
                    out.append((d["c"] - h - 0.05, d["c"] + h + 0.05, self.z1 - depth, self.z1))
        return out

    def blocked(self, rect, pad=0.0):
        x0, x1, z0, z1 = rect
        for a in self.foot + self.door_zones():
            if x0 < a[1] - pad and x1 > a[0] + pad and z0 < a[3] - pad and z1 > a[2] + pad:
                return True
        return False

    def occupy(self, rect):
        self.foot.append(rect)


class Layout:
    def __init__(self, data):
        self.data = data
        self.type = data["type"]
        self.L = data["L"]
        self.D = data["D"]
        self.H = data["H"]
        self.walls = data["walls"]
        self.glass = data["glass"]
        self.frames = data["frames"]
        self.doors = data["doors"]
        self.rooms = [Room(r, self) for r in data["rooms"]]
        self.loggia = next((r for r in self.rooms if r.kind == "loggia"), None)
        front = [r for r in self.rooms if r.z0 == 0 and r.kind != "loggia"]
        self.F = front[0].z1 if front else self.D / 2

    def room_at(self, x, z, pad=0.0):
        for r in self.rooms:
            if r.x0 - pad <= x <= r.x1 + pad and r.z0 - pad <= z <= r.z1 + pad:
                return r
        return None

    def inside_envelope(self, x, z):
        if -T_EXT - 1e-3 <= x <= self.L + T_EXT + 1e-3 and -T_EXT - 1e-3 <= z <= self.D + T_EXT + 1e-3:
            return True
        lg = self.loggia
        return bool(lg and lg.x0 - 0.05 <= x <= lg.x1 + 0.05 and lg.z0 - 0.05 <= z <= 0)

    def _pieces_on(self, room, side):
        """Тухайн талын шугам дээрх хананы хэсгүүд: (s, e, y0, y1)."""
        at = room.line(side)
        out = []
        for w in self.walls:
            if side in ("front", "back"):
                if w["sx"] < w["sz"]:
                    continue
                if abs(w["z"] - at) > w["sz"] / 2 + 0.01 and abs(w["z"] - at) > 0.13:
                    continue
                s, e = w["x"] - w["sx"] / 2, w["x"] + w["sx"] / 2
            else:
                if w["sz"] < w["sx"]:
                    continue
                if abs(w["x"] - at) > w["sx"] / 2 + 0.01 and abs(w["x"] - at) > 0.13:
                    continue
                s, e = w["z"] - w["sz"] / 2, w["z"] + w["sz"] / 2
            out.append((s, e, w["y"] - w["sy"] / 2, w["y"] + w["sy"] / 2, min(w["sx"], w["sz"])))
        return out

    def wall_face(self, room, side):
        at = room.line(side)
        a, b = room.span(side)
        best = None
        for w in self.walls:
            if side in ("front", "back"):
                if w["sx"] < w["sz"] or abs(w["z"] - at) > 0.2:
                    continue
                if not (w["x"] + w["sx"] / 2 > a + 0.05 and w["x"] - w["sx"] / 2 < b - 0.05):
                    continue
                f = w["z"] + w["sz"] / 2 if side == "front" else w["z"] - w["sz"] / 2
            else:
                if w["sz"] < w["sx"] or abs(w["x"] - at) > 0.2:
                    continue
                if not (w["z"] + w["sz"] / 2 > a + 0.05 and w["z"] - w["sz"] / 2 < b - 0.05):
                    continue
                f = w["x"] + w["sx"] / 2 if side == "left" else w["x"] - w["sx"] / 2
            if best is None or (side in ("front", "left") and f > best) or (side in ("back", "right") and f < best):
                best = f
        return at if best is None else best

    def wall_thickness(self, side, room):
        a, b = room.span(side)
        best = 0.0
        for s, e, y0, y1, t in self._pieces_on(room, side):
            if e > a + 0.05 and s < b - 0.05:
                best = max(best, t)
        return best

    def solid_intervals(self, room, side, min_top=None):
        a, b = room.span(side)
        top = self.H - 0.01 if min_top is None else min_top
        iv = []
        for s, e, y0, y1, _t in self._pieces_on(room, side):
            if y0 < 0.01 and y1 >= top:
                s2, e2 = max(s, a), min(e, b)
                if e2 - s2 > 0.02:
                    iv.append((s2, e2))
        return _union(iv)

    def door_intervals(self, room, side):
        at = room.line(side)
        a, b = room.span(side)
        out = []
        for d in self.doors:
            if room.i not in d["rooms"] and not (d["main"] and side == "back" and abs(at - self.D) < 0.01):
                continue
            want = "x" if side in ("front", "back") else "z"
            if d["axis"] != want or abs(d["at"] - at) > 0.2:
                continue
            s, e = d["c"] - d["w"] / 2, d["c"] + d["w"] / 2
            if e > a and s < b:
                out.append((s, e))
        return out

    def windows(self, room):
        """Фасадын цонх/шилэн хаалга: (x0, x1, y0, y1)."""
        out = []
        if room.kind == "loggia" or room.z0 > 0.01:
            return out
        for g in self.glass:
            if g["sx"] < g["sz"] or abs(g["z"] + T_EXT / 2) > 0.03:
                continue
            x0, x1 = g["x"] - g["sx"] / 2, g["x"] + g["sx"] / 2
            if x1 > room.x0 + 0.05 and x0 < room.x1 - 0.05:
                out.append((x0, x1, g["y"] - g["sy"] / 2, g["y"] + g["sy"] / 2))
        return out
