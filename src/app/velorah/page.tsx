import type { Metadata } from "next";
import { loadSiteContent } from "@/lib/site";
import { VelorahHero } from "@/components/velorah/VelorahHero";

/* Ганц дэлгэцийн шилэн кино hero. Бичвэр, клип нь `/admin/site` →
   "Нүүр дэлгэц" хэсгээс удирдагдана (`hero.cinema`). */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSiteContent();
  return { title: site.seo.title, description: site.seo.description };
}

export default async function VelorahPage() {
  const site = await loadSiteContent();
  return <VelorahHero site={site} />;
}
