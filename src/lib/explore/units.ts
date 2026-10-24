/* ============================================================
   Айлын жагсаалт — 4 блок × 2–23 давхар × давхарт 5 айл.

   ⚠️ Брошурын хуваалтаар 440 айл гарч байгаа ч сайтад 506 гэж бичсэн
   (docs/3D-INTERACTIVE-PLAN.md §2.3). Бодит жагсаалт Vertmonhub-аас
   ирэхэд энэ үүсгэгчийг тэр өгөгдлөөр солино.

   Айлын ID: `{блок}-{давхар:2}{байрлал:2}` — ж: `2-0703`.
   ============================================================ */

import { UNIT_PLANS, type UnitPlan } from "@/lib/unit-plans";
import { BLOCKS, FIRST_RESIDENTIAL_FLOOR, TOP_FLOOR, parseFacing } from "./config";
import { plateFor, type PlateSlot } from "./plates";
import type { Side, UnitTypeKey } from "./types";

export type UnitRef = {
  id: string;
  block: number;
  floor: number;
  slot: number;
  type: UnitTypeKey;
};

export type UnitTypeInfo = {
  key: UnitTypeKey;
  letter: string;
  /** Карт дээрх нэр — «A тип», «D тип · 2 давхар». */
  title: string;
  /** Брошурын дугаар — «E-3». */
  code: string;
  rooms: number;
  area: string;
  areaValue: number;
  facing: Side[];
  plan: UnitPlan;
};

const LETTER: Record<UnitTypeKey, string> = { a: "A", b: "B", c: "C", d: "D", d2f: "D", e: "E", e2f: "E" };

export const UNIT_TYPES: Record<UnitTypeKey, UnitTypeInfo> = Object.fromEntries(
  (Object.keys(LETTER) as UnitTypeKey[]).map((key) => {
    const plan = UNIT_PLANS[key];
    const twoF = key.endsWith("2f");
    const info: UnitTypeInfo = {
      key,
      letter: LETTER[key],
      title: `${LETTER[key]} тип${twoF ? " · 2 давхар" : ""}`,
      code: plan.code,
      rooms: Number.parseInt(plan.rooms, 10) || 0,
      area: plan.area,
      areaValue: Number.parseFloat(plan.area) || 0,
      facing: parseFacing(plan.facing),
      plan,
    };
    return [key, info];
  })
) as Record<UnitTypeKey, UnitTypeInfo>;

const pad2 = (n: number) => String(n).padStart(2, "0");

export function unitId(block: number, floor: number, slot: number) {
  return `${block}-${pad2(floor)}${pad2(slot)}`;
}

export function parseUnitId(id: string): { block: number; floor: number; slot: number } | null {
  const m = /^(\d)-(\d{2})(\d{2})$/.exec(id);
  if (!m) return null;
  const block = Number(m[1]);
  const floor = Number(m[2]);
  const slot = Number(m[3]);
  if (!BLOCKS.includes(block as (typeof BLOCKS)[number])) return null;
  const plate = plateFor(floor);
  if (!plate?.some((s) => s.slot === slot)) return null;
  return { block, floor, slot };
}

function buildUnits(): UnitRef[] {
  const list: UnitRef[] = [];
  for (const block of BLOCKS) {
    for (let floor = FIRST_RESIDENTIAL_FLOOR; floor <= TOP_FLOOR; floor++) {
      for (const s of plateFor(floor) ?? []) {
        list.push({ id: unitId(block, floor, s.slot), block, floor, slot: s.slot, type: s.type });
      }
    }
  }
  return list;
}

export const ALL_UNITS: UnitRef[] = buildUnits();

const BY_ID = new Map(ALL_UNITS.map((u) => [u.id, u]));

export function unitById(id: string): UnitRef | undefined {
  return BY_ID.get(id);
}

export function slotOf(unit: Pick<UnitRef, "floor" | "slot">): PlateSlot | undefined {
  return plateFor(unit.floor)?.find((s) => s.slot === unit.slot);
}

export function unitsOn(block: number, floor: number): UnitRef[] {
  return ALL_UNITS.filter((u) => u.block === block && u.floor === floor);
}

/** «2-р блок · 7-р давхар · A тип» гэх мэт товч мөр. */
export function unitSummary(u: UnitRef) {
  const t = UNIT_TYPES[u.type];
  return `${t.title} · ${t.area} · ${u.block}-р блок, ${u.floor}-р давхар`;
}
