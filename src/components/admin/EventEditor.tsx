"use client";

/* Эвентийн бүрэн засварлагч — hero, section-ууд (нэмэх/зөөх/устгах),
   бүртгэлийн маягт, холбоо барих, өнгө/slug/төлөв. Хадгалах нь
   PUT /api/admin/events/[id]. */

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventContent, EventDoc, Section, SectionType } from "@/lib/events";
import { isValidSlug, makeSection } from "@/lib/events";
import { Button, Card, Field, TextInput, TextArea, Toggle, ImageField } from "./ui";
import { SectionFields, SECTION_LABELS } from "./SectionFields";

const SECTION_TYPES: SectionType[] = ["richText", "stats", "agenda", "gallery", "image", "cards", "cta"];

export function EventEditor({
  initial,
  storeMode,
  authDisabled,
}: {
  initial: EventDoc;
  storeMode: "supabase" | "local";
  authDisabled: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [status, setStatus] = useState<EventDoc["status"]>(initial.status);
  const [content, setContent] = useState<EventContent>(initial.content);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const touch = useCallback(() => setDirty(true), []);

  /* ---- content update helpers ---- */
  const patchContent = useCallback((patch: Partial<EventContent>) => {
    setContent((c) => ({ ...c, ...patch }));
    touch();
  }, [touch]);
  const patchHero = useCallback((patch: Partial<EventContent["hero"]>) => {
    setContent((c) => ({ ...c, hero: { ...c.hero, ...patch } }));
    touch();
  }, [touch]);
  const patchForm = useCallback((patch: Partial<EventContent["form"]>) => {
    setContent((c) => ({ ...c, form: { ...c.form, ...patch } }));
    touch();
  }, [touch]);
  const patchFormFields = useCallback((patch: Partial<EventContent["form"]["fields"]>) => {
    setContent((c) => ({ ...c, form: { ...c.form, fields: { ...c.form.fields, ...patch } } }));
    touch();
  }, [touch]);
  const patchContact = useCallback((patch: Partial<EventContent["contact"]>) => {
    setContent((c) => ({ ...c, contact: { ...c.contact, ...patch } }));
    touch();
  }, [touch]);

  /* ---- section ops ---- */
  const updateSection = useCallback((s: Section) => {
    setContent((c) => ({ ...c, sections: c.sections.map((x) => (x.id === s.id ? s : x)) }));
    touch();
  }, [touch]);
  const addSection = useCallback((type: SectionType) => {
    setContent((c) => ({ ...c, sections: [...c.sections, makeSection(type)] }));
    setAddOpen(false);
    touch();
  }, [touch]);
  const removeSection = useCallback((id: string) => {
    setContent((c) => ({ ...c, sections: c.sections.filter((x) => x.id !== id) }));
    touch();
  }, [touch]);
  const moveSection = useCallback((id: string, dir: -1 | 1) => {
    setContent((c) => {
      const i = c.sections.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= c.sections.length) return c;
      const sections = [...c.sections];
      [sections[i], sections[j]] = [sections[j], sections[i]];
      return { ...c, sections };
    });
    touch();
  }, [touch]);

  const slugValid = useMemo(() => isValidSlug(slug), [slug]);

  /* ---- persistence ---- */
  const save = async (nextStatus?: EventDoc["status"]) => {
    if (!slugValid) {
      setMsg({ kind: "err", text: "Slug буруу байна (жижиг латин үсэг, тоо, зураас)." });
      return;
    }
    setSaving(true);
    setMsg(null);
    const useStatus = nextStatus ?? status;
    try {
      const res = await fetch(`/api/admin/events/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, status: useStatus, content }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setStatus(useStatus);
        setDirty(false);
        setMsg({ kind: "ok", text: nextStatus === "published" ? "Хэвлэгдлээ." : "Хадгалагдлаа." });
      } else {
        setMsg({ kind: "err", text: json?.error || "Хадгалахад алдаа гарлаа." });
      }
    } catch {
      setMsg({ kind: "err", text: "Сүлжээний алдаа." });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm(`"${name}" эвентийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${initial.id}`, { method: "DELETE" });
      if (res.ok) router.push("/admin");
      else setMsg({ kind: "err", text: "Устгахад алдаа гарлаа." });
    } catch {
      setMsg({ kind: "err", text: "Сүлжээний алдаа." });
    } finally {
      setSaving(false);
    }
  };

  const publicPath = `/${slug}`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
      setMsg({ kind: "ok", text: "Холбоос хуулагдлаа." });
    } catch {
      /* clipboard блоклогдсон бол алгасна */
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
      {/* ---------- Toolbar ---------- */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-neutral-200 bg-neutral-50/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => router.push("/admin")} className="text-sm font-semibold text-neutral-500 hover:text-neutral-800">
            ← Буцах
          </button>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {status === "published" ? "Хэвлэгдсэн" : "Ноорог"}
          </span>
          {dirty && <span className="text-xs font-semibold text-amber-600">● Хадгалаагүй</span>}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <a href={`${publicPath}?preview=1`} target="_blank" rel="noreferrer">
              <Button variant="ghost" type="button">Урьдчилж үзэх ↗</Button>
            </a>
            {status === "published" ? (
              <Button variant="ghost" type="button" disabled={saving} onClick={() => save("draft")}>
                Ноорог болгох
              </Button>
            ) : (
              <Button variant="dark" type="button" disabled={saving} onClick={() => save("published")}>
                Хэвлэх
              </Button>
            )}
            <Button variant="primary" type="button" disabled={saving || !dirty} onClick={() => save()}>
              {saving ? "Хадгалж байна…" : "Хадгалах"}
            </Button>
          </div>
        </div>
        {msg && (
          <p className={`mt-2 text-sm font-semibold ${msg.kind === "ok" ? "text-green-600" : "text-red-600"}`}>
            {msg.text}
          </p>
        )}
        {authDisabled && (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
            ⚠ Нэвтрэлт идэвхгүй байна (ADMIN_PASSWORD тохируулаагүй). Production-д заавал тохируулна уу.
          </p>
        )}
      </div>

      <div className="space-y-5">
        {/* ---------- Settings ---------- */}
        <Card title="Тохиргоо">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Эвентийн нэр">
              <TextInput value={name} onChange={(e) => { setName(e.target.value); touch(); }} />
            </Field>
            <Field label="Slug (URL)" hint={`Public хаяг: ${publicPath}`}>
              <TextInput
                value={slug}
                onChange={(e) => { setSlug(e.target.value.toLowerCase()); touch(); }}
                className={slugValid ? "" : "border-red-400 focus:border-red-400 focus:ring-red-400/15"}
              />
            </Field>
          </div>
          {!slugValid && (
            <p className="mt-2 text-xs font-semibold text-red-500">
              Slug зөвхөн жижиг латин үсэг, тоо, зураас (-) агуулна. admin, api зэрэг нэрсийг ашиглах боломжгүй.
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="ghost" type="button" onClick={copyLink}>Холбоос хуулах</Button>
            <span className="text-xs text-neutral-400">
              Хадгалалт: {storeMode === "supabase" ? "Supabase (production)" : "Локал (.data)"}
            </span>
          </div>
        </Card>

        {/* ---------- Appearance ---------- */}
        <Card title="Загвар">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Онцлох өнгө (accent)">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={content.accent}
                  onChange={(e) => patchContent({ accent: e.target.value })}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-neutral-300 bg-white"
                />
                <TextInput value={content.accent} onChange={(e) => patchContent({ accent: e.target.value })} />
              </div>
            </Field>
            <Field label="Hero-гийн өнгө" hint="Зурагтай үед текст тод харагдах өнгө.">
              <div className="flex gap-2">
                {(["dark", "light"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => patchContent({ theme: t })}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-semibold ${
                      content.theme === t ? "border-[#2a5124] bg-[#2a5124]/5 text-[#2a5124]" : "border-neutral-300 text-neutral-600"
                    }`}
                  >
                    {t === "dark" ? "Бараан" : "Цайвар"}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </Card>

        {/* ---------- Hero ---------- */}
        <Card title="Hero (эхний дэлгэц)">
          <div className="space-y-4">
            <ImageField
              label="Дэвсгэр зураг"
              value={content.hero.image}
              onChange={(url) => patchHero({ image: url })}
              ratio="16/9"
              maxEdge={2000}
              hint="Заавал биш. Байхгүй бол дан өнгө."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kicker (жижиг гарчиг)">
                <TextInput value={content.hero.kicker} onChange={(e) => patchHero({ kicker: e.target.value })} />
              </Field>
              <Field label="CTA товчны бичвэр">
                <TextInput value={content.hero.ctaLabel} onChange={(e) => patchHero({ ctaLabel: e.target.value })} />
              </Field>
            </div>
            <Field label="Гол гарчиг">
              <TextInput value={content.hero.title} onChange={(e) => patchHero({ title: e.target.value })} />
            </Field>
            <Field label="Дэд текст">
              <TextArea rows={2} value={content.hero.subtitle} onChange={(e) => patchHero({ subtitle: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Огноо / цаг">
                <TextInput value={content.hero.date} onChange={(e) => patchHero({ date: e.target.value })} placeholder="2026 оны 3-р сарын 15, 17:00" />
              </Field>
              <Field label="Байршил">
                <TextInput value={content.hero.location} onChange={(e) => patchHero({ location: e.target.value })} />
              </Field>
            </div>
          </div>
        </Card>

        {/* ---------- Sections ---------- */}
        <Card
          title="Хэсгүүд"
          right={
            <div className="relative">
              <Button type="button" variant="ghost" onClick={() => setAddOpen((v) => !v)}>+ Хэсэг нэмэх</Button>
              {addOpen && (
                <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                  {SECTION_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addSection(t)}
                      className="block w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      {SECTION_LABELS[t]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-3">
            {content.sections.length === 0 && (
              <p className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-400">
                Хэсэг алга. Баруун дээрээс “+ Хэсэг нэмэх”.
              </p>
            )}
            {content.sections.map((s, i) => (
              <div key={s.id} className="rounded-xl border border-neutral-200">
                <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-3 py-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                    {SECTION_LABELS[s.type]}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(s.id, -1)}
                      disabled={i === 0}
                      aria-label="Дээш"
                      className="rounded px-2 py-1 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30"
                    >↑</button>
                    <button
                      type="button"
                      onClick={() => moveSection(s.id, 1)}
                      disabled={i === content.sections.length - 1}
                      aria-label="Доош"
                      className="rounded px-2 py-1 text-neutral-500 hover:bg-neutral-200 disabled:opacity-30"
                    >↓</button>
                    <button
                      type="button"
                      onClick={() => removeSection(s.id)}
                      aria-label="Хэсэг устгах"
                      className="rounded px-2 py-1 text-red-500 hover:bg-red-50"
                    >✕</button>
                  </div>
                </div>
                <div className="p-3">
                  <SectionFields section={s} onChange={updateSection} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ---------- Register form ---------- */}
        <Card title="Бүртгэлийн маягт (lead capture)">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Маягтын гарчиг">
                <TextInput value={content.form.title} onChange={(e) => patchForm({ title: e.target.value })} />
              </Field>
              <Field label="Илгээх товч">
                <TextInput value={content.form.submitLabel} onChange={(e) => patchForm({ submitLabel: e.target.value })} />
              </Field>
            </div>
            <Field label="Тайлбар">
              <TextArea rows={2} value={content.form.subtitle} onChange={(e) => patchForm({ subtitle: e.target.value })} />
            </Field>
            <div>
              <span className="mb-2 block text-[13px] font-semibold text-neutral-700">Нэмэлт талбар</span>
              <div className="flex flex-wrap gap-5 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="text-sm text-neutral-400">Нэр, Утас (үргэлж)</span>
                <Toggle checked={content.form.fields.email} onChange={(v) => patchFormFields({ email: v })} label="И-мэйл" />
                <Toggle checked={content.form.fields.guests} onChange={(v) => patchFormFields({ guests: v })} label="Зочдын тоо" />
                <Toggle checked={content.form.fields.note} onChange={(v) => patchFormFields({ note: v })} label="Тэмдэглэл" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Амжилтын гарчиг">
                <TextInput value={content.form.successTitle} onChange={(e) => patchForm({ successTitle: e.target.value })} />
              </Field>
              <Field label="Амжилтын текст">
                <TextInput value={content.form.successBody} onChange={(e) => patchForm({ successBody: e.target.value })} />
              </Field>
            </div>
          </div>
        </Card>

        {/* ---------- Contact ---------- */}
        <Card title="Холбоо барих">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Утас">
              <TextInput value={content.contact.phone} onChange={(e) => patchContact({ phone: e.target.value })} />
            </Field>
            <Field label="Тэмдэглэл (цагийн хуваарь г.м)">
              <TextInput value={content.contact.note} onChange={(e) => patchContact({ note: e.target.value })} />
            </Field>
          </div>
        </Card>

        {/* ---------- Danger ---------- */}
        <div className="flex justify-end pt-2">
          <Button variant="danger" type="button" onClick={onDelete} disabled={saving}>
            Эвент устгах
          </Button>
        </div>
      </div>
    </div>
  );
}
