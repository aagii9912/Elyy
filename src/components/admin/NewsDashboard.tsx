"use client";

/* Мэдээний удирдлага — жагсаалт, шинээр үүсгэх, хэвлэх/ноорог,
   устгах, засварлагч руу шилжих. */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatNewsDate, type NewsDoc } from "@/lib/news";
import { Button, TextInput } from "./ui";

export function NewsDashboard({ initialNews }: { initialNews: NewsDoc[] }) {
  const router = useRouter();
  const [news, setNews] = useState<NewsDoc[]>(initialNews);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const create = async () => {
    const t = title.trim();
    if (!t || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) router.push(`/admin/news/${json.news.id}`);
      else setErr(json?.error || "Үүсгэж чадсангүй.");
    } catch {
      setErr("Сүлжээний алдаа.");
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (item: NewsDoc) => {
    const next = item.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/admin/news/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setNews((list) => list.map((n) => (n.id === item.id ? { ...n, status: next } : n)));
  };

  const remove = async (item: NewsDoc) => {
    if (!confirm(`"${item.title}" мэдээг устгах уу?`)) return;
    const res = await fetch(`/api/admin/news/${item.id}`, { method: "DELETE" });
    if (res.ok) setNews((list) => list.filter((n) => n.id !== item.id));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Мэдээ</h1>
          <p className="text-sm text-neutral-500">Сайтын “Мэдээ” хэсгийн нийтлэлүүд</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Link href="/admin">
            <Button variant="ghost" type="button">← Админ</Button>
          </Link>
          <a href="/news" target="_blank" rel="noreferrer">
            <Button variant="ghost" type="button">Мэдээний хуудас ↗</Button>
          </a>
        </div>
      </header>

      {/* create */}
      <div className="mb-8 flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <TextInput
          placeholder="Шинэ мэдээний гарчиг"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <Button
          variant="primary"
          type="button"
          onClick={create}
          disabled={busy || !title.trim()}
          className="sm:w-auto sm:whitespace-nowrap"
        >
          {busy ? "Үүсгэж байна…" : "+ Мэдээ нэмэх"}
        </Button>
      </div>
      {err && <p className="-mt-5 mb-6 text-sm font-semibold text-red-600">{err}</p>}

      {/* list */}
      {news.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
          <p className="text-neutral-500">Одоогоор мэдээ алга.</p>
          <p className="mt-1 text-sm text-neutral-400">
            Дээрх талбарт гарчиг бичээд эхний мэдээгээ нэмээрэй.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {news.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              {item.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover}
                  alt=""
                  className="h-14 w-20 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-[10px] text-neutral-400">
                  зураггүй
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-neutral-900">{item.title}</h2>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      item.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.status === "published" ? "Нийтэлсэн" : "Ноорог"}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-neutral-400">
                  <a
                    href={`/news/${item.slug}${item.status === "published" ? "" : "?preview=1"}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#2a5124] hover:underline"
                  >
                    /news/{item.slug} ↗
                  </a>
                  <span>{formatNewsDate(item.date)}</span>
                  {item.tag && <span>{item.tag}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" type="button" onClick={() => togglePublish(item)}>
                  {item.status === "published" ? "Ноорог" : "Нийтлэх"}
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => router.push(`/admin/news/${item.id}`)}
                >
                  Засах
                </Button>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  aria-label="Устгах"
                  className="rounded-lg px-2.5 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
