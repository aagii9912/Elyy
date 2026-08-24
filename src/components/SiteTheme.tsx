/* Админаас удирдагдах дизайны CSS-ийг хуудсанд суулгана.

   Server component — SSR-ээр гарах тул анивчихгүй (FOUC байхгүй), JS
   унтраалттай ч ажиллана. Утгуудыг `buildThemeCss` шүүж цэвэрлэдэг.

   Фонт: өгөгдмөл Gilroy нь локал (`next/font`) тул НЭМЭЛТ ХҮСЭЛТ
   ГАРАХГҮЙ. Админ өөр фонт сонгосон үед л Google Fonts руу нэг
   `<link>` нэмэгдэнэ (`display=swap`, урьдчилсан холболттой). */

import { buildThemeCss, googleFontHref } from "@/lib/theme-css";
import type { ThemeContent } from "@/lib/site-content";

export function SiteTheme({ theme }: { theme: ThemeContent }) {
  const css = buildThemeCss(theme);
  const font = googleFontHref(theme);
  if (!css && !font) return null;
  return (
    <>
      {font && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href={font} />
        </>
      )}
      {css && <style id="site-theme" dangerouslySetInnerHTML={{ __html: css }} />}
    </>
  );
}
