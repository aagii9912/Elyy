"use client";

/* /mono — Тоноглол ба шийдэл. Full-screen scroll story:
   the drone closes in on the facade frame-by-frame (hero-source segment
   frames 40–121, so it doesn't repeat the intro) while the 4 spec
   points activate one by one with scroll. Mobile/reduced-motion: single
   still frame, points still sequence via scroll. */

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { MonoKicker } from "./shared";

const FRAME_START = 40;
const FRAME_END = 121;
const framePath = (i: number) => `/hero-frames/frame_${String(i).padStart(3, "0")}.jpg`;

const POINTS = [
  { n: "01", title: "Дулаан алдагдал багатай цонх", body: "Гурван давхар шилтэй, эрчим хүч хэмнэх цонхны систем — өвлийн дулааныг дотогшоо хадгална." },
  { n: "02", title: "Ухаалаг нэвтрэлтийн систем", body: "Нүүр таних + RFID нэгдсэн хяналт — зөвхөн оршин суугчид болон зөвшөөрөлтэй зочид нэвтэрнэ." },
  { n: "03", title: "Солонгос лифт", body: "Өндөр хурдны, ачаалал даацтай зорчигчийн лифт — хүлээх цагийг багасгана." },
  { n: "04", title: "Агаар сэлгэлтийн систем", body: "Шүүлттэй агааржуулалт — тоос, хийг шүүж, айл бүрд цэвэр агаар орж байршуулна." },
];

export function MonoEquip() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const cvs = canvas.current;
    const sec = root.current;
    if (!cvs || !sec) return;
    const ctx2d = cvs.getContext("2d");
    if (!ctx2d) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const count = FRAME_END - FRAME_START + 1;
    const images: HTMLImageElement[] = [];
    const state = { f: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = Math.round(cvs.clientWidth * dpr);
      cvs.height = Math.round(cvs.clientHeight * dpr);
    };
    const draw = () => {
      const img = images[Math.min(count - 1, Math.max(0, Math.round(state.f)))];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = cvs.width;
      const ch = cvs.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx2d.clearRect(0, 0, cw, ch);
      ctx2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    // desktop scrubs the segment; mobile/reduced-motion shows one still
    const framesToLoad = !reduce && !isMobile ? count : 1;
    for (let i = 0; i < framesToLoad; i++) {
      const im = new Image();
      im.src = framePath(FRAME_START + (framesToLoad === 1 ? Math.floor(count * 0.7) : i));
      if (i === 0) im.onload = () => { resize(); draw(); };
      images.push(im);
    }
    resize();
    const onResize = () => { resize(); draw(); };
    window.addEventListener("resize", onResize);

    const ctx = gsap.context(() => {
      gsap.to(state, {
        f: count - 1,
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
          onUpdate: (self) => {
            const idx = Math.min(POINTS.length - 1, Math.floor(self.progress * POINTS.length));
            setActive((prev) => (prev === idx ? prev : idx));
          },
        },
        onUpdate: draw,
      });
    }, sec);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative h-[320vh] bg-night md:h-[460vh]">
      <div className="sticky top-0 flex h-[100svh] min-h-[560px] w-full overflow-hidden">
        <canvas ref={canvas} className="absolute inset-0 z-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-night/70 via-night/20 to-night/80" />

        {/* header — persistent */}
        <div className="absolute left-5 top-24 z-10 md:left-10 md:top-28">
          <MonoKicker tone="dark">Тоноглол ба шийдэл</MonoKicker>
          <h2 className="mt-3 text-[clamp(1.6rem,2.8vw,2.4rem)] font-extrabold leading-tight tracking-tight text-white">
            Дэлгэрэнгүйд нухацтай
          </h2>
        </div>

        {/* progress rail — right side */}
        <div className="absolute right-5 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-4 md:right-10">
          {POINTS.map((p, i) => (
            <span key={p.n} className="flex flex-col items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full transition-all duration-500 ${
                  active === i ? "green-ping relative bg-lime text-lime" : "bg-white/30"
                }`}
              />
              <span
                className={`text-[10px] font-bold transition-colors duration-500 ${
                  active === i ? "text-lime" : "text-white/35"
                }`}
              >
                {p.n}
              </span>
            </span>
          ))}
        </div>

        {/* active point — bottom left, swaps per quarter of the scroll */}
        <div className="absolute bottom-[10vh] left-5 right-16 z-10 md:left-10 md:right-auto md:max-w-lg">
          <div key={active} className="mono-fade-up">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-lime">
              {POINTS[active].n} / 04
            </p>
            <h3 className="mt-3 text-[clamp(1.8rem,4vw,3.2rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              {POINTS[active].title}
            </h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
              {POINTS[active].body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
