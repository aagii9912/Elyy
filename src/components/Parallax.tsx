"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** Scrubbed vertical parallax. Wrap an oversized child inside an
 *  overflow-hidden parent for a depth effect. */
export function Parallax({
  children,
  speed = 0.18,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed * 100 },
        {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [speed]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
