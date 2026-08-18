import type { Metadata } from "next";
import { loadSiteContent } from "@/lib/site";
import { MonoCursor } from "@/components/mono/MonoCursor";
import { MonoHeader } from "@/components/mono/MonoHeader";
import { MonoHero } from "@/components/mono/MonoHero";
import { MonoStats } from "@/components/mono/MonoStats";
import { MonoMarquee } from "@/components/mono/MonoMarquee";
import { MonoElys } from "@/components/mono/MonoElys";
import { MonoEquip } from "@/components/mono/MonoEquip";
import { MonoApartments } from "@/components/mono/MonoApartments";
import { MonoDeveloper } from "@/components/mono/MonoDeveloper";
import { MonoGallery } from "@/components/mono/MonoGallery";
import { MonoVr } from "@/components/mono/MonoVr";
import { MonoMap } from "@/components/mono/MonoMap";
import { MonoContact } from "@/components/mono/MonoContact";
import { MonoManagers } from "@/components/mono/MonoManagers";
import { MonoFaq } from "@/components/mono/MonoFaq";
import { MonoFooter } from "@/components/mono/MonoFooter";
import { MonoChatbot } from "@/components/mono/MonoChatbot";
import { MonoStoryNav } from "@/components/mono/MonoStoryNav";
import { MonoMotion } from "@/components/mono/MonoMotion";

/* Хуудасны бүх текст/зураг нь админаас (`/admin/site`) удирдагдана.
   Хадгалахад `/api/admin/site` нь `revalidatePath("/")` дуудаж
   шууд шинэчилнэ; доорх revalidate нь зөвхөн нөөц хамгаалалт. */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSiteContent();
  return { title: site.seo.title, description: site.seo.description };
}

/* Black & white experience — brand green kept to a ~5% accent budget
   (kicker rules, cursor, pins, timeline nodes). Single-page, mobile-first.
   Promoted from /mono to the root route; /mono now redirects here. */
export default async function Home() {
  const site = await loadSiteContent();

  return (
    <div className="mono-page min-h-screen bg-ground font-gilroy text-night">
      <MonoMotion />
      <MonoCursor />
      <MonoHeader site={site} />
      <main>
        <MonoHero site={site} />
        <MonoStats site={site} />
        <MonoElys site={site} />
        <MonoEquip site={site} />
        <MonoMarquee site={site} />
        <MonoApartments site={site} />
        <MonoDeveloper site={site} />
        <MonoGallery site={site} />
        {/* VR аялал — `vr.embedUrl` хоосон үед "тун удахгүй" төлөвтэй гарна */}
        <MonoVr site={site} />
        <MonoMap site={site} />
        <MonoContact site={site} />
        <MonoManagers site={site} />
        <MonoFaq site={site} />
      </main>
      <MonoFooter site={site} />
      <MonoStoryNav site={site} />
      <MonoChatbot site={site} />
    </div>
  );
}
