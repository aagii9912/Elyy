/* ============================================================
   Зоорь (B1, B2) — MOCKUP байрлал.

   ⚠️ B1/B2-ын зураг одоогоор байхгүй тул энэ бол бидний таамагласан
   схем: хотхоны подиумын доор нэгдсэн хоёр давхар, хоёр зам (aisle),
   дөрвөн эгнээ зогсоол, цамхаг бүрийн лифтний цөм, гудамжнаас B1 руу
   хоёр рамп, B1↔B2 дотоод рамп. Нийт 513 байр (B1 257 + B2 256) —
   сайтын «513 автомашины зогсоол» тоотой тааруулав.

   Бодит зураг ирэхэд энэ үүсгэгчийг CAD-аас гаргасан координатаар
   (docs/3D-INTERACTIVE-PLAN.md §5.6) солино; ID-ийн хэлбэр хэвээр.
   ============================================================ */

import { BASEMENT_LEVELS, TOWERS, towerToWorld } from "./config";
import { CORE, toLocalRect } from "./plates";
import type { BasementLevel, ParkingKind } from "./types";

export const BASEMENT_BOUNDS = { x0: -97, x1: 97, z0: -53, z1: -20 } as const;
export const SPACE_W = 2.5;
export const SPACE_D = 5;

export const PARKING_TOTAL: Record<BasementLevel, number> = { B1: 257, B2: 256 };

export const AISLES = [
  { z0: -47.5, z1: -41.5, cz: -44.5 },
  { z0: -31.5, z1: -25.5, cz: -28.5 },
] as const;

type Row = { z0: number; z1: number; cz: number; aisle: 0 | 1 };

const ROWS: Row[] = [
  { z0: -52.5, z1: -47.5, cz: -50, aisle: 0 },
  { z0: -41.5, z1: -36.5, cz: -39, aisle: 0 },
  { z0: -36.5, z1: -31.5, cz: -34, aisle: 1 },
  { z0: -25.5, z1: -20.5, cz: -23, aisle: 1 },
];

export type Box2 = { x0: number; x1: number; z0: number; z1: number };

export type BasementCore = Box2 & { block: number; cx: number; cz: number };

/** Цамхаг бүрийн лифт, шатны цөм — давхрын хуваалтын CORE-ийн дэлхийн байрлал. */
export const BASEMENT_CORES: BasementCore[] = TOWERS.map((t) => {
  const r = toLocalRect(CORE);
  const c = towerToWorld(t.block, r.cx, r.cz);
  return { block: t.block, cx: c.x, cz: c.z, x0: c.x - 3.5, x1: c.x + 3.5, z0: c.z - 4.5, z1: c.z + 4.5 };
});

/** Гудамжнаас (хойд талын зам) B1 руу орох рамп. */
export const STREET_RAMPS: Box2[] = [
  { x0: -49.25, x1: -42.75, z0: -70, z1: -52.5 },
  { x0: 42.75, x1: 49.25, z0: -70, z1: -52.5 },
];

/** Газрын хавтгайн нүх — зоорь ба рампын нээлт (зоорийн түвшинд
 *  тавцан тунгалаг болоход доош харагдана). Цагийн зүүний эсрэг. */
export const GROUND_OPENING: [number, number][] = [
  [BASEMENT_BOUNDS.x0, BASEMENT_BOUNDS.z0],
  [STREET_RAMPS[0].x0, BASEMENT_BOUNDS.z0],
  [STREET_RAMPS[0].x0, STREET_RAMPS[0].z0],
  [STREET_RAMPS[0].x1, STREET_RAMPS[0].z0],
  [STREET_RAMPS[0].x1, BASEMENT_BOUNDS.z0],
  [STREET_RAMPS[1].x0, BASEMENT_BOUNDS.z0],
  [STREET_RAMPS[1].x0, STREET_RAMPS[1].z0],
  [STREET_RAMPS[1].x1, STREET_RAMPS[1].z0],
  [STREET_RAMPS[1].x1, BASEMENT_BOUNDS.z0],
  [BASEMENT_BOUNDS.x1, BASEMENT_BOUNDS.z0],
  [BASEMENT_BOUNDS.x1, BASEMENT_BOUNDS.z1],
  [BASEMENT_BOUNDS.x0, BASEMENT_BOUNDS.z1],
];

/** B1 ↔ B2 дотоод рамп (баруун захад). */
export const INNER_RAMP: Box2 = { x0: -97, x1: -89, z0: -41.5, z1: -31.5 };

export type ParkingSpace = {
  id: string;
  level: BasementLevel;
  x: number;
  z: number;
  row: number;
  kind: ParkingKind;
  /** Хамгийн ойр лифттэй блок ба тэнд хүрэх алхалтын зай (м). */
  nearestBlock: number;
  walk: number;
  /** Байрнаас лифт хүртэлх зам (x, z цэгүүд). */
  path: [number, number][];
};

export const PARKING_KIND_LABEL: Record<ParkingKind, string> = {
  standard: "Энгийн",
  large: "Том",
  ev: "EV цэнэглэгчтэй",
  accessible: "Хөгжлийн бэрхшээлтэй",
};

