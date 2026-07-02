"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import type { CSSProperties } from "react";

/**
 * Looping image gallery matching lagom-development.com's project sliders:
 * 1 slide per view, loop, slide effect, clickable pagination dots, no autoplay.
 */
export function LagomGallery({
  images,
  alt = "Elysium",
  className = "",
  sizes = "(max-width:768px) 100vw, 840px",
}: {
  images: string[];
  alt?: string;
  className?: string;
  sizes?: string;
}) {
  const vars = {
    "--swiper-pagination-color": "#ffffff",
    "--swiper-pagination-bullet-inactive-color": "#ffffff",
    "--swiper-pagination-bullet-inactive-opacity": "0.45",
    "--swiper-pagination-bullet-size": "9px",
    "--swiper-pagination-bullet-horizontal-gap": "5px",
    "--swiper-pagination-bottom": "18px",
  } as CSSProperties;

  // Absolutely fill the (sized) parent so Swiper measures a concrete box
  // instead of feeding back into an aspect-ratio container.
  return (
    <Swiper
      modules={[Pagination]}
      slidesPerView={1}
      loop={images.length > 1}
      speed={650}
      pagination={{ clickable: true }}
      className={`absolute inset-0 h-full w-full ${className}`}
      style={vars}
    >
      {images.map((src, i) => (
        <SwiperSlide key={i} className="relative overflow-hidden">
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
