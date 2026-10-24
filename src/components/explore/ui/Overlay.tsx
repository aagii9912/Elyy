"use client";

/* 3D-ийн дээрх DOM давхарга: толгой (лого, замын мөр, буцах), түвшний
   самбар (desktop — баруун талд, утсанд — доороос гарах хуудас),
   давхрын шат, статусын тайлбар, харьцуулалтын тавиур, модалууд,
   kiosk-ийн attract дэлгэц. */

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  FIRST_RESIDENTIAL_FLOOR,
  STATUS_META,
  STATUS_ORDER,
  TOP_FLOOR,
  blockLabel,
  floorLabel,
} from "@/lib/explore/config";
import { parentView } from "@/lib/explore/routes";
import { ALL_UNITS, parseUnitId } from "@/lib/explore/units";
import type { View } from "@/lib/explore/types";
import { cn } from "@/lib/utils";
import { useExplore, useExploreApi, useNavigate } from "../store";
import { BasementPanel, BlockPanel, FloorPanel, LocationPanel, SitePanel, TourPanel, UnitPanel } from "./Panels";
import { Labels } from "./Labels";
import { Sheets } from "./Sheets";
import { Btn, Icon } from "./primitives";

export function Overlay() {
  const mode = useExplore((s) => s.mode);
  return (
    <div className="explore-ui pointer-events-none absolute inset-0 z-40 font-gilroy text-night">
      <Labels />
      <TopBar />
      <SidePanel />
      <FloorRail />
      <Legend />
      <CompareTray />
      <Sheets />
      {mode === "kiosk" && <KioskAttract />}
    </div>
  );
}

/* ---------------- Толгой ---------------- */

function crumbs(view: View): { label: string; to: View }[] {
  const out: { label: string; to: View }[] = [{ label: "Байршил", to: { level: "location" } }];
  if (view.level === "location") return out;
  out.push({ label: "Хотхон", to: { level: "site" } });
  if (view.level === "site") return out;
  if (view.level === "basement") {
    out.push({ label: `Зоорь ${view.basement}`, to: { level: "basement", basement: view.basement } });
    if (view.parkingId) out.push({ label: view.parkingId, to: view });
    return out;
  }
  const u = view.level === "unit" || view.level === "tour" ? parseUnitId(view.unitId) : null;
  const block = view.level === "block" || view.level === "floor" ? view.block : u?.block;
  const floor = view.level === "floor" ? view.floor : u?.floor;
  if (block) out.push({ label: blockLabel(block), to: { level: "block", block } });
  if (block && floor) out.push({ label: floorLabel(floor), to: { level: "floor", block, floor } });
  if (view.level === "unit" || view.level === "tour") out.push({ label: `Айл ${view.unitId}`, to: { level: "unit", unitId: view.unitId } });
  if (view.level === "tour") out.push({ label: "Дотор нь", to: view });
  return out;
}

