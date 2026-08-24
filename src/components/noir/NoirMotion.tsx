"use client";

/* `/noir` — илрэх анимэйшн ба тоолуур.

   Секц бүрд GSAP хэрэглэхийн оронд нэг л IntersectionObserver: DOM дээрх
   `[data-rise]` бүр харагдмагц `.is-in` авч, CSS шилжилтээр дээшээ гарна.
   `[data-count]` бүхий тоо нь 0-оос жинхэнэ утга хүртлээ тоологдоно. */

import { useEffect } from "react";

const DURATION = 1100;

function countUp(el: HTMLElement, target: number, suffix: string) {
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / DURATION);
    /* easeOutExpo — эхэндээ хурдан, төгсгөлдөө зөөлөн зогсоно. */
    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function NoirMotion() {
  useEffect(() => {
    const rises = Array.from(document.querySelectorAll<HTMLElement>("[data-rise]"));
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      rises.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("is-in");
          const raw = el.dataset.count;
          if (raw) {
            const target = Number(raw);
            if (Number.isFinite(target)) countUp(el, target, el.dataset.countSuffix ?? "");
          }
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
    );

    for (const el of new Set([...rises, ...counters])) io.observe(el);
    return () => io.disconnect();
  }, []);

  return null;
}
