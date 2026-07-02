"use client";

import { useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { gsap } from "@/lib/gsap";
import { FINAL, SITE } from "@/lib/content";

const WORDMARK = "ELYSIUM";

export function FinalFooter() {
  const year = new Date().getFullYear();

  // elyse-style giant wordmark: per-LETTER masked stagger reveal on scroll, once.
  const wordmarkRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wordmarkRef.current;
    if (!el) return;
    const letters = el.querySelectorAll<HTMLElement>("[data-letter]");
    if (!letters.length) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(letters, { yPercent: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(letters, { yPercent: 115, opacity: 0 });
      gsap.to(letters, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        stagger: 0.04,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <footer className="scroll-mt-20 bg-charcoal py-24 font-gilroy text-bone md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div className="flex flex-col gap-4">
              <Logo className="h-7 w-auto text-bone" />
              <p className="max-w-xs text-sm leading-relaxed text-bone/55">
                {FINAL.brandTag}
              </p>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wide text-bone/40">Холбоо барих</p>
              <a
                href={`mailto:${SITE.email}`}
                className="text-sm font-semibold text-bone/80 transition-colors hover:text-lime"
              >
                {SITE.email}
              </a>
              <a
                href={`tel:${FINAL.contact.phone.replace(/[^0-9+]/g, "")}`}
                className="text-sm font-semibold text-bone/80 transition-colors hover:text-lime"
              >
                {FINAL.contact.phone}
              </a>
              <p className="text-sm text-bone/55">{FINAL.contact.hours}</p>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wide text-bone/40">Байршил</p>
              <p className="max-w-xs text-sm leading-relaxed text-bone/80">
                {FINAL.contact.location}
              </p>
            </div>

            {/* Social */}
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wide text-bone/40">Сошиал</p>
              {SITE.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-bone/80 transition-colors hover:text-lime"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Giant wordmark — per-letter masked stagger reveal (elyse-style). */}
        <div
          ref={wordmarkRef}
          aria-label={WORDMARK}
          className="mt-20 flex overflow-hidden md:mt-28"
        >
          {WORDMARK.split("").map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              className="inline-block overflow-hidden pb-[0.06em] align-bottom"
              aria-hidden
            >
              <span
                data-letter
                className="inline-block select-none font-extrabold leading-[0.85] tracking-tight text-bone/95 text-[clamp(3rem,14vw,12rem)]"
              >
                {ch}
              </span>
            </span>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col gap-2 border-t border-bone/10 pt-8 text-bone/45 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">© {year} Elysium Residence</p>
          <p className="text-sm">{FINAL.developer.name}</p>
        </div>
      </div>
    </footer>
  );
}
