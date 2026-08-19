"use client";

/* /mono — Төсөл хэрэгжүүлэгч. A true running timeline:
   DESKTOP — pinned full-screen; scroll drives the track left→right while
   a giant outlined YEAR counter runs 2006 → 2026 (piecewise-mapped so
   the year always matches the station in focus). Stations are sorted
   chronologically; the one nearest the viewport centre zooms up to
   1.1x while the others collapse down to 0.3x, growing out of the lime
   rail (years rise from it, cards hang off it). The rail itself stays
   continuous — only the content scales.
   MOBILE  — vertical rail timeline: lime fill follows the scroll, dots
   pop as stations arrive, images zoom down into place.
   Project photos are Elysium render stand-ins until Монкон supplies
   real project photography. */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";

const YEAR_START = 2006;
const YEAR_END = 2026;

/** Станцын картын өргөн: утсан дээр багтаамжийн бүтэн өргөн хасах
 *  рельсний зай (`pl-10 pr-5`), ширээн дээр 30vw → 26vw. */
const STATION_SIZES = "(max-width: 767px) calc(100vw - 60px), (max-width: 1023px) 30vw, 26vw";

/** "2014–2019" → 2014. Буруу бичсэн ч эрэмбэ унахгүй. */
const startYear = (years: string) => {
  const n = parseInt(years, 10);
  return Number.isFinite(n) ? n : 0;
};

