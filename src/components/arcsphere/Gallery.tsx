import { GALLERY } from "./data";
import { Reveal } from "./Reveal";

export function Gallery() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-20 md:px-6 md:py-28">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-[1fr_2.1fr_1fr]">
        {GALLERY.map((g, i) => (
          <Reveal
            key={g.src + i}
            delay={i * 90}
            className={`overflow-hidden rounded-xl ${
              i === 1 ? "col-span-2 md:col-span-1" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={g.src}
              alt={g.alt}
              className={`w-full object-cover ${
                i === 1 ? "aspect-[16/10] md:aspect-auto md:h-[430px]" : "h-[430px]"
              }`}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
