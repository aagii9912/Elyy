/* ============================================================
   Бодит хотын орчин — OpenStreetMap / Overture Maps-ийн нээлттэй
   өгөгдлөөс (scripts/location) үүсгэсэн 3D загварын туслах өгөгдөл:
   ойролцоох газруудын бодит байрлал, гудамж/голын нэр.

   Координат: x — зүүн, z — урд (м), төв нь төслийн цэг (site coords).
   Лиценз: ODbL — эх сурвалжийг (`LOCATION_SOURCE`) заавал харуулна.
   ============================================================ */

import DATA from "./location-data.json";

export const CITY_MODEL = "/models/location/city.glb";
export const LOCATION_SOURCE = DATA.source;

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