function overlaps(x: number, z: number, b: Box2, pad = 0) {
  return (
    x + SPACE_W / 2 > b.x0 - pad &&
    x - SPACE_W / 2 < b.x1 + pad &&
    z + SPACE_D / 2 > b.z0 - pad &&
    z - SPACE_D / 2 < b.z1 + pad
  );
}

function blockedZones(level: BasementLevel): Box2[] {
  const zones: Box2[] = [...BASEMENT_CORES, INNER_RAMP];
  if (level === "B1") zones.push(...STREET_RAMPS);
  return zones;
}

function route(x: number, row: Row) {
  const aisle = AISLES[row.aisle];
  let best = { block: 1, walk: Infinity, path: [] as [number, number][] };
  for (const c of BASEMENT_CORES) {
    /* Хойд замаас цөмийн хойд хана руу, өмнөд замаас өмнөд хана руу. */
    const doorZ = row.aisle === 0 ? c.z0 : c.z1;
    const walk = Math.abs(row.cz - aisle.cz) + Math.abs(x - c.cx) + Math.abs(aisle.cz - doorZ);
    if (walk < best.walk) {
      best = {
        block: c.block,
        walk,
        path: [
          [x, row.cz],
          [x, aisle.cz],
          [c.cx, aisle.cz],
          [c.cx, doorZ],
        ],
      };
    }
  }
  return best;
}

function buildLevel(level: BasementLevel): ParkingSpace[] {
  const zones = blockedZones(level);
  const count = Math.floor((BASEMENT_BOUNDS.x1 - BASEMENT_BOUNDS.x0 - 4) / SPACE_W);
  const startX = -(count * SPACE_W) / 2 + SPACE_W / 2;

  let cand: { x: number; z: number; row: number }[] = [];
  ROWS.forEach((row, r) => {
    for (let i = 0; i < count; i++) {
      const x = startX + i * SPACE_W;
      if (zones.some((b) => overlaps(x, row.cz, b, 0.2))) continue;
      cand.push({ x, z: row.cz, row: r });
    }
  });

  /* Илүүдлийг эгнээний хоёр захаас тайрна — нийт тоо 513-тай тэнцэнэ. */
  const extra = cand.length - PARKING_TOTAL[level];
  if (extra > 0) {
    const drop = new Set(
      [...cand]
        .sort((a, b) => Math.abs(b.x) - Math.abs(a.x) || a.row - b.row)
        .slice(0, extra)
    );
    cand = cand.filter((c) => !drop.has(c));
  }
  cand.sort((a, b) => a.row - b.row || a.x - b.x);

  const spaces: ParkingSpace[] = cand.map((c, i) => {
    const r = route(c.x, ROWS[c.row]);
    return {
      id: `${level}-${String(i + 1).padStart(3, "0")}`,
      level,
      x: c.x,
      z: c.z,
      row: c.row,
      kind: "standard",
      nearestBlock: r.block,
      walk: Math.round(r.walk),
      path: r.path,
    };
  });

  /* Төрөл: лифтэнд хамгийн ойр 2 байр — хөгжлийн бэрхшээлтэй,
     эгнээний хоёр зах — том, бусдаас 12 тутамд — EV. */
  for (const core of BASEMENT_CORES) {
    spaces
      .filter((s) => s.row === 1 || s.row === 2)
      .sort((a, b) => Math.hypot(a.x - core.cx, a.z - core.cz) - Math.hypot(b.x - core.cx, b.z - core.cz))
      .slice(0, 2)
      .forEach((s) => (s.kind = "accessible"));
  }
  for (let r = 0; r < ROWS.length; r++) {
    const row = spaces.filter((s) => s.row === r && s.kind === "standard");
    if (row.length) {
      row[0].kind = "large";
      row[row.length - 1].kind = "large";
    }
  }
  spaces.forEach((s, i) => {
    if (s.kind === "standard" && i % 12 === 6) s.kind = "ev";
  });

  return spaces;
}

export const PARKING: Record<BasementLevel, ParkingSpace[]> = {
  B1: buildLevel("B1"),
  B2: buildLevel("B2"),
};

export const ALL_PARKING: ParkingSpace[] = BASEMENT_LEVELS.flatMap((l) => PARKING[l]);

const BY_ID = new Map(ALL_PARKING.map((p) => [p.id, p]));

export function parkingById(id: string): ParkingSpace | undefined {
  return BY_ID.get(id);
}

/** Баганын тор — 3 байр тутам (7.5 м), эгнээ/замын зааг дээр. */
export function basementColumns(): [number, number][] {
  const cols: [number, number][] = [];
  const zs = [-47.5, -36.5, -25.5];
  for (let x = BASEMENT_BOUNDS.x0 + 4.5; x < BASEMENT_BOUNDS.x1 - 2; x += 7.5) {
    for (const z of zs) {
      if (BASEMENT_CORES.some((c) => x > c.x0 - 0.5 && x < c.x1 + 0.5 && z > c.z0 - 0.5 && z < c.z1 + 0.5)) continue;
      cols.push([x, z]);
    }
  }
  return cols;
}
