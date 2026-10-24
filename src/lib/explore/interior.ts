/* ============================================================
   Айлын интерьер — MOCKUP (процедураар үүсгэнэ).

   Бодит интерьер нь 3D файл дотор ирнэ (360° панорам хэрэггүй).
   Тэр хүртэл 7 типийн өрөөг брошурын өрөөний жагсаалт
   (`unit-plans.ts`) ба аксонометр рендерийн ерөнхий зохион
   байгуулалтаар хоёр бүсээр байрлуулна:
     • урд бүс (фасадын дагуу) — зочны өрөө, унтлагын өрөөнүүд,
     • ар бүс (лифтний коридор тал) — үүд, коридор, гал тогоо,
       ариун цэврийн өрөө, хувцасны өрөө;
     • лодж — фасадаас гадагш цухуйсан шилэн хэсэг.

   Координат: x — фасадын дагуу (0…L), z — фасадаас дотогш (0…D),
   y — шалнаас дээш. `plates.ts → unitFrame` цамхаг руу байрлуулна.
   ============================================================ */

import { UNIT_PLANS } from "@/lib/unit-plans";
import { ROOM_HEIGHT } from "./config";
import type { UnitTypeKey } from "./types";

export type RoomKind = "living" | "kitchen" | "bedroom" | "bath" | "entry" | "corridor" | "wardrobe" | "loggia";

export type Room = {
  index: number;
  no: number;
  name: string;
  area: string;
  kind: RoomKind;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
};

/** Тэнхлэгт зэрэгцээ хайрцаг (төв + хэмжээ). */
export type Piece = { x: number; y: number; z: number; sx: number; sy: number; sz: number };
export type Item = Piece & { color: string };

export type InteriorModel = {
  L: number;
  D: number;
  rooms: Room[];
  walls: Piece[];
  caps: Piece[];
  glass: Piece[];
  frames: Piece[];
  furniture: Item[];
  /** Гол хаалганы дотор талын цэг — аяллын эхлэл. */
  entry: { x: number; z: number };
};

type Band = [no: number, a1: number][];
type LayoutSpec = { f: number; front: Band; back: Band; loggia?: { no: number; a0: number; a1: number } };

/* Аксонометр рендерүүдээс (public/images/axono) ерөнхийлсөн байрлал.
   `a1` — өрөөний баруун хил (фасадын уртын хувиар), `f` — урд бүсийн гүн. */
const LAYOUTS: Record<UnitTypeKey, LayoutSpec> = {
  a: {
    f: 0.6,
    front: [[6, 0.33], [4, 0.72], [5, 1]],
    back: [[7, 0.16], [2, 0.28], [3, 0.74], [1, 0.86], [8, 1]],
    loggia: { no: 9, a0: 0.42, a1: 0.66 },
  },
  b: {
    f: 0.6,
    front: [[10, 0.26], [7, 0.7], [5, 1]],
    back: [[9, 0.27], [4, 0.41], [3, 0.52], [6, 0.72], [1, 0.82], [11, 0.89], [12, 1]],
    loggia: { no: 13, a0: 0.36, a1: 0.56 },
  },
  c: {
    f: 0.6,
    front: [[7, 0.3], [6, 0.66], [4, 1]],
    back: [[8, 0.15], [2, 0.38], [5, 0.8], [1, 0.9], [3, 1]],
    loggia: { no: 9, a0: 0.36, a1: 0.6 },
  },
  d: {
    f: 0.52,
    front: [[4, 0.56], [5, 1]],
    back: [[3, 0.45], [1, 0.7], [6, 1]],
    loggia: { no: 7, a0: 0.12, a1: 0.45 },
  },
  d2f: {
    f: 0.55,
    front: [[5, 0.6], [3, 1]],
    back: [[4, 0.38], [1, 0.65], [2, 1]],
  },
  e: {
    f: 0.6,
    front: [[7, 0.33], [5, 0.66], [4, 1]],
    back: [[8, 0.12], [2, 0.42], [6, 0.8], [1, 0.9], [3, 1]],
    loggia: { no: 9, a0: 0.38, a1: 0.6 },
  },
  e2f: {
    f: 0.58,
    front: [[4, 0.5], [5, 1]],
    back: [[3, 0.55], [1, 0.75], [6, 1]],
    loggia: { no: 7, a0: 0.1, a1: 0.34 },
  },
};

