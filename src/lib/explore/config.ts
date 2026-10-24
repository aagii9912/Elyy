/* ============================================================
   3D Explorer — mockup-ын тогтмол утгууд.

   Бодит 3D файл ирэхэд эдгээр нь загвараас уншигдана. Одоогоор
   брошурын давхрын хуваалт, рендерүүдээс тааварласан ОЙРОЛЦОО утга.
   Нэгж: метр. Тэнхлэг: +X = зүүн, −Z = хойд, +Y = дээш.
   ============================================================ */

import type { BasementLevel, Side, Status } from "./types";

export const BLOCKS = [1, 2, 3, 4] as const;
export const FIRST_RESIDENTIAL_FLOOR = 2;
export const TOP_FLOOR = 23;

/** 1-р давхар (лобби, үйлчилгээ) өндөр, бусад нь ердийн. */
export const GROUND_FLOOR_HEIGHT = 4.5;
export const FLOOR_HEIGHT = 3;
export const SLAB = 0.28;
/** Айлын дотоод хананы өндөр (шалнаас таазанд). */
export const ROOM_HEIGHT = FLOOR_HEIGHT - SLAB;

/** Давхрын шалны түвшин (y). 1F → 0, 2F → 4.5, nF → 4.5 + (n−2)·3. */
export function floorBase(floor: number): number {
  if (floor <= 1) return 0;
  return GROUND_FLOOR_HEIGHT + (floor - 2) * FLOOR_HEIGHT;
}

/** Дээврийн түвшин. */
export const ROOF_Y = floorBase(TOP_FLOOR + 1);

export const BASEMENT_LEVELS: BasementLevel[] = ["B1", "B2"];
export const BASEMENT_HEIGHT = 3.6;

/** Зоорийн шалны түвшин — B1: −3.6, B2: −7.2. */
export function basementFloorY(level: BasementLevel): number {
  return level === "B1" ? -BASEMENT_HEIGHT : -2 * BASEMENT_HEIGHT;
}

/** Цамхгуудын төв — хотхоны рендер дээрх шиг нэг эгнээнд, хашаа нь урд. */
export const TOWERS = [
  { block: 1, x: -69, z: -35 },
  { block: 2, x: -23, z: -35 },
  { block: 3, x: 23, z: -35 },
  { block: 4, x: 69, z: -35 },
] as const;

/** Брошурын давхрын зураг дээрх хазайлт (~15°). */
export const TOWER_ROTATION = (15 * Math.PI) / 180;

export function towerOf(block: number) {
  return TOWERS.find((t) => t.block === block) ?? TOWERS[0];
}

/** Цамхгийн локал (x, z) → дэлхийн (x, z). */
export function towerToWorld(block: number, x: number, z: number) {
  const t = towerOf(block);
  const c = Math.cos(TOWER_ROTATION);
  const s = Math.sin(TOWER_ROTATION);
  return { x: t.x + x * c + z * s, z: t.z - x * s + z * c };
}

export const STATUS_ORDER: Status[] = ["available", "reserved", "sold", "not_released"];

/** `color` — 3D дээрх өнгө, `ui` — самбар дахь цэг. Өнгөнөөс гадна
 *  шошго үргэлж хамт гарна (өнгө ялгадаггүй хүмүүст). */
export const STATUS_META: Record<Status, { label: string; short: string; color: string; ui: string }> = {
  available: { label: "Боломжтой", short: "Сул", color: "#a7c96a", ui: "#c5d996" },
  reserved: { label: "Захиалсан", short: "Захиалсан", color: "#e3b25a", ui: "#f0c978" },
  sold: { label: "Зарагдсан", short: "Зарагдсан", color: "#a7aca8", ui: "#bfc4c0" },
  not_released: { label: "Худалдаанд гараагүй", short: "Гараагүй", color: "#ecebe5", ui: "#ffffff" },
};

export const SIDE_LABEL: Record<Side, string> = {
  n: "Хойд",
  e: "Зүүн",
  s: "Урд",
  w: "Баруун",
};

/** «Зүүн, хойд» → ["e", "n"]. */
export function parseFacing(text: string): Side[] {
  const map: Record<string, Side> = { хойд: "n", зүүн: "e", урд: "s", баруун: "w" };
  return text
    .split(/[,\s]+/)
    .map((w) => map[w.trim().toLowerCase()])
    .filter((s): s is Side => Boolean(s));
}

export const PALETTE = {
  sky: "#e9ece5",
  ground: "#e7e6de",
  road: "#d3d1c8",
  asphalt: "#a6a59f",
  city: "#f4f3ee",
  facade: "#efe9df",
  facadeHover: "#e2ebcc",
  muted: "#d9d8d2",
  slab: "#d3cdc1",
  core: "#e3ddd1",
  glass: "#5b6865",
  crown: "#7d5b49",
  paving: "#ebe6db",
  lawn: "#bfd2a0",
  path: "#d9ccb5",
  hedge: "#8fa978",
  tree: "#8dab73",
  trunk: "#8a7560",
  water: "#a9c2c8",
  park: "#c8d6ae",
  mountain: "#b9beb6",
  basementFloor: "#9c9f9b",
  basementWall: "#c9c9c4",
  forest: "#1b3328",
  lime: "#c5d996",
} as const;

export function blockLabel(block: number) {
  return `${block}-р блок`;
}

export function floorLabel(floor: number) {
  return `${floor}-р давхар`;
}

export function formatDistance(m: number) {
  if (m >= 1000) return { value: (m / 1000).toFixed(1).replace(/\.0$/, ""), unit: "км" };
  return { value: String(Math.round(m / 10) * 10), unit: "м" };
}

/** Kiosk-ийн идэвхгүй хугацаа — attract mode руу орох (мс). */
export const KIOSK_IDLE_MS = 90_000;
/** Статусыг дахин татах хугацаа (мс). */
export const INVENTORY_POLL_MS = 60_000;
