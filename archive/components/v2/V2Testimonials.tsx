"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "@/components/v2/ScrollText";
import { useT } from "@/components/LangProvider";

export function V2Testimonials() {
  const t = useT();
  const items = t.v2.testimonials.items;
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 5500);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <section className="bg-paper py-24 text-night md:py-36">
      <div className="mx-auto max-w-[1100px] px-5 md:px-8">
        <p className="find-label text-night/50">{t.v2.testimonials.kicker}</p>
        <ScrollText
          as="h2"
          text={t.v2.testimonials.title}
          className="mt-4 find-display text-[clamp(2rem,4.5vw,3.75rem)]"
        />

        <div className="relative mt-16 overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {items.map((item) => (
              <figure key={item.name} className="w-full shrink-0 px-1 md:px-6">
                <blockquote className="max-w-4xl font-lora text-[clamp(1.5rem,3vw,2.5rem)] font-normal leading-snug">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-8 text-sm text-night/55">
                  <span className="font-medium text-night">{item.name}</span> · {item.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-center gap-3">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === i ? "w-8 bg-night" : "w-1.5 bg-night/25 hover:bg-night/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
