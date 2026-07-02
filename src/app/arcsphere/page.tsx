import { Nav } from "@/components/arcsphere/Nav";
import { Hero } from "@/components/arcsphere/Hero";
import { Gallery } from "@/components/arcsphere/Gallery";
import { Statement } from "@/components/arcsphere/Statement";
import { StatsMarquee } from "@/components/arcsphere/StatsMarquee";
import { FeaturedProjects } from "@/components/arcsphere/FeaturedProjects";
import { Services } from "@/components/arcsphere/Services";
import { Expertise } from "@/components/arcsphere/Expertise";
import { Process } from "@/components/arcsphere/Process";
import { Testimonials } from "@/components/arcsphere/Testimonials";
import { CtaBand } from "@/components/arcsphere/CtaBand";
import { Contact } from "@/components/arcsphere/Contact";
import { Footer } from "@/components/arcsphere/Footer";

export default function ArcSpherePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Gallery />
        <Statement />
        <StatsMarquee />
        <FeaturedProjects />
        <Services />
        <Expertise />
        <Process />
        <Testimonials />
        <CtaBand />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
