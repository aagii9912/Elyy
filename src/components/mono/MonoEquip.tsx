"use client";

/* / — Барилгын бүтэц (Chapter 03).

   Түүх: pinned хар бүлэг → карт + pop-up → одоо бүтэн дэлгэцийн
   слайдер. Материал бүр нэг слайд: арын зураг бүтэн дэлгэцээр солигдож,
   доод талд дугуй thumbnail-ууд сонголтын мөр болно, мета зурвасын
   баруун захын CTA (`equip.ctaLabel`) идэвхтэй материалын дэлгэрэнгүй
   pop-up-ыг нээнэ — том зураг, бүтэн тайлбар, брэндийн тэмдэг,
   үйлдвэрлэгчийн холбоос.

   Барилгын бичлэгийн кадрууд (public/structure-frames) зураг
   тохируулаагүй материалын арын дэвсгэр болно; текст, зураг, холбоос
   бүгд `/admin/site` → Барилгын бүтэц хэсгээс удирдагдана.

   Агаар сэлгэлтийн систем энэ хэсгээс ХАСАГДСАН — админ дээр хадгалсан
   контентод үлдсэн байсан ч `HIDDEN` шүүлтүүр түүнийг гаргахгүй. */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { LogoMark } from "@/components/Logo";
import { MonoKicker } from "./shared";
import { MonoModal } from "./MonoModal";
import { PortraitShowcase, type ShowcaseSlide } from "@/components/ui/portrait-showcase";

/* Брэндийн тэмдэг — материалын нэрээр таарна. Танихгүй зүйл дээр
   Elysium-ийн ромб тавина, ингэснээр админ дурын материал нэмж болно. */
const MARKS: Array<{ match: RegExp; src?: string; alt: string; mark?: boolean }> = [
  { match: /цутгамал/i, alt: "Elysium Residence", mark: true },
  { match: /veka|цонх/i, src: "/brand/veka-mark.png", alt: "VEKA" },
  { match: /yaret|фасад/i, src: "/brand/yaret-mark.png", alt: "Yaret Group" },
];

const markFor = (title: string) => MARKS.find((m) => m.match.test(title));

/* Секцээс хасагдсан материал. Өгөгдмөл контентод байхгүй ч админд
   хадгалагдсан хуучин контентод үлдсэн байж болзошгүй тул шүүнэ. */
const HIDDEN = /агаар\s*сэлг|сэлгэлт|ventilat/i;

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
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  /* Гурван үндсэн бүтээц (цутгамал каркас → цонх → фасад). Админ
     нэмсэн зүйл бүр шинэ слайд болно; агаар сэлгэлт л хасагдана. */
  const items = equip.items.filter((item) => !HIDDEN.test(item.title));
  if (!items.length) return null;

  const index = Math.min(active, items.length - 1);
  const current = items[index];
  const currentImage = imageFor(current.image, index);

  const slides: ShowcaseSlide[] = items.map((item, i) => ({
    id: `${item.title}-${i}`,
    image: imageFor(item.image, i),
    alt: item.title,
    name: item.title,
    role: markFor(item.title)?.alt,
    description: item.body,
  }));

  return (
    <section id="equip" className="relative border-b border-night/10 bg-night">
      <PortraitShowcase
        slides={slides}
        active={index}
        onActiveChange={setActive}
        eyebrow={
          <MonoKicker tone="dark" reveal>
            03 — {equip.kicker}
          </MonoKicker>
        }
        headline={equip.title}
        lede={equip.body}
        meta={`${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`}
        action={
          <button
            type="button"
            data-cursor-hover
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-night transition-transform duration-300 hover:-translate-y-0.5"
          >
            {equip.ctaLabel}
            <span aria-hidden>→</span>
          </button>
        }
      />

      <MonoModal
        open={open}
        onClose={() => setOpen(false)}
        label={current.title}
        size="lg"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
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
      </MonoModal>
    </section>
  );
}
