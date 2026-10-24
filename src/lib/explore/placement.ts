/* ============================================================
   Айлыг дэлхийн координатад байрлуулах — цамхаг → давхар → айл →
   айлын «нүүрэн» координат (интерьер). Камер, интерьер, шошго бүгд
   эндээс тооцно.
   ============================================================ */

import { SLAB, TOWER_ROTATION, floorBase, towerToWorld } from "./config";
import { FACADE_NORMAL, toLocalRect, unitFrame, type LocalRect } from "./plates";
import { slotOf, unitById, type UnitRef } from "./units";
import type { Side } from "./types";

export type UnitPlacement = {
  unit: UnitRef;
  facade: Side;
  rect: LocalRect;
  frame: { ox: number; oz: number; rotY: number; L: number; D: number };
  /** Айлын шалны түвшин (хучилтын дээд тал). */
  floorY: number;
  /** Айлын төв (дэлхий). */
  center: { x: number; z: number };
  /** Фасадаас гадагш чиглэл (дэлхий). */
  outward: { x: number; z: number };
};

export function unitPlacement(id: string): UnitPlacement | null {
  const unit = unitById(id);
  const slot = unit && slotOf(unit);
  if (!unit || !slot) return null;
  const rect = toLocalRect(slot);
  const frame = unitFrame(rect, slot.facade);
  const c = towerToWorld(unit.block, rect.cx, rect.cz);
  const n = FACADE_NORMAL[slot.facade];
  const cos = Math.cos(TOWER_ROTATION);
  const sin = Math.sin(TOWER_ROTATION);
  return {
    unit,
    facade: slot.facade,
    rect,
    frame,
    floorY: floorBase(unit.floor) + SLAB,
    center: c,
    outward: { x: n.x * cos + n.z * sin, z: -n.x * sin + n.z * cos },
  };
}

/** Айлын нүүрэн координат (x — фасадын дагуу, z — дотогш) → дэлхий. */
export function frameToWorld(p: UnitPlacement, x: number, z: number) {
  const { ox, oz, rotY } = p.frame;
  const lx = ox + x * Math.cos(rotY) + z * Math.sin(rotY);
  const lz = oz - x * Math.sin(rotY) + z * Math.cos(rotY);
  return towerToWorld(p.unit.block, lx, lz);
}

/** Дэлхий → айлын нүүрэн координат (дарсан цэгийг өрөөнд хамааруулахад). */
export function worldToFrame(p: UnitPlacement, wx: number, wz: number) {
  const t = towerToWorld(p.unit.block, 0, 0);
  const dx = wx - t.x;
  const dz = wz - t.z;
  const cos = Math.cos(TOWER_ROTATION);
  const sin = Math.sin(TOWER_ROTATION);
  const lx = dx * cos - dz * sin;
  const lz = dx * sin + dz * cos;
  const { ox, oz, rotY } = p.frame;
  const ax = lx - ox;
  const az = lz - oz;
  return { x: ax * Math.cos(rotY) - az * Math.sin(rotY), z: ax * Math.sin(rotY) + az * Math.cos(rotY) };
}