export function MonoDeveloper({ site }: { site: SiteContent }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const prog = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const logoMark = useRef<HTMLImageElement>(null);
  const mobileProg = useRef<HTMLDivElement>(null);
  const d = site.developer;

  /* chronological stations (sorted by start year) */
  const stations = [...d.projects].sort((a, b) => startYear(a.years) - startYear(b.years));

  useEffect(() => {
    const sec = root.current;
    const tr = track.current;
    if (!sec || !tr) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;

    const ctx = gsap.context(() => {
      if (isDesktop) {
        const stBase = {
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
        };
        const sts = Array.from(tr.querySelectorAll<HTMLElement>("[data-md-station]"));
        const centerOf = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2;
        const travel = () => sec.offsetHeight - window.innerHeight;

        // the track travels through the MIDDLE 70% of the pin: the first
        // station is centred (and big) from the very start, the last one
        // is centred at the very end. The outer 15% margins are the year
        // counter's 2006 → run-in and → 2026 run-out.
        const T0 = 0.15;
        const T1 = 0.85;
        gsap.fromTo(
          tr,
          { x: () => window.innerWidth / 2 - centerOf(sts[0]) },
          {
            x: () => window.innerWidth / 2 - centerOf(sts[sts.length - 1]),
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: () => "top+=" + travel() * T0 + " top",
              end: () => "top+=" + travel() * T1 + " top",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          }
        );

        // the running year: full-pin progress → year, anchored so the
        // counter reads a station's start year exactly when it is centred
        const years = d.projects.map((p) => startYear(p.years)).sort((a, b) => a - b);
        const anchors: [number, number][] = [
          [0, YEAR_START],
          ...years.map(
            (y, i) => [T0 + (i / Math.max(1, years.length - 1)) * (T1 - T0), y] as [number, number]
          ),
          [1, YEAR_END],
        ];
        const yearAt = (p: number) => {
          for (let i = 1; i < anchors.length; i++) {
            if (p <= anchors[i][0]) {
              const [p0, y0] = anchors[i - 1];
              const [p1, y1] = anchors[i];
              return Math.round(y0 + ((p - p0) / (p1 - p0 || 1)) * (y1 - y0));
            }
          }
          return YEAR_END;
        };
        if (prog.current) {
          gsap.fromTo(
            prog.current,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                ...stBase,
                onUpdate: (self) => {
                  if (mark.current) mark.current.textContent = String(yearAt(self.progress));
                },
              },
            }
          );
        }
        // the backdrop mark (year counter or company icon) drifts slower
        // than the track → parallax depth
        const drift = mark.current ?? logoMark.current;
        if (drift) {
          gsap.fromTo(drift, { xPercent: 6 }, { xPercent: -10, ease: "none", scrollTrigger: stBase });
        }

        // focal zoom: the station nearest the viewport centre grows to
        // 1.1x; the rest collapse toward 0.3x. Years rise out of the
        // rail, cards hang off it — the rail itself never scales.
        const focal = () => {
          const r0 = sec.getBoundingClientRect();
          if (r0.bottom < 0 || r0.top > window.innerHeight) return;
          const cx = window.innerWidth / 2;
          sts.forEach((s) => {
            const r = s.getBoundingClientRect();
            const t = Math.min(Math.abs(r.left + r.width / 2 - cx) / (window.innerWidth * 0.5), 1);
            const e = t * t * (3 - 2 * t); // smoothstep falloff
            const scale = 1.1 - e * 0.8;
            const year = s.querySelector("[data-md-year]");
            const card = s.querySelector("[data-md-card]");
            // Төвөөс хол картууд ~0.15 хүртэл бүдгэрч, хар дэвсгэр рүү шингэнэ
            // (зөвхөн голд байгаа төсөл тод — spotlight эффект). Он тодрол
            // өмнөх түвшиндээ — цаг хугацааны шугам уншигдахуйц хэвээр.
            if (year) gsap.set(year, { scale, transformOrigin: "center bottom", opacity: 1 - e * 0.55 });
            if (card) gsap.set(card, { scale, transformOrigin: "center top", opacity: 1 - e * 0.85 });
          });
        };
        focal();
        gsap.ticker.add(focal);
        return () => gsap.ticker.remove(focal);
      }

      // MOBILE — vertical timeline choreography
      if (mobileProg.current) {
        gsap.fromTo(
          mobileProg.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: tr, start: "top 70%", end: "bottom 85%", scrub: 0.4 },
          }
        );
      }
      tr.querySelectorAll<HTMLElement>("[data-md-card]").forEach((card) => {
        const img = card.querySelector("[data-md-img]");
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.22 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: card, start: "top 95%", end: "top 35%", scrub: 0.5 },
            }
          );
        }
      });
      tr.querySelectorAll<HTMLElement>("[data-md-dot]").forEach((dot) => {
        gsap.fromTo(
          dot,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.55,
            ease: "back.out(2.2)",
            scrollTrigger: { trigger: dot, start: "top 82%" },
          }
        );
      });
    }, sec);
    return () => ctx.revert();
  }, [d.projects, d.logo]);

  return (
    <section id="developer" ref={root} className="relative border-b border-night/10 bg-ground md:h-[380vh]">
      <div className="flex flex-col justify-center overflow-hidden py-20 md:sticky md:top-0 md:h-[100svh] md:py-0">
        {/* backdrop mark — the company icon when one is set, otherwise the
            giant year counter running 2006 → 2026 (desktop only) */}
        {d.logo ? (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[2vh] left-[4vw] hidden select-none md:block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={logoMark}
              src={d.logo}
              alt=""
              decoding="async"
              className="h-[clamp(9rem,22vw,18rem)] w-auto opacity-[0.13]"
            />
          </div>
        ) : (
          <div
            ref={mark}
            aria-hidden
            className="pointer-events-none absolute bottom-[2vh] left-[4vw] hidden select-none whitespace-nowrap font-bold uppercase leading-none tracking-tight text-transparent md:block md:text-[clamp(9rem,24vw,20rem)]"
            style={{ WebkitTextStroke: "1.5px rgba(21,23,23,0.14)" }}
          >
            2006
          </div>
        )}

        {/* header — kicker, name, then the company blurb directly beneath it
            (it used to sit off to the right, where it collided with the
            timeline and the backdrop mark) */}
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 md:px-10">
          <MonoKicker reveal>{d.kicker}</MonoKicker>
          <div className="mt-4 flex flex-col gap-4">
            <h2 data-reveal="heading" className="max-w-xl text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night">
              {d.name}
            </h2>
            <p data-reveal="up" className="max-w-2xl text-sm leading-relaxed text-night/60">{d.body}</p>
          </div>
          <div data-reveal="up" className="mt-6 flex gap-10">
            <div>
              <p className="text-2xl font-extrabold text-night md:text-3xl">{d.since}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-night/45">{d.sinceLabel}</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-night md:text-3xl">{d.projectCount}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-night/45">{d.projectCountLabel}</p>
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

            {stations.map((p, i) => (
              <div key={`${p.title}-${i}`} data-reveal="up" data-md-station className="relative md:w-[30vw] md:shrink-0 lg:w-[26vw]">
                {/* year row — fixed height so the rail lines up across stations */}
                <div data-md-year className="flex h-20 items-end justify-between pb-3">
                  <p className="text-[clamp(2rem,3.6vw,3.2rem)] font-bold leading-none tracking-tight text-night/90">
                    {p.years.split("–")[0]}
                    <span className="text-night/35">–{p.years.split("–")[1]}</span>
                  </p>
                  <span className="pb-1 text-[11px] font-bold text-night/30">0{i + 1}</span>
                </div>

                {/* rail segment + node (mobile: left rail handled per-card) */}
                <div aria-hidden className="relative hidden h-px w-full bg-night/15 md:block">
                  <span className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-lime shadow-[0_0_0_4px_var(--color-ground)]" />
                </div>
                <span aria-hidden data-md-dot className="absolute -left-[30px] top-[4.5rem] h-3 w-3 rounded-full bg-lime md:hidden" />

                {/* image card — staggered heights for editorial rhythm */}
                <article
                  data-md-card
                  className={`group relative mt-5 overflow-hidden rounded-2xl border border-night/10 bg-surface ${
                    i % 2 === 0 ? "md:mt-7" : "md:mt-12"
                  }`}
                >
                  <div className={`relative w-full overflow-hidden ${i % 2 === 0 ? "h-[240px] md:h-[min(320px,36svh)]" : "h-[200px] md:h-[min(260px,30svh)]"}`}>
                    <Image
                      data-md-img
                      src={p.image}
                      alt={`${p.title} — ${d.name}`}
                      fill
                      sizes={STATION_SIZES}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-lg font-extrabold tracking-tight text-white md:text-xl">{p.title}</h3>
                    <p className="mt-1 text-[13px] text-white/65">{p.meta}</p>
                  </div>
                  <span className="absolute right-4 top-4 rounded-full bg-night/60 px-3 py-1 text-[11px] font-bold text-white/85 backdrop-blur">
                    {p.units}
                  </span>
                </article>
              </div>
            ))}

            {/* end spacer so the last card travels fully into view */}
            <div aria-hidden className="hidden md:block md:w-[24vw] md:shrink-0" />
          </div>

          {/* mobile left rail — lime fill follows the scroll */}
          <div aria-hidden className="absolute bottom-0 left-4 top-0 w-px bg-night/15 md:hidden">
            <div ref={mobileProg} className="h-full w-px origin-top scale-y-0 bg-lime" />
          </div>
        </div>

        <p className="relative z-10 mt-6 hidden px-10 text-[11px] font-medium uppercase tracking-[0.24em] text-night/45 md:block">
          {d.scrollHint}
        </p>
      </div>
    </section>
  );
}
