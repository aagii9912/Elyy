"use client";

/* / — Intro. Захиалагчийн 30 секундын клип — цамхагууд үүр цайхаас нар
   жаргах хүртэл — ДАВТАГДАН тоглоно.

   ХОЁР ДАВХАРГАТ ВИДЕО — «бичиг блокуудын ард» эффект:
     z-0  арын постер (SSR-ээс)
     z-1  арын видео          hero-loop-*.mp4      (хот, тэнгэр, блокууд)
     z-2  ГАРЧИГ              «ELYSIUM RESIDENCE» — блокуудын АРД
     z-3  урд блокуудын alpha видео  hero-fg-*.webm / .mov (+ .webp постер)
     z-6  админы өнгөт хальс
     z-10 бусад бичиг (kicker, тайлбар, товчнууд) — бүгдийн урд.

   Урд давхарга нь нэг timeline-аас ногоон дэвсгэртэй экспортолсон
   4 блокийг chroma key хийсэн alpha видео (`scripts/build-hero-layers.mjs`).
   Хоёр видео ижил кадртай тул хамт тоглуулж, `requestAnimationFrame`
   дээр урдынхыг арынхтай нь синк барина (өөр тоглуулагч тул удаан
   давталтад бага зэрэг зөрж болзошгүй).

   Alpha видео: Chrome/Firefox/Android → VP9 WebM; Safari/iOS → HEVC
   `.mov` (hvc1, alpha SEI). `<source>` дараалал: mov эхэнд — Chrome
   video/quicktime тоглуулдаггүй тул webm руу унана; Safari VP9 alpha
   дэмждэггүй тул mov-оо авна.

   Гарчиг нь ХОЁР удаа рендерлэгдэнэ: z-2 давхаргад харагдах хувь,
   z-10 давхаргад үл үзэгдэх (`invisible`) хувь — kicker/тайлбар/
   товчны байрлалыг яг ижил layout-аар тогтооно (`HeroCopy`).

   ХОЁР ЭХ ФАЙЛ, нэгийг нь л татна:
     • веб (≥768px)  → *-desktop (1920×1080),
     • гар утас      → *-mobile  (1080×1920) — төвийн 9:16 кроп.
   Сонголтыг matchMedia хийх тул хөтөч хоёуланг нь татахгүй; постер
   зураг нь `<picture media>`-ээр мөн адил.

   Урсгал: постерууд (SSR-ээс эхлэн) → хоёр клип ХОЁУЛАА тоглож эхэлмэгц
   дээр нь зөөлөн гарч ирнэ. prefers-reduced-motion / Data Saver үед клип
   ОГТ татагдахгүй, постерууд л үлдэнэ (эффект хэвээр — cutout постер
   гарчгийн урд); iOS-ийн Low Power Mode шиг авто-тоглолт няцаагдсан
   тохиолдолд ч мөн адил.

   Клипүүдийг дахин хөрвүүлэх: `node scripts/build-hero-layers.mjs`. */

