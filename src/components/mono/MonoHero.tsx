"use client";

/* /mono — Intro. The client's clip — the towers rising into a clear
   daylight sky — baked to 160 WebP frames and scrubbed frame-by-frame
   by scroll (DESKTOP ONLY; reduced-motion gets the closing frame).
   Rebuild with `node scripts/build-scroll-frames.mjs hero`.

   Утсан дээр кадар ОГТ татахгүй: 1280×720 кадар нь 375pt × 3 нягтралын
   дэлгэцэд ~3 дахин томсож бүдгэрдэг. Оронд нь тэр дэлгэцэд зориулж
   тайрсан хөрөг зураг CSS дэвсгэрээр сууна (`build-mobile-stills.mjs`).
   `md:hidden` давхаргын дэвсгэрийг ширээний хөтөч ТАТДАГГҮЙ тул энэ нь
   ширээнд нэг ч байт нэмэхгүй, харин утсанд SSR-ийн эхний HTML-ээс
   шууд ачаалагдаж LCP-г түргэсгэнэ.

   Хэрэглэгч эхний удаа гүйлгэмэгц үлдсэн замыг нь `useScrollAutoplay`
   өөрөө гүйлгэж, клипийг кино шиг эцэс хүртэл тоглуулна. */

import { Fragment, useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap, type ScrollTrigger as ScrollTriggerType } from "@/lib/gsap";
import type { SiteContent } from "@/lib/site-content";
import { BrochureButton } from "./MonoBrochure";
import { useScrollAutoplay } from "./shared";

const FRAME_COUNT = 160;
const framePath = (i: number) => `/hero-video-frames/frame_${String(i).padStart(3, "0")}.webp`;
/** Утасны хөрөг зураг — 768×1536 зүсэм, ELYSIUM тэмдэгт цамхаг дээр голлосон. */
const MOBILE_STILL = "/images/mobile/hero.webp";
/** Бүлгийг эхнээс нь дуустал автоматаар гүйлгэх хугацаа (сек) —
    160 кадр / 7сек ≈ 23fps, эх клипийн 24fps-тэй ойрхон. */
const AUTOPLAY_SECONDS = 7;

export function MonoHero({ site }: { site: SiteContent }) {
  const { brand, hero, nav } = site;
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef<ScrollTriggerType | null>(null);

  useScrollAutoplay({ trigger: st, seconds: AUTOPLAY_SECONDS });

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
    // Утсан дээр canvas нь `hidden` — clientWidth нь 0, зурах юм ч байхгүй.
    // Кадар татахаас өмнө буцна: энэ хэсэг утсанд 0 хүсэлт үүсгэнэ.
    if (isMobile) return;

    const images: HTMLImageElement[] = [];
    const state = { frame: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = Math.round(cvs.clientWidth * dpr);
      cvs.height = Math.round(cvs.clientHeight * dpr);
    };

    const draw = () => {
      const img = images[Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(state.frame)))];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = cvs.width;
      const ch = cvs.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx2d.clearRect(0, 0, cw, ch);
      ctx2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const framesToLoad = reduce ? 1 : FRAME_COUNT;
    for (let i = 1; i <= framesToLoad; i++) {
      const im = new Image();
      // Frame 1 is bare sky before the towers rise — the single-frame
      // fallback takes the closing frame, where the towers are fully up.
      im.src = framePath(framesToLoad === 1 ? FRAME_COUNT : i);
      if (i === 1) im.onload = () => { resize(); draw(); };
      images.push(im);
    }
    resize();
    const onResize = () => { resize(); draw(); };
    window.addEventListener("resize", onResize);

    const ctx = gsap.context(() => {
      // Entrance animations are pure CSS (mono-fade-up / mono-float) so
      // they can't get stuck mid-tween on StrictMode/HMR remounts.
      if (!reduce) {
        const tween = gsap.to(state, {
          frame: FRAME_COUNT - 1,
          ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.9 },
          onUpdate: draw,
        });
        st.current = tween.scrollTrigger ?? null;
        gsap.to("[data-mh-copy]", {
          opacity: 0,
          yPercent: -8,
          ease: "none",
          scrollTrigger: { trigger: sec, start: "40% top", end: "80% top", scrub: true },
        });
      }
    }, sec);

    return () => {
      window.removeEventListener("resize", onResize);
      st.current = null;
      ctx.revert();
    };
  }, []);

  return (
    <section id="top" ref={root} className="relative h-[100svh] w-full bg-night md:h-[210vh]">
      <div className="sticky top-0 flex h-[100svh] min-h-[620px] w-full overflow-hidden">
        {/* Утасны дэвсгэр — `<img>` биш CSS дэвсгэр: `display:none` дэд
            модны дэвсгэр зургийг хөтөч татдаггүй тул ширээнд энэ мөр
            нэг ч хүсэлт үүсгэхгүй. */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: `url("${MOBILE_STILL}")` }}
        />
        <canvas ref={canvas} className="absolute inset-0 z-0 hidden h-full w-full md:block" />
        {/* Шинэ кадрууд өдрийн цэлмэг тэнгэртэй — өмнөх нар жаргах клипээс
            хамаагүй цайвар тул цагаан бичиг дан дээр нь уншигдахгүй. Хоёр
            давхар хөшиг: дээд/доод шугаман (толгой ба товчнуудад) + бичгийн
            ард нэг зөөлөн эллипс. Ингэснээр кадрын ирмэг гэгээлэг хэвээр
            үлдэж, зөвхөн бичгийн доод тал бараантана. */}
        <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-night/45 via-night/8 to-night/60" />
        <div className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_78%_56%_at_50%_42%,rgba(21,23,23,0.42)_0%,rgba(21,23,23,0.24)_45%,transparent_72%)]" />

        <div data-mh-copy className="relative z-10 flex h-full w-full flex-col items-center px-6">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="mono-fade-up mb-5 text-[11px] font-semibold uppercase tracking-[0.42em] text-lime md:mb-6 md:text-[12px]" style={{ animationDelay: "0.4s" }}>
              {brand.tag}
            </p>
            <h1 className="text-[clamp(2.6rem,7.5vw,4.6rem)] font-medium uppercase leading-[1.05] tracking-[-0.2px] text-white [text-wrap:balance] drop-shadow-[0_2px_30px_rgba(0,0,0,0.4)]">
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
              className="mono-fade-up inline-flex w-full items-center justify-center gap-2 rounded-[50px] bg-white px-6 py-4 text-[14px] font-bold uppercase tracking-[-0.2px] text-night transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
              style={{ animationDelay: "0.85s" }}
            >
              {nav.ctaLabel}
            </a>
            <span className="mono-fade-up w-full sm:w-auto" style={{ animationDelay: "1s" }}>
              <BrochureButton
                site={site}
                source="elysium/mono#hero"
                className="inline-flex w-full items-center justify-center gap-2 rounded-[50px] border border-white/40 bg-white/[0.06] px-6 py-4 text-[14px] font-medium uppercase tracking-[-0.2px] text-white backdrop-blur-[16px] transition-colors duration-300 hover:bg-white/15 sm:w-auto"
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
