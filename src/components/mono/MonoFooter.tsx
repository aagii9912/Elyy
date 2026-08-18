/* /mono — Footer: sales hours, contacts, socials, nav + wordmark. Dark.
   `variant="page"` (ж: /news) үед hash холбоос нүүр хуудас руу заана. */

import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { SiteContent } from "@/lib/site-content";
import { NEWS_PATH } from "@/lib/news-links";
import { SocialList, liveSocials } from "./MonoSocial";
import { BrochureButton } from "./MonoBrochure";

/** Файл/гадаад холбоосыг шинэ табд нээнэ, дотоод замыг апп дотор. */
const opensInNewTab = (href: string) => /^https?:\/\//.test(href) || /\.[a-z0-9]{2,4}$/i.test(href);

export function MonoFooter({
  site,
  variant = "home",
}: {
  site: SiteContent;
  variant?: "home" | "page";
}) {
  const { footer, brand, contact, developer, hero, news } = site;
  const resolve = (href: string) =>
    href.startsWith("#") && variant !== "home" ? `/${href}` : href;

  /* Мэдээний холбоос үргэлж хөлний цэсэнд байна. */
  const menu = [
    ...footer.menu.filter((i) => i.href !== NEWS_PATH),
    { label: news.navLabel, href: NEWS_PATH },
  ];
  const socials = liveSocials(footer.social);

  return (
    <footer className="bg-night font-gilroy text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div
          className={`grid gap-10 sm:grid-cols-2 ${
            socials.length ? "md:grid-cols-[1.4fr_1fr_1fr_1fr]" : "md:grid-cols-[1.4fr_1fr_1fr]"
          }`}
        >
          <div data-reveal="up">
            <Logo className="h-4 w-auto text-white" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              {brand.tag}. {hero.sub}
            </p>
          </div>

          <div data-reveal="up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">{footer.salesTitle}</p>
            {/* Хөлний холбоосууд гар утсанд хүрэхэд хэтэрхий нимгэн байсан —
                inline-flex + min-h-9-ээр хүрэх талбайг өргөтгөв. */}
            <ul className="mt-3 space-y-1 text-sm text-white/80">
              <li className="py-1.5">{contact.hours}</li>
              <li>
                <a
                  href={`tel:+976${contact.phone.replace(/[^0-9]/g, "")}`}
                  data-cursor-hover
                  className="inline-flex min-h-9 items-center transition-colors duration-300 hover:text-white"
                >
                  {contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  data-cursor-hover
                  className="inline-flex min-h-9 items-center transition-colors duration-300 hover:text-white"
                >
                  {brand.email}
                </a>
              </li>
              <li className="py-1.5 text-white/55">{contact.location}</li>
            </ul>
          </div>

          <div data-reveal="up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">{footer.menuTitle}</p>
            <ul className="mt-3 space-y-1 text-sm text-white/80">
              {menu.map((item, i) => (
                <li key={`${item.href}-${i}`}>
                  {/* Танилцуулга — хөлнөөс дарсан ч мөн адил маягтаар дамжина */}
                  {item.href === brand.brochureUrl ? (
                    <BrochureButton
                      site={site}
                      source="elysium/mono#footer"
                      className="inline-flex min-h-9 items-center text-left transition-colors duration-300 hover:text-white"
                    >
                      {item.label}
                    </BrochureButton>
                  ) : opensInNewTab(item.href) ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener"
                      data-cursor-hover
                      className="inline-flex min-h-9 items-center transition-colors duration-300 hover:text-white"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={resolve(item.href)}
                      data-cursor-hover
                      className="inline-flex min-h-9 items-center transition-colors duration-300 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {socials.length > 0 && (
            <div data-reveal="up">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">{footer.socialTitle}</p>
              <SocialList items={footer.social} />
            </div>
          )}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {brand.line} · {developer.name}</p>
          <p>{footer.note}</p>
        </div>
      </div>
    </footer>
  );
}
