"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { FINAL, SITE } from "@/lib/content";

export function FinalContact() {
  const { kicker, sub, phone, hours, location } = FINAL.contact;
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          email: String(data.get("email") ?? ""),
          message: "Elysium /final consultation",
          source: "elysium/final#contact",
          // Honeypot — жинхэнэ хэрэглэгч харагдахгүй нууц талбар
          website: String(data.get("website") ?? ""),
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) setSent(true);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" className="scroll-mt-20 bg-ink py-24 font-gilroy text-bone md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* LEFT — intro + details */}
          <Reveal>
            <p className="fnl-kicker text-lime">Холбоо барих</p>
            <h2 className="mt-5 max-w-md text-[clamp(2.4rem,5vw,4rem)] font-extrabold leading-[0.95] tracking-tight">
              {kicker}
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-bone/75">{sub}</p>

            <dl className="mt-10 space-y-6 border-t border-bone/15 pt-10">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/55">Утас</dt>
                <dd className="mt-1.5">
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                    data-cursor-hover
                    className="text-2xl font-extrabold text-lime transition-opacity hover:opacity-80"
                  >
                    {phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/55">Цагийн хуваарь</dt>
                <dd className="mt-1.5 text-lg font-semibold">{hours}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/55">Байршил</dt>
                <dd className="mt-1.5 max-w-sm text-lg font-semibold leading-snug text-bone/90">{location}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/55">И-мэйл</dt>
                <dd className="mt-1.5">
                  <a
                    href={`mailto:${SITE.email}`}
                    data-cursor-hover
                    className="text-lg font-semibold underline-offset-4 transition-colors hover:text-lime hover:underline"
                  >
                    {SITE.email}
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>

          {/* RIGHT — consultation form */}
          <Reveal delay={0.1} className="lg:pt-2">
            <div className="max-w-md">
              {sent ? (
                <p className="text-xl font-semibold leading-relaxed text-bone/90">
                  Баярлалаа. Манай менежер тантай удахгүй холбогдоно.
                </p>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col gap-7">
                  {/* Honeypot — хэрэглэгчид харагдахгүй, bot бөглөнө */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Нэр"
                    className="border-b border-bone/40 bg-transparent pb-3 text-lg font-semibold text-bone placeholder:text-bone/45 focus:border-bone focus:outline-none"
                  />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="Утас"
                    className="border-b border-bone/40 bg-transparent pb-3 text-lg font-semibold text-bone placeholder:text-bone/45 focus:border-bone focus:outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="И-мэйл"
                    className="border-b border-bone/40 bg-transparent pb-3 text-lg font-semibold text-bone placeholder:text-bone/45 focus:border-bone focus:outline-none"
                  />
                  {error && (
                    <p role="alert" className="text-sm font-semibold text-red-300">
                      Илгээхэд алдаа гарлаа. Дахин оролдоно уу, эсвэл шууд залгана уу.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    data-cursor-hover
                    className="mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full bg-bone px-7 py-3.5 text-sm font-bold text-ink transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {busy ? "Илгээж байна…" : "Хүсэлт илгээх"}
                    <span aria-hidden>→</span>
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
