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

   Текст, ЗУРАГ хоёулаа админаас (`/admin/site` → ELYS консепц)
   удирдагдана. Зүйлийн `image` хоосон үед доорх `MEDIA` массиваас
   дарааллын дагуу өгөгдмөл рендер орно — тиймээс өгөгдмөл контентод
   `image` нь хоосон байх ЁСТОЙ: `mergeSiteContent` нь хадгалсан
   массивын дутуу талбарыг ЭХНИЙ өгөгдмөл элементээс нөхдөг тул тэнд
   зураг бичвэл бүх зүйл нэг ижил зурагтай болно (MonoEquip энэ урхийг
   мөн тайлбарласан байдаг). */

import { useCallback, useState } from "react";
import { useLenis } from "lenis/react";
import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";
import { MonoModal } from "./MonoModal";
import { flatSectionTone } from "@/lib/theme-css";
import {
  InteractiveImageAccordion,
  type AccordionPanel,
} from "@/components/ui/interactive-image-accordion";

type ElysMedia = { image: string; alt: string };
type ElysItem = SiteContent["elys"]["items"][number];

/* Админ зураг сонгоогүй үеийн өгөгдмөл рендерүүд —
   `site.elys.items`-ийн дарааллаар. */
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
  const lenis = useLenis();

  /* Тогтвортой хаах функц — MonoModal-ийн effect нь `onClose`-ын хаягаас
     хамаардаг байсныг зассан ч, эцэг дахин рендерлэх бүрд шинэ функц
     үүсгэхгүй байх нь зөв хэвээр. */
  const close = useCallback(() => setOpen(null), []);

  /* Уулзалт товлох — pop-up-ыг хааж, дараа нь #contact руу зөөлөн гүйлгэнэ.
     Native hash үсрэлт нь Lenis-ийн гүйлттэй зөрчилддөг. */
  const goContact = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(null);
    requestAnimationFrame(() => {
      const el = document.querySelector("#contact");
      if (!el) return;
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -70 });
      else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
    });
  };

  /* Зураг тохируулснаас олон зүйл админ нэмсэн ч уначихгүй. */
  const mediaFor = (i: number) => MEDIA[i % MEDIA.length];

  /* Админы оруулсан зураг өгөгдмөлөөс давуу. Оруулсан зурагт өгөгдмөл
     рендерийн тайлбар таарахаа больдог тул alt нь зүйлийн нэр болно. */
  const imageOf = (item: ElysItem, i: number) => item.image?.trim() || mediaFor(i).image;
  const altOf = (item: ElysItem, i: number) =>
    item.image?.trim() ? item.title : mediaFor(i).alt;

  const panels: AccordionPanel[] = elys.items.map((item, i) => ({
    id: `${item.title}-${i}`,
    letter: letterOf(item.title),
    title: item.title,
    body: item.body,
    image: imageOf(item, i),
  }));

  const acronym = elys.items.map((item) => letterOf(item.title)).join(" · ");
  const current = open === null ? null : elys.items[open];

  return (
    <section
      id="elys"
      data-bg="elys"
      data-tone={flatSectionTone(site.theme, "elys")}
      className="border-b border-fg/10 bg-ground text-fg"
    >
      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-20 md:px-10 md:pb-28 md:pt-32">
        {/* Гарчгийн блок — тайлбар нь баруун талын багана биш, гарчгийн ЯГ
            доор. Баруун талд байхад bottom-align-аас болж гарчгаас дээш
            гарч, хэсгийн навигацитай мөргөлддөг байв (MonoDeveloper-ийг
            яг ийм шалтгаанаар өмнө нь зассан). */}
        <div className="max-w-2xl">
          <MonoKicker reveal>02 — {elys.kicker}</MonoKicker>
          <h2
            data-reveal="heading"
            className="mt-4 mono-h2"
          >
            {elys.title}
          </h2>
          <p
            data-reveal="up"
            data-reveal-delay="0.15"
            className="mt-5 mono-lead"
          >
            {elys.body}
          </p>
          {/* "E · L · Y · S" — дэлгэц уншигчид "И цэг Эл цэг…" гэж
              уншигдахгүйн тулд aria-hidden. */}
          <p
            aria-hidden
            data-reveal="up"
            data-reveal-delay="0.2"
            className="mt-4 text-[11px] font-bold uppercase tracking-[0.4em] text-fg/40"
          >
            {acronym}
          </p>
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
        onClose={close}
        label={current?.title ?? elys.title}
        size="lg"
      >
        {current && open !== null && (
          <>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageOf(current, open)}
                alt={altOf(current, open)}
                decoding="async"
                className="h-56 w-full object-cover sm:h-72"
              />
              <span className="glass glass-chip absolute bottom-4 left-6 flex h-11 w-11 items-center justify-center rounded-full text-[15px] font-extrabold tracking-[0.06em] text-fg">
                {letterOf(current.title)}
              </span>
            </div>

            <div className="p-6 sm:p-9">
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-fg/50">
                <span aria-hidden className="h-px w-8 bg-moss" />
                {elys.kicker}
              </p>
              {/* Хуудаслалт дарахад цонхны агуулга бүхэлдээ солигддог тул
                  дэлгэц уншигчид дуугарахгүй өнгөрдөг — polite мужид
                  оруулснаар шинэ гарчиг, тайлбарыг уншина. */}
              <div aria-live="polite">
                <h3 className="mt-4 text-[clamp(1.4rem,3vw,2rem)] font-extrabold leading-tight tracking-tight text-fg">
                  {current.title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-fg/70">{current.body}</p>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-fg/10 pt-6">
                {/* E·L·Y·S үсгүүд өөрсдөө хуудаслалт болно — консепцийг
                    pop-up дотор давтан хэлнэ. Дэлгэц уншигчид үсэг биш
                    бүтэн нэрийг сонсоно (`aria-label`). */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-fg/50">
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
                            /* Идэвхгүй үсэг өмнө нь `text-fg/35` байсан нь
                               цагаан дээр ~1.5:1 — уншигдахгүй. /85 нь ~5:1.
                               "Сонгогдоогүй" гэдгийг дүүргэсэн товч биш
                               харин хүрээ, дэвсгэрийн ялгаа илэрхийлнэ. */
                            i === open
                              ? "bg-night text-white"
                              : "border border-fg/15 text-fg/85 hover:bg-night/5 hover:text-fg"
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
                  onClick={goContact}
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
