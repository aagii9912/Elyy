"use client";

/* Нэг мэдээний засварлагч — гарчиг, slug, огноо, шошго, нүүр зураг,
   товч танилцуулга, агуулга. Агуулга нь энгийн текст: хоосон мөр =
   шинэ догол мөр, `## ` = дэд гарчиг, `- ` = жагсаалт,
   `![тайлбар](URL)` = нийтлэлийн дунд орох зураг. */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { newsImageMarkup, parseNewsBody, type NewsDoc, type NewsImageSize } from "@/lib/news";
import { Button, Card, Field, ImageField, TextArea, TextInput } from "./ui";
import { uploadFile } from "./upload";

type Draft = Pick<NewsDoc, "title" | "slug" | "excerpt" | "cover" | "tag" | "date" | "body" | "status">;

const toDraft = (n: NewsDoc): Draft => ({
  title: n.title,
  slug: n.slug,
  excerpt: n.excerpt,
  cover: n.cover,
  tag: n.tag,
  date: n.date,
  body: n.body,
  status: n.status,
});

export function NewsEditor({ initial }: { initial: NewsDoc }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(toDraft(initial));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const bodyFileRef = useRef<HTMLInputElement>(null);
  /** Аль товчоор файл сонгож эхэлснийг санана (нэг л <input type=file>). */
  const pendingSize = useRef<NewsImageSize>("normal");
  const [imgBusy, setImgBusy] = useState(false);
  const [imgErr, setImgErr] = useState<string | null>(null);

  const set = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
    setMsg(null);
  };

  /** Зургийн тэмдэглэгээг курсорын байрлалд, өөрийн мөрөнд нь оруулна.
   *  `size` нь нийтлэл дээрх өргөнийг тодорхойлно (багана / өргөн /
   *  дэлгэц дүүрэн) — тэмдэглэгээг гараар ч засаж болно. */
  const insertImage = (url: string, size: NewsImageSize = "normal") => {
    const el = bodyRef.current;
    const markup = newsImageMarkup(url, "", size);
    setDraft((d) => {
      const at = el ? el.selectionStart : d.body.length;
      const head = d.body.slice(0, at).replace(/\s+$/, "");
      const tail = d.body.slice(at).replace(/^\s+/, "");
      const body = `${head}${head ? "\n\n" : ""}${markup}${tail ? `\n\n${tail}` : "\n"}`;
      // Курсорыг оруулсан мөрийн ард нь буцаана.
      const caret = (head ? head.length + 2 : 0) + markup.length;
      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(caret, caret);
      });
      return { ...d, body };
    });
    setDirty(true);
    setMsg(null);
  };

  const addBodyImage = async (file: File, size: NewsImageSize) => {
    setImgBusy(true);
    setImgErr(null);
    const res = await uploadFile(file);
    if (res.ok) insertImage(res.url, size);
    else setImgErr(res.error);
    setImgBusy(false);
  };

  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const save = async (override?: Partial<Draft>) => {
    if (busy) return;
    const payload = { ...draft, ...override };
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/news/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setDraft(toDraft(json.news as NewsDoc));
        setDirty(false);
        setMsg({ kind: "ok", text: "Хадгаллаа." });
        router.refresh();
      } else {
        setMsg({ kind: "err", text: json?.error || "Хадгалж чадсангүй." });
      }
    } catch {
      setMsg({ kind: "err", text: "Сүлжээний алдаа." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`"${draft.title}" мэдээг устгах уу?`)) return;
    const res = await fetch(`/api/admin/news/${initial.id}`, { method: "DELETE" });
    if (res.ok) {
      setDirty(false);
      router.push("/admin/news");
    }
  };

  const published = draft.status === "published";
  const blocks = parseNewsBody(draft.body);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold tracking-tight text-neutral-900">
            {draft.title || "Мэдээ"}
          </h1>
          <p className="text-sm text-neutral-500">
            /news/{draft.slug} · {published ? "Нийтэлсэн" : "Ноорог"}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Link href="/admin/news">
            <Button variant="ghost" type="button">← Мэдээ</Button>
          </Link>
          <a href={`/news/${draft.slug}${published ? "" : "?preview=1"}`} target="_blank" rel="noreferrer">
            <Button variant="ghost" type="button">Урьдчилж үзэх ↗</Button>
          </a>
          <Button
            variant="dark"
            type="button"
            disabled={busy}
            onClick={() => {
              const next: Draft["status"] = published ? "draft" : "published";
              set({ status: next });
              save({ status: next });
            }}
          >
            {published ? "Нооргт буцаах" : "Нийтлэх"}
          </Button>
          <Button variant="primary" type="button" onClick={() => save()} disabled={busy || !dirty}>
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

      <div className="space-y-5">
        <Card title="Үндсэн мэдээлэл">
          <Field label="Гарчиг">
            <TextInput value={draft.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Slug" hint="Хаяг: /news/<slug>">
              <TextInput value={draft.slug} onChange={(e) => set({ slug: e.target.value })} />
            </Field>
            <Field label="Огноо" hint="ЖЖЖЖ-СС-ӨӨ">
              <TextInput type="date" value={draft.date} onChange={(e) => set({ date: e.target.value })} />
            </Field>
            <Field label="Шошго" hint="Ж: Төслийн явц">
              <TextInput value={draft.tag} onChange={(e) => set({ tag: e.target.value })} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Товч танилцуулга" hint="Жагсаалт болон хуваалцахад харагдана.">
              <TextArea rows={3} value={draft.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card title="Нүүр зураг">
          <ImageField
            label="Зураг"
            value={draft.cover}
            onChange={(url) => set({ cover: url })}
            ratio="16/9"
            maxEdge={1600}
            hint="Жагсаалтын карт болон нийтлэлийн толгойд харагдана. Сошиалд хуваалцахад ч энэ зураг гарна."
          />
        </Card>

        <Card title="Агуулга">
          <Field
            label="Текст"
            hint="Хоосон мөр = шинэ догол мөр · “## ” = дэд гарчиг · “- ” = жагсаалтын мөр · “![тайлбар](зургийн-хаяг)” = зураг · араас нь “{wide}” эсвэл “{full}” бичвэл зураг өргөсөнө."
          >
            <TextArea
              ref={bodyRef}
              rows={18}
              value={draft.body}
              onChange={(e) => set({ body: e.target.value })}
              className="font-mono text-[13px] leading-relaxed"
            />
          </Field>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              ref={bodyFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) addBodyImage(f, pendingSize.current);
                e.target.value = "";
              }}
            />
            {(
              [
                ["normal", "Зураг оруулах"],
                ["wide", "Өргөн зураг"],
                ["full", "Дэлгэц дүүрэн"],
              ] as const
            ).map(([size, label]) => (
              <Button
                key={size}
                type="button"
                variant="ghost"
                disabled={imgBusy}
                onClick={() => {
                  pendingSize.current = size;
                  bodyFileRef.current?.click();
                }}
              >
                {imgBusy ? "Байршуулж байна…" : label}
              </Button>
            ))}
            <span className="text-xs text-neutral-400">
              Курсорын байрлалд — текстийн дурын хооронд — нэмэгдэнэ. Тайлбарыг “![…]” дотор бичнэ.
            </span>
          </div>
          {imgErr && <p className="mt-2 text-xs text-red-500">{imgErr}</p>}
        </Card>

        <Card title="Урьдчилсан харагдац">
          {blocks.length === 0 ? (
            <p className="text-sm text-neutral-400">Агуулга хоосон байна.</p>
          ) : (
            <div className="space-y-4">
              {blocks.map((b, i) =>
                b.kind === "heading" ? (
                  <h3 key={i} className="text-lg font-bold text-neutral-900">
                    {b.text}
                  </h3>
                ) : b.kind === "list" ? (
                  <ul key={i} className="list-disc space-y-1 pl-5 text-[15px] text-neutral-700">
                    {b.items.map((li, j) => (
                      <li key={j}>{li}</li>
                    ))}
                  </ul>
                ) : b.kind === "image" ? (
                  <figure key={i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.src}
                      alt={b.caption}
                      className="w-full rounded-lg border border-neutral-200"
                    />
                    {b.caption && (
                      <figcaption className="mt-1.5 text-xs text-neutral-400">{b.caption}</figcaption>
                    )}
                  </figure>
                ) : (
                  <p key={i} className="text-[15px] leading-relaxed text-neutral-700">
                    {b.text}
                  </p>
                )
              )}
            </div>
          )}
        </Card>

        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-5">
          <Button variant="primary" type="button" onClick={() => save()} disabled={busy || !dirty}>
            {busy ? "Хадгалж байна…" : "Хадгалах"}
          </Button>
          <Button variant="danger" type="button" onClick={remove}>
            Мэдээг устгах
          </Button>
        </div>
      </div>
    </div>
  );
}
