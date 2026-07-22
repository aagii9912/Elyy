"use client";

/* /mono — Өрөөний сонголт. Horizontal carousel of axonometric-style
   plans (parametric isometric SVG — monochrome walls, lime glass as the
   tiny accent). Room count + m² explicit per the brief. */

import { FINAL } from "@/lib/content";
import { MonoKicker, useDragScroll } from "./shared";

/** Isometric unit plan. `rooms` (1–4) draws partition walls. */
function IsoPlan({ rooms }: { rooms: number }) {
  const iso = (x: number, y: number, z = 0) => `${50 + (x - y) * 30},${58 + (x + y) * 15 - z * 26}`;
  const wall = (x1: number, y1: number, x2: number, y2: number, h: number) =>
    `M${iso(x1, y1)} L${iso(x2, y2)} L${iso(x2, y2, h)} L${iso(x1, y1, h)} Z`;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <path d={`M${iso(0, 0)} L${iso(1, 0)} L${iso(1, 1)} L${iso(0, 1)} Z`} fill="#151717" opacity="0.08" />
      <path d={wall(0, 0, 1, 0, 0.42)} fill="#151717" />
      <path d={wall(1, 0, 1, 1, 0.42)} fill="#3a3d3c" />
      {rooms >= 2 && <path d={wall(0.52, 0, 0.52, 1, 0.42)} fill="#151717" opacity="0.9" />}
      {rooms >= 3 && <path d={wall(0, 0.52, 0.52, 0.52, 0.42)} fill="#3a3d3c" opacity="0.9" />}
      {rooms >= 4 && <path d={wall(0.52, 0.62, 1, 0.62, 0.42)} fill="#151717" opacity="0.9" />}
      <path d={wall(0.15, 0, 0.42, 0, 0.34)} fill="#b4d656" opacity="0.9" />
      {rooms >= 3 && <path d={wall(0.6, 0, 0.88, 0, 0.34)} fill="#b4d656" opacity="0.9" />}
    </svg>
  );
}

export function MonoApartments() {
  const drag = useDragScroll<HTMLDivElement>();

  return (
    <section id="apartments" className="border-b border-night/10 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <MonoKicker reveal>{FINAL.apartments.kicker}</MonoKicker>
            <h2 data-reveal="heading" className="mt-4 max-w-xl text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night">
              Танд тохирох орон зай
            </h2>
          </div>
          <p data-reveal="up" data-reveal-delay="0.15" className="max-w-sm text-sm leading-relaxed text-night/60">{FINAL.apartments.body}</p>
        </div>

        <div
          {...drag}
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {FINAL.apartments.types.map((t, i) => (
            <article
              key={t.title}
              data-reveal="up"
              className="group w-[74vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-night/10 bg-white transition-colors duration-300 hover:border-night/30 sm:w-[46vw] lg:w-[30vw] xl:w-[23vw]"
            >
              <div data-reveal="iso" className="aspect-square w-full bg-paper p-8">
                <IsoPlan rooms={i + 1} />
              </div>
              <div className="flex items-end justify-between p-6">
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-night">{t.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-night/55">{t.area}</p>
                </div>
                <a
                  href="#contact"
                  data-cursor-hover
                  className="rounded-full border border-night/25 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-night transition-colors group-hover:border-night group-hover:bg-night group-hover:text-white"
                >
                  Үзэх
                </a>
              </div>
            </article>
          ))}

          {/* closing card — pushes to contact */}
          <a
            href="#contact"
            data-cursor-hover
            data-reveal="zoom"
            className="flex w-[74vw] shrink-0 snap-start flex-col items-start justify-between rounded-2xl bg-night p-6 text-white sm:w-[46vw] lg:w-[30vw] xl:w-[23vw]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Аксонометр зураг</p>
            <div>
              <p className="text-2xl font-extrabold leading-tight tracking-tight">
                Төлөвлөгөөгөө менежертэй хамт сонгоорой
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold">
                Уулзалт товлох <span aria-hidden>→</span>
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
