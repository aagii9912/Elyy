"use client";

/* /mono — Intro. Захиалагчийн клип — өдрийн цэлмэг тэнгэрт өндөрлөх
   цамхагууд — 160 WebP кадр болгож хөрвүүлсэн.

   Кадрууд нь ӨӨРӨӨ timelapse байдлаар тоглоно: хуудас нээмэгц эхэлж,
   ~7 секундэд бүрэн барилга хүртэл гүйгээд сүүлийн кадр дээрээ зогсоно.
   (Өмнө нь гүйлтэнд уягдсан байсан тул ачаалахад ХООСОН тэнгэр
   харагддаг, барилга харахын тулд доош гүйлгэх шаардлагатай байв.)

   Ачаалалт удаан үед playhead нь зөвхөн БЭЛЭН болсон кадр хүртэл явна —
   тиймээс алгасалт үүсэхгүй, зүгээр л жаахан удаан тоглоод гүйцнэ.

   Кадрын багцыг дахин үүсгэх: `node scripts/build-scroll-frames.mjs hero`. */

import { Fragment, useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import type { SiteContent } from "@/lib/site-content";
import { Logo } from "@/components/Logo";
import { BrochureButton } from "./MonoBrochure";
import { sectionTone } from "@/lib/theme-css";

const FRAME_COUNT = 160;
const framePath = (i: number) => `/hero-video-frames/frame_${String(i).padStart(3, "0")}.webp`;
/** Хөдөлгөөн унтраасан / өгөгдөл хэмнэх горимд харуулах ганц кадр. */
const STILL_FRAME = 132;
/** Эхнээс дуустал тоглох хугацаа (сек). */
const PLAY_SECONDS = 7;
/** Гар утсанд кадрыг сийрэгжүүлнэ — 160 кадр ≈ 5.4MB нь хэт хүнд.
 *  3 дахин сийрэгжүүлэхэд ~1.8MB болж, timelapse мэдрэмж хэвээр үлдэнэ. */
const MOBILE_STEP = 3;

export function MonoHero({ site }: { site: SiteContent }) {
  const { brand, hero, nav } = site;
  /* Логон дор гарах хэсэг — нэрийн ЭХНИЙ үг нь лого өөрөө (ELYSIUM),
     үлдсэн нь («Residence») зайтай том үсгээр доор нь суудаг. */
  const wordmark = hero.wordmark;
  const rest = brand.line.trim().split(/\s+/).slice(1).join(" ");
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -70 });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const cvs = canvas.current;
    const sec = root.current;
    if (!cvs || !sec) return;
    const ctx2d = cvs.getContext("2d");
    if (!ctx2d) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    /* Data Saver горимд видео чанартай зүйл татахгүй — ганц кадр хангалттай. */
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    const stillOnly = reduce || Boolean(conn?.saveData);

    /* Тоглуулах кадрын дугаарууд. Сүүлийн кадрыг үргэлж оруулна —
       эс бөгөөс бүрэн барилга дээр зогсохгүй. */
    const numbers: number[] = [];
    if (stillOnly) {
      numbers.push(STILL_FRAME);
    } else {
      const step = isMobile ? MOBILE_STEP : 1;
      for (let i = 1; i <= FRAME_COUNT; i += step) numbers.push(i);
      if (numbers[numbers.length - 1] !== FRAME_COUNT) numbers.push(FRAME_COUNT);
    }

    const images = numbers.map((n) => {
      const im = new Image();
      im.decoding = "async";
      im.src = framePath(n);
      return im;
    });

    /* Эхнээс нь ХЭДЭН кадр ДАРААЛАН бэлэн болсныг тоолно. Playhead
       үүнээс цааш явахгүй тул алгасалт гарахгүй. */
    let ready = 0;
    const markReady = () => {
      while (ready < images.length && images[ready].complete && images[ready].naturalWidth) {
        ready += 1;
      }
    };

    let cursor = 0; // бутархай кадрын байрлал

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = Math.round(cvs.clientWidth * dpr);
      cvs.height = Math.round(cvs.clientHeight * dpr);
    };

    const draw = () => {
      const img = images[Math.min(images.length - 1, Math.max(0, Math.round(cursor)))];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = cvs.width;
      const ch = cvs.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx2d.clearRect(0, 0, cw, ch);
      ctx2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    resize();
    const onResize = () => {
      resize();
      draw();
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let last = 0;
    const fps = images.length > 1 ? (images.length - 1) / PLAY_SECONDS : 0;

    const tick = (t: number) => {
      if (!last) last = t;
      /* Таб далд байгаад буцаж ирэхэд нэг дор үсрэхээс сэргийлж
         алхмыг хязгаарлана. */
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;

      markReady();
      const loadedMax = Math.max(0, ready - 1);
      cursor = Math.min(cursor + dt * fps, loadedMax, images.length - 1);
      draw();

      if (cursor >= images.length - 1) return; // дууслаа — сүүлийн кадр дээр зогсоно
      raf = requestAnimationFrame(tick);
    };

    if (stillOnly) {
      images[0].onload = () => {
        resize();
        draw();
      };
      if (images[0].complete) {
        markReady();
        draw();
      }
    } else {
      raf = requestAnimationFrame(tick);
    }

    /* Гүйлгэж эхлэхэд hero-гийн бичиг зөөлөн бүдгэрнэ. */
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.to("[data-mh-copy]", {
          opacity: 0,
          yPercent: -8,
          ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: true },
        });
      }
    }, sec);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="top"
      ref={root}
      data-bg="hero"
      data-tone={sectionTone(site.theme, "hero", "dark")}
      className="relative h-[100svh] min-h-[620px] w-full bg-night"
    >
      <div className="relative flex h-full w-full overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 z-0 h-full w-full" />
        {/* Шинэ кадрууд өдрийн цэлмэг тэнгэртэй — өмнөх нар жаргах клипээс
            хамаагүй цайвар тул цагаан бичиг дан дээр нь уншигдахгүй. Хоёр
            давхар хөшиг: дээд/доод шугаман (толгой ба товчнуудад) + бичгийн
            ард нэг зөөлөн эллипс. Ингэснээр кадрын ирмэг гэгээлэг хэвээр
            үлдэж, зөвхөн бичгийн доод тал бараантана. */}
        <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-night/45 via-night/8 to-night/60" />
        <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_80%_58%_at_50%_44%,rgba(21,23,23,0.48)_0%,rgba(21,23,23,0.26)_46%,transparent_74%)]" />
        {/* Гарчгийн лого-блокийн ард ЗӨВХӨН тэр хэсэгт нь нэмэлт хөшиг.
            Бүх кадрыг харанхуйлахын оронд нарийн эллипс нэмснээр зургийн
            ирмэг гэгээлэг хэвээр үлдэнэ.

            §Контраст. Бичгийн СҮҮДРИЙГ авсан (сүүдэр нь хямдын шинж)
            тул уншигдацыг зөвхөн хөшиг хангана. 1440×900 дээр бичгийг
            нууж, дэвсгэрийн хамгийн цайвар 5%-иар хэмжсэн WCAG харьцаа:
              • лого (том бичвэр, босго 3:1) : 7.93 : 1,
              • RESIDENCE  (4.5:1)           : 5.55 : 1,
              • шошго      (4.5:1)           : 7.02 : 1,
              • тайлбар    (4.5:1)           : 6.31 : 1.
            Энэ эллипсгүйгээр RESIDENCE 3.70:1 болж УНАДАГ. Хөшгийг
            сулруулах, эсвэл бичгийн alpha-г бууруулбал ДАХИН хэмжинэ. */}
        <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_44%_24%_at_50%_36%,rgba(21,23,23,0.34)_0%,rgba(21,23,23,0.18)_52%,transparent_78%)]" />

        <div data-mh-copy className="relative z-10 flex h-full w-full flex-col items-center px-6">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            {/* Шошго — лайм нь БҮТЭН хүчээрээ дээд талд байхад анхаарал
                сарниулж, тансаглалыг бууруулдаг. Одоо бичиг нь тайван
                цагаан, лайм нь хоёр талын нимгэн зураас болж үлдэнэ. */}
            <p
              className="mono-fade-up mb-6 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.4em] text-white/60 md:mb-8 md:text-[12px]"
              style={{ animationDelay: "0.4s" }}
            >
              <span aria-hidden className="hidden h-px w-7 bg-lime sm:block" />
              {brand.tag}
              <span aria-hidden className="hidden h-px w-7 bg-lime sm:block" />
            </p>

            {wordmark ? (
              /* Брэндийн ЖИНХЭНЭ лого нь гарчиг. Толгой дахь лого болон
                 hero нэг ижил үсгэн зурагтай болж брэнд нэгдэнэ; мөн
                 фонтоос хамаарахгүй тул хэзээ ч зөрөхгүй.
                 Бичгийн сүүдэр АВСАН — сүүдэр нь хямдын шинж, уншигдацыг
                 хөшиг өөрөө хангана. */
              <h1 className="flex flex-col items-center text-white">
                <span className="sr-only">{brand.line}</span>
                <span
                  aria-hidden
                  className="mono-fade-up block w-full max-w-[min(78vw,620px)]"
                  style={{ animationDelay: "0.5s" }}
                >
                  <Logo className="h-auto w-full" />
                </span>
                {rest && (
                  <span
                    aria-hidden
                    className="mono-fade-up mt-5 block text-[clamp(0.8rem,1.5vw,0.95rem)] font-normal uppercase leading-none tracking-[0.62em] text-white md:mt-6"
                    style={{ animationDelay: "0.62s", textIndent: "0.62em" }}
                  >
                    {rest}
                  </span>
                )}
              </h1>
            ) : (
              <h1 className="mono-h1 text-white">
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
            )}

            <span
              aria-hidden
              className="mono-fade-up mt-10 block h-px w-16 bg-white/25 md:mt-12"
              style={{ animationDelay: "0.72s" }}
            />
            <p
              className="mono-fade-up mt-8 max-w-[54ch] text-[15px] font-normal leading-[1.75] text-white/80 md:text-base"
              style={{ animationDelay: "0.8s" }}
            >
              {hero.sub}
            </p>
          </div>

          <div className="pointer-events-auto flex w-full flex-col items-center gap-3.5 pb-[8vh] sm:w-auto sm:flex-row sm:justify-center sm:gap-4">
            <a
              href="#contact"
              onClick={(e) => go(e, "#contact")}
              data-cursor-hover
              className="mono-fade-up inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[50px] bg-white px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-fg transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
              style={{ animationDelay: "0.85s" }}
            >
              {nav.ctaLabel}
            </a>
            <span className="mono-fade-up w-full sm:w-auto" style={{ animationDelay: "1s" }}>
              <BrochureButton
                site={site}
                source="elysium/mono#hero"
                className="glass-dark inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[50px] px-7 py-4 text-[13px] font-medium uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:bg-white/15 sm:w-auto"
              >
                {nav.brochureLabel}
              </BrochureButton>
            </span>
          </div>
        </div>

        <div className="mono-float absolute bottom-7 left-1/2 z-10 h-11 w-px -translate-x-1/2 bg-gradient-to-b from-white/45 to-transparent" />
      </div>
    </section>
  );
}
