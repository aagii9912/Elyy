"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap } from "@/lib/gsap";
import { FINAL } from "@/lib/content";

const FRAME_COUNT = 121;
const framePath = (i: number) => `/hero-frames/frame_${String(i).padStart(3, "0")}.jpg`;

export function FinalHero() {
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
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // cover
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx2d.clearRect(0, 0, cw, ch);
      ctx2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    // Only the scroll-scrubbed sequence needs every frame. On mobile /
    // reduced-motion we render a single still (frame 1), so don't pull the
    // full ~8 MB of JPEGs the user would never see animate.
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
      // Entrance + living scroll-cue are motion; skip entirely for reduced-motion
      // (the elements have no hidden initial CSS state, so they stay visible).
      if (!reduce) {
        gsap.from("[data-fh]", { y: 24, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.14, delay: 0.4 });
        gsap.from("[data-fh-btn]", { y: 18, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.7 });
        gsap.to("[data-fh-cue]", { y: 8, repeat: -1, yoyo: true, duration: 1.2, ease: "sine.inOut" });
      }

      if (!reduce && !isMobile) {
        // scrub the building-through-clouds sequence to scroll position
        gsap.to(state, {
          frame: FRAME_COUNT - 1,
          ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.4 },
          onUpdate: draw,
        });
        // gently lift / fade the copy as the sequence resolves
        gsap.to("[data-fh-copy]", {
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
    <section
      id="top"
      ref={root}
      className="relative h-[100svh] w-full bg-charcoal font-gilroy md:h-[260vh]"
    >
      <div className="sticky top-0 flex h-[100svh] min-h-[640px] w-full overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 z-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/35 via-black/10 to-black/55" />

        <div data-fh-copy className="relative z-10 flex h-full w-full flex-col items-center px-6">
          {/* Title block — horizontally centered, held at ~50% of the viewport */}
          <div className="flex flex-1 flex-col items-center justify-center text-center text-bone">
            <p
              data-fh
              className="mb-5 text-[11px] font-medium uppercase tracking-[0.42em] text-bone/70 md:mb-6 md:text-[12px]"
            >
              {FINAL.brandTag}
            </p>
            <h1
              data-fh
              className="text-[clamp(2.5rem,7vw,4rem)] font-medium uppercase leading-[1.1] tracking-[-0.2px] text-bone [text-wrap:balance] drop-shadow-[0_2px_30px_rgba(0,0,0,0.35)]"
            >
              {FINAL.brandLine}
            </h1>
          </div>

          {/* Actions — pinned low in the viewport, centered side-by-side */}
          <div className="pointer-events-auto flex w-full flex-col items-center gap-3.5 pb-[8vh] sm:w-auto sm:flex-row sm:justify-center sm:gap-4">
            <a
              data-fh-btn
              href="#contact"
              onClick={(e) => go(e, "#contact")}
              data-cursor-hover
              className="inline-flex w-full items-center justify-center gap-2 rounded-[50px] bg-bone px-6 py-4 text-[14px] font-medium uppercase tracking-[-0.2px] text-ink transition-all duration-300 hover:-translate-y-0.5 sm:w-auto"
            >
              {FINAL.hero.cta}
            </a>
            <a
              data-fh-btn
              href="/brochure.pdf"
              target="_blank"
              rel="noopener"
              data-cursor-hover
              className="inline-flex w-full items-center justify-center gap-2 rounded-[50px] border border-white/40 bg-white/[0.06] px-6 py-4 text-[14px] font-medium uppercase tracking-[-0.2px] text-white backdrop-blur-[16px] backdrop-saturate-[1.9] backdrop-brightness-[1.08] transition-all duration-300 hover:bg-white/15 sm:w-auto"
            >
              {FINAL.hero.brochure}
            </a>
          </div>
        </div>

        <div data-fh-cue className="absolute bottom-7 left-1/2 z-10 h-9 w-px -translate-x-1/2 bg-bone/45" />
      </div>
    </section>
  );
}