function TopBar() {
  const view = useExplore((s) => s.view);
  const mode = useExplore((s) => s.mode);
  const source = useExplore((s) => s.inventory.source);
  const updatedAt = useExplore((s) => s.inventory.updatedAt);
  const navigate = useNavigate();
  const trail = crumbs(view);
  const parent = parentView(view);
  const time = new Date(updatedAt).toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ulaanbaatar" });

  return (
    <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
      <div className="pointer-events-auto min-w-0 max-w-full rounded-2xl bg-surface/90 px-4 py-3 shadow-[0_12px_40px_-18px_rgba(21,23,23,0.45)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          {mode === "web" ? (
            <Link href="/" aria-label="Elysium — нүүр хуудас" className="text-night">
              <Logo className="h-4 w-auto" />
            </Link>
          ) : (
            <Logo className="h-4 w-auto text-night" />
          )}
          <span className="h-4 w-px bg-night/15" />
          <span className="text-xs font-bold uppercase tracking-caps-sm text-night">3D аялал</span>
          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-caps-sm text-[#8a5a12]">
            Mockup
          </span>
        </div>
        <nav aria-label="Түвшин" className="explore-scroll mt-2 -mb-1 overflow-x-auto pb-1">
          <ol className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-mist">
            {trail.map((c, i) => {
              const last = i === trail.length - 1;
              return (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && <Icon name="chevron" className="h-3 w-3 opacity-50" />}
                  {last ? (
                    <span aria-current="page" className="font-extrabold text-night">
                      {c.label}
                    </span>
                  ) : (
                    <button type="button" className="rounded px-0.5 hover:text-night hover:underline" onClick={() => navigate(c.to)}>
                      {c.label}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="pointer-events-auto flex shrink-0 items-center gap-2">
        <span
          className="hidden items-center gap-1.5 rounded-full bg-surface/90 px-3 py-2 text-xs font-bold text-night shadow-sm backdrop-blur-md md:inline-flex"
          title={source === "vertmonhub" ? "Статус Vertmonhub-аас" : "Vertmonhub холбогдоогүй — жишээ статус"}
        >
          <span className={cn("h-2 w-2 rounded-full", source === "vertmonhub" ? "bg-[#5d9b4c]" : "bg-gold")} />
          {source === "vertmonhub" ? `Vertmonhub · ${time}` : "Жишээ статус"}
        </span>
        {parent && (
          <Btn tone="dark" onClick={() => navigate(parent)} aria-label="Буцах" className="shadow-lg">
            <Icon name="back" /> <span className="hidden sm:inline">Буцах</span>
          </Btn>
        )}
        {view.level !== "location" && (
          <button
            type="button"
            aria-label="Эхлэл"
            onClick={() => navigate({ level: "location" })}
            className="grid h-11 w-11 place-items-center rounded-full bg-surface/90 text-night shadow-lg backdrop-blur-md hover:bg-white"
          >
            <Icon name="home" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Самбар ---------------- */

function PanelBody({ view }: { view: View }) {
  switch (view.level) {
    case "location":
      return <LocationPanel />;
    case "site":
      return <SitePanel />;
    case "basement":
      return <BasementPanel view={view} />;
    case "block":
      return <BlockPanel view={view} />;
    case "floor":
      return <FloorPanel view={view} />;
    case "unit":
      return <UnitPanel view={view} />;
    case "tour":
      return <TourPanel view={view} />;
  }
}

function SidePanel() {
  const view = useExplore((s) => s.view);
  const open = useExplore((s) => s.sheetOpen);
  const attract = useExplore((s) => s.attract);
  const api = useExploreApi();
  const ref = useRef<HTMLElement>(null);

  /* Самбарын хэмжээг камерт өгнө — 3D-ийн төв харагдах хэсэгт байна. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => {
      const r = el.getBoundingClientRect();
      const desktop = window.innerWidth >= 1024;
      const prev = api.getState().panel;
      const w = Math.round(window.innerWidth - r.left);
      const h = Math.round(window.innerHeight - r.top);
      if (Math.abs(prev.w - w) > 4 || Math.abs(prev.h - h) > 4 || prev.desktop !== desktop) {
        api.setState({ panel: { w, h, desktop } });
      }
    };
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    window.addEventListener("resize", report);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", report);
      api.setState({ panel: { w: 0, h: 0, desktop: true } });
    };
  }, [api, attract]);

  if (attract) return null;
  const key = JSON.stringify(view);
  return (
    <aside
      ref={ref}
      aria-label="Мэдээлэл"
      className={cn(
        "pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col rounded-t-3xl bg-surface/95 shadow-[0_-18px_50px_-24px_rgba(21,23,23,0.5)] backdrop-blur-md transition-[max-height] duration-300",
        open ? "max-h-[82dvh]" : "max-h-[44dvh]",
        "lg:inset-x-auto lg:top-28 lg:right-4 lg:bottom-4 lg:max-h-none lg:w-[25rem] lg:rounded-3xl lg:shadow-[0_24px_60px_-28px_rgba(21,23,23,0.55)]"
      )}
    >
      <button
        type="button"
        aria-label={open ? "Самбарыг багасгах" : "Самбарыг томруулах"}
        aria-expanded={open}
        onClick={() => api.setState({ sheetOpen: !open })}
        className="mx-auto mt-2 mb-1 block h-1.5 w-12 shrink-0 rounded-full bg-night/20 lg:hidden"
      />
      <div key={key} className="explore-scroll explore-enter min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-6 lg:px-6 lg:pt-6">
        <PanelBody view={view} />
      </div>
    </aside>
  );
}

/* ---------------- Давхрын шат (desktop) ---------------- */

function FloorRail() {
  const view = useExplore((s) => s.view);
  const statuses = useExplore((s) => s.inventory.units);
  const hover = useExplore((s) => s.hover);
  const api = useExploreApi();
  const navigate = useNavigate();
  const block = view.level === "block" || view.level === "floor" ? view.block : null;
  const perFloor = useMemo(() => {
    const out: Record<number, number> = {};
    if (!block) return out;
    for (const u of ALL_UNITS) if (u.block === block && statuses[u.id] === "available") out[u.floor] = (out[u.floor] ?? 0) + 1;
    return out;
  }, [block, statuses]);
  if (!block) return null;
  const current = view.level === "floor" ? view.floor : null;
  const floors = Array.from({ length: TOP_FLOOR - FIRST_RESIDENTIAL_FLOOR + 1 }, (_, i) => TOP_FLOOR - i);

  return (
    <nav
      aria-label="Давхар сонгох"
      className="pointer-events-auto absolute top-1/2 left-4 hidden -translate-y-1/2 flex-col gap-0.5 rounded-2xl bg-surface/90 p-1.5 shadow-lg backdrop-blur-md lg:flex"
    >
      {floors.map((f) => {
        const on = current === f;
        const hot = hover?.kind === "floor" && hover.floor === f;
        const free = perFloor[f] ?? 0;
        return (
          <button
            key={f}
            type="button"
            aria-current={on ? "true" : undefined}
            onClick={() => navigate({ level: "floor", block, floor: f }, { replace: view.level === "floor" })}
            onMouseEnter={() => api.setState({ hover: { kind: "floor", block, floor: f } })}
            onMouseLeave={() => api.setState({ hover: null })}
            className={cn(
              "flex h-[1.45rem] w-[4.6rem] items-center justify-between gap-2 rounded-lg px-2 text-[0.7rem] font-bold tabular-nums transition",
              on ? "bg-night text-white" : hot ? "bg-lime text-night" : "text-night hover:bg-night/5"
            )}
          >
            <span>{f}</span>
            <span className="flex gap-0.5" aria-label={`${free} сул`}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i < free ? (on ? "bg-lime" : "bg-[#8fb35a]") : on ? "bg-white/25" : "bg-night/15")} />
              ))}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------------- Статусын тайлбар ---------------- */

function Legend() {
  const level = useExplore((s) => s.view.level);
  if (!["block", "floor", "basement"].includes(level)) return null;
  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 hidden flex-wrap gap-x-3 gap-y-1 rounded-2xl bg-surface/90 px-4 py-2.5 text-xs font-bold text-night shadow-lg backdrop-blur-md lg:flex lg:left-28">
      {STATUS_ORDER.map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-night/30" style={{ background: STATUS_META[s].ui }} />
          {STATUS_META[s].label}
        </span>
      ))}
    </div>
  );
}

/* ---------------- Харьцуулалтын тавиур ---------------- */

function CompareTray() {
  const compare = useExplore((s) => s.compare);
  const level = useExplore((s) => s.view.level);
  const api = useExploreApi();
  if (!compare.length || level === "tour") return null;
  return (
    <div className="pointer-events-auto absolute top-28 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-night py-1.5 pr-1.5 pl-4 text-white shadow-xl lg:top-auto lg:bottom-4">
      <span className="text-xs font-bold">{compare.join(" · ")}</span>
      <Btn tone="primary" size="sm" onClick={() => api.setState({ compareOpen: true })}>
        <Icon name="compare" /> Харьцуулах ({compare.length})
      </Btn>
    </div>
  );
}

/* ---------------- Kiosk attract ---------------- */

function KioskAttract() {
  const attract = useExplore((s) => s.attract);
  const api = useExploreApi();
  const navigate = useNavigate();
  if (!attract) return null;
  return (
    <button
      type="button"
      onClick={() => {
        api.setState({ attract: false });
        navigate({ level: "location" }, { replace: true });
      }}
      className="pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-end bg-gradient-to-t from-night/85 via-night/25 to-transparent pb-[12vh] text-white"
    >
      <Logo className="h-8 w-auto text-white" />
      <p className="mt-5 text-sm font-bold uppercase tracking-caps-lg text-lime">3D аялал</p>
      <p className="mt-3 max-w-xl px-6 text-center text-3xl font-extrabold leading-tight">
        Байршлаас эхлээд өрөө хүртэл — дэлгэцэнд хүрч эхлэнэ үү
      </p>
      <span className="explore-pulse mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-lime px-8 text-lg font-extrabold text-night">
        Эхлэх <Icon name="arrow" />
      </span>
    </button>
  );
}
