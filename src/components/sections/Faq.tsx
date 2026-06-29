"use client";

import { useState } from "react";
import { RevealText } from "@/components/Reveal";
import { useT } from "@/components/LangProvider";

export function Faq() {
  const t = useT();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-bone py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-5 md:px-10">
        <p className="text-center overline text-moss">{t.faq.kicker}</p>
        <RevealText as="h2" text={t.faq.title} className="mt-4 text-center font-display text-display font-light" />
        <ul className="mt-14 border-y border-ink/10">
          {t.faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={i} className="border-b border-ink/10 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-display text-xl font-light md:text-2xl">{item.q}</span>
                  <span className={`shrink-0 text-2xl text-gold transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} aria-hidden>
                    +
                  </span>
                </button>
                <div className={`grid transition-all duration-500 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-7 leading-relaxed text-taupe">{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
