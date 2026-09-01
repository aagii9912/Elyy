"use client";

/* Эвентийн бүртгэлийн маягт — /api/contact руу илгээнэ (Google Sheet).
   source=event/<slug>, event=<нэр> гэж тэмдэглэснээр борлуулалтын баг
   аль эвентээс ирснийг Sheet-ээс шууд харна. */

import { useState } from "react";
import type { EventContent } from "@/lib/events";

type Props = {
  slug: string;
  eventName: string;
  form: EventContent["form"];
};

export function EventLeadForm({ slug, eventName, form }: Props) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const guests = String(data.get("guests") ?? "").trim();
    const note = String(data.get("note") ?? "").trim();
    const messageParts = [
      guests && `Зочдын тоо: ${guests}`,
      note && `Тэмдэглэл: ${note}`,
    ].filter(Boolean);

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
          message: messageParts.join(" · "),
          source: `event/${slug}`,
          event: eventName,
          website: String(data.get("website") ?? ""), // honeypot
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

  if (sent) {
    return (
      <div className="mono-fade-up rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur">
        <p className="text-2xl font-extrabold text-white">{form.successTitle}</p>
        <p className="mt-3 text-lead leading-relaxed text-white/70">{form.successBody}</p>
      </div>
    );
  }

  const inputCls =
    "w-full border-b border-white/25 bg-transparent pb-3 pt-1 text-lg font-semibold text-white placeholder:text-white/40 focus:border-[var(--accent)] focus:outline-none transition-colors";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <input type="text" name="name" required placeholder="Нэр" className={inputCls} />
      <input type="tel" name="phone" required placeholder="Утас" className={inputCls} />

      {form.fields.email && (
        <input type="email" name="email" placeholder="И-мэйл" className={inputCls} />
      )}
      {form.fields.guests && (
        <input
          type="number"
          name="guests"
          min={1}
          max={20}
          placeholder="Зочдын тоо"
          className={inputCls}
        />
      )}
      {form.fields.note && (
        <textarea name="note" rows={3} placeholder="Нэмэлт мэдээлэл" className={`${inputCls} resize-none`} />
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-300">
          Илгээхэд алдаа гарлаа. Дахин оролдоно уу.
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        data-cursor-hover
        className="mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full bg-[var(--accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-night transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "Илгээж байна…" : form.submitLabel}
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}
