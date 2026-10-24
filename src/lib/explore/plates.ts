/* ============================================================
   Давхрын хуваалт (plate) — «Elysium Brochure 0813»-ийн 2F ба
   3–23F зургаас (`public/images/floorplan/2f.jpg`, `3-23f.jpg`)
   буулгасан ойролцоо тэгш өнцөгтүүд.

   Брошурын зураг дээрх координат (метр):
     u — баруун тийш (= хойд зүг), v — доош (= зүүн зүг).
   Цамхгийн локал координат руу: x = v − V_C (зүүн), z = −(u − U_C) (урд).

   Байрлалын дугаар (slot) нь бүх давхарт ижил «босоо эгнээ»:
     1 — E-4 (B), 2 — E-5 (C), 3 — E-6 (D) / 2F-д E-1, 4 — E-7 (E) /
     2F-д E-2, 5 — E-3 (A).
   Бодит 3D файл ирэхэд эдгээр нь загварын node-оос солигдоно.
   ============================================================ */

import { FIRST_RESIDENTIAL_FLOOR, TOP_FLOOR } from "./config";
import type { Side, UnitTypeKey } from "./types";

export type PlateRect = { u0: number; u1: number; v0: number; v1: number };

export type PlateSlot = PlateRect & {
  slot: number;
  type: UnitTypeKey;
  /** Гол цонхтой тал — аксонометр, интерьерийн чиглэлийг тогтооно. */
  facade: Side;
};

const U_C = 14.65;
const V_C = 11.5;

const SLOT_B: PlateSlot = { slot: 1, type: "b", u0: 0, u1: 11.5, v0: 8.9, v1: 20.5, facade: "s" };
const SLOT_C: PlateSlot = { slot: 2, type: "c", u0: 6, u1: 15, v0: 0, v1: 8.9, facade: "w" };
const SLOT_A: PlateSlot = { slot: 5, type: "a", u0: 11.5, u1: 21.5, v0: 14.5, v1: 23, facade: "e" };

/** 3–23-р давхар: E-3, E-4, E-5, E-6, E-7. */
export const PLATE_TYP: PlateSlot[] = [
  SLOT_B,
  SLOT_C,
  { slot: 3, type: "d", u0: 15, u1: 21.3, v0: 0, v1: 8.2, facade: "w" },
  { slot: 4, type: "e", u0: 21.3, u1: 29.3, v0: 0, v1: 11.2, facade: "n" },
  SLOT_A,
];

/** 2-р давхар: E-1, E-2, E-3, E-4, E-5. */
export const PLATE_2F: PlateSlot[] = [
  SLOT_B,
  SLOT_C,
  { slot: 3, type: "d2f", u0: 16, u1: 22, v0: 0, v1: 8.2, facade: "w" },
  { slot: 4, type: "e2f", u0: 22.6, u1: 29.3, v0: 1.5, v1: 11.08, facade: "n" },
  SLOT_A,
];

/** Лифт, шат, коридор. */
export const CORE: PlateRect = { u0: 11.5, u1: 21.3, v0: 8.9, v1: 14.5 };

export function plateFor(floor: number): PlateSlot[] | null {
  if (floor < FIRST_RESIDENTIAL_FLOOR || floor > TOP_FLOOR) return null;
  return floor === FIRST_RESIDENTIAL_FLOOR ? PLATE_2F : PLATE_TYP;
}

export type LocalRect = {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  cx: number;
  cz: number;
  w: number;
  d: number;
};

/** Брошурын тэгш өнцөгт → цамхгийн локал (x — зүүн, z — урд). */
export function toLocalRect(r: PlateRect): LocalRect {
  const x0 = r.v0 - V_C;
  const x1 = r.v1 - V_C;
  const z0 = -(r.u1 - U_C);
  const z1 = -(r.u0 - U_C);
  return { x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 };
}

/**
 * Айлын «нүүрэн» координат: x' — фасадын дагуу (0…L), z' — фасадаас
 * дотогш (0…D). Интерьерийг энэ координатад үүсгээд доорх origin,
 * эргэлтээр цамхгийн локал руу байрлуулна.
 */
export function unitFrame(rect: LocalRect, facade: Side) {
  switch (facade) {
    case "n":
      return { ox: rect.x0, oz: rect.z0, rotY: 0, L: rect.w, D: rect.d };
    case "s":
      return { ox: rect.x1, oz: rect.z1, rotY: Math.PI, L: rect.w, D: rect.d };
    case "w":
      return { ox: rect.x0, oz: rect.z1, rotY: Math.PI / 2, L: rect.d, D: rect.w };
    case "e":
      return { ox: rect.x1, oz: rect.z0, rotY: -Math.PI / 2, L: rect.d, D: rect.w };
  }
}

/** Фасадын гадагш чиглэсэн нормаль (цамхгийн локалд). */
export const FACADE_NORMAL: Record<Side, { x: number; z: number }> = {
  n: { x: 0, z: -1 },
  s: { x: 0, z: 1 },
  w: { x: -1, z: 0 },
  e: { x: 1, z: 0 },
};
