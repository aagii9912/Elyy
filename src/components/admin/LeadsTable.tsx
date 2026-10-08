"use client";

/* Бүртгэлийн жагсаалт — эвентээр шүүх, CSV татах.
   Өгөгдөл нь Supabase-ийн event_leads хүснэгтээс (Google Sheet-ийн нөөц). */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadDoc } from "@/lib/store";
import type { EventDoc } from "@/lib/events";
import { leadSelections, matchesLeadArea } from "@/lib/event-registration";
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
  const [areaQuery, setAreaQuery] = useState("");

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
    return leads.map((lead) => ({ ...lead, selections: leadSelections(lead.message) })).filter((lead) => {
      const sourceMatches = filter === "all" || (filter === "site"
        ? !lead.eventId && !lead.eventSlug : lead.eventId === filter || lead.eventSlug === filter);
      return sourceMatches && matchesLeadArea(lead.selections.areaRanges, areaQuery);
    });
  }, [leads, filter, areaQuery]);

  const downloadCsv = () => {
    const head = ["Бүртгэсэн огноо", "Нэр", "Утас", "И-мэйл", "Сонгосон талбай (м²)", "Орон сууц", "Цаг товлосон өдөр", "Мессеж", "Эвент", "Эх сурвалж"];
    const rows = shown.map((l) =>
      [fmt(l.createdAt), l.name, l.phone, l.email, l.selections.areaRanges, l.selections.apartmentTypes,
        l.selections.appointmentDate, l.message, l.eventName ?? "", l.source].map(csvCell).join(",")
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
    <div className="mx-auto max-w-7xl px-4 py-8">
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
        <div className="ml-auto flex max-w-full flex-wrap items-end gap-2">
          <label className="text-xs font-semibold text-neutral-600">
            Талбай (м²)-аар хайх
            <input
              type="search"
              value={areaQuery}
              onChange={(e) => setAreaQuery(e.target.value)}
              placeholder="Жишээ: 161-182"
              className="mt-1 block w-44 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-normal text-neutral-900 outline-none focus:border-ink"
            />
          </label>
          <select
            aria-label="Эх сурвалжаар шүүх"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 outline-none focus:border-ink"
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
      <p className="mb-4 text-sm text-neutral-500">Хүн бүрийн сонгосон бүх талбайг нэр, утасны хамт харуулна. Мэдээлэл аваагүй хүсэлтэд «—» байна.</p>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {err}
        </div>
      )}

      {leads !== null && !err && shown.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
          <p className="text-neutral-500">{leads.length ? "Шүүлтэд тохирох хүсэлт олдсонгүй." : "Одоогоор бүртгэл алга."}</p>
          <p className="mt-1 text-sm text-neutral-400">
            {leads.length ? "Талбайн хайлт эсвэл эх сурвалжийн шүүлтээ өөрчилнө үү." : "Хуудсаар ирсэн хүсэлтүүд энд харагдана."}
          </p>
        </div>
      )}

      {shown.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Нэр / Холбоо барих</th>
                <th className="min-w-48 bg-ink/5 px-4 py-3 font-semibold text-ink">Сонгосон талбай (м²)</th>
                <th className="px-4 py-3 font-semibold">Орон сууц</th>
                <th className="px-4 py-3 font-semibold">Цаг товлосон өдөр</th>
                <th className="px-4 py-3 font-semibold">Эвент</th>
                <th className="px-4 py-3 font-semibold">Бүртгэсэн огноо</th>
                <th className="px-4 py-3 font-semibold">Мессеж</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {shown.map((l) => (
                <tr key={l.id} className="hover:bg-neutral-50">
                  <td className="max-w-60 break-words px-4 py-3 text-neutral-900">
                    <div className="font-semibold">{l.name}</div>
                    {l.phone && <a href={`tel:${l.phone}`} className="mt-1 block font-medium text-ink hover:underline">{l.phone}</a>}
                    {l.email && <a href={`mailto:${l.email}`} className="mt-1 block text-xs text-neutral-500 hover:underline">{l.email}</a>}
                  </td>
                  <td className="bg-ink/[0.03] px-4 py-3 font-semibold text-ink">{l.selections.areaRanges || "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">{l.selections.apartmentTypes || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-700">{l.selections.appointmentDate || "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {l.eventName || <span className="text-neutral-400">Үндсэн сайт</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-500">{fmt(l.createdAt)}</td>
                  <td className="whitespace-pre-line px-4 py-3 text-neutral-500">{l.message || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
