"use client";

import { createElement, ElementType, useEffect, useRef } from "react";
import Image from "next/image";
import SplitType from "split-type";
import { gsap } from "@/lib/gsap";
import { FINAL } from "@/lib/content";
import { Reveal } from "@/components/Reveal";
import { LagomReveal } from "@/components/lagom/LagomReveal";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Display headline where EACH WORD is its own masked element, revealed with a
 *  staggered rise (ref image25 — word-by-word). Respects reduced motion. */
function WordReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.12,
  as = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = text;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let split: SplitType | null = null;
    let cancelled = false;
    const ctx = gsap.context(() => {}, el);
    const run = () => {
      if (cancelled || !el) return;
      split = new SplitType(el, { types: "words" });
      const words = (split.words ?? []) as HTMLElement[];
      words.forEach((word) => {
        const wrap = document.createElement("span");
        wrap.style.display = "inline-block";
        wrap.style.overflow = "hidden";
        wrap.style.verticalAlign = "top";
        wrap.style.paddingBottom = "0.08em";
        word.parentNode?.insertBefore(wrap, word);
        wrap.appendChild(word);
        word.style.display = "inline-block";
      });
      ctx.add(() => {
        gsap.set(words, { yPercent: 120 });
        gsap.to(words, {
          yPercent: 0,
          duration: 1.05,
          ease: "power3.out",
          stagger,
          delay,
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    };
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(run);
    } else {
      run();
    }
    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [delay, stagger, text]);

  return createElement(as, {
    ref,
    className,
    dangerouslySetInnerHTML: { __html: escapeHtml(text) },
  });
}

export function FinalAbout() {
  const { kicker, title, body, completionLabel, completion } = FINAL.about;

  return (
    <section id="about" className="scroll-mt-20 bg-sand py-24 font-gilroy md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        {/* Top row: small italic section label (left) + narrow body (right),
            straddling a centered image — ref image25. */}
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          {/* Section label — small italic "(...)" */}
          <div className="md:col-span-3">
            <Reveal>
              <p className="text-[15px] font-light italic tracking-[0.02em] text-moss">
                ({kicker})
              </p>
            </Reveal>
          </div>

          {/* Centered imagery */}
          <div className="md:col-span-6">
            <LagomReveal
              variant="image"
              delay={0.1}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl"
            >
              <Image
                src="/images/exterior-elevation-dusk.jpg"
                alt={FINAL.brandLine}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </LagomReveal>
          </div>

          {/* Narrow body measure (~300px) beside imagery */}
          <div className="md:col-span-3">
            <Reveal delay={0.15}>
              <p className="max-w-[300px] text-[15px] font-light leading-[1.55] tracking-[0.6px] text-ink/75">
                {body}
              </p>
              <div className="mt-8">
                <p className="text-[13px] font-light uppercase tracking-[0.14em] text-moss">
                  {completionLabel}
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-ink">
                  {completion}
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Monumental display headline — word-by-word masked reveal, low-left
            (ref image25). 57px @1440 => clamp; uppercase; -3% tracking; 1.18 lh. */}
        <WordReveal
          text={title}
          className="mt-16 max-w-[16ch] font-black uppercase leading-[1.18] tracking-[-0.03em] text-ink [font-size:clamp(2.5rem,5.5vw,3.6rem)] md:mt-24"
        />
      </div>
    </section>
  );
}
