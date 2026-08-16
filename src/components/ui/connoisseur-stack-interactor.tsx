"use client";

/* Hover/tap stack interactor — numbered menu on the left drives a GSAP
   clip-path collage on the right (each item owns its own mask shape:
   bands / blocks / pixels / columns).

   Reveal model: the mask NEVER collapses to nothing. Switching entries
   re-cuts the shapes from 0.86 → 1 with a soft random stagger while the
   artwork crossfades between two stacked <image> layers, so the collage
   always shows something. (The previous version scaled every shape to 0,
   held an empty frame, then scaled back in — which read as the section
   breaking rather than transitioning.) A slow idle breath keeps it alive
   and a timer auto-advances; resting the pointer on an entry holds it.

   Tuned to the mono design language on the light page ground; `tone`
   flips it back for dark surfaces. Lime stays the sparing accent and the
   first letters of the entries spell the E·L·Y·S acronym. */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/gsap";

export interface StackItem {
  num: string;
  /** First letter doubles as the acronym letter (E / L / Y / S). */
  name: string;
  /** Description shown under the menu for the active entry. */
  body: string;
  /** One of the clip shapes defined below. */
  clipId: "elys-clip-bands" | "elys-clip-blocks" | "elys-clip-pixels" | "elys-clip-columns";
  image: string;
  alt?: string;
}

/** How long an entry holds before the collage advances on its own. */
const DWELL_MS = 5200;

/** "Live in Harmony" → ["Live in", "Harmony"]; single words stay whole. */
const splitName = (name: string): readonly [string, string | null] => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return [name, null] as const;
  return [words.slice(0, -1).join(" "), words[words.length - 1]] as const;
};

