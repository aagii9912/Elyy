import type { Metadata } from "next";
import { Fraunces, Inter, Instrument_Sans, Lora, Mulish, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Cursor } from "@/components/Cursor";
import { ScrollProgress } from "@/components/ScrollProgress";
import { DICT, SITE } from "@/lib/content";

/* Доорх Google фонтууд БУСАД маршрутынх (/v2, /daylight, /final, /classic).
   `next/font/google` өгөгдмөлөөр файл бүрд `<link rel="preload">` бичдэг
   тул үндсэн хуудас нь хэзээ ч зурдаггүй 11 фонт файлаа урьдчилж татдаг
   байв (~0.3 МБ). `preload: false` нь @font-face-ийг үлдээж, зөвхөн
   урьдчилсан татахыг зогсооно: тухайн маршрут дээр үсэг зурагдах үед
   хөтөч өөрөө татна (`display: "swap"` FOUT-ыг хариуцна). */

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});

/* FIND-style display/UI sans — used by the cinematic v2 experience. */
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

/* Editorial serif accent (cyrillic included for the /daylight display headings). */
const lora = Lora({
  variable: "--font-lora-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

/* Mono labels for the /daylight experience (cyrillic-capable). */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

/* LAGOM-style geometric display sans (cream/orange "version 2" at /v2). */
const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
  preload: false,
});

/* Gilroy — rounded geometric display sans (the whole site runs on it).
   Client-supplied OTFs, subset to latin+cyrillic WOFF2 by
   `node scripts/build-fonts.mjs` — 20 OTF / 2.1 MB → 8 faces / 214 KB.
   Ирсэн 20 файлаас Thin(100), UltraLight(200), Heavy(950) болон 9
   налуу нь кодод нэг ч удаа дуудагддаггүй тул орхигдсон; үлдсэн ганц
   налуу нь `/final`-ийн хэсгийн шошго (`font-light italic`). */
const gilroy = localFont({
  variable: "--font-gilroy",
  display: "swap",
  src: [
    { path: "../fonts/gilroy/gilroy-300.woff2", weight: "300", style: "normal" },
    { path: "../fonts/gilroy/gilroy-300-italic.woff2", weight: "300", style: "italic" },
    { path: "../fonts/gilroy/gilroy-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/gilroy/gilroy-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/gilroy/gilroy-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/gilroy/gilroy-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/gilroy/gilroy-800.woff2", weight: "800", style: "normal" },
    { path: "../fonts/gilroy/gilroy-900.woff2", weight: "900", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://elysium.mn"),
  title: {
    default: `${SITE.name} — ${DICT.mn.hero.title}`,
    template: `%s — ${SITE.name}`,
  },
  description: DICT.mn.hero.subtitle,
  openGraph: {
    title: `${SITE.name} — ${DICT.mn.hero.title}`,
    description: DICT.mn.hero.subtitle,
    images: ["/images/hero-sunset.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn" className={`${fraunces.variable} ${inter.variable} ${instrumentSans.variable} ${lora.variable} ${mulish.variable} ${gilroy.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-dvh bg-bone text-ink">
        <noscript>
          <style>{`.fade-up,.clip-reveal{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
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
