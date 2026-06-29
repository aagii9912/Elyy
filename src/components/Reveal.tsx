"use client";

import { createElement, ElementType, useEffect, useRef } from "react";
import SplitType from "split-type";
import { gsap } from "@/lib/gsap";

/** Single-element fade + rise on scroll. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 1.1,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    }, el);
    return () => ctx.revert();
  }, [delay]);

  return createElement(as, { ref, className: `fade-up ${className}` }, children);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Headline line-mask reveal — each line rises from behind a clip.
 *  The text is rendered via dangerouslySetInnerHTML so React owns the
 *  markup: when the language changes, React replaces it cleanly and the
 *  effect re-splits (SplitType mutating React-managed children would
 *  otherwise leave stale text on switch). */
export function RevealText({
  text,
  className = "",
  delay = 0,
  stagger = 0.09,
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
    // Show the current-language text immediately (clears any stale split
    // markup) so a language switch never leaves the previous text behind.
    el.textContent = text;
    let split: SplitType | null = null;
    let cancelled = false;
    const ctx = gsap.context(() => {}, el);
    const run = () => {
      if (cancelled || !el) return;
      split = new SplitType(el, { types: "lines" });
      const lines = (split.lines ?? []) as HTMLElement[];
      lines.forEach((line) => {
        const wrap = document.createElement("span");
        wrap.style.display = "block";
        wrap.style.overflow = "hidden";
        wrap.style.paddingBottom = "0.06em";
        line.parentNode?.insertBefore(wrap, line);
        wrap.appendChild(line);
        line.style.display = "block";
      });
      ctx.add(() => {
        gsap.set(lines, { yPercent: 118 });
        gsap.to(lines, {
          yPercent: 0,
          duration: 1.05,
          ease: "power3.out",
          stagger,
          delay,
          scrollTrigger: { trigger: el, start: "top 86%" },
        });
      });
    };
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(run);
    } else {
      run();
    }
    // React controls innerHTML (dangerouslySetInnerHTML), so only kill GSAP.
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
