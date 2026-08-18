"use client";

/* / — Intro. The client's Hero1 clip — the towers rising out of the sky —
   baked to 120 WebP frames and scrubbed frame-by-frame by scroll (desktop
   only; mobile/reduced-motion gets a single still).
   Rebuild with `node scripts/build-scroll-frames.mjs hero`.

   The hero used to be a full-bleed dark plate: white type on the footage
   behind a night gradient. It measured 0.37 mean luminance and 1.73:1
   headline contrast, and it made the page open on two screens of black
   before the light ground ever appeared. It is now the same ground as
   every other section (design-system §1) with the footage held in a
   raised window: the towers are still the first thing on the page, but
   they arrive inside the page rather than underneath it. */

import { Fragment, useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import type { SiteContent } from "@/lib/site-content";
import { BrochureButton } from "./MonoBrochure";
import { MonoKicker } from "./shared";

/* The sequence opens on bare sky and only tilts down onto the towers around
   frame 55. Full-bleed that read as atmosphere; inside a window it reads as
   an empty grey box, so the scrub starts where the towers are standing and
   runs to the last frame. */
const FRAME_FIRST = 58;
const FRAME_LAST = 120;
const FRAME_COUNT = FRAME_LAST - FRAME_FIRST + 1;
/** Share of each frame's height trimmed off the top before the cover-fit — a
    band of bare sky, so the window is filled by the towers rather than by
    air. Every extra percent is paid for in cropped width, so it is set to the
    least that keeps the sky a margin rather than the subject. */
const FOCUS_TOP = 0.22;
const framePath = (i: number) => `/hero-video-frames/frame_${String(i).padStart(3, "0")}.webp`;
/** Still shown to mobile / reduced-motion: the towers fully risen. */
const STILL_FRAME = 100;

export function MonoHero({ site }: { site: SiteContent }) {
  const { brand, hero, nav } = site;
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
      // Cover-fit the skyline band, not the whole frame, and anchor it to the
      // bottom of the window: the towers fill the window, the sky is a margin.
      const sy = Math.round(img.naturalHeight * FOCUS_TOP);
      const sw = img.naturalWidth;
      const sh = img.naturalHeight - sy;
      const scale = Math.max(cw / sw, ch / sh);
      const w = sw * scale;
      const h = sh * scale;
      ctx2d.clearRect(0, 0, cw, ch);
      ctx2d.drawImage(img, 0, sy, sw, sh, (cw - w) / 2, ch - h, w, h);
    };

    const framesToLoad = !reduce && !isMobile ? FRAME_COUNT : 1;
    for (let i = 0; i < framesToLoad; i++) {
      const im = new Image();
      im.src = framePath(framesToLoad === 1 ? STILL_FRAME : FRAME_FIRST + i);
      if (i === 0) im.onload = () => { resize(); draw(); };
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
          scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.9 },
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
    <section id="top" ref={root} className="relative w-full bg-ground md:h-[210vh]">
      <div className="sticky top-0 flex min-h-[100svh] w-full items-center overflow-hidden pb-[4vh] pt-[calc(var(--header-h)+2vh)] md:pb-[5vh] md:pt-[calc(var(--header-h)+3vh)]">
        {/* The window takes its height from the viewport, not from its own
            width: an aspect-ratio box left a quarter of the screen as bare
            ground above and below the fold. */}
        <div className="mx-auto grid w-full max-w-[1500px] items-center gap-8 px-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-[4vw] md:px-10">
          {/* the type clears as the pin runs out; the window keeps scrubbing
              until the chapter takes the screen */}
          <div data-mh-copy>
            <MonoKicker className="mono-fade-up">{brand.tag}</MonoKicker>

            <h1 className="mt-5 text-[clamp(2.6rem,7.5vw,4.6rem)] font-medium uppercase leading-[1.05] tracking-[-0.2px] text-night [text-wrap:balance]">
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
              className="mono-fade-up mt-5 max-w-md text-[15px] font-medium leading-relaxed text-night/60 md:text-base"
              style={{ animationDelay: "0.7s" }}
            >
              {hero.sub}
            </p>

            <div className="mt-8 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
              <a
                href="#contact"
                onClick={(e) => go(e, "#contact")}
                data-cursor-hover
                className="mono-fade-up inline-flex w-full items-center justify-center gap-2 rounded-[50px] bg-night px-6 py-4 text-[14px] font-bold uppercase tracking-[-0.2px] text-white transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
                style={{ animationDelay: "0.85s" }}
              >
                {nav.ctaLabel}
              </a>
              <span className="mono-fade-up w-full sm:w-auto" style={{ animationDelay: "1s" }}>
                <BrochureButton
                  site={site}
                  source="elysium/mono#hero"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[50px] border border-night/25 px-6 py-4 text-[14px] font-bold uppercase tracking-[-0.2px] text-night transition-colors duration-300 hover:bg-night hover:text-white sm:w-auto"
                >
                  {nav.brochureLabel}
                </BrochureButton>
              </span>
            </div>
          </div>

          {/* the window: raised white surface, hairline, footage inside */}
          <figure className="mono-fade-up relative m-0 aspect-[6/5] w-full overflow-hidden rounded-2xl border border-night/10 bg-surface shadow-[0_40px_120px_-40px_rgba(21,23,23,0.7)] md:aspect-auto md:h-[min(56vh,560px)]" style={{ animationDelay: "0.35s" }}>
            <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
          </figure>
        </div>

        <div className="mono-float absolute bottom-5 left-1/2 z-10 h-9 w-px -translate-x-1/2 bg-night/25" />
      </div>
    </section>
  );
}
