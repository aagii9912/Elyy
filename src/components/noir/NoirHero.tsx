"use client";

/* `/noir` — нүүр дэлгэц.

   Нэг л композици: брэндийн тэмдэг + цэс (толгойд), нэг гарчиг, нэг
   тайлбар, хоёр товч, бүтэн дэлгэцийн давтагдах клип, доор нь түншийн
   зурвас. Карт, самбар, статистик БАЙХГҮЙ — макетын дүрэм.

   Клип нь өдрийн цэлмэг кадр ч гэсэн CSS grade-ээр брэндийн гүн ногоон
   руу "буудаг" тул кино маягийн харанхуй мэдрэмж хадгалагдана. */

import type { SiteContent } from "@/lib/site-content";
import { sectionTone } from "@/lib/theme-css";
import { BrochureButton } from "@/components/mono/MonoBrochure";
import { useAnchorGo } from "./shared";

/** Доод зурваст гарах түншүүд — тоноглолын жагсаалтаас эхний 4 брэнд. */
function partners(site: SiteContent) {
  return site.equip.equipment.items
    .filter((item) => item.brand.trim())
    .slice(0, 4)
    .map((item) => ({ brand: item.brand, meta: item.meta, logo: item.logo }));
}

export function NoirHero({ site }: { site: SiteContent }) {
  const { hero, brand, nav } = site;
  const go = useAnchorGo();
  const lines = (hero.title.trim() || brand.line).split("\n").filter(Boolean);
  const marks = partners(site);

  return (
    <section
      id="top"
      className="nv-stage"
      data-bg="hero"
      data-tone={sectionTone(site.theme, "hero", "dark")}
    >
      <div className="nv-plate">
        {hero.video ? (
          <video
            className="nv-plate-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={hero.poster || undefined}
            aria-hidden="true"
          >
            <source src={hero.video} type="video/mp4" />
          </video>
        ) : (
          hero.poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="nv-plate-poster" src={hero.poster} alt="" aria-hidden="true" />
          )
        )}
      </div>

      <div className="nv-hero">
        <div className="nv-copy">
          <h1 className="nv-headline">
            {lines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h1>

          <p className="nv-sub">{hero.sub}</p>

          <div className="nv-actions">
            <a className="nv-pill nv-pill-cta" href="#contact" onClick={(e) => go(e, "#contact")}>
              <span>{nav.ctaLabel}</span>
            </a>
            <BrochureButton site={site} source="elysium/noir#hero" className="nv-ghost">
              {nav.brochureLabel}
            </BrochureButton>
          </div>
        </div>

        {marks.length > 0 && (
          <div className="nv-logos" aria-label="Түншлэгч үйлдвэрлэгчид">
            {marks.map((mark) => (
              <span className="nv-lg" key={mark.brand}>
                {mark.logo && (
                  <span className="nv-lg-mark">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mark.logo} alt="" aria-hidden="true" />
                  </span>
                )}
                {mark.brand}
                {mark.meta && <i className="nv-lg-meta">{mark.meta}</i>}
              </span>
            ))}
          </div>
        )}

        <span className="nv-scroll" aria-hidden="true">
          <i />
        </span>
      </div>
    </section>
  );
}
