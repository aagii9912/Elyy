"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { FINAL } from "@/lib/content";

export function FinalFaq() {
  const { kicker, items } = FINAL.faq;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-bone py-24 font-gilroy md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <Reveal>
            <p className="fnl-kicker text-moss">{kicker}</p>
            <h2 className="mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)] font-extrabold leading-[1.02] tracking-tight text-ink">
              Асуулт &amp; хариулт
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <ul className="border-t border-ink/12">
              {items.map((item, i) => {
                const isOpen = open === i;
                return (
                  <li key={item.q} className="border-b border-ink/12">
                    <button
                      type="button"
                      data-cursor-hover
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    >
                      <span className="text-lg font-semibold text-ink md:text-xl">{item.q}</span>
                      <span
                        aria-hidden
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/20 text-xl leading-none text-ink transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p
                          className={`max-w-2xl pb-7 text-base leading-relaxed text-ink/65 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] md:text-lg ${
                            isOpen ? "translate-y-0" : "-translate-y-1"
                          }`}
                        >
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
