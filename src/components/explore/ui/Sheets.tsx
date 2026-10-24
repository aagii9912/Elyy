"use client";

/* Модалууд: хүсэлт (Vertmonhub руу), QR (утсан дээр үргэлжлүүлэх),
   2D төлөвлөгөө (брошурын зураг), айл харьцуулах. */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { SIDE_LABEL, STATUS_META, blockLabel, floorLabel } from "@/lib/explore/config";
import { PARKING_KIND_LABEL, parkingById } from "@/lib/explore/parking";
import { UNIT_TYPES, unitById, unitSummary } from "@/lib/explore/units";
import { leadRequestBody, type LeadAttempt } from "@/lib/lead-request";
import { useExplore, useExploreApi, useNavigate } from "../store";
import { Btn, Icon, Sheet, StatusBadge } from "./primitives";

export function Sheets() {
  return (
    <>
      <LeadSheet />
      <QrSheet />
      <PlanSheet />
      <CompareSheet />
    </>
  );
}

/* ---------------- Хүсэлт ---------------- */

function LeadSheet() {
  const lead = useExplore((s) => s.lead);
  const mode = useExplore((s) => s.mode);
  const kioskId = useExplore((s) => s.kioskId);
  const copy = useExplore((s) => s.site.inquiry);
  const api = useExploreApi();
  const attempt = useRef<LeadAttempt | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const close = () => {
    api.setState({ lead: null });
    setState("idle");
    setError("");
  };

  const unit = lead?.unitId ? unitById(lead.unitId) : undefined;
  const space = lead?.parkingId ? parkingById(lead.parkingId) : undefined;
  const subject = unit ? `Айл ${unit.id}` : space ? `Зогсоол ${space.id}` : "Борлуулалтын менежер";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const note = String(form.get("note") ?? "").trim();
    const lines = [
      `3D Explorer (${mode === "kiosk" ? `kiosk · ${kioskId}` : "вэб"}) — ${subject}`,
      unit ? unitSummary(unit) : "",
      space ? `${PARKING_KIND_LABEL[space.kind]} · ${space.level} · ${blockLabel(space.nearestBlock)}-ийн лифтэнд ~${space.walk} м` : "",
      note ? `Тайлбар: ${note}` : "",
    ].filter(Boolean);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: leadRequestBody(
          {
            name: String(form.get("name") ?? "").trim(),
            phone: String(form.get("phone") ?? "").trim(),
            email: String(form.get("email") ?? "").trim(),
            message: lines.join("\n"),
            source: mode === "kiosk" ? `explore/kiosk/${kioskId}` : "explore/web",
            website: String(form.get("website") ?? ""),
          },
          attempt
        ),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error("lead");
      setState("done");
    } catch {
      /* Серверийн алдааны текст англиар ирдэг — хэрэглэгчид сайтын
         (админаас засагддаг) монгол мессежийг харуулна. */
      setState("error");
      setError(copy.error);
    }
  };

  return (
    <Sheet open={Boolean(lead)} onClose={close} title={state === "done" ? copy.successTitle : `${subject} — хүсэлт`}>
      {state === "done" ? (
        <div>
          <p className="text-sm leading-relaxed text-mist">{copy.successBody}</p>
          <Btn tone="dark" className="mt-5 w-full" onClick={close}>
            Буцах
          </Btn>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm leading-relaxed text-mist">
            {unit ? `${UNIT_TYPES[unit.type].title} · ${UNIT_TYPES[unit.type].area} · ${floorLabel(unit.floor)}. ` : ""}
            Нэр, утсаа үлдээгээрэй — менежер тантай холбогдоно.
          </p>
          <Field name="name" label={copy.name} required autoComplete="name" />
          <Field name="phone" label={copy.phone} required type="tel" inputMode="tel" autoComplete="tel" />
          <Field name="email" label="И-мэйл (заавал биш)" type="email" autoComplete="email" />
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-mist">{copy.note}</span>
            <textarea name="note" rows={2} maxLength={500} className="w-full rounded-xl border border-night/15 bg-white px-3 py-2 text-sm text-night" />
          </label>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          {state === "error" && <p className="text-sm font-semibold text-[#b3442e]">{error}</p>}
          <Btn tone="dark" size="lg" type="submit" className="w-full" disabled={state === "sending"}>
            {state === "sending" ? copy.sending : copy.submit}
          </Btn>
          {mode === "kiosk" && (
            <p className="text-center text-xs text-mist">Эсвэл QR уншуулж утсан дээрээ бөглөж болно.</p>
          )}
        </form>
      )}
    </Sheet>
  );
}

function Field({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-mist">{label}</span>
      <input {...rest} className="min-h-11 w-full rounded-xl border border-night/15 bg-white px-3 text-sm font-semibold text-night" />
    </label>
  );
}

/* ---------------- QR ---------------- */

