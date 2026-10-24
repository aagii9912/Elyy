import type { Metadata, Viewport } from "next";
import { ExplorerApp } from "@/components/explore/ExplorerApp";
import { getInventory } from "@/lib/explore/inventory";
import { exploreSiteInfo } from "@/lib/explore/site-info";
import { loadSiteContent } from "@/lib/site";

/* 3D Explorer (kiosk) — төслийн борлуулалтын оффисын мэдрэгч дэлгэц.
   Chrome-ыг `--kiosk https://elysium.mn/kiosk?kiosk=<төхөөрөмж>` гэж
   эхлүүлнэ: `kiosk` — хүсэлт, QR-ын суваг (Vertmonhub), `idle=<сек>` —
   attract mode руу орох хугацаа (өгөгдмөл 90). */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "3D аялал · Kiosk",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function KioskPage() {
  const [site, inventory] = await Promise.all([loadSiteContent(), getInventory()]);
  return (
    <ExplorerApp
      mode="kiosk"
      basePath="/kiosk"
      kioskId="sales-office"
      site={exploreSiteInfo(site)}
      inventory={inventory}
    />
  );
}
