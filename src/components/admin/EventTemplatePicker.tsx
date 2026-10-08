"use client";

import type { EventTemplate } from "@/lib/events";

export function EventTemplatePicker({ value, onChange, disabled = false }: {
  value: EventTemplate;
  onChange: (template: EventTemplate) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">Хуудасны загвар сонгох</legend>
      {([
        ["event", "Эвентийн landing page", "Нүүр зураг, танилцуулга, хөтөлбөр, нэмэлт хэсгүүд болон бүртгэлийн маягт."],
        ["registration", "Нэг нүүрийн форм", "Header, хүсэлтийн маягт, showroom, footer болон менежерүүдтэй амжилтын дэлгэц."],
      ] as const).map(([template, title, description]) => (
        <label key={template} className={`cursor-pointer rounded-xl border-2 p-4 transition-colors focus-within:ring-2 focus-within:ring-ink/30 ${
          value === template ? "border-ink bg-ink/5" : "border-neutral-200 bg-white hover:border-neutral-300"
        }`}>
          <span className="mb-3 flex h-20 overflow-hidden rounded-md border border-neutral-200 bg-white p-2" aria-hidden>
            {template === "event" ? (
              <span className="flex w-full flex-col gap-1.5">
                <span className="h-8 rounded-sm bg-[#2a5124]" />
                <span className="flex gap-1.5"><span className="h-3 w-1/2 bg-neutral-200" /><span className="h-3 w-1/2 bg-neutral-200" /></span>
                <span className="h-3 w-3/4 bg-neutral-100" />
              </span>
            ) : (
              <span className="grid w-full grid-cols-[1.6fr_1fr] gap-3">
                <span className="flex flex-col gap-1 rounded bg-[#f8f7f3] p-2">
                  <span className="h-2 border border-neutral-200 bg-white" /><span className="h-2 border border-neutral-200 bg-white" />
                  <span className="h-2 border border-neutral-200 bg-white" /><span className="mt-auto h-2 bg-[#b99e7f]" />
                </span>
                <span className="flex flex-col justify-center gap-1.5"><span className="h-7 bg-[#ddd0be]" /><span className="h-1 bg-neutral-200" /><span className="h-1 w-3/4 bg-neutral-200" /></span>
              </span>
            )}
          </span>
          <span className="flex items-center gap-2.5 text-sm font-bold text-neutral-900">
            <input type="radio" name="event-template" value={template} aria-label={title} checked={value === template} onChange={() => onChange(template)} className="h-4 w-4 accent-ink" />
            {title}
          </span>
          <span className="mt-2 block text-sm leading-relaxed text-neutral-500">{description}</span>
        </label>
      ))}
    </fieldset>
  );
}
