"use client";

/* /mono — «01 · Ерөнхий төлөвлөлт» бүлгийн пиннэсэн гүйлтийн түүх.
   Кадр-кадраар гүйлтэд уягдсан рендерийн дараалал ард нь скраб хийж,
   тоон үзүүлэлт бүр өөрийн улирал дээр GSAP crossfade-ээр солигдоно
   (хатуу remount байхгүй). Бүлэг төвд гарах танилцуулга гарчгаар
   нээгдээд, дараа нь булангийн байнгын толгой руу шилжинэ.

   ЗОХИОН БАЙГУУЛАЛТ — «blueprint спек».
   Бичвэр бүхэлдээ ЗҮҮН баганад цуглана: дээр нь бүлгийн толгой, доор
   нь спек блок (индекс → аварга тоо → нэр томьёо → дэлгэрэнгүй), доод
   ирмэгээр нь явцын зураас. Ингэснээр кадрын баруун тал чөлөөтэй
   үлдэж, захиалагчийн рендерүүд бүтнээрээ харагдана — өмнө нь аварга
   тоо рендерийн яг голд буудаг байв.

   ХАСАГДСАН: `letters` (ELYS) ба `callouts` (барилгын бүтэц)
   хувилбарууд. Тэр хоёр бүлэг аль эрт `MonoElys` / `MonoEquip` болж
   тусдаа компонент болсон тул энэ файл дахь код нь хэрэглээгүй үлдсэн
   байв. Одоо энэ компонентыг ЗӨВХӨН `MonoStats` дуудна.

   `tone="dark"` — энэ бүлэг богино хугацаанд `light` байсан (цагаан
   хөшиг + бараан бичиг), гэвч цагаан хөшиг нь захиалагчийн рендерүүдийг
   бүдгэрүүлдэг тул буцаав. Хоёр горим хоёулаа ажиллана: бичгийн өнгө
   нь `data-tone`-оос ирэх `text-fg` семантик токеноор шийдэгдэнэ
   (`globals.css`), тиймээс энд цагаан/хар өнгө хатуу бичигдээгүй. */

import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { useLenis } from "lenis/react";
import { gsap, type ScrollTrigger as ScrollTriggerType } from "@/lib/gsap";
import { MonoKicker, useScrollAutoplay } from "./shared";
import type { MediaFilmStyle } from "@/lib/theme-css";

export type StoryPoint = {
  n: string;
  heading: string;
  /** Хэмжих нэгж — тооны ард ногоон өнгөөр (ж: "%"). */
  accent?: string;
  text: string;
};

/** Бүлгийн өнгөний горим. `dark` — бараан кадран дээр цагаан бичиг
 *  (анхны загвар). `light` — цайвар кадран дээр бараан бичиг. Кадруудад
 *  НЭГ ч градаци хийхгүй — зөвхөн scrim, бичгийн өнгө солигдоно. */
export type StoryTone = "dark" | "light";

const framePathIn = (dir: string, ext: string) => (i: number) =>
  `${dir}/frame_${String(i).padStart(3, "0")}.${ext}`;

/* The chapter intro title scrubs away over the first INTRO_OUT screens and
   the chapter exit takes the last EXIT_IN screens. Point layers live strictly
   between the two: they never overlap the intro title, and the window they
   share is split into equal slices so every point runs for the same distance. */
const INTRO_OUT = 0.55;
const EXIT_IN = 0.22;

/* ---- типографийн туслахууд ------------------------------------------ */

/** Тэмдэгтийн ойролцоо оптик өргөн (бүтэн цифрийг 1 гэж авав). */
const glyphWidth = (c: string) =>
  c === " " ? 0.34 : "·•.,:'’".includes(c) ? 0.4 : "Il|".includes(c) ? 0.5 : 1;

/** Хэмжих нэгж (`accent`) 0.34em-ээр буудаг тул бүтэн цифрийн ~0.4. */
const UNIT_W = 0.4;

