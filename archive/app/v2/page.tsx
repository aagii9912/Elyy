import type { Metadata } from "next";
import { LagomHeader } from "@/components/lagom/LagomHeader";
import { LagomHero } from "@/components/lagom/LagomHero";
import { LagomStats } from "@/components/lagom/LagomStats";
import { LagomProjects } from "@/components/lagom/LagomProjects";
import { LagomLocations } from "@/components/lagom/LagomLocations";
import { LagomManagement } from "@/components/lagom/LagomManagement";
import { LagomContact } from "@/components/lagom/LagomContact";
import { LagomFooter } from "@/components/lagom/LagomFooter";

export const metadata: Metadata = {
  title: "Elysium — Life in harmony",
};

/* LAGOM-style cream & orange design (version 2), cloned from
   lagom-development.com and adapted to Elysium's content. */
export default function V2Page() {
  return (
    <>
      <LagomHeader />
      <main className="bg-lagom-cream text-lagom-ink">
        <LagomHero />
        <LagomStats />
        <LagomProjects />
        <LagomLocations />
        <LagomManagement />
        <LagomContact />
      </main>
      <LagomFooter />
    </>
  );
}
