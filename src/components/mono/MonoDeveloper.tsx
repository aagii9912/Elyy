"use client";

/* /mono — Төсөл хэрэгжүүлэгч. Creative timeline:
   DESKTOP — pinned full-screen; scroll drives the timeline left→right,
   a lime rail fills, giant outlined "МОНКОН" watermark drifts in
   parallax, big display years sit on the rail above image cards
   (staggered heights, editorial rhythm).
   MOBILE  — vertical rail timeline with image cards.
   Project photos are Elysium render stand-ins until Монкон supplies
   real project photography. */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { FINAL } from "@/lib/content";
import { MonoKicker } from "./shared";

const PROJECT_IMAGES = [
  { src: "/images/exterior-towers-winter.jpg", alt: "Комфорт хотхон" },
  { src: "/images/exterior-lowangle-towers.jpg", alt: "Мандала хотхон" },
  { src: "/images/aerial-courtyard-promenade.jpg", alt: "Мандала гарден" },
  { src: "/images/hero-towers-bluesky.png", alt: "360, 365 Мандала Тауэр" },
];

export function MonoDeveloper() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const prog = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const { developer: d } = FINAL;

  useEffect(() => {
    const sec = root.current;
    const tr = track.current;
    if (!sec || !tr) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (reduce || !isDesktop) return;

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth + 80);
      const st = {
        trigger: sec,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        invalidateOnRefresh: true,
      };
      gsap.to(tr, { x: () => -distance(), ease: "none", scrollTrigger: st });
      if (prog.current) {
        gsap.fromTo(prog.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: st });
      }
      // watermark drifts slower than the track → parallax depth
      if (mark.current) {
        gsap.fromTo(
          mark.current,
          { xPercent: 4 },
          { xPercent: -14, ease: "none", scrollTrigger: st }
        );
      }
      // images gently de-zoom as the timeline travels
      tr.querySelectorAll("[data-md-img]").forEach((img) => {
        gsap.fromTo(img, { scale: 1.14 }, { scale: 1, ease: "none", scrollTrigger: st });
      });
    }, sec);
    return () => ctx.revert();
  }, []);

  return (
    <section id="developer" ref={root} className="relative border-b border-night/10 bg-night md:h-[380vh]">
      <div className="flex flex-col justify-center overflow-hidden py-20 md:sticky md:top-0 md:h-[100svh] md:py-0">
        {/* watermark — desktop only */}
        <div
          ref={mark}
          aria-hidden
          className="pointer-events-none absolute bottom-[4vh] left-0 hidden select-none whitespace-nowrap text-[clamp(7rem,20vw,17rem)] font-bold uppercase leading-none tracking-tight text-transparent md:block"
          style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.10)" }}
        >
          Монкон · Монкон
        </div>

        {/* header */}
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 md:px-10">
          <MonoKicker tone="dark">{d.kicker}</MonoKicker>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-xl text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-white">
              {d.name}
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-white/60">{d.body}</p>
          </div>
          <div className="mt-6 flex gap-10">
            <div>
              <p className="text-2xl font-extrabold text-white md:text-3xl">{d.since}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">оноос</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white md:text-3xl">{d.projectCount}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">төсөл</p>
            </div>
          </div>
        </div>

        {/* timeline */}
        <div className="relative z-10 mt-12 md:mt-14">
          <div
            ref={track}
            className="relative flex flex-col gap-14 pl-10 pr-5 md:flex-row md:items-start md:gap-[4vw] md:pl-10 md:pr-10"
          >
            {/* lime progress rail (desktop) */}
            <div
              ref={prog}
              aria-hidden
              className="absolute left-0 top-20 hidden h-px w-full origin-left bg-lime md:block"
            />

            {d.projects.map((p, i) => (
              <div key={p.title} className="relative md:w-[30vw] md:shrink-0 lg:w-[26vw]">
                {/* year row — fixed height so the rail lines up across stations */}
                <div className="flex h-20 items-end justify-between pb-3">
                  <p className="text-[clamp(2rem,3.6vw,3.2rem)] font-bold leading-none tracking-tight text-white/90">
                    {p.years.split("–")[0]}
                    <span className="text-white/40">–{p.years.split("–")[1]}</span>
                  </p>
                  <span className="pb-1 text-[11px] font-bold text-white/30">0{i + 1}</span>
                </div>

                {/* rail segment + node (mobile: left rail handled per-card) */}
                <div aria-hidden className="relative hidden h-px w-full bg-white/15 md:block">
                  <span className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-lime shadow-[0_0_0_4px_rgba(21,23,23,1)]" />
                </div>
                <span aria-hidden className="absolute -left-[30px] top-[4.5rem] h-3 w-3 rounded-full bg-lime md:hidden" />

                {/* image card — staggered heights for editorial rhythm */}
                <article
                  className={`group relative mt-5 overflow-hidden rounded-2xl border border-white/10 ${
                    i % 2 === 0 ? "md:mt-7" : "md:mt-12"
                  }`}
                >
                  <div className={`w-full overflow-hidden ${i % 2 === 0 ? "h-[240px] md:h-[min(320px,36svh)]" : "h-[200px] md:h-[min(260px,30svh)]"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      data-md-img
                      src={PROJECT_IMAGES[i].src}
                      alt={PROJECT_IMAGES[i].alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-lg font-extrabold tracking-tight text-white md:text-xl">{p.title}</h3>
                    <p className="mt-1 text-[13px] text-white/65">{p.meta}</p>
                  </div>
                  <span className="absolute right-4 top-4 rounded-full bg-night/60 px-3 py-1 text-[11px] font-bold text-white/85 backdrop-blur">
                    {p.units} айл
                  </span>
                </article>
              </div>
            ))}

            {/* end spacer so the last card travels fully into view */}
            <div aria-hidden className="hidden md:block md:w-[24vw] md:shrink-0" />
          </div>

          {/* mobile left rail */}
          <div aria-hidden className="absolute bottom-0 left-4 top-0 w-px bg-white/15 md:hidden" />
        </div>

        <p className="relative z-10 mt-6 hidden px-10 text-[11px] font-medium uppercase tracking-[0.24em] text-white/40 md:block">
          Гүйлгэж үргэлжлүүлэх →
        </p>
      </div>
    </section>
  );
}
