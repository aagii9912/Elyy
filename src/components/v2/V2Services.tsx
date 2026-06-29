"use client";

import { useLenis } from "lenis/react";
import { Reveal } from "@/components/Reveal";
import { ScrollText } from "@/components/v2/ScrollText";
import { useT } from "@/components/LangProvider";

export function V2Services() {
  const t = useT();
  const lenis = useLenis();
  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -70 });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="apartments" className="scroll-mt-20 bg-night py-24 text-white md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        {/* heading row */}
        <div className="grid gap-y-6 pb-16 md:grid-cols-[200px_1fr]">
          <p className="find-label text-white/50 md:pt-2">{t.v2.services.kicker}</p>
          <ScrollText
            as="h2"
            text={t.v2.services.title}
            className="find-display text-[clamp(2.25rem,5vw,4.5rem)]"
          />
        </div>

        {/* numbered giant-word rows */}
        <div className="border-t border-white/15">
          {t.v2.services.items.map((item, idx) => (
            <div
              key={item.title}
              className="grid items-center gap-6 border-b border-white/15 py-12 md:grid-cols-[60px_minmax(0,360px)_1fr] md:gap-10 md:py-16"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 text-xs">
                {idx + 1}
              </span>
              <Reveal>
                <p className="leading-relaxed text-white/70">{item.body}</p>
              </Reveal>
              <ScrollText
                as="h3"
                text={item.title}
                className="find-display text-[clamp(2.5rem,7vw,6rem)] md:text-right"
              />
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <a href="#contact" onClick={(e) => go(e, "#contact")} data-cursor-hover className="find-pill find-pill--light">
            {t.v2.services.cta}
            <span className="find-pill__arrow" aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
