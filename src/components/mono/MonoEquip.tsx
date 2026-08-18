"use client";

/* /mono — Барилгын бүтэц. Өмнө нь энэ хэсэг бүтэн дэлгэцээр бэхлэгддэг
   (pinned) хар бүлэг байсан бөгөөд хуудсыг хэт бараан, хэт урт болгодог
   байв. Одоо: цайвар суурин дээрх компакт секц — материал бүр карт, карт
   дээр дарахад дэлгэрэнгүй pop-up нээгдэнэ (том зураг, бүтэн тайлбар,
   брэндийн тэмдэг, үйлдвэрлэгчийн холбоос).

   Барилгын бичлэгийн кадрууд (public/structure-frames) картын зураг
   болон pop-up-д хэвээр ашиглагдана; текст, зураг, холбоос бүгд
   `/admin/site` → Барилгын бүтэц хэсгээс удирдагдана. */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { LogoMark } from "@/components/Logo";
import { MonoKicker } from "./shared";
import { MonoModal } from "./MonoModal";

/* Брэндийн тэмдэг — материалын нэрээр таарна. Танихгүй зүйл дээр
   Elysium-ийн ромб тавина, ингэснээр админ дурын материал нэмж болно. */
const MARKS: Array<{ match: RegExp; src?: string; alt: string; mark?: boolean }> = [
  { match: /цутгамал/i, alt: "Elysium Residence", mark: true },
  { match: /veka|цонх/i, src: "/brand/veka-mark.png", alt: "VEKA" },
  { match: /yaret|фасад/i, src: "/brand/yaret-mark.png", alt: "Yaret Group" },
];

const markFor = (title: string) => MARKS.find((m) => m.match.test(title));

/* Зураг тохируулаагүй үед барилгын бичлэгээс дарааллын дагуу кадр авна.
   Өгөгдмөл контентод `image` нь ЗОРИУДААР хоосон: `mergeSiteContent` нь
   хадгалсан массивын дутуу талбарыг эхний өгөгдмөл элементээс нөхдөг тул
   тэнд зураг бичсэн бол хадгалсан бүх материал НЭГ ижил зурагтай болно. */
const FALLBACK_FRAMES = [
  "/structure-frames/frame_012.webp",
  "/structure-frames/frame_066.webp",
  "/structure-frames/frame_112.webp",
];
const imageFor = (image: string, i: number) =>
  image?.trim() || FALLBACK_FRAMES[i % FALLBACK_FRAMES.length];

function BrandMark({ title, className = "" }: { title: string; className?: string }) {
  const brand = markFor(title);
  if (!brand) return null;
  if (brand.mark) return <LogoMark className={`h-6 w-auto text-night ${className}`} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={brand.src} alt={brand.alt} loading="lazy" className={`h-6 w-auto opacity-80 ${className}`} />
  );
}

export function MonoEquip({ site }: { site: SiteContent }) {
  const { equip } = site;
  const [open, setOpen] = useState<number | null>(null);
  const current = open === null ? null : equip.items[open];

  return (
    <section id="equip" className="border-b border-night/10 bg-ground py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <MonoKicker reveal>{equip.kicker}</MonoKicker>
            <h2
              data-reveal="heading"
              className="mt-4 max-w-xl text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night"
            >
              {equip.title}
            </h2>
          </div>
          <p data-reveal="up" data-reveal-delay="0.15" className="max-w-sm text-sm leading-relaxed text-night/60">
            {equip.body}
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {equip.items.map((item, i) => (
            <li key={`${item.title}-${i}`} data-reveal="up" data-reveal-delay={`${i * 0.06}`}>
              <button
                type="button"
                data-cursor-hover
                onClick={() => setOpen(i)}
                aria-haspopup="dialog"
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-night/10 bg-surface text-left transition-[border-color,transform,box-shadow] duration-500 hover:-translate-y-1 hover:border-night/30 hover:shadow-[0_28px_60px_-40px_rgba(21,23,23,0.6)]"
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden bg-night/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageFor(item.image, i)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-night backdrop-blur">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>

                <span className="flex flex-1 flex-col p-6">
                  <span className="text-lg font-extrabold leading-snug tracking-tight text-night">
                    {item.title}
                  </span>
                  <span className="mt-2.5 line-clamp-3 text-[14px] leading-relaxed text-night/60">
                    {item.body}
                  </span>
                  <span className="mt-5 flex items-center justify-between border-t border-night/10 pt-4">
                    <BrandMark title={item.title} />
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-night/70 transition-colors group-hover:text-night">
                      {equip.moreLabel}
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <MonoModal
        open={current !== null}
        onClose={() => setOpen(null)}
        label={current?.title ?? equip.title}
        size="lg"
      >
        {current && open !== null && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageFor(current.image, open)}
              alt={current.title}
              decoding="async"
              className="h-56 w-full object-cover sm:h-72"
            />
            <div className="p-6 sm:p-9">
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-night/50">
                <span aria-hidden className="h-px w-8 bg-moss" />
                {equip.kicker}
              </p>
              <h3 className="mt-4 text-[clamp(1.4rem,3vw,2rem)] font-extrabold leading-tight tracking-tight text-night">
                {current.title}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-night/70">{current.body}</p>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-night/10 pt-6">
                <BrandMark title={current.title} className="h-7" />
                {current.link && (
                  <a
                    href={current.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-hover
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-night px-6 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {equip.sourceLabel} <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </MonoModal>
    </section>
  );
}
