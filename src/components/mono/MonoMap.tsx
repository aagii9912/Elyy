"use client";

/* /mono — Байршил (Figma «Төслийн байршил» фрэйм).

   Бүтэн өргөнөөр хотын агаарын рендер, түүн дээр 1–8 дугаартай ногоон цэг.
   Зүүн дээд талд гарчиг + ногоон зураастай хаяг, зүүн доод талд идэвхтэй
   цэгийн ногоон шилэн карт, доор нь хар «Чиглэл авах» товч.

   Курсор (эсвэл товшилт/фокус) цэг дээр очиход карт тухайн байршлын
   ЗУРАГ, нэр, тайлбар, төслөөс хэдэн метр/километр зайтайг харуулна —
   Figma-гийн «1. ЭРЭЛ ГРУПП + гэрэл зураг» бүтэц.

   Цэгийн байрлал зураг тус бүрийн хувиар хадгалагдана. <picture>-ийн
   байгалийн өндрийг дагаж харуулах тул зураг солиход тайралт үүсэхгүй.

   ⚠️ Цэгийн өнгийг ЭНД шууд бичсэн: админы палитр хэсгийн өнгийг
   өөрчилдөг тул газрын зураг дээрх тэмдэг тусдаа уншигдах ёстой. */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { flatSectionTone } from "@/lib/theme-css";

