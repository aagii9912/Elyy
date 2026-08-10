"use client";

/* /mono — shared full-screen scroll story (three distinct chapters).
   Pinned viewport; frame-by-frame video placeholder (hero-frame segment)
   scrubs behind; points activate per scroll quarter with a GSAP
   crossfade (no hard remounts). Every chapter opens with a centred
   intro title that gives way to the persistent corner header.

   Variants give each chapter its own visual language:
     numbers  — blueprint HUD: giant char-rolled figures, drafting
                chrome (corner brackets, dashed cross, progress rule)
     letters  — editorial typography: an oversized outlined letter
                (E·L·Y·S) bleeding off the left edge
     callouts — engineering annotation: lime ping pinned on the facade,
                a connector line drawing toward a sharp spec card

   The bottom-right rail is clickable — picking an entry jumps the
   scroll to that point. Frames start loading only when the section
   nears the viewport. */

import { Fragment, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap, type ScrollTrigger as ScrollTriggerType } from "@/lib/gsap";
import { MonoKicker } from "./shared";

export type StoryPoint = {
  n: string;
  heading: string;
  accent?: string; // rendered in lime right after the heading (e.g. "%")
  text: string;
};

export type StoryVariant = "numbers" | "letters" | "callouts";

const framePathIn = (dir: string, ext: string) => (i: number) =>
  `${dir}/frame_${String(i).padStart(3, "0")}.${ext}`;

