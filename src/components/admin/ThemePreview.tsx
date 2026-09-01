"use client";

/* Админы дизайн засварлагчийн АМЬД урьдчилан харалт.

   Жинхэнэ нүүр хуудсыг (`/`) iframe-д ачаалж, тохиргоо өөрчлөгдөх бүрд
   түүний `<style id="site-theme">`-ийг ШИНЭЧЛЭНЭ. Ингэснээр «Гүн
   тодруулга» гэх мэт нэр юуг өөрчилдгийг тайлбарлах шаардлагагүй —
   гүйлгүүр хөдөлмөгц үр дүн нь хажууд нь харагдана.

   Яагаад iframe:
     • Нэг origin тул `contentDocument`-д шууд хандана (postMessage,
       нэмэлт route хэрэггүй).
     • `buildThemeCss` нь client/server хоёуланд ажилладаг — сервер
       талын рендертэй ЯГ ижил CSS үүснэ, өөр логик давхардахгүй.

   ⚠️ iframe нь ХАДГАЛСАН контентыг харуулна. Хадгалаагүй текст, зургийн
   өөрчлөлт энд гарахгүй; өнгө, бичиг, дэвсгэр л шууд буудаг. */

import { useCallback, useEffect, useRef, useState } from "react";
import { buildThemeCss, flatSectionTone, googleFontHref, sectionTone } from "@/lib/theme-css";
import { THEME_SECTIONS } from "@/lib/site-content";
import type { ThemeContent, ThemeSectionId } from "@/lib/site-content";
import { Button } from "./ui";

/* Урьдчилан харалт дахь нэмэлт CSS — хөвөгч курсор, чат зэрэг нь
   зөвхөн саад болно (`data-chrome` тэмдэглэгээ нь mono компонентууд
   дээр байдаг). Гүйлтийн зураас ч зайг иддэг тул нууна. */
const PREVIEW_CSS = `
[data-chrome]{display:none!important}
html{scrollbar-width:none}
html::-webkit-scrollbar{display:none}
[data-preview-focus]{outline:3px solid #2a5124;outline-offset:-3px}
`;

const DEVICES = {
  desktop: { w: 1440, h: 920, label: "Дэлгэц" },
  mobile: { w: 390, h: 780, label: "Утас" },
} as const;

type DeviceId = keyof typeof DEVICES;

/** Тухайн баримт бичигт theme-ийн CSS-ийг суулгах / шинэчлэх. */
function applyTheme(doc: Document, theme: ThemeContent) {
  let style = doc.getElementById("site-theme") as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement("style");
    style.id = "site-theme";
    doc.head.appendChild(style);
  }
  style.textContent = buildThemeCss(theme);

  /* Фонт — зөвхөн «тохируулсан» горимд Google Fonts руу нэг link. */
  const href = googleFontHref(theme);
  let link = doc.getElementById("site-theme-font") as HTMLLinkElement | null;
  if (href) {
    if (!link) {
      link = doc.createElement("link");
      link.id = "site-theme-font";
      link.rel = "stylesheet";
      doc.head.appendChild(link);
    }
    if (link.getAttribute("href") !== href) link.setAttribute("href", href);
  } else if (link) {
    link.remove();
  }
}

/** Хэсгүүдийн `data-tone`-ыг ДАХИН тооцоолж тавина.
 *
 *  `data-tone` нь сервер талд рендерлэгддэг АТРИБУТ болохоор CSS-ээр
 *  дарж болдоггүй — iframe нь хадгалсан утгаараа үлдэнэ. Улмаас
 *  дэвсгэрийг хартай болгосон ч бичиг бараан хэвээр харагдаж, «цагаан
 *  дээр цагаан» төрлийн алдааг preview дээр илрүүлэх боломжгүй болно.
 *  Тиймээс public талын логикийг (`sectionTone` / `flatSectionTone`)
 *  яг тэр хэвээр нь дуудаж, атрибутыг өөрсдөө шинэчилнэ. */
function applyTones(doc: Document, theme: ThemeContent) {
  for (const s of THEME_SECTIONS) {
    const el = doc.querySelector<HTMLElement>(`[data-bg="${s.id}"]`);
    if (!el) continue;
    const own = "ownTone" in s ? (s.ownTone as "light" | "dark") : "light";
    const tone =
      "manualTone" in s && s.manualTone
        ? sectionTone(theme, s.id, own)
        : flatSectionTone(theme, s.id, own);
    el.setAttribute("data-tone", tone);
  }
}

