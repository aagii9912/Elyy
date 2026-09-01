import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Cursor } from "@/components/Cursor";
import { ScrollProgress } from "@/components/ScrollProgress";
import { DICT, SITE } from "@/lib/content";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
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
    <html lang="mn" className={`${inter.variable} ${gilroy.variable}`}>
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
