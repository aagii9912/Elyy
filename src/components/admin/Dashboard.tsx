"use client";

/* Админ самбар — эвентүүдийн жагсаалт, шинээр үүсгэх, хэвлэх/ноорог,
   устгах, засварлагч руу шилжих. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventDoc } from "@/lib/events";
import { Button, TextInput } from "./ui";

function fmtDate(iso: string): string {
  // Тогтвортой (locale-агностик) огноо — hydration зөрүүгүй.
  return iso.slice(0, 16).replace("T", " ");
}

export function Dashboard({
  initialEvents,
  storeMode,
  authDisabled,
}: {
  initialEvents: EventDoc[];
  storeMode: "supabase" | "local";
  authDisabled: boolean;
}) {
  const router = useRouter();
  const [events, setEvents] = useState<EventDoc[]>(initialEvents);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const create = async () => {
    const n = name.trim();
    if (!n || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) router.push(`/admin/events/${json.event.id}`);
      else setErr(json?.error || "Үүсгэж чадсангүй.");
    } catch {
      setErr("Сүлжээний алдаа.");
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (ev: EventDoc) => {
    const next = ev.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/admin/events/${ev.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setEvents((list) => list.map((e) => (e.id === ev.id ? { ...e, status: next } : e)));
  };

  const remove = async (ev: EventDoc) => {
    if (!confirm(`"${ev.name}" эвентийг устгах уу?`)) return;
    const res = await fetch(`/api/admin/events/${ev.id}`, { method: "DELETE" });
    if (res.ok) setEvents((list) => list.filter((e) => e.id !== ev.id));
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* header */}
      <header className="mb-8 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Elysium — Админ</h1>
          <p className="text-sm text-neutral-500">Сайтын контент, мэдээ, эвентийн landing page удирдлага</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="primary" type="button" onClick={() => router.push("/admin/site")}>
            Сайтын контент
          </Button>
          <Button variant="primary" type="button" onClick={() => router.push("/admin/news")}>
            Мэдээ
          </Button>
          <Button variant="dark" type="button" onClick={() => router.push("/admin/leads")}>
            Бүртгэл
          </Button>
          <a href="/" target="_blank" rel="noreferrer">
            <Button variant="ghost" type="button">Үндсэн сайт ↗</Button>
          </a>
          {!authDisabled && (
            <Button variant="ghost" type="button" onClick={logout}>Гарах</Button>
          )}
        </div>
      </header>

      {authDisabled && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          ⚠ Нэвтрэлт идэвхгүй (ADMIN_PASSWORD тохируулаагүй). Хэн ч энэ хуудсанд орж болно — production-д заавал нууц үг тохируулна уу.
        </div>
      )}
      {storeMode === "local" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Локал горим: өгөгдөл <code>.data/events.json</code>, зураг <code>public/uploads/</code>-д хадгалагдана.
          Production (Vercel)-д Supabase-г тохируулна уу — <code>docs/admin-setup.md</code>.
        </div>
      )}

      {/* create */}
      <div className="mb-8 flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <TextInput
          placeholder="Шинэ эвентийн нэр (ж: Elysium VIP үзэсгэлэн)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <Button variant="primary" type="button" onClick={create} disabled={busy || !name.trim()} className="sm:w-auto">
          {busy ? "Үүсгэж байна…" : "+ Эвент үүсгэх"}
        </Button>
      </div>
      {err && <p className="-mt-5 mb-6 text-sm font-semibold text-red-600">{err}</p>}

      {/* list */}
      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
          <p className="text-neutral-500">Одоогоор эвент алга.</p>
          <p className="mt-1 text-sm text-neutral-400">Дээрх талбарт нэр бичээд эхний эвентээ үүсгээрэй.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-neutral-900">{ev.name}</h2>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      ev.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {ev.status === "published" ? "Хэвлэгдсэн" : "Ноорог"}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-neutral-400">
                  <a href={`/${ev.slug}?preview=1`} target="_blank" rel="noreferrer" className="font-medium text-[#2a5124] hover:underline">
                    /{ev.slug} ↗
                  </a>
                  <span>Шинэчилсэн: {fmtDate(ev.updatedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" type="button" onClick={() => togglePublish(ev)}>
                  {ev.status === "published" ? "Ноорог" : "Хэвлэх"}
                </Button>
                <Button variant="primary" type="button" onClick={() => router.push(`/admin/events/${ev.id}`)}>
                  Засах
                </Button>
                <button
                  type="button"
                  onClick={() => remove(ev)}
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
