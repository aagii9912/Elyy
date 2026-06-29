import type { Metadata } from "next";
import { Fraunces, Inter, Instrument_Sans, Lora } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/LangProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Cursor } from "@/components/Cursor";
import { ScrollProgress } from "@/components/ScrollProgress";
import { DICT, SITE } from "@/lib/content";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* FIND-style display/UI sans — used by the cinematic v2 experience. */
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Editorial serif accent. */
const lora = Lora({
  variable: "--font-lora-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
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
    <html lang="mn" className={`${fraunces.variable} ${inter.variable} ${instrumentSans.variable} ${lora.variable}`}>
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
