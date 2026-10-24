/* ============================================================
   Нарны байрлал — Улаанбаатарын цагаар (UTC+8), төслийн координатаар.
   Хотхоны түвшинд улирал, цагийн гулсуураар сүүдэр хөдөлнө.
   ============================================================ */

import SunCalc from "suncalc";

export type Season = "summer" | "equinox" | "winter";

export const SEASONS: { key: Season; label: string; month: number; day: number }[] = [
  { key: "summer", label: "Зун", month: 5, day: 21 },
  { key: "equinox", label: "Хавар/намар", month: 2, day: 20 },
  { key: "winter", label: "Өвөл", month: 11, day: 21 },
];

const UB_OFFSET_H = 8;

function dateFor(season: Season, hour: number) {
  const s = SEASONS.find((x) => x.key === season) ?? SEASONS[0];
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return new Date(Date.UTC(2026, s.month, s.day, h - UB_OFFSET_H, m));
}

/** Нар руу чиглэсэн нэгж вектор (+X зүүн, +Y дээш, +Z урд). */
export function sunVector(season: Season, hour: number, lat: number, lng: number) {
  const p = SunCalc.getPosition(dateFor(season, hour), lat, lng);
  const cosAlt = Math.cos(p.altitude);
  /* suncalc: azimuth 0 = урд, +π/2 = баруун. */
  return {
    x: -Math.sin(p.azimuth) * cosAlt,
    y: Math.sin(p.altitude),
    z: Math.cos(p.azimuth) * cosAlt,
    altitude: p.altitude,
  };
}

/** Нар мандах, жаргах цаг (орон нутгийн цагаар, бутархай цаг). */
export function daylight(season: Season, lat: number, lng: number) {
  const t = SunCalc.getTimes(dateFor(season, 12), lat, lng);
  const local = (d: Date) => ((d.getUTCHours() + UB_OFFSET_H) % 24) + d.getUTCMinutes() / 60;
  return { sunrise: local(t.sunrise), sunset: local(t.sunset) };
}

export function formatHour(hour: number) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** «47.897,106.885» → { lat, lng }. */
export function parseCoords(coords: string) {
  const [lat, lng] = coords.split(",").map((v) => Number.parseFloat(v));
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : { lat: 47.8973, lng: 106.8854 };
}
