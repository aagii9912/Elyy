import { EXPERTISE } from "./data";
import { Reveal } from "./Reveal";
import { SectionHead } from "./ui";

export function Expertise() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
      <SectionHead title={EXPERTISE.title} subtitle={EXPERTISE.subtitle} />

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {EXPERTISE.items.map((e, i) => (
          <Reveal
            key={e.title}
            delay={i * 110}
            className="group relative overflow-hidden rounded-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={e.image}
              alt={e.title}
              className="aspect-[650/603] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/25" />

            {/* Top-left stat */}
            <div className="absolute left-6 top-6 text-acs-cream md:left-8 md:top-8">
              <div className="text-[clamp(3rem,6vw,5.5rem)] font-medium leading-none tracking-[-0.02em]">
                {e.stat}
              </div>
              <div className="mt-2 text-[0.72rem] uppercase tracking-[0.06em] text-acs-cream/85">
                {e.statLabel}
              </div>
            </div>

            {/* Bottom-left title + desc */}
            <div className="absolute inset-x-6 bottom-6 text-acs-cream md:inset-x-8 md:bottom-8">
              <h3 className="text-[clamp(1.4rem,2.2vw,1.9rem)] font-medium uppercase tracking-[-0.01em]">
                {e.title}
              </h3>
              <p className="mt-2 max-w-md text-[0.72rem] uppercase leading-relaxed tracking-[0.05em] text-acs-cream/85">
                {e.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
