/* ============================================================
   Хотхоны тохижилт — MOCKUP. Хотхоны агаарын рендерийн
   (`public/images/aerial-masterplan.jpg`) ерөнхий бүтэц: хойд талд
   гудамж ба 4 цамхаг, урд талд алхалтын гудамж, зүлэг, тоглоомын
   талбайнууд, баруун урд буланд цэцэрлэгийн барилга.

   Гадна тохижилтыг бодит 3D файлаас хийнэ (захиалагчтай тохирсноор).
   ============================================================ */

import { mulberry32 } from "./random";

export const DECK = { x0: -100, x1: 100, z0: -56, z1: 56 } as const;

export type RoundRect = { x0: number; x1: number; z0: number; z1: number; r: number };

export const PROMENADE: RoundRect = { x0: -98, x1: 98, z0: -12, z1: -5, r: 2 };

export const LAWNS: RoundRect[] = [
  { x0: -75, x1: -50, z0: -1, z1: 50, r: 6 },
  { x0: -44, x1: -6, z0: -1, z1: 50, r: 6 },
  { x0: 6, x1: 44, z0: -1, z1: 50, r: 6 },
  { x0: 50, x1: 96, z0: -1, z1: 50, r: 6 },
  { x0: -53, x1: -39, z0: -50, z1: -18, r: 3 },
  { x0: -7, x1: 7, z0: -50, z1: -18, r: 3 },
  { x0: 39, x1: 53, z0: -50, z1: -18, r: 3 },
];

export const PLAYGROUNDS: { x: number; z: number; r: number; color: string }[] = [
  { x: -62, z: 30, r: 8.5, color: "#efc1cc" },
  { x: -25, z: 22, r: 8, color: "#cfcaee" },
  { x: -18, z: 40, r: 5, color: "#efc1cc" },
  { x: 24, z: 32, r: 9, color: "#c3d3ea" },
  { x: 72, z: 19, r: 7, color: "#efc99b" },
  { x: 80, z: 40, r: 5.5, color: "#cfcaee" },
];

export const KINDERGARTEN = { x0: -98, x1: -80, z0: 18, z1: 54, h: 7.5 };

/** Хотхоны хажуугийн одоо байгаа барилгууд (рендер дээрх цагаан цамхгууд). */
export const NEIGHBORS: { x: number; z: number; w: number; d: number; h: number }[] = [
  { x: 40, z: 90, w: 26, d: 26, h: 64 },
  { x: 80, z: 94, w: 24, d: 24, h: 58 },
];

export const STREETS: { x0: number; x1: number; z0: number; z1: number }[] = [
  { x0: -400, x1: 400, z0: -82, z1: -70 },
  { x0: -400, x1: 400, z0: 64, z1: 76 },
  { x0: -128, x1: -116, z0: -400, z1: 400 },
  { x0: 116, x1: 128, z0: -400, z1: 400 },
];

/** Бодит хотын загвартай үед зөвхөн хотхоны урд талын (зоорийн рамптай)
 *  гудамж үлдэнэ — бусдыг OSM-ийн бодит зам орлоно. */
export const FRONTAGE = { x0: -118, x1: 118, z0: -82, z1: -70 };

export type Amenity = {
  id: string;
  title: string;
  body: string;
  image: string;
  x: number;
  y: number;
  z: number;
  /** Дарахад зоорь руу шилжих эсэх. */
  basement?: boolean;
};

/* Тайлбарт зөвхөн сайтад аль хэдийн байгаа баримтыг ашиглав. */
export const AMENITIES: Amenity[] = [
  {
    id: "garden",
    title: "Ногоон байгууламж",
    body: "Нийт талбайн 85% нь ногоон, нийтийн эзэмшлийн орон зай.",
    image: "/images/amenity-garden-walk.jpg",
    x: 25,
    y: 3,
    z: 12,
  },
  {
    id: "playground",
    title: "Хүүхдийн тоглоомын талбай",
    body: "Хашааны дотор, машины замаас тусдаа.",
    image: "/images/amenity-playground.jpg",
    x: -62,
    y: 3,
    z: 30,
  },
  {
    id: "promenade",
    title: "Алхалтын гудамж",
    body: "Дөрвөн блокийг холбосон явган хүний зам.",
    image: "/images/aerial-courtyard-promenade.jpg",
    x: -2,
    y: 3,
    z: -8,
  },
  {
    id: "retail",
    title: "Үйлчилгээний давхар",
    body: "1-р давхрын үйлчилгээний талбай.",
    image: "/images/amenity-retail-podium.jpg",
    x: 70,
    y: 6,
    z: -12,
  },
  {
    id: "parking",
    title: "Зоорийн орц · B1/B2",
    body: "513 автомашины зогсоол. Дарж зоорь руу орно.",
    image: "",
    x: -46,
    y: 3,
    z: -64,
    basement: true,
  },
];

function inRect(x: number, z: number, r: RoundRect, pad: number) {
  return x > r.x0 + pad && x < r.x1 - pad && z > r.z0 + pad && z < r.z1 - pad;
}

/** Зүлэг дээрх мод (тоглоомын талбайг тойрно) + гудамжны мод. */
export function siteTrees(): [number, number, number][] {
  const rnd = mulberry32(731);
  const out: [number, number, number][] = [];
  for (const lawn of LAWNS) {
    const area = (lawn.x1 - lawn.x0) * (lawn.z1 - lawn.z0);
    const n = Math.round(area / 95);
    for (let i = 0, tries = 0; i < n && tries < n * 20; tries++) {
      const x = lawn.x0 + rnd() * (lawn.x1 - lawn.x0);
      const z = lawn.z0 + rnd() * (lawn.z1 - lawn.z0);
      if (!inRect(x, z, lawn, 2)) continue;
      if (PLAYGROUNDS.some((p) => Math.hypot(x - p.x, z - p.z) < p.r + 2.5)) continue;
      if (out.some(([ox, oz]) => Math.hypot(x - ox, z - oz) < 4.5)) continue;
      out.push([x, z, 0.75 + rnd() * 0.6]);
      i++;
    }
  }
  for (let x = -96; x <= 96; x += 12) {
    if (Math.abs(Math.abs(x) - 46) < 6) continue;
    out.push([x, -63, 0.8 + rnd() * 0.3]);
    out.push([x + 6, 60, 0.8 + rnd() * 0.3]);
  }
  return out;
}
