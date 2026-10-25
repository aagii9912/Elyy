/* ============================================================
   Бодит хотын орчин — OpenStreetMap / Overture Maps-ийн нээлттэй
   өгөгдлөөс (scripts/location) үүсгэсэн 3D загварын туслах өгөгдөл:
   ойролцоох газруудын бодит байрлал, гудамж/голын нэр.

   Координат: хотхоны систем (м) — +x цамхгийн эгнээний дагуу, +z хашаа
   руу, төв нь DECK-ийн төв. Жинхэнэ хойд зүгтэй `SITE_FRAME.bearing`-ээр
   зөрнө (build_city.py FRAME_*, docs/3D-INTERACTIVE-PLAN.md §M.8).
   Лиценз: ODbL — эх сурвалжийг (`LOCATION_SOURCE`) заавал харуулна.
   ============================================================ */

import DATA from "./location-data.json";

export const CITY_MODEL = "/models/location/city.glb";
export const LOCATION_SOURCE = DATA.source;

/** Хотхоны систем: `bearing` — −z тэнхлэгийн жинхэнэ азимут (°),
 *  `origin` — (0, 0) цэг сайтын coords-оос (м, x зүүн, z урд). */
export const SITE_FRAME = DATA.frame as { bearing: number; origin: [number, number] };

/** Жинхэнэ хойд зүгийн тэнхлэгтэй объектыг (уул г.м.) хотхоны системд
 *  оруулах y-эргэлт. */
export const SITE_ROTATION = (SITE_FRAME.bearing * Math.PI) / 180;

/** Жинхэнэ чиглэл (x — зүүн, z — урд) → хотхоны системийн чиглэл. */
export function toSiteDir(east: number, south: number): { x: number; z: number } {
  const c = Math.cos(SITE_ROTATION);
  const s = Math.sin(SITE_ROTATION);
  return { x: east * c + south * s, z: -east * s + south * c };
}

/** Сайтын coords-оос (м, x зүүн, z урд) → хотхоны систем. */
export function toSite(east: number, south: number): { x: number; z: number } {
  return toSiteDir(east - SITE_FRAME.origin[0], south - SITE_FRAME.origin[1]);
}

type Label = { name: string; x: number; z: number; kind: string };

const POIS = DATA.pois as Record<string, number[]>;

/** Админы «Байршил» цэгийн нэрээр бодит байрлал (олдохгүй бол null). */
export function realPoi(place: string): { x: number; z: number } | null {
  const p = POIS[place.trim()];
  return p ? { x: p[0], z: p[1] } : null;
}

/** Байршлын түвшний гудамж, голын нэр — төсөлд ойрын (2.6 км) хамгийн
 *  урт 6 зам ба гол; цэг болгон харуулсан газрын нэрийг давтахгүй. */
export const STREET_LABELS: Label[] = (() => {
  const near = (DATA.labels as Label[]).filter((l) => Math.hypot(l.x, l.z) < 2600);
  const seen = new Set(Object.keys(POIS).map((k) => k.toLowerCase()));
  const roads = near.filter((l) => {
    const key = l.name.toLowerCase();
    if (l.kind !== "road" || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...roads.slice(0, 6), ...near.filter((l) => l.kind === "water")];
})();