function QrSheet() {
  const qr = useExplore((s) => s.qr);
  const api = useExploreApi();
  const [src, setSrc] = useState<{ url: string; data: string } | null>(null);

  useEffect(() => {
    if (!qr) return;
    let alive = true;
    QRCode.toDataURL(qr.url, { margin: 1, width: 520, color: { dark: "#1b3328", light: "#ffffff" } })
      .then((data) => alive && setSrc({ url: qr.url, data }))
      .catch(() => alive && setSrc(null));
    return () => {
      alive = false;
    };
  }, [qr]);

  const ready = src && qr && src.url === qr.url;
  return (
    <Sheet open={Boolean(qr)} onClose={() => api.setState({ qr: null })} title={qr?.title ?? ""}>
      <div className="flex flex-col items-center text-center">
        <div className="grid h-64 w-64 place-items-center rounded-2xl border border-night/10 bg-white p-3">
          {ready ? (
            /* QR нь data URL — next/image шаардлагагүй. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={src.data} alt="QR код" className="h-full w-full" />
          ) : (
            <span className="text-sm text-mist">Үүсгэж байна…</span>
          )}
        </div>
        <p className="mt-4 text-sm font-semibold text-night">Утасныхаа камераар уншуулна уу.</p>
        <p className="mt-1 break-all text-xs text-mist">{qr?.url}</p>
      </div>
    </Sheet>
  );
}

/* ---------------- 2D төлөвлөгөө ---------------- */

function PlanSheet() {
  const id = useExplore((s) => s.planUnit);
  const api = useExploreApi();
  const unit = id ? unitById(id) : undefined;
  const t = unit ? UNIT_TYPES[unit.type] : undefined;
  return (
    <Sheet open={Boolean(unit)} onClose={() => api.setState({ planUnit: null })} title={t ? `${t.title} · ${t.code} — төлөвлөгөө` : ""} wide>
      {t && (
        <div className="grid gap-4 sm:grid-cols-2">
          <figure>
            <div className="relative aspect-[7/6] overflow-hidden rounded-2xl border border-night/10 bg-white">
              <Image src={t.plan.floorPlan} alt={`${t.code} — давхрын хуваалт`} fill sizes="(min-width: 640px) 22rem, 90vw" className="object-contain" />
            </div>
            <figcaption className="mt-2 text-xs font-semibold text-mist">Давхрын хуваалт — {t.plan.floors}</figcaption>
          </figure>
          {t.plan.views.slice(0, 1).map((v) => (
            <figure key={v}>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#dbe3ef]">
                <Image src={v} alt={`${t.title} — аксонометр`} fill sizes="(min-width: 640px) 22rem, 90vw" className="object-contain" />
              </div>
              <figcaption className="mt-2 text-xs font-semibold text-mist">Аксонометр рендер</figcaption>
            </figure>
          ))}
        </div>
      )}
    </Sheet>
  );
}

/* ---------------- Харьцуулах ---------------- */

function CompareSheet() {
  const open = useExplore((s) => s.compareOpen);
  const ids = useExplore((s) => s.compare);
  const statuses = useExplore((s) => s.inventory.units);
  const api = useExploreApi();
  const navigate = useNavigate();
  const units = ids.map((id) => unitById(id)).filter((u) => u !== undefined);
  const rows: [string, (u: (typeof units)[number]) => React.ReactNode][] = [
    ["Тип", (u) => `${UNIT_TYPES[u.type].title} · ${UNIT_TYPES[u.type].code}`],
    ["Талбай", (u) => UNIT_TYPES[u.type].area],
    ["Өрөө", (u) => UNIT_TYPES[u.type].rooms],
    ["Блок", (u) => blockLabel(u.block)],
    ["Давхар", (u) => u.floor],
    ["Цонхны чиг", (u) => UNIT_TYPES[u.type].facing.map((s) => SIDE_LABEL[s]).join(", ")],
    ["Төлөв", (u) => STATUS_META[statuses[u.id] ?? "not_released"].label],
  ];
  return (
    <Sheet open={open && units.length > 0} onClose={() => api.setState({ compareOpen: false })} title="Айл харьцуулах" wide>
      <div className="explore-scroll overflow-x-auto">
        <table className="w-full min-w-[30rem] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="w-28" />
              {units.map((u) => (
                <th key={u.id} className="px-3 pb-3 text-left align-bottom">
                  <p className="text-lg font-extrabold text-night">{u.id}</p>
                  <StatusBadge status={statuses[u.id] ?? "not_released"} className="mt-1" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, cell]) => (
              <tr key={label}>
                <th className="border-t border-night/10 py-2.5 pr-3 text-left text-xs font-bold text-mist">{label}</th>
                {units.map((u) => (
                  <td key={u.id} className="border-t border-night/10 px-3 py-2.5 font-semibold text-night">
                    {cell(u)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th />
              {units.map((u) => (
                <td key={u.id} className="px-3 pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Btn
                      size="sm"
                      tone="dark"
                      onClick={() => {
                        api.setState({ compareOpen: false });
                        navigate({ level: "unit", unitId: u.id });
                      }}
                    >
                      Үзэх <Icon name="arrow" />
                    </Btn>
                    <Btn size="sm" onClick={() => api.setState({ compare: ids.filter((x) => x !== u.id) })}>
                      Хасах
                    </Btn>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Sheet>
  );
}
