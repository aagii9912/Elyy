"use client";

/* `/noir` — 02 · ELYS консепц. Дөрвөн зарчим нь хажуу хажуугаа зогсох
   өндөр самбарууд: дарахад (эсвэл гар утсанд шүргэхэд) сонгосон нь
   дэлгэгдэж, тайлбар нь доороо задарна. Карт биш — бүтэн өндөр кадр. */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { sectionTone } from "@/lib/theme-css";
import { NoirChapter, NoirSection } from "./shared";

/** Зүйлийн `image` хоосон үед дарааллын дагуу орох өгөгдмөл кадрууд. */
const MEDIA = [
  "/images/elys/ergonomic-interior.jpg",
  "/images/elys/harmony-courtyard.jpg",
  "/images/elys/safety-control-room.jpg",
  "/images/elys/efficiency-tower-crown.jpg",
];

export function NoirElys({ site }: { site: SiteContent }) {
  const { elys } = site;
  const [active, setActive] = useState(0);

  return (
    <NoirSection id="elys" bg="elys" tone={sectionTone(site.theme, "elys", "dark")}>
      <div className="nv-head nv-head--split">
        <div>
          <NoirChapter>02 · {elys.kicker}</NoirChapter>
          <h2 className="nv-h2" data-rise>
            {elys.title}
          </h2>
        </div>
        <p className="nv-lead" data-rise style={{ "--d": "0.08s" } as React.CSSProperties}>
          {elys.body}
        </p>
      </div>

      <div className="nv-panels" data-rise style={{ "--d": "0.12s" } as React.CSSProperties}>
        {elys.items.map((item, i) => (
          <button
            type="button"
            key={item.title + i}
            className={`nv-panel${active === i ? " is-active" : ""}`}
            aria-expanded={active === i}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image || MEDIA[i % MEDIA.length]} alt="" aria-hidden="true" />
            <span className="nv-panel-letter">{item.title.slice(0, 1).toUpperCase()}</span>
            <h3 className="nv-h3">{item.title}</h3>
            <p className="nv-panel-body">{item.body}</p>
          </button>
        ))}
      </div>
    </NoirSection>
  );
}
