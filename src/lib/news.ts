/* ============================================================
   ELYSIUM — Мэдээ / нийтлэл (data model)
   Админаас удирддаг мэдээний нийтлэлүүд. Storage-д мөр тус бүрээр
   хадгалагдана. Public: /news (жагсаалт), /news/<slug> (дэлгэрэнгүй).
   ============================================================ */

import { slugify } from "./events";

export type NewsStatus = "draft" | "published";

export type NewsDoc = {
  id: string;
  slug: string;
  title: string;
  /** Жагсаалт болон OG-д харагдах богино танилцуулга. */
  excerpt: string;
  /** Нүүр зураг (URL). Хоосон байж болно. */
  cover: string;
  /** Ангилал/шошго — ж: "Төслийн явц". */
  tag: string;
  /** Нийтлэлийн огноо — YYYY-MM-DD. */
  date: string;
  /** Агуулга — энгийн текст. `## ` дэд гарчиг, `- ` жагсаалт,
   *  `![тайлбар](зургийн-URL)` дангаараа мөр = зураг (араас нь `{wide}`
   *  эсвэл `{full}` бичвэл өргөн/дэлгэц дүүрэн), хоосон мөр шинэ догол
   *  мөр болно. */
  body: string;
  status: NewsStatus;
  createdAt: string;
  updatedAt: string;
};

export { slugify };

/** Огноог тогтвортой (locale-агностик) харуулна: 2026-08-12 → 2026.08.12 */
export function formatNewsDate(date: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : date;
}

/** Шинэ нийтлэлийн огнооны өгөгдмөл (өнөөдөр, UTC). */
export function todayISODate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function newNews(params: {
  id: string;
  title: string;
  slug: string;
  now: string;
}): NewsDoc {
  return {
    id: params.id,
    slug: params.slug,
    title: params.title,
    excerpt: "",
    cover: "",
    tag: "Мэдээ",
    date: params.now.slice(0, 10),
    body: "Нийтлэлийн агуулгыг энд бичнэ үү.",
    status: "draft",
    createdAt: params.now,
    updatedAt: params.now,
  };
}

/* ---- Агуулгын хөнгөн задлагч (markdown-ийн жижиг дэд олонлог) ---- */

/** Нийтлэл доторх зургийн өргөн: багана / өргөн / дэлгэц дүүрэн. */
export type NewsImageSize = "normal" | "wide" | "full";

/** Мөр доторх хэлбэржүүлэлт. HTML биш, бүтэцлэгдсэн хэсгүүд буцаана —
 *  тиймээс хэрэглэгчийн текст рендерлэхэд аюулгүй. */
export type NewsInline =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "italic"; text: string }
  | { kind: "bolditalic"; text: string }
  | { kind: "link"; text: string; href: string };

export type NewsBlock =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "list"; items: NewsInline[][] }
  | { kind: "image"; src: string; caption: string; size: NewsImageSize }
  | { kind: "paragraph"; spans: NewsInline[] };

/** Нийтлэлийн дунд орох зураг: `![тайлбар](URL)` дангаараа нэг мөр.
 *  Сүүлд нь `{wide}` / `{full}` залгавал өргөнийг өөрчилнө. */
const IMAGE_LINE = /^!\[([^\]]*)\]\(\s*(\S+?)\s*\)(?:\s*\{(wide|full)\})?$/;

/** Зөвшөөрөх холбоос: гадаад хаяг, шуудан, утас, сайт доторх зам.
 *  `javascript:` мэтийг холбоос болгохгүй, энгийн текст болгож үлдээнэ. */
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

/* `**тод**` · `*налуу*` · `[текст](хаяг)`.
   • Доогуур зураас (`_`) ашиглахгүй — файл, хаягийн нэрэнд түгээмэл тул
     санамсаргүй налуу үүсгэдэг.
   • Одны хажууд зай байвал тоохгүй: “5 * 3 * 2” гэдэг налуу болохгүй. */
const EMPH = "[^\\s*](?:[^*\\n]*[^\\s*])?";
const INLINE = new RegExp(
  `\\*\\*\\*(${EMPH})\\*\\*\\*|\\*\\*(${EMPH})\\*\\*|\\*(${EMPH})\\*|\\[([^\\]\\n]+)\\]\\(\\s*([^)\\s]+)\\s*\\)`,
  "g"
);

/** Нэг мөрийн текстийг хэлбэржүүлэлтийн хэсгүүд болгоно. */
function parseInline(input: string): NewsInline[] {
  const out: NewsInline[] = [];
  let last = 0;
  INLINE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = INLINE.exec(input))) {
    // `![тайлбар](URL)` — зураг. Мөр дундах бол холбоос болгохгүй.
    if (m[4] !== undefined && m.index > 0 && input[m.index - 1] === "!") continue;
    if (m.index > last) out.push({ kind: "text", text: input.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: "bolditalic", text: m[1] });
    else if (m[2] !== undefined) out.push({ kind: "bold", text: m[2] });
    else if (m[3] !== undefined) out.push({ kind: "italic", text: m[3] });
    else if (SAFE_HREF.test(m[5])) out.push({ kind: "link", text: m[4], href: m[5] });
    // Аюулгүй биш хаяг — бичсэн чигээр нь энгийн текст болгож үлдээнэ.
    else out.push({ kind: "text", text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < input.length) out.push({ kind: "text", text: input.slice(last) });
  return out;
}

/** Текст агуулгыг рендерлэхэд бэлэн блокууд болгоно.
 *  HTML оруулахгүй тул хэрэглэгчийн текст аюулгүй рендерлэгдэнэ. */
export function parseNewsBody(body: string): NewsBlock[] {
  const blocks: NewsBlock[] = [];
  let list: NewsInline[][] = [];
  let para: string[] = [];

  const flushList = () => {
    if (list.length) blocks.push({ kind: "list", items: list });
    list = [];
  };
  const flushPara = () => {
    if (para.length) blocks.push({ kind: "paragraph", spans: parseInline(para.join(" ")) });
    para = [];
  };

  for (const raw of body.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushList();
      flushPara();
    } else if (line.startsWith("### ") || line.startsWith("## ")) {
      flushList();
      flushPara();
      const level = line.startsWith("### ") ? 3 : 2;
      blocks.push({ kind: "heading", level, text: line.slice(level + 1).trim() });
    } else if (IMAGE_LINE.test(line)) {
      flushList();
      flushPara();
      const [, caption, src, size] = IMAGE_LINE.exec(line)!;
      blocks.push({
        kind: "image",
        src,
        caption: caption.trim(),
        size: (size as NewsImageSize) ?? "normal",
      });
    } else if (line.startsWith("- ")) {
      flushPara();
      list.push(parseInline(line.slice(2).trim()));
    } else {
      flushList();
      para.push(line);
    }
  }
  flushList();
  flushPara();
  return blocks;
}
