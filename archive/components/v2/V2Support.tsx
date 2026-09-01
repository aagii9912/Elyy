"use client";

import { useLenis } from "lenis/react";
import { Reveal } from "@/components/Reveal";
import { ScrollText } from "@/components/v2/ScrollText";
import { useT } from "@/components/LangProvider";

export function V2Support() {
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
    <section id="advantages" className="scroll-mt-20 bg-night py-24 text-white md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-16">
          <ScrollText
            as="h2"
            text={t.v2.support.title}
            className="find-display text-[clamp(2.5rem,6vw,5rem)]"
          />
          <div className="md:pt-3">
            <p className="find-label mb-5 text-white/50">{t.v2.support.kicker}</p>
            <p className="text-lg leading-relaxed text-white/70">{t.v2.support.body}</p>
            <a href="#contact" onClick={(e) => go(e, "#contact")} data-cursor-hover className="find-pill find-pill--light mt-8">
              {t.v2.process.cta}
              <span className="find-pill__arrow" aria-hidden>→</span>
            </a>
          </div>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden border border-white/12 bg-white/12 sm:grid-cols-2 lg:grid-cols-4">
          {t.advantages.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.07}>
              <div className="h-full bg-night p-8">
                <span className="find-display text-3xl text-white/35">0{i + 1}</span>
                <h3 className="mt-5 find-display text-xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
