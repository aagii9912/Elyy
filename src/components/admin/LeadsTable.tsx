"use client";

/* Бүртгэлийн жагсаалт — эвентээр шүүх, CSV татах.
   Өгөгдөл нь Supabase-ийн event_leads хүснэгтээс (Google Sheet-ийн нөөц). */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadDoc } from "@/lib/store";
import type { EventDoc } from "@/lib/events";
import { Button } from "./ui";

function fmt(iso: string): string {
  // Locale-агностик — hydration зөрүүгүй.
  return iso.slice(0, 16).replace("T", " ");
}

/** RFC 4180 — хашилт, таслал, мөр шилжилтийг зөв escape хийнэ. */
function csvCell(v: string): string {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

export function LeadsTable({ events }: { events: EventDoc[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadDoc[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j?.ok) setLeads(j.leads);
        else setErr(j?.error || "Ачаалахад алдаа гарлаа.");
      })
      .catch(() => alive && setErr("Сүлжээний алдаа."));
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => {
    if (!leads) return [];
    if (filter === "all") return leads;
    if (filter === "site") return leads.filter((l) => !l.eventId && !l.eventSlug);
    return leads.filter((l) => l.eventId === filter || l.eventSlug === filter);
  }, [leads, filter]);

  const downloadCsv = () => {
    const head = ["Огноо", "Нэр", "Утас", "И-мэйл", "Мессеж", "Эвент", "Эх сурвалж"];
    const rows = shown.map((l) =>
      [fmt(l.createdAt), l.name, l.phone, l.email, l.message, l.eventName ?? "", l.source].map(csvCell).join(",")
    );
    // BOM — Excel кирилл үсгийг зөв уншина.
    const blob = new Blob(["﻿" + [head.map(csvCell).join(","), ...rows].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elysium-burtgel-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <button onClick={() => router.push("/admin")} className="text-sm font-semibold text-neutral-500 hover:text-neutral-800">
          ← Буцах
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Бүртгэл</h1>
          <p className="text-sm text-neutral-500">
            {leads === null ? "Ачаалж байна…" : `${shown.length} хүсэлт`}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 outline-none focus:border-ink"
          >
            <option value="all">Бүх эх сурвалж</option>
            <option value="site">Үндсэн сайт</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <Button variant="primary" type="button" onClick={downloadCsv} disabled={!shown.length}>
            CSV татах
          </Button>
        </div>
      </header>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {err}
        </div>
      )}

      {leads !== null && !err && shown.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
          <p className="text-neutral-500">Одоогоор бүртгэл алга.</p>
          <p className="mt-1 text-sm text-neutral-400">
            Эвентийн хуудсаар ирсэн хүсэлтүүд энд харагдана.
          </p>
        </div>
      )}

      {shown.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Огноо</th>
                <th className="px-4 py-3 font-semibold">Нэр</th>
                <th className="px-4 py-3 font-semibold">Утас</th>
                <th className="px-4 py-3 font-semibold">Эвент</th>
                <th className="px-4 py-3 font-semibold">Мессеж</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {shown.map((l) => (
                <tr key={l.id} className="hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{fmt(l.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-900">{l.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {l.phone ? (
                      <a href={`tel:${l.phone}`} className="font-medium text-ink hover:underline">{l.phone}</a>
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {l.eventName || <span className="text-neutral-400">Үндсэн сайт</span>}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{l.message || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
