/* ============================================================
   ELYSIUM — Нийтлэлийн агуулга: хадгалах формат ↔ HTML
   Админы WYSIWYG засварлагч HTML-ээр ажиллана, харин хадгалах
   хэлбэр нь хэвээрээ (`body` текст) үлдэнэ. Ингэснээр нийтлэлийн
   нийтийн хуудас, хуучин бичсэн нийтлэлүүд огт өөрчлөгдөхгүй.
   ============================================================ */

import { parseNewsBody, type NewsImageSize, type NewsInline } from "./news";

const IMAGE_SIZES: NewsImageSize[] = ["normal", "wide", "full"];

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineToHtml(spans: NewsInline[]): string {
  return spans
    .map((s) =>
      s.kind === "bold"
        ? `<strong>${esc(s.text)}</strong>`
        : s.kind === "italic"
          ? `<em>${esc(s.text)}</em>`
          : s.kind === "bolditalic"
            ? `<strong><em>${esc(s.text)}</em></strong>`
            : s.kind === "link"
              ? `<a href="${esc(s.href)}">${esc(s.text)}</a>`
              : esc(s.text)
    )
    .join("");
}

/** Хадгалсан агуулгыг засварлагчийн эхний HTML болгоно. */
export function newsBodyToHtml(body: string): string {
  const out: string[] = [];
  for (const b of parseNewsBody(body)) {
    if (b.kind === "heading") {
      out.push(`<h${b.level}>${esc(b.text)}</h${b.level}>`);
    } else if (b.kind === "list") {
      out.push(`<ul>${b.items.map((i) => `<li><p>${inlineToHtml(i)}</p></li>`).join("")}</ul>`);
    } else if (b.kind === "image") {
      out.push(`<img src="${esc(b.src)}" alt="${esc(b.caption)}" data-size="${b.size}">`);
    } else {
      out.push(`<p>${inlineToHtml(b.spans)}</p>`);
    }
  }
  return out.join("") || "<p></p>";
}

/* ---- HTML → хадгалах формат (зөвхөн browser: DOMParser) ---- */

/** Нэг мөрийн доторх агуулгыг тэмдэглэгээтэй текст болгоно. */
function inlineToText(node: Node): string {
  let out = "";
  node.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) {
      out += n.textContent ?? "";
      return;
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return;
    const el = n as HTMLElement;
    const tag = el.tagName;
    if (tag === "BR") {
      out += " ";
      return;
    }
    /* Холбоосны дотор талын тэмдэглэгээг авч хаяна: `[**x**](хаяг)` гэдгийг
       хадгалах формат ойлгодоггүй тул эвдэрсэн бичиглэл үүсгэхгүй. */
    if (tag === "A") {
      const label = (el.textContent ?? "").trim();
      const href = el.getAttribute("href") ?? "";
      out += label && href ? `[${label}](${href})` : label;
      return;
    }
    const inner = inlineToText(el);
    // Зөвхөн зайнаас бүрдэх хэсгийг тэмдэглэвэл задлагч танихгүй.
    if (!inner.trim()) {
      out += inner;
      return;
    }
    if (tag === "STRONG" || tag === "B") out += `**${inner}**`;
    else if (tag === "EM" || tag === "I") out += `*${inner}*`;
    else out += inner;
  });
  return out;
}

/** Зургийн мөр: `![тайлбар](хаяг){wide}` */
function imageToText(img: HTMLImageElement): string {
  const src = img.getAttribute("src") ?? "";
  if (!src) return "";
  const alt = (img.getAttribute("alt") ?? "").trim();
  const raw = img.getAttribute("data-size") as NewsImageSize | null;
  const size: NewsImageSize = raw && IMAGE_SIZES.includes(raw) ? raw : "normal";
  return `![${alt}](${src})${size === "normal" ? "" : `{${size}}`}`;
}

function blockToText(el: Element): string[] {
  const tag = el.tagName;
  if (tag === "H2" || tag === "H1") return [`## ${inlineToText(el).trim()}`];
  if (tag === "H3" || tag === "H4" || tag === "H5" || tag === "H6") {
    return [`### ${inlineToText(el).trim()}`];
  }
  if (tag === "UL" || tag === "OL") {
    return Array.from(el.children)
      .map((li) => inlineToText(li).trim())
      .filter(Boolean)
      .map((t) => `- ${t}`);
  }
  if (tag === "IMG") {
    const line = imageToText(el as HTMLImageElement);
    return line ? [line] : [];
  }
  // Зураг өөр элемент дотор ороогүй эсэхийг мөн шалгана (figure г.м.).
  const img = el.querySelector("img");
  if (img && !inlineToText(el).trim()) {
    const line = imageToText(img);
    return line ? [line] : [];
  }
  const text = inlineToText(el).replace(/\s+/g, " ").trim();
  return text ? [text] : [];
}

/** Засварлагчийн HTML-ийг хадгалах формат руу буцаана. */
export function htmlToNewsBody(html: string): string {
  const doc = new DOMParser().parseFromString(`<!doctype html><body>${html}`, "text/html");
  const chunks: string[] = [];
  for (const el of Array.from(doc.body.children)) {
    const lines = blockToText(el);
    if (!lines.length) continue;
    chunks.push(lines.join("\n"));
  }
  return chunks.join("\n\n").trim();
}
