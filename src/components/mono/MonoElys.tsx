"use client";

/* /mono — ELYS консепц (Chapter 02).

   Өмнө нь GSAP clip-path коллаж (ConnoisseurStackInteractor) байсныг
   зурган accordion-оор сольсон: самбар бүр захиалагчийн рендер, дээгүүр
   нь өнгөрөхөд (эсвэл хүрэхэд) дэлгэгдэж, дэлгэгдсэн самбар дээр дахин
   дарахад дэлгэрэнгүй pop-up нээгдэнэ.

   Зүйл бүрийн эхний үсэг E·L·Y·S нэрийг бүрдүүлдэг тул үсгүүд самбарын
   тогтмол рельс дээр сууж, хэвтээ (desktop) эсвэл босоо (утас) уншигдана.
   Акронимыг хатуу бичихгүй — `letterOf`-оор гарчгаас гаргана, ингэснээр
   админ 5 дахь зүйл нэмэхэд өөрөө дагаж өснө.

   Текст бүхэлдээ админаас (`/admin/site` → ELYS консепц) удирдагдана;
   зурагнууд нь доорх `MEDIA` массивт компонентын дотор үлдэнэ — учир нь
   `mergeSiteContent` нь хадгалсан массивын дутуу талбарыг ЭХНИЙ өгөгдмөл
   элементээс нөхдөг тул `items`-д зураг нэмбэл бүх зүйл нэг ижил
   зурагтай болно (MonoEquip энэ урхийг тайлбарласан байдаг). */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";
import { MonoModal } from "./MonoModal";
import {
  InteractiveImageAccordion,
  type AccordionPanel,
} from "@/components/ui/interactive-image-accordion";

type ElysMedia = { image: string; alt: string };

/* Захиалагчийн рендерүүд — `site.elys.items`-ийн дарааллаар. */
const MEDIA: ElysMedia[] = [
  {
    image: "/images/elys/ergonomic-interior.jpg",
    alt: "Эргономик төлөвлөлттэй дотоод орчин",
  },
  {
    image: "/images/elys/harmony-courtyard.jpg",
    alt: "Ногоон байгууламж бүхий хотхоны орчин",
  },
  {
    image: "/images/elys/safety-control-room.jpg",
    alt: "Хяналтын төвийн дэлгэцүүд — нэвтрэлт, аюулгүй байдлын нэгдсэн систем",
  },
  {
    image: "/images/elys/efficiency-tower-crown.jpg",
    alt: "ELYSIUM цамхагийн эрчим хүчний хэмнэлттэй фасад",
  },
];

/** Гарчгийн эхний үсэг — акронимын нэг тэмдэгт. */
const letterOf = (title: string) => title.trim().charAt(0).toUpperCase() || "•";

export function MonoElys({ site }: { site: SiteContent }) {
  const { elys } = site;
  const [open, setOpen] = useState<number | null>(null);

  /* Зураг тохируулснаас олон зүйл админ нэмсэн ч уначихгүй. */
  const mediaFor = (i: number) => MEDIA[i % MEDIA.length];

  const panels: AccordionPanel[] = elys.items.map((item, i) => ({
    id: `${item.title}-${i}`,
    letter: letterOf(item.title),
    title: item.title,
    body: item.body,
    image: mediaFor(i).image,
  }));

  const acronym = elys.items.map((item) => letterOf(item.title)).join(" · ");
  const current = open === null ? null : elys.items[open];

  return (
    <section id="elys" className="border-b border-night/10 bg-ground text-night">
      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-20 md:px-10 md:pb-28 md:pt-32">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <MonoKicker reveal>02 — {elys.kicker}</MonoKicker>
            <h2
              data-reveal="heading"
              className="mt-4 max-w-xl text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night"
            >
              {elys.title}
            </h2>
          </div>

          <div data-reveal="up" data-reveal-delay="0.15" className="max-w-sm">
            <p className="text-sm leading-relaxed text-night/60">{elys.body}</p>
            {/* "E · L · Y · S" — дэлгэц уншигчид "И цэг Эл цэг…" гэж
                уншигдахгүйн тулд aria-hidden. */}
            <p
              aria-hidden
              className="mt-3 text-[11px] font-bold uppercase tracking-[0.4em] text-night/40"
            >
              {acronym}
            </p>
          </div>
        </div>

        {/* data-reveal нь ЗӨВХӨН энэ бүрхүүл дээр. `autoAlpha: 0` нь
            `visibility: hidden` тавьдаг бөгөөд удамшдаг тул <li>/<button>
            дээр тавибал харагдахгүй товч tab дарааллаас олдоно; мөн
            `display:none` урсгал дээр тавибал ScrollTrigger хэзээ ч
            бодохгүй үлдэж, тэр урсгал үүрд нуугдана. */}
        <div data-reveal="up" data-reveal-delay="0.1">
          <InteractiveImageAccordion
            items={panels}
            onOpen={setOpen}
            openLabel={elys.moreLabel}
            className="mt-10 md:mt-16"
          />
        </div>
      </div>

      <MonoModal
        open={open !== null}
        onClose={() => setOpen(null)}
        label={current?.title ?? elys.title}
        size="lg"
      >
        {current && open !== null && (
          <>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaFor(open).image}
                alt={mediaFor(open).alt}
                decoding="async"
                className="h-56 w-full object-cover sm:h-72"
              />
              <span className="absolute bottom-4 left-6 flex h-11 w-11 items-center justify-center rounded-full bg-surface/95 text-[15px] font-extrabold tracking-[0.06em] text-night backdrop-blur">
                {letterOf(current.title)}
              </span>
            </div>

            <div className="p-6 sm:p-9">
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-night/50">
                <span aria-hidden className="h-px w-8 bg-moss" />
                {elys.kicker}
              </p>
              <h3 className="mt-4 text-[clamp(1.4rem,3vw,2rem)] font-extrabold leading-tight tracking-tight text-night">
                {current.title}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-night/70">{current.body}</p>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-night/10 pt-6">
                {/* E·L·Y·S үсгүүд өөрсдөө хуудаслалт болно — консепцийг
                    pop-up дотор давтан хэлнэ. Дэлгэц уншигчид үсэг биш
                    бүтэн нэрийг сонсоно (`aria-label`). */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-night/50">
                    {String(open + 1).padStart(2, "0")} /{" "}
                    {String(elys.items.length).padStart(2, "0")}
                  </span>
                  <ul className="flex flex-wrap items-center gap-1">
                    {elys.items.map((item, i) => (
                      <li key={`${item.title}-${i}`}>
                        <button
                          type="button"
                          data-cursor-hover
                          onClick={() => setOpen(i)}
                          aria-label={item.title}
                          aria-current={i === open ? "true" : undefined}
                          className={`flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-extrabold tracking-[0.14em] transition-colors duration-300 ${
                            i === open
                              ? "bg-night text-white"
                              : "text-night/35 hover:bg-night/5 hover:text-night/70"
                          }`}
                        >
                          <span aria-hidden>{letterOf(item.title)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#contact"
                  data-cursor-hover
                  onClick={() => setOpen(null)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-night px-6 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {site.nav.ctaLabel} <span aria-hidden>↗</span>
                </a>
              </div>
            </div>
          </>
        )}
      </MonoModal>
    </section>
  );
}
