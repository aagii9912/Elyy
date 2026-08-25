import { Fragment } from "react";
import Link from "next/link";
import type { SiteContent } from "@/lib/site-content";
import { externalHref } from "@/lib/links";
import { VelorahVideo } from "./VelorahVideo";

/* `/velorah` — шилэн кино hero.

   Бүтэн дэлгэцийн давтагдах клип, шилэн цэс, Instrument Serif
   дэлгэцийн бичиг. Нэг л дэлгэц: цэс + нэг гарчиг + нэг тайлбар +
   нэг товч. Хөшиг, чимэглэлийн градиент БАЙХГҮЙ.

   Бүх бичвэр `/admin/site`-аас удирдагдана (`hero.cinema`, `nav`,
   `brand`) — server component тул JS-гүйгээр ч бүтнээрээ гарна. */

/** `*од*` доторх хэсгийг макетын бүдэг өнгөт `<em>` болгоно. */
function headlineParts(text: string) {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.length > 2 && part.startsWith("*") && part.endsWith("*") ? (
        <em key={i} className="not-italic text-muted-foreground">
          {part.slice(1, -1)}
        </em>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      )
    );
}

/** Hero нь ганц дэлгэц тул хуудасны доторх зангуу үндсэн сайт руу заана.
 *  Админы оруулсан бусад утга нь `externalHref` шүүлтүүрээр дамжина —
 *  `javascript:` мэтийн схем хаягдаж, хоосон мөр буцна (холбоос нуугдана). */
function navHref(raw: string): string {
  const value = raw.trim();
  if (value.startsWith("#")) return `/${value}`;
  if (value.startsWith("/")) return value;
  return externalHref(value);
}

/** Дотоод зам — `next/link`, гадаад хаяг — энгийн шинэ таб. */
function NavLink({
  href,
  className,
  children,
  ...rest
}: { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

export function VelorahHero({ site }: { site: SiteContent }) {
  const { hero, brand, nav } = site;
  const { cinema } = hero;
  const display = { fontFamily: "var(--font-display)" };

  /* `text-foreground` — сайтын `body` нь брэндийн ногоон ink-тэй тул
     үүнгүйгээр гарчгийн ҮНДСЭН өнгө ногоон болж өвлөгдөнө. */
  return (
    <div className="velorah-page relative flex min-h-[100svh] flex-col overflow-hidden bg-background text-foreground">
      {cinema.video && <VelorahVideo src={cinema.video} />}

      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-6">
        {/* `aria-label` БАЙХГҮЙ: харагдах бичиг нь өөрөө нэр болно.
            Өөр нэр өгвөл WCAG 2.5.3 (Label in Name) зөрчигдөнө. */}
        <Link href="/" className="text-3xl tracking-tight text-foreground" style={display}>
          {cinema.logo.trim() || brand.line}
          {cinema.mark && <sup className="text-xs">{cinema.mark}</sup>}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {nav.items.map((item, i) => {
            const href = navHref(item.href);
            if (!href) return null;
            return (
              /* `aria-current` БАЙХГҮЙ: эхний холбоос нь энэ хуудас БИШ,
                 үндсэн сайт руу заадаг тул "page" гэж хэлбэл худал болно.
                 Тодруулга нь зөвхөн харааны онцлол хэвээр. */
              <NavLink
                key={item.href + item.label}
                href={href}
                className={
                  i === 0
                    ? "text-sm text-foreground transition-colors"
                    : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>

        <Link
          href="/#contact"
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-300 hover:scale-[1.03]"
        >
          {nav.ctaLabel}
        </Link>
      </nav>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-32 pb-40 text-center py-[90px]">
        {/* Макетын -2.46px нь 96px (md:text-8xl) хэмжээнд зориулагдсан.
            Жижиг дэлгэцэд ижил утга нь үсэг хоорондын зайг 5% болгож
            монгол бичвэрийг наалддаг тул зөвхөн ТЭНД сулруулна. */}
        <h1
          className="animate-fade-rise max-w-7xl text-5xl leading-[0.95] font-normal tracking-[-1px] break-words sm:text-7xl sm:tracking-[-1.8px] md:text-8xl md:tracking-[-2.46px]"
          style={display}
        >
          {headlineParts(cinema.headline.trim() || brand.line)}
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {hero.sub}
        </p>

        <Link
          href="/#contact"
          className="liquid-glass animate-fade-rise-delay-2 mt-12 cursor-pointer rounded-full px-14 py-5 text-base text-foreground transition-transform duration-300 hover:scale-[1.03]"
        >
          {nav.ctaLabel}
        </Link>
      </main>
    </div>
  );
}
