/* ============================================================
   URL ⇄ түвшин. URL нь Explorer-ийн төлөвийн цорын ганц эх сурвалж —
   шууд холбоос, QR, хөтчийн «буцах» товч бүгд үүгээр ажиллана.

     /explore                         байршил
     /explore/site                    хотхон
     /explore/basement/B1             зоорь
     /explore/parking/B1-115          зогсоолын байр
     /explore/block/2                 блок
     /explore/block/2/floor/7         давхар
     /explore/unit/2-0703             айл
     /explore/unit/2-0703/tour[/4]    айлын дотор (өрөөний дугаар)
   ============================================================ */

import { BLOCKS, FIRST_RESIDENTIAL_FLOOR, TOP_FLOOR } from "./config";
import { parkingById } from "./parking";
import { parseUnitId } from "./units";
import type { BasementLevel, View } from "./types";

const isBlock = (n: number) => BLOCKS.includes(n as (typeof BLOCKS)[number]);

export function parseExplorePath(pathname: string, basePath: string): View {
  const rest = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
  const parts = rest.split("/").filter(Boolean).map(decodeURIComponent);
  const [head, a, b, c] = parts;

  switch (head) {
    case "site":
      return { level: "site" };
    case "basement": {
      const level = (a ?? "B1").toUpperCase();
      return level === "B1" || level === "B2" ? { level: "basement", basement: level } : { level: "site" };
    }
    case "parking": {
      const space = a ? parkingById(a.toUpperCase()) : undefined;
      return space
        ? { level: "basement", basement: space.level, parkingId: space.id }
        : { level: "basement", basement: "B1" };
    }
    case "block": {
      const block = Number(a);
      if (!isBlock(block)) return { level: "site" };
      const floor = Number(c);
      if (b === "floor" && floor >= FIRST_RESIDENTIAL_FLOOR && floor <= TOP_FLOOR) {
        return { level: "floor", block, floor };
      }
      return { level: "block", block };
    }
    case "unit": {
      if (!a || !parseUnitId(a)) return { level: "site" };
      if (b === "tour") {
        const room = Number(c);
        return Number.isInteger(room) && room >= 0 ? { level: "tour", unitId: a, room } : { level: "tour", unitId: a };
      }
      return { level: "unit", unitId: a };
    }
    default:
      return { level: "location" };
  }
}

export function viewPath(view: View): string {
  switch (view.level) {
    case "location":
      return "";
    case "site":
      return "/site";
    case "basement":
      return view.parkingId ? `/parking/${view.parkingId}` : `/basement/${view.basement}`;
    case "block":
      return `/block/${view.block}`;
    case "floor":
      return `/block/${view.block}/floor/${view.floor}`;
    case "unit":
      return `/unit/${view.unitId}`;
    case "tour":
      return `/unit/${view.unitId}/tour${view.room !== undefined ? `/${view.room}` : ""}`;
  }
}

/** Нэг түвшин дээшлэх («Буцах» товч). */
export function parentView(view: View): View | null {
  switch (view.level) {
    case "location":
      return null;
    case "site":
      return { level: "location" };
    case "basement":
      return view.parkingId ? { level: "basement", basement: view.basement } : { level: "site" };
    case "block":
      return { level: "site" };
    case "floor":
      return { level: "block", block: view.block };
    case "unit": {
      const u = parseUnitId(view.unitId);
      return u ? { level: "floor", block: u.block, floor: u.floor } : { level: "site" };
    }
    case "tour":
      return { level: "unit", unitId: view.unitId };
  }
}

export function sameView(a: View, b: View) {
  return viewPath(a) === viewPath(b);
}

export function basementOf(view: View): BasementLevel | null {
  return view.level === "basement" ? view.basement : null;
}
