"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import type { Swiper as SwiperType } from "swiper";

export type ApartmentSlide = {
  /** Big unit title, e.g. "A тип". */
  title: string;
  /** Room-count descriptor, e.g. "3 өрөө". */
  rooms: string;
  /** Area with unit, e.g. "79.70 м²". Missing on the 2F variants. */
  area?: string;
  /** Floor note used in place of the area, e.g. "2 давхар". */
  floor?: string;
  /** Qualitative planning descriptor derived from copy (no prices). */
  plan: string;
  /** Axonometric renders — one per angle, first one is the default view. */
  images: string[];
};

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Sobha-style single-focus apartment browser.
 * One apartment type in view at a time: a top tab bar that carries the room
 * count AND the m² for each type (per client feedback), a big serif title, a
 * left spec column derived from the existing copy (Өрөө / Талбай / Төлөвлөлт),
 * and a large axonometric drawing on the right. Types slide horizontally via
 * the tabs, the side chevrons, keyboard arrows, or a sideways drag/swipe.
 */
export function ApartmentsCarousel({ slides }: { slides: ApartmentSlide[] }) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [active, setActive] = useState(0);
  /** Selected axonometric angle per slide. */
  const [angles, setAngles] = useState<number[]>(() => slides.map(() => 0));

  // Keep external chevron/tab disabled states honest on loop-less bounds.
  const atStart = active === 0;
  const atEnd = active === slides.length - 1;

  useEffect(() => {
    if (!swiper) return;
    swiper.update();
  }, [swiper, slides.length]);

  return (
    <div className="font-gilroy text-ink">
      {/* Top tab bar — room count + m² per type (жишээ зурагт шиг дээрээ өрөөний тоо, мкв).
          Sobha treatment: 16px / weight 300 / 0.18em tracking, active = ink + 1px ink
          underline, idle = ~#a7a7a7 grey + transparent underline, thin hairline under
          the whole row. */}
      <div className="flex flex-wrap items-end gap-x-8 gap-y-2 border-b border-ink/12 sm:gap-x-12">
        {slides.map((s, i) => {
          const isActive = active === i;
          return (
            <button
              key={s.title}
              type="button"
              data-cursor-hover
              onClick={() => swiper?.slideTo(i)}
              aria-current={isActive}
              className={
                "-mb-px flex flex-col gap-1 border-b pb-3 text-left transition-colors duration-300 " +
                (isActive
                  ? "border-ink text-ink"
                  : "border-transparent text-stone hover:text-ink/70")
              }
            >
              <span className="text-base font-light uppercase leading-none tracking-[0.18em]">
                {s.rooms}
              </span>
              <span
                className={
                  "text-xs font-light tabular-nums tracking-[0.12em] transition-colors duration-300 " +
                  (isActive ? "text-ink/55" : "text-stone/70")
                }
              >
                {s.area ?? s.floor}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative mt-10 md:mt-14">
        {/* Side chevrons (desktop) */}
        <button
          type="button"
          data-cursor-hover
          aria-label="Өмнөх"
          onClick={() => swiper?.slidePrev()}
          disabled={atStart}
          className="absolute -left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ink/20 bg-bone/70 text-ink backdrop-blur-sm transition-all hover:bg-ink hover:text-bone disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-bone/70 disabled:hover:text-ink lg:flex xl:-left-6"
        >
          <Chevron dir="prev" />
        </button>
        <button
          type="button"
          data-cursor-hover
          aria-label="Дараах"
          onClick={() => swiper?.slideNext()}
          disabled={atEnd}
          className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-ink/20 bg-bone/70 text-ink backdrop-blur-sm transition-all hover:bg-ink hover:text-bone disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-bone/70 disabled:hover:text-ink lg:flex xl:-right-6"
        >
          <Chevron dir="next" />
        </button>

        <Swiper
          modules={[Keyboard, A11y]}
          grabCursor
          keyboard={{ enabled: true }}
          speed={650}
          slidesPerView={1}
          spaceBetween={40}
          onSwiper={setSwiper}
          onSlideChange={(sw) => setActive(sw.activeIndex)}
          className="!overflow-visible"
        >
          {slides.map((s, i) => {
            const angle = angles[i] ?? 0;
            return (
              <SwiperSlide key={s.title} className="!h-auto">
                <div className="grid items-start gap-12 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-16 lg:gap-24">
                  {/* Left — serif-feel gold unit title + pure typographic spec list */}
                  <div>
                    <h3 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-light leading-[1.2] tracking-[0] text-gold">
                      {s.title}
                    </h3>

                    <dl className="mt-10 md:mt-12">
                      <SpecRow label="Өрөө" value={s.rooms} />
                      {s.area ? (
                        <SpecRow label="Талбай" value={s.area} />
                      ) : s.floor ? (
                        <SpecRow label="Давхар" value={s.floor} />
                      ) : null}
                      <SpecRow label="Төлөвлөлт" value={s.plan} />
                    </dl>
                  </div>

                  {/* Right — large axonometric render (~580px) on the render's
                      own studio plate, so object-contain leaves no seam. */}
                  <div className="relative w-full max-w-[580px] justify-self-center md:justify-self-end">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#dbe3ef] md:aspect-[16/11]">
                      <Image
                        src={s.images[angle]}
                        alt={`${s.title} — аксонометр төлөвлөгөө, өнцөг ${angle + 1}`}
                        fill
                        sizes="(max-width:768px) 92vw, 580px"
                        className="object-contain"
                        draggable={false}
                      />
                    </div>

                    {s.images.length > 1 && (
                      <div className="mt-4 flex gap-2">
                        {s.images.map((src, a) => (
                          <button
                            key={src}
                            type="button"
                            data-cursor-hover
                            aria-label={`Өнцөг ${a + 1}`}
                            aria-current={a === angle}
                            onClick={() =>
                              setAngles((prev) => prev.map((v, idx) => (idx === i ? a : v)))
                            }
                            className={
                              "rounded-full border px-4 py-1.5 text-[0.7rem] font-light uppercase tracking-[0.14em] transition-colors " +
                              (a === angle
                                ? "border-ink bg-ink text-bone"
                                : "border-ink/20 text-ink/55 hover:border-ink/50 hover:text-ink")
                            }
                          >
                            {`Өнцөг ${a + 1}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Mobile / progress controls */}
        <div className="mt-10 flex items-center justify-between md:mt-12">
          <span className="text-sm font-semibold tabular-nums text-ink/45">
            {String(active + 1).padStart(2, "0")}
            <span className="mx-1 text-ink/25">/</span>
            {String(slides.length).padStart(2, "0")}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              data-cursor-hover
              aria-label="Өмнөх"
              onClick={() => swiper?.slidePrev()}
              disabled={atStart}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:bg-ink hover:text-bone disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              <Chevron dir="prev" />
            </button>
            <button
              type="button"
              data-cursor-hover
              aria-label="Дараах"
              onClick={() => swiper?.slideNext()}
              disabled={atEnd}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:bg-ink hover:text-bone disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              <Chevron dir="next" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sobha spec row — pure typographic list, no boxes/cards. Uppercase label with a
 * trailing colon, value directly beneath. 14px / weight 300 / 0.14em (~2px) tracking,
 * ink text, ~20px gap between rows.
 */
function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-5 last:mb-0">
      <dt className="text-sm font-light uppercase tracking-[0.14em] text-ink">{`${label} :`}</dt>
      <dd className="mt-1 text-sm font-light uppercase tracking-[0.14em] text-ink">{value}</dd>
    </div>
  );
}
