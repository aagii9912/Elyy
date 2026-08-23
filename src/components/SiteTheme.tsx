/* Админаас удирдагдах дизайны CSS-ийг хуудсанд суулгана.

   Server component — SSR-ээр гарах тул анивчихгүй (FOUC байхгүй), JS
   унтраалттай ч ажиллана. Утгуудыг `buildThemeCss` шүүж цэвэрлэдэг. */

import { buildThemeCss } from "@/lib/theme-css";
import type { ThemeContent } from "@/lib/site-content";

export function SiteTheme({ theme }: { theme: ThemeContent }) {
  const css = buildThemeCss(theme);
  if (!css) return null;
  return <style id="site-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