/* Яг координат — чиглэл нь тодорхой цэг рүү заана. */
const directions = (coords: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}`;

/** Цэг, мэдээллийн карт, зураасны шинэ брэндийн өнгө. */
const LIME = "#c5d996";
const PIN = "rgba(197,217,150,0.5)";
const PIN_ON = LIME;
const GLOW = "rgba(197,217,150,0.55)";
/** Ногоон дэвсгэр дээрх дугаар — цагаанаар уншигдахгүй (1.7:1). */
const PIN_INK = "#1b3328";
const CARD = "rgba(27,51,40,0.92)";
const RULE = "#426c4c";

export function MonoMap({ site }: { site: SiteContent }) {
  const { location } = site;
  const project = location.tabs.project;
  const [pin, setPin] = useState(0);
  const active = location.pins[pin] ?? location.pins[0];

  return (
    <section
      id="location"
      data-bg="location"
      data-tone={flatSectionTone(site.theme, "location")}
      className="relative border-b border-fg/10 bg-ground"
    >
      {/* Хоёр зураг өөр өөр харьцаатай байж болно. Байгалийн өндрөөр нь
          харуулахад хувь координат хоёр төхөөрөмж дээр яг таарна. */}
      <div className="relative w-full">
        <picture>
          <source media="(min-width: 768px)" srcSet={location.mapImage} />
          <img
            src={location.mapImageMobile || location.mapImage}
            alt={`${project.label} — ${project.address}`}
            loading="lazy"
            className="block h-auto w-full"
          />
        </picture>

        {/* Зүүн талын цайруулалт — гарчиг ямар ч зураг дээр уншигдана.
            Гар утсанд гарчиг зургийн ДООР ордог тул хэрэггүй. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-gradient-to-r from-ground via-ground/35 to-transparent md:block"
        />

        {(["mobile", "desktop"] as const).map((device) => (
          <div key={device} className={`absolute inset-0 ${device === "mobile" ? "md:hidden" : "hidden md:block"}`}>
            {location.pins.map((p, i) => (
              <button
                key={`${device}-${p.place}-${i}`}
                type="button"
                aria-pressed={pin === i}
                aria-label={p.distance ? `${i + 1}. ${p.place} — ${p.distance} ${p.unit}` : `${i + 1}. ${p.place}`}
                onClick={() => setPin(i)}
                onMouseEnter={() => setPin(i)}
                onFocus={() => setPin(i)}
                data-cursor-hover
                style={{ left: `${device === "mobile" ? p.xMobile : p.x}%`, top: `${device === "mobile" ? p.yMobile : p.y}%` }}
                className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
              >
            {/* Гэрэлтэлт нь ЗӨВХӨН сонгогдсон цэг дээр — «бүдэг ↔ тод»
                ялгааг өнгө, хэмжээ, туяа гурвуулаа зэрэг өгнө. */}
            <span
              aria-hidden
              style={{ backgroundColor: GLOW }}
              className={`absolute inset-1.5 rounded-full blur-[7px] transition-opacity duration-300 ${
                pin === i ? "opacity-100" : "opacity-0"
              }`}
            />
            <span
              style={{
                backgroundColor: pin === i ? PIN_ON : PIN,
                color: PIN_INK,
                opacity: pin === i ? 1 : 0.82,
              }}
              className={`relative grid h-7 w-7 place-items-center rounded-full text-2xs font-bold tabular-nums shadow-[0_1px_6px_rgba(21,23,23,0.28)] transition-transform duration-300 sm:h-8 sm:w-8 sm:text-xs md:h-9 md:w-9 md:text-body ${
                pin === i ? "scale-115" : ""
              }`}
            >
              {i + 1}
            </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Гарчиг + идэвхтэй цэг + товч.
          Гар утсанд зургийн доор энгийн урсгалаар, md-ээс дээш давхарлана. */}
      <div className="flex flex-col gap-6 px-6 py-9 md:pointer-events-none md:absolute md:inset-0 md:justify-between md:px-[4.3%] md:py-[9%]">
        <div className="max-w-lg">
          <h2 data-reveal="heading" className="mono-h2">
            {project.title}
          </h2>
          <p data-reveal="up" className="mt-5 flex gap-4">
            <span
              aria-hidden
              style={{ backgroundColor: RULE }}
              className="w-[3px] shrink-0 rounded-full"
            />
            <span className="text-sm font-semibold leading-relaxed text-fg/70 md:text-lead">
              <span className="sr-only">{location.addressLabel}: </span>
              {project.address}
            </span>
          </p>
        </div>

        {/* ⚠️ Энэ багана нь бүтэн ӨРГӨНӨӨР сунадаг тул `pointer-events-auto`-г
            ЭНД тавьж БОЛОХГҮЙ — тэгвэл зургийн доод хэсэгт (~52–84%) байх
            цэгүүд ил тунгалаг хавтангийн ард дарагдаж, курсор хүрэхгүй
            болно. Тиймээс зөвхөн жинхэнэ дарагддаг элемент буюу «Чиглэл
            авах» товч л заагчийг эргүүлж авна; карт нь мэдээлэл харуулдаг
            тул заагч авах шаардлагагүй. */}
        <div className="flex flex-col items-start gap-5">
          {active && (
            /* `key={pin}` — цэг солигдох бүрт карт дахин мандаж (`mono-fade-up`)
               гарна; шинэ зураг ачаалагдах агшин ч энэ мандалтын дор нуугдана. */
            <div
              key={pin}
              style={{ backgroundColor: CARD }}
              className="mono-fade-up flex w-full min-h-[9rem] max-w-[26rem] items-center gap-5 rounded-2xl border border-white/15 px-6 py-5 text-white shadow-[0_20px_48px_-28px_rgba(21,23,23,0.5)] backdrop-blur-md md:min-h-[10.75rem] md:w-[30.6%] md:min-w-[19rem] md:max-w-none xl:min-h-[12.75rem] xl:gap-6"
            >
              <div className="min-w-0 flex-1">
                <p className="break-words text-lg font-extrabold uppercase leading-tight text-white lg:text-h6">
                  <span className="tabular-nums">{pin + 1}.</span> {active.place}
                </p>
                {active.description && (
                  <p className="mt-1.5 text-body leading-snug text-white/75">{active.description}</p>
                )}
                {active.distance && (
                  /* «Төслөөс» шошго нүднээс хасагдав — зай нь тоо, нэгжээрээ
                     ойлгомжтой. Дэлгэц уншигчид контекст хэрэгтэй тул
                     `sr-only`-оор үлдээв (админаас засах талбар нь хэвээр). */
                  <p className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                    <span className="sr-only">{location.distanceLabel} </span>
                    <span className="text-lg font-extrabold tabular-nums leading-none text-white lg:text-xl">
                      {active.distance}
                    </span>
                    <span className="text-label font-bold text-white/65">{active.unit}</span>
                  </p>
                )}
              </div>

              {/* Байршлын гэрэл зураг — Figma-д 396×419 (r32) бөгөөд картын
                  дотор талын өндрийг дүүргэдэг. Өндрийг нь алхамчилж өгөөд
                  өргөнийг зурагны харьцаанаас гаргана. */}
              {active.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={active.image}
                  alt={active.place}
                  className="aspect-[396/419] h-[6.5rem] shrink-0 rounded-xl object-cover md:h-[8.25rem] xl:h-[10.25rem]"
                />
              )}
            </div>
          )}

          <a
            href={directions(project.coords)}
            target="_blank"
            rel="noopener"
            data-cursor-hover
            className="inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-night px-9 text-xs font-bold uppercase tracking-caps-sm text-white transition-transform duration-300 hover:-translate-y-0.5 md:pointer-events-auto"
          >
            {location.directionsLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
