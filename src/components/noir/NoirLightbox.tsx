"use client";

/* `/noir` — зураг үзэх бүтэн дэлгэцийн цонх. Цомог ба өрөөний
   төлөвлөгөө хоёулаа үүнийг хуваалцана. Escape / ← → товчлууртай. */

import { useCallback, useEffect } from "react";

export function NoirLightbox({
  images,
  index,
  caption,
  onClose,
  onIndex,
}: {
  images: string[];
  index: number;
  caption?: string;
  onClose: () => void;
  onIndex: (next: number) => void;
}) {
  const step = useCallback(
    (delta: number) => onIndex((index + delta + images.length) % images.length),
    [index, images.length, onIndex]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [onClose, step]);

  return (
    <div
      className="nv-box"
      role="dialog"
      aria-modal="true"
      aria-label={caption || "Зураг"}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button type="button" className="nv-icon nv-box-close" aria-label="Хаах" onClick={onClose}>
        ✕
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={images[index]} alt={caption || ""} />

      <div className="nv-box-bar">
        {images.length > 1 && (
          <button type="button" className="nv-icon" aria-label="Өмнөх" onClick={() => step(-1)}>
            ←
          </button>
        )}
        <span>
          {caption}
          {images.length > 1 && ` · ${index + 1}/${images.length}`}
        </span>
        {images.length > 1 && (
          <button type="button" className="nv-icon" aria-label="Дараах" onClick={() => step(1)}>
            →
          </button>
        )}
      </div>
    </div>
  );
}
