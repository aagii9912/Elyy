import type { Metadata } from "next";
import { FinalHeader } from "@/components/final/FinalHeader";
import { FinalHero } from "@/components/final/FinalHero";
import { FinalStats } from "@/components/final/FinalStats";
import { FinalAbout } from "@/components/final/FinalAbout";
import { FinalElys } from "@/components/final/FinalElys";
import { FinalVideo } from "@/components/final/FinalVideo";
import { FinalApartments } from "@/components/final/FinalApartments";
import { FinalProjects } from "@/components/final/FinalProjects";
import { FinalGallery } from "@/components/final/FinalGallery";
import { FinalContact } from "@/components/final/FinalContact";
import { FinalMap } from "@/components/final/FinalMap";
import { FinalFaq } from "@/components/final/FinalFaq";
import { FinalFooter } from "@/components/final/FinalFooter";

export const metadata: Metadata = {
  title: "Elysium Residence — Бизнес зэрэглэлийн орон сууц",
};

/* Unified redesign (v2 client review) — Phase 1 + Phase 2.
   Carousels use placeholder imagery until client assets arrive (Phase 3). */
export default function FinalPage() {
  return (
    <>
      <FinalHeader />
      <main className="bg-bone font-gilroy text-ink">
        <FinalHero />
        <FinalStats />
        <FinalAbout />
        <FinalElys />
        <FinalVideo />
        <FinalApartments />
        <FinalProjects />
        <FinalGallery />
        <FinalContact />
        <FinalMap />
        <FinalFaq />
      </main>
      <FinalFooter />
    </>
  );
}
