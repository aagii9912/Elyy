"use client";

/* Үндсэн сайтын (`/`) контентын засварлагч.
   Зүүн талд хэсгүүдийн жагсаалт, баруун талд тухайн хэсгийн талбарууд.
   Хадгалахад `/api/admin/site` (PUT) руу бүтэн JSON илгээж, сервер тал
   өгөгдмөл бүтэц дээр давхарлаж цэвэрлээд хадгална. */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CLIP_AUTO,
  CLIP_NONE,
  STRUCTURE_CLIPS,
  cloneDefaultSiteContent,
  type SiteContent,
} from "@/lib/site-content";
import { externalHref } from "@/lib/links";
import { Button, Card, Field, FileField, ImageField, Select, TextArea, TextInput, Toggle } from "./ui";
import { DesignPanel } from "./DesignFields";
import { PinMapEditor } from "./PinMapEditor";

type SectionId =
  | "design"
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
  { id: "design", label: "🎨 Дизайн", hint: "Өнгө, типографи, дэвсгэр" },
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
  { id: "location", label: "Байршил", hint: "Агаарын рендер, дугаартай цэгүүд" },
  { id: "contact", label: "Холбоо барих", hint: "Утас, хаяг, маягт" },
  { id: "managers", label: "Борлуулалтын баг", hint: "Менежерүүд" },
  { id: "faq", label: "Түгээмэл асуулт", hint: "Асуулт & хариулт" },
  { id: "news", label: "Мэдээ (хуудасны текст)", hint: "Нийтлэлүүд → /admin/news" },
  { id: "footer", label: "Хөл хэсэг", hint: "Цэс, сошиал" },
  { id: "chatbot", label: "Чатбот", hint: "Мэндчилгээ, хариултууд" },
  { id: "seo", label: "SEO / мета", hint: "Хайлтын гарчиг, тайлбар" },
];

/* ------------------------------------------------------------------ */
/* Гадаад холбоосын талбар — сошиал, үйлдвэрлэгчийн хуудас             */
/* ------------------------------------------------------------------ */

/* Сошиал мөрүүдийн өгөгдмөл утга нэгэн үе "#" байсан тул хаягаа түүний
   АРД наахад "#https://www.facebook.com/…" болж, сайт дээр дарахад
   Facebook руу очихгүй зөвхөн хуудасны hash солигддог байв. Иймд:
     • фокус алдахад утгыг автоматаар цэвэрлэнэ (тэргүүн "#"-ийг авч,
       дутуу "https://"-ийг нөхнө),
     • доор нь ямар хаяг руу очихыг шууд харуулна. */

