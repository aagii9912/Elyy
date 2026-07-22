/* /mono — Зургийн цомог. Interior renders (зочны / унтлагын / угаалгын
   өрөө) drift sideways on an infinite marquee. */

import { FINAL } from "@/lib/content";
import { MonoKicker } from "./shared";

type Img = { src: string; tag: string };

const IMAGES: Img[] = [
  { src: "/images/interior/living-01.jpg", tag: "Зочны өрөө" },
  { src: "/images/interior/bedroom-01.jpg", tag: "Унтлагын өрөө" },
  { src: "/images/interior/living-02.jpg", tag: "Зочны өрөө" },
  { src: "/images/interior/bath-01.jpg", tag: "Угаалгын өрөө" },
  { src: "/images/interior/living-03.jpg", tag: "Зочны өрөө" },
  { src: "/images/interior/bedroom-02.jpg", tag: "Унтлагын өрөө" },
  { src: "/images/interior/living-04.jpg", tag: "Зочны өрөө" },
  { src: "/images/interior/bedroom-03.jpg", tag: "Унтлагын өрөө" },
  { src: "/images/interior/living-05.jpg", tag: "Зочны өрөө" },
  { src: "/images/interior/bath-02.jpg", tag: "Угаалгын өрөө" },
  { src: "/images/interior/living-06.jpg", tag: "Зочны өрөө" },
  { src: "/images/interior/bedroom-04.jpg", tag: "Унтлагын өрөө" },
  { src: "/images/interior/bedroom-05.jpg", tag: "Унтлагын өрөө" },
  { src: "/images/interior/bath-03.jpg", tag: "Угаалгын өрөө" },
];

export function MonoGallery() {
  return (
    <section className="overflow-hidden border-b border-night/10 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <MonoKicker reveal>{FINAL.gallery.kicker}</MonoKicker>
        <h2 data-reveal="heading" className="mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night">
          {FINAL.gallery.title}
        </h2>
      </div>

      <div data-reveal="up" className="mt-12">
        <div className="green-marquee fast flex w-max gap-5 pr-5">
          {[0, 1].map((half) => (
            <div key={half} className="flex gap-5" aria-hidden={half === 1}>
              {IMAGES.map((img) => (
                <figure
                  key={`${half}-${img.src}`}
                  className="relative w-[68vw] shrink-0 overflow-hidden rounded-2xl border border-night/10 sm:w-[42vw] md:w-[30vw] lg:w-[24vw]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={`${img.tag} — интерьер`}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
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
