"use client";

/* /mono — ELYS concept. Four advantages with imagery; on desktop the
   section pins and the panels scroll horizontally with the page, on
   mobile the strip is a snap carousel. Light paper surface. */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { FINAL } from "@/lib/content";
import { MonoKicker, ZoomMedia, useDragScroll } from "./shared";

const IMAGES = [
  { src: "/images/exterior-garden-path.jpg", alt: "Эргономик төлөвлөлт" },
  { src: "/images/aerial-courtyard-promenade.jpg", alt: "Ногоон байгууламж" },
  { src: "/images/exterior-cluster-dusk.jpg", alt: "Аюулгүй байдал" },
  { src: "/images/amenity-canal-blue.jpg", alt: "Эрчим хүчний хэмнэлт" },
];

export function MonoElys() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useDragScroll<HTMLDivElement>(track);

  useEffect(() => {
    const sec = root.current;
    const tr = track.current;
    if (!sec || !tr) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (reduce || !isDesktop) return;

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth + 40);
      gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
    }, sec);
    return () => ctx.revert();
  }, []);

  return (
    <section id="elys" ref={root} className="relative border-b border-night/10 bg-paper md:h-[380vh]">
      <div className="flex flex-col justify-center overflow-hidden py-16 md:sticky md:top-0 md:h-[100svh] md:py-0">
        <div className="mx-auto w-full max-w-[1500px] px-5 md:px-10">
          <MonoKicker>{FINAL.elys.kicker}</MonoKicker>
          <h2 className="mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night">
            {FINAL.elys.title}
          </h2>
        </div>

        <div
          {...drag}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-14 md:snap-none md:overflow-visible md:px-10 md:pb-0"
        >
          {FINAL.elys.items.map((item, i) => (
            <article
              key={item.title}
              className="group w-[82vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-night/10 bg-white sm:w-[60vw] md:w-[44vw] lg:w-[36vw]"
            >
              <div className="relative">
                <ZoomMedia
                  src={IMAGES[i].src}
                  alt={IMAGES[i].alt}
                  className="aspect-[16/10] w-full"
                  imgClassName="transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-night/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
                  E · 0{i + 1}
                </span>
              </div>
              <div className="p-6 md:p-7">
                <h3 className="text-xl font-extrabold tracking-tight text-night md:text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-night/65">{item.body}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 hidden px-10 text-[11px] font-medium uppercase tracking-[0.24em] text-night/40 md:block">
          Гүйлгэж үргэлжлүүлэх →
        </p>
      </div>
    </section>
  );
}