function linkHint(raw: string, empty: string): React.ReactNode {
  const value = (raw ?? "").trim();
  if (!value) return empty;
  const href = externalHref(value);
  if (!href)
    return (
      <span className="text-amber-600">
        Холбоос танигдахгүй байна — бүтэн хаягаа (https://…) оруулна уу. Ийм утга сайт дээр
        харагдахгүй.
      </span>
    );
  if (href !== value) return <span className="text-amber-600">Хадгалахад: {href}</span>;
  return "Шинэ табд нээгдэнэ.";
}

function LinkInput({
  value,
  onChange,
  placeholder = "https://…",
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      /* Бичиж байх үед бус, дуусахад л засна — курсор үсэрхгүй. */
      onBlur={(e) => {
        const fixed = externalHref(e.target.value);
        if (fixed && fixed !== e.target.value) onChange(fixed);
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Жагсаалт засварлагч — нэмэх / зөөх / устгах                         */
/* ------------------------------------------------------------------ */

/** Зургийн хувийн байрлал — 0–100 хооронд барина. Хоосон/буруу утга 0. */
function pct(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n * 10) / 10));
}

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
            <span className="rounded-md bg-neutral-200 px-2 py-0.5 text-label font-bold text-neutral-600">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 truncate text-body font-semibold text-neutral-700">
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
      if (section === "design") {
        draft.theme = defaults.theme;
        return;
      }
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
      // "design" нь `theme` талбарыг эзэмшинэ — бусад нь өөрийн нэрээр.
      if (s.id === "design") {
        if (!same(content.theme, defaults.theme)) ids.add(s.id);
        continue;
      }
      const storyKey = s.id === "plan" || s.id === "elys" || s.id === "equip" ? s.id : null;
      const navSame = !storyKey || content.storyNav[storyKey] === defaults.storyNav[storyKey];
      if (!same(content[s.id], defaults[s.id]) || !navSame) ids.add(s.id);
    }
    return ids;
  }, [content]);

  const body = useMemo(() => renderSection(section, content, edit), [section, content, edit]);

  return (
    /* Дизайны хэсэг нь хөшүүрэг + амьд preview хоёрыг зэрэгцүүлдэг тул
       илүү өргөн зай авна; бусад хэсэг уншихад тохиромжтой нарийхан. */
    <div className={`mx-auto px-4 py-8 ${section === "design" ? "max-w-[1700px]" : "max-w-6xl"}`}>
      {/* Наалдмал — дизайны самбар урт тул «Хадгалах» доош гүйхэд алга
          болох ёсгүй. `-mx-4 px-4` нь савны хажуугийн зайг нөхнө. */}
      <header className="sticky top-0 z-30 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur">
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
        <nav className="lg:sticky lg:top-[84px] lg:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {SECTIONS.map((s) => (
              <li key={s.id} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={`w-full whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-body font-semibold transition-colors lg:whitespace-normal ${
                    section === s.id
                      ? "bg-ink text-white"
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
                    className={`hidden text-label font-medium lg:block ${
                      section === s.id ? "text-white/70" : "text-neutral-400"
                    }`}
                  >
                    {s.hint}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 hidden text-label leading-relaxed text-neutral-400 lg:block">
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
    case "design":
      return (
        <DesignPanel
          theme={c.theme}
          onChange={(next) => edit((d) => void (d.theme = next))}
        />
      );

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
                  <Field
                    label="Тайлбар"
                    hint="« · » эсвэл « — » тэмдгээр хоёр хуваагдана: өмнөх нь ТОМ ҮСЭГТ нэр томьёо, ард нь энгийн бичвэр. Ж: «айлын орон сууц · 4 блок»."
                  >
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
              {/* Хэсгийн тайлбарыг хоёулаа ашиглана. "Дэлгэрэнгүй"
                  шошго нь зөвхөн ELYS-ийн accordion самбарт үлдсэн —
                  Барилгын бүтэц нь бүтэн дэлгэцийн слайд болсон тул
                  доод CTA-гийн текстээр удирдагдана. Эх сурвалжийн
                  холбоосын шошго нь Барилгын бүтэцд хамаарна. */}
              <Field
                label="Хэсгийн тайлбар"
                hint={
                  key === "equip" ? (
                    <span className="text-amber-600">
                      Энэ текст Барилгын бүтэц хэсэгт ОДООГООР ХАРАГДАХГҮЙ. Слайдын гарчиг,
                      тайлбар нь доорх «Зүйлүүд» хэсгээс удирдагдана.
                    </span>
                  ) : undefined
                }
              >
                <TextArea
                  rows={2}
                  value={c[key].body}
                  onChange={(e) => edit((d) => void (d[key].body = e.target.value))}
                />
              </Field>
              {key === "elys" && (
                <Field label="Самбарын “дэлгэрэнгүй” текст">
                  <TextInput
                    value={c.elys.moreLabel}
                    onChange={(e) => edit((d) => void (d.elys.moreLabel = e.target.value))}
                  />
                </Field>
              )}
              {key === "equip" && (
                <Field label="Pop-up доторх холбоосын текст">
                  <TextInput
                    value={c.equip.sourceLabel}
                    onChange={(e) => edit((d) => void (d.equip.sourceLabel = e.target.value))}
                  />
                </Field>
              )}
              {key === "equip" && (
                <Field
                  label="Доод CTA-гийн текст"
                  hint="Бүтэн дэлгэцийн слайдын доод зурвас дээрх товч — идэвхтэй материалын pop-up-ыг нээнэ."
                >
                  <TextInput
                    value={c.equip.ctaLabel}
                    onChange={(e) => edit((d) => void (d.equip.ctaLabel = e.target.value))}
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
                blank={() => ({ title: "Гарчиг", body: "Тайлбар.", link: "", image: "", logo: "", video: "" })}
                title={(item) => item.title}
                addLabel="Зүйл нэмэх"
              >
                {(item, set, itemIndex) => (
                  <>
                    <Field label="Гарчиг">
                      <TextInput value={item.title} onChange={(e) => set({ title: e.target.value })} />
                    </Field>
                    <Field label="Тайлбар" hint="Слайдын баруун дээд буланд болон pop-up дотор бүтнээрээ харагдана.">
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
                      ratio="16/9"
                      maxEdge={2000}
                      hint="Бүтэн дэлгэцийн дэвсгэр, thumbnail болон pop-up-ын зураг. Өргөн хэвтээ зураг тохиромжтой. Брэндийн логог ЭНД БҮҮ оруул — доор нь тусдаа талбар бий."
                    />
                    <ImageField
                      label="Брэндийн лого (заавал биш)"
                      value={item.logo}
                      onChange={(url) =>
                        edit((d) => {
                          const it = d.equip.items[itemIndex];
                          if (it) it.logo = url;
                        })
                      }
                      ratio="16/9"
                      maxEdge={600}
                      hint="Слайдын доод зурваст ЦАГААН тавцан дээр, мөн дэлгэрэнгүй pop-up дотор гарна — тиймээс бараан/өнгөт лого тохиромжтой (цагаан лого харагдахгүй). Тунгалаг дэвсгэртэй PNG/SVG хамгийн зөв."
                    />
                    <Field
                      label="Дэвсгэр клип"
                      hint="Слайдын ард дуугүй давтагдана. «Автомат» үед барилгын үе шатны дарааллаар өөрөө оногдоно — гэхдээ дээрх «Зураг»-ийг тохируулсан слайдад клип тоглохгүй."
                    >
                      <Select
                        value={item.video}
                        onChange={(e) => set({ video: e.target.value })}
                      >
                        <option value={CLIP_AUTO}>Автомат (үе шатны дарааллаар)</option>
                        <option value={CLIP_NONE}>Клипгүй — зөвхөн зураг</option>
                        {STRUCTURE_CLIPS.map((clip) => (
                          <option key={clip.value} value={clip.value}>
                            {clip.label}
                          </option>
                        ))}
                        {/* Гараар бичсэн танихгүй хаяг байвал алдагдуулахгүй. */}
                        {item.video &&
                          item.video !== CLIP_NONE &&
                          !STRUCTURE_CLIPS.some((clip) => clip.value === item.video) && (
                            <option value={item.video}>{item.video}</option>
                          )}
                      </Select>
                    </Field>
                    <Field
                      label="Холбоос"
                      hint={linkHint(item.link, "Үйлдвэрлэгчийн хуудас. Хоосон бол линк харагдахгүй.")}
                    >
                      <LinkInput value={item.link} onChange={(link) => set({ link })} />
                    </Field>
                  </>
                )}
              </ListEditor>
            ) : (
              <ListEditor
                items={c.elys.items}
                onChange={(next) => edit((d) => void (d.elys.items = next))}
                blank={() => ({ title: "Гарчиг", body: "Тайлбар.", image: "" })}
                title={(item) => item.title}
                addLabel="Зүйл нэмэх"
              >
                {(item, set, itemIndex) => (
                  <>
                    <Field label="Гарчиг" hint="Эхний үсэг нь самбар дээрх E · L · Y · S тэмдэг болно.">
                      <TextInput value={item.title} onChange={(e) => set({ title: e.target.value })} />
                    </Field>
                    <Field label="Тайлбар">
                      <TextArea rows={3} value={item.body} onChange={(e) => set({ body: e.target.value })} />
                    </Field>
                    <ImageField
                      label="Самбарын зураг"
                      value={item.image}
                      onChange={(url) =>
                        edit((d) => {
                          const it = d.elys.items[itemIndex];
                          if (it) it.image = url;
                        })
                      }
                      ratio="4/3"
                      maxEdge={1600}
                      hint="Самбарын дэвсгэр, мөн дэлгэрэнгүй pop-up-ын толгой зураг. Самбар нь хураангуй үедээ НАРИЙН босоо зурвас болдог тул гол зүйл нь зургийн голд байх нь зөв. Хоосон орхивол өгөгдмөл рендер (эргономик · ногоон орчин · хяналтын төв · фасад) дарааллаараа орно."
                    />
                  </>
                )}
              </ListEditor>
            )}
          </Card>
          {/* Тоноглолын жагсаалт — зөвхөн Барилгын бүтэц. Слайдын гурван
              үндсэн бүтээцээс ЯЛГААТАЙ: энд лифт, агаар сэлгэлт зэрэг
              бүх инженерийн тоноглол багтана. */}
          {key === "equip" && (
            <Card title="Тоноглолын жагсаалт (CTA-гийн pop-up)">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pop-up-ын гарчиг">
                  <TextInput
                    value={c.equip.equipment.title}
                    onChange={(e) => edit((d) => void (d.equip.equipment.title = e.target.value))}
                  />
                </Field>
                <Field label="Pop-up-ын тайлбар">
                  <TextArea
                    rows={2}
                    value={c.equip.equipment.body}
                    onChange={(e) => edit((d) => void (d.equip.equipment.body = e.target.value))}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <ListEditor
                  items={c.equip.equipment.items}
                  onChange={(next) => edit((d) => void (d.equip.equipment.items = next))}
                  blank={() => ({ category: "Тоноглол", brand: "", meta: "", flag: "", logo: "", image: "", note: "" })}
                  title={(item) => [item.category, item.brand].filter(Boolean).join(" · ")}
                  addLabel="Тоноглол нэмэх"
                >
                  {(item, set, itemIndex) => (
                    <>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="Ангилал" hint="Ж: Ханын залгуур">
                          <TextInput
                            value={item.category}
                            onChange={(e) => set({ category: e.target.value })}
                          />
                        </Field>
                        <Field label="Брэнд" hint="Хоосон бол картан дээр зөвхөн ангилал гарна.">
                          <TextInput value={item.brand} onChange={(e) => set({ brand: e.target.value })} />
                        </Field>
                        <Field
                          label="Улс"
                          hint="Ж: Герман. Турк / Франц / Герман / Солонгос / Япон гэж бичвэл далбаа нь автоматаар гарна."
                        >
                          <TextInput value={item.meta} onChange={(e) => set({ meta: e.target.value })} />
                        </Field>
                      </div>
                      <Field label="Тайлбар (заавал биш)" hint="Картан дээр 2 мөр харагдана.">
                        <TextArea rows={2} value={item.note} onChange={(e) => set({ note: e.target.value })} />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <ImageField
                          label="Тоноглолын зураг (заавал биш)"
                          value={item.image}
                          onChange={(url) =>
                            edit((d) => {
                              const it = d.equip.equipment.items[itemIndex];
                              if (it) it.image = url;
                            })
                          }
                          ratio="4/3"
                          maxEdge={900}
                          hint="Картыг БҮТНЭЭР дүүргэж, зүүн тал нь цагаан руу уусна (бичвэр уншигдана). Материалын бүтэц/өнгө харагдуулсан ӨРГӨН хэвтээ зураг тохиромжтой — гол зүйл нь БАРУУН талдаа байг, зүүн тал нь хөшигдөнө. Лого ЭНД БҮҮ оруул — хажууд нь тусдаа талбар бий. Хоосон бол карт цагаан суурьтай үлдэнэ (өндөр нь хэвээр)."
                        />
                        <ImageField
                          label="Лого (заавал биш)"
                          value={item.logo}
                          onChange={(url) =>
                            edit((d) => {
                              const it = d.equip.equipment.items[itemIndex];
                              if (it) it.logo = url;
                            })
                          }
                          ratio="16/9"
                          maxEdge={600}
                          fit="contain"
                          hint="Картын БАРУУН талд, материалын зураг дээр сууна — тиймээс ЦАГААН (цайвар) тунгалаг PNG/SVG тохиромжтой. Зураггүй карт дээр цагаан лого алга болохгүйн тулд бараан тавцан дээр суудаг. Хоосон бол брэндийн нэр өөрөө тэмдэг болно."
                        />
                      </div>
                      <div className="mt-4 sm:w-1/2 sm:pr-2">
                        <ImageField
                          label="Улсын далбаа (заавал биш)"
                          value={item.flag}
                          onChange={(url) =>
                            edit((d) => {
                              const it = d.equip.equipment.items[itemIndex];
                              if (it) it.flag = url;
                            })
                          }
                          ratio="3/2"
                          maxEdge={240}
                          hint="Зөвхөн дээрх 5 улсаас ГАДУУР улс бичсэн үед хэрэгтэй. Картан дээр 3:2 хайрцагт ТАЙРАГДАЖ сууна (энэ талбарын харагдац ч мөн адил) — тиймээс 3:2-т ойрхон далбаа тавь. Улсын нэр бичээгүй байсан ч далбаа гарна. Хоосон бол улсын нэрээр дотоод далбаа таарна."
                        />
                      </div>
                    </>
                  )}
                </ListEditor>
              </div>
            </Card>
          )}
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
              blank={() => ({
                title: "Шинэ тип",
                rooms: "1 өрөө",
                area: "",
                block: "",
                thumb: "",
                views: [],
                floorPlan: "",
                plan: { code: "", floors: "", facing: "", spot: "", rooms: [] },
              })}
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
                      <span className="mb-1.5 block text-body font-semibold text-neutral-700">
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

                    {/* Lightbox-ын хажуугийн самбар — сайт дээр зургийн
                        баруун талд яг энэ дарааллаар гарна. */}
                    <div className="rounded-lg border border-neutral-200 bg-white p-3">
                      <span className="mb-1.5 block text-body font-semibold text-neutral-700">
                        Төлөвлөгөөний тайлбар (томруулсан зургийн хажууд)
                      </span>
                      <p className="mb-3 text-label text-neutral-500">
                        Бүх талбар хоосон бол самбар огт гарахгүй, зураг бүтэн зайг эзэлнэ.
                      </p>
                      <ImageField
                        label="Давхрын хуваалт"
                        value={item.floorPlan}
                        onChange={(url) => editUnit((u) => void (u.floorPlan = url))}
                        ratio="7/6"
                        maxEdge={1400}
                        fit="contain"
                        hint="Тухайн айлыг тодруулсан бүтэн давхрын зураг — тайлбарын дээр гарна."
                      />
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <Field label="Хуваалтын дугаар">
                          <TextInput
                            value={item.plan.code}
                            placeholder="E-3"
                            onChange={(e) => editUnit((u) => void (u.plan.code = e.target.value))}
                          />
                        </Field>
                        <Field label="Давхар">
                          <TextInput
                            value={item.plan.floors}
                            placeholder="3–23 давхар"
                            onChange={(e) => editUnit((u) => void (u.plan.floors = e.target.value))}
                          />
                        </Field>
                        <Field label="Цонхны чиг">
                          <TextInput
                            value={item.plan.facing}
                            placeholder="Зүүн, хойд"
                            onChange={(e) => editUnit((u) => void (u.plan.facing = e.target.value))}
                          />
                        </Field>
                      </div>
                      <div className="mt-3">
                        <Field label="Байрлалын тайлбар" hint="Нэг өгүүлбэр — барилга дээрх байрлал.">
                          <TextArea
                            rows={2}
                            value={item.plan.spot}
                            onChange={(e) => editUnit((u) => void (u.plan.spot = e.target.value))}
                          />
                        </Field>
                      </div>
                      <span className="mb-1.5 mt-4 block text-body font-semibold text-neutral-700">
                        Өрөөний задаргаа
                      </span>
                      <div className="space-y-2">
                        {item.plan.rooms.map((room, ri) => (
                          <div key={ri} className="flex items-center gap-2">
                            <span className="w-6 shrink-0 text-label font-bold text-neutral-400">{ri + 1}.</span>
                            <TextInput
                              value={room.name}
                              placeholder="Зочны өрөө"
                              onChange={(e) => editUnit((u) => void (u.plan.rooms[ri].name = e.target.value))}
                            />
                            <TextInput
                              value={room.area}
                              placeholder="19.91"
                              className="w-28 shrink-0"
                              onChange={(e) => editUnit((u) => void (u.plan.rooms[ri].area = e.target.value))}
                            />
                            <span className="shrink-0 text-label text-neutral-500">м²</span>
                            <button
                              type="button"
                              onClick={() => editUnit((u) => void u.plan.rooms.splice(ri, 1))}
                              aria-label="Өрөө устгах"
                              className="rounded-md px-2 py-1 text-sm font-semibold text-red-500 hover:bg-red-50"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-3"
                        onClick={() => editUnit((u) => void u.plan.rooms.push({ name: "", area: "" }))}
                      >
                        + Өрөө нэмэх
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
            <div className="grid gap-4 sm:grid-cols-2">
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

          <Card title="Төслийн байршил">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Гарчиг">
                <TextInput
                  value={c.location.tabs.project.title}
                  onChange={(e) => edit((d) => void (d.location.tabs.project.title = e.target.value))}
                />
              </Field>
              <Field label="Зургийн alt" hint="Зураг ачаалагдаагүй үед болон дэлгэц уншигчид">
                <TextInput
                  value={c.location.tabs.project.label}
                  onChange={(e) => edit((d) => void (d.location.tabs.project.label = e.target.value))}
                />
              </Field>
              <Field label="Хаяг">
                <TextInput
                  value={c.location.tabs.project.address}
                  onChange={(e) => edit((d) => void (d.location.tabs.project.address = e.target.value))}
                />
              </Field>
              <Field label="Координат" hint="Өргөрөг,уртраг — ж: 47.897,106.885">
                <TextInput
                  value={c.location.tabs.project.coords}
                  onChange={(e) => edit((d) => void (d.location.tabs.project.coords = e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Байршлын зураг">
            <ImageField
              label="Агаарын рендер"
              value={c.location.mapImage}
              onChange={(url) => edit((d) => void (d.location.mapImage = url))}
              ratio="16/9"
              maxEdge={2400}
              hint="Дугаартай цэгүүд ЯГ энэ зураг дээр буудаг — зургаа сольбол доорх цэгүүдийн X/Y-г дахин тааруулна уу."
            />
          </Card>

          <Card title="Зураг дээрх цэгүүд">
            <PinMapEditor
              image={c.location.mapImage}
              pins={c.location.pins}
              onChange={(next) => edit((d) => void (d.location.pins = next))}
            />
            <div className="mt-5 border-t border-neutral-200 pt-5" />
            <ListEditor
              items={c.location.pins}
              onChange={(next) => edit((d) => void (d.location.pins = next))}
              blank={() => ({
                place: "Шинэ цэг",
                description: "",
                distance: "",
                unit: "м",
                image: "",
                x: 50,
                y: 50,
              })}
              title={(item) =>
                item.distance ? `${item.place} · ${item.distance}${item.unit}` : item.place
              }
              addLabel="Цэг нэмэх"
            >
              {(item, set, i) => (
                <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
                  <ImageField
                    label="Байршлын зураг"
                    value={item.image}
                    onChange={(url) =>
                      edit((d) => {
                        // Байршуулалт async тул хамгийн сүүлийн төлөв дээр индексээр бичнэ.
                        const pin = d.location.pins[i];
                        if (pin) pin.image = url;
                      })
                    }
                    ratio="1/1"
                    maxEdge={800}
                    hint="Курсор цэг дээр очиход картын баруун талд гарна. Хоосон бол карт зөвхөн бичигтэй үлдэнэ."
                  />
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Нэршил" hint="Картын гарчиг болон цэгийн тайлбар">
                        <TextInput
                          value={item.place}
                          onChange={(e) => set({ place: e.target.value })}
                        />
                      </Field>
                      <div className="grid grid-cols-[1fr_7rem] gap-3">
                        <Field label="Elysium-ээс хол зай" hint="Зөвхөн тоо — ж: 450 эсвэл 1.2">
                          <TextInput
                            inputMode="decimal"
                            value={item.distance}
                            onChange={(e) => set({ distance: e.target.value })}
                          />
                        </Field>
                        <Field label="Нэгж">
                          <Select
                            value={item.unit}
                            onChange={(e) => set({ unit: e.target.value })}
                          >
                            <option value="м">м</option>
                            <option value="км">км</option>
                          </Select>
                        </Field>
                      </div>
                    </div>
                    <Field label="Тайлбар" hint="Нэрний доор гарна — хоосон бол огт харагдахгүй">
                      <TextArea
                        rows={2}
                        value={item.description}
                        onChange={(e) => set({ description: e.target.value })}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
                      <Field label="X (%)" hint="Зүүн ирмэгээс">
                        <TextInput
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={item.x}
                          onChange={(e) => set({ x: pct(e.target.value) })}
                        />
                      </Field>
                      <Field label="Y (%)" hint="Дээд ирмэгээс">
                        <TextInput
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={item.y}
                          onChange={(e) => set({ y: pct(e.target.value) })}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
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
              <Link href="/admin/news" className="text-body font-semibold text-ink hover:underline">
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
                  <Field
                    label="Холбоос"
                    hint={linkHint(item.href, "https://… — хоосон бол сайт дээр харагдахгүй.")}
                  >
                    <LinkInput
                      value={item.href}
                      placeholder="https://www.facebook.com/…"
                      onChange={(href) => set({ href })}
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
