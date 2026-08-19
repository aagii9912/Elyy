"use client";

/* /mono — Зургийн цомог. Interior renders (зочны / унтлагын / угаалгын
   өрөө) drift sideways on an infinite marquee.

   Хоёр зүйл дээр анхаарав:

   • Хэмжээ. Эх интерьер рендерүүд ширээний хэмжээтэй (16 файл ≈ 6 МБ)
     байсан бөгөөд карт нь утсан дээр ердөө 68vw ≈ 255px өргөнтэй.
     `next/image` нь `sizes`-ийн дагуу AVIF/WebP хувилбар өгнө — тэр
     карт 350 КБ JPEG биш ~30 КБ зураг татна.

   • Хоёр дахь хуулбар. Давталт (`translateX(-50%)`) нь мөрөө ЯГ хоёр
     удаа зурсан байхыг шаарддаг тул `loading="lazy"` энд ажилладаггүй:
     хуулбар нь эхнийхтэйгээ хамт төрдөг. Тиймээс хэсэг дэлгэцэнд
     ойрттол хуулбарыг нь ОГТ зурахгүй (`MonoScrollStory`-гийн кадар
     ачаалагчийн загвараар) — тэр болтол мөр хөдөлгөөнгүй, зөвхөн нэг
     хуулбартай зогсоно. */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";

/* Картын өргөн: 68vw → 42vw → 30vw → 24vw (доорх `figure`-тэй тохирно). */
const SIZES = "(max-width: 639px) 68vw, (max-width: 767px) 42vw, (max-width: 1023px) 30vw, 24vw";

export function MonoGallery({ site }: { site: SiteContent }) {
  const { gallery } = site;
  const root = useRef<HTMLElement>(null);
  /** Давталтын хоёр дахь хуулбар төрсөн үү. */
  const [looping, setLooping] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLooping(true);
          io.disconnect();
        }
      },
      { rootMargin: "120% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={root} className="overflow-hidden border-b border-night/10 bg-ground py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <MonoKicker reveal>{gallery.kicker}</MonoKicker>
        <h2 data-reveal="heading" className="mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night">
          {gallery.title}
        </h2>
      </div>

      <div data-reveal="up" className="mt-12">
        {/* Анимацийг хуулбартай нь ХАМТ асаана: ганц хуулбар дээр
            `-50%` нь мөрийг хагасаар нь хоослоод үсэрнэ. */}
        <div className={`flex w-max gap-5 pr-5 ${looping ? "green-marquee fast" : ""}`}>
          {(looping ? [0, 1] : [0]).map((half) => (
            <div key={half} className="flex gap-5" aria-hidden={half === 1}>
              {gallery.images.map((img, i) => (
                <figure
                  key={`${half}-${i}`}
                  className="relative aspect-[4/3] w-[68vw] shrink-0 overflow-hidden rounded-2xl border border-night/10 sm:w-[42vw] md:w-[30vw] lg:w-[24vw]"
                >
                  <Image
                    src={img.src}
                    alt={half === 1 ? "" : `${img.tag} — интерьер`}
                    fill
                    sizes={SIZES}
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-night backdrop-blur">
                    {img.tag}
                  </figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