/* facade anchor positions (viewport %) for the callouts variant */
const CALLOUT_ANCHORS = [
  { x: 30, y: 40 },
  { x: 58, y: 30 },
  { x: 36, y: 64 },
  { x: 52, y: 55 },
];

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
  variant,
}: {
  id?: string;
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
  variant: StoryVariant;
}) {
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const layersWrap = useRef<HTMLDivElement>(null);
  const progFill = useRef<HTMLDivElement>(null);
  const st = useRef<ScrollTriggerType | null>(null);
  const prevActive = useRef(0);
  const [active, setActive] = useState(0);

  /** Jump the scroll so point `i` is centred in its quarter. */
  const goTo = (i: number) => {
    const t = st.current;
    if (!t) return;
    const target = t.start + ((i + 0.5) / points.length) * (t.end - t.start);
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

    const ctx = gsap.context(() => {
      const tween = gsap.to(state, {
        f: count - 1,
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
          onUpdate: (self) => {
            if (progFill.current) gsap.set(progFill.current, { scaleX: self.progress });
            const idx = Math.min(points.length - 1, Math.floor(self.progress * points.length));
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
      const veilEl = sec.querySelector("[data-veil]");
      if (reduce) {
        if (introEl) gsap.set(introEl, { autoAlpha: 0 });
        if (veilEl) gsap.set(veilEl, { autoAlpha: 0 });
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
                start: () => "top+=" + window.innerHeight * 0.3 + " top",
                end: () => "+=" + window.innerHeight * 0.35,
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
                start: () => "top+=" + window.innerHeight * 0.28 + " top",
                end: () => "+=" + window.innerHeight * 0.3,
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
        if (veilEl) {
          gsap.fromTo(
            veilEl,
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
          gsap.fromTo(
            veilEl,
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
      gsap.to(outgoing, { autoAlpha: 0, y: -18, duration: 0.3, ease: "power2.in", overwrite: true });
    }
    gsap.set(incoming, { y: 0 });
    gsap.to(incoming, { autoAlpha: 1, duration: 0.35, ease: "power2.out", overwrite: true });

    // staggered children
    const kids = incoming.querySelectorAll("[data-sw]");
    if (kids.length) {
      gsap.fromTo(
        kids,
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.07, delay: 0.05, overwrite: true }
      );
    }
    // char roll (numbers variant)
    const chars = incoming.querySelectorAll("[data-ch]");
    if (chars.length) {
      gsap.fromTo(
        chars,
        { yPercent: 112 },
        { yPercent: 0, duration: 0.65, ease: "power4.out", stagger: 0.05, overwrite: true }
      );
    }
    // connector line draw (callouts variant)
    const line = incoming.querySelector<SVGPathElement>("[data-line]");
    if (line) {
      const len = line.getTotalLength();
      gsap.fromTo(
        line,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 0.6, ease: "power2.out", delay: 0.15, overwrite: true }
      );
    }
  }, [active]);

  const railLabel = (p: StoryPoint) =>
    variant === "letters" ? p.heading.charAt(0).toUpperCase() : p.n;

  return (
    <section id={id} ref={root} className={`relative bg-night ${heightClass}`}>
      <div className="sticky top-0 flex h-[100svh] min-h-[560px] w-full overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 z-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-night/75 via-night/40 to-night/85" />
        {/* letters chapter reads on the left — extra side scrim for contrast */}
        {variant === "letters" && (
          <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-r from-night/70 via-night/30 to-transparent" />
        )}

        {/* chapter veil — black bridge into/out of the chapter */}
        <div data-veil aria-hidden className="pointer-events-none absolute inset-0 z-[7] bg-night" />

        {/* blueprint HUD chrome — numbers chapter only */}
        {variant === "numbers" && (
          <div data-chrome aria-hidden className="pointer-events-none absolute inset-0 z-[6]">
            <span className="absolute left-5 top-20 h-6 w-6 border-l border-t border-white/25 md:left-8" />
            <span className="absolute right-5 top-20 h-6 w-6 border-r border-t border-white/25 md:right-8" />
            <span className="absolute bottom-6 left-5 h-6 w-6 border-b border-l border-white/25 md:left-8" />
            <span className="absolute bottom-6 right-5 h-6 w-6 border-b border-r border-white/25 md:right-8" />
            <span className="absolute left-1/2 top-0 h-full border-l border-dashed border-white/[0.07]" />
            <span className="absolute left-0 top-1/2 w-full border-t border-dashed border-white/[0.07]" />
            <div className="absolute bottom-[7vh] left-5 hidden w-[24%] md:left-10 md:block">
              <div className="h-px w-full bg-white/15">
                <div ref={progFill} className="h-px w-full origin-left scale-x-0 bg-lime" />
              </div>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                Мастер төлөвлөгөө · явц
              </p>
            </div>
          </div>
        )}

        {/* chapter intro — centred, scrubs away over the first half-screen */}
        <div
          data-intro
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[9] flex flex-col items-center justify-center px-6 text-center"
        >
          <p className="text-[12px] font-bold uppercase tracking-[0.42em] text-lime">{chapter}</p>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55">{kicker}</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(2rem,5.4vw,4.2rem)] font-extrabold leading-[1.04] tracking-tight text-white [text-wrap:balance]">
            {title}
          </h2>
        </div>

        {/* persistent corner header — fades in as the intro leaves */}
        <div data-head className="absolute left-5 top-24 z-10 md:left-10 md:top-28">
          <MonoKicker tone="dark">
            {chapter} — {kicker}
          </MonoKicker>
          <h2 className="mt-3 text-[clamp(1.3rem,2.2vw,1.9rem)] font-extrabold leading-tight tracking-tight text-white">
            {title}
          </h2>
        </div>

        {/* point layers — GSAP crossfade between quarters */}
        <div ref={layersWrap} data-layers className="pointer-events-none absolute inset-0 z-[8]">
          {points.map((p, i) => (
            <div key={p.n} data-layer className={`absolute inset-0 ${i === 0 ? "" : "opacity-0"}`}>
              {variant === "numbers" && (
                <div className="flex h-full items-center justify-center px-6">
                  <div className="text-center">
                    <h3
                      className={`flex items-end justify-center font-extrabold leading-none tracking-tight text-white drop-shadow-[0_4px_36px_rgba(0,0,0,0.55)] ${
                        p.heading.length > 4
                          ? "text-[clamp(2.8rem,9vw,7rem)]"
                          : "text-[clamp(4.6rem,15vw,11rem)]"
                      }`}
                    >
                      {p.heading.split("").map((c, ci) => (
                        <span key={ci} className="inline-block overflow-hidden">
                          <span data-ch className="inline-block">
                            {c === " " ? " " : c}
                          </span>
                        </span>
                      ))}
                      {p.accent && (
                        <span data-sw className="mb-[0.9em] text-[0.28em] font-bold text-lime">
                          {p.accent}
                        </span>
                      )}
                    </h3>
                    <p
                      data-sw
                      className="mx-auto mt-6 max-w-md text-[12px] font-semibold uppercase tracking-[0.26em] text-white/80 drop-shadow-[0_1px_12px_rgba(0,0,0,0.6)] md:text-[13px]"
                    >
                      {p.text}
                    </p>
                  </div>
                </div>
              )}

              {variant === "letters" && (
                <div className="relative h-full">
                  <span
                    data-sw
                    aria-hidden
                    className="absolute -left-[2vw] top-1/2 -translate-y-1/2 select-none font-extrabold uppercase leading-none [font-size:clamp(13rem,38vw,30rem)]"
                    style={{ WebkitTextStroke: "2.5px rgba(255,255,255,0.5)", color: "rgba(21,23,23,0.35)" }}
                  >
                    {p.heading.charAt(0)}
                  </span>
                  <div className="absolute bottom-[13vh] left-5 right-5 md:bottom-auto md:left-[34vw] md:right-auto md:top-1/2 md:w-[min(420px,34vw)] md:-translate-y-1/2">
                    <p data-sw className="text-[11px] font-bold uppercase tracking-[0.32em] text-lime">
                      {p.n} / {String(points.length).padStart(2, "0")}
                    </p>
                    <h3 data-sw className="mt-3 text-[clamp(1.9rem,3.4vw,2.9rem)] font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]">
                      {p.heading}
                    </h3>
                    <p data-sw className="mt-4 text-[15px] leading-relaxed text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.6)]">
                      {p.text}
                    </p>
                  </div>
                </div>
              )}

              {variant === "callouts" && (
                <div className="relative h-full">
                  <span
                    data-sw
                    aria-hidden
                    className="green-ping absolute hidden h-3 w-3 rounded-full bg-lime text-lime md:block"
                    style={{
                      left: `${CALLOUT_ANCHORS[i % CALLOUT_ANCHORS.length].x}%`,
                      top: `${CALLOUT_ANCHORS[i % CALLOUT_ANCHORS.length].y}%`,
                    }}
                  />
                  <svg
                    aria-hidden
                    className="absolute inset-0 hidden h-full w-full md:block"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      data-line
                      d={`M ${CALLOUT_ANCHORS[i % CALLOUT_ANCHORS.length].x} ${CALLOUT_ANCHORS[i % CALLOUT_ANCHORS.length].y} L ${CALLOUT_ANCHORS[i % CALLOUT_ANCHORS.length].x + 6} ${CALLOUT_ANCHORS[i % CALLOUT_ANCHORS.length].y} L 67 66`}
                      fill="none"
                      stroke="rgba(180,214,86,0.75)"
                      strokeWidth="1.25"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <div className="absolute bottom-[10vh] left-4 right-4 border border-white/25 bg-night/60 p-6 backdrop-blur-xl md:bottom-[13vh] md:left-auto md:right-[6%] md:w-[340px] md:p-7">
                    <span aria-hidden className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-lime" />
                    <span aria-hidden className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-lime" />
                    <p data-sw className="text-[10px] font-bold uppercase tracking-[0.32em] text-lime">
                      Spec / {p.n}
                    </p>
                    <h3 data-sw className="mt-3 text-xl font-extrabold leading-snug tracking-tight text-white md:text-2xl">
                      {p.heading}
                    </h3>
                    <p data-sw className="mt-3 text-[14px] leading-relaxed text-white/75">
                      {p.text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* clickable point rail — jump to any point (desktop) */}
        <div data-rail className="absolute bottom-[7vh] right-10 z-10 hidden items-center gap-3 md:flex">
          {points.map((p, i) => {
            const lit = variant === "letters" ? i <= active : i === active;
            return (
              <Fragment key={p.n}>
                {i > 0 && (
                  <span
                    aria-hidden
                    className={`h-px w-7 transition-colors duration-500 ${
                      i <= active ? "bg-lime/70" : "bg-white/20"
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  data-cursor-hover
                  aria-label={`${p.n} — ${p.heading}`}
                  aria-current={active === i}
                  className={`font-bold tracking-[0.08em] transition-all duration-300 ${
                    variant === "letters" ? "text-sm" : "text-[11px]"
                  } ${
                    lit
                      ? `text-lime ${active === i ? "scale-125" : ""}`
                      : "text-white/40 hover:text-white/80"
                  }`}
                >
                  {railLabel(p)}
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
