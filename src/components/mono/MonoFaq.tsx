"use client";

/* /mono — FAQ accordion (soft height+opacity expand). */

import { useState } from "react";
import { FINAL } from "@/lib/content";
import { MonoKicker } from "./shared";

export function MonoFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-b border-night/10 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <MonoKicker reveal>{FINAL.faq.kicker}</MonoKicker>
        <h2 data-reveal="heading" className="mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-night">
          Түгээмэл асуулт, хариулт
        </h2>

        <div className="mt-10 divide-y divide-night/10 border-y border-night/10">
          {FINAL.faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} data-reveal="up">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  data-cursor-hover
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className={`text-base font-bold md:text-lg ${isOpen ? "text-night" : "text-night/70"}`}>
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
                    <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-night/65">{item.a}</p>
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
