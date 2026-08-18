"use client";

/* /mono — "Танилцуулга татах" товч. PDF-ийг шууд нээхийн оронд эхлээд
   нэр / утас / и-мэйл авдаг pop-up гаргаж, хүсэлтийг /api/contact руу
   (Google Sheet + Supabase) илгээгээд дараа нь татаж өгнө.

   `brochure.enabled: false` бол хуучин зан төлөв рүү буцаж, PDF шууд
   нээгдэнэ. Илгээхэд алдаа гарвал хэрэглэгчийг барьцаалахгүй — татах
   холбоос ямар ч тохиолдолд гарч ирнэ. */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { MonoModal } from "./MonoModal";

type Status = "form" | "sending" | "done";

export function BrochureButton({
  site,
  className,
  children,
  source = "elysium/mono#brochure",
}: {
  site: SiteContent;
  className?: string;
  children: React.ReactNode;
  /** Аль товчноос ирснийг Sheet дээр ялгаж харахад ашиглана. */
  source?: string;
}) {
  const { brand, brochure } = site;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("form");
  const [error, setError] = useState(false);

  /* Гарцаагүй тохиолдолд (тохиргоо унтраалттай, PDF заагаагүй) —
     хуучин шиг энгийн холбоос. */
  if (!brochure.enabled || !brand.brochureUrl) {
    return (
      <a href={brand.brochureUrl || "#"} target="_blank" rel="noopener" data-cursor-hover className={className}>
        {children}
      </a>
    );
  }

  /** Ижил домэйны PDF — download атрибут нь popup blocker-т баригдахгүй. */
  const startDownload = () => {
    const a = document.createElement("a");
    a.href = brand.brochureUrl;
    a.download = "";
    a.rel = "noopener";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const data = new FormData(e.currentTarget);
    setStatus("sending");
    setError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          email: String(data.get("email") ?? ""),
          message: "Танилцуулга (PDF) татсан",
          source,
          website: String(data.get("website") ?? ""), // honeypot
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) setError(true);
    } catch {
      setError(true);
    }
    /* Мэдээллээ өгсөн хүнийг сүлжээний алдаанаас болж хоосон буцаахгүй. */
    setStatus("done");
    startDownload();
  };

  const close = () => {
    setOpen(false);
    // дараагийн нээлтэд дахин маягт харагдана
    setTimeout(() => {
      setStatus("form");
      setError(false);
    }, 250);
  };

  return (
    <>
      <button type="button" data-cursor-hover onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      <MonoModal open={open} onClose={close} label={brochure.title}>
        <div className="p-6 sm:p-9">
          {status === "done" ? (
            <div>
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-night/50">
                <span aria-hidden className="h-px w-8 bg-moss" />
                {brochure.title}
              </p>
              <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-night">
                {brochure.successTitle}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-night/65">{brochure.successBody}</p>
              <a
                href={brand.brochureUrl}
                target="_blank"
                rel="noopener"
                data-cursor-hover
                className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-night px-7 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5"
              >
                {brochure.downloadLabel}
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
              <div>
                <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-night/50">
                  <span aria-hidden className="h-px w-8 bg-moss" />
                  {brochure.title}
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-night/65">{brochure.sub}</p>
              </div>

              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">
                  {brochure.name}
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  className="w-full border-b border-night/20 bg-transparent pb-3 text-lg font-semibold text-night placeholder:text-night/35 focus:border-night focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">
                  {brochure.phone}
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  className="w-full border-b border-night/20 bg-transparent pb-3 text-lg font-semibold text-night placeholder:text-night/35 focus:border-night focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-night/45">
                  {brochure.email}
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  className="w-full border-b border-night/20 bg-transparent pb-3 text-lg font-semibold text-night placeholder:text-night/35 focus:border-night focus:outline-none"
                />
              </label>

              {error && (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {brochure.error}
                </p>
              )}

              <p className="text-[12px] leading-relaxed text-night/45">{brochure.consent}</p>

              <button
                type="submit"
                disabled={status === "sending"}
                data-cursor-hover
                className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-night px-7 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "sending" ? brochure.sending : brochure.submit}
                <span aria-hidden>↓</span>
              </button>
            </form>
          )}
        </div>
      </MonoModal>
    </>
  );
}
