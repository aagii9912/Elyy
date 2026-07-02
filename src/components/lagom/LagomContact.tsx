"use client";

import Image from "next/image";
import { useState } from "react";
import { useT } from "@/components/LangProvider";
import { Reveal } from "@/components/Reveal";
import { LagomReveal } from "@/components/lagom/LagomReveal";

export function LagomContact() {
  const t = useT();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message: "Lagom /v2 consultation request" }),
      });
    } catch {
      // swallow — still confirm to the visitor
    }
    setBusy(false);
    setSent(true);
  };

  return (
    <section id="contact" className="scroll-mt-20 py-24 md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <div className="relative overflow-hidden bg-lagom-ink text-lagom-cream">
          {/* photo background + dark overlay — clip-wipe reveal over the dark band */}
          <LagomReveal variant="image" className="absolute inset-0">
            <Image
              src="/images/amenity-canal-golden.jpg"
              alt="Elysium"
              fill
              sizes="(max-width:768px) 100vw, 1500px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-lagom-ink/80" />
          </LagomReveal>

          <div className="relative px-6 py-20 md:px-16 md:py-28">
            <Reveal>
              <span className="lagom-num text-xl !text-lagom-cream/55 md:text-2xl">006</span>
            </Reveal>

            <div className="mt-8 max-w-2xl">
              <Reveal delay={0.08}>
                <h2 className="lagom-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95]">
                  {t.booking.title}
                </h2>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-6 max-w-md text-base leading-relaxed text-lagom-cream/75 md:text-lg">
                  {t.booking.body}
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.24} className="mt-12 max-w-md">
              {sent ? (
                <p className="text-lg leading-relaxed text-lagom-cream/85">
                  {t.booking.successBody}
                </p>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col gap-7">
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={t.booking.fields.name}
                    aria-label={t.booking.fields.name}
                    className="w-full border-b border-current/40 bg-transparent pb-3 text-lagom-cream placeholder:text-lagom-cream/45 outline-none transition-colors focus:border-lagom-orange"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={t.booking.fields.email}
                    aria-label={t.booking.fields.email}
                    className="w-full border-b border-current/40 bg-transparent pb-3 text-lagom-cream placeholder:text-lagom-cream/45 outline-none transition-colors focus:border-lagom-orange"
                  />
                  <button type="submit" disabled={busy} className="lagom-btn mt-2 w-fit disabled:opacity-60">
                    {busy ? t.booking.sending : t.booking.submit}
                    <span className="lagom-btn__arrow" aria-hidden>↗</span>
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
