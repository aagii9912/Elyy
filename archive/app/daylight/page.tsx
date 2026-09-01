import type { Metadata } from "next";
import { DlHeader } from "@/components/daylight/DlHeader";
import { DlHero } from "@/components/daylight/DlHero";
import { DlUsp } from "@/components/daylight/DlUsp";
import { DlHow } from "@/components/daylight/DlHow";
import { DlWhy } from "@/components/daylight/DlWhy";
import { DlNetwork } from "@/components/daylight/DlNetwork";
import { DlDiptych } from "@/components/daylight/DlDiptych";
import { DlFooter } from "@/components/daylight/DlFooter";
import { DlGrain } from "@/components/daylight/shared";

export const metadata: Metadata = {
  title: "Elysium — Эв найрамдалтай, төгс амьдрал",
  description:
    "4 блок, 506 айлын орон сууц. Нийт талбайн 85% нь ногоон, нийтийн эзэмшлийн орон зай — байгальтай зэрэгцэн амьдрах шинэ хотхон.",
};

export default function DaylightPage() {
  return (
    <div className="dl min-h-screen">
      <DlGrain />
      <DlHeader />
      <main>
        <DlHero />
        <DlUsp />
        <DlHow />
        <DlWhy />
        <DlNetwork />
        <DlDiptych />
      </main>
      <DlFooter />
    </div>
  );
}
