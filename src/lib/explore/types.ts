/* ============================================================
   3D Explorer — нийтлэг төрлүүд (сервер, клиент хоёуланд).
   ============================================================ */

/** Айл, зогсоолын борлуулалтын төлөв. Эх сурвалж нь Vertmonhub;
 *  тохируулаагүй үед mockup өгөгдөл. Үнэ системд огт байхгүй. */
export type Status = "available" | "reserved" | "sold" | "not_released";

export type BasementLevel = "B1" | "B2";

/** `unit-plans.ts`-ийн түлхүүртэй ижил — брошурын 7 тип. */
export type UnitTypeKey = "a" | "b" | "c" | "d" | "d2f" | "e" | "e2f";

/** Цонхны чиг: хойд, зүүн, урд, баруун. */
export type Side = "n" | "e" | "s" | "w";

export type ParkingKind = "standard" | "large" | "ev" | "accessible";

/** Explorer-ийн түвшин — URL-аас шууд уншигдана (`routes.ts`). */
export type View =
  | { level: "location" }
  | { level: "site" }
  | { level: "basement"; basement: BasementLevel; parkingId?: string }
  | { level: "block"; block: number }
  | { level: "floor"; block: number; floor: number }
  | { level: "unit"; unitId: string }
  | { level: "tour"; unitId: string; room?: number };

export type Level = View["level"];

export type StatusMap = Record<string, Status>;

export type InventorySnapshot = {
  units: StatusMap;
  parking: StatusMap;
  /** `mock` — жишээ өгөгдөл, `vertmonhub` — CRM-ээс ирсэн бодит төлөв. */
  source: "mock" | "vertmonhub";
  updatedAt: string;
};

/** Сайтын «Байршил» хэсгийн цэг (`site-content` → `location.pins`). */
export type ExplorePoi = {
  place: string;
  description: string;
  distance: string;
  unit: string;
  image: string;
  /** Агаарын рендер дээрх байрлал (%) — 3D байрлалыг эндээс тооцно. */
  x: number;
  y: number;
};

/** Сайтын контентоос Explorer-т дамжуулах хэсэг. */
export type ExploreSiteInfo = {
  address: string;
  coords: string;
  phone: string;
  hours: string;
  pins: ExplorePoi[];
  inquiry: {
    name: string;
    phone: string;
    note: string;
    submit: string;
    sending: string;
    error: string;
    successTitle: string;
    successBody: string;
  };
};

export type ExploreMode = "web" | "kiosk";
