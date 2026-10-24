import type { Metadata } from "next";
import { ExplorerApp } from "@/components/explore/ExplorerApp";
import { getInventory } from "@/lib/explore/inventory";
import { exploreSiteInfo } from "@/lib/explore/site-info";
import { loadSiteContent } from "@/lib/site";

/* 3D Explorer (вэб) — MOCKUP. Бүх түвшин нэг хуудсанд: URL-ын үлдэгдэл
   (`/explore/block/2/floor/7` г.м.) нь клиент дээр түвшин болж уншигдана
   (`lib/explore/routes.ts`). Нүүр хуудаснаас холбогдоогүй, хайлтад
   индексжүүлэхгүй — захиалагч батлахаас өмнөх хувилбар. */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "3D аялал",
  description: "Elysium Residence — байршлаас эхлээд өрөө хүртэлх 3D интерактив аялал.",
  robots: { index: false, follow: false },
};

export default async function ExplorePage() {
  const [site, inventory] = await Promise.all([loadSiteContent(), getInventory()]);
  return (
    <ExplorerApp
      mode="web"
      basePath="/explore"
      kioskId=""
      site={exploreSiteInfo(site)}
      inventory={inventory}
    />
  );
}