/** Аварга тооны хэмжээний коэффициент (0.46–1) — `--stat-fit`.
 *
 *  Өмнө нь хэмжээ нь `heading.length > 4 ? 7rem : 11rem` гэсэн ганц
 *  нөхцлөөр үсэрдэг байв: «506» аварга, «2027 · II» гэнэт бага болж,
 *  нэг бүлэг дотор хоёр өөр хэмжээ гарч хэмнэл алдагддаг. Энд утгын
 *  ОПТИК өргөнөөр нь хуваарилна — бүлэг доторх цэгүүд солигдоход
 *  зүүн баганын масс тогтмол хэвээр үлдэнэ (энэ бүлэг нэг дор ГАНЦ
 *  үзүүлэлт харуулдаг тул өргөн нь тогтвортой байх нь чухал).
 *
 *  Хэмжсэн үр дүн (1280px): 506 → 220px, 85% → 181px, 513 → 220px,
 *  «2027 · II» → 233px. Өмнө нь сүүлийнх нь 385px хүрдэг байв. */
const statFit = (heading: string, accent = "") => {
  const w = [...heading].reduce((a, c) => a + glyphWidth(c), 0) + accent.length * UNIT_W;
  return Math.round(Math.min(1, Math.max(0.46, 3.15 / w)) * 1000) / 1000;
};

/** Тайлбар мөрийг салгах тэмдэг — контент дотор АЛЬ ХЭДИЙН байгаа
 *  ` · ` эсвэл ` — `. Тусдаа талбар нэмээгүй тул админы өгөгдөл,
 *  `SiteContent` бүтэц хэвээрээ үлдэнэ. */
const SPEC_SPLIT = /\s+[·•—–-]\s+/;

/** Хэт урт нэр томьёог ТОМ ҮСГЭЭР бичихгүй: кирилл томоор + сул зайтай
 *  урт өгүүлбэр нь уншигдацын хамгийн муу хослол. */
const LABEL_MAX = 30;

/** Тайлбарыг «нэр томьёо / дэлгэрэнгүй» хоёр эгнээ болгон салгана.
 *
 *  «айлын орон сууц · 4 блок» → АЙЛЫН ОРОН СУУЦ / «4 блок»
 *  «автомашины зогсоол»        → АВТОМАШИНЫ ЗОГСООЛ (ганц эгнээ)
 *  Урт өгүүлбэр салгагчгүй бол бүхэлдээ энгийн бичвэр болно. */
const specOf = (text: string): { label: string; detail: string } => {
  const m = text.match(SPEC_SPLIT);
  if (!m || m.index === undefined) {
    return text.length > LABEL_MAX ? { label: "", detail: text } : { label: text, detail: "" };
  }
  const label = text.slice(0, m.index).trim();
  const detail = text.slice(m.index + m[0].length).trim();
  return label.length > LABEL_MAX ? { label: "", detail: text } : { label, detail };
};

/** Зүүн багана — спек блок, суурь зураас, босоо хашлага гурав ЯГ нэг
 *  ирмэгээс эхэлж, нэг өргөнтэй болно. */
const COLUMN = "left-5 right-5 md:left-10 md:right-auto md:w-[min(46vw,34rem)]";
/** Суурь зураасны өндөр — блок үүнээс дээш суудаг. */
const RULE_BOTTOM = "bottom-[6vh] md:bottom-[7.5vh]";

