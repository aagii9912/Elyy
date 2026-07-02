import { STATEMENT } from "./data";
import { Reveal } from "./Reveal";

export function Statement() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
      <div className="grid items-center gap-10 md:grid-cols-[340px_1fr_340px]">
        {/* Left image — sits higher */}
        <Reveal className="overflow-hidden rounded-xl md:-translate-y-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={STATEMENT.imageLeft}
            alt="Interior detail"
            className="h-[300px] w-full object-cover md:h-[360px]"
          />
        </Reveal>

        {/* Center heading */}
        <div className="order-first text-center md:order-none">
          <Reveal
            as="h2"
            className="text-[clamp(1.9rem,4.4vw,2.5rem)] font-medium uppercase leading-[1.28] tracking-[-0.01em] text-acs-brown"
          >
            {STATEMENT.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </Reveal>
          <Reveal
            as="p"
            delay={90}
            className="mx-auto mt-5 max-w-sm text-[0.95rem] uppercase leading-relaxed tracking-[0.02em] text-acs-brown/75"
          >
            {STATEMENT.subtitle}
          </Reveal>
        </div>

        {/* Right image — sits lower */}
        <Reveal delay={120} className="overflow-hidden rounded-xl md:translate-y-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={STATEMENT.imageRight}
            alt="Interior in motion"
            className="h-[300px] w-full object-cover md:h-[360px]"
          />
        </Reveal>
      </div>
    </section>
  );
}
