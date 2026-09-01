"use client";

import { useState } from "react";
import { useT } from "./LangProvider";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "w-full border-b border-ink/20 bg-transparent py-3 text-ink outline-none transition-colors placeholder:text-stone focus:border-ink";

export function ContactForm() {
  const t = useT();
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex min-h-[280px] flex-col items-start justify-center">
        <p className="font-display text-title font-light">{t.booking.successTitle}</p>
        <p className="mt-3 max-w-md text-taupe">{t.booking.successBody}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 text-sm tracking-wide underline underline-offset-4"
        >
          {t.booking.again}
        </button>
      </div>
    );
  }

  const f = t.booking.fields;

  return (
    <form onSubmit={onSubmit} className="grid gap-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <label className="block">
          <span className="overline text-stone">{f.name}</span>
          <input name="name" required className={`mt-2 ${field}`} />
        </label>
        <label className="block">
          <span className="overline text-stone">{f.phone}</span>
          <input name="phone" className={`mt-2 ${field}`} />
        </label>
        <label className="block">
          <span className="overline text-stone">{f.email}</span>
          <input name="email" type="email" required className={`mt-2 ${field}`} />
        </label>
        <label className="block">
          <span className="overline text-stone">{f.type}</span>
          <select name="apartment" className={`mt-2 ${field}`} defaultValue="">
            <option value="">{t.booking.choose}</option>
            {t.apartments.types.map((type) => (
              <option key={type.title} value={type.title}>
                {type.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="overline text-stone">{f.date}</span>
        <input name="date" type="date" className={`mt-2 ${field}`} />
      </label>
      <label className="block">
        <span className="overline text-stone">{f.message}</span>
        <textarea name="message" rows={4} className={`mt-2 resize-none ${field}`} />
      </label>

      <div className="flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex rounded-full bg-ink px-9 py-4 text-sm tracking-wide text-bone transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "sending" ? t.booking.sending : t.booking.submit}
        </button>
        {status === "error" && <span className="text-sm text-red-700">{t.booking.error}</span>}
      </div>
    </form>
  );
}
