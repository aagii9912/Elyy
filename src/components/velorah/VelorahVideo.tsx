"use client";

/* `/velorah` — дэвсгэрийн клип.

   `autoPlay` нь JSX дээр үлдэнэ (JS-гүй ч тоглоно), гэхдээ хэрэглэгч
   хөдөлгөөн багасгахыг сонгосон бол суумагц зогсоож, эхний кадр дээр
   барина — WCAG 2.2.2 (Pause, Stop, Hide). Макет дээр харагдах pause
   товч байхгүй тул систем түвшний сонголтыг хүндэтгэх нь цорын ганц
   зөв зам.

   `poster` — autoplay хаагдсан (iOS эрчим хүч хэмнэх горим, Safari-ийн
   бодлого) үед hero хоосон хөх дэлгэц болохоос сэргийлнэ; мөн LCP-д
   зурах бодит кадр өгнө. */

import { useEffect, useRef } from "react";

export function VelorahVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (mq.matches) el.pause();
      else void el.play().catch(() => {});
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    /* `src` шинжээр — макетын "Source URL". `<source type="video/mp4">`
       байсан үед админы оруулсан WebM-ийг хөтөч алгасдаг байв. */
    <video
      ref={ref}
      src={src}
      poster={poster || undefined}
      className="absolute inset-0 z-0 h-full w-full object-cover"
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
    />
  );
}
