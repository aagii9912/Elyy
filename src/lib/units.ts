/**
 * Аксонометр төлөвлөгөө бүхий орон сууцны типүүд.
 *
 * Талбайн тоо нь "Elysium Brochure 0813"-аас (айл бүрийн өрөөнүүдийн
 * нийлбэр). Урьд нь рендерийн файлын нэрнээс авсан утга байсныг брошурын
 * албан ёсны тоогоор сольсон — задаргааг `unit-plans.ts`-ээс үз.
 *
 * Зургууд: /public/images/axono/<view>.jpg (1600px) ба <view>-sm.jpg (800px).
 * Эх PNG-үүдээс `scripts/axono.py`-аар тайрч экспортолсон.
 */
export type AxonoUnit = {
  /** Борлуулалтын багийн хэрэглэдэг типийн үсэг. */
  letter: string;
  /** Талбай — 2 давхрын хувилбарт байхгүй. */
  area?: string;
  /** Давхрын тэмдэглэгээ (2F хувилбарууд). */
  floor?: string;
  rooms: string;
  /** Төлөвлөлтийн товч тодорхойлолт. */
  plan: string;
  /** /images/axono доторх basename-ууд — өнцөг тус бүр. */
  views: string[];
};

export const AXONO_UNITS: AxonoUnit[] = [
  { letter: "A", area: "84.66 м²", rooms: "3 өрөө", plan: "Уужим зохион байгуулалт", views: ["a-01", "a-02"] },
  { letter: "B", area: "133.61 м²", rooms: "4 өрөө", plan: "Дээд зэрэглэлийн орон зай", views: ["b-01", "b-02"] },
  { letter: "C", area: "80.32 м²", rooms: "3 өрөө", plan: "Гэр бүлд тохиромжтой", views: ["c-01", "c-02"] },
  { letter: "D", area: "51.72 м²", rooms: "2 өрөө", plan: "Авсаархан төлөвлөлт", views: ["d-01", "d-02"] },
  { letter: "D", area: "49.19 м²", floor: "2 давхар", rooms: "2 өрөө", plan: "2-р давхрын хувилбар", views: ["d2f-01", "d2f-02"] },
  { letter: "E", area: "89.73 м²", rooms: "3 өрөө", plan: "Террастай зохион байгуулалт", views: ["e-01", "e-02"] },
  { letter: "E", area: "64.16 м²", floor: "2 давхар", rooms: "2 өрөө", plan: "2-р давхрын хувилбар", views: ["e2f-01", "e2f-02"] },
];

/* Рендерийн студийн дэвсгэр нь #dbe3ef — зургийн контейнерт мөн энэ өнгийг
   өгвөл object-contain-ий хажуугийн зай салангид харагдахгүй (Tailwind-д
   статик класс хэрэгтэй тул компонент бүрт `bg-[#dbe3ef]` гэж бичсэн). */

export const axonoTitle = (u: AxonoUnit) => `${u.letter} тип${u.floor ? ` · ${u.floor}` : ""}`;

/** `-sm` = карт/жижиг байрлал, дагаваргүй нь бүтэн хэмжээ. */
export const axonoSrc = (view: string, size: "sm" | "full" = "full") =>
  `/images/axono/${view}${size === "sm" ? "-sm" : ""}.jpg`;
