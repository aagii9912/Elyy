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
   *  `![тайлбар](зургийн-URL)` дангаараа мөр = зураг, хоосон мөр
   *  шинэ догол мөр болно. */
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

export type NewsBlock =
  | { kind: "heading"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "image"; src: string; caption: string }
  | { kind: "paragraph"; text: string };

/** Нийтлэлийн дунд орох зураг: `![тайлбар](URL)` дангаараа нэг мөр. */
const IMAGE_LINE = /^!\[([^\]]*)\]\(\s*(\S+?)\s*\)$/;

/** Агуулгын мөрөнд оруулах зургийн тэмдэглэгээ (админ талд ашиглана). */
export function newsImageMarkup(src: string, caption = ""): string {
  return `![${caption}](${src})`;
}

/** Текст агуулгыг рендерлэхэд бэлэн блокууд болгоно.
 *  HTML оруулахгүй тул хэрэглэгчийн текст аюулгүй рендерлэгдэнэ. */
export function parseNewsBody(body: string): NewsBlock[] {
  const blocks: NewsBlock[] = [];
  let list: string[] = [];
  let para: string[] = [];

  const flushList = () => {
    if (list.length) blocks.push({ kind: "list", items: list });
    list = [];
  };
  const flushPara = () => {
    if (para.length) blocks.push({ kind: "paragraph", text: para.join(" ") });
    para = [];
  };

  for (const raw of body.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushList();
      flushPara();
    } else if (line.startsWith("## ")) {
      flushList();
      flushPara();
      blocks.push({ kind: "heading", text: line.slice(3).trim() });
    } else if (IMAGE_LINE.test(line)) {
      flushList();
      flushPara();
      const [, caption, src] = IMAGE_LINE.exec(line)!;
      blocks.push({ kind: "image", src, caption: caption.trim() });
    } else if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2).trim());
    } else {
      flushList();
      para.push(line);
    }
  }
  flushList();
  flushPara();
  return blocks;
}
