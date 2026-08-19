"use client";

/* Portrait showcase — бүтэн дэлгэцийн (full-bleed) слайдер: арын зураг
   солигдож, доод талд дугуй thumbnail-ууд сонголтын мөр болно.

   Бүтэц:
     • арын зургууд бүгд DOM-д зэрэг сууж, зөвхөн идэвхтэй нь opacity: 1
       (700ms crossfade) — солигдоход зураг дахин ачаалагдахгүй,
     • дээгүүр нь зөөлөн харанхуй градиент (текстийн уншигдац),
     • контент давхарга: дээд бүсэд гарчиг + идэвхтэй зүйлийн тайлбар,
       доод бүсэд thumbnail мөр ба мета зурвас (нэр · дэд гарчиг · CTA).

   Идэвхтэй индексийг ГАДНААС удирдана (`active` / `onActiveChange`) —
   дуудагч тухайн зүйлээр pop-up нээх, дүрс тэмдэг харуулах зэрэгт мөн
   ашиглана.

   Хөдөлгөөн: тайлбар ба нэр нь `key`-ээр дахин mount хийгдэж
   `.ui-fade-in` (0.5s) авна; идэвхтэй цэг зөвхөн opacity-гаар асна —
   thumbnail хооронд гүйдэггүй. prefers-reduced-motion үед globals.css
   доторх дүрэм хөдөлгөөнийг унтраана. */

import { useRef } from "react";
import { cn } from "@/lib/utils";

export type ShowcaseSlide = {
  /** React key — дуудагч давхцахгүйг баталгаажуулна. */
  id: string;
  /** Арын зураг ба thumbnail — нэг ижил эх сурвалж. */
  image: string;
  /** Дэлгэц уншигчид зориулсан зургийн тайлбар. */
  alt?: string;
  /** Мета зурвасын нэр (ж: материалын нэр). */
  name: string;
  /** Нэрийн доор/хажууд гарах дэд гарчиг (ж: брэнд). */
  role?: string;
  /** Баруун дээд буланд гарах тайлбар. */
  description: string;
};

export function PortraitShowcase({
  slides,
  active,
  onActiveChange,
  eyebrow,
  headline,
  lede,
  meta,
  action,
  className,
}: {
  slides: ShowcaseSlide[];
  /** Идэвхтэй слайдын индекс (хязгаараас гарвал эхнийх рүү эргэнэ). */
  active: number;
  onActiveChange: (index: number) => void;
  /** Гарчгийн дээрх жижиг шошго. */
  eyebrow?: React.ReactNode;
  headline: React.ReactNode;
  /** Гарчгийн доорх хэсгийн танилцуулга (слайдаас хамаарахгүй). */
  lede?: React.ReactNode;
  /** Мета зурвасын тогтмол текст (md-ээс дээш харагдана). */
  meta?: React.ReactNode;
  /** Мета зурвасын баруун захын CTA. */
  action?: React.ReactNode;
  className?: string;
}) {
  const row = useRef<HTMLDivElement>(null);
  const index = slides.length ? ((active % slides.length) + slides.length) % slides.length : 0;
  const slide = slides[index];

  /* Сум / Home / End — thumbnail мөрөнд фокус зөөж, зөөсөн зүйлээ
     шууд идэвхжүүлнэ (tablist-ийн зан төлөв). */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const last = slides.length - 1;
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? last
          : e.key === "ArrowRight" || e.key === "ArrowDown"
            ? (index + 1) % slides.length
            : (index + last) % slides.length;
    onActiveChange(next);
    row.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  if (!slide) return null;

  return (
    <div className={cn("relative h-[100svh] min-h-[620px] w-full overflow-hidden text-white", className)}>
      {/* Арын зургууд — зөвхөн идэвхтэй нь харагдана */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url("${s.image}")` }}
        />
      ))}

      {/* Зөөлөн харанхуйлалт — доод бүсэд илүү гүн (мета зурвас), мөн
          зүүн талд нэмэлт хөшиг (гарчиг ихэвчлэн барилга дээр буудаг). */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-night/60 via-night/30 to-night/85" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-night/70 via-night/10 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-7 pt-24 sm:px-8 sm:pb-9 md:px-10 md:pt-28 lg:px-14">
        {/* Дээд бүс — гарчиг + идэвхтэй зүйлийн тайлбар */}
        <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between md:gap-14">
          <div className="max-w-xl">
            {eyebrow}
            <h2
              data-reveal="heading"
              className="mt-4 text-[clamp(1.9rem,4.4vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-white"
            >
              {headline}
            </h2>
            {lede && (
              <p
                data-reveal="up"
                data-reveal-delay="0.15"
                className="mt-5 max-w-md text-[14px] leading-relaxed text-white/60"
              >
                {lede}
              </p>
            )}
          </div>

          <p
            key={slide.id}
            className="ui-fade-in max-w-xs text-[14px] font-medium leading-relaxed text-white/80 sm:text-[15px] md:pt-3"
          >
            {slide.description}
          </p>
        </div>

        {/* Доод бүс — thumbnail сонголт + мета зурвас */}
        <div className="flex flex-col gap-6 sm:gap-8">
          <div
            ref={row}
            role="tablist"
            aria-label={typeof headline === "string" ? headline : undefined}
            onKeyDown={onKeyDown}
            className="flex items-end gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:gap-3 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                data-cursor-hover
                aria-selected={i === index}
                tabIndex={i === index ? 0 : -1}
                aria-label={s.name}
                onClick={() => onActiveChange(i)}
                className="flex shrink-0 flex-col items-center gap-2 outline-offset-4"
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-1 w-1 rounded-full bg-white transition-opacity duration-300",
                    i === index ? "opacity-100" : "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "block h-11 w-11 overflow-hidden rounded-full ring-1 ring-white/30 transition duration-500 sm:h-14 sm:w-14",
                    i === index ? "ring-2 ring-white" : "opacity-70 hover:opacity-100"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.alt ?? ""}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5 text-[13px] font-medium sm:text-sm">
            <span key={slide.id} className="ui-fade-in text-white">
              {slide.name}
            </span>
            {slide.role && (
              <span key={slide.role} className="hidden text-white/70 sm:inline">
                {slide.role}
              </span>
            )}
            {meta && <span className="hidden text-white/70 md:inline">{meta}</span>}
            {action}
          </div>
        </div>
      </div>
    </div>
  );
}
