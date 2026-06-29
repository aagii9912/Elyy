"use client";

import Image from "next/image";
import { useState } from "react";
import { Parallax } from "@/components/Parallax";
import { ScrollText } from "@/components/v2/ScrollText";
import { useT } from "@/components/LangProvider";

export function V2CtaBanner() {
  const t = useT();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Newsletter", email, message: "Newsletter / CTA banner signup" }),
      });
    } catch {}
    setBusy(false);
    setSent(true);
  }

  return (
    <section id="contact" className="scroll-mt-20 relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-night">
      <div className="absolute inset-0">
        <Parallax speed={0.16} className="absolute inset-x-0 -top-[14%] h-[128%]">
          <div className="relative h-full w-full">
            <Image src="/images/amenity-canal-golden.jpg" alt="Elysium" fill sizes="100vw" className="object-cover" />
          </div>
        </Parallax>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-night/70" />

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center text-white">
        <p className="find-label text-white/65">{t.v2.cta.sub}</p>
        <ScrollText
          as="h2"
          text={t.v2.cta.title}
          className="mx-auto mt-5 max-w-2xl find-display text-[clamp(2.25rem,5.5vw,4.75rem)]"
        />

        {sent ? (
          <p className="mt-10 text-lg text-white/85">{t.booking.successBody}</p>
        ) : (
          <form onSubmit={onSubmit} className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              name="email"
              type="email"
              required
              placeholder={t.v2.cta.placeholder}
              className="w-full rounded-full border border-white/40 bg-white/10 px-6 py-4 text-white placeholder:text-white/60 outline-none backdrop-blur-sm focus:border-white"
            />
            <button
              type="submit"
              disabled={busy}
              className="find-pill find-pill--light shrink-0 justify-center px-8 py-4 disabled:opacity-60"
            >
              {busy ? t.booking.sending : t.v2.cta.button}
              <span className="find-pill__arrow" aria-hidden>→</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
