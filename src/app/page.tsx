import type { Metadata } from "next";
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
import { MonoMap } from "@/components/mono/MonoMap";
import { MonoContact } from "@/components/mono/MonoContact";
import { MonoManagers } from "@/components/mono/MonoManagers";
import { MonoFaq } from "@/components/mono/MonoFaq";
import { MonoFooter } from "@/components/mono/MonoFooter";
import { MonoChatbot } from "@/components/mono/MonoChatbot";
import { MonoStoryNav } from "@/components/mono/MonoStoryNav";
import { MonoMotion } from "@/components/mono/MonoMotion";

export const metadata: Metadata = {
  title: "Elysium Residence — Бизнес зэрэглэлийн орон сууц",
  description:
    "4 блок, 506 айлын орон сууц. Нийт талбайн 85% нь ногоон, нийтийн эзэмшлийн орон зай. 2027 оны 2-р улиралд ашиглалтад орно.",
};

/* Black & white experience — brand green kept to a ~5% accent budget
   (kicker rules, cursor, pins, timeline nodes). Single-page, mobile-first.
   Promoted from /mono to the root route; /mono now redirects here. */
export default function Home() {
  return (
    <div className="mono-page min-h-screen bg-white font-gilroy text-night">
      <MonoMotion />
      <MonoCursor />
      <MonoHeader />
      <main>
        <MonoHero />
        <MonoStats />
        <MonoElys />
        <MonoEquip />
        <MonoMarquee />
        <MonoApartments />
        <MonoDeveloper />
        <MonoGallery />
        <MonoMap />
        <MonoContact />
        <MonoManagers />
        <MonoFaq />
      </main>
      <MonoFooter />
      <MonoStoryNav />
      <MonoChatbot />
    </div>
  );
}