const H = ROOM_HEIGHT;
const T_EXT = 0.24;
const T_INT = 0.12;
const DOOR_W = 0.9;
const DOOR_H = 2.1;
const SILL = 0.85;
const HEAD = 2.45;
const LOGGIA_DEPTH = 1.3;

export function roomKind(name: string): RoomKind {
  const n = name.toLowerCase();
  if (n.includes("зочны")) return "living";
  if (n.includes("гал тогоо")) return "kitchen";
  if (n.includes("унтлагын")) return "bedroom";
  if (n.includes("ариун") || n.includes("угаалгын")) return "bath";
  if (n.includes("үүд")) return "entry";
  if (n.includes("хувцас")) return "wardrobe";
  if (n.includes("лодж") || n.includes("тагт")) return "loggia";
  return "corridor";
}

const PUBLIC = new Set<RoomKind>(["living", "kitchen", "entry", "corridor"]);

export const FLOOR_COLOR: Record<RoomKind, string> = {
  living: "#c39a72",
  kitchen: "#c39a72",
  bedroom: "#c9a27b",
  corridor: "#c39a72",
  entry: "#cfc9bf",
  wardrobe: "#c9a27b",
  bath: "#d9d6cf",
  loggia: "#c2bdb3",
};

/** Шилжилтийн хил — хоёр өрөөний дундах хананы хэсэг. */
type Shared = {
  a: number;
  b: number;
  axis: "x" | "z";
  /** Хил шугамын координат (axis="x" бол z тогтмол). */
  at: number;
  s: number;
  e: number;
  mode: "solid" | "open" | "door";
  doorAt?: number;
};

function hSeg(out: Piece[], x0: number, x1: number, z: number, y0: number, y1: number, t: number) {
  if (x1 - x0 < 0.02 || y1 - y0 < 0.01) return;
  out.push({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, z, sx: x1 - x0, sy: y1 - y0, sz: t });
}

function vSeg(out: Piece[], z0: number, z1: number, x: number, y0: number, y1: number, t: number) {
  if (z1 - z0 < 0.02 || y1 - y0 < 0.01) return;
  out.push({ x, y: (y0 + y1) / 2, z: (z0 + z1) / 2, sx: t, sy: y1 - y0, sz: z1 - z0 });
}

