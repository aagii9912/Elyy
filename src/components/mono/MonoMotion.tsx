"use client";

/* /mono — global motion engine (mounted once in page.tsx).
   1) Scroll reveals: any element opts in via data-reveal, so server
      components stay server components. Variants:
        up (default) | left | right | zoom | heading (blur rise) |
        iso (children <path> slide into place; element itself untouched)
      Optional data-reveal-delay="0.15" adds seconds on top of the
      batch stagger.
   2) Marquee strips (.green-marquee) speed up with scroll velocity —
      the CSS animation's playbackRate follows Lenis, lerped. */

import { useEffect } from "react";
import { useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function MonoMotion() {
  const lenis = useLenis();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");

      els.forEach((el) => {
        switch (el.dataset.reveal) {
          case "heading":
            gsap.set(el, { autoAlpha: 0, y: 34, filter: "blur(10px)" });
            break;
          case "left":
            gsap.set(el, { autoAlpha: 0, x: -36 });
            break;
          case "right":
            gsap.set(el, { autoAlpha: 0, x: 36 });
            break;
          case "zoom":
            gsap.set(el, { autoAlpha: 0, y: 24, scale: 0.95 });
            break;
          case "iso":
            gsap.set(el.querySelectorAll("path"), { y: 18 });
            break;
          default:
            gsap.set(el, { autoAlpha: 0, y: 28 });
        }
      });

      ScrollTrigger.batch(els, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          batch.forEach((node, i) => {
            const el = node as HTMLElement;
            const kind = el.dataset.reveal || "up";
            const delay = i * 0.08 + parseFloat(el.dataset.revealDelay || "0");
            if (kind === "heading") {
              gsap.to(el, {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 1.1,
                ease: "expo.out",
                delay,
              });
            } else if (kind === "iso") {
              gsap.to(el.querySelectorAll("path"), {
                y: 0,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.06,
                delay: delay + 0.15,
              });
            } else {
              gsap.to(el, {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.9,
                ease: "power3.out",
                delay,
              });
            }
          });
        },
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const anims = Array.from(
      document.querySelectorAll<HTMLElement>(".green-marquee")
    ).flatMap((el) => (el.getAnimations ? el.getAnimations() : []));
    if (!anims.length) return;

    let rate = 1;
    const tick = () => {
      const target = 1 + Math.min(Math.abs(lenis.velocity) * 0.055, 2.4);
      rate += (target - rate) * 0.08;
      for (const a of anims) a.playbackRate = rate;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      for (const a of anims) a.playbackRate = 1;
    };
  }, [lenis]);

  return null;
}
