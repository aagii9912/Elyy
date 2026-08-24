"use client";

/* `/noir` — Түгээмэл асуулт. Нэг мөр = нэг асуулт; нээхэд хариулт нь
   доороо задарна (нэг зэрэг зөвхөн нэг нь нээлттэй). */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { sectionTone } from "@/lib/theme-css";
import { NoirChapter, NoirSection } from "./shared";

export function NoirFaq({ site }: { site: SiteContent }) {
  const { faq } = site;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <NoirSection id="faq" bg="faq" tone={sectionTone(site.theme, "faq", "dark")}>
      <NoirChapter>{faq.kicker}</NoirChapter>
      <h2 className="nv-h2" data-rise>
        {faq.title}
      </h2>

      <div className="nv-faq">
        {faq.items.map((item, i) => (
          <div className={`nv-faq-item${open === i ? " is-open" : ""}`} key={item.q + i} data-rise>
            <button
              type="button"
              className="nv-faq-q"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {item.q}
              <i aria-hidden="true" />
            </button>
            <div className="nv-faq-a" style={{ maxHeight: open === i ? "420px" : 0 }}>
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </NoirSection>
  );
}
