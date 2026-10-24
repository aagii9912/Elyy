/* ============================================================
   Айл, зогсоолын төлөв — Vertmonhub (эх сурвалж) эсвэл mockup.

   Vertmonhub-д дараах endpoint нэмэгдэхэд env тохируулахад л
   бодит төлөв автоматаар орж ирнэ:

     VERTMONHUB_INVENTORY_URL=https://<vertmonhub>/api/integrations/elysium/inventory
     VERTMONHUB_INVENTORY_SECRET=<нууц>   (байхгүй бол VERTMONHUB_LEADS_SECRET)

     GET  Authorization: Bearer <нууц>
     200  { "units":   [{ "id": "2-0703", "status": "available" }, …],
            "parking": [{ "id": "B1-115", "status": "sold" }, …] }

   status ∈ available | reserved | sold | not_released. Үнэ дамжихгүй.
   Vertmonhub-д байхгүй айл «худалдаанд гараагүй» гэж харагдана.
   Холболт амжилтгүй бол mockup өгөгдлөөр үргэлжилнэ (сайт унахгүй).
   ============================================================ */

import "server-only";
import { ALL_PARKING, parkingById } from "./parking";
import { ALL_UNITS, unitById } from "./units";
import type { InventorySnapshot, Status, StatusMap } from "./types";

const STATUSES: Status[] = ["available", "reserved", "sold", "not_released"];

/** Тогтмол (seed-тэй) санамсаргүй тоо — mockup үргэлж ижил харагдана. */
function rand(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h += h << 13;
  h ^= h >>> 7;
  h += h << 3;
  h ^= h >>> 17;
  h += h << 5;
  return ((h >>> 0) % 10000) / 10000;
}

function mockUnits(): StatusMap {
  const out: StatusMap = {};
  for (const u of ALL_UNITS) {
    const r = rand(`unit:${u.id}`);
    const sold = 0.2 + 0.012 * (u.floor - 2);
    out[u.id] = r < 0.05 ? "not_released" : r < 0.05 + sold ? "sold" : r < 0.19 + sold ? "reserved" : "available";
  }
  return out;
}

function mockParking(): StatusMap {
  const out: StatusMap = {};
  for (const p of ALL_PARKING) {
    const r = rand(`parking:${p.id}`);
    out[p.id] = r < 0.3 ? "sold" : r < 0.42 ? "reserved" : r < 0.47 ? "not_released" : "available";
  }
  return out;
}

export function mockInventory(): InventorySnapshot {
  return { units: mockUnits(), parking: mockParking(), source: "mock", updatedAt: new Date().toISOString() };
}

function pickStatuses(list: unknown, known: (id: string) => boolean): StatusMap {
  const out: StatusMap = {};
  if (!Array.isArray(list)) return out;
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const id = String((item as { id?: unknown }).id ?? "").trim();
    const status = String((item as { status?: unknown }).status ?? "").trim() as Status;
    if (known(id) && STATUSES.includes(status)) out[id] = status;
  }
  return out;
}

export async function getInventory(): Promise<InventorySnapshot> {
  const url = process.env.VERTMONHUB_INVENTORY_URL;
  const secret = process.env.VERTMONHUB_INVENTORY_SECRET || process.env.VERTMONHUB_LEADS_SECRET;
  if (!url || !secret) return mockInventory();

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${secret}`, Accept: "application/json" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body: unknown = await res.json();
    const data = (body && typeof body === "object" ? body : {}) as { units?: unknown; parking?: unknown };
    const units = pickStatuses(data.units, (id) => Boolean(unitById(id)));
    if (!Object.keys(units).length) throw new Error("units хоосон");
    const parking = pickStatuses(data.parking, (id) => Boolean(parkingById(id)));

    const base = mockInventory();
    const allUnits: StatusMap = {};
    for (const u of ALL_UNITS) allUnits[u.id] = units[u.id] ?? "not_released";
    const allParking: StatusMap = Object.keys(parking).length
      ? Object.fromEntries(ALL_PARKING.map((p) => [p.id, parking[p.id] ?? "not_released"]))
      : base.parking;
    return { units: allUnits, parking: allParking, source: "vertmonhub", updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error("[explore] Vertmonhub inventory татахад алдаа гарлаа, mockup-аар үргэлжилнэ:", err);
    return mockInventory();
  }
}
