"use client";

/* Portrait showcase — бүтэн дэлгэцийн (full-bleed) слайдер: арын зураг
   солигдож, доод талд дугуй thumbnail-ууд сонголтын мөр болно.

   Бүтэц:
     • арын зургууд бүгд DOM-д зэрэг сууж, зөвхөн идэвхтэй нь opacity: 1
       (700ms crossfade) — солигдоход зураг дахин ачаалагдахгүй,
     • слайд `video`-той бол зургийн ДЭЭР давтагдан тоглох клип нэмэгдэнэ
       (доорх §Видео),
     • дээгүүр нь зөөлөн харанхуй градиент (текстийн уншигдац),
     • контент давхарга: дээд зүүнд хэсгийн шошго + ИДЭВХТЭЙ СЛАЙДЫН
       НЭР (гарчиг), доод зүүнд тухайн слайдын тайлбар бүтнээрээ, доор
       нь thumbnail мөр ба мета зурвас. Бүх бичвэр нэг зүүн тэнхлэгт.

   Идэвхтэй индексийг ГАДНААС удирдана (`active` / `onActiveChange`) —
   дуудагч тухайн зүйлээр pop-up нээх, дүрс тэмдэг харуулах зэрэгт мөн
   ашиглана.

   §Видео. Слайд бүр өөрийн клиптэй, ЗӨВХӨН идэвхтэй нь тоглоно —
   бусад нь зогсоно, тиймээс нэг зэрэг нэг л клип декодлогдоно. Клип
   бүр `preload="none"`-той төрж, тухайн слайд идэвхжиж, хэсэг нь
   дэлгэцэнд ойртсон үед л `src` авна: гурван клипийг урьдчилж татахгүй.
   Эхний кадраа зурах хүртэл тунгалаг — доор нь зураг байгаа тул хар
   нүх үүсэхгүй. Слайд дахин идэвхжихэд клип эхнээсээ эхэлнэ (барилга
   дахин босно). prefers-reduced-motion үед клип огт татагдахгүй, зураг
   хэвээр үлдэнэ.

   Хөдөлгөөн: тайлбар ба нэр нь `key`-ээр дахин mount хийгдэж
   `.ui-fade-in` (0.5s) авна; идэвхтэй цэг зөвхөн opacity-гаар асна —
   thumbnail хооронд гүйдэггүй. prefers-reduced-motion үед globals.css
   доторх дүрэм хөдөлгөөнийг унтраана. */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ShowcaseSlide = {
  /** React key — дуудагч давхцахгүйг баталгаажуулна. */
  id: string;
  /** Арын зураг ба thumbnail — нэг ижил эх сурвалж. Клиптэй үед ч
   *  хэрэгтэй: thumbnail, клип ачаалагдах хүртэлх дэвсгэр, мөн
   *  reduced-motion-ийн хувилбар болно. */
  image: string;
  /** Зургийн дээр давтагдан тоглох дэвсгэр клип (mp4, дуугүй).
   *  Байхгүй үед слайд зөвхөн зурагтай үлдэнэ. */
  video?: string;
  /** Дэлгэц уншигчид зориулсан зургийн тайлбар. */
  alt?: string;
  /** Слайдын нэр — хэсгийн ГАРЧИГ болж display хэмжээгээр гарна. */
  name: string;
  /** Брэндийн лого — мета зурваст `role`-ийн ОРОНД цагаан тавцан дээр
   *  гарна. Тавцан хэрэгтэй: дурын логоны өнгө бараан зурвас дээр
   *  уншигдана гэсэн баталгаа байхгүй. */
  logo?: { src: string; alt: string };
  /** Слайдын тайлбар — зүүн доод талд бүтнээрээ гарна. */
  description: string;
};

