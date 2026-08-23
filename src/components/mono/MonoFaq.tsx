"use client";

/* /mono — FAQ accordion (soft height+opacity expand). */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { MonoKicker } from "./shared";
import { sectionTone } from "@/lib/theme-css";

export function MonoFaq({ site }: { site: SiteContent }) {
  const { faq } = site;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      data-bg="faq"
      data-tone={sectionTone(site.theme, "faq", "light")}
      className="border-b border-fg/10 bg-ground py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <MonoKicker reveal>{faq.kicker}</MonoKicker>
        <h2 data-reveal="heading" className="mt-4 mono-h2">
          {faq.title}
        </h2>

        <div className="mt-10 divide-y divide-fg/10 border-y border-fg/10">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={`${item.q}-${i}`} data-reveal="up">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  data-cursor-hover
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className={`text-base font-bold md:text-lg ${isOpen ? "text-fg" : "text-fg/70"}`}>
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className={`relative h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  >
                    <span className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-night" />
                    <span className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 bg-night" />
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-fg/65">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
