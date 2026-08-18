"use client";

/* /mono — VR / 360° аялал. Постер зураг дээр дарахад бүтэн дэлгэцийн
   pop-up дотор embed (Matterport / Kuula / YouTube 360) ачаалагдана.
   iframe нь зөвхөн нээгдсэн үед л үүсдэг тул хуудас ачаалахад ямар ч
   гуравдагч талын хүсэлт явахгүй.

   `vr.embedUrl` хоосон үед секц нуугдахын оронд "тун удахгүй" төлөвтэй
   харагдана: 360° тэмдэг + `soonLabel`, CTA нь #contact руу хөтөлнө.
   Ингэснээр VR хэсэг аялал бэлэн болохоос өмнө ч сайт дээр байж, сонирхсон
   хүнийг уулзалт руу чиглүүлнэ. Постер ч хоосон бол секц рендерлэгдэхгүй. */

import { useState } from "react";
import { useLenis } from "lenis/react";
import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";
import { MonoModal } from "./MonoModal";

export function MonoVr({ site }: { site: SiteContent }) {
  const { vr } = site;
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  const ready = Boolean(vr.embedUrl?.trim());
  if (!ready && !vr.poster?.trim()) return null;

  const goContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#contact");
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -70 });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  const mediaClass =
    "group relative mt-10 block w-full overflow-hidden rounded-2xl border border-night/10 bg-night/5 md:mt-12";

  const media = (
    <>
      <span className="block aspect-[16/10] w-full sm:aspect-[16/7]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={vr.poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </span>
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/70 via-night/10 to-night/20" />

      <span className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <span className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full border border-white/50 bg-white/10 text-white backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
          <span aria-hidden className="green-ping absolute inset-0 rounded-full text-white/70" />
          {ready ? (
            <svg aria-hidden viewBox="0 0 24 24" className="relative h-7 w-7" fill="currentColor">
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          ) : (
            <span className="relative text-[15px] font-extrabold tracking-tight">360°</span>
          )}
        </span>
        <span className="text-[13px] font-bold uppercase tracking-[0.22em] text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.6)]">
          {ready ? vr.ctaLabel : vr.soonLabel}
        </span>
        {!ready && (
          <span className="inline-flex min-h-11 items-center rounded-full bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-night transition-transform duration-300 group-hover:-translate-y-0.5">
            {vr.soonCta}
          </span>
        )}
      </span>

      {ready && vr.note && (
        <span className="absolute bottom-4 left-4 right-4 text-[11px] font-medium text-white/70 sm:left-6 sm:right-auto">
          {vr.note}
        </span>
      )}
    </>
  );

  return (
    <section id="vr" className="border-b border-night/10 bg-ground py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <MonoKicker reveal>{vr.kicker}</MonoKicker>
            <h2
              data-reveal="heading"
              className="mt-4 max-w-xl text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night"
            >
              {vr.title}
            </h2>
          </div>
          <p data-reveal="up" data-reveal-delay="0.15" className="max-w-sm text-sm leading-relaxed text-night/60">
            {vr.body}
          </p>
        </div>

        {ready ? (
          <button
            type="button"
            data-cursor-hover
            data-reveal="zoom"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className={mediaClass}
          >
            {media}
          </button>
        ) : (
          <a href="#contact" onClick={goContact} data-cursor-hover data-reveal="zoom" className={mediaClass}>
            {media}
          </a>
        )}
      </div>

      {ready && (
        <MonoModal open={open} onClose={() => setOpen(false)} label={vr.title} size="full">
          <div className="aspect-[16/10] w-full bg-night sm:aspect-[16/9]">
            <iframe
              src={vr.embedUrl}
              title={vr.title}
              allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen; autoplay"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full border-0"
            />
          </div>
        </MonoModal>
      )}
    </section>
  );
}
