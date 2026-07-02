"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import type { CSSProperties, ReactNode } from "react";
import type { Swiper as SwiperType, AutoplayOptions } from "swiper/types";

/**
 * Reusable horizontal, draggable, PEEK carousel (Lagom-style).
 * One dominant landscape slide sits in view with a peek of the next
 * (slidesPerView ~1.3 desktop / ~1.1 mobile). Slides advance one step at a
 * time via drag, text CTAs, keyboard, or an optional slow ambient autoplay.
 *
 * Slide widths come from slidesPerView (fixed-count) unless `auto` is set, in
 * which case each slide owns its own CSS width (slidesPerView:"auto").
 */
export function FinalCarousel({
  slides,
  perViewDesktop = 3.1,
  perViewTablet = 2.1,
  perViewMobile = 1.15,
  spaceBetween = 24,
  className = "",
  slideClassName = "",
  onSwiper,
  onSlideChange,
  loop = false,
  autoplay = false,
  autoplaySpeed = 6000,
  marquee = false,
  pauseOnHover = false,
  showPagination = true,
  auto = false,
  speed,
}: {
  slides: ReactNode[];
  perViewDesktop?: number;
  perViewTablet?: number;
  perViewMobile?: number;
  /** Gap between slides in px. Default 24. */
  spaceBetween?: number;
  className?: string;
  slideClassName?: string;
  onSwiper?: (swiper: SwiperType) => void;
  onSlideChange?: (index: number) => void;
  /** Infinite loop of slides (Swiper duplicates edges). Default false. */
  loop?: boolean;
  /** Enable Autoplay module. Default false. */
  autoplay?: boolean;
  /**
   * When marquee=false: delay (ms) between slide advances.
   * When marquee=true: linear-transition duration (ms) for advancing ONE slide-step.
   * Larger = slower drift.
   */
  autoplaySpeed?: number;
  /**
   * Continuous linear drift (no step pauses) — a horizontal marquee feel.
   * Implemented as loop + autoplay(delay:0) + a long linear transition. Default false.
   */
  marquee?: boolean;
  /** Pause autoplay while the pointer is over the carousel. Default false. */
  pauseOnHover?: boolean;
  /** Show the clickable bullet pagination. Default true. */
  showPagination?: boolean;
  /** slidesPerView:"auto" — slide widths come from the slide's own CSS width. Default false. */
  auto?: boolean;
  /**
   * Per-step transition duration (ms). Overrides the default. When marquee=true
   * the marquee timing (autoplaySpeed) wins. Default 300 (or autoplaySpeed for marquee).
   */
  speed?: number;
}) {
  const vars = {
    "--swiper-pagination-color": "#2a5124",
    "--swiper-pagination-bullet-inactive-color": "#2a5124",
    "--swiper-pagination-bullet-inactive-opacity": "0.3",
    "--swiper-pagination-bullet-size": "8px",
  } as CSSProperties;

  const modules = [Pagination, A11y, Keyboard];
  if (autoplay) modules.push(Autoplay);

  const autoplayConfig: AutoplayOptions | boolean = autoplay
    ? {
        // marquee: delay:0 chains transitions back-to-back for a continuous glide.
        delay: marquee ? 0 : autoplaySpeed,
        // Stop the ambient drift once the visitor takes control (spec: manual
        // sideways sliding is primary; autoplay is only an ambient enhancement).
        disableOnInteraction: true,
        pauseOnMouseEnter: pauseOnHover,
        stopOnLastSlide: false,
      }
    : false;

  const stepSpeed = speed ?? 300;

  return (
    <>
      {/* Marquee: force LINEAR wrapper timing so each autoplay step glides at a
          constant speed with no per-step ease-in/out. Scoped to .fnl-marquee. */}
      {marquee ? (
        <style>{`.fnl-marquee .swiper-wrapper{transition-timing-function:linear;}`}</style>
      ) : null}
      <Swiper
        modules={modules}
        grabCursor
        keyboard={{ enabled: true }}
        spaceBetween={spaceBetween}
        loop={loop}
        // With variable-width ("auto") loop slides, pre-render extra clones so the
        // wrap-around seam never shows a gap.
        loopAdditionalSlides={loop && auto ? 3 : undefined}
        autoplay={autoplayConfig}
        speed={marquee ? autoplaySpeed : stepSpeed}
        pagination={showPagination ? { clickable: true } : false}
        slidesPerView={auto ? "auto" : undefined}
        breakpoints={
          auto
            ? undefined
            : {
                0: { slidesPerView: perViewMobile },
                640: { slidesPerView: perViewTablet },
                1024: { slidesPerView: perViewDesktop },
              }
        }
        className={`${marquee ? "fnl-marquee" : ""} ${showPagination ? "!pb-14" : ""} ${className}`}
        style={vars}
        onSwiper={onSwiper}
        onSlideChange={(swiper) => onSlideChange?.(swiper.realIndex)}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i} className={`!h-auto ${slideClassName}`}>
            {slide}
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
