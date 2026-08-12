"use client";

/* /mono — Өрөөний сонголт. Horizontal carousel of the real axonometric
   renders, trimmed to the plan and shown on the render's own studio plate
   (#dbe3ef). Клик → lightbox, өнцөг бүрийг гүйлгэж үзнэ.
   Типүүд, зураг, текст бүгд админаас (`/admin/site` → Өрөөний сонголт)
   удирдагдана. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import type { SiteContent } from "@/lib/site-content";
import { MonoKicker, useDragScroll } from "./shared";

type Unit = SiteContent["apartments"]["units"][number];

export function MonoApartments({ site }: { site: SiteContent }) {
  const { apartments } = site;
  const drag = useDragScroll<HTMLDivElement>();
  const [open, setOpen] = useState<number | null>(null);
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  /** Flattened view list — lightbox нь бүх типийн дундуур шууд гүйнэ. */
  const slides = useMemo(
    () =>
      apartments.units.flatMap((unit, unitIndex) =>
        unit.views.map((view, viewIndex) => ({ unit, unitIndex, view, viewIndex }))
      ),
    [apartments.units]
  );

  const meta = (u: Unit) => (u.area ? `${u.rooms} · ${u.area}` : u.rooms);
  const alt = (u: Unit, i: number) => `${u.title} — аксонометр төлөвлөгөө, өнцөг ${i + 1}`;

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: number) =>
      setOpen((i) => (i === null ? i : (i + dir + slides.length) % slides.length)),
    [slides.length]
  );

  const openAt = (index: number) => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    setOpen(index);
  };

  const isOpen = open !== null;

  /* Lightbox нээлттэй үед хуудасны гүйлтийг зогсоож, фокусыг барина. */
  useEffect(() => {
    if (!isOpen) return;
    lenis?.stop();
    closeRef.current?.focus();
    return () => {
      lenis?.start();
      restoreRef.current?.focus?.();
    };
  }, [isOpen, lenis]);

  /* Esc — хаах, сум — өнцөг солих. */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  const current = open === null ? null : slides[open];

  return (
    <section id="apartments" className="border-b border-night/10 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <MonoKicker reveal>{apartments.kicker}</MonoKicker>
            <h2 data-reveal="heading" className="mt-4 max-w-xl text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night">
              {apartments.title}
            </h2>
          </div>
          <p data-reveal="up" data-reveal-delay="0.15" className="max-w-sm text-sm leading-relaxed text-night/60">{apartments.body}</p>
        </div>

        <div
          {...drag}
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {apartments.units.map((unit, unitIndex) => {
            const firstSlide = slides.findIndex((s) => s.unitIndex === unitIndex);
            return (
              <article
                key={`${unit.title}-${unitIndex}`}
                data-reveal="up"
                className="group w-[74vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-night/10 bg-white transition-colors duration-300 hover:border-night/30 sm:w-[46vw] lg:w-[30vw] xl:w-[23vw]"
              >
                <button
                  type="button"
                  data-cursor-hover
                  onClick={() => firstSlide >= 0 && openAt(firstSlide)}
                  disabled={firstSlide < 0}
                  /* Плейт өнгө = рендерийн студийн дэвсгэр, ингэснээр
                     object-contain-ий хажуугийн зай нь салангид харагдахгүй. */
                  className="relative block w-full cursor-zoom-in overflow-hidden bg-[#dbe3ef] disabled:cursor-default"
                  aria-label={`${unit.title} — аксонометр зургийг томруулж үзэх`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={unit.thumb || unit.views[0]}
                    alt={alt(unit, 0)}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-night px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                    {unit.title}
                  </span>
                  {unit.views.length > 0 && (
                    <span className="absolute bottom-4 right-4 rounded-full border border-night/15 bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-night backdrop-blur">
                      {unit.views.length} {apartments.viewsWord}
                    </span>
                  )}
                </button>
                <div className="flex items-end justify-between border-t border-night/10 p-6">
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight text-night">{unit.rooms}</h3>
                    <p className="mt-1 text-sm font-semibold text-night/55">{unit.area}</p>
                  </div>
                  <a
                    href="#contact"
                    data-cursor-hover
                    className="rounded-full border border-night/25 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-night transition-colors group-hover:border-night group-hover:bg-night group-hover:text-white"
                  >
                    {apartments.cardCta}
                  </a>
                </div>
              </article>
            );
          })}

          {/* closing card — pushes to contact */}
          <a
            href="#contact"
            data-cursor-hover
            data-reveal="zoom"
            className="flex w-[74vw] shrink-0 snap-start flex-col items-start justify-between rounded-2xl bg-night p-6 text-white sm:w-[46vw] lg:w-[30vw] xl:w-[23vw]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">{apartments.ctaCard.kicker}</p>
            <div>
              <p className="text-2xl font-extrabold leading-tight tracking-tight">
                {apartments.ctaCard.title}
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold">
                {apartments.ctaCard.link} <span aria-hidden>→</span>
              </p>
            </div>
          </a>
        </div>
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${current.unit.title} — аксонометр төлөвлөгөө`}
          className="fixed inset-0 z-[80] flex flex-col bg-white"
          onClick={close}
        >
          <div className="flex items-start justify-between gap-4 px-5 py-5 md:px-10" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-mist">
                <span aria-hidden className="h-px w-8 bg-lime" />
                {current.unit.title}
              </p>
              <p className="mt-2 text-lg font-extrabold tracking-tight text-night">{meta(current.unit)}</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              data-cursor-hover
              onClick={close}
              aria-label="Хаах"
              className="rounded-full border border-night/25 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-night transition-colors hover:bg-night hover:text-white"
            >
              Хаах ✕
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-5 pb-2 md:px-10" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.view}
              src={current.view}
              alt={alt(current.unit, current.viewIndex)}
              decoding="async"
              className="max-h-full max-w-full rounded-2xl object-contain"
            />
          </div>

          <div className="flex items-center justify-between gap-4 px-5 py-5 md:px-10" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              data-cursor-hover
              onClick={() => step(-1)}
              aria-label="Өмнөх зураг"
              className="rounded-full border border-night/25 px-4 py-2 text-sm font-bold text-night transition-colors hover:bg-night hover:text-white"
            >
              ←
            </button>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-night/50">
              {apartments.viewsWord} {current.viewIndex + 1}/{current.unit.views.length} · {(open ?? 0) + 1}/{slides.length}
            </p>
            <button
              type="button"
              data-cursor-hover
              onClick={() => step(1)}
              aria-label="Дараах зураг"
              className="rounded-full border border-night/25 px-4 py-2 text-sm font-bold text-night transition-colors hover:bg-night hover:text-white"
            >
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
