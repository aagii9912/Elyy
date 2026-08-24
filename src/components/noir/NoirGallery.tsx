"use client";

/* `/noir` — Зургийн цомог. Эхний кадр нь 2×2 талбай эзлэн том гарч,
   бусад нь эргэн тойрон нь эвлэнэ. Дарахад бүтэн дэлгэцээр нээгдэнэ. */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { sectionTone } from "@/lib/theme-css";
import { NoirChapter, NoirSection } from "./shared";
import { NoirLightbox } from "./NoirLightbox";

export function NoirGallery({ site }: { site: SiteContent }) {
  const { gallery } = site;
  const [open, setOpen] = useState<number | null>(null);
  const images = gallery.images.filter((img) => img.src);

  if (!images.length) return null;

  return (
    <NoirSection id="gallery" bg="gallery" tone={sectionTone(site.theme, "gallery", "dark")}>
      <NoirChapter>{gallery.kicker}</NoirChapter>
      <h2 className="nv-h2" data-rise>
        {gallery.title}
      </h2>

      <div className="nv-grid">
        {images.map((img, i) => (
          <button
            type="button"
            className="nv-shot"
            key={img.src + i}
            data-rise
            style={{ "--d": `${Math.min(i, 8) * 0.04}s` } as React.CSSProperties}
            onClick={() => setOpen(i)}
            aria-label={img.tag || "Зураг"}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.tag || ""} loading="lazy" />
            {img.tag && <span>{img.tag}</span>}
          </button>
        ))}
      </div>

      {open !== null && (
        <NoirLightbox
          images={images.map((img) => img.src)}
          index={open}
          caption={images[open]?.tag}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </NoirSection>
  );
}
