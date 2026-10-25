/* ============================================================
   Хотын орчин — MOCKUP. Студийн «цагаан шавар» рендертэй
   (`public/images/location-aerial.jpg`) ижил хэв маягийн процедур
   хот: 150 м-ийн тор, гудамж, барилгын массив, Үндэсний цэцэрлэгт
   хүрээлэн (зүүн урд), Туул гол (урд), Богд уулын силуэт.

   Одоо бодит хот (OpenStreetMap / Overture → `public/models/location/
   city.glb`, docs/3D-INTERACTIVE-PLAN.md §M.8) харагдана; энэ үүсгэгч нь
   загвар ачаалагдахгүй үеийн орлуулга (алсын уулс үргэлж эндээс).
   ============================================================ */

import { mulberry32 } from "./random";

export type CityBox = { x: number; z: number; w: number; d: number; h: number; tone: number };
export type Strip = { x: number; z: number; w: number; d: number };

const GRID = 150;
const ROAD = 16;
const RANGE = { x0: -2700, x1: 2700, z0: -3000, z1: 1500 };
/** Хотхоны талбай — хотын барилга, гудамж орохгүй. */
export const SITE_CLEAR = { x0: -135, x1: 135, z0: -100, z1: 85 };
export const PARK = { x: 560, z: 560, rx: 560, rz: 360 };
/** Хотын төв (Талбай) — рендерийн цэгээс тооцсон ойролцоо байрлал. */
const CENTER = { x: 966, z: -1119 };

export function riverZ(x: number) {
  return 1230 + 90 * Math.sin(x / 480) + 40 * Math.sin(x / 170);
}

function inPark(x: number, z: number, pad = 0) {
  const dx = (x - PARK.x) / (PARK.rx + pad);
  const dz = (z - PARK.z) / (PARK.rz + pad);
  return dx * dx + dz * dz < 1;
}

function hitsSite(x0: number, x1: number, z0: number, z1: number) {
  return x1 > SITE_CLEAR.x0 && x0 < SITE_CLEAR.x1 && z1 > SITE_CLEAR.z0 && z0 < SITE_CLEAR.z1;
}

export function buildCity(): CityBox[] {
  const rnd = mulberry32(20261024);
  const out: CityBox[] = [];
  for (let gx = RANGE.x0; gx < RANGE.x1; gx += GRID) {
    for (let gz = RANGE.z0; gz < RANGE.z1; gz += GRID) {
      const bx0 = gx + ROAD / 2;
      const bz0 = gz + ROAD / 2;
      const size = GRID - ROAD;
      const nx = rnd() < 0.5 ? 2 : 3;
      const nz = 2;
      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < nz; j++) {
          const lw = size / nx;
          const ld = size / nz;
          const lx = bx0 + lw * (i + 0.5);
          const lz = bz0 + ld * (j + 0.5);
          if (hitsSite(lx - lw / 2, lx + lw / 2, lz - ld / 2, lz + ld / 2)) continue;
          if (inPark(lx, lz, 30)) continue;
          const river = riverZ(lx);
          if (Math.abs(lz - river) < 70) continue;
          if (lz > river && rnd() > 0.1) continue;
          if (Math.hypot(lx - CENTER.x, lz - CENTER.z) < 110) continue;
          const dist = Math.hypot(lx, lz);
          if (dist > 2300 && rnd() < 0.45) continue;
          if (rnd() < 0.12) continue;

          const w = lw * (0.45 + rnd() * 0.4);
          const d = ld * (0.45 + rnd() * 0.4);
          const dc = Math.hypot(lx - CENTER.x, lz - CENTER.z);
          let h = dc < 700 ? 24 + rnd() * 66 : dc < 1600 ? 15 + rnd() * 40 : 9 + rnd() * 30;
          if (dist < 450) h = 18 + rnd() * 45;
          if (rnd() < 0.04) h *= 2.2;
          out.push({ x: lx, z: lz, w, d, h: Math.min(h, 150), tone: rnd() });
        }
      }
    }
  }
  return out;
}

/** Гудамжууд — хотхоны талбайг тойрч тасална. */
export function buildRoads(): Strip[] {
  const out: Strip[] = [];
  const push = (x0: number, x1: number, z0: number, z1: number) => {
    if (x1 - x0 > 1 && z1 - z0 > 1) out.push({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 });
  };
  for (let x = RANGE.x0; x <= RANGE.x1; x += GRID) {
    const x0 = x - ROAD / 2;
    const x1 = x + ROAD / 2;
    if (x1 > SITE_CLEAR.x0 && x0 < SITE_CLEAR.x1) {
      push(x0, x1, RANGE.z0, SITE_CLEAR.z0);
      push(x0, x1, SITE_CLEAR.z1, RANGE.z1);
    } else push(x0, x1, RANGE.z0, RANGE.z1);
  }
  for (let z = RANGE.z0; z <= RANGE.z1; z += GRID) {
    const z0 = z - ROAD / 2;
    const z1 = z + ROAD / 2;
    if (z1 > SITE_CLEAR.z0 && z0 < SITE_CLEAR.z1) {
      push(RANGE.x0, SITE_CLEAR.x0, z0, z1);
      push(SITE_CLEAR.x1, RANGE.x1, z0, z1);
    } else push(RANGE.x0, RANGE.x1, z0, z1);
  }
  return out;
}

export function buildParkTrees(): [number, number, number][] {
  const rnd = mulberry32(1206);
  const out: [number, number, number][] = [];
  for (let i = 0; i < 2400 && out.length < 520; i++) {
    const x = PARK.x + (rnd() * 2 - 1) * PARK.rx;
    const z = PARK.z + (rnd() * 2 - 1) * PARK.rz;
    if (!inPark(x, z, -20)) continue;
    out.push([x, z, 0.8 + rnd() * 0.7]);
  }
  return out;
}

/** Туул голын шугам. */
export function riverPoints(): [number, number][] {
  const pts: [number, number][] = [];
  for (let x = -3400; x <= 3400; x += 80) pts.push([x, riverZ(x)]);
  return pts;
}

/** Урд талын уулс — манан дундах силуэт. */
export const MOUNTAINS: { x: number; z: number; r: number; h: number }[] = [
  { x: -4200, z: 6200, r: 2600, h: 820 },
  { x: -1500, z: 6900, r: 3000, h: 1050 },
  { x: 1300, z: 6400, r: 2700, h: 940 },
  { x: 3900, z: 7000, r: 3200, h: 1120 },
  { x: 6400, z: 6100, r: 2400, h: 700 },
  { x: -6600, z: 7200, r: 2800, h: 760 },
  { x: 200, z: 8600, r: 3800, h: 1300 },
];
