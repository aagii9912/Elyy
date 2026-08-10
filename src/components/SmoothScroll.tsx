"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

function LenisGsapBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Recompute trigger positions once fonts/images settle so reveals that
    // are already in the first viewport fire reliably.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      gsap.ticker.remove(update);
      lenis.off("scroll", ScrollTrigger.update);
      window.removeEventListener("load", refresh);
    };
  }, [lenis]);
  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Админ (/admin) — native scroll ашиглана (форм-ийн UX, sticky toolbar
  // тогтвортой). Бусад бүх маркетингийн хуудсанд Lenis smooth scroll.
  if (pathname?.startsWith("/admin")) return <>{children}</>;

  return (
    <ReactLenis
      root
      autoRaf={false}
      options={{ lerp: 0.1, duration: 1.2, smoothWheel: true, wheelMultiplier: 1 }}
    >
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
