import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Cursor } from "@/components/Cursor";
import { ScrollProgress } from "@/components/ScrollProgress";
import { MetaPixelEvents } from "@/components/MetaPixelEvents";
import { SITE } from "@/lib/content";
import { DEFAULT_SITE_CONTENT } from "@/lib/site-content";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

/* Bebas Neue — ЗӨВХӨН hero-гийн «ELYSIUM RESIDENCE» гарчигт. Өндөр,
   нарийн condensed тул блокуудын ард орсон ч Gilroy Black шиг «бүдүүн
   цагаан цулгуй» болохгүй. Латин үсэг л байдаг (кирилл ДЭМЖИХГҮЙ) тул
   `--font-bebas` стек нь Gilroy руу уначихдаг — админ гарчгийг кирилл
   болговол хуучин фонтоороо гарна (globals.css → `--font-bebas`). */
const bebas = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});





/* Gilroy — үндсэн display sans. Харилцагчийн өгсөн файлууд. */
const gilroy = localFont({
  variable: "--font-gilroy",
  display: "swap",
  src: [
    { path: "../fonts/gilroy/GIP-Thin.otf", weight: "100", style: "normal" },
    { path: "../fonts/gilroy/GIP-ThinItalic.otf", weight: "100", style: "italic" },
    { path: "../fonts/gilroy/GIP-UltraLight.otf", weight: "200", style: "normal" },
    { path: "../fonts/gilroy/GIP-UltraLightItalic.otf", weight: "200", style: "italic" },
    { path: "../fonts/gilroy/GIP-Light.otf", weight: "300", style: "normal" },
    { path: "../fonts/gilroy/GIP-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../fonts/gilroy/GIP-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/gilroy/GIP-RegularItalic.otf", weight: "400", style: "italic" },
    { path: "../fonts/gilroy/GIP-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/gilroy/GIP-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../fonts/gilroy/GIP-SemiBold.otf", weight: "600", style: "normal" },
    { path: "../fonts/gilroy/GIP-SemiBoldItalic.otf", weight: "600", style: "italic" },
    { path: "../fonts/gilroy/GIP-Bold.otf", weight: "700", style: "normal" },
    { path: "../fonts/gilroy/GIP-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "../fonts/gilroy/GIP-ExtraBold.otf", weight: "800", style: "normal" },
    { path: "../fonts/gilroy/GIP-ExtraBoldItalic.otf", weight: "800", style: "italic" },
    { path: "../fonts/gilroy/GIP-Black.otf", weight: "900", style: "normal" },
    { path: "../fonts/gilroy/GIP-BlackItalic.otf", weight: "900", style: "italic" },
    { path: "../fonts/gilroy/GIP-Heavy.otf", weight: "950", style: "normal" },
    { path: "../fonts/gilroy/GIP-HeavyItalic.otf", weight: "950", style: "italic" },
  ],
});

/* Үндсэн хуудас (`/`) өөрийн `generateMetadata`-аар админы SEO утгыг
   (гарчиг, тайлбар, OG) давхарлан бичнэ — энд зөвхөн бусад хуудасны
   нөөц утга. Урьд нь OG гарчиг `DICT.mn.hero.title` ("Эв найрамдалтай,
   төгс амьдрал") байсан тул холбоос хуваалцахад тэр гарч ирдэг байв. */
export const metadata: Metadata = {
  metadataBase: new URL("https://elysium.mn"),
  title: {
    default: DEFAULT_SITE_CONTENT.seo.title,
    template: `%s — ${SITE.name}`,
  },
  description: DEFAULT_SITE_CONTENT.seo.description,
  openGraph: {
    title: DEFAULT_SITE_CONTENT.seo.title,
    description: DEFAULT_SITE_CONTENT.seo.description,
    images: ["/images/hero-sunset.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={`${inter.variable} ${gilroy.variable} ${bebas.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','501532939274877');fbq('track','PageView');` }} />
      </head>
      <body className="min-h-dvh bg-bone text-ink">
        <noscript>
          <style>{`.fade-up,.clip-reveal{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=501532939274877&ev=PageView&noscript=1" alt="" />
        </noscript>
        <MetaPixelEvents />
        <LangProvider>
          <SmoothScroll>
            <ScrollProgress />
            <Cursor />
            {children}
          </SmoothScroll>
        </LangProvider>
      </body>
    </html>
  );
}
