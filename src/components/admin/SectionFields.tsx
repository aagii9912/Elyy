"use client";

/* Section төрөл бүрийн засварын талбарууд. Толгой картыг (зөөх/устгах)
   эцэг EventEditor рендерлэнэ; энэ нь зөвхөн доторх талбаруудыг гаргана. */

import type { Section } from "@/lib/events";
import { Field, TextInput, TextArea, ImageField, Button } from "./ui";

export const SECTION_LABELS: Record<Section["type"], string> = {
  richText: "Текст",
  stats: "Тоон үзүүлэлт",
  agenda: "Хөтөлбөр",
  gallery: "Зургийн цомог",
  image: "Зураг",
  cards: "Картууд",
  cta: "Уриалга (CTA)",
};

function ItemRow({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="relative rounded-lg border border-neutral-200 bg-neutral-50 p-3 pr-10">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Устгах"
        className="absolute right-2 top-2 rounded-md px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
      >
        ✕
      </button>
    </div>
  );
}

export function SectionFields({
  section,
  onChange,
}: {
  section: Section;
  onChange: (s: Section) => void;
}) {
  switch (section.type) {
    case "richText":
      return (
        <div className="space-y-3">
          <Field label="Гарчиг">
            <TextInput value={section.heading} onChange={(e) => onChange({ ...section, heading: e.target.value })} />
          </Field>
          <Field label="Текст">
            <TextArea rows={5} value={section.body} onChange={(e) => onChange({ ...section, body: e.target.value })} />
          </Field>
        </div>
      );

    case "stats":
      return (
        <div className="space-y-3">
          {section.items.map((it, i) => (
            <ItemRow key={i} onRemove={() => onChange({ ...section, items: section.items.filter((_, j) => j !== i) })}>
              <div className="grid grid-cols-2 gap-2">
                <TextInput
                  placeholder="Утга (506)"
                  value={it.value}
                  onChange={(e) => {
                    const items = [...section.items];
                    items[i] = { ...it, value: e.target.value };
                    onChange({ ...section, items });
                  }}
                />
                <TextInput
                  placeholder="Тайлбар"
                  value={it.label}
                  onChange={(e) => {
                    const items = [...section.items];
                    items[i] = { ...it, label: e.target.value };
                    onChange({ ...section, items });
                  }}
                />
              </div>
            </ItemRow>
          ))}
          <Button type="button" variant="ghost" onClick={() => onChange({ ...section, items: [...section.items, { value: "", label: "" }] })}>
            + Мөр нэмэх
          </Button>
        </div>
      );

    case "agenda":
      return (
        <div className="space-y-3">
          <Field label="Гарчиг">
            <TextInput value={section.heading} onChange={(e) => onChange({ ...section, heading: e.target.value })} />
          </Field>
          {section.items.map((it, i) => (
            <ItemRow key={i} onRemove={() => onChange({ ...section, items: section.items.filter((_, j) => j !== i) })}>
              <div className="space-y-2">
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <TextInput
                    placeholder="17:00"
                    value={it.time}
                    onChange={(e) => {
                      const items = [...section.items];
                      items[i] = { ...it, time: e.target.value };
                      onChange({ ...section, items });
                    }}
                  />
                  <TextInput
                    placeholder="Гарчиг"
                    value={it.title}
                    onChange={(e) => {
                      const items = [...section.items];
                      items[i] = { ...it, title: e.target.value };
                      onChange({ ...section, items });
                    }}
                  />
                </div>
                <TextInput
                  placeholder="Тайлбар (заавал биш)"
                  value={it.desc}
                  onChange={(e) => {
                    const items = [...section.items];
                    items[i] = { ...it, desc: e.target.value };
                    onChange({ ...section, items });
                  }}
                />
              </div>
            </ItemRow>
          ))}
          <Button type="button" variant="ghost" onClick={() => onChange({ ...section, items: [...section.items, { time: "", title: "", desc: "" }] })}>
            + Мөр нэмэх
          </Button>
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {section.images.map((img, i) => (
              <div key={i}>
                <ImageField
                  label={`Зураг ${i + 1}`}
                  value={img.url}
                  aspect="aspect-[4/3]"
                  onChange={(url) => {
                    const images = [...section.images];
                    images[i] = { ...img, url };
                    onChange({ ...section, images });
                  }}
                />
                <button
                  type="button"
                  onClick={() => onChange({ ...section, images: section.images.filter((_, j) => j !== i) })}
                  className="mt-1 text-xs font-semibold text-red-500 hover:underline"
                >
                  Мөр устгах
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" onClick={() => onChange({ ...section, images: [...section.images, { url: "", alt: "" }] })}>
            + Зураг нэмэх
          </Button>
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <ImageField label="Зураг" value={section.url} onChange={(url) => onChange({ ...section, url })} />
          <Field label="Тайлбар (заавал биш)">
            <TextInput value={section.caption} onChange={(e) => onChange({ ...section, caption: e.target.value })} />
          </Field>
        </div>
      );

    case "cards":
      return (
        <div className="space-y-3">
          <Field label="Гарчиг">
            <TextInput value={section.heading} onChange={(e) => onChange({ ...section, heading: e.target.value })} />
          </Field>
          {section.items.map((it, i) => (
            <ItemRow key={i} onRemove={() => onChange({ ...section, items: section.items.filter((_, j) => j !== i) })}>
              <div className="space-y-2">
                <ImageField
                  label="Зураг"
                  value={it.image}
                  aspect="aspect-[4/3]"
                  onChange={(image) => {
                    const items = [...section.items];
                    items[i] = { ...it, image };
                    onChange({ ...section, items });
                  }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <TextInput
                    placeholder="Нэр"
                    value={it.title}
                    onChange={(e) => {
                      const items = [...section.items];
                      items[i] = { ...it, title: e.target.value };
                      onChange({ ...section, items });
                    }}
                  />
                  <TextInput
                    placeholder="Дэд гарчиг"
                    value={it.subtitle}
                    onChange={(e) => {
                      const items = [...section.items];
                      items[i] = { ...it, subtitle: e.target.value };
                      onChange({ ...section, items });
                    }}
                  />
                </div>
                <TextArea
                  rows={2}
                  placeholder="Тайлбар"
                  value={it.desc}
                  onChange={(e) => {
                    const items = [...section.items];
                    items[i] = { ...it, desc: e.target.value };
                    onChange({ ...section, items });
                  }}
                />
              </div>
            </ItemRow>
          ))}
          <Button type="button" variant="ghost" onClick={() => onChange({ ...section, items: [...section.items, { image: "", title: "", subtitle: "", desc: "" }] })}>
            + Карт нэмэх
          </Button>
        </div>
      );

    case "cta":
      return (
        <div className="space-y-3">
          <Field label="Гарчиг">
            <TextInput value={section.heading} onChange={(e) => onChange({ ...section, heading: e.target.value })} />
          </Field>
          <Field label="Текст">
            <TextArea rows={2} value={section.body} onChange={(e) => onChange({ ...section, body: e.target.value })} />
          </Field>
          <Field label="Товчны бичвэр" hint="Дархад бүртгэлийн хэсэг рүү гүйлгэнэ.">
            <TextInput value={section.buttonLabel} onChange={(e) => onChange({ ...section, buttonLabel: e.target.value })} />
          </Field>
        </div>
      );
  }
}
