"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function RevealImage({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inner = el.querySelector("[data-img]");
    const ctx = gsap.context(() => {
      gsap.to(el, {
        clipPath: "inset(0 0 0% 0)",
        duration: 1.3,
        ease: "power4.inOut",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
      gsap.from(inner, {
        scale: 1.25,
        duration: 1.6,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={`clip-reveal relative overflow-hidden ${className}`}>
      <div data-img className="absolute inset-0 h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    </div>
  );
}
