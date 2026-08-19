"use client";

/* Portrait showcase — бүтэн дэлгэцийн (full-bleed) слайдер: арын зураг
   солигдож, доод талд дугуй thumbnail-ууд сонголтын мөр болно.

   Бүтэц:
     • арын зургууд бүгд DOM-д зэрэг сууж, зөвхөн идэвхтэй нь opacity: 1
       (700ms crossfade) — солигдоход зураг дахин ачаалагдахгүй,
     • слайд `video`-той бол зургийн ДЭЭР давтагдан тоглох клип нэмэгдэнэ
       (доорх §Видео),
     • дээгүүр нь зөөлөн харанхуй градиент (текстийн уншигдац),
     • контент давхарга: дээд бүсэд гарчиг + идэвхтэй зүйлийн тайлбар,
       доод бүсэд thumbnail мөр ба мета зурвас (нэр · дэд гарчиг · CTA).

   Идэвхтэй индексийг ГАДНААС удирдана (`active` / `onActiveChange`) —
   дуудагч тухайн зүйлээр pop-up нээх, дүрс тэмдэг харуулах зэрэгт мөн
   ашиглана.

   §Видео. ЗӨВХӨН `md`-ээс дээш. Слайд бүр өөрийн клиптэй, ЗӨВХӨН
   идэвхтэй нь тоглоно — бусад нь зогсоно, тиймээс нэг зэрэг нэг л клип
   декодлогдоно. Клип бүр `preload="none"`-той төрж, тухайн слайд
   идэвхжиж, хэсэг нь дэлгэцэнд ойртсон үед л `src` авна: гурван клипийг
   урьдчилж татахгүй. Эхний кадраа зурах хүртэл тунгалаг — доор нь зураг
   байгаа тул хар нүх үүсэхгүй. Слайд дахин идэвхжихэд клип эхнээсээ
   эхэлнэ (барилга дахин босно). prefers-reduced-motion үед, мөн УТСАН
   дээр `near` худал хэвээр үлдэж клип огт `src` авахгүй — 1 МБ бичлэг
   нь дэвсгэрийн хөдөлгөөнд гар утасны датагаар төлөх үнэ биш.

   §Утас. Дэвсгэр нь тэр дэлгэцэд зориулж тайрсан ХӨРӨГ зураг
   (`imageMobile`): хэвтээ кадар 375pt × 3 нягтралын дэлгэцэд ~3 дахин
   томсож бүдгэрдэг. Хоёр давхарга CSS-ээр солигдоно — `display:none`
   дэд модны дэвсгэр зургийг хөтөч ТАТДАГГҮЙ тул хэрэглэгч зөвхөн
   өөрийн хувилбарын байтыг татна.

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
  /** Утасны хөрөг дэвсгэр (`md`-ээс доош). Байхгүй үед `image` нь
   *  хоёр урсгалд ажиллана. Thumbnail нь тухайн урсгалын дэвсгэртэйгээ
   *  ижил файлыг сонгоно (`<picture>`) — тэр нь кэшэд аль хэдийн байгаа
   *  тул нэмэлт татах юм гарахгүй. */
  imageMobile?: string;
  /** Зургийн дээр давтагдан тоглох дэвсгэр клип (mp4, дуугүй).
   *  Байхгүй үед слайд зөвхөн зурагтай үлдэнэ. */
  video?: string;
  /** Дэлгэц уншигчид зориулсан зургийн тайлбар. */
  alt?: string;
  /** Мета зурвасын нэр (ж: материалын нэр). */
  name: string;
  /** Брэндийн лого — мета зурваст `role`-ийн ОРОНД цагаан тавцан дээр
   *  гарна. Тавцан хэрэгтэй: дурын логоны өнгө бараан зурвас дээр
   *  уншигдана гэсэн баталгаа байхгүй. */
  logo?: { src: string; alt: string };
  /** Нэрийн доор/хажууд гарах дэд гарчиг (ж: брэнд). Лого өгсөн үед
   *  түүнийг давхардуулахгүйн тулд харагдахгүй. */
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
  headline: React.ReactNode;
  /** Гарчгийн доорх хэсгийн танилцуулга (слайдаас хамаарахгүй). */
  lede?: React.ReactNode;
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

  /* Клипүүд зөвхөн хэсэг дөхөхөд амьдарна. reduced-motion үед, мөн
     утсан дээр огт биш — `near` худал хэвээр үлдэж, `<video>` элемент
     `src` авахгүй тул нэг ч байт татагдахгүй. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
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
          {/* Хоёр дэвсгэр — CSS-ээр солигдоно. `display:none` дэд модны
              дэвсгэр зургийг хөтөч татдаггүй тул тухайн төхөөрөмж зөвхөн
              өөрийнхөө хувилбарыг л татна. */}
          <div
            className={cn(
              "absolute inset-0 bg-cover bg-center",
              s.imageMobile && "hidden md:block"
            )}
            style={{ backgroundImage: `url("${s.image}")` }}
          />
          {s.imageMobile && (
            <div
              className="absolute inset-0 bg-cover bg-center md:hidden"
              style={{ backgroundImage: `url("${s.imageMobile}")` }}
            />
          )}
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
                onClick={() => (i === index && onSlideOpen ? onSlideOpen(i) : onActiveChange(i))}
                /* Харагдах дугуй нь 44px, гэхдээ дугуйн булангууд хоосон —
                   хуруу зөрөхөд амархан. `p-1.5` нь товчийг 56×68px хүрэх
                   талбай болгоно; дүрс нь өөрчлөгдөхгүй. */
                className="flex shrink-0 flex-col items-center gap-2 p-1.5 outline-offset-2"
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
                  {/* Дэвсгэртэйгээ ИЖИЛ файлыг сонгоно — тэр нь аль хэдийн
                      кэшэд байгаа тул thumbnail нэмэлт байт татахгүй. Утсан
                      дээр `image`-ыг зааж болохгүй: 44px дугуйн төлөө
                      ширээний бүтэн кадар татагдана. */}
                  <picture>
                    {s.imageMobile && <source media="(min-width: 768px)" srcSet={s.image} />}
                    <img
                      src={s.imageMobile ?? s.image}
                      alt={s.alt ?? ""}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </picture>
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5 text-[13px] font-medium sm:text-sm">
            {onSlideOpen ? (
              <button
                key={slide.id}
                type="button"
                data-cursor-hover
                onClick={() => onSlideOpen(index)}
                aria-haspopup="dialog"
                className="ui-fade-in group inline-flex items-center gap-2 text-left text-white"
              >
                {slide.name}
                {openLabel && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50 transition-colors duration-300 group-hover:text-white">
                    {openLabel}
                    <span aria-hidden className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                )}
              </button>
            ) : (
              <span key={slide.id} className="ui-fade-in text-white">
                {slide.name}
              </span>
            )}
            {slide.logo ? (
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
            ) : (
              slide.role && (
                <span key={slide.role} className="hidden text-white/70 sm:inline">
                  {slide.role}
                </span>
              )
            )}
            {meta && <span className="hidden text-white/70 md:inline">{meta}</span>}
            {action}
          </div>
        </div>
      </div>
    </div>
  );
}
