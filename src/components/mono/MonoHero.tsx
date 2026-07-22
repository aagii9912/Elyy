"use client";

/* /mono — Intro. Drone shot descending through clouds toward the
   building, scrubbed frame-by-frame by scroll (121 JPEG frames, desktop
   only; mobile/reduced-motion gets a single still). The hero stays dark
   so the white page below lands with contrast. */

import { Fragment, useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { FINAL } from "@/lib/content";

const FRAME_COUNT = 121;
const framePath = (i: number) => `/hero-frames/frame_${String(i).padStart(3, "0")}.jpg`;

export function MonoHero() {
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

    const framesToLoad = !reduce && !isMobile ? FRAME_COUNT : 1;
    for (let i = 1; i <= framesToLoad; i++) {
      const im = new Image();
      im.src = framePath(i);
      if (i === 1) im.onload = () => { resize(); draw(); };
      images.push(im);
    }
    resize();
    const onResize = () => { resize(); draw(); };
    window.addEventListener("resize", onResize);

    const ctx = gsap.context(() => {
      // Entrance animations are pure CSS (mono-fade-up / mono-float) so
      // they can't get stuck mid-tween on StrictMode/HMR remounts.
      if (!reduce && !isMobile) {
        gsap.to(state, {
          frame: FRAME_COUNT - 1,
          ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.4 },
          onUpdate: draw,
        });
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
      ctx.revert();
    };
  }, []);

  return (
    <section id="top" ref={root} className="relative h-[100svh] w-full bg-night md:h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] min-h-[620px] w-full overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 z-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-night/60 via-night/15 to-night/70" />

        <div data-mh-copy className="relative z-10 flex h-full w-full flex-col items-center px-6">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="mono-fade-up mb-5 text-[11px] font-semibold uppercase tracking-[0.42em] text-lime md:mb-6 md:text-[12px]" style={{ animationDelay: "0.4s" }}>
              {FINAL.brandTag}
            </p>
            <h1 className="text-[clamp(2.6rem,7.5vw,4.6rem)] font-medium uppercase leading-[1.05] tracking-[-0.2px] text-white [text-wrap:balance] drop-shadow-[0_2px_30px_rgba(0,0,0,0.4)]">
              {/* word-by-word mask rise */}
              {FINAL.brandLine.split(" ").map((word, i) => (
                <Fragment key={`${word}-${i}`}>
                  {i > 0 && " "}
                  <span className="mono-word">
                    <span style={{ animationDelay: `${0.5 + i * 0.09}s` }}>{word}</span>
                  </span>
                </Fragment>
              ))}
            </h1>
            <p className="mono-fade-up mt-5 max-w-md text-[15px] font-medium leading-relaxed text-white/80 md:text-base" style={{ animationDelay: "0.7s" }}>
              {FINAL.hero.sub}
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
              {FINAL.hero.cta}
            </a>
            <a
              href="/brochure.pdf"
              target="_blank"
              rel="noopener"
              data-cursor-hover
              className="mono-fade-up inline-flex w-full items-center justify-center gap-2 rounded-[50px] border border-white/40 bg-white/[0.06] px-6 py-4 text-[14px] font-medium uppercase tracking-[-0.2px] text-white backdrop-blur-[16px] transition-colors duration-300 hover:bg-white/15 sm:w-auto"
              style={{ animationDelay: "1s" }}
            >
              {FINAL.hero.brochure}
            </a>
          </div>
        </div>

        <div className="mono-float absolute bottom-7 left-1/2 z-10 h-9 w-px -translate-x-1/2 bg-white/50" />
      </div>
    </section>
  );
}
