"use client";

import { createElement, ElementType, ReactNode, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * LAGOM-style scroll reveals (GSAP ScrollTrigger):
 *  - variant="image": a clip-path wipe-up + slow inner scale (premium image reveal)
 *  - variant="text":  deliberate y-translate + fade
 * Respects prefers-reduced-motion (leaves content visible, no animation).
 */
export function LagomReveal({
  children,
  variant = "text",
  className = "",
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  variant?: "image" | "text";
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      if (variant === "image") {
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.25,
            ease: "power4.out",
            delay,
            scrollTrigger: { trigger: el, start: "top 85%" },
          }
        );
        // gentle scale on the inner media (skip Swiper, whose transforms we must not fight)
        const inner = el.querySelector<HTMLElement>(".swiper") ? null : el.querySelector<HTMLElement>("img");
        if (inner) {
          gsap.fromTo(
            inner,
            { scale: 1.16 },
            { scale: 1, duration: 1.5, ease: "power3.out", delay, scrollTrigger: { trigger: el, start: "top 85%" } }
          );
        }
      } else {
        gsap.fromTo(
          el,
          { y: 36, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay, scrollTrigger: { trigger: el, start: "top 88%" } }
        );
      }
    }, el);
    return () => ctx.revert();
  }, [variant, delay]);

  return createElement(as, { ref, className }, children);
}
