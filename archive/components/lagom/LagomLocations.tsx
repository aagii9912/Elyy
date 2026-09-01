"use client";

import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { LagomReveal } from "@/components/lagom/LagomReveal";
import { useT } from "@/components/LangProvider";
import { SITE } from "@/lib/content";

export function LagomLocations() {
  const t = useT();

  return (
    <section id="locations" className="scroll-mt-20 bg-lagom-cream py-24 md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        {/* index + heading */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <span className="lagom-num text-xl md:text-2xl">004</span>
            <h2 className="lagom-display mt-5 max-w-2xl text-4xl leading-[0.95] md:text-6xl">
              {t.gallery.title}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-sm text-base text-lagom-ink/70">{t.developer.body}</p>
          </Reveal>
        </div>

        {/* single location card */}
        <Reveal delay={0.16} className="mt-12 md:mt-16">
          <div className="grid grid-cols-1 overflow-hidden bg-lagom-card md:grid-cols-2">
            <LagomReveal variant="image" className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[520px]">
              <Image
                src="/images/aerial-masterplan.jpg"
                alt="Elysium"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover"
              />
            </LagomReveal>

            <div className="flex flex-col justify-center gap-8 p-8 md:p-14">
              <div>
                <span className="lagom-num text-sm text-lagom-ink/45">{SITE.developer}</span>
                <h3 className="lagom-display mt-3 text-3xl leading-tight md:text-5xl">
                  {SITE.name}
                </h3>
              </div>

              <div className="flex flex-col gap-5 border-t border-lagom-ink/10 pt-7">
                <p className="text-base leading-relaxed text-lagom-ink/70">
                  {t.footer.salesAddress}
                </p>
                <a
                  href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                  className="w-fit text-lg font-semibold tracking-wide text-lagom-orange transition-opacity hover:opacity-70"
                  style={{ fontFamily: "var(--font-mulish)" }}
                >
                  {SITE.phone}
                </a>
              </div>

              <a href="#contact" data-cursor-hover className="lagom-btn lagom-btn--ghost w-fit">
                {t.cta}
                <span className="lagom-btn__arrow" aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
