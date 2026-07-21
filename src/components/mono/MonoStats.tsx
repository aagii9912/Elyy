"use client";

/* /mono — key numbers, big. Count-up on scroll; lime only on the small
   suffix marks (the 5% accent budget). */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { FINAL } from "@/lib/content";
import { MonoKicker } from "./shared";

const TEXT_STAT = { text: "2027 · II", label: "улиралд ашиглалтад орно" };

export function MonoStats() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = root.current;
    if (!sec) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      sec.querySelectorAll<HTMLElement>("[data-ms-count]").forEach((el) => {
        const target = Number(el.dataset.msCount || "0");
        if (reduce) {
          el.textContent = String(target);
          return;
        }
        const obj = { n: 0 };
        gsap.to(obj, {
          n: target,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => { el.textContent = String(Math.round(obj.n)); },
        });
      });
      if (!reduce) {
        gsap.from("[data-ms-item]", {
          y: 34,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: sec, start: "top 80%" },
        });
      }
    }, sec);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={root} className="border-b border-night/10 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <MonoKicker>{FINAL.stats.kicker}</MonoKicker>
            <h2 className="mt-5 max-w-2xl text-[clamp(1.8rem,3.6vw,2.9rem)] font-extrabold leading-[1.05] tracking-tight text-night">
              {FINAL.about.title}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-night/60 md:text-right">{FINAL.about.body}</p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 md:mt-20 lg:grid-cols-4">
          {FINAL.stats.items.map((s) => (
            <div key={s.label} data-ms-item className="border-t border-night/15 pt-5">
              <p className="text-[clamp(3.2rem,8vw,6.5rem)] font-extrabold leading-none tracking-tight text-night">
                <span data-ms-count={s.value}>0</span>
                {s.suffix && <span className="text-lime">{s.suffix}</span>}
              </p>
              <p className="mt-3 text-[13px] font-medium uppercase tracking-[0.06em] text-night/55">{s.label}</p>
            </div>
          ))}
          <div data-ms-item className="border-t border-night/15 pt-5">
            <p className="text-[clamp(3.2rem,8vw,6.5rem)] font-extrabold leading-none tracking-tight text-night">
              {TEXT_STAT.text.split("·")[0].trim()}
              <span className="text-lime"> · </span>
              <span className="text-[0.55em] align-middle">{TEXT_STAT.text.split("·")[1].trim()}</span>
            </p>
            <p className="mt-3 text-[13px] font-medium uppercase tracking-[0.06em] text-night/55">{TEXT_STAT.label}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