export function MonoScrollStory({
  id,
  chapter,
  kicker,
  title,
  points,
  frameStart,
  frameEnd,
  frameDir = "/hero-frames",
  frameExt = "jpg",
  stillAt = 0.6,
  heightClass = "h-[300vh] md:h-[380vh]",
  exitVeilClass = "bg-ground",
  autoplaySeconds = 0,
  tone = "dark",
  bgKey,
  film,
}: {
  id?: string;
  /** Админаас дэвсгэрийг нь удирдах түлхүүр (`theme.sections`). */
  bgKey?: string;
  /** Кадрын ДЭЭР буух өнгөт хальс (`mediaFilmStyle`). Хэсгийн өөрийн
   *  `background` нь кадрын АРД сууж харагддаггүй тул админы «Өнгө /
   *  Градиент» сонголт эндээс л нүдэнд буунa. `undefined` = хальсгүй. */
  film?: MediaFilmStyle | null;
  /** Chapter index label, e.g. "01". */
  chapter: string;
  kicker: string;
  title: string;
  points: StoryPoint[];
  frameStart: number;
  frameEnd: number;
  /** Public folder holding the `frame_NNN` sequence. */
  frameDir?: string;
  frameExt?: string;
  /** Where in the sequence the mobile / reduced-motion still is taken from (0–1). */
  stillAt?: number;
  /** Section height — controls how much scroll each point gets. */
  heightClass?: string;
  /** Colour the chapter dips to on the way out — match the next section. */
  exitVeilClass?: string;
  /** Хэрэглэгчийн эхний гүйлтийн дараа бүлгийг өөрөө тоглуулах хугацаа
   *  (сек). 0 — автомат тоглолтгүй, зөвхөн гараар. */
  autoplaySeconds?: number;
  tone?: StoryTone;
}) {
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const layersWrap = useRef<HTMLDivElement>(null);
  const progFill = useRef<HTMLDivElement>(null);
  const st = useRef<ScrollTriggerType | null>(null);
  const prevActive = useRef(0);
  /** Progress window the points share, minus the intro / exit run-outs. */
  const slot = useRef({ lead: 0, span: 1 });
  const [active, setActive] = useState(0);

  /* Эхний гүйлтийн дараа бүлэг өөрөө үргэлжилнэ — 3 дэлгэц гүйлгэж
     байж дуусдаг бүлгийг гараар татах шаардлагагүй болно. */
  useScrollAutoplay({ trigger: st, seconds: autoplaySeconds });

  /** Jump the scroll so point `i` is centred in its own equal slice. */
  const goTo = (i: number) => {
    const t = st.current;
    if (!t) return;
    const { lead, span } = slot.current;
    const p = lead + ((i + 0.5) / points.length) * span;
    const target = t.start + p * (t.end - t.start);
    if (lenis) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  /* ---- canvas scrub + chapter intro/header choreography ------------- */
  useEffect(() => {
    const cvs = canvas.current;
    const sec = root.current;
    if (!cvs || !sec) return;
    const ctx2d = cvs.getContext("2d");
    if (!ctx2d) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const framePath = framePathIn(frameDir, frameExt);
    const count = frameEnd - frameStart + 1;
    const framesToLoad = !reduce && !isMobile ? count : 1;
    const images: HTMLImageElement[] = [];
    const state = { f: 0 };
    let loading = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = Math.round(cvs.clientWidth * dpr);
      cvs.height = Math.round(cvs.clientHeight * dpr);
    };
    const draw = () => {
      const img = images[Math.min(count - 1, Math.max(0, Math.round(state.f)))];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = cvs.width;
      const ch = cvs.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx2d.clearRect(0, 0, cw, ch);
      ctx2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };
    const load = () => {
      if (loading) return;
      loading = true;
      for (let i = 0; i < framesToLoad; i++) {
        const im = new Image();
        im.src = framePath(frameStart + (framesToLoad === 1 ? Math.floor(count * stillAt) : i));
        if (i === 0) im.onload = () => { resize(); draw(); };
        images.push(im);
      }
    };

    // defer frame downloads until the section is near the viewport
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load();
          io.disconnect();
        }
      },
      { rootMargin: "120% 0px" }
    );
    io.observe(sec);

    resize();
    const onResize = () => { resize(); draw(); };
    window.addEventListener("resize", onResize);

    /* The slice each point owns, expressed in pin progress. Recomputed on
       every update so a resize (or a refresh) can't desync it from goTo. */
    const pointSlot = () => {
      const travel = Math.max(1, sec.offsetHeight - window.innerHeight);
      const lead = Math.min(0.35, (window.innerHeight * INTRO_OUT) / travel);
      const tail = Math.min(0.25, (window.innerHeight * EXIT_IN) / travel);
      return { lead, span: Math.max(0.1, 1 - lead - tail) };
    };
    slot.current = pointSlot(); // rail clicks work before the first scroll

    const ctx = gsap.context(() => {
      const tween = gsap.to(state, {
        f: count - 1,
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
          onUpdate: (self) => {
            if (progFill.current) gsap.set(progFill.current, { scaleX: self.progress });
            const { lead, span } = pointSlot();
            slot.current = { lead, span };
            const t = (self.progress - lead) / span;
            const idx = Math.min(points.length - 1, Math.max(0, Math.floor(t * points.length)));
            setActive((prev) => (prev === idx ? prev : idx));
          },
        },
        onUpdate: draw,
      });
      st.current = tween.scrollTrigger ?? null;

      // chapter intro: big centred title → hands off to the corner header
      const introEl = sec.querySelector("[data-intro]");
      const headEl = sec.querySelector("[data-head]");
      const layersEl = sec.querySelector("[data-layers]");
      const railEl = sec.querySelector("[data-rail]");
      const chromeEl = sec.querySelector("[data-chrome]");
      /* Two veils: the chapter is entered out of the dark hero, but it
         exits into the light page ground — one shared black veil would
         flash to black right before a near-white section. */
      const veilInEl = sec.querySelector("[data-veil-in]");
      const veilOutEl = sec.querySelector("[data-veil-out]");
      if (reduce) {
        if (introEl) gsap.set(introEl, { autoAlpha: 0 });
        if (veilInEl) gsap.set(veilInEl, { autoAlpha: 0 });
        if (veilOutEl) gsap.set(veilOutEl, { autoAlpha: 0 });
      } else {
        if (introEl) {
          gsap.fromTo(
            introEl,
            { autoAlpha: 1, yPercent: 0, scale: 1 },
            {
              autoAlpha: 0,
              yPercent: -16,
              scale: 0.94,
              ease: "none",
              scrollTrigger: {
                trigger: sec,
                start: "top top",
                end: () => "+=" + window.innerHeight * 0.55,
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }
        if (headEl) {
          gsap.fromTo(
            headEl,
            { autoAlpha: 0, y: 16 },
            {
              autoAlpha: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: sec,
                start: () => "top+=" + window.innerHeight * INTRO_OUT + " top",
                end: () => "+=" + window.innerHeight * 0.25,
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }
        const enterEls = [layersEl, railEl, chromeEl].filter(Boolean) as Element[];
        if (enterEls.length) {
          gsap.fromTo(
            enterEls,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              ease: "none",
              scrollTrigger: {
                trigger: sec,
                start: () => "top+=" + window.innerHeight * INTRO_OUT + " top",
                end: () => "+=" + window.innerHeight * 0.2,
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        // chapter exit: content clears first, then the veil dips to black,
        // so the handoff to the next chapter is a seamless dark bridge.
        // The exit has to stay inside the last ~22% of the pin — start it
        // any earlier and the final point is wiped off screen almost as
        // soon as it becomes active.
        const exitEls = [layersEl, railEl, chromeEl, headEl].filter(Boolean) as Element[];
        if (exitEls.length) {
          gsap.fromTo(
            exitEls,
            { autoAlpha: 1, y: 0 },
            {
              autoAlpha: 0,
              y: -24,
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: sec,
                start: "bottom 122%",
                end: "bottom 106%",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }
        if (veilInEl) {
          gsap.fromTo(
            veilInEl,
            { autoAlpha: 1 },
            {
              autoAlpha: 0,
              ease: "none",
              scrollTrigger: {
                trigger: sec,
                start: "top top",
                end: () => "+=" + window.innerHeight * 0.45,
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }
        if (veilOutEl) {
          gsap.fromTo(
            veilOutEl,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: sec,
                start: "bottom 116%",
                end: "bottom 103%",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      }
    }, sec);

    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
      st.current = null;
      ctx.revert();
    };
  }, [frameStart, frameEnd, frameDir, frameExt, stillAt, points.length]);

  /* ---- point crossfade engine (no remounts) ------------------------- */
  useEffect(() => {
    const cont = layersWrap.current;
    if (!cont) return;
    const layers = Array.from(cont.querySelectorAll<HTMLElement>("[data-layer]"));
    if (!layers.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prev = prevActive.current;
    prevActive.current = active;

    layers.forEach((l, i) => {
      if (i !== active && i !== prev) gsap.set(l, { autoAlpha: 0 });
    });
    const incoming = layers[active];
    const outgoing = prev !== active ? layers[prev] : null;

    if (reduce) {
      if (outgoing) gsap.set(outgoing, { autoAlpha: 0 });
      gsap.set(incoming, { autoAlpha: 1, y: 0 });
      return;
    }

    if (outgoing) {
      gsap.to(outgoing, { autoAlpha: 0, y: -14, duration: 0.45, ease: "power2.inOut", overwrite: true });
    }
    gsap.set(incoming, { y: 0 });
    gsap.to(incoming, { autoAlpha: 1, duration: 0.5, ease: "power2.out", overwrite: true });

    // staggered children
    const kids = incoming.querySelectorAll("[data-sw]");
    if (kids.length) {
      gsap.fromTo(
        kids,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06, delay: 0.08, overwrite: true }
      );
    }
    /* char roll — тэмдэгтүүд нийтийн маскаас дээш мултарна.
       130% — маск нь глифийн орой таслахгүйн тулд дээр/доороо 0.12em
       нэмэлт зайтай (`.mono-stat-mask`), тиймээс 112% нь тэмдэгтийг
       бүрэн нуухад хүрэлцэхгүй болсон. */
    const chars = incoming.querySelectorAll("[data-ch]");
    if (chars.length) {
      gsap.fromTo(
        chars,
        { yPercent: 130 },
        { yPercent: 0, duration: 0.65, ease: "power4.out", stagger: 0.05, overwrite: true }
      );
    }
  }, [active]);

  /* Цайвар горимд зөвхөн scrim + бичгийн өнгө өөр: кадрууд хэвээрээ. */
  const light = tone === "light";
  /** Ногоон өргөлт — цайвар суурьт lime уусдаг тул гүн ногооноор. */
  const accentText = light ? "text-moss" : "text-lime";
  const hairline = light ? "bg-night/15" : "bg-white/18";
  const total = String(points.length).padStart(2, "0");

  return (
    <section
      id={id}
      ref={root}
      data-bg={bgKey}
      data-tone={tone}
      className={`relative ${light ? "bg-ground" : "bg-night"} ${heightClass}`}
    >
      <div className="sticky top-0 flex h-[100svh] min-h-[560px] w-full overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 z-0 h-full w-full" />

        {/* Хөшиг — ЗҮҮН тийш жинтэй шаантаг. Бичвэр бүхэлдээ зүүн баганад
            суудаг тул тодролыг ЯГ ТЭНД өгөөд, баруун тал (рендерийн гол
            дүр) бараг хөндөгдөхгүй үлдэнэ. Өмнө нь бүх дэлгэцийг дүүрэн
            шугаман хөшиг + голд радиал эллипс хоёр давхарлаж, кадрын
            голыг бүдгэрүүлдэг байв.
            Хөшгийн өнгө нь `charcoal` (#16280f) — брэндийн гүн ногоон:
            ELYS самбартай нэг л film ажиллаж, кадрууд хайнга саарал биш
            ногоон дор суудаг. Hero ЭНЭ ДҮРМЭЭС ГАДУУР — тэнд night хэвээр. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[5] ${
            light
              ? "bg-[linear-gradient(96deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.66)_30%,rgba(255,255,255,0.2)_58%,rgba(255,255,255,0)_86%)]"
              : "bg-[linear-gradient(96deg,rgba(22,40,15,0.88)_0%,rgba(22,40,15,0.62)_30%,rgba(22,40,15,0.18)_58%,rgba(22,40,15,0)_86%)]"
          }`}
        />
        {/* Дээд/доод зөөлөн хөшиг — булангийн толгой, рэйл, явцын зураас
            бүгд өөрийн сүүдэргүйгээр уншигдана. (Өмнө нь эдгээр жижиг
            бичгүүд тус бүрдээ `text-shadow`-той байсан нь 4 өөр утга
            болж тарсан.) */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[5] ${
            light
              ? "bg-gradient-to-t from-white/70 via-white/5 to-white/45"
              : "bg-gradient-to-t from-charcoal/72 via-charcoal/5 to-charcoal/50"
          }`}
        />

        {/* Админаас сонгосон дэвсгэр — кадрын ДЭЭР. Өгөгдмөл («Auto»)
            үед `null` буюу энэ давхарга огт үүсэхгүй. */}
        {film && (
          <div
            aria-hidden
            data-theme-film
            className="pointer-events-none absolute inset-0 z-[6]"
            style={film}
          />
        )}

        {/* entry veil — bridge in from the hero. Цайвар бүлэгт veil нь мөн
            цайвар: бараан hero-гоос цагаан руу нэг алхамд шилжинэ, эс бөгөөс
            бараан бичигтэй intro гарчиг хар veil дор уншигдахгүй. */}
        <div
          data-veil-in
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[7] ${light ? "bg-ground" : "bg-night"}`}
        />
        {/* exit veil — hands off to the light page ground */}
        <div data-veil-out aria-hidden className={`pointer-events-none absolute inset-0 z-[7] opacity-0 ${exitVeilClass}`} />

        {/* blueprint HUD — булангийн хаалт, тасархай тэнхлэг, спекийн
            хашлага. Хашлага ба суурь зураас нь `[data-chrome]` дотор
            БАЙНГА сууна: цэг бүрд дахин анивчихгүй. */}
        <div data-chrome aria-hidden className="pointer-events-none absolute inset-0 z-[6]">
          <span className={`absolute left-5 top-20 h-6 w-6 border-l border-t md:left-8 ${light ? "border-fg/25" : "border-white/25"}`} />
          <span className={`absolute right-5 top-20 h-6 w-6 border-r border-t md:right-8 ${light ? "border-fg/25" : "border-white/25"}`} />
          <span className={`absolute bottom-6 left-5 h-6 w-6 border-b border-l md:left-8 ${light ? "border-fg/25" : "border-white/25"}`} />
          <span className={`absolute bottom-6 right-5 h-6 w-6 border-b border-r md:right-8 ${light ? "border-fg/25" : "border-white/25"}`} />
          <span className={`absolute left-1/2 top-0 h-full border-l border-dashed ${light ? "border-fg/[0.08]" : "border-white/[0.07]"}`} />
          <span className={`absolute left-0 top-1/2 w-full border-t border-dashed ${light ? "border-fg/[0.08]" : "border-white/[0.07]"}`} />

          {/* спек блокийн босоо хашлага — «│» */}
          <span
            className={`absolute left-5 h-[26vh] w-px md:left-10 ${RULE_BOTTOM} ${
              light ? "bg-gradient-to-t from-night/20 to-transparent" : "bg-gradient-to-t from-white/28 to-transparent"
            }`}
          />
          {/* суурь зураас + явц — «└────── ▓▓▓░░░» */}
          <div className={`absolute ${COLUMN} ${RULE_BOTTOM}`}>
            <div className={`h-px w-full ${hairline}`}>
              <div ref={progFill} className={`h-px w-full origin-left scale-x-0 ${light ? "bg-moss" : "bg-lime"}`} />
            </div>
          </div>
        </div>

        {/* chapter intro — centred, scrubs away over the first half-screen.
            Өөрийн радиал хөшгийг АВЧ ЯВНА: гарчиг төвд байх богино
            хугацаанд л төв тодорч, дараа нь хамт бүдгэрнэ. */}
        <div
          data-intro
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[9] flex flex-col items-center justify-center px-6 text-center ${
            light
              ? "bg-[radial-gradient(ellipse_72%_54%_at_50%_50%,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0)_72%)]"
              : "bg-[radial-gradient(ellipse_72%_54%_at_50%_50%,rgba(22,40,15,0.62)_0%,rgba(22,40,15,0)_72%)]"
          }`}
        >
          <p className={`mono-hud ${accentText}`}>{chapter}</p>
          <p className="mono-hud mt-4 text-fg/55">{kicker}</p>
          {/* `<p>` — ЖИНХЭНЭ гарчиг нь доорх булангийн `<h2>`. Өмнө нь
              нэг `title` хоёр удаа `<h2>`-оор гарч, баримтын гарчгийн
              бүтэц давхардуулдаг байв. */}
          <p className="mono-chapter-title mt-5 max-w-3xl">{title}</p>
        </div>

        {/* persistent corner header — fades in as the intro leaves */}
        <div data-head className="absolute left-5 top-24 z-10 md:left-10 md:top-28">
          <MonoKicker tone={light ? "light" : "dark"}>
            {chapter} — {kicker}
          </MonoKicker>
          <h2 className="mono-chapter-head mt-3">{title}</h2>
        </div>

        {/* point layers — GSAP crossfade between quarters */}
        <div ref={layersWrap} data-layers className="pointer-events-none absolute inset-0 z-[8]">
          {points.map((p, i) => {
            const { label, detail } = specOf(p.text);
            const fit = statFit(p.heading, p.accent);
            return (
              <div key={p.n} data-layer className={`absolute inset-0 ${i === 0 ? "" : "opacity-0"}`}>
                <div className={`absolute bottom-[11vh] md:bottom-[13vh] ${COLUMN}`}>
                  <div className="pl-5 md:pl-6">
                    <p data-sw className="mono-hud text-fg/55">
                      {p.n} <span className="opacity-40">/</span> {total}
                    </p>

                    <p
                      className="mono-stat mt-4 text-fg"
                      style={{ "--stat-fit": fit } as CSSProperties}
                    >
                      {/* Дэлгэц уншигчид бүтэн утгыг нэг мөрөөр өгнө —
                          доорх тэмдэгтүүд нь зөвхөн анимацийн маск. */}
                      <span className="sr-only">
                        {p.heading}
                        {p.accent}
                      </span>
                      {/* Цифр ба хэмжих нэгж НЭГ маск дотор — суурь
                          шугам нь энгийн инлайн урсгалаар өөрөө таарна. */}
                      <span aria-hidden className="mono-stat-mask">
                        {[...p.heading].map((c, ci) => (
                          <span key={ci} data-ch className="mono-stat-char">
                            {/* NBSP — инлайн-блок доторх зай агшихгүй */}
                            {c === " " ? "\u00A0" : c}
                          </span>
                        ))}
                        {p.accent && (
                          <span data-ch className={`mono-stat-unit ${accentText}`}>
                            {p.accent}
                          </span>
                        )}
                      </span>
                    </p>

                    {label && (
                      <p data-sw className="mono-stat-label mt-5 text-fg">
                        {label}
                      </p>
                    )}
                    {detail && (
                      <p data-sw className={`mono-stat-detail text-fg/70 ${label ? "mt-2" : "mt-5"}`}>
                        {detail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* clickable point rail — jump to any point (desktop).
            `translate-y-1/2` — 44px товчнуудын ТӨВ нь суурь зураасны
            шугам дээр яг таарна. */}
        <div
          data-rail
          className={`absolute right-10 z-10 hidden translate-y-1/2 items-center gap-1.5 md:flex ${RULE_BOTTOM}`}
        >
          {points.map((p, i) => (
            <Fragment key={p.n}>
              {i > 0 && (
                <span
                  aria-hidden
                  className={`h-px w-6 transition-colors duration-500 ${
                    i <= active ? (light ? "bg-moss/60" : "bg-lime/70") : hairline
                  }`}
                />
              )}
              {/* min-h/w-11 — 44px хүрэх талбай (таблет дээр ч хуруугаар
                  дарагдана); харагдах тэмдэг нь жижигхэн хэвээр. */}
              <button
                type="button"
                onClick={() => goTo(i)}
                data-cursor-hover
                aria-label={`${p.n} — ${p.heading}`}
                aria-current={active === i}
                className={`mono-hud inline-flex min-h-11 min-w-8 items-center justify-center transition-all duration-300 ${
                  active === i
                    ? `${accentText} scale-125`
                    : "text-fg/40 hover:text-fg/80"
                }`}
              >
                {p.n}
              </button>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
