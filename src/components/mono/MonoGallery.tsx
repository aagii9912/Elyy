/* /mono — Зургийн цомог. Interior renders (зочны / унтлагын / угаалгын
   өрөө) drift sideways on an infinite marquee. */

import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";
import { flatSectionTone } from "@/lib/theme-css";

export function MonoGallery({ site }: { site: SiteContent }) {
  const { gallery } = site;

  return (
    <section
      data-bg="gallery"
      data-tone={flatSectionTone(site.theme, "gallery")}
      className="overflow-hidden border-b border-fg/10 bg-ground py-24 md:py-28"
    >
      <div className="mx-auto max-w-[1500px] px-6 md:px-10">
        <MonoKicker reveal>{gallery.kicker}</MonoKicker>
        <h2 data-reveal="heading" className="mt-4 mono-h2">
          {gallery.title}
        </h2>
      </div>

      <div data-reveal="up" className="mt-12">
        <div className="green-marquee fast flex w-max gap-5 pr-5">
          {[0, 1].map((half) => (
            <div key={half} className="flex gap-5" aria-hidden={half === 1}>
              {gallery.images.map((img, i) => (
                <figure
                  key={`${half}-${i}`}
                  className="relative w-[68vw] shrink-0 overflow-hidden rounded-2xl border border-fg/10 sm:w-[42vw] md:w-[30vw] lg:w-[24vw]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={`${img.tag} — интерьер`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <figcaption className="glass glass-chip absolute bottom-3 left-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-fg">
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
