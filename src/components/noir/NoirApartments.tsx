"use client";

/* `/noir` — Өрөөний сонголт. Карт биш, засварын хуудас шиг жагсаалт:
   мөр бүр нэг тип. Хулганаа хөвүүлэхэд төлөвлөгөө нь хажууд нь хөвж
   гарч ирнэ, дарахад бүтэн дэлгэцээр нээгдэнэ. */

import { useMemo, useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { sectionTone } from "@/lib/theme-css";
import { NoirChapter, NoirSection, useAnchorGo } from "./shared";
import { NoirLightbox } from "./NoirLightbox";

type Peek = { src: string; x: number; y: number } | null;

export function NoirApartments({ site }: { site: SiteContent }) {
  const { apartments } = site;
  const go = useAnchorGo();
  const [block, setBlock] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [shot, setShot] = useState(0);
  const [peek, setPeek] = useState<Peek>(null);

  const blocks = useMemo(
    () => Array.from(new Set(apartments.units.map((u) => u.block).filter(Boolean))),
    [apartments.units]
  );
  const shown = useMemo(
    () => apartments.units.filter((u) => !block || u.block === block),
    [apartments.units, block]
  );

  const unit = open === null ? null : shown[open];
  const images = unit ? unit.views.filter(Boolean) : [];

  return (
    <NoirSection
      id="apartments"
      bg="apartments"
      tone={sectionTone(site.theme, "apartments", "dark")}
    >
      <div className="nv-head nv-head--split">
        <div>
          <NoirChapter>{apartments.kicker}</NoirChapter>
          <h2 className="nv-h2" data-rise>
            {apartments.title}
          </h2>
        </div>
        <p className="nv-lead" data-rise style={{ "--d": "0.08s" } as React.CSSProperties}>
          {apartments.body}
        </p>
      </div>

      {blocks.length > 1 && (
        <div className="nv-tabs" data-rise>
          <button
            type="button"
            className={`nv-tab${block === "" ? " is-on" : ""}`}
            onClick={() => {
              setBlock("");
              setOpen(null);
            }}
          >
            {apartments.allLabel}
          </button>
          {blocks.map((b) => (
            <button
              type="button"
              key={b}
              className={`nv-tab${block === b ? " is-on" : ""}`}
              onClick={() => {
                setBlock(b);
                setOpen(null);
              }}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      <div className="nv-units">
        {shown.map((u, i) => (
          <button
            type="button"
            className="nv-unit"
            key={u.title + i}
            data-rise
            style={{ "--d": `${Math.min(i, 6) * 0.04}s` } as React.CSSProperties}
            onMouseMove={(e) =>
              u.thumb && setPeek({ src: u.thumb, x: e.clientX + 170, y: e.clientY })
            }
            onMouseLeave={() => setPeek(null)}
            onClick={() => {
              setPeek(null);
              setShot(0);
              setOpen(i);
            }}
          >
            <span className="nv-unit-no">{String(i + 1).padStart(2, "0")}</span>
            <span className="nv-unit-name">{u.title}</span>
            <span className="nv-unit-meta">
              {u.rooms}
              {u.area && ` · ${u.area}`}
              {u.block && ` · ${u.block}`}
            </span>
            <span className="nv-unit-cta">
              {u.views.length} {apartments.viewsWord} ↗
            </span>
          </button>
        ))}
      </div>

      <div className="nv-cta-row">
        <div>
          <NoirChapter>{apartments.ctaCard.kicker}</NoirChapter>
          <h3 className="nv-h3">{apartments.ctaCard.title}</h3>
        </div>
        <a className="nv-pill" href="#contact" onClick={(e) => go(e, "#contact")}>
          <span>{apartments.ctaCard.link}</span>
        </a>
      </div>

      {peek && (
        <div className="nv-peek is-on" style={{ left: peek.x, top: peek.y }} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={peek.src} alt="" />
        </div>
      )}

      {unit && images.length > 0 && (
        <NoirLightbox
          images={images}
          index={shot}
          caption={`${unit.title} · ${unit.rooms}${unit.area ? ` · ${unit.area}` : ""}`}
          onIndex={setShot}
          onClose={() => setOpen(null)}
        />
      )}
    </NoirSection>
  );
}
