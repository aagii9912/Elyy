/* Айлын шүүлтүүр — блокийн түвшинд 3D өнгө ба жагсаалт хоёулаа эндээс. */

import { UNIT_TYPES, type UnitRef } from "./units";
import type { Side } from "./types";

export type Filters = {
  rooms: number[];
  facing: Side[];
  floorMin: number;
  floorMax: number;
  onlyAvailable: boolean;
};

export const DEFAULT_FILTERS: Filters = { rooms: [], facing: [], floorMin: 2, floorMax: 23, onlyAvailable: false };

export function matchesFilters(u: UnitRef, f: Filters, status: string | undefined) {
  const t = UNIT_TYPES[u.type];
  if (f.rooms.length && !f.rooms.includes(Math.min(t.rooms, 4))) return false;
  if (f.facing.length && !t.facing.some((s) => f.facing.includes(s))) return false;
  if (u.floor < f.floorMin || u.floor > f.floorMax) return false;
  if (f.onlyAvailable && status !== "available") return false;
  return true;
}

export function filtersActive(f: Filters) {
  return f.rooms.length > 0 || f.facing.length > 0 || f.floorMin > 2 || f.floorMax < 23 || f.onlyAvailable;
}