export function ThemePreview({
  theme,
  /** Сонгосон хэсэг — өөрчлөгдөхөд iframe тийш гүйж, тойруулж тэмдэглэнэ. */
  focus,
}: {
  theme: ThemeContent;
  focus?: ThemeSectionId | null;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [ready, setReady] = useState(false);
  const [width, setWidth] = useState(0);

  /* Хүрээг багана дүүргэж багасгана — 1440px өргөнтэй жинхэнэ дэлгэцийн
     зохиомжийг харуулж байж «дизайнер харахад ойлгомжтой» болно. */
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const onLoad = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    if (!doc.getElementById("admin-preview-css")) {
      const s = doc.createElement("style");
      s.id = "admin-preview-css";
      s.textContent = PREVIEW_CSS;
      doc.head.appendChild(s);
    }
    setReady(true);
  }, []);

  /* Тохиргоо өөрчлөгдөх бүрд CSS-ийг дарж бичнэ. Хямд үйлдэл тул
     debounce хэрэггүй — гүйлгүүр чирэхэд шууд дагана. */
  useEffect(() => {
    const doc = frame.current?.contentDocument;
    if (!ready || !doc) return;
    applyTheme(doc, theme);
    applyTones(doc, theme);
  }, [theme, ready]);

  /* Сонгосон хэсэг рүү үсрэн очиж, богино хугацаанд тойруулна.
   *
   *  ⚠️ Зөөлөн гүйлт энд ажиллахгүй:
   *    • `scrollTo({behavior:"smooth"})` — Lenis нь `html.lenis`-д
   *      `scroll-behavior:auto!important` тавьдаг тул цуцлагдаж, хуудас
   *      0 дээрээ үлддэг.
   *    • Гараар rAF тween хийвэл iframe далд/арын төлөвт орох үед
   *      (таб идэвхгүй, самбар хаалттай) rAF удаашрах тул тween дундаа
   *      тасарч, буруу байрлалд зогсдог.
   *  Иймд ШУУД утга онооно — Lenis түүнийг хүлээж авдаг нь батлагдсан. */
  useEffect(() => {
    const win = frame.current?.contentWindow;
    const doc = frame.current?.contentDocument;
    if (!ready || !win || !doc || !focus) return;
    const el = doc.querySelector<HTMLElement>(`[data-bg="${focus}"]`);
    if (!el) return;

    /* Пиннэсэн бүлгүүд (01 · Ерөнхий төлөвлөлт г.м) хэд дахин өндөр
       бөгөөд ЯГ эхэндээ бүтэн дэлгэцийн «хөшиг» (hero-гоос шилжих
       veil) байрладаг — тэнд зогсвол сонгосон өнгө, хальс юу ч
       харагдахгүй, зөвхөн хар талбай харагдана. Тиймээс нэг дэлгэц
       дотогш орж зогсоно: кадар ба түүн дээрх хальс хоёул ил гарна. */
    const top = el.getBoundingClientRect().top + win.scrollY;
    const vh = win.innerHeight || 1;
    const pinned = el.offsetHeight > vh * 1.5;
    win.scrollTo(0, Math.max(0, pinned ? top + vh : top - 8));
    el.setAttribute("data-preview-focus", "");
    const timer = win.setTimeout(() => el.removeAttribute("data-preview-focus"), 1600);
    return () => {
      win.clearTimeout(timer);
      el.removeAttribute("data-preview-focus");
    };
  }, [focus, ready]);

  const d = DEVICES[device];
  /* 1-ээс дээш томруулахгүй — жижиг дэлгэцэд л багасгана. */
  const scale = width ? Math.min(1, width / d.w) : 0.5;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="text-body font-bold text-neutral-900">Амьд урьдчилан харалт</span>
        <div className="ml-auto flex items-center gap-1.5">
          {(Object.keys(DEVICES) as DeviceId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setDevice(id)}
              className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                device === id
                  ? "border-ink bg-ink/5 text-ink"
                  : "border-neutral-300 text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              {DEVICES[id].label}
            </button>
          ))}
          <Button
            type="button"
            variant="ghost"
            className="px-2.5 py-1 text-xs"
            onClick={() => {
              setReady(false);
              if (frame.current) frame.current.src = "/";
            }}
          >
            Дахин ачаалах
          </Button>
        </div>
      </div>

      <div
        ref={box}
        className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
        style={{ height: d.h * scale }}
      >
        <iframe
          ref={frame}
          src="/"
          title="Сайтын урьдчилан харалт"
          onLoad={onLoad}
          /* Гар утасны горимд хүрээ голлоно. */
          style={{
            width: d.w,
            height: d.h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            marginLeft: device === "mobile" ? (width - d.w * scale) / 2 : 0,
            border: 0,
          }}
        />
      </div>

      <p className="mt-2 text-label leading-relaxed text-neutral-400">
        Өнгө, бичиг, дэвсгэр шууд буудаг. Хадгалаагүй <b>текст, зургийн</b> өөрчлөлт энд
        харагдахгүй — хадгалсны дараа «Дахин ачаалах» дарна уу.
      </p>
    </div>
  );
}
