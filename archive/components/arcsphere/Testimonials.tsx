"use client";

import { useState } from "react";
import { TESTIMONIALS } from "./data";
import { Reveal } from "./Reveal";
import { SectionHead } from "./ui";
import { StarIcon } from "./icons";

export function Testimonials() {
  const [active, setActive] = useState(0);
  const current = TESTIMONIALS.items[active];

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
      <SectionHead title={TESTIMONIALS.title} subtitle={TESTIMONIALS.subtitle} />

      <div className="mt-16 grid items-center gap-10 md:grid-cols-2 md:gap-16">
        {/* Left image */}
        <Reveal className="overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TESTIMONIALS.image}
            alt="Elysium"
            className="aspect-[4/5] w-full object-cover md:aspect-[650/582]"
          />
        </Reveal>

        {/* Right content */}
        <Reveal delay={100}>
          <div className="flex gap-1.5 text-acs-brown">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="h-5 w-5" />
            ))}
          </div>

          <blockquote
            key={active}
            className="mt-8 text-[clamp(1.5rem,2.6vw,2.1rem)] font-medium leading-tight tracking-[-0.01em] text-acs-brown"
          >
            &ldquo;{current.quote}&rdquo;
          </blockquote>

          <div className="mt-12">
            <div className="text-[1.05rem] text-acs-brown">{current.name}</div>
            <div className="mt-1 text-[0.9rem] text-acs-brown/70">{current.role}</div>

            <div className="mt-6 flex gap-3">
              {TESTIMONIALS.items.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={t.name}
                  className={`flex h-14 w-14 items-center justify-center rounded-lg text-[1.1rem] font-medium transition-all duration-300 ${
                    active === i
                      ? "bg-acs-brown text-acs-cream ring-2 ring-acs-brown ring-offset-2 ring-offset-acs-cream"
                      : "bg-acs-brown/10 text-acs-brown/70 hover:bg-acs-brown/20"
                  }`}
                >
                  {t.name.trim().charAt(0)}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
