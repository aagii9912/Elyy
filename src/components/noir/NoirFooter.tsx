"use client";

/* `/noir` — Хөл хэсэг. Брэндийн бүтэн wordmark нь том хэмжээтэй, доор
   нь борлуулалт / цэс / сошиал гурван багана. */

import type { SiteContent } from "@/lib/site-content";
import { sectionTone } from "@/lib/theme-css";
import { Logo } from "@/components/Logo";
import { externalHref } from "@/lib/links";
import { useAnchorGo, navHref } from "./shared";

export function NoirFooter({ site }: { site: SiteContent }) {
  const { footer, contact, brand } = site;
  const go = useAnchorGo();
  const social = footer.social.filter((item) => externalHref(item.href));

  return (
    <footer
      className="nv-footer"
      data-bg="footer"
      data-tone={sectionTone(site.theme, "footer", "dark")}
    >
      <div className="nv-wrap">
        <Logo className="nv-footer-mark" />

        <div className="nv-cols">
          <div>
            <h4>{footer.salesTitle}</h4>
            <ul>
              <li>
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>{contact.phone}</a>
              </li>
              <li>
                <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </li>
              <li>{contact.hours}</li>
              <li>{contact.location}</li>
            </ul>
          </div>

          <div>
            <h4>{footer.menuTitle}</h4>
            <ul>
              {footer.menu.map((item) => {
                const href = navHref(item.href);
                if (!href) return null;
                return (
                  <li key={item.href + item.label}>
                    <a href={href} onClick={(e) => go(e, href)}>
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {social.length > 0 && (
            <div>
              <h4>{footer.socialTitle}</h4>
              <ul>
                {social.map((item) => (
                  <li key={item.label}>
                    <a href={externalHref(item.href)} target="_blank" rel="noopener noreferrer">
                      {item.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="nv-foot-bar">
          <span>{footer.note}</span>
          <span>
            © {new Date().getFullYear()} {brand.line}
          </span>
        </div>
      </div>
    </footer>
  );
}
