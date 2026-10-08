"use client";

import { useRef, useState } from "react";
import type { EventContent } from "@/lib/events";
import { eventRegistrationMessage, registrationOptions } from "@/lib/event-registration";
import { trackMetaPixel } from "@/lib/meta-pixel";
import { leadRequestBody, type LeadAttempt } from "@/lib/lead-request";
import styles from "./EventRegistration.module.css";

type Props = {
  slug: string;
  eventName: string;
  form: EventContent["form"];
  today: string;
};

export function RegistrationLeadForm({ slug, eventName, form, today }: Props) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selections, setSelections] = useState<{ apartmentTypes: string[]; areaRanges: string[] }>({
    apartmentTypes: [], areaRanges: [],
  });
  const attempt = useRef<LeadAttempt | null>(null);
  const options = registrationOptions(form);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const appointmentDate = String(data.get("appointmentDate") ?? "");
    const registration = eventRegistrationMessage({ appointmentDate, ...selections }, undefined, options);
    if (!registration.ok) {
      setError(registration.error);
      return;
    }
    const guests = String(data.get("guests") ?? "").trim();
    const note = String(data.get("note") ?? "").trim();

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: leadRequestBody({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          email: String(data.get("email") ?? ""),
          appointmentDate,
          ...selections,
          message: [guests && `Зочдын тоо: ${guests}`, note && `Тэмдэглэл: ${note}`].filter(Boolean).join("\n"),
          source: `event/${slug}`,
          event: eventName,
          website: String(data.get("website") ?? ""),
        }, attempt),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        trackMetaPixel("Lead");
        setSent(true);
      } else {
        setError(res.status === 400 && typeof json?.error === "string"
          ? json.error : "Илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
      }
    } catch {
      setError("Илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div role="status" className={`${styles.card} ${styles.success}`}>
        <span aria-hidden className={styles.successMark}>✓</span>
        <h3>{form.successTitle}</h3>
        <p>{form.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={styles.card} aria-label={form.title} aria-busy={busy}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <fieldset disabled={busy} className={styles.fields}>
        <label className={styles.field}>
          <span>Цаг товлох өдөр сонгох: <span aria-hidden>*</span></span>
          <input type="date" name="appointmentDate" required min={today} className={styles.input} />
        </label>
        <label className={styles.field}>
          <span>Таны нэр <span aria-hidden>*</span></span>
          <input type="text" name="name" required maxLength={255} autoComplete="name" className={styles.input} />
        </label>
        <label className={styles.field}>
          <span>И-мэйл хаяг <span aria-hidden>*</span></span>
          <input type="email" name="email" required maxLength={255} autoComplete="email" className={styles.input} />
        </label>
        <label className={styles.field}>
          <span>Утасны дугаар <span aria-hidden>*</span></span>
          <input type="tel" name="phone" required minLength={8} maxLength={25} autoComplete="tel" className={styles.input} />
        </label>

        {([
          ["apartmentTypes", options.apartmentLabel, options.apartmentTypes],
          ["areaRanges", options.areaLabel, options.areaRanges],
        ] as const).map(([name, label, values]) => (
          <fieldset key={name} className={styles.choices}>
            <legend>{label}<span aria-hidden>*</span></legend>
            {values.map((value, index) => (
              <label key={value} className={styles.choice}>
                <input
                  type="checkbox"
                  name={name}
                  value={value}
                  checked={selections[name].includes(value)}
                  required={index === 0 && selections[name].length === 0}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelections((current) => ({
                      ...current,
                      [name]: checked ? [...current[name], value] : current[name].filter((item) => item !== value),
                    }));
                  }}
                />
                <span>{value}</span>
              </label>
            ))}
          </fieldset>
        ))}

        {form.fields.guests && (
          <label className={styles.field}>
            <span>Зочдын тоо</span>
            <input type="number" name="guests" min={1} max={20} className={styles.input} />
          </label>
        )}
        {form.fields.note && (
          <label className={styles.field}>
            <span>Нэмэлт мэдээлэл</span>
            <textarea name="note" rows={3} maxLength={1500} className={styles.input} />
          </label>
        )}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button type="submit" disabled={busy} className={styles.submit}>
          {busy ? "Илгээж байна…" : form.submitLabel}
        </button>
      </fieldset>
    </form>
  );
}
