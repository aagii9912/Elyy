"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

// Persists across client navigations (module scope) so we can tell
// the first paint from subsequent route changes.
let firstLoad = true;

export default function Template({ children }: { children: React.ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (firstLoad) {
        firstLoad = false;
        gsap.from(content.current, { opacity: 0, duration: 0.7, ease: "power2.out" });
        return;
      }
      const tl = gsap.timeline();
      tl.set(overlay.current, { scaleY: 1, transformOrigin: "top" })
        .to(overlay.current, {
          scaleY: 0,
          transformOrigin: "bottom",
          duration: 0.7,
          ease: "power4.inOut",
        })
        .from(content.current, { opacity: 0, duration: 0.5 }, "-=0.3");
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div
        ref={overlay}
        aria-hidden
        style={{ transform: "scaleY(0)" }}
        className="pointer-events-none fixed inset-0 z-[80] bg-charcoal"
      />
      <div ref={content}>{children}</div>
    </>
  );
}
