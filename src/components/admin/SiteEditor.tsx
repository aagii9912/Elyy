"use client";

/* Үндсэн сайтын (`/`) контентын засварлагч.
   Зүүн талд хэсгүүдийн жагсаалт, баруун талд тухайн хэсгийн талбарууд.
   Хадгалахад `/api/admin/site` (PUT) руу бүтэн JSON илгээж, сервер тал
   өгөгдмөл бүтэц дээр давхарлаж цэвэрлээд хадгална. */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cloneDefaultSiteContent, type SiteContent } from "@/lib/site-content";
import { Button, Card, Field, FileField, ImageField, Select, TextArea, TextInput, Toggle } from "./ui";

type SectionId =
  | "brand"
  | "brochure"
  | "nav"
  | "hero"
  | "plan"
  | "elys"
  | "equip"
  | "marquee"
  | "apartments"
  | "developer"
  | "gallery"
  | "vr"
  | "location"
  | "contact"
  | "managers"
  | "faq"
  | "news"
  | "footer"
  | "chatbot"
  | "seo";

const SECTIONS: { id: SectionId; label: string; hint: string }[] = [
  { id: "brand", label: "Брэнд & холбоо", hint: "Нэр, уриа, и-мэйл, танилцуулга" },
  { id: "brochure", label: "Танилцуулга татах", hint: "Утас/и-мэйл цуглуулах маягт" },
  { id: "nav", label: "Толгой цэс", hint: "Навигац, товчнууд" },
  { id: "hero", label: "Нүүр дэлгэц", hint: "Hero-гийн тайлбар" },
  { id: "plan", label: "01 · Ерөнхий төлөвлөлт", hint: "Тоон үзүүлэлтүүд" },
  { id: "elys", label: "02 · ELYS консепц", hint: "Дөрвөн зарчим" },
  { id: "equip", label: "03 · Үндсэн бүтээц", hint: "Материал, инженерийн шийдэл" },
  { id: "marquee", label: "Уриа (гүйдэг мөр)", hint: "Form Follows …" },
  { id: "apartments", label: "Өрөөний сонголт", hint: "Типүүд, аксонометр зураг" },
  { id: "developer", label: "Төсөл хэрэгжүүлэгч", hint: "Компани, өмнөх төслүүд" },
  { id: "gallery", label: "Зургийн цомог", hint: "Интерьер зургууд" },
  { id: "vr", label: "VR аялал", hint: "360° embed холбоос, постер" },
  { id: "location", label: "Байршил", hint: "Газрын зураг, ойролцоох цэгүүд" },
  { id: "contact", label: "Холбоо барих", hint: "Утас, хаяг, маягт" },
  { id: "managers", label: "Борлуулалтын баг", hint: "Менежерүүд" },
  { id: "faq", label: "Түгээмэл асуулт", hint: "Асуулт & хариулт" },
  { id: "news", label: "Мэдээ (хуудасны текст)", hint: "Нийтлэлүүд → /admin/news" },
  { id: "footer", label: "Хөл хэсэг", hint: "Цэс, сошиал" },
  { id: "chatbot", label: "Чатбот", hint: "Мэндчилгээ, хариултууд" },
  { id: "seo", label: "SEO / мета", hint: "Хайлтын гарчиг, тайлбар" },
];

/* ------------------------------------------------------------------ */
/* Жагсаалт засварлагч — нэмэх / зөөх / устгах                         */
/* ------------------------------------------------------------------ */

function ListEditor<T>({
  items,
  onChange,
  blank,
  title,
  addLabel,
  children,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  blank: () => T;
  title: (item: T, index: number) => string;
  addLabel: string;
  children: (item: T, set: (patch: Partial<T>) => void, index: number) => React.ReactNode;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-md bg-neutral-200 px-2 py-0.5 text-[11px] font-bold text-neutral-600">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-neutral-700">
              {title(item, i)}
            </span>
            <button
              type="button"
              onClick={() => move(i, i - 1)}
              disabled={i === 0}
              aria-label="Дээш зөөх"
              className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-200 disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, i + 1)}
              disabled={i === items.length - 1}
              aria-label="Доош зөөх"
              className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-200 disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label="Устгах"
              className="rounded-md px-2 py-1 text-sm font-semibold text-red-500 hover:bg-red-50"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            {children(
              item,
              (patch) => onChange(items.map((row, j) => (j === i ? { ...row, ...patch } : row))),
              i
            )}
          </div>
        </div>
      ))}
      <Button type="button" variant="ghost" onClick={() => onChange([...items, blank()])}>
        + {addLabel}
      </Button>
    </div>
  );
}

