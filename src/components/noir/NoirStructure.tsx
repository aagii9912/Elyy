"use client";

/* `/noir` — 03 · Барилгын бүтэц. Материал бүр нэг мөр эзэлж, ард нь
   барилгын үе шатны клип давтагдана (каркас → цонх → фасад). Клип нь
   дэлгэц дээр орж ирэхэд л тоглож эхэлнэ — батарей, дата хэмнэнэ. */

import { useEffect, useRef } from "react";
import { CLIP_NONE, STRUCTURE_CLIPS, type SiteContent } from "@/lib/site-content";
import { sectionTone } from "@/lib/theme-css";
import { externalHref } from "@/lib/links";
import { NoirChapter, NoirSection } from "./shared";

/** Зүйлийн зураг хоосон үед барилгын бичлэгээс авсан кадрууд орно —
 *  клип ачаалахаас өмнө хоосон талбай харагдахгүй. */
const FALLBACK_FRAMES = [
  "/structure-frames/frame_040.webp",
  "/structure-frames/frame_075.webp",
  "/structure-frames/frame_119.webp",
];

/** Дэлгэцэд харагдах үед тоглож, гармагц зогсох клип. */
function ClipMedia({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={poster || undefined}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

export function NoirStructure({ site }: { site: SiteContent }) {
  const { equip } = site;

  return (
    <NoirSection id="equip" bg="equip" tone={sectionTone(site.theme, "equip", "dark")}>
      <div className="nv-head nv-head--split">
        <div>
          <NoirChapter>03 · {equip.kicker}</NoirChapter>
          <h2 className="nv-h2" data-rise>
            {equip.title}
          </h2>
        </div>
        <p className="nv-lead" data-rise style={{ "--d": "0.08s" } as React.CSSProperties}>
          {equip.body}
        </p>
      </div>

      <div style={{ marginTop: "clamp(26px, 4vh, 52px)" }}>
        {equip.items.map((item, i) => {
          const clip =
            item.video === CLIP_NONE
              ? ""
              : item.video || STRUCTURE_CLIPS[i % STRUCTURE_CLIPS.length].value;
          const href = externalHref(item.link);
          const still = item.image || FALLBACK_FRAMES[i % FALLBACK_FRAMES.length];
          return (
            <article
              className="nv-row"
              key={item.title + i}
              data-rise
              style={{ "--d": `${0.05 * i}s` } as React.CSSProperties}
            >
              <div>
                <span className="nv-row-index">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="nv-h3">{item.title}</h3>
                <p className="nv-row-body">{item.body}</p>
                {href && (
                  <a
                    className="nv-ghost"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginTop: "18px", fontSize: "13.5px" }}
                  >
                    {equip.sourceLabel}
                  </a>
                )}
              </div>
              <div className="nv-row-media">
                {clip ? (
                  <ClipMedia src={clip} poster={still} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={still} alt="" aria-hidden="true" loading="lazy" />
                )}
              </div>
            </article>
          );
        })}
      </div>
    </NoirSection>
  );
}
