/* ============================================================
   ELYSIUM — Event landing pages (data model)
   Админаас удирддаг эвент/арга хэмжээний landing page-ийн
   контентын нэгдсэн бүтэц. Storage-д JSON (jsonb) хэлбэрээр
   хадгалагдана. Public хуудас нь энэ бүтцийг рендерлэнэ.
   ============================================================ */

export type EventStatus = "draft" | "published";

/* ---- Orderable content blocks (урд/хойно нь зөөж болно) ---- */
export type Section =
  | { id: string; type: "richText"; heading: string; body: string }
  | { id: string; type: "stats"; items: { value: string; label: string }[] }
  | {
      id: string;
      type: "agenda";
      heading: string;
      items: { time: string; title: string; desc: string }[];
    }
  | { id: string; type: "gallery"; images: { url: string; alt: string }[] }
  | { id: string; type: "image"; url: string; caption: string }
  | {
      id: string;
      type: "cards";
      heading: string;
      items: { image: string; title: string; subtitle: string; desc: string }[];
    }
  | { id: string; type: "cta"; heading: string; body: string; buttonLabel: string };

export type SectionType = Section["type"];

export type EventContent = {
  /** Онцлох өнгө (accent) — hex */
  accent: string;
  /** Hero-гийн өнгөний схем */
  theme: "light" | "dark";
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    date: string;
    location: string;
    /** background зураг (URL) */
    image: string;
    ctaLabel: string;
  };
  sections: Section[];
  form: {
    title: string;
    subtitle: string;
    /** Нэр, утас үргэлж асууна. Доорхыг нэмж/хасаж болно. */
    fields: { email: boolean; guests: boolean; note: boolean };
    submitLabel: string;
    successTitle: string;
    successBody: string;
  };
  contact: { phone: string; note: string };
};

export type EventDoc = {
  id: string;
  slug: string;
  name: string;
  status: EventStatus;
  content: EventContent;
  createdAt: string;
  updatedAt: string;
};

/* ---- Slug ---- */

/** Аль хэдийн ашиглагдсан / системийн route-ууд — эвентийн slug болгож болохгүй. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "news",
  "final",
  "mono",
  "v2",
  "classic",
  "arcsphere",
  "daylight",
  "find",
  "images",
  "fonts",
  "uploads",
  "_next",
  "favicon.ico",
]);

/** Текстээс URL-д тохирох slug үүсгэнэ (кирилл→латин галиглал). */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j",
    з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
    ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f",
    х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "",
    э: "e", ю: "yu", я: "ya",
  };
  const translit = input
    .toLowerCase()
    .split("")
    .map((ch) => (ch in map ? map[ch] : ch))
    .join("");
  return translit
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]([a-z0-9-]{0,58}[a-z0-9])?$/.test(slug) && !RESERVED_SLUGS.has(slug);
}

/* ---- Default template — шинэ эвент үүсгэхэд ашиглана ---- */

function rid(): string {
  // Богино давхцалгүй id (section-уудад)
  return Math.random().toString(36).slice(2, 10);
}

export function makeSection(type: SectionType): Section {
  const id = rid();
  switch (type) {
    case "richText":
      return { id, type, heading: "Гарчиг", body: "Энд текстээ бичнэ үү." };
    case "stats":
      return {
        id,
        type,
        items: [
          { value: "506", label: "айлын орон сууц" },
          { value: "85%", label: "нийтийн эзэмшил" },
          { value: "2027", label: "ашиглалтад орно" },
        ],
      };
    case "agenda":
      return {
        id,
        type,
        heading: "Хөтөлбөр",
        items: [
          { time: "17:00", title: "Зочид хүрэлцэн ирэх", desc: "" },
          { time: "17:30", title: "Танилцуулга", desc: "Төслийн танилцуулга, Q&A" },
          { time: "18:30", title: "Networking", desc: "" },
        ],
      };
    case "gallery":
      return { id, type, images: [] };
    case "image":
      return { id, type, url: "", caption: "" };
    case "cards":
      return {
        id,
        type,
        heading: "Онцлох",
        items: [
          { image: "", title: "Гарчиг", subtitle: "", desc: "Тайлбар." },
        ],
      };
    case "cta":
      return {
        id,
        type,
        heading: "Суудлаа баталгаажуулаарай",
        body: "Хязгаарлагдмал тооны суудал. Одоо бүртгүүлээрэй.",
        buttonLabel: "Бүртгүүлэх",
      };
  }
}

export function defaultContent(name: string): EventContent {
  return {
    accent: "#b4d656",
    theme: "dark",
    hero: {
      kicker: "Elysium Residence · Онцгой арга хэмжээ",
      title: name || "Эвентийн нэр",
      subtitle:
        "Elysium Residence-ийн онцгой арга хэмжээнд таныг урьж байна. Доорх маягтыг бөглөн суудлаа баталгаажуулаарай.",
      date: "2026 · —",
      location: "Улаанбаатар",
      image: "",
      ctaLabel: "Бүртгүүлэх",
    },
    sections: [makeSection("richText"), makeSection("agenda"), makeSection("cta")],
    form: {
      title: "Бүртгүүлэх",
      subtitle: "Мэдээллээ үлдээгээрэй — бид тантай холбогдож баталгаажуулна.",
      fields: { email: false, guests: true, note: false },
      submitLabel: "Бүртгүүлэх",
      successTitle: "Баярлалаа!",
      successBody: "Таны бүртгэл хүлээн авагдлаа. Бид тантай удахгүй холбогдоно.",
    },
    contact: { phone: "7786-2222", note: "Даваа – Ням · 09:00 – 18:00" },
  };
}

/** Шинэ EventDoc үүсгэх (id, огноо талбарыг дуудагч талд бөглөнө). */
export function newEvent(params: { id: string; name: string; slug: string; now: string }): EventDoc {
  return {
    id: params.id,
    slug: params.slug,
    name: params.name,
    status: "draft",
    content: defaultContent(params.name),
    createdAt: params.now,
    updatedAt: params.now,
  };
}