/** Энгийн текстийн жагсаалт (мөрүүд). */
function StringListEditor({
  items,
  onChange,
  addLabel,
  placeholder,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  addLabel: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((value, i) => (
        <div key={i} className="flex items-center gap-2">
          <TextInput
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Устгах"
            className="shrink-0 rounded-md px-2.5 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" onClick={() => onChange([...items, ""])}>
        + {addLabel}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function SiteEditor({ initial }: { initial: SiteContent }) {
  const [content, setContent] = useState<SiteContent>(initial);
  const [section, setSection] = useState<SectionId>("brand");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  /** Хуулбар дээр мутаци хийж шинэ төлөв болгоно (гүн, төрөл-аюулгүй). */
  const edit = useCallback((fn: (draft: SiteContent) => void) => {
    setContent((current) => {
      const draft = structuredClone(current);
      fn(draft);
      return draft;
    });
    setDirty(true);
    setMsg(null);
  }, []);

  /* Хадгалаагүй засвартай үед хуудсаас гарахад анхааруулна. */
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setContent(json.content as SiteContent);
        setDirty(false);
        setMsg({ kind: "ok", text: "Хадгаллаа. Сайт дээр шууд харагдана." });
      } else {
        setMsg({ kind: "err", text: json?.error || "Хадгалж чадсангүй." });
      }
    } catch {
      setMsg({ kind: "err", text: "Сүлжээний алдаа." });
    } finally {
      setBusy(false);
    }
  };

  const resetSection = () => {
    const label = SECTIONS.find((s) => s.id === section)?.label ?? "";
    if (!confirm(`"${label}" хэсгийг өгөгдмөл рүү буцаах уу? (Хадгалах хүртэл эцэслэгдэхгүй)`)) return;
    const defaults = cloneDefaultSiteContent();
    edit((draft) => {
      // Хэсэг бүр өөрийн нэртэй тохирсон түлхүүрийг эзэмшинэ.
      Object.assign(draft, { [section]: defaults[section] });
      if (section === "plan") draft.storyNav.plan = defaults.storyNav.plan;
      if (section === "elys") draft.storyNav.elys = defaults.storyNav.elys;
      if (section === "equip") draft.storyNav.equip = defaults.storyNav.equip;
    });
  };

  /* Кодын өгөгдмөлөөс ялгарч буй хэсгүүд. Хадгалсан контент өгөгдмөлийг
     дардаг тул шинэ өгөгдмөл текст автоматаар гарч ирэхгүй — аль хэсгийг
     гараар шинэчлэх шаардлагатайг эндээс шууд харна. */
  const edited = useMemo(() => {
    const defaults = cloneDefaultSiteContent();
    const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
    const ids = new Set<SectionId>();
    for (const s of SECTIONS) {
      const storyKey = s.id === "plan" || s.id === "elys" || s.id === "equip" ? s.id : null;
      const navSame = !storyKey || content.storyNav[storyKey] === defaults.storyNav[storyKey];
      if (!same(content[s.id], defaults[s.id]) || !navSame) ids.add(s.id);
    }
    return ids;
  }, [content]);

  const body = useMemo(() => renderSection(section, content, edit), [section, content, edit]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Сайтын контент</h1>
          <p className="text-sm text-neutral-500">Үндсэн хуудасны бүх текст, зураг</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Link href="/admin">
            <Button variant="ghost" type="button">← Админ</Button>
          </Link>
          <a href="/" target="_blank" rel="noreferrer">
            <Button variant="ghost" type="button">Сайт үзэх ↗</Button>
          </a>
          <Button variant="primary" type="button" onClick={save} disabled={busy || !dirty}>
            {busy ? "Хадгалж байна…" : dirty ? "Хадгалах" : "Хадгалагдсан"}
          </Button>
        </div>
      </header>

      {msg && (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${
            msg.kind === "ok"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {msg.text}
        </div>
      )}
      {dirty && !msg && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Хадгалаагүй өөрчлөлт байна.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Хэсгүүдийн жагсаалт */}
        <nav className="lg:sticky lg:top-6 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {SECTIONS.map((s) => (
              <li key={s.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={`w-full whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold transition-colors lg:whitespace-normal ${
                    section === s.id
                      ? "bg-[#2a5124] text-white"
                      : "text-neutral-600 hover:bg-neutral-200/60"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {s.label}
                    {edited.has(s.id) && (
                      <span
                        aria-hidden
                        title="Энэ хэсэг өгөгдмөлөөс өөрчлөгдсөн"
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          section === s.id ? "bg-white/80" : "bg-amber-500"
                        }`}
                      />
                    )}
                  </span>
                  <span
                    className={`hidden text-[11px] font-medium lg:block ${
                      section === s.id ? "text-white/70" : "text-neutral-400"
                    }`}
                  >
                    {s.hint}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 hidden text-[11px] leading-relaxed text-neutral-400 lg:block">
            <span aria-hidden className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500 align-middle" />
            Өгөгдмөлөөс өөрчлөгдсөн хэсэг. Шинэ өгөгдмөл текстийг татах бол
            тухайн хэсэг дээр “Өгөгдмөл рүү буцаах” дараад хадгална уу.
          </p>
        </nav>

        <div className="space-y-5">
          {body}
          <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-5">
            <Button variant="primary" type="button" onClick={save} disabled={busy || !dirty}>
              {busy ? "Хадгалж байна…" : "Хадгалах"}
            </Button>
            <Button variant="danger" type="button" onClick={resetSection}>
              Энэ хэсгийг өгөгдмөл рүү буцаах
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Хэсэг бүрийн талбарууд                                              */
/* ------------------------------------------------------------------ */

function renderSection(
  section: SectionId,
  c: SiteContent,
  edit: (fn: (draft: SiteContent) => void) => void
): React.ReactNode {
  switch (section) {
    /* ---------------------------------------------------------- */
    case "brand":
      return (
        <Card title="Брэнд">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Гол гарчиг (hero)" hint="Үг тус бүр тусад нь анимэйшнтэй гарна.">
              <TextInput
                value={c.brand.line}
                onChange={(e) => edit((d) => void (d.brand.line = e.target.value))}
              />
            </Field>
            <Field label="Дэд шошго" hint="Hero-гийн дээд мөр, хөл хэсгийн эхлэл.">
              <TextInput
                value={c.brand.tag}
                onChange={(e) => edit((d) => void (d.brand.tag = e.target.value))}
              />
            </Field>
            <Field label="И-мэйл">
              <TextInput
                value={c.brand.email}
                onChange={(e) => edit((d) => void (d.brand.email = e.target.value))}
              />
            </Field>
          </div>
          <div className="mt-4">
            <FileField
              label="Онлайн танилцуулга (PDF)"
              value={c.brand.brochureUrl}
              onChange={(url) =>
                edit((d) => {
                  const prev = d.brand.brochureUrl;
                  d.brand.brochureUrl = url;
                  // Хөл хэсгийн цэс дэх танилцуулгын холбоосыг хамт шинэчилнэ —
                  // эс бөгөөс тэр линк хуучин файл руу заасаар үлдэнэ.
                  for (const item of d.footer.menu) {
                    if (item.href === prev) item.href = url;
                  }
                })
              }
              hint="«Танилцуулга татах» товч болон хөлний цэснээс энэ файл нээгдэнэ. Шинэ PDF хавсаргахад хуучин холбоос автоматаар солигдоно."
            />
          </div>
        </Card>
      );

    /* ---------------------------------------------------------- */
    case "nav":
      return (
        <>
          <Card title="Товчнууд">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Үндсэн CTA">
                <TextInput
                  value={c.nav.ctaLabel}
                  onChange={(e) => edit((d) => void (d.nav.ctaLabel = e.target.value))}
                />
              </Field>
              <Field label="Танилцуулга татах">
                <TextInput
                  value={c.nav.brochureLabel}
                  onChange={(e) => edit((d) => void (d.nav.brochureLabel = e.target.value))}
                />
              </Field>
              <Field label="Цэсний товчны нэр" hint="Гар утасны цэсний aria-label.">
                <TextInput
                  value={c.nav.menuAria}
                  onChange={(e) => edit((d) => void (d.nav.menuAria = e.target.value))}
                />
              </Field>
            </div>
          </Card>
          <Card title="Цэсний холбоосууд">
            <ListEditor
              items={c.nav.items}
              onChange={(next) => edit((d) => void (d.nav.items = next))}
              blank={() => ({ label: "Шинэ цэс", href: "#" })}
              title={(item) => item.label}
              addLabel="Цэс нэмэх"
            >
              {(item, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Нэр">
                    <TextInput value={item.label} onChange={(e) => set({ label: e.target.value })} />
                  </Field>
                  <Field label="Холбоос" hint="Хуудсан доторх бол # тэмдэгтээр (ж: #about).">
                    <TextInput value={item.href} onChange={(e) => set({ href: e.target.value })} />
                  </Field>
                </div>
              )}
            </ListEditor>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "hero":
      return (
        <Card title="Нүүр дэлгэц">
          <Field label="Тайлбар" hint="Гол гарчгийн доорх богино өгүүлбэр.">
            <TextArea
              rows={3}
              value={c.hero.sub}
              onChange={(e) => edit((d) => void (d.hero.sub = e.target.value))}
            />
          </Field>
          <p className="mt-3 text-xs text-neutral-400">
            Гол гарчиг, дэд шошго, товчны нэрсийг “Брэнд & холбоо”, “Толгой цэс” хэсгээс засна.
          </p>
        </Card>
      );

    /* ---------------------------------------------------------- */
    case "plan":
      return (
        <>
          <Card title="Гарчиг">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kicker">
                <TextInput
                  value={c.plan.kicker}
                  onChange={(e) => edit((d) => void (d.plan.kicker = e.target.value))}
                />
              </Field>
              <Field label="Гарчиг">
                <TextInput
                  value={c.plan.title}
                  onChange={(e) => edit((d) => void (d.plan.title = e.target.value))}
                />
              </Field>
              <Field label="Навигацийн шошго" hint="Баруун талын хэсгийн навигацид харагдана.">
                <TextInput
                  value={c.storyNav.plan}
                  onChange={(e) => edit((d) => void (d.storyNav.plan = e.target.value))}
                />
              </Field>
            </div>
          </Card>
          <Card title="Тоон үзүүлэлтүүд">
            <ListEditor
              items={c.plan.points}
              onChange={(next) => edit((d) => void (d.plan.points = next))}
              blank={() => ({ heading: "0", accent: "", text: "Тайлбар" })}
              title={(item) => `${item.heading}${item.accent}`}
              addLabel="Үзүүлэлт нэмэх"
            >
              {(item, set) => (
                <>
                  <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                    <Field label="Том тоо / утга">
                      <TextInput value={item.heading} onChange={(e) => set({ heading: e.target.value })} />
                    </Field>
                    <Field label="Тэмдэг" hint="Ж: % (ногоон өнгөөр).">
                      <TextInput value={item.accent} onChange={(e) => set({ accent: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Тайлбар">
                    <TextArea rows={2} value={item.text} onChange={(e) => set({ text: e.target.value })} />
                  </Field>
                </>
              )}
            </ListEditor>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "elys":
    case "equip": {
      const key = section;
      const nav = key === "elys" ? c.storyNav.elys : c.storyNav.equip;
      return (
        <>
          <Card title="Гарчиг">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kicker">
                <TextInput
                  value={c[key].kicker}
                  onChange={(e) => edit((d) => void (d[key].kicker = e.target.value))}
                />
              </Field>
              <Field label="Гарчиг">
                <TextInput
                  value={c[key].title}
                  onChange={(e) => edit((d) => void (d[key].title = e.target.value))}
                />
              </Field>
              {/* Тайлбар + "дэлгэрэнгүй" шошгыг хоёр хэсэг хоёулаа
                  ашиглана (ELYS нь accordion самбарын шошго болгож,
                  Барилгын бүтэц нь картын шошго болгож). Зөвхөн
                  эх сурвалжийн холбоос нь Барилгын бүтэцд хамаарна. */}
              <Field label="Хэсгийн тайлбар">
                <TextArea
                  rows={2}
                  value={c[key].body}
                  onChange={(e) => edit((d) => void (d[key].body = e.target.value))}
                />
              </Field>
              <Field label="Картын “дэлгэрэнгүй” текст">
                <TextInput
                  value={c[key].moreLabel}
                  onChange={(e) => edit((d) => void (d[key].moreLabel = e.target.value))}
                />
              </Field>
              {key === "equip" && (
                <Field label="Pop-up доторх холбоосын текст">
                  <TextInput
                    value={c.equip.sourceLabel}
                    onChange={(e) => edit((d) => void (d.equip.sourceLabel = e.target.value))}
                  />
                </Field>
              )}
              <Field label="Навигацийн шошго">
                <TextInput
                  value={nav}
                  onChange={(e) =>
                    edit((d) => {
                      if (key === "elys") d.storyNav.elys = e.target.value;
                      else d.storyNav.equip = e.target.value;
                    })
                  }
                />
              </Field>
            </div>
          </Card>
          <Card title="Зүйлүүд">
            {key === "equip" ? (
              /* Үндсэн бүтээцийн зүйл бүр эх сурвалжийн линктэй байж болно. */
              <ListEditor
                items={c.equip.items}
                onChange={(next) => edit((d) => void (d.equip.items = next))}
                blank={() => ({ title: "Гарчиг", body: "Тайлбар.", link: "", image: "" })}
                title={(item) => item.title}
                addLabel="Зүйл нэмэх"
              >
                {(item, set, itemIndex) => (
                  <>
                    <Field label="Гарчиг">
                      <TextInput value={item.title} onChange={(e) => set({ title: e.target.value })} />
                    </Field>
                    <Field label="Тайлбар" hint="Картан дээр 3 мөр, pop-up дотор бүтнээрээ харагдана.">
                      <TextArea rows={3} value={item.body} onChange={(e) => set({ body: e.target.value })} />
                    </Field>
                    <ImageField
                      label="Зураг"
                      value={item.image}
                      onChange={(url) =>
                        edit((d) => {
                          const it = d.equip.items[itemIndex];
                          if (it) it.image = url;
                        })
                      }
                      ratio="4/3"
                      maxEdge={1600}
                      hint="Картын болон pop-up-ын зураг."
                    />
                    <Field label="Холбоос" hint="Үйлдвэрлэгчийн хуудас. Хоосон бол линк харагдахгүй.">
                      <TextInput
                        value={item.link}
                        placeholder="https://…"
                        onChange={(e) => set({ link: e.target.value })}
                      />
                    </Field>
                  </>
                )}
              </ListEditor>
            ) : (
              <ListEditor
                items={c.elys.items}
                onChange={(next) => edit((d) => void (d.elys.items = next))}
                blank={() => ({ title: "Гарчиг", body: "Тайлбар." })}
                title={(item) => item.title}
                addLabel="Зүйл нэмэх"
              >
                {(item, set) => (
                  <>
                    <Field label="Гарчиг">
                      <TextInput value={item.title} onChange={(e) => set({ title: e.target.value })} />
                    </Field>
                    <Field label="Тайлбар">
                      <TextArea rows={3} value={item.body} onChange={(e) => set({ body: e.target.value })} />
                    </Field>
                  </>
                )}
              </ListEditor>
            )}
          </Card>
        </>
      );
    }

    /* ---------------------------------------------------------- */
    case "brochure":
      return (
        <>
          <Card title="Маягт асаах">
            <Toggle
              checked={c.brochure.enabled}
              onChange={(v) => edit((d) => void (d.brochure.enabled = v))}
              label="Танилцуулга татахын өмнө холбоо барих мэдээлэл авах"
            />
            <p className="mt-3 text-xs text-neutral-500">
              Асаалттай үед “Танилцуулга татах” товч дарахад нэр / утас / и-мэйл авах pop-up
              нээгдэж, хүсэлт Google Sheet болон админы “Хүсэлтүүд” хэсэгт очоод дараа нь PDF
              татагдана. Унтраалттай үед PDF шууд нээгдэнэ.
            </p>
          </Card>

          <Card title="Текстүүд">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Гарчиг">
                <TextInput
                  value={c.brochure.title}
                  onChange={(e) => edit((d) => void (d.brochure.title = e.target.value))}
                />
              </Field>
              <Field label="Илгээх товч">
                <TextInput
                  value={c.brochure.submit}
                  onChange={(e) => edit((d) => void (d.brochure.submit = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Тайлбар">
                <TextArea
                  rows={2}
                  value={c.brochure.sub}
                  onChange={(e) => edit((d) => void (d.brochure.sub = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Нэр талбар">
                <TextInput
                  value={c.brochure.name}
                  onChange={(e) => edit((d) => void (d.brochure.name = e.target.value))}
                />
              </Field>
              <Field label="Утас талбар">
                <TextInput
                  value={c.brochure.phone}
                  onChange={(e) => edit((d) => void (d.brochure.phone = e.target.value))}
                />
              </Field>
              <Field label="И-мэйл талбар">
                <TextInput
                  value={c.brochure.email}
                  onChange={(e) => edit((d) => void (d.brochure.email = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Нууцлалын тэмдэглэл">
                <TextInput
                  value={c.brochure.consent}
                  onChange={(e) => edit((d) => void (d.brochure.consent = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Илгээсний дараа">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Амжилттай гарчиг">
                <TextInput
                  value={c.brochure.successTitle}
                  onChange={(e) => edit((d) => void (d.brochure.successTitle = e.target.value))}
                />
              </Field>
              <Field label="Татах товчны текст">
                <TextInput
                  value={c.brochure.downloadLabel}
                  onChange={(e) => edit((d) => void (d.brochure.downloadLabel = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Амжилттай тайлбар">
                <TextArea
                  rows={2}
                  value={c.brochure.successBody}
                  onChange={(e) => edit((d) => void (d.brochure.successBody = e.target.value))}
                />
              </Field>
              <Field label="Алдааны мэдэгдэл">
                <TextArea
                  rows={2}
                  value={c.brochure.error}
                  onChange={(e) => edit((d) => void (d.brochure.error = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Илгээж байх үеийн текст">
                <TextInput
                  value={c.brochure.sending}
                  onChange={(e) => edit((d) => void (d.brochure.sending = e.target.value))}
                />
              </Field>
            </div>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "vr":
      return (
        <>
          <Card title="360° холбоос">
            <Field
              label="Embed URL"
              hint="Matterport / Kuula / YouTube 360-ийн embed холбоос. Хоосон үед секц “тун удахгүй” төлөвтэй харагдаж, товч нь уулзалт руу хөтөлнө."
            >
              <TextInput
                value={c.vr.embedUrl}
                placeholder="https://my.matterport.com/show/?m=…"
                onChange={(e) => edit((d) => void (d.vr.embedUrl = e.target.value))}
              />
            </Field>
            <p className="mt-3 text-xs text-neutral-500">
              YouTube дээрх 360° бичлэг бол “Embed” хувилбарыг (https://www.youtube.com/embed/…)
              ашиглана. Энгийн watch холбоос ажиллахгүй.
            </p>
          </Card>

          <Card title="Гарчиг & текст">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kicker">
                <TextInput
                  value={c.vr.kicker}
                  onChange={(e) => edit((d) => void (d.vr.kicker = e.target.value))}
                />
              </Field>
              <Field label="Гарчиг">
                <TextInput
                  value={c.vr.title}
                  onChange={(e) => edit((d) => void (d.vr.title = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Тайлбар">
                <TextArea
                  rows={2}
                  value={c.vr.body}
                  onChange={(e) => edit((d) => void (d.vr.body = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Товчны текст">
                <TextInput
                  value={c.vr.ctaLabel}
                  onChange={(e) => edit((d) => void (d.vr.ctaLabel = e.target.value))}
                />
              </Field>
              <Field label="Жижиг тэмдэглэл">
                <TextInput
                  value={c.vr.note}
                  onChange={(e) => edit((d) => void (d.vr.note = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="“Тун удахгүй” шошго" hint="Embed URL хоосон үед постер дээр гарна.">
                <TextInput
                  value={c.vr.soonLabel}
                  onChange={(e) => edit((d) => void (d.vr.soonLabel = e.target.value))}
                />
              </Field>
              <Field label="“Тун удахгүй” товч" hint="Уулзалт товлох хэсэг рүү хөтөлнө.">
                <TextInput
                  value={c.vr.soonCta}
                  onChange={(e) => edit((d) => void (d.vr.soonCta = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Постер зураг">
            <ImageField
              label="Постер"
              value={c.vr.poster}
              onChange={(url) => edit((d) => void (d.vr.poster = url))}
              ratio="16/7"
              maxEdge={2000}
              hint="Аялал эхлүүлэхээс өмнө харагдах зураг."
            />
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "marquee":
      return (
        <Card title="Гүйдэг уриа">
          <StringListEditor
            items={c.marquee.slogans}
            onChange={(next) => edit((d) => void (d.marquee.slogans = next))}
            addLabel="Уриа нэмэх"
            placeholder="Form Follows Function"
          />
        </Card>
      );

    /* ---------------------------------------------------------- */
    case "apartments":
      return (
        <>
          <Card title="Гарчиг">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kicker">
                <TextInput
                  value={c.apartments.kicker}
                  onChange={(e) => edit((d) => void (d.apartments.kicker = e.target.value))}
                />
              </Field>
              <Field label="Гарчиг">
                <TextInput
                  value={c.apartments.title}
                  onChange={(e) => edit((d) => void (d.apartments.title = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Тайлбар">
                <TextArea
                  rows={2}
                  value={c.apartments.body}
                  onChange={(e) => edit((d) => void (d.apartments.body = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Картын товч" hint="Ж: Сонирхох">
                <TextInput
                  value={c.apartments.cardCta}
                  onChange={(e) => edit((d) => void (d.apartments.cardCta = e.target.value))}
                />
              </Field>
              <Field label="“Өнцөг” гэсэн үг" hint="Зургийн тоог заах үг.">
                <TextInput
                  value={c.apartments.viewsWord}
                  onChange={(e) => edit((d) => void (d.apartments.viewsWord = e.target.value))}
                />
              </Field>
              <Field label="“Бүх тип” табны нэр" hint="B1/B2 шүүлтүүрийн эхний таб.">
                <TextInput
                  value={c.apartments.allLabel}
                  onChange={(e) => edit((d) => void (d.apartments.allLabel = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="“Сонирхох” хүсэлтийн pop-up">
            <p className="mb-4 text-xs text-neutral-500">
              Карт дээрх “Сонирхох” дарахад гарах маягт. Илгээхэд сонгосон типийн нэр, блок,
              өрөө, талбай автоматаар хүсэлтэд бичигдэнэ.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Гарчиг">
                <TextInput
                  value={c.apartments.inquiry.title}
                  onChange={(e) => edit((d) => void (d.apartments.inquiry.title = e.target.value))}
                />
              </Field>
              <Field label="Илгээх товч">
                <TextInput
                  value={c.apartments.inquiry.submit}
                  onChange={(e) => edit((d) => void (d.apartments.inquiry.submit = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Тайлбар">
                <TextArea
                  rows={2}
                  value={c.apartments.inquiry.sub}
                  onChange={(e) => edit((d) => void (d.apartments.inquiry.sub = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Нэр талбар">
                <TextInput
                  value={c.apartments.inquiry.name}
                  onChange={(e) => edit((d) => void (d.apartments.inquiry.name = e.target.value))}
                />
              </Field>
              <Field label="Утас талбар">
                <TextInput
                  value={c.apartments.inquiry.phone}
                  onChange={(e) => edit((d) => void (d.apartments.inquiry.phone = e.target.value))}
                />
              </Field>
              <Field label="Нэмэлт тайлбар талбар">
                <TextInput
                  value={c.apartments.inquiry.note}
                  onChange={(e) => edit((d) => void (d.apartments.inquiry.note = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Амжилттай гарчиг">
                <TextInput
                  value={c.apartments.inquiry.successTitle}
                  onChange={(e) => edit((d) => void (d.apartments.inquiry.successTitle = e.target.value))}
                />
              </Field>
              <Field label="Илгээж байх үеийн текст">
                <TextInput
                  value={c.apartments.inquiry.sending}
                  onChange={(e) => edit((d) => void (d.apartments.inquiry.sending = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Амжилттай тайлбар">
                <TextArea
                  rows={2}
                  value={c.apartments.inquiry.successBody}
                  onChange={(e) => edit((d) => void (d.apartments.inquiry.successBody = e.target.value))}
                />
              </Field>
              <Field label="Алдааны мэдэгдэл">
                <TextArea
                  rows={2}
                  value={c.apartments.inquiry.error}
                  onChange={(e) => edit((d) => void (d.apartments.inquiry.error = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Төгсгөлийн карт">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Kicker">
                <TextInput
                  value={c.apartments.ctaCard.kicker}
                  onChange={(e) => edit((d) => void (d.apartments.ctaCard.kicker = e.target.value))}
                />
              </Field>
              <Field label="Гарчиг">
                <TextInput
                  value={c.apartments.ctaCard.title}
                  onChange={(e) => edit((d) => void (d.apartments.ctaCard.title = e.target.value))}
                />
              </Field>
              <Field label="Холбоосын текст">
                <TextInput
                  value={c.apartments.ctaCard.link}
                  onChange={(e) => edit((d) => void (d.apartments.ctaCard.link = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Орон сууцны типүүд">
            <ListEditor
              items={c.apartments.units}
              onChange={(next) => edit((d) => void (d.apartments.units = next))}
              blank={() => ({ title: "Шинэ тип", rooms: "1 өрөө", area: "", block: "", thumb: "", views: [] })}
              title={(item) => `${item.title} · ${item.rooms}`}
              addLabel="Тип нэмэх"
            >
              {(item, set, unitIndex) => {
                /* Зураг байршуулах нь async тул `item`-ийн render үеийн
                   хуулбараар бичвэл зэрэг оруулсан хоёр зургийн нэг нь
                   дарагдана. Тиймээс `edit`-ээр хамгийн сүүлийн төлөв дээр
                   индексээр нь шууд бичнэ. */
                const editUnit = (fn: (unit: SiteContent["apartments"]["units"][number]) => void) =>
                  edit((d) => {
                    const unit = d.apartments.units[unitIndex];
                    if (unit) fn(unit);
                  });
                return (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="Типийн нэр">
                        <TextInput value={item.title} onChange={(e) => set({ title: e.target.value })} />
                      </Field>
                      <Field label="Өрөөний тоо">
                        <TextInput value={item.rooms} onChange={(e) => set({ rooms: e.target.value })} />
                      </Field>
                      <Field label="Талбай / тэмдэглэгээ">
                        <TextInput value={item.area} onChange={(e) => set({ area: e.target.value })} />
                      </Field>
                    </div>
                    <Field
                      label="Блок"
                      hint="Ж: B1, B2. Хоёроос дээш блок тохируулбал сайт дээр шүүлтүүрийн таб гарна. Хоосон бол шүүлтүүрт орохгүй."
                    >
                      <TextInput
                        value={item.block}
                        placeholder="B1"
                        onChange={(e) => set({ block: e.target.value })}
                      />
                    </Field>
                    <ImageField
                      label="Картын зураг"
                      value={item.thumb}
                      onChange={(url) => editUnit((u) => void (u.thumb = url))}
                      ratio="4/3"
                      maxEdge={800}
                      fit="contain"
                      hint="Аксонометрын жижиг хувилбар. Хоосон бол эхний өнцгийн зургийг ашиглана."
                    />
                    <div>
                      <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
                        Томруулж үзэх өнцгүүд
                      </span>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {item.views.map((view, vi) => (
                          <div key={vi} className="rounded-lg border border-neutral-200 bg-white p-3">
                            <ImageField
                              label={`Өнцөг ${vi + 1}`}
                              value={view}
                              onChange={(url) => editUnit((u) => void (u.views[vi] = url))}
                              ratio="4/3"
                              maxEdge={1600}
                              fit="contain"
                              hint="Lightbox-д томруулж үзэх аксонометр зураг."
                            />
                            <Button
                              type="button"
                              variant="danger"
                              className="mt-2"
                              onClick={() => editUnit((u) => void u.views.splice(vi, 1))}
                            >
                              Өнцөг устгах
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-3"
                        onClick={() => editUnit((u) => void u.views.push(""))}
                      >
                        + Өнцөг нэмэх
                      </Button>
                    </div>
                  </>
                );
              }}
            </ListEditor>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "developer":
      return (
        <>
          <Card title="Компани">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kicker">
                <TextInput
                  value={c.developer.kicker}
                  onChange={(e) => edit((d) => void (d.developer.kicker = e.target.value))}
                />
              </Field>
              <Field label="Компанийн нэр">
                <TextInput
                  value={c.developer.name}
                  onChange={(e) => edit((d) => void (d.developer.name = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Танилцуулга">
                <TextArea
                  rows={5}
                  value={c.developer.body}
                  onChange={(e) => edit((d) => void (d.developer.body = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Он">
                <TextInput
                  value={c.developer.since}
                  onChange={(e) => edit((d) => void (d.developer.since = e.target.value))}
                />
              </Field>
              <Field label="Оны шошго">
                <TextInput
                  value={c.developer.sinceLabel}
                  onChange={(e) => edit((d) => void (d.developer.sinceLabel = e.target.value))}
                />
              </Field>
              <Field label="Төслийн тоо">
                <TextInput
                  value={c.developer.projectCount}
                  onChange={(e) => edit((d) => void (d.developer.projectCount = e.target.value))}
                />
              </Field>
              <Field label="Тооны шошго">
                <TextInput
                  value={c.developer.projectCountLabel}
                  onChange={(e) => edit((d) => void (d.developer.projectCountLabel = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Гүйлгэх заавар" hint="Дэлгэц доод талд гарах жижиг тэмдэглэл.">
                <TextInput
                  value={c.developer.scrollHint}
                  onChange={(e) => edit((d) => void (d.developer.scrollHint = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 max-w-xs">
              <ImageField
                label="Компанийн icon"
                value={c.developer.logo}
                onChange={(url) => edit((d) => void (d.developer.logo = url))}
                ratio="1/1"
                maxEdge={512}
                fit="contain"
                hint="Дөрвөлжин лого (тунгалаг PNG/SVG). Timeline-ийн ард сүүдэр болж харагдана. Хоосон бол 2006 → 2026 гүйдэг он гарна."
              />
            </div>
          </Card>

          <Card title="Өмнөх төслүүд">
            <p className="mb-3 text-xs text-neutral-400">
              Он нь “2014–2019” хэлбэртэй байвал цагийн шугам зөв эрэмбэлэгдэнэ.
            </p>
            <ListEditor
              items={c.developer.projects}
              onChange={(next) => edit((d) => void (d.developer.projects = next))}
              blank={() => ({ title: "Шинэ төсөл", meta: "", units: "", years: "2020–2024", image: "" })}
              title={(item) => `${item.title} · ${item.years}`}
              addLabel="Төсөл нэмэх"
            >
              {(item, set) => (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Нэр">
                      <TextInput value={item.title} onChange={(e) => set({ title: e.target.value })} />
                    </Field>
                    <Field label="Он" hint="Ж: 2014–2019">
                      <TextInput value={item.years} onChange={(e) => set({ years: e.target.value })} />
                    </Field>
                    <Field label="Тодорхойлолт" hint="Ж: 15 давхар · 600 айл">
                      <TextInput value={item.meta} onChange={(e) => set({ meta: e.target.value })} />
                    </Field>
                    <Field label="Булангийн шошго" hint="Ж: 600 айл">
                      <TextInput value={item.units} onChange={(e) => set({ units: e.target.value })} />
                    </Field>
                  </div>
                  <ImageField
                    label="Төслийн зураг"
                    value={item.image}
                    onChange={(url) => set({ image: url })}
                    ratio="4/3"
                    maxEdge={1600}
                    hint="Цагийн шугамын карт дээр харагдана — барилгын гадна талын зураг тохиромжтой."
                  />
                </>
              )}
            </ListEditor>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "gallery":
      return (
        <>
          <Card title="Гарчиг">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kicker">
                <TextInput
                  value={c.gallery.kicker}
                  onChange={(e) => edit((d) => void (d.gallery.kicker = e.target.value))}
                />
              </Field>
              <Field label="Гарчиг">
                <TextInput
                  value={c.gallery.title}
                  onChange={(e) => edit((d) => void (d.gallery.title = e.target.value))}
                />
              </Field>
            </div>
          </Card>
          <Card title="Зургууд">
            <ListEditor
              items={c.gallery.images}
              onChange={(next) => edit((d) => void (d.gallery.images = next))}
              blank={() => ({ src: "", tag: "Зочны өрөө" })}
              title={(item) => item.tag}
              addLabel="Зураг нэмэх"
            >
              {(item, set) => (
                <>
                  <Field label="Шошго" hint="Зургийн буланд харагдана.">
                    <TextInput value={item.tag} onChange={(e) => set({ tag: e.target.value })} />
                  </Field>
                  <ImageField
                    label="Зураг"
                    value={item.src}
                    onChange={(url) => set({ src: url })}
                    ratio="4/3"
                    maxEdge={2000}
                    hint="Цомогт бүтэн өргөнөөр харагдана — интерьерийн чанартай зураг."
                  />
                </>
              )}
            </ListEditor>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "location":
      return (
        <>
          <Card title="Гарчиг">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Kicker">
                <TextInput
                  value={c.location.kicker}
                  onChange={(e) => edit((d) => void (d.location.kicker = e.target.value))}
                />
              </Field>
              <Field label="Чиглэл авах товч">
                <TextInput
                  value={c.location.directionsLabel}
                  onChange={(e) => edit((d) => void (d.location.directionsLabel = e.target.value))}
                />
              </Field>
              <Field label="“Хаяг” шошго">
                <TextInput
                  value={c.location.addressLabel}
                  onChange={(e) => edit((d) => void (d.location.addressLabel = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          {(["project", "office"] as const).map((tab) => (
            <Card key={tab} title={tab === "project" ? "Таб · Төслийн байршил" : "Таб · Борлуулалтын оффис"}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Табны нэр">
                  <TextInput
                    value={c.location.tabs[tab].label}
                    onChange={(e) => edit((d) => void (d.location.tabs[tab].label = e.target.value))}
                  />
                </Field>
                <Field label="Гарчиг">
                  <TextInput
                    value={c.location.tabs[tab].title}
                    onChange={(e) => edit((d) => void (d.location.tabs[tab].title = e.target.value))}
                  />
                </Field>
                <Field label="Хаяг">
                  <TextInput
                    value={c.location.tabs[tab].address}
                    onChange={(e) => edit((d) => void (d.location.tabs[tab].address = e.target.value))}
                  />
                </Field>
                <Field label="Координат" hint="Өргөрөг,уртраг — ж: 47.897,106.885">
                  <TextInput
                    value={c.location.tabs[tab].coords}
                    onChange={(e) => edit((d) => void (d.location.tabs[tab].coords = e.target.value))}
                  />
                </Field>
              </div>
            </Card>
          ))}

          <Card title="Оффисын самбарын шошгууд">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Утас">
                <TextInput
                  value={c.location.office.phoneLabel}
                  onChange={(e) => edit((d) => void (d.location.office.phoneLabel = e.target.value))}
                />
              </Field>
              <Field label="Цагийн хуваарь">
                <TextInput
                  value={c.location.office.hoursLabel}
                  onChange={(e) => edit((d) => void (d.location.office.hoursLabel = e.target.value))}
                />
              </Field>
              <Field label="И-мэйл">
                <TextInput
                  value={c.location.office.emailLabel}
                  onChange={(e) => edit((d) => void (d.location.office.emailLabel = e.target.value))}
                />
              </Field>
              <Field label="Товч">
                <TextInput
                  value={c.location.office.ctaLabel}
                  onChange={(e) => edit((d) => void (d.location.office.ctaLabel = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Ойролцоох цэгүүд">
            <ListEditor
              items={c.location.nearby}
              onChange={(next) => edit((d) => void (d.location.nearby = next))}
              blank={() => ({ label: "Шинэ бүлэг", items: [] })}
              title={(item) => `${item.label} · ${item.items.length}`}
              addLabel="Бүлэг нэмэх"
            >
              {(group, setGroup) => (
                <>
                  <Field label="Бүлгийн нэр">
                    <TextInput value={group.label} onChange={(e) => setGroup({ label: e.target.value })} />
                  </Field>
                  <ListEditor
                    items={group.items}
                    onChange={(next) => setGroup({ items: next })}
                    blank={() => ({ place: "Шинэ цэг", distance: "0", kind: "" })}
                    title={(item) => `${item.place} · ${item.distance}м`}
                    addLabel="Цэг нэмэх"
                  >
                    {(place, setPlace) => (
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Нэр">
                          <TextInput value={place.place} onChange={(e) => setPlace({ place: e.target.value })} />
                        </Field>
                        <Field label="Зай (метр)">
                          <TextInput
                            value={place.distance}
                            onChange={(e) => setPlace({ distance: e.target.value })}
                          />
                        </Field>
                        <Field label="Төрөл" hint="Заавал биш.">
                          <TextInput value={place.kind} onChange={(e) => setPlace({ kind: e.target.value })} />
                        </Field>
                      </div>
                    )}
                  </ListEditor>
                </>
              )}
            </ListEditor>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "contact":
      return (
        <>
          <Card title="Гарчиг">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kicker">
                <TextInput
                  value={c.contact.kicker}
                  onChange={(e) => edit((d) => void (d.contact.kicker = e.target.value))}
                />
              </Field>
              <Field label="Гарчиг">
                <TextInput
                  value={c.contact.title}
                  onChange={(e) => edit((d) => void (d.contact.title = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Тайлбар">
                <TextArea
                  rows={3}
                  value={c.contact.sub}
                  onChange={(e) => edit((d) => void (d.contact.sub = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Холбоо барих мэдээлэл">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Утас">
                <TextInput
                  value={c.contact.phone}
                  onChange={(e) => edit((d) => void (d.contact.phone = e.target.value))}
                />
              </Field>
              <Field label="Цагийн хуваарь">
                <TextInput
                  value={c.contact.hours}
                  onChange={(e) => edit((d) => void (d.contact.hours = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Борлуулалтын албаны хаяг">
                <TextArea
                  rows={2}
                  value={c.contact.location}
                  onChange={(e) => edit((d) => void (d.contact.location = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Шошго · Утас">
                <TextInput
                  value={c.contact.labels.phone}
                  onChange={(e) => edit((d) => void (d.contact.labels.phone = e.target.value))}
                />
              </Field>
              <Field label="Шошго · Цаг">
                <TextInput
                  value={c.contact.labels.hours}
                  onChange={(e) => edit((d) => void (d.contact.labels.hours = e.target.value))}
                />
              </Field>
              <Field label="Шошго · Алба">
                <TextInput
                  value={c.contact.labels.office}
                  onChange={(e) => edit((d) => void (d.contact.labels.office = e.target.value))}
                />
              </Field>
              <Field label="Шошго · И-мэйл">
                <TextInput
                  value={c.contact.labels.email}
                  onChange={(e) => edit((d) => void (d.contact.labels.email = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Хүсэлтийн маягт">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Нэр талбар">
                <TextInput
                  value={c.contact.form.name}
                  onChange={(e) => edit((d) => void (d.contact.form.name = e.target.value))}
                />
              </Field>
              <Field label="Утас талбар">
                <TextInput
                  value={c.contact.form.phone}
                  onChange={(e) => edit((d) => void (d.contact.form.phone = e.target.value))}
                />
              </Field>
              <Field label="Огнооны шошго">
                <TextInput
                  value={c.contact.form.dateLabel}
                  onChange={(e) => edit((d) => void (d.contact.form.dateLabel = e.target.value))}
                />
              </Field>
              <Field label="Илгээх товч">
                <TextInput
                  value={c.contact.form.submit}
                  onChange={(e) => edit((d) => void (d.contact.form.submit = e.target.value))}
                />
              </Field>
              <Field label="Илгээж байна…">
                <TextInput
                  value={c.contact.form.sending}
                  onChange={(e) => edit((d) => void (d.contact.form.sending = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 space-y-4">
              <Field label="Алдааны мессеж" hint="Ард нь утасны дугаар автоматаар нэмэгдэнэ.">
                <TextArea
                  rows={2}
                  value={c.contact.form.error}
                  onChange={(e) => edit((d) => void (d.contact.form.error = e.target.value))}
                />
              </Field>
              <Field label="Амжилтын гарчиг">
                <TextInput
                  value={c.contact.form.successTitle}
                  onChange={(e) => edit((d) => void (d.contact.form.successTitle = e.target.value))}
                />
              </Field>
              <Field label="Амжилтын тайлбар">
                <TextArea
                  rows={2}
                  value={c.contact.form.successBody}
                  onChange={(e) => edit((d) => void (d.contact.form.successBody = e.target.value))}
                />
              </Field>
            </div>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "managers":
      return (
        <>
          <Card title="Гарчиг">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kicker">
                <TextInput
                  value={c.managers.kicker}
                  onChange={(e) => edit((d) => void (d.managers.kicker = e.target.value))}
                />
              </Field>
              <Field label="Гарчиг">
                <TextInput
                  value={c.managers.title}
                  onChange={(e) => edit((d) => void (d.managers.title = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Тайлбар">
                <TextArea
                  rows={3}
                  value={c.managers.body}
                  onChange={(e) => edit((d) => void (d.managers.body = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Цагийн хуваарийн гарчиг">
                <TextInput
                  value={c.managers.hoursLabel}
                  onChange={(e) => edit((d) => void (d.managers.hoursLabel = e.target.value))}
                />
              </Field>
              <Field label="Цагийн хуваарь" hint="Ж: Даваа – Ням · 09:00 – 18:00">
                <TextInput
                  value={c.managers.hours}
                  onChange={(e) => edit((d) => void (d.managers.hours = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Залгах товч">
                <TextInput
                  value={c.managers.callLabel}
                  onChange={(e) => edit((d) => void (d.managers.callLabel = e.target.value))}
                />
              </Field>
              <Field label="Viber товч">
                <TextInput
                  value={c.managers.viberLabel}
                  onChange={(e) => edit((d) => void (d.managers.viberLabel = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Менежерүүд">
            <ListEditor
              items={c.managers.items}
              onChange={(next) => edit((d) => void (d.managers.items = next))}
              blank={() => ({
                name: "Шинэ менежер",
                initials: "",
                role: "Борлуулалтын менежер",
                phone: "",
                photo: "",
              })}
              title={(item) => item.name}
              addLabel="Менежер нэмэх"
            >
              {(item, set, i) => (
                <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
                  <ImageField
                    label="Хөрөг зураг"
                    value={item.photo}
                    onChange={(url) =>
                      edit((d) => {
                        // Байршуулалт async тул хамгийн сүүлийн төлөв дээр индексээр бичнэ.
                        const m = d.managers.items[i];
                        if (m) m.photo = url;
                      })
                    }
                    ratio="3/4"
                    maxEdge={900}
                    fit="contain"
                    hint="Дэвсгэрийг нь салгасан (тунгалаг) босоо хөрөг тохиромжтой. Хоосон бол товчлол бүхий дугуй харагдана."
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Нэр">
                      <TextInput value={item.name} onChange={(e) => set({ name: e.target.value })} />
                    </Field>
                    <Field label="Товчлол" hint="Зураггүй үед дугуйд гарах 2 үсэг.">
                      <TextInput value={item.initials} onChange={(e) => set({ initials: e.target.value })} />
                    </Field>
                    <Field label="Албан тушаал">
                      <TextInput value={item.role} onChange={(e) => set({ role: e.target.value })} />
                    </Field>
                    <Field label="Утас" hint="Ж: 8888-3374">
                      <TextInput value={item.phone} onChange={(e) => set({ phone: e.target.value })} />
                    </Field>
                  </div>
                </div>
              )}
            </ListEditor>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "faq":
      return (
        <>
          <Card title="Гарчиг">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kicker">
                <TextInput
                  value={c.faq.kicker}
                  onChange={(e) => edit((d) => void (d.faq.kicker = e.target.value))}
                />
              </Field>
              <Field label="Гарчиг">
                <TextInput
                  value={c.faq.title}
                  onChange={(e) => edit((d) => void (d.faq.title = e.target.value))}
                />
              </Field>
            </div>
          </Card>
          <Card title="Асуулт & хариулт">
            <ListEditor
              items={c.faq.items}
              onChange={(next) => edit((d) => void (d.faq.items = next))}
              blank={() => ({ q: "Шинэ асуулт?", a: "Хариулт." })}
              title={(item) => item.q}
              addLabel="Асуулт нэмэх"
            >
              {(item, set) => (
                <>
                  <Field label="Асуулт">
                    <TextInput value={item.q} onChange={(e) => set({ q: e.target.value })} />
                  </Field>
                  <Field label="Хариулт">
                    <TextArea rows={3} value={item.a} onChange={(e) => set({ a: e.target.value })} />
                  </Field>
                </>
              )}
            </ListEditor>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "news":
      return (
        <>
          <Card
            title="Мэдээний хуудас"
            right={
              <Link href="/admin/news" className="text-[13px] font-semibold text-[#2a5124] hover:underline">
                Нийтлэлүүд →
              </Link>
            }
          >
            <p className="mb-4 text-xs text-neutral-400">
              Энд зөвхөн <b>/news</b> хуудасны бэлэн текстийг засна. Нийтлэл өөрөө нэмэх,
              засах, устгах бол <b>Мэдээ</b> хэсэг рүү орно уу.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Цэсний нэр" hint="Толгой болон хөлний цэсэнд харагдана.">
                <TextInput
                  value={c.news.navLabel}
                  onChange={(e) => edit((d) => void (d.news.navLabel = e.target.value))}
                />
              </Field>
              <Field label="Kicker">
                <TextInput
                  value={c.news.kicker}
                  onChange={(e) => edit((d) => void (d.news.kicker = e.target.value))}
                />
              </Field>
              <Field label="Гарчиг">
                <TextInput
                  value={c.news.title}
                  onChange={(e) => edit((d) => void (d.news.title = e.target.value))}
                />
              </Field>
              <Field label="“Дэлгэрэнгүй” товч">
                <TextInput
                  value={c.news.readMore}
                  onChange={(e) => edit((d) => void (d.news.readMore = e.target.value))}
                />
              </Field>
              <Field label="Буцах холбоос">
                <TextInput
                  value={c.news.backLabel}
                  onChange={(e) => edit((d) => void (d.news.backLabel = e.target.value))}
                />
              </Field>
              <Field label="“Бусад мэдээ” гарчиг">
                <TextInput
                  value={c.news.moreTitle}
                  onChange={(e) => edit((d) => void (d.news.moreTitle = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 space-y-4">
              <Field label="Тайлбар">
                <TextArea
                  rows={3}
                  value={c.news.sub}
                  onChange={(e) => edit((d) => void (d.news.sub = e.target.value))}
                />
              </Field>
              <Field label="Мэдээ байхгүй үеийн текст">
                <TextArea
                  rows={2}
                  value={c.news.empty}
                  onChange={(e) => edit((d) => void (d.news.empty = e.target.value))}
                />
              </Field>
            </div>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "footer":
      return (
        <>
          <Card title="Баганын гарчгууд">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Борлуулалтын алба">
                <TextInput
                  value={c.footer.salesTitle}
                  onChange={(e) => edit((d) => void (d.footer.salesTitle = e.target.value))}
                />
              </Field>
              <Field label="Цэс">
                <TextInput
                  value={c.footer.menuTitle}
                  onChange={(e) => edit((d) => void (d.footer.menuTitle = e.target.value))}
                />
              </Field>
              <Field label="Сошиал">
                <TextInput
                  value={c.footer.socialTitle}
                  onChange={(e) => edit((d) => void (d.footer.socialTitle = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Доод тэмдэглэл">
                <TextInput
                  value={c.footer.note}
                  onChange={(e) => edit((d) => void (d.footer.note = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Хөлний цэс">
            <ListEditor
              items={c.footer.menu}
              onChange={(next) => edit((d) => void (d.footer.menu = next))}
              blank={() => ({ label: "Шинэ холбоос", href: "#" })}
              title={(item) => item.label}
              addLabel="Холбоос нэмэх"
            >
              {(item, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Нэр">
                    <TextInput value={item.label} onChange={(e) => set({ label: e.target.value })} />
                  </Field>
                  <Field label="Холбоос">
                    <TextInput value={item.href} onChange={(e) => set({ href: e.target.value })} />
                  </Field>
                </div>
              )}
            </ListEditor>
          </Card>

          <Card title="Сошиал холбоос">
            <p className="mb-4 text-xs text-neutral-500">
              Холбоос хоосон бол тухайн сошиал сайт дээр огт харагдахгүй — жинхэнэ хаягаа
              оруулсны дараа хөл хэсэг болон “Холбоо барих” хэсэгт гарч ирнэ.
            </p>
            <ListEditor
              items={c.footer.social}
              onChange={(next) => edit((d) => void (d.footer.social = next))}
              blank={() => ({ label: "Facebook", href: "", icon: "facebook" })}
              title={(item) => item.label}
              addLabel="Сошиал нэмэх"
            >
              {(item, set) => (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Нэр">
                    <TextInput value={item.label} onChange={(e) => set({ label: e.target.value })} />
                  </Field>
                  <Field label="Icon">
                    <Select value={item.icon} onChange={(e) => set({ icon: e.target.value })}>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">X (Twitter)</option>
                      <option value="link">Ерөнхий холбоос</option>
                    </Select>
                  </Field>
                  <Field label="Холбоос" hint="https://…">
                    <TextInput
                      value={item.href}
                      placeholder="https://www.facebook.com/…"
                      onChange={(e) => set({ href: e.target.value })}
                    />
                  </Field>
                </div>
              )}
            </ListEditor>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "chatbot":
      return (
        <>
          <Card title="Ерөнхий">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Нэр">
                <TextInput
                  value={c.chatbot.title}
                  onChange={(e) => edit((d) => void (d.chatbot.title = e.target.value))}
                />
              </Field>
              <Field label="Дэд гарчиг">
                <TextInput
                  value={c.chatbot.subtitle}
                  onChange={(e) => edit((d) => void (d.chatbot.subtitle = e.target.value))}
                />
              </Field>
            </div>
            <div className="mt-4 space-y-4">
              <Field label="Мэндчилгээ">
                <TextArea
                  rows={3}
                  value={c.chatbot.greeting}
                  onChange={(e) => edit((d) => void (d.chatbot.greeting = e.target.value))}
                />
              </Field>
              <Field label="Оролтын placeholder">
                <TextInput
                  value={c.chatbot.placeholder}
                  onChange={(e) => edit((d) => void (d.chatbot.placeholder = e.target.value))}
                />
              </Field>
              <Field label="Ойлгоогүй үеийн хариулт">
                <TextArea
                  rows={3}
                  value={c.chatbot.fallback}
                  onChange={(e) => edit((d) => void (d.chatbot.fallback = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Түргэн асуултууд">
            <StringListEditor
              items={c.chatbot.quick}
              onChange={(next) => edit((d) => void (d.chatbot.quick = next))}
              addLabel="Асуулт нэмэх"
              placeholder="Үнэ хэд вэ?"
            />
          </Card>

          <Card title="Хариултын сан">
            <p className="mb-3 text-xs text-neutral-400">
              Хэрэглэгчийн бичсэн үг түлхүүрүүдийн аль нэгийг агуулбал тухайн хариулт буцна.
              Дээрээс нь доош шалгана — тодорхой түлхүүрүүдийг эхэнд байрлуулаарай.
            </p>
            <ListEditor
              items={c.chatbot.answers}
              onChange={(next) => edit((d) => void (d.chatbot.answers = next))}
              blank={() => ({ keys: "", a: "" })}
              title={(item) => item.keys || "(түлхүүргүй)"}
              addLabel="Хариулт нэмэх"
            >
              {(item, set) => (
                <>
                  <Field label="Түлхүүр үгс" hint="Таслалаар тусгаарлана.">
                    <TextInput value={item.keys} onChange={(e) => set({ keys: e.target.value })} />
                  </Field>
                  <Field label="Хариулт">
                    <TextArea rows={3} value={item.a} onChange={(e) => set({ a: e.target.value })} />
                  </Field>
                </>
              )}
            </ListEditor>
          </Card>
        </>
      );

    /* ---------------------------------------------------------- */
    case "seo":
      return (
        <Card title="Хайлтын систем / нийгмийн сүлжээ">
          <Field label="Хуудасны гарчиг">
            <TextInput
              value={c.seo.title}
              onChange={(e) => edit((d) => void (d.seo.title = e.target.value))}
            />
          </Field>
          <div className="mt-4">
            <Field label="Тайлбар" hint="Google-д харагдах богино тайлбар (~160 тэмдэгт).">
              <TextArea
                rows={3}
                value={c.seo.description}
                onChange={(e) => edit((d) => void (d.seo.description = e.target.value))}
              />
            </Field>
          </div>
        </Card>
      );
  }
}
