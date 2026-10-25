/* ============================================================
   Хотхоны тохижилт — MOCKUP. Хотхоны агаарын рендерийн
   (`public/images/aerial-masterplan.jpg`) ерөнхий бүтэц: ар талд (−z)
   гудамж ба 4 цамхаг, урд талд (+z) алхалтын гудамж, зүлэг, тоглоомын
   талбайнууд, −x захад цэцэрлэгийн барилга.

   Хэмжээ нь бодит талбайд багтсан (Бармашийн талбай, docs/3D-INTERACTIVE-
   PLAN.md §M.8): ар тал нь хоёр эгнээ зам (z ≈ −53), урд тал нь Алтарганын
   44А/Б/В-ийн өмнөх зам (z ≈ 21), −x зах нь хойд булангийн зам, +x зах нь
   Чингисийн өргөн чөлөөний хажуу зам.

   Гадна тохижилтыг бодит 3D файлаас хийнэ (захиалагчтай тохирсноор).
   ============================================================ */

import { mulberry32 } from "./random";

export const DECK = { x0: -100, x1: 100, z0: -53, z1: 20 } as const;

export type RoundRect = { x0: number; x1: number; z0: number; z1: number; r: number };

/** Цамхгуудын өмнөх алхалтын гудамж (цэцэрлэгийн барилга хүртэл). */
export const PROMENADE: RoundRect = { x0: -75, x1: 98, z0: -15, z1: -9, r: 2 };

export const LAWNS: RoundRect[] = [
  { x0: -74, x1: -50, z0: -5, z1: 17, r: 5 },
  { x0: -44, x1: -6, z0: -5, z1: 17, r: 5 },
  { x0: 6, x1: 44, z0: -5, z1: 17, r: 5 },
  { x0: 50, x1: 96, z0: -5, z1: 17, r: 5 },
  /* Цамхгуудын хооронд — хоёр захынх нь зоорийн рампаас хойш. */
  { x0: -53, x1: -39, z0: -40, z1: -18, r: 3 },
  { x0: -7, x1: 7, z0: -50, z1: -18, r: 3 },
  { x0: 39, x1: 53, z0: -40, z1: -18, r: 3 },
];

export const PLAYGROUNDS: { x: number; z: number; r: number; color: string }[] = [
  { x: -62, z: 7, r: 6.5, color: "#efc1cc" },
  { x: -25, z: 3, r: 6.5, color: "#cfcaee" },
  { x: -16, z: 11.5, r: 4, color: "#efc1cc" },
  { x: 24, z: 6, r: 7.5, color: "#c3d3ea" },
  { x: 72, z: 3, r: 6, color: "#efc99b" },
  { x: 82, z: 11.5, r: 4.4, color: "#cfcaee" },
];

/** Цэцэрлэгийн барилга — бодит талбайн хойд булангийн барилгын ул мөр дээр. */
export const KINDERGARTEN = { x0: -97, x1: -77, z0: -14.5, z1: 19, h: 7.5 };

/** Хотхоны урд талын одоо байгаа барилгууд — Алтарганын 44В, 44Б, 44А
 *  (14 давхар). Бодит хотын загвар ачаалагдаагүй үед л зурна. */
export const NEIGHBORS: { x: number; z: number; w: number; d: number; h: number }[] = [
  { x: -11, z: 47.8, w: 30.2, d: 21.9, h: 43 },
  { x: 36.9, z: 47.6, w: 30.7, d: 22.5, h: 43 },
  { x: 84.5, z: 46.9, w: 30.3, d: 23.2, h: 43 },
];

/** Хотхоныг тойрсон гудамж — бодит хотын загвар ачаалагдаагүй үед: ар
 *  талын хоёр эгнээ зам, урд талын зам, −x захын зам, Чингисийн өргөн чөлөө. */
export const STREETS: { x0: number; x1: number; z0: number; z1: number }[] = [
  { x0: -400, x1: 400, z0: -68, z1: -54 },
  { x0: -400, x1: 400, z0: 21, z1: 28 },
  { x0: -114, x1: -106, z0: -400, z1: 400 },
  { x0: 125, x1: 149, z0: -400, z1: 400 },
];

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
    x: 34,
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
    z: 7,
  },
  {
    id: "promenade",
    title: "Алхалтын гудамж",
    body: "Дөрвөн блокийг холбосон явган хүний зам.",
    image: "/images/aerial-courtyard-promenade.jpg",
    x: -2,
    y: 3,
    z: -12,
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
    z: -48,
    basement: true,
  },
];

function inRect(x: number, z: number, r: RoundRect, pad: number) {
  return x > r.x0 + pad && x < r.x1 - pad && z > r.z0 + pad && z < r.z1 - pad;
}

/** Зүлэг дээрх мод (тоглоомын талбайг тойрно) + хашааны дагуух мод. */
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
  for (let x = -70; x <= 94; x += 12) out.push([x, DECK.z1 - 1.5, 0.8 + rnd() * 0.3]);
  return out;
}