export function ConnoisseurStackInteractor({
  items,
  className,
  tone = "light",
}: {
  items: StackItem[];
  className?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  /** Two stacked layers — one holds the outgoing art while the other fades in. */
  const layerA = useRef<SVGImageElement>(null);
  const layerB = useRef<SVGImageElement>(null);
  const frontIsA = useRef(true);
  const mainGroupRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const letterRef = useRef<HTMLSpanElement>(null);
  const breathTl = useRef<gsap.core.Timeline | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idxRef = useRef(0);
  const holdRef = useRef(false);
  const inViewRef = useRef(true);
  const reduceRef = useRef(false);
  /* Auto-advance fires from a timer, long after render — it needs the
     latest items without re-arming the whole loop, hence a ref synced
     after each commit (never written during render). */
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  });

  /** Queue the next auto-advance (skipped while held or off-screen). */
  const schedule = () => {
    if (timer.current) clearTimeout(timer.current);
    if (reduceRef.current) return;
    timer.current = setTimeout(() => {
      if (holdRef.current || !inViewRef.current) {
        schedule();
        return;
      }
      show((idxRef.current + 1) % itemsRef.current.length);
    }, DWELL_MS);
  };

  /** Swap to `index`: re-cut the mask, crossfade the art, restart the breath. */
  const show = (index: number) => {
    const list = itemsRef.current;
    const item = list[index];
    if (!item) return;
    idxRef.current = index;
    setActiveIndex(index);
    schedule();

    const selector = `#${item.clipId} .path`;
    mainGroupRef.current?.setAttribute("clip-path", `url(#${item.clipId})`);

    const incoming = frontIsA.current ? layerB.current : layerA.current;
    const outgoing = frontIsA.current ? layerA.current : layerB.current;
    frontIsA.current = !frontIsA.current;
    incoming?.setAttribute("href", item.image);

    breathTl.current?.kill();

    if (reduceRef.current) {
      gsap.set(selector, { scale: 1, transformOrigin: "50% 50%" });
      if (incoming) gsap.set(incoming, { opacity: 1 });
      if (outgoing) gsap.set(outgoing, { opacity: 0 });
      return;
    }

    // artwork crossfade — both layers stay painted, so no empty frame
    if (incoming) gsap.to(incoming, { opacity: 1, duration: 0.75, ease: "power2.inOut", overwrite: true });
    if (outgoing) gsap.to(outgoing, { opacity: 0, duration: 0.75, ease: "power2.inOut", overwrite: true });

    // mask re-cut — shapes shrink only to 0.86, never out of sight
    gsap.fromTo(
      selector,
      { scale: 0.86, transformOrigin: "50% 50%" },
      {
        scale: 1,
        duration: 1.05,
        stagger: { amount: 0.45, from: "random" },
        ease: "expo.out",
        overwrite: true,
      }
    );

    // slow idle breath — alive without ever clearing the frame
    const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: 1.1 });
    tl.to(selector, {
      scale: 1.03,
      duration: 2.6,
      ease: "sine.inOut",
      stagger: { amount: 0.5, from: "center" },
    });
    if (!inViewRef.current) tl.pause();
    breathTl.current = tl;
  };

  useLayoutEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // warm the cache so href swaps never flash empty
    itemsRef.current.forEach((it) => {
      const im = new Image();
      im.src = it.image;
    });

    const ctx = gsap.context(() => {
      show(0);
    }, containerRef);

    // off-screen → hold the breath and stop auto-advancing
    const io = new IntersectionObserver(
      (entries) => {
        const on = entries.some((e) => e.isIntersecting);
        inViewRef.current = on;
        if (on) breathTl.current?.play();
        else breathTl.current?.pause();
      },
      { rootMargin: "15% 0px" }
    );
    if (containerRef.current) io.observe(containerRef.current);

    return () => {
      io.disconnect();
      if (timer.current) clearTimeout(timer.current);
      breathTl.current?.kill();
      breathTl.current = null;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* active entry changed → ease the description + ghost letter in */
  useEffect(() => {
    if (reduceRef.current) return;
    if (bodyRef.current) {
      gsap.fromTo(
        bodyRef.current,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", overwrite: true }
      );
    }
    if (letterRef.current) {
      gsap.fromTo(
        letterRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.8, ease: "power2.out", overwrite: true }
      );
    }
  }, [activeIndex]);

  const select = (index: number) => {
    if (index === idxRef.current) return;
    show(index);
  };

  const active = items[activeIndex];

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex w-full flex-col items-center justify-between gap-12 md:flex-row md:gap-10",
        className
      )}
    >
      {/* LEFT — numbered E·L·Y·S menu + active description */}
      <div className="z-10 w-full md:w-1/2">
        <nav
          aria-label="ELYS концепцын жагсаалт"
          onMouseLeave={() => {
            holdRef.current = false;
          }}
        >
          <ul className="flex flex-col gap-6 md:gap-9">
            {items.map((item, index) => {
              const [lineA, lineB] = splitName(item.name);
              const isActive = activeIndex === index;
              return (
                <li key={item.num}>
                  <button
                    type="button"
                    data-cursor-hover
                    aria-current={isActive}
                    onMouseEnter={() => {
                      holdRef.current = true;
                      select(index);
                    }}
                    onFocus={() => select(index)}
                    onClick={() => select(index)}
                    className="group flex w-full items-start gap-4 py-1 text-left md:gap-6"
                  >
                    <span
                      className={`mt-1.5 inline-block text-base font-bold transition-all duration-500 md:text-lg ${
                        isActive
                          ? "scale-110 text-moss"
                          : dark
                            ? "text-white/30"
                            : "text-night/25"
                      }`}
                    >
                      {item.num}
                    </span>
                    <span
                      className={`inline-block text-[clamp(1.5rem,3.3vw,2.6rem)] font-extrabold uppercase leading-[0.95] tracking-tight transition-all duration-700 ${
                        isActive
                          ? `translate-x-1.5 md:translate-x-3 ${dark ? "text-white" : "text-night"}`
                          : dark
                            ? "translate-x-0 text-transparent opacity-60 [-webkit-text-stroke:1.5px_rgba(255,255,255,0.30)] group-hover:opacity-90 group-hover:[-webkit-text-stroke:1.5px_rgba(255,255,255,0.55)]"
                            : "translate-x-0 text-transparent opacity-70 [-webkit-text-stroke:1.5px_rgba(21,23,23,0.28)] group-hover:opacity-100 group-hover:[-webkit-text-stroke:1.5px_rgba(21,23,23,0.55)]"
                      }`}
                    >
                      {/* first letter carries the acronym accent */}
                      <span className={isActive ? "text-moss" : undefined}>{lineA.charAt(0)}</span>
                      {lineA.slice(1)}
                      {lineB && (
                        <>
                          <br />
                          {lineB}
                        </>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`mt-8 max-w-md border-t pt-6 md:mt-12 ${dark ? "border-white/10" : "border-night/12"}`}>
          <p
            ref={bodyRef}
            className={`min-h-[5.5rem] text-[14px] leading-relaxed md:min-h-[4.5rem] md:text-[15px] ${
              dark ? "text-white/75" : "text-night/70"
            }`}
          >
            {active.body}
          </p>
        </div>
      </div>

      {/* RIGHT — clip-path collage */}
      <div className="relative flex w-full items-center justify-center md:w-1/2">
        <div
          aria-hidden
          className={`absolute h-[75%] w-[75%] rounded-full blur-[110px] transition-opacity duration-1000 ${
            dark ? "bg-lime/10" : "bg-moss/10"
          }`}
        />
        {/* ghost acronym letter — echo of the letters scroll chapter */}
        <span
          ref={letterRef}
          aria-hidden
          className={`pointer-events-none absolute -left-4 top-1/2 hidden -translate-y-1/2 select-none font-extrabold uppercase leading-none text-transparent [font-size:clamp(9rem,19vw,15rem)] md:block ${
            dark
              ? "[-webkit-text-stroke:2px_rgba(255,255,255,0.14)]"
              : "[-webkit-text-stroke:2px_rgba(21,23,23,0.10)]"
          }`}
        >
          {active.name.charAt(0)}
        </span>

        <svg
          viewBox="0 0 500 500"
          role="img"
          aria-label={active.alt ?? active.name}
          className={`relative z-10 h-auto w-full max-w-[440px] md:max-w-[500px] ${
            dark
              ? "drop-shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
              : "drop-shadow-[0_24px_70px_rgba(21,23,23,0.22)]"
          }`}
        >
          <defs>
            {/* horizontal louver slats — thick/thin floorplate rhythm */}
            <clipPath id="elys-clip-bands">
              <rect className="path" x="20" y="20" width="460" height="100" rx="10" />
              <rect className="path" x="20" y="140" width="460" height="60" rx="10" />
              <rect className="path" x="20" y="220" width="460" height="140" rx="10" />
              <rect className="path" x="20" y="380" width="460" height="100" rx="10" />
            </clipPath>

            {/* block mosaic — courtyard parcels */}
            <clipPath id="elys-clip-blocks">
              <rect className="path" x="20" y="20" width="200" height="280" rx="12" />
              <rect className="path" x="20" y="320" width="200" height="160" rx="12" />
              <rect className="path" x="240" y="20" width="240" height="140" rx="12" />
              <rect className="path" x="240" y="180" width="110" height="160" rx="12" />
              <rect className="path" x="370" y="180" width="110" height="160" rx="12" />
              <rect className="path" x="240" y="360" width="240" height="120" rx="12" />
            </clipPath>

            {/* 3×3 grid — camera-wall rhythm */}
            <clipPath id="elys-clip-pixels">
              {Array.from({ length: 9 }).map((_, i) => (
                <rect
                  key={i}
                  className="path"
                  x={(i % 3) * 160 + 20}
                  y={Math.floor(i / 3) * 160 + 20}
                  width="140"
                  height="140"
                  rx="4"
                />
              ))}
            </clipPath>

            {/* vertical columns — the tower cluster */}
            <clipPath id="elys-clip-columns">
              {Array.from({ length: 4 }).map((_, i) => (
                <rect
                  key={i}
                  className="path"
                  x={20 + i * 120}
                  y="20"
                  width="100"
                  height="460"
                  rx="10"
                />
              ))}
            </clipPath>
          </defs>

          <g ref={mainGroupRef} clipPath={`url(#${items[0].clipId})`}>
            <image
              ref={layerA}
              href={items[0].image}
              width="500"
              height="500"
              preserveAspectRatio="xMidYMid slice"
            />
            <image
              ref={layerB}
              href={items[0].image}
              width="500"
              height="500"
              opacity="0"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

/** Vendor-style alias so `import { Component }` keeps working. */
export { ConnoisseurStackInteractor as Component };
