import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Intro } from "@/components/sections/Intro";
import { Advantages } from "@/components/sections/Advantages";
import { Apartments } from "@/components/sections/Apartments";
import { Developer } from "@/components/sections/Developer";
import { GalleryTeaser } from "@/components/sections/GalleryTeaser";
import { FromAbroad } from "@/components/sections/FromAbroad";
import { Booking } from "@/components/sections/Booking";
import { Faq } from "@/components/sections/Faq";
import { Articles } from "@/components/sections/Articles";

export const metadata: Metadata = {
  title: "Elysium — Classic",
};

/* Original editorial/green homepage, preserved as a backup of the
   pre-FIND-redesign layout. The FIND-style design is now the homepage (/). */
export default function ClassicHome() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Intro />
        <Advantages />
        <Apartments />
        <Developer />
        <GalleryTeaser />
        <FromAbroad />
        <Booking />
        <Faq />
        <Articles />
      </main>
      <Footer />
    </>
  );
}
