"use client";

import { Reveal, RevealText } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { useT } from "@/components/LangProvider";
import { SITE } from "@/lib/content";

export function Booking() {
  const t = useT();
  return (
    <section id="contact" className="scroll-mt-24 bg-sand py-24 md:py-32">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="max-w-3xl">
          <p className="overline text-moss">{t.booking.kicker}</p>
          <RevealText as="h2" text={t.booking.title} className="mt-5 font-display text-display font-light" />
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-taupe">{t.booking.body}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-14 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <ContactForm />
          </div>
          <aside className="md:col-span-4 md:col-start-9">
            <div className="space-y-8 border-t border-ink/15 pt-7">
              <div>
                <p className="overline text-stone">{t.footer.salesOffice}</p>
                <a href={`mailto:${SITE.email}`} className="mt-3 block hover:text-taupe">{SITE.email}</a>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="mt-1 block hover:text-taupe">{SITE.phone}</a>
                <p className="mt-3 text-taupe">{t.footer.salesAddress}</p>
                <p className="mt-1 text-stone">{t.footer.hours}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