export function buildInterior(type: UnitTypeKey, L: number, D: number): InteriorModel {
  const spec = LAYOUTS[type];
  const plan = UNIT_PLANS[type];
  const F = spec.f * D;
  const byNo = new Map(plan.list.map((r) => [r.no, r]));

  const rooms: Room[] = [];
  const add = (no: number, x0: number, x1: number, z0: number, z1: number) => {
    const r = byNo.get(no);
    if (!r) return;
    rooms.push({ index: rooms.length, no, name: r.name, area: r.area, kind: roomKind(r.name), x0, x1, z0, z1 });
  };
  let prev = 0;
  for (const [no, a1] of spec.front) {
    add(no, prev * L, a1 * L, 0, F);
    prev = a1;
  }
  const frontCount = rooms.length;
  prev = 0;
  for (const [no, a1] of spec.back) {
    add(no, prev * L, a1 * L, F, D);
    prev = a1;
  }
  const front = rooms.slice(0, frontCount);
  const back = rooms.slice(frontCount);
  const loggia = spec.loggia;
  if (loggia) add(loggia.no, loggia.a0 * L, loggia.a1 * L, -LOGGIA_DEPTH, 0);

  /* ---- Өрөө хоорондын хилүүд ---- */
  const shared: Shared[] = [];
  for (const fr of front) {
    for (const bk of back) {
      const s = Math.max(fr.x0, bk.x0);
      const e = Math.min(fr.x1, bk.x1);
      if (e - s > 0.05) shared.push({ a: fr.index, b: bk.index, axis: "x", at: F, s, e, mode: "solid" });
    }
  }
  for (const band of [front, back]) {
    for (let i = 1; i < band.length; i++) {
      const l = band[i - 1];
      const r = band[i];
      shared.push({ a: l.index, b: r.index, axis: "z", at: l.x1, s: l.z0, e: l.z1, mode: "solid" });
    }
  }

  /* Нийтийн хоёр өрөөний хооронд хана байхгүй (нээлттэй төлөвлөлт).
     Хувийн өрөө бүрд нэг хаалга: эхлээд нийтийн өрөө рүү, үгүй бол
     хамгийн урт хилээр хөрш өрөө рүү. */
  for (const sh of shared) {
    if (PUBLIC.has(rooms[sh.a].kind) && PUBLIC.has(rooms[sh.b].kind)) sh.mode = "open";
  }
  for (const room of rooms) {
    if (PUBLIC.has(room.kind) || room.kind === "loggia") continue;
    const mine = shared.filter((sh) => (sh.a === room.index || sh.b === room.index) && sh.e - sh.s >= 1);
    if (mine.some((sh) => sh.mode === "door")) continue;
    const other = (sh: Shared) => rooms[sh.a === room.index ? sh.b : sh.a];
    const pick =
      mine.filter((sh) => PUBLIC.has(other(sh).kind)).sort((p, q) => q.e - q.s - (p.e - p.s))[0] ??
      mine.sort((p, q) => q.e - q.s - (p.e - p.s))[0];
    if (!pick) continue;
    pick.mode = "door";
    /* Урд бүсийн босоо хананд хаалгыг ар тал руу (коридорт ойр) тавина. */
    pick.doorAt =
      pick.axis === "z" && pick.e <= F + 0.01 ? Math.max(pick.s + 0.6, pick.e - 0.85) : (pick.s + pick.e) / 2;
  }

  const walls: Piece[] = [];
  const glass: Piece[] = [];
  const frames: Piece[] = [];

  for (const sh of shared) {
    if (sh.mode === "open") continue;
    const seg = sh.axis === "x" ? hSeg : vSeg;
    if (sh.mode === "solid") {
      seg(walls, sh.s, sh.e, sh.at, 0, H, T_INT);
      continue;
    }
    const half = Math.min(DOOR_W, sh.e - sh.s - 0.2) / 2;
    const c = sh.doorAt ?? (sh.s + sh.e) / 2;
    seg(walls, sh.s, c - half, sh.at, 0, H, T_INT);
    seg(walls, c + half, sh.e, sh.at, 0, H, T_INT);
    seg(walls, c - half, c + half, sh.at, DOOR_H, H, T_INT);
  }

  /* ---- Гадна хана ---- */
  const zf = -T_EXT / 2;
  const la0 = loggia ? loggia.a0 * L + 0.15 : Infinity;
  const la1 = loggia ? loggia.a1 * L - 0.15 : -Infinity;
  for (const r of front) {
    /* Фасад: тулгуур — тавцан — шил — толгой; лоджийн хэсэгт шилэн хаалга. */
    hSeg(walls, r.x0, r.x0 + 0.2, zf, 0, H, T_EXT);
    hSeg(walls, r.x1 - 0.2, r.x1, zf, 0, H, T_EXT);
    const w0 = r.x0 + 0.2;
    const w1 = r.x1 - 0.2;
    const d0 = Math.max(w0, la0);
    const d1 = Math.min(w1, la1);
    const parts: [number, number, boolean][] =
      d1 - d0 > 0.3
        ? [
            [w0, d0, false],
            [d0, d1, true],
            [d1, w1, false],
          ]
        : [[w0, w1, false]];
    for (const [s, e, door] of parts) {
      if (e - s < 0.05) continue;
      if (!door) hSeg(walls, s, e, zf, 0, SILL, T_EXT);
      hSeg(glass, s, e, zf, door ? 0 : SILL, HEAD, 0.03);
      hSeg(walls, s, e, zf, HEAD, H, T_EXT);
    }
  }

  /* Ар хана — гол хаалгатай (үүдний өрөөний голд). */
  const zb = D + T_EXT / 2;
  const entryRoom = rooms.find((r) => r.kind === "entry") ?? back[0];
  const ec = entryRoom ? (entryRoom.x0 + entryRoom.x1) / 2 : L / 2;
  hSeg(walls, -T_EXT, ec - 0.5, zb, 0, H, T_EXT);
  hSeg(walls, ec + 0.5, L + T_EXT, zb, 0, H, T_EXT);
  hSeg(walls, ec - 0.5, ec + 0.5, zb, DOOR_H + 0.1, H, T_EXT);

  /* Хажуу хана (хөрш айл, эсвэл гадна тал). */
  vSeg(walls, -T_EXT, D + T_EXT, -T_EXT / 2, 0, H, T_EXT);
  vSeg(walls, -T_EXT, D + T_EXT, L + T_EXT / 2, 0, H, T_EXT);

  /* ---- Лодж — гурван талдаа шилтэй ---- */
  if (loggia) {
    const x0 = loggia.a0 * L;
    const x1 = loggia.a1 * L;
    const z0 = -LOGGIA_DEPTH;
    hSeg(glass, x0, x1, z0, 0.1, HEAD, 0.03);
    vSeg(glass, z0, -T_EXT, x0, 0.1, HEAD, 0.03);
    vSeg(glass, z0, -T_EXT, x1, 0.1, HEAD, 0.03);
    hSeg(frames, x0, x1, z0, HEAD, HEAD + 0.12, 0.08);
    vSeg(frames, z0, -T_EXT, x0, HEAD, HEAD + 0.12, 0.08);
    vSeg(frames, z0, -T_EXT, x1, HEAD, HEAD + 0.12, 0.08);
    hSeg(frames, x0, x1, z0, 0, 0.1, 0.08);
  }

  /* Бүтэн өндөртэй ханын орой — аксонометр рендер шиг бараан зураас. */
  const caps = walls
    .filter((w) => Math.abs(w.y + w.sy / 2 - H) < 0.01)
    .map((w) => ({ ...w, y: H + 0.012, sy: 0.024 }));

  return {
    L,
    D,
    rooms,
    walls,
    caps,
    glass,
    frames,
    furniture: rooms.flatMap(furnish),
    entry: { x: ec, z: D - 0.9 },
  };
}

