"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Seamless infinite horizontal image marquee. The row is duplicated and
 * translated by exactly -50% (or +50% when reversed) so the loop is gapless.
 * Pauses on hover; subtle zoom on each image.
 */
export function InfiniteGallery({
  images,
  duration = 42,
  reverse = false,
  className = "",
}: {
  images: string[];
  duration?: number;
  reverse?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tween = reverse
        ? gsap.fromTo(el, { xPercent: -50 }, { xPercent: 0, duration, ease: "none", repeat: -1 })
        : gsap.fromTo(el, { xPercent: 0 }, { xPercent: -50, duration, ease: "none", repeat: -1 });

      const enter = () => gsap.to(tween, { timeScale: 0, duration: 0.6, overwrite: true });
      const leave = () => gsap.to(tween, { timeScale: 1, duration: 0.6, overwrite: true });
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
      };
    }, track);
    return () => ctx.revert();
  }, [duration, reverse]);

  const row = [...images, ...images];

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max gap-4 md:gap-6">
        {row.map((src, i) => (
          <div
            key={i}
            className="group relative aspect-[4/5] w-[clamp(180px,24vw,340px)] shrink-0 overflow-hidden rounded-sm bg-night/5"
          >
            <Image
              src={src}
              alt="Elysium"
              fill
              sizes="(max-width:768px) 60vw, 340px"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