export function PortraitShowcase({
  slides,
  active,
  onActiveChange,
  eyebrow,
  headline,
  meta,
  action,
  onSlideOpen,
  openLabel,
  className,
}: {
  slides: ShowcaseSlide[];
  /** Идэвхтэй слайдын индекс (хязгаараас гарвал эхнийх рүү эргэнэ). */
  active: number;
  onActiveChange: (index: number) => void;
  /** Гарчгийн дээрх жижиг шошго. */
  eyebrow?: React.ReactNode;
  /** Хэсгийн нэр. Харагдах гарчиг БИШ (тэр нь идэвхтэй слайдын нэр) —
   *  зөвхөн thumbnail-ийн `aria-label` болно. */
  headline: React.ReactNode;
  /** Гарчгийн доорх хэсгийн танилцуулга (слайдаас хамаарахгүй). */
  /** Мета зурвасын тогтмол текст (md-ээс дээш харагдана). */
  meta?: React.ReactNode;
  /** Мета зурвасын баруун захын CTA. */
  action?: React.ReactNode;
  /** Өгсөн үед идэвхтэй слайдын нэр товч болж (мөн идэвхтэй thumbnail
   *  дээр дахин дарахад) тухайн слайдын дэлгэрэнгүйг нээнэ. */
  onSlideOpen?: (index: number) => void;
  /** Нэрийн ард гарах жижиг шошго (ж: "Дэлгэрэнгүй"). */
  openLabel?: string;
  className?: string;
}) {
  const row = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  /** Хэсэг дэлгэцэнд ойртсон уу — гадуур байхад клип татахгүй, тоглуулахгүй. */
  const [near, setNear] = useState(false);
  /** Эхний кадраа зурсан слайдууд — тэр үед л зургийн дээр гарна. */
  const [ready, setReady] = useState<Record<number, true>>({});

  const index = slides.length ? ((active % slides.length) + slides.length) % slides.length : 0;
  const slide = slides[index];

  /* Клипүүд зөвхөн хэсэг дөхөхөд амьдарна. reduced-motion үед огт биш —
     `near` худал хэвээр үлдэж, слайдууд зурган хэвээр ажиллана. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => setNear(entries.some((e) => e.isIntersecting)),
      { rootMargin: "50% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Нэг зэрэг ганц клип. `src`-ыг JSX биш ЭНД тавина: элемент төрөхдөө
     хаягтай бол `preload="none"` ч гэсэн зарим хөтөч мета өгөгдөл татна,
     мөн React-ийн төлөвөөр дамжуулбал эффект дотор setState хийх болно.
     Клип нь гадаад систем — түүнийг шууд удирдах нь эффектийн зөв хэрэглээ. */
  useEffect(() => {
    videos.current.forEach((el, i) => {
      if (!el) return;
      if (i === index && near) {
        const src = slides[i]?.video;
        if (!src) return;
        if (!el.getAttribute("src")) el.setAttribute("src", src);
        // React `muted`-ыг үргэлж шинжид тавьдаггүй; авто-тоглолт үүнээс хамаарна.
        el.muted = true;
        // Дахин идэвхжсэн слайд эхнээсээ — барилга дахин босно.
        if (el.paused && el.currentTime > 0) el.currentTime = 0;
        void el.play().catch(() => {});
      } else if (!el.paused) {
        el.pause();
      }
    });
  }, [index, near, slides]);

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
    <div
      ref={root}
      className={cn("relative h-[100svh] min-h-[620px] w-full overflow-hidden text-white", className)}
    >
      {/* Арын давхаргууд — зөвхөн идэвхтэй нь харагдана. Зураг доор,
          клип (байвал) дээр нь: клип ачаалагдтал зураг л харагдана. */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${s.image}")` }}
          />
          {s.video && (
            <video
              ref={(el) => {
                videos.current[i] = el;
              }}
              muted
              loop
              playsInline
              preload="none"
              onCanPlay={(e) => {
                setReady((m) => (m[i] ? m : { ...m, [i]: true }));
                /* Хөтөч нуугдсан таб дээр авто-тоглолтыг хойшлуулдаг —
                   src тавихад дуудсан `play()` няцаагдсан байж болно.
                   Бэлэн болмогц дахин оролдоно. */
                if (i === index && near) void e.currentTarget.play().catch(() => {});
              }}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out",
                ready[i] ? "opacity-100" : "opacity-0"
              )}
            />
          )}
        </div>
      ))}

      {/* ХӨШИГГҮЙ. Өмнө нь энд хоёр `charcoal` (#16280f) градиент —
          доод бүсэд гүн, зүүн талд нэмэлт — суудаг байв. Захиалагчийн
          шаардлагаар 2026-09-01-нд БҮРЭН ХАСАВ: барилгын кадрууд ногоон
          хальсгүй, жинхэнэ өнгөөрөө харагдана.

          ⚠️ Үүний үнэ: гарчиг/lede/мета бүгд кадрын дээр ШУУД суух тул
          тэнгэр давамгайлсан цайвар кадар дээр WCAG харьцаа өмнөх
          8.4:1 / 6.2:1-ээс огцом унана. Хөшгийг БУЦААХГҮЙГЭЭР
          уншигдацыг сэргээх бол бичвэрийн ард `text-shadow` эсвэл
          зөвхөн бичвэрийн хайрцгийн доорх нарийн хөшиг нэмнэ. */}

      {/* Кадрын ДЭЭР, бичвэрийн ДООР буух өнгөт хальс — админы дизайнаас.
          Кадар бүтэн дэлгэцийг эзэлдэг тул хэсгийн өөрийн `background`
          харагддаггүй; «Өнгө / Градиент» сонголт эндээс л нүдэнд буунa.
          Өнгийг `buildThemeCss` (`[data-bg="equip"] [data-theme-film]`)
          өгнө — өгөгдмөл үед дүрэм үүсэхгүй тул тунгалаг үлдэнэ.
          Элемент ҮРГЭЛЖ байх ёстой: админы амьд preview зөвхөн CSS-ээ
          сольдог тул байхгүй элементэд хальс буулгаж чадахгүй. */}
      <div aria-hidden data-theme-film className="pointer-events-none absolute inset-0" />

      {/* Хөшиг хасагдсан тул бичвэр бүхэлдээ нимгэн сүүдэртэй: тэнгэр
          давамгайлсан цайвар кадар дээр цагаан бичиг уусахаас зөвхөн
          энэ сүүдэр хамгаална. Кадрын ӨНГӨ хөндөгдөхгүй. */}
      <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-7 pt-24 [text-shadow:0_1px_2px_rgba(9,14,7,0.45),0_2px_22px_rgba(9,14,7,0.55)] sm:px-8 sm:pb-9 md:px-10 md:pt-28 lg:px-14">
        {/* Дээд бүс — хэсгийн шошго + ИДЭВХТЭЙ СЛАЙДЫН НЭР.
            Гарчиг нь хэсгийн нэр («Барилгын бүтэц») БИШ, слайдын нэр
            («Бүрэн цутгамал хийцлэл») — хэсгийн нэр бол ангиллын шошго
            бөгөөд `eyebrow`-д багтдаг, харин худалдан авагчид хэлэх
            зүйл нь слайд бүрийн техник/бүтээгдэхүүний нэр. */}
        <div className="max-w-xl">
          {eyebrow}
          <h2
            key={slide.id}
            data-reveal="heading"
            className="ui-fade-in mt-5 text-[clamp(1.9rem,4.4vw,4rem)] font-extrabold leading-[1.02] tracking-tight text-white"
          >
            {slide.name}
          </h2>
        </div>

        {/* Доод бүс — идэвхтэй слайдын тайлбар, thumbnail сонголт,
            мета зурвас. Тайлбар нь thumbnail-ийн ЯГ ДЭЭР суудаг:
            thumbnail дарахад солигддог тул хяналтынхаа хажууд байх нь
            зөв, мөн бүх бичвэр нэг зүүн тэнхлэгт эгнэнэ. */}
        <div className="flex flex-col gap-6 sm:gap-8">
          <p
            key={slide.id}
            className="ui-fade-in max-w-[46ch] text-[16px] font-medium leading-relaxed text-white/80 sm:text-[19px] sm:leading-[1.6]"
          >
            {slide.description}
          </p>

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
                onClick={() => (i === index && onSlideOpen ? onSlideOpen(i) : onActiveChange(i))}
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

          {/* Мета зурвас — ХОЁР бүлэг: зүүнд слайдын хэрэгслүүд (лого,
              «дэлгэрэнгүй»), баруунд байрлал ба CTA. Өмнө нь дөрвөн зүйл
              `justify-between`-ээр тарж, зай нь санамсаргүй харагддаг
              байв. Слайдын нэр энд БАЙХГҮЙ — тэр нь дээр гарчиг болсон. */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-white/20 pt-5 text-[13px] font-medium sm:text-sm">
            <span className="flex items-center gap-4">
              {slide.logo && (
                <span
                  key={slide.logo.src}
                  className="hidden shrink-0 items-center rounded-md bg-white/95 px-2.5 py-1.5 sm:inline-flex"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.logo.src}
                    alt={slide.logo.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-6 w-auto max-w-[160px] object-contain"
                  />
                </span>
              )}
              {onSlideOpen && openLabel && (
                <button
                  type="button"
                  data-cursor-hover
                  onClick={() => onSlideOpen(index)}
                  aria-haspopup="dialog"
                  aria-label={`${slide.name} — ${openLabel}`}
                  className="group inline-flex min-h-11 items-center text-[11px] font-bold uppercase tracking-[0.12em] text-white/70 transition-colors duration-300 hover:text-white"
                >
                  {openLabel}
                  <span aria-hidden className="ml-1.5 inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              )}
            </span>

            <span className="flex items-center gap-6">
              {meta && <span className="hidden text-white/60 md:inline">{meta}</span>}
              {action}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