/** Аялал өрөө заагаагүй үед зочны өрөөнөөс эхэлнэ. */
export function defaultTourRoom(model: InteriorModel): number | null {
  return model.rooms.find((r) => r.kind === "living")?.index ?? null;
}

/* ============================================================
   Тавилга — өрөөний төрлөөр энгийн хайрцгууд (рендерийн өнгөөр).
   ============================================================ */

const C = {
  sofa: "#d7d0c4",
  sofaDark: "#c6bdb0",
  accent: "#8b4a3a",
  wood: "#6f5644",
  woodLight: "#a7845f",
  stone: "#e6e2da",
  white: "#f6f5f1",
  linen: "#ece6dc",
  rug: "#cdc8be",
  chair: "#7a3d33",
  plant: "#6f8f5a",
  metal: "#3b3f3e",
};

function furnish(r: Room): Item[] {
  const out: Item[] = [];
  const w = r.x1 - r.x0;
  const d = r.z1 - r.z0;
  const cx = (r.x0 + r.x1) / 2;
  const cz = (r.z0 + r.z1) / 2;
  const box = (x: number, z: number, sx: number, sz: number, sy: number, color: string, y0 = 0) => {
    if (sx <= 0.05 || sz <= 0.05) return;
    out.push({ x, y: y0 + sy / 2, z, sx, sy, sz, color });
  };
  const plant = (x: number, z: number) => {
    box(x, z, 0.32, 0.32, 0.38, C.stone);
    box(x, z, 0.5, 0.5, 0.7, C.plant, 0.38);
  };

  switch (r.kind) {
    case "living": {
      const sw = Math.min(Math.max(w - 1.1, 1.6), 2.6);
      const sz = r.z1 - 0.62;
      box(cx, cz + 0.1, Math.min(w - 0.9, 3), Math.min(d - 1.4, 2.2), 0.012, C.rug);
      box(cx, sz, sw, 0.9, 0.42, C.sofa);
      box(cx, r.z1 - 0.28, sw, 0.22, 0.86, C.sofaDark);
      box(cx - sw / 2 + 0.35, sz - 0.05, 0.42, 0.2, 0.62, C.accent, 0.3);
      box(cx + sw / 2 - 0.35, sz - 0.05, 0.42, 0.2, 0.62, C.accent, 0.3);
      box(cx, sz - 1.25, 1.1, 0.6, 0.38, C.stone);
      if (w > 3.2) box(r.x0 + 0.65, r.z0 + 1.1, 0.8, 0.8, 0.78, C.sofaDark);
      plant(r.x1 - 0.45, r.z0 + 0.5);
      break;
    }
    case "kitchen": {
      const len = Math.max(w - 0.4, 0.8);
      box(cx, r.z1 - 0.31, len, 0.62, 0.88, C.wood);
      box(cx, r.z1 - 0.31, len, 0.64, 0.04, C.stone, 0.88);
      box(cx, r.z1 - 0.18, len, 0.35, 0.72, C.wood, 1.5);
      if (d > 2.6 && w > 1.9) {
        const tz = r.z0 + Math.max(1.1, d * 0.42);
        box(cx, tz, Math.min(1.6, w - 1.2), 0.9, 0.76, C.stone);
        for (const sx of [-0.45, 0.45]) {
          box(cx + sx, tz - 0.72, 0.44, 0.44, 0.86, C.chair);
          box(cx + sx, tz + 0.72, 0.44, 0.44, 0.86, C.chair);
        }
      }
      break;
    }
    case "bedroom": {
      const bw = w >= 2.9 ? 1.6 : 1.3;
      const bz = r.z1 - 1.08;
      box(cx, bz, bw, 2.0, 0.5, C.white);
      box(cx, bz + 0.3, bw + 0.02, 1.2, 0.06, C.accent, 0.5);
      box(cx, r.z1 - 0.06, bw + 0.2, 0.1, 1.05, C.woodLight);
      box(cx - bw / 4, r.z1 - 0.36, bw / 2 - 0.12, 0.34, 0.12, C.linen, 0.5);
      box(cx + bw / 4, r.z1 - 0.36, bw / 2 - 0.12, 0.34, 0.12, C.linen, 0.5);
      if (w - bw > 1.1) {
        box(cx - bw / 2 - 0.3, r.z1 - 0.28, 0.45, 0.4, 0.5, C.wood);
        box(cx + bw / 2 + 0.3, r.z1 - 0.28, 0.45, 0.4, 0.5, C.wood);
      }
      if (w >= 3.2 && d > 3.4) box(r.x0 + 0.32, r.z0 + Math.min(1.1, d / 3), 0.6, Math.min(1.8, d - 2.6), 2.2, C.woodLight);
      if (w >= 3) box(r.x1 - 0.55, r.z0 + 0.38, 0.9, 0.5, 0.75, C.wood);
      break;
    }
    case "bath": {
      if (d >= 1.8 && w >= 1.2) box(r.x0 + 0.42, cz, 0.74, Math.min(1.6, d - 0.3), 0.55, C.white);
      box(r.x1 - 0.32, r.z1 - 0.45, 0.4, 0.6, 0.42, C.white);
      box(cx, r.z0 + 0.3, Math.min(0.9, w - 0.4), 0.48, 0.82, C.wood);
      box(cx, r.z0 + 0.3, Math.min(0.9, w - 0.4) - 0.1, 0.4, 0.05, C.white, 0.82);
      break;
    }
    case "entry": {
      box(r.x0 + 0.22, cz, 0.38, Math.min(1.2, d - 1), 1.0, C.wood);
      break;
    }
    case "wardrobe": {
      box(r.x0 + 0.27, cz, 0.5, d - 0.4, 2.1, C.woodLight);
      if (w > 1.5) box(r.x1 - 0.27, cz, 0.5, d - 0.4, 2.1, C.woodLight);
      break;
    }
    case "loggia": {
      box(cx - 0.45, r.z0 + 0.6, 0.6, 0.62, 0.72, C.wood);
      box(cx + 0.45, r.z0 + 0.6, 0.6, 0.62, 0.72, C.wood);
      plant(r.x1 - 0.4, r.z0 + 0.45);
      break;
    }
    case "corridor":
      break;
  }
  return out;
}
