"use client";

import { createElement, ElementType, useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Two-tone scroll-reveal headline — the signature FIND motif.
 * Words start dimmed (low opacity) and fill to full strength, word by word,
 * as the element scrolls through the viewport (scrubbed to scroll position).
 * Color is inherited, so it reads as grey→black on light sections and
 * dark→white on dark sections without any per-call configuration.
 */
export function ScrollText({
  text,
  as = "h2",
  className = "",
  start = "top 82%",
  end = "top 38%",
}: {
  text: string;
  as?: ElementType;
  className?: string;
  start?: string;
  end?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>(".word"));
    if (!words.length) return;

    const ctx = gsap.context(() => {
      gsap.set(words, { opacity: 0.22 });
      gsap.to(words, {
        opacity: 1,
        ease: "none",
        stagger: 0.5,
        scrollTrigger: {
          trigger: el,
          start,
          end,
          scrub: true,
        },
      });
    }, el);

    // Recompute once fonts settle so word boxes are measured correctly.
    if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [text, start, end]);

  // Split into words, preserving spaces inside each word span so wrapping looks natural.
  const parts = text.split(/(\s+)/);

  return createElement(
    as,
    { ref, className: `find-scrolltext ${className}` },
    parts.map((p, i) =>
      /\s+/.test(p) ? (
        p
      ) : (
        <span className="word" key={i}>
          {p}
        </span>
      )
    )
  );
}
