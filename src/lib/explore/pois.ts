/* ============================================================
   Ойролцоох байршлууд — сайтын «Байршил» хэсгийн цэгүүд (админаас
   засагддаг) 3D дээр.

   Нэр нь бодит газрын зураг дээр (OSM / Overture, `location.ts`) олдсон
   цэг яг байрлалаараа; бусдыг агаарын рендер (`location.mapImage`) дээрх
   хувиар байрлалаас тооцоолно: рендерийн камерыг админы бодит байрлал нь
   мэдэгдэх цэгүүдээр тааруулж олсон (төслөөс урд-баруун урдаас, хойд-зүүн
   хойш харсан) — пикселийн цацрагийг газартай огтлолцуулна.
   ============================================================ */

import { realPoi, toSite } from "./location";
import type { ExplorePoi } from "./types";

const DEG = Math.PI / 180;
/** Рендерийн камер: байрлал (м, сайтын coords-оос x зүүн, z урд), өндөр,
 *  харах азимут, доош налуу (°), фокус (зургийн өргөний нэгжээр). */
const CAM = { x: -291, z: 520, h: 235, bearing: 21.7, pitch: 19.7, focal: 0.726 };
const ASPECT = 16 / 9;

/** Зургийн цэг (%) → газрын цэг (м, x зүүн, z урд); тэнгэрийн хаяа
 *  орчмын цэгийг ~6 км-т хязгаарлана. */
function ground(xp: number, yp: number) {
  const b = CAM.bearing * DEG;
  const p = CAM.pitch * DEG;
  const fwd = [Math.sin(b) * Math.cos(p), -Math.sin(p), -Math.cos(b) * Math.cos(p)];
  const right = [Math.cos(b), 0, Math.sin(b)];
  /* up = right × fwd */
  const up = [
    right[1] * fwd[2] - right[2] * fwd[1],
    right[2] * fwd[0] - right[0] * fwd[2],
    right[0] * fwd[1] - right[1] * fwd[0],
  ];
  const u = (xp - 50) / (100 * CAM.focal);
  const v = -(yp - 50) / (100 * CAM.focal * ASPECT);
  const d = [0, 1, 2].map((i) => fwd[i] + u * right[i] + v * up[i]);
  const t = CAM.h / Math.max(-d[1], 0.04);
  return { east: CAM.x + t * d[0], south: CAM.z + t * d[2] };
}

export type PoiPlacement = ExplorePoi & { index: number; wx: number; wz: number; meters: number };

export function placePois(pins: ExplorePoi[]): PoiPlacement[] {
  return pins.map((p, index) => {
    /* Бодит газрын зураг дээр нэрээр нь олдсон бол яг байрлал (OSM). */
    const real = realPoi(p.place);
    if (real) return { ...p, index, wx: real.x, wz: real.z, meters: Math.hypot(real.x, real.z) };
    const g = ground(p.x, p.y);
    const s = toSite(g.east, g.south);
    return { ...p, index, wx: s.x, wz: s.z, meters: Math.hypot(s.x, s.z) };
  });
}
