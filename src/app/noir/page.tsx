import type { Metadata } from "next";
import { loadSiteContent } from "@/lib/site";
import { SiteTheme } from "@/components/SiteTheme";
import { NoirMotion } from "@/components/noir/NoirMotion";
import { NoirHeader } from "@/components/noir/NoirHeader";
import { NoirHero } from "@/components/noir/NoirHero";
import { NoirStats } from "@/components/noir/NoirStats";
import { NoirElys } from "@/components/noir/NoirElys";
import { NoirStructure } from "@/components/noir/NoirStructure";
import { NoirApartments } from "@/components/noir/NoirApartments";
import { NoirGallery } from "@/components/noir/NoirGallery";
import { NoirDeveloper } from "@/components/noir/NoirDeveloper";
import { NoirLocation } from "@/components/noir/NoirLocation";
import { NoirContact } from "@/components/noir/NoirContact";
import { NoirFaq } from "@/components/noir/NoirFaq";
import { NoirFooter } from "@/components/noir/NoirFooter";

/* Хуудасны бүх текст, зураг, клип, өнгө нь админаас (`/admin/site`)
   удирдагдана — энэ бол ХАРАНХУЙ хувилбар нь: гүн ногоон хоосон орон
   зай, цөцгий бичиг, бүтэн дэлгэцийн давтагдах клип. Гео­метр нь
   хэмжсэн 1487×1058 макетаас, өнгө нь Elysium-ийн брэндийн палитраас. */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSiteContent();
  return { title: site.seo.title, description: site.seo.description };
}

export default async function NoirPage() {
  const site = await loadSiteContent();

  return (
    <div className="noir-page">
      <SiteTheme theme={site.theme} />
      <NoirMotion />
      <NoirHeader site={site} />
      <main>
        <NoirHero site={site} />
        <NoirStats site={site} />
        <NoirElys site={site} />
        <NoirStructure site={site} />
        <NoirApartments site={site} />
        <NoirGallery site={site} />
        <NoirDeveloper site={site} />
        <NoirLocation site={site} />
        <NoirContact site={site} />
        <NoirFaq site={site} />
      </main>
      <NoirFooter site={site} />
    </div>
  );
}
