import { GEHRY } from "./data";
import { Pill } from "./ui";

export function CtaBand() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-10 md:px-10">
      <div className="relative overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GEHRY.image}
          alt="Hillside residence"
          className="h-[460px] w-full object-cover md:h-[520px]"
        />
        <div className="absolute inset-0 bg-black/10" />

        {/* Faint quote — top left */}
        <blockquote className="absolute left-6 top-8 max-w-md md:left-10 md:top-10">
          <p className="text-[clamp(1.1rem,1.9vw,1.6rem)] font-medium uppercase leading-snug tracking-[-0.01em] text-white/45">
            &ldquo;{GEHRY.quote}&rdquo;
          </p>
          <footer className="mt-3 text-[0.75rem] uppercase tracking-[0.08em] text-white/45">
            {GEHRY.author}
          </footer>
        </blockquote>

        {/* CTAs — bottom right */}
        <div className="absolute bottom-8 right-6 flex flex-wrap gap-3 md:bottom-10 md:right-10">
          <Pill href="#projects" variant="solid">
            {GEHRY.primary}
          </Pill>
          <Pill href="#contact" variant="outline">
            {GEHRY.secondary}
          </Pill>
        </div>
      </div>
    </section>
  );
}
