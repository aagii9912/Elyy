"use client";

/* Hover/tap stack interactor — numbered menu on the left drives a GSAP
   clip-path collage on the right (each item owns its own mask shape:
   bands / blocks / pixels / columns). The reveal loop breathes, folds
   away and auto-advances to the next item; resting the pointer on an
   entry holds its loop. Tuned to the mono design language: night bg
   supplied by the parent, lime kept as the sparing accent, first
   letters of the entries spell the E·L·Y·S acronym. */

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

/** "Live in Harmony" → ["Live in", "Harmony"]; single words stay whole. */
const splitName = (name: string): readonly [string, string | null] => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return [name, null] as const;
  return [words.slice(0, -1).join(" "), words[words.length - 1]] as const;
};

export function ConnoisseurStackInteractor({
  items,
  className,
}: {
  items: StackItem[];
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<SVGImageElement>(null);
  const mainGroupRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const letterRef = useRef<HTMLSpanElement>(null);
  const masterTl = useRef<gsap.core.Timeline | null>(null);
  const idxRef = useRef(0);
  const hoverRef = useRef<number | null>(null);
  const inViewRef = useRef(true);
  const reduceRef = useRef(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const createLoop = (index: number) => {
    const list = itemsRef.current;
    const item = list[index];
    if (!item) return;
    const selector = `#${item.clipId} .path`;

    masterTl.current?.kill();
    imageRef.current?.setAttribute("href", item.image);
    mainGroupRef.current?.setAttribute("clip-path", `url(#${item.clipId})`);

    if (reduceRef.current) {
      gsap.set(selector, { scale: 1, transformOrigin: "50% 50%" });
      return;
    }

    gsap.set(selector, { scale: 0, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({
      onComplete: () => {
        const cur = idxRef.current;
        // pointer resting on the menu → keep replaying the held entry
        if (hoverRef.current !== null) {
          createLoop(cur);
          return;
        }
        const next = (cur + 1) % itemsRef.current.length;
        idxRef.current = next;
        setActiveIndex(next);
        createLoop(next);
      },
    });

    // 1. IN (expo out)
    tl.to(selector, {
      scale: 1,
      duration: 0.8,
      stagger: { amount: 0.4, from: "random" },
      ease: "expo.out",
    })
      // 2. IDLE (sine breath)
      .to(selector, {
        scale: 1.05,
        duration: 1.5,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
        stagger: { amount: 0.2, from: "center" },
      })
      // 3. OUT (expo in) after a short hold
      .to(
        selector,
        {
          scale: 0,
          duration: 0.6,
          stagger: { amount: 0.3, from: "edges" },
          ease: "expo.in",
        },
        "+=0.5"
      );

    if (!inViewRef.current) tl.pause();
    masterTl.current = tl;
  };

  useLayoutEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // warm the cache so href swaps never flash empty
    itemsRef.current.forEach((it) => {
      const im = new Image();
      im.src = it.image;
    });

    const ctx = gsap.context(() => {
      createLoop(0);
    }, containerRef);

    // off-screen → hold the loop (also stops auto-advance)
    const io = new IntersectionObserver(
      (entries) => {
        const on = entries.some((e) => e.isIntersecting);
        inViewRef.current = on;
        if (on) masterTl.current?.play();
        else masterTl.current?.pause();
      },
      { rootMargin: "15% 0px" }
    );
    if (containerRef.current) io.observe(containerRef.current);

    return () => {
      io.disconnect();
      masterTl.current?.kill();
      masterTl.current = null;
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
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", overwrite: true }
      );
    }
    if (letterRef.current) {
      gsap.fromTo(
        letterRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.7, ease: "power2.out", overwrite: true }
      );
    }
  }, [activeIndex]);

  const select = (index: number) => {
    if (index === idxRef.current) return;
    idxRef.current = index;
    setActiveIndex(index);
    createLoop(index);
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
        <nav aria-label="ELYS концепцын жагсаалт" onMouseLeave={() => (hoverRef.current = null)}>
          <ul className="flex flex-col gap-7 md:gap-9">
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
                      hoverRef.current = index;
                      select(index);
                    }}
                    onFocus={() => select(index)}
                    onClick={() => select(index)}
                    className="group flex w-full items-start gap-5 text-left md:gap-6"
                  >
                    <span
                      className={`mt-1.5 inline-block text-base font-bold transition-all duration-500 md:text-lg ${
                        isActive ? "scale-110 text-lime" : "text-white/30"
                      }`}
                    >
                      {item.num}
                    </span>
                    <span
                      className={`inline-block text-[clamp(1.7rem,3.3vw,2.6rem)] font-extrabold uppercase leading-[0.92] tracking-tight transition-all duration-700 ${
                        isActive
                          ? "translate-x-2 text-white md:translate-x-3"
                          : "translate-x-0 text-transparent opacity-60 [-webkit-text-stroke:1.5px_rgba(255,255,255,0.30)] group-hover:opacity-90 group-hover:[-webkit-text-stroke:1.5px_rgba(255,255,255,0.55)]"
                      }`}
                    >
                      {/* first letter carries the acronym accent */}
                      <span className={isActive ? "text-lime" : undefined}>{lineA.charAt(0)}</span>
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

        <div className="mt-9 max-w-md border-t border-white/10 pt-6 md:mt-12">
          <p ref={bodyRef} className="min-h-[4.5rem] text-[14px] leading-relaxed text-white/75 md:text-[15px]">
            {active.body}
          </p>
        </div>
      </div>

      {/* RIGHT — clip-path collage */}
      <div className="relative flex w-full items-center justify-center md:w-1/2">
        <div
          aria-hidden
          className="absolute h-[75%] w-[75%] rounded-full bg-lime/10 blur-[110px] transition-opacity duration-1000"
        />
        {/* ghost acronym letter — echo of the letters scroll chapter */}
        <span
          ref={letterRef}
          aria-hidden
          className="pointer-events-none absolute -left-4 top-1/2 hidden -translate-y-1/2 select-none font-extrabold uppercase leading-none text-transparent [font-size:clamp(9rem,19vw,15rem)] [-webkit-text-stroke:2px_rgba(255,255,255,0.14)] md:block"
        >
          {active.name.charAt(0)}
        </span>

        <svg
          viewBox="0 0 500 500"
          role="img"
          aria-label={active.alt ?? active.name}
          className="relative z-10 h-auto w-full max-w-[440px] drop-shadow-[0_24px_80px_rgba(0,0,0,0.55)] md:max-w-[500px]"
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
              ref={imageRef}
              href={items[0].image}
              width="500"
              height="500"
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
