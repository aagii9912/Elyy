"use client";

/* `/noir` — 01 · Ерөнхий төлөвлөлт. Дөрвөн тоон үзүүлэлт, хооронд нь
   зөвхөн нимгэн зураас. Цэвэр тоо нь дэлгэц дээр гармагц тоологдоно. */

import type { SiteContent } from "@/lib/site-content";
import { sectionTone } from "@/lib/theme-css";
import { NoirChapter, NoirSection } from "./shared";

const NUMERIC = /^\d+$/;

export function NoirStats({ site }: { site: SiteContent }) {
  const { plan } = site;

  return (
    <NoirSection id="about" bg="stats" tone={sectionTone(site.theme, "stats", "dark")}>
      <div className="nv-head nv-head--split">
        <div>
          <NoirChapter>01 · {plan.kicker}</NoirChapter>
          <h2 className="nv-h2" data-rise>
            {plan.title}
          </h2>
        </div>
        <p className="nv-lead" data-rise style={{ "--d": "0.08s" } as React.CSSProperties}>
          {site.hero.sub}
        </p>
      </div>

      <div className="nv-stats">
        {plan.points.map((point, i) => (
          <div
            className="nv-stat"
            key={point.heading + i}
            data-rise
            style={{ "--d": `${0.06 * i}s` } as React.CSSProperties}
          >
            <b>
              {NUMERIC.test(point.heading) ? (
                <span data-count={point.heading}>0</span>
              ) : (
                point.heading
              )}
              {point.accent && <i>{point.accent}</i>}
            </b>
            <span>{point.text}</span>
          </div>
        ))}
      </div>
    </NoirSection>
  );
}