import { Fragment, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import type { SiteContent } from "@/lib/site-content";
import { BrochureButton } from "./MonoBrochure";
import { sectionTone } from "@/lib/theme-css";

const CLIP = {
  desktop: {
    src: "/video/hero-loop-desktop.mp4",
    poster: "/video/hero-loop-desktop.jpg",
    fgMov: "/video/hero-fg-desktop.mov",
    fgWebm: "/video/hero-fg-desktop.webm",
    fgPoster: "/video/hero-fg-desktop.webp",
  },
  mobile: {
    src: "/video/hero-loop-mobile.mp4",
    poster: "/video/hero-loop-mobile.jpg",
    fgMov: "/video/hero-fg-mobile.mov",
    fgWebm: "/video/hero-fg-mobile.webm",
    fgPoster: "/video/hero-fg-mobile.webp",
  },
} as const;

/** Урд давхарга арынхаас энэ хэмжээнээс их зөрвөл дахин тааруулна (сек).
 *  Кадр 1/24 ≈ 0.042 — нэг кадрын зөрүү ирмэг дээр мэдэгдэхгүй. */
const SYNC_TOLERANCE = 0.06;

/** Tailwind-ийн `md` — постерын `<picture media>`-тэй ЯГ ижил байх ёстой,
 *  эс бөгөөс постер нэг клип, видео нөгөөг нь татна. */
const DESKTOP_QUERY = "(min-width: 768px)";

/** `still` — хөдөлгөөнгүй горим: клип татахгүй, зөвхөн постер. */
type Variant = "still" | keyof typeof CLIP;

export function MonoHero({ site }: { site: SiteContent }) {
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const fgVideo = useRef<HTMLVideoElement>(null);
  /** Аль клип тоглох вэ — сервер дээр мэдэгдэхгүй тул эхэндээ `null`. */
  const [variant, setVariant] = useState<Variant | null>(null);
  /** Клипүүд ҮНЭХЭЭР тоглож эхэлсэн үү — хоёулаа эхэлмэгц постерын
   *  дээр гарна (нэг нь л гарвал хөдөлгөөнт ар + хөдөлгөөнгүй блок
   *  зөрнө). */
  const [bgPlaying, setBgPlaying] = useState(false);
  const [fgPlaying, setFgPlaying] = useState(false);
  const playing = bgPlaying && fgPlaying;

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -70 });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  /* Клипийн сонголт. Дэлгэц эргэх / цонх сунгахад breakpoint давбал
     нөгөө клип рүү шилжинэ (`key={variant}`-аар дахин mount хийгдэнэ). */
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    /* Data Saver горимд видео чанартай зүйл татахгүй — постер хангалттай. */
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    const still =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || Boolean(conn?.saveData);

    const apply = () => setVariant(still ? "still" : mq.matches ? "desktop" : "mobile");
    apply();
    mq.addEventListener("change", apply);

    return () => mq.removeEventListener("change", apply);
  }, []);

  /* Таб далд болоход хөтөч клипийг зогсоодог бөгөөд буцаж ирэхэд
     үргэлж өөрөө үргэлжлүүлдэггүй. Ил гармагц хоёуланг нь дахин
     эхлүүлнэ. */
  useEffect(() => {
    const resume = () => {
      if (document.hidden) return;
      for (const v of [video.current, fgVideo.current]) {
        if (v && v.paused) void v.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", resume);
    return () => document.removeEventListener("visibilitychange", resume);
  }, []);

  /* Урд давхаргыг арынхтай синк барих. Хоёр `<video>` тус тусдаа
     цагтай тул давталт бүрд хэдэн мс зөрж хуримтлагдана — кадр бүрд
     шалгаж, хязгаараас хэтэрвэл урдынхыг арынх руу үсэргэнэ. */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const bg = video.current;
      const fg = fgVideo.current;
      if (bg && fg && !bg.paused && fg.readyState >= 2) {
        const drift = fg.currentTime - bg.currentTime;
        if (Math.abs(drift) > SYNC_TOLERANCE) fg.currentTime = bg.currentTime;
        if (fg.paused) void fg.play().catch(() => {});
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  /* Гүйлгэж эхлэхэд hero-гийн бичиг зөөлөн бүдгэрнэ. */
  useEffect(() => {
    const sec = root.current;
    if (!sec) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to("[data-mh-copy]", {
        opacity: 0,
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: true },
      });
    }, sec);

    return () => ctx.revert();
  }, []);

  const clip = variant && variant !== "still" ? CLIP[variant] : null;

  return (
    <section
      id="top"
      ref={root}
      data-bg="hero"
      data-tone={sectionTone(site.theme, "hero", "dark")}
      className="relative h-[100svh] min-h-[620px] w-full bg-night"
    >
      <div className="relative flex h-full w-full overflow-hidden">
        {/* Постер — эхний кадар. Клип ирэх хүртэл, мөн хөдөлгөөнгүй
            горимд энэ л харагдана. `media` нь видеоны matchMedia-тай
            ижил тул хоёр зургийн зөвхөн НЭГ нь татагдана. */}
        <picture>
          <source media={DESKTOP_QUERY} srcSet={CLIP.desktop.poster} />
          <img
            src={CLIP.mobile.poster}
            alt=""
            aria-hidden
            fetchPriority="high"
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
        </picture>

        {clip && (
          <video
            key={variant}
            ref={video}
            src={clip.src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            tabIndex={-1}
            onPlaying={() => setBgPlaying(true)}
            onCanPlay={(e) => {
              /* Нуугдсан таб дээр авто-тоглолт хойшлогддог — бэлэн
                 болмогц дахин оролдоно. Няцаагдвал постер үлдэнэ. */
              void e.currentTarget.play().catch(() => {});
            }}
            className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-700 ease-out ${
              playing ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* ГАРЧИГ — арын видео болон урд блокуудын ХООРОНД. Зөвхөн h1
            харагдана; бусад нь байрлалын placeholder (`HeroCopy`). */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[2] px-6">
          <HeroCopy site={site} mode="title" go={go} />
        </div>

        {/* УРД БЛОКУУД — alpha cutout. Постер (webp) нь клип ирэх хүртэл,
            мөн хөдөлгөөнгүй горимд; клип нь хоёулаа тоглосны дараа. */}
        <picture>
          <source media={DESKTOP_QUERY} srcSet={CLIP.desktop.fgPoster} type="image/webp" />
          <img
            src={CLIP.mobile.fgPoster}
            alt=""
            aria-hidden
            fetchPriority="high"
            className={`absolute inset-0 z-[3] h-full w-full object-cover transition-opacity duration-700 ease-out ${
              playing ? "opacity-0" : "opacity-100"
            }`}
          />
        </picture>
        {clip && (
          <video
            key={`fg-${variant}`}
            ref={fgVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            tabIndex={-1}
            onPlaying={() => setFgPlaying(true)}
            onCanPlay={(e) => {
              void e.currentTarget.play().catch(() => {});
            }}
            className={`absolute inset-0 z-[3] h-full w-full object-cover transition-opacity duration-700 ease-out ${
              playing ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Safari/iOS — HEVC alpha; бусад — VP9 alpha. Дарааллыг бүү соль. */}
            <source src={clip.fgMov} type='video/quicktime; codecs="hvc1"' />
            <source src={clip.fgWebm} type='video/webm; codecs="vp9"' />
          </video>
        )}

        {/* Бараан хөшиг ЗОРИУДААР байхгүй — клип бүрэн өнгөөрөө
            харагдана. Бичгийн уншигдац нь үсгэн дээрх сүүдрээр
            (`drop-shadow`) л барина. */}

        {/* Админаас сонгосон дэвсгэр — клипийн ДЭЭР буух өнгөт хальс.
            Хэсгийн `background` нь бичлэгийн АРД сууж харагддаггүй тул
            «Өнгө / Градиент» сонголт эндээс л нүдэнд буунa.

            Элемент нь ҮРГЭЛЖ рендерлэгдэнэ, өнгийг нь `buildThemeCss`
            (`[data-bg="hero"] [data-theme-film]`) өгнө. Өгөгдмөл
            («Auto») үед дүрэм үүсэхгүй тул давхарга тунгалаг үлдэж,
            hero нэг ч пиксел хөдлөхгүй. */}
        <div aria-hidden data-theme-film className="pointer-events-none absolute inset-0 z-[6]" />

        {/* Бичгийн давхарга — kicker, тайлбар, товчнууд; гарчиг нь
            энд үл үзэгдэх placeholder (дээрх z-2 давхаргад харагдана). */}
        <div data-mh-copy className="relative z-10 flex h-full w-full flex-col items-center px-6">
          <HeroCopy site={site} mode="copy" go={go} />
        </div>

        <div className="mono-float absolute bottom-7 left-1/2 z-10 h-9 w-px -translate-x-1/2 bg-white/50" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Hero-гийн бичиг — ХОЁР удаа рендерлэгдэнэ (дээрх тайлбарыг үз):     */
/*   title → зөвхөн гарчиг харагдана (блокуудын ард),                  */
/*   copy  → гарчиг placeholder, бусад нь харагдана (бүгдийн урд).     */
/* Хоёулаа яг ижил layout класстай байх ёстой — гарчгийн байрлал      */
/* хоёр давхаргад пикселийн нарийвчлалтай давхцана.                    */
/* ------------------------------------------------------------------ */

function HeroCopy({
  site,
  mode,
  go,
}: {
  site: SiteContent;
  mode: "title" | "copy";
  go: (e: React.MouseEvent, href: string) => void;
}) {
  const { brand, hero, nav } = site;
  const title = mode === "title";
  /** Гарчгаас бусад — гарчгийн давхаргад үл үзэгдэнэ. */
  const rest = title ? "invisible" : "";
  const restStyle = (delay: string) => (title ? undefined : { animationDelay: delay });

  return (
    <div className="flex h-full w-full flex-col items-center">
      {/* Бүлгийг дээш — гарчиг блокуудын ОРОЙН түвшинд (тэнгэрийн урд,
          блокуудын ард) суух ёстой; төвд байвал блокууд бүрэн халхална. */}
      <div className="flex flex-1 -translate-y-[7vh] flex-col items-center justify-center text-center">
        <p
          className={`mono-fade-up mb-5 text-label font-semibold uppercase tracking-caps-xl text-lime drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] md:mb-6 md:text-xs ${rest}`}
          style={restStyle("0.4s")}
        >
          {brand.tag}
        </p>
        {/* `mono-h1-hero` — блокуудын ард суух тул ердийн h1-ээс том,
            зузаан, веб дээр нэг мөр. Хоёр давхаргад ижил. */}
        <h1
          className={`mono-h1 mono-h1-hero text-white ${title ? "" : "invisible"}`}
          aria-hidden={title || undefined}
        >
          {/* word-by-word mask rise */}
          {brand.line.split(" ").map((word, i) => (
            <Fragment key={`${word}-${i}`}>
              {i > 0 && " "}
              <span className="mono-word">
                <span style={{ animationDelay: `${0.5 + i * 0.09}s` }}>{word}</span>
              </span>
            </Fragment>
          ))}
        </h1>
        <p
          className={`mono-fade-up mt-5 max-w-md text-lead font-medium leading-relaxed text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.5)] md:text-base ${rest}`}
          style={restStyle("0.7s")}
        >
          {hero.sub}
        </p>
      </div>

      <div
        className={`flex w-full flex-col items-center gap-3.5 pb-[8vh] sm:w-auto sm:flex-row sm:justify-center sm:gap-4 ${
          title ? "invisible" : "pointer-events-auto"
        }`}
      >
        <a
          href="#contact"
          onClick={(e) => go(e, "#contact")}
          data-cursor-hover={title ? undefined : true}
          tabIndex={title ? -1 : undefined}
          className="mono-fade-up inline-flex w-full items-center justify-center gap-2 rounded-[50px] bg-white px-6 py-4 text-sm font-bold uppercase tracking-display text-fg transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
          style={restStyle("0.85s")}
        >
          {nav.ctaLabel}
        </a>
        <span className="mono-fade-up w-full sm:w-auto" style={restStyle("1s")}>
          {title ? (
            /* Placeholder — BrochureButton нь pop-up төлөвтэй тул давхардуулахгүй. */
            <span className="glass-dark inline-flex w-full items-center justify-center gap-2 rounded-[50px] px-6 py-4 text-sm font-medium uppercase tracking-display text-white sm:w-auto">
              {nav.brochureLabel}
            </span>
          ) : (
            <BrochureButton
              site={site}
              source="elysium/mono#hero"
              className="glass-dark inline-flex w-full items-center justify-center gap-2 rounded-[50px] px-6 py-4 text-sm font-medium uppercase tracking-display text-white transition-colors duration-300 hover:bg-white/15 sm:w-auto"
            >
              {nav.brochureLabel}
            </BrochureButton>
          )}
        </span>
      </div>
    </div>
  );
}
