"use client";

/* / — Intro. Захиалагчийн 10 секундын клип — Улаанбаатарын хөндлөнгөөс
   харагдах цамхагууд — ДАВТАГДАН тоглоно.

   Өмнө нь энэ хэсэг 160 WebP кадрыг canvas дээр нэг удаа гүйлгэж
   (timelapse) сүүлийн кадар дээрээ зогсдог байсан. Одоо жинхэнэ mp4:
   гүйлт ч, canvas ч, зогсох цэг ч байхгүй — хуудас нээлттэй байх
   хугацаанд тасралтгүй эргэлдэнэ.

   ХОЁР ЭХ ФАЙЛ, нэгийг нь л татна:
     • веб (≥768px)  → hero-loop-desktop.mp4 (1920×980),
     • гар утас      → hero-loop-mobile.mp4  (1080×1820).
   Босоо дэлгэц дээр хэвтээ клипийг кроп хийхгүй — захиалагч тус бүрд нь
   тохируулж зассан. Сонголтыг matchMedia хийх тул хөтөч хоёуланг нь
   татахгүй; постер зураг нь `<picture media>`-ээр мөн адил.

   Урсгал: постер (SSR-ээс эхлэн) → клип бэлэн болмогц дээр нь зөөлөн
   гарч ирнэ. prefers-reduced-motion / Data Saver үед клип ОГТ татагдахгүй,
   постер л үлдэнэ; iOS-ийн Low Power Mode шиг авто-тоглолт няцаагдсан
   тохиолдолд ч мөн адил (`playing` эвент ирэхгүй тул клип ил гарахгүй).

   Клипүүдийг дахин хөрвүүлэх: `node scripts/build-section-videos.mjs hero`. */

import { Fragment, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import type { SiteContent } from "@/lib/site-content";
import { BrochureButton } from "./MonoBrochure";
import { mediaFilmStyle, sectionTone } from "@/lib/theme-css";

const CLIP = {
  desktop: { src: "/video/hero-loop-desktop.mp4", poster: "/video/hero-loop-desktop.jpg" },
  mobile: { src: "/video/hero-loop-mobile.mp4", poster: "/video/hero-loop-mobile.jpg" },
} as const;

/** Tailwind-ийн `md` — постерын `<picture media>`-тэй ЯГ ижил байх ёстой,
 *  эс бөгөөс постер нэг клип, видео нөгөөг нь татна. */
const DESKTOP_QUERY = "(min-width: 768px)";

/** `still` — хөдөлгөөнгүй горим: клип татахгүй, зөвхөн постер. */
type Variant = "still" | keyof typeof CLIP;

export function MonoHero({ site }: { site: SiteContent }) {
  const { brand, hero, nav } = site;
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  /** Аль клип тоглох вэ — сервер дээр мэдэгдэхгүй тул эхэндээ `null`. */
  const [variant, setVariant] = useState<Variant | null>(null);
  /** Клип ҮНЭХЭЭР тоглож эхэлсэн үү — тэр үед л постерын дээр гарна. */
  const [playing, setPlaying] = useState(false);

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
     үргэлж өөрөө үргэлжлүүлдэггүй. Ил гармагц дахин эхлүүлнэ. */
  useEffect(() => {
    const resume = () => {
      const v = video.current;
      if (!v || document.hidden || !v.paused) return;
      void v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", resume);
    return () => document.removeEventListener("visibilitychange", resume);
  }, []);

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

  const film = mediaFilmStyle(site.theme, "hero");
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
            onPlaying={() => setPlaying(true)}
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

        {/* Бараан хөшиг ЗОРИУДААР байхгүй — клип бүрэн өнгөөрөө
            харагдана. Бичгийн уншигдац нь үсгэн дээрх сүүдрээр
            (`drop-shadow`) л барина. */}

        {/* Админаас сонгосон дэвсгэр — клипийн ДЭЭР буух өнгөт хальс.
            Хэсгийн `background` нь бичлэгийн АРД сууж харагддаггүй тул
            «Өнгө / Градиент» сонголт эндээс л нүдэнд буунa. Өгөгдмөл
            («Auto») үед `null` — hero нэг ч пиксел хөдлөхгүй. */}
        {film && (
          <div
            aria-hidden
            data-theme-film
            className="pointer-events-none absolute inset-0 z-[6]"
            style={film}
          />
        )}

        <div data-mh-copy className="relative z-10 flex h-full w-full flex-col items-center px-6">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="mono-fade-up mb-5 text-[11px] font-semibold uppercase tracking-[0.42em] text-lime md:mb-6 md:text-[12px]" style={{ animationDelay: "0.4s" }}>
              {brand.tag}
            </p>
            <h1 className="mono-h1 text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.4)]">
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
            <p className="mono-fade-up mt-5 max-w-md text-[15px] font-medium leading-relaxed text-white/80 md:text-base" style={{ animationDelay: "0.7s" }}>
              {hero.sub}
            </p>
          </div>

          <div className="pointer-events-auto flex w-full flex-col items-center gap-3.5 pb-[8vh] sm:w-auto sm:flex-row sm:justify-center sm:gap-4">
            <a
              href="#contact"
              onClick={(e) => go(e, "#contact")}
              data-cursor-hover
              className="mono-fade-up inline-flex w-full items-center justify-center gap-2 rounded-[50px] bg-white px-6 py-4 text-[14px] font-bold uppercase tracking-[-0.2px] text-fg transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
              style={{ animationDelay: "0.85s" }}
            >
              {nav.ctaLabel}
            </a>
            <span className="mono-fade-up w-full sm:w-auto" style={{ animationDelay: "1s" }}>
              <BrochureButton
                site={site}
                source="elysium/mono#hero"
                className="glass-dark inline-flex w-full items-center justify-center gap-2 rounded-[50px] px-6 py-4 text-[14px] font-medium uppercase tracking-[-0.2px] text-white transition-colors duration-300 hover:bg-white/15 sm:w-auto"
              >
                {nav.brochureLabel}
              </BrochureButton>
            </span>
          </div>
        </div>

        <div className="mono-float absolute bottom-7 left-1/2 z-10 h-9 w-px -translate-x-1/2 bg-white/50" />
      </div>
    </section>
  );
}
