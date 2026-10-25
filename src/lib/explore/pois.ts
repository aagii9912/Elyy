/* ============================================================
   Ойролцоох байршлууд — сайтын «Байршил» хэсгийн цэгүүд (админаас
   засагддаг) 3D дээр.

   Нэр нь бодит газрын зураг дээр (OSM / Overture, `location.ts`) олдсон
   цэг яг байрлалаараа; бусдыг агаарын рендер (`location.mapImage`) дээрх
   хувиар байрлалаас ойролцоогоор тооцоолно: рендерийн камер хойд зүг рүү
   ~35° налуу харж байна гэж үзээд перспективыг буцааж задална.
   ============================================================ */

import { realPoi } from "./location";
import type { ExplorePoi } from "./types";

const DEG = Math.PI / 180;
const CAM_HEIGHT = 900;
const PITCH = 35;
const VFOV = 40;
const LATERAL = 1.2;
/** Рендер дээрх төслийн цамхгуудын байрлал (%). */
const PROJECT = { x: 45, y: 50 };

function ground(xp: number, yp: number) {
  const alpha = Math.max(8, PITCH + (yp / 100 - 0.5) * VFOV) * DEG;
  const d = CAM_HEIGHT / Math.tan(alpha);
  return { d, lat: (xp / 100 - 0.5) * d * LATERAL };
}

const REF = ground(PROJECT.x, PROJECT.y);

export type PoiPlacement = ExplorePoi & { index: number; wx: number; wz: number; meters: number };

export function placePois(pins: ExplorePoi[]): PoiPlacement[] {
  return pins.map((p, index) => {
    /* Бодит газрын зураг дээр нэрээр нь олдсон бол яг байрлал (OSM). */
    const real = realPoi(p.place);
    if (real) return { ...p, index, wx: real.x, wz: real.z, meters: Math.hypot(real.x, real.z) };
    const g = ground(p.x, p.y);
    const wx = g.lat - REF.lat;
    const wz = REF.d - g.d;
    return { ...p, index, wx, wz, meters: Math.hypot(wx, wz) };
  });
}
