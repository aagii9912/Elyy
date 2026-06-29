"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function Counter({
  value,
  suffix = "",
  className = "",
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: value,
        duration: 2.2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: () => {
          el.textContent = Math.round(obj.v).toString();
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [value]);
  return (
    <span className={className}>
      <span ref={ref}>0</span>
      {suffix}
    </span>
  );
}
