import { HERO } from "./data";
import { Pill } from "./ui";

export function Hero() {
  return (
    <section id="top" className="px-3 pt-3">
      <div className="relative h-[calc(100vh-98px)] min-h-[560px] w-full overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO.image}
          alt="ArcSphere Studio interior"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Legibility gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />

        {/* Heading — bottom left */}
        <h1 className="absolute bottom-24 left-6 max-w-[62%] text-[clamp(2.6rem,7vw,5rem)] font-normal leading-[1.02] tracking-[-0.03em] text-acs-cream md:left-10">
          {HERO.heading.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        {/* Subtitle + CTAs — bottom right */}
        <div className="absolute bottom-24 right-6 max-w-sm md:right-10">
          <p className="text-[0.98rem] leading-relaxed text-acs-cream/90">
            {HERO.subtitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Pill href="#projects" variant="solid">
              {HERO.primary}
            </Pill>
            <Pill href="#contact" variant="outline">
              {HERO.secondary}
            </Pill>
          </div>
        </div>

        {/* Divider line */}
        <div className="absolute inset-x-6 bottom-16 h-px bg-acs-cream/25 md:inset-x-10" />
      </div>
    </section>
  );
}
