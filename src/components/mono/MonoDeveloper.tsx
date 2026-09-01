"use client";

/* /mono — Төсөл хэрэгжүүлэгч. A true running timeline:
   DESKTOP — pinned full-screen; scroll drives the track left→right while
   a giant outlined YEAR counter runs 2006 → 2026 (piecewise-mapped so
   the year always matches the station in focus). Stations are sorted
   chronologically; the one nearest the viewport centre zooms up to
   1.1x while the others collapse down to 0.3x, growing out of the lime
   rail (years rise from it, cards hang off it). The rail itself stays
   continuous — only the content scales.
   MOBILE  — ХЭВТЭЭ гүйдэг карусель. Өмнө нь босоо цаг хугацааны шугам
   байсан: төсөл бүр бүтэн дэлгэц эзэлж, 8 төсөлтэй үед хэрэглэгч зөвхөн
   энэ хэсгийг давахын тулд 8 дэлгэц гүйлгэдэг байв. Одоо картууд хажуу
   тийш snap-тайгаар гүйж, доор нь явцын зурвас байрлана — хэсэг нэг
   дэлгэцэд багтана.
   Project photos are Elysium render stand-ins until Монкон supplies
   real project photography. */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";
import { flatSectionTone } from "@/lib/theme-css";

const YEAR_START = 2006;
const YEAR_END = 2026;

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
  const mobileBar = useRef<HTMLSpanElement>(null);
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

      /* MOBILE — картууд ХЭВТЭЭ гүйнэ. Гүйлт нь хуудсынх биш каруселийн
         өөрийнх тул ScrollTrigger хэрэггүй: доорх `scroll` сонсогч
         явцын зурвасыг шууд хөдөлгөнө. Энд зөвхөн картын зурган дээрх
         анхны "суух" хөдөлгөөн үлдэнэ. */
      const imgs = Array.from(tr.querySelectorAll<HTMLElement>("[data-md-img]"));
      if (imgs.length) {
        gsap.from(imgs, {
          scale: 1.14,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: { trigger: tr, start: "top 88%" },
        });
      }
    }, sec);
    return () => ctx.revert();
  }, [d.projects, d.logo]);

  /* Гар утасны каруселийн явцын зурвас. Хэвтээ `scrollLeft`-ыг 0–1
     болгож `scaleX` руу буулгана — рендер дахин ажиллуулахгүй тул
     хуруу дагасан зөөлөн хөдөлгөөн гарна. Ширээний компьютерт track нь
     гүйдэггүй (`md:overflow-visible`) — сонсогч ажиллах ч утга 0 хэвээр,
     зурвас нь `md:hidden`. */
  useEffect(() => {
    const tr = track.current;
    const bar = mobileBar.current;
    if (!tr || !bar) return;
    const onScroll = () => {
      const max = tr.scrollWidth - tr.clientWidth;
      const p = max > 0 ? tr.scrollLeft / max : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p)) || 0.001})`;
    };
    onScroll();
    tr.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      tr.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [d.projects]);

  return (
    <section
      id="developer"
      ref={root}
      data-bg="developer"
      data-tone={flatSectionTone(site.theme, "developer")}
      className="relative border-b border-fg/10 bg-ground md:h-[380vh]"
    >
      <div className="flex flex-col justify-center overflow-hidden py-24 md:sticky md:top-0 md:h-[100svh] md:py-0">
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

        {/* header — kicker, тэгээд ширээний компьютерт ХОЁР багана: нэр +
            тоонууд зүүн талд, компанийн тайлбар баруун талд өргөн
            зурвасаар. Өмнө нь бүгд дээрээс доош овоорч ~410px өндөр
            болж, пиннэсэн 100svh кадрын доод ирмэгээр төслийн
            картуудыг тайрдаг байв. Хажуу тийш нь дэлгэхэд толгой
            хоёр дахин намсаж, хэсэг нэг дэлгэцэд багтана. Гар
            утсанд хуучин овоолсон дараалал хэвээр. */}
        <div className="relative z-10 mx-auto w-full max-w-page px-6 md:px-10">
          <MonoKicker reveal>{d.kicker}</MonoKicker>
          <div className="mt-4 flex flex-col gap-4 md:mt-5 md:grid md:grid-cols-[0.85fr_1.15fr] md:items-start md:gap-x-12 md:gap-y-5">
            <h2
              data-reveal="heading"
              className="max-w-xl mono-h2 md:col-start-1 md:row-start-1 md:max-w-none"
            >
              {d.name}
            </h2>
            {/* `.mono-lead`-ийн 46ch хэмжүүр нэг баганад зөв, гэхдээ энд
                6 мөр болж өндрөө иднэ. Ширээний компьютерт хязгаарыг нь
                тайлж, баруун баганын өргөнөөр (≈75ch, max-w-page-аар
                таглагдсан) сунгав — 4 мөр болж багасна. Утилит нь
                components давхаргыг дардаг тул `max-w-none` хүчинтэй. */}
            <p
              data-reveal="up"
              className="mono-lead md:col-start-2 md:row-span-2 md:row-start-1 md:max-w-none"
            >
              {d.body}
            </p>
            <div data-reveal="up" className="mt-2 flex gap-10 md:col-start-1 md:row-start-2 md:mt-0">
              <div>
                <p className="text-2xl font-extrabold text-fg md:text-3xl">{d.since}</p>
                <p className="mt-1 text-label font-medium uppercase tracking-caps text-fg/45">{d.sinceLabel}</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-fg md:text-3xl">{d.projectCount}</p>
                <p className="mt-1 text-label font-medium uppercase tracking-caps text-fg/45">{d.projectCountLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* timeline */}
        {/* Толгой ба цаг хугацааны шугамын хоорондох зай — намхан дэлгэц
            дээр 56px тогтмол зай картуудыг доороос нь тайрдаг байсан тул
            svh-д уясан clamp. Картуудын өндөр аль хэдийн svh-тэй. */}
        <div className="relative z-10 mt-12 md:mt-[clamp(1.5rem,4.5svh,3.5rem)]">
          {/* Гар утсанд ХЭВТЭЭ snap-карусель (`overflow-x-auto`), ширээний
              компьютерт GSAP-аар зөөгддөг эгнээ (`md:overflow-visible`). */}
          <div
            ref={track}
            className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-6 px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:snap-none md:items-start md:gap-[4vw] md:overflow-visible md:px-0 md:pb-0 md:pl-10 md:pr-10 [&::-webkit-scrollbar]:hidden"
          >
            {/* lime progress rail (desktop) */}
            <div
              ref={prog}
              aria-hidden
              className="absolute left-0 top-20 hidden h-px w-full origin-left bg-lime md:block"
            />

            {stations.map((p, i) => (
              <div
                key={`${p.title}-${i}`}
                data-reveal="up"
                data-md-station
                className="relative w-[78vw] max-w-[340px] shrink-0 snap-start md:w-[30vw] md:max-w-none lg:w-[26vw]"
              >
                {/* year row — fixed height so the rail lines up across stations */}
                <div data-md-year className="flex h-14 items-end justify-between pb-3 md:h-20">
                  <p className="text-[clamp(2rem,3.6vw,3.2rem)] font-bold leading-none tracking-tight text-fg/90">
                    {p.years.split("–")[0]}
                    <span className="text-fg/35">–{p.years.split("–")[1]}</span>
                  </p>
                  <span className="pb-1 text-label font-bold text-fg/30">0{i + 1}</span>
                </div>

                {/* rail segment + node (mobile: left rail handled per-card) */}
                <div aria-hidden className="relative hidden h-px w-full bg-night/15 md:block">
                  <span className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-lime shadow-[0_0_0_4px_var(--color-ground)]" />
                </div>

                {/* image card — staggered heights for editorial rhythm */}
                <article
                  data-md-card
                  className={`group relative mt-4 overflow-hidden rounded-2xl border border-fg/10 bg-surface ${
                    i % 2 === 0 ? "md:mt-7" : "md:mt-12"
                  }`}
                >
                  <div className={`w-full overflow-hidden h-[228px] ${i % 2 === 0 ? "md:h-[min(320px,36svh)]" : "md:h-[min(260px,30svh)]"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      data-md-img
                      src={p.image}
                      alt={`${p.title} — ${d.name}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-lg font-extrabold tracking-tight text-white md:text-xl">{p.title}</h3>
                    <p className="mt-1 text-body text-white/65">{p.meta}</p>
                  </div>
                  <span className="glass-dark glass-chip absolute right-4 top-4 rounded-full px-3 py-1 text-label font-bold text-white/85">
                    {p.units}
                  </span>
                </article>
              </div>
            ))}

            {/* end spacer so the last card travels fully into view */}
            <div aria-hidden className="hidden md:block md:w-[24vw] md:shrink-0" />
          </div>

          {/* Гар утас — каруселийн явцын зурвас + гүйлгэх сануулга */}
          <div className="mt-5 flex items-center gap-4 px-6 md:hidden">
            {/* Тоолуур ЗҮҮН талд — баруун доод буланг чатботын бөмбөлөг
                эзэлдэг тул тэнд бичиг тавьж болохгүй. */}
            <span className="shrink-0 text-2xs font-semibold uppercase tracking-caps-lg text-fg/45">
              {stations.length} төсөл →
            </span>
            <span aria-hidden className="h-px flex-1 bg-fg/15">
              <span
                ref={mobileBar}
                data-md-bar
                className="block h-px w-full origin-left scale-x-0 bg-lime"
              />
            </span>
          </div>
        </div>

        <p className="relative z-10 mt-6 hidden px-10 text-label font-medium uppercase tracking-caps-lg text-fg/45 md:block">
          {d.scrollHint}
        </p>
      </div>
    </section>
  );
}
