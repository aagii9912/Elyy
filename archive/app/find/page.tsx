import { V2Header } from "@/components/v2/V2Header";
import { V2Footer } from "@/components/v2/V2Footer";
import { V2Hero } from "@/components/v2/V2Hero";
import { V2Why } from "@/components/v2/V2Why";
import { V2Mosaic } from "@/components/v2/V2Mosaic";
import { V2Process } from "@/components/v2/V2Process";
import { V2Testimonials } from "@/components/v2/V2Testimonials";
import { V2Services } from "@/components/v2/V2Services";
import { V2Support } from "@/components/v2/V2Support";
import { V2Articles } from "@/components/v2/V2Articles";
import { V2CtaBanner } from "@/components/v2/V2CtaBanner";

/* FIND-style cinematic layout — the former homepage, preserved here
   after /mono was promoted to the root route. The older editorial/green
   layout lives at /classic. */
export default function FindPage() {
  return (
    <>
      <V2Header />
      <main className="bg-white text-night">
        <V2Hero />
        <V2Why />
        <V2Mosaic />
        <V2Process />
        <V2Testimonials />
        <V2Services />
        <V2Support />
        <V2Articles />
        <V2CtaBanner />
      </main>
      <V2Footer />
    </>
  );
}
