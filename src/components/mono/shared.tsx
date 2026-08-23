"use client";

/* /mono — shared building blocks (kicker, drag-scroll hook, zoom reveal,
   pinned-chapter autoplay). */

import { useCallback, useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap, type ScrollTrigger as ScrollTriggerType } from "@/lib/gsap";

/** Section label — tiny lime rule (the ~5% green accent) + neutral label.
 *  `reveal` opts the kicker into the MonoMotion scroll-reveal system. */
export function MonoKicker({
  children,
  tone = "light",
  className = "",
  reveal = false,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
  reveal?: boolean;
}) {
  return (
    <p
      data-reveal={reveal ? "up" : undefined}
      className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${
        tone === "dark" ? "text-white/60" : "text-fg/50"
      } ${className}`}
    >
      {/* lime reads on the dark chapters; on the light ground it all but
          disappears, so the rule steps down to the deeper brand green */}
      <span aria-hidden className={`h-px w-8 ${tone === "dark" ? "bg-lime" : "bg-moss"}`} />
      {children}
    </p>
  );
}

/* --- Пиннэсэн кадр-бүлгийн автомат тоглолт ---------------------------- */

/** Хэрэглэгчийн дохио дуусаад ийм хугацаанд чимээгүй болвол автомат гүйлт
 *  эхэлнэ. Трэкпадын инерц ~0.3сек үргэлжилдэг тул түүнээс арай урт. */
const SETTLE_MS = 420;
/** Үүнээс хуучирсан дохио автомат гүйлт эхлүүлэхээ болино. Ингэснээр нэг
 *  бүлэг өөрөө дуусангуут дараагийнх нь уламжлан эхлэхгүй — бүлэг бүр
 *  хэрэглэгчийн ӨӨРИЙН нэг гүйлтийг хүлээнэ. */
const ARM_TTL_MS = 3000;
/** Энэ явцаас цааш үлдсэн зам хэт бага — тоглуулах утгагүй. */
const AUTOPLAY_END = 0.97;
/** Гараас гүйлгэх дохио гэж үзэх товчнууд. */
const SCROLL_KEYS = new Set([
  "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar",
]);

/** Кадр-бүлгийг эхний гүйлтийн дараа өөрөө "тоглуулах".
 *
 *  Хэсэг бүр 2–3 дэлгэцийн өндөртэй бөгөөд кадрууд гүйлтэд уягдсан тул
 *  хүн бүх киног дугуйгаараа гараар гүйлгэх шаардлагатай болдог — урт
 *  бүлэгт ядаргаатай. Энд хэрэглэгч бүлэг рүү орж нэг удаа гүйлгэмэгц
 *  (дохио нь дуусахыг хүлээгээд) үлдсэн замыг нь тогтмол хурдаар Lenis-ээр
 *  өөрөө гүйлгэнэ: кадрын scrub, цэгүүдийн солигдол, явцын зураас бүгд
 *  хэвийн ажиллаж, зүгээр л "кино" өөрөө үргэлжилнэ.
 *
 *  Удирдлага үргэлж хүнийх: дугуй/хуруу хөдөлмөгц Lenis өөрөө гүйлтийг
 *  авдаг (`onVirtualScroll` → `scrollTo(..., { programmatic: false })`),
 *  дээш гүйлгэх, товч дарах, хаа нэгтээ дарахад зогсоно. Доош гүйлгэвэл
 *  дахин зэвсэглээд үргэлжилнэ.
 *
 *  Зөвхөн ширээний компьютерт — кадрын scrub мөн тэнд л ажилладаг
 *  (гар утсанд ганц хөдөлгөөнгүй кадр гардаг), мөн `syncTouch: false`
 *  тул Lenis хуруунд огт хүрдэггүй. */
export function useScrollAutoplay({
  trigger,
  seconds,
}: {
  /** Бүлгийн гүйлтийг хэмжиж буй ScrollTrigger — effect дотор үүсдэг тул ref. */
  trigger: React.RefObject<ScrollTriggerType | null>;
  /** Бүлгийг эхнээс нь дуустал тоглуулах хугацаа (сек). 0 — унтраалттай. */
  seconds: number;
}) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || seconds <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    /** Сүүлийн хүний дохионы мөч. */
    let lastInput = 0;
    /** Доош чиглэсэн дохио ирсэн — амрахыг нь хүлээж байна. */
    let armed = false;
    /** Бидний эхлүүлсэн гүйлт явж байна. */
    let playing = false;

    const disarm = () => {
      armed = false;
      playing = false;
    };

    const onVirtualScroll = ({ deltaY }: { deltaY: number }) => {
      if (!deltaY) return; // тап / хэвтээ дохио
      lastInput = performance.now();
      playing = false; // удирдлагыг Lenis аль хэдийн хүнд өглөө
      armed = deltaY > 0; // зөвхөн доош — дээш гарахад нь бүү саад бол
    };
    const onKey = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) disarm();
    };

    lenis.on("virtual-scroll", onVirtualScroll);
    window.addEventListener("keydown", onKey);
    // Товч, рэйл, цэсний холбоос бүр өөрийн гүйлттэй — дарсан бол бид гараа авна.
    window.addEventListener("pointerdown", disarm);

    const tick = () => {
      if (playing || !armed || lenis.isStopped) return;
      const st = trigger.current;
      if (!st) return;
      const idle = performance.now() - lastInput;
      if (idle < SETTLE_MS) return;
      if (idle > ARM_TTL_MS) {
        armed = false;
        return;
      }
      const p = st.progress;
      // 0 / 1 гэдэг нь бүлэг дэлгэцэнд пиннэгдээгүй байна гэсэн үг.
      if (p <= 0 || p >= AUTOPLAY_END) return;
      armed = false;
      playing = true;
      lenis.scrollTo(st.end, {
        duration: Math.max(0.5, seconds * (1 - p)),
        easing: (x: number) => x, // тогтмол хурд — кино шиг
        onComplete: () => {
          playing = false;
        },
      });
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("virtual-scroll", onVirtualScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", disarm);
    };
  }, [lenis, trigger, seconds]);
}

/** Pointer-drag horizontal scrolling for carousel strips (mouse).
 *  Pass your own ref when the element already needs one. */
/** Энэ хэмжээнээс бага хөдөлгөөнийг чирэлт биш, даралт гэж үзнэ (px). */
const DRAG_THRESHOLD = 5;

export function useDragScroll<T extends HTMLElement>(externalRef?: React.RefObject<T | null>) {
  const internal = useRef<T>(null);
  const ref = externalRef ?? internal;
  const state = useRef({ down: false, dragging: false, startX: 0, startLeft: 0, pointerId: -1 });

  const onPointerDown = useCallback((e: React.PointerEvent<T>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    /* pointerdown дээр setPointerCapture ХИЙХГҮЙ. Capture тавимагц
       дараагийн бүх pointer эвент БОЛОН click нь контейнер руу
       шилждэг (Chrome, Pointer Events тодорхойлолтын дагуу) — улмаас
       доторх товчнууд (ж: "Сонирхох", аксонометрийг томруулах) огт
       дарагдахгүй болно. Зөвхөн үнэхээр чирч эхэлсэн үед capture-г
       DRAG_THRESHOLD давсны дараа тавина. */
    state.current = { down: true, dragging: false, startX: e.clientX, startLeft: el.scrollLeft, pointerId: e.pointerId };
  }, [ref]);

  const onPointerMove = useCallback((e: React.PointerEvent<T>) => {
    const el = ref.current;
    const s = state.current;
    if (!el || !s.down) return;
    const dx = e.clientX - s.startX;
    if (!s.dragging) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      s.dragging = true;
      el.setPointerCapture(s.pointerId);
    }
    el.scrollLeft = s.startLeft - dx;
  }, [ref]);

  const end = useCallback((e: React.PointerEvent<T>) => {
    const el = ref.current;
    const s = state.current;
    if (s.dragging && el?.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    s.down = false;
    s.dragging = false;
  }, [ref]);

  return { ref, onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end };
}

/** Media zoom-in reveal — image scales down into place as the section enters. */
export function ZoomMedia({
  src,
  alt,
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelector("img"),
        { scale: 1.18, opacity: 0.4 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: 0.5 },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className={`h-full w-full object-cover ${imgClassName}`} />
    </div>
  );
}
