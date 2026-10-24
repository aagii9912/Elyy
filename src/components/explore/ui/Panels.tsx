"use client";

/* Түвшин бүрийн мэдээллийн самбар. Үнэ хаана ч харагдахгүй (захиалагчийн
   шийдвэр); статус нь Vertmonhub-аас, тохируулаагүй үед mockup. */

import { useMemo } from "react";
import Image from "next/image";
import {
  BASEMENT_LEVELS,
  BLOCKS,
  FIRST_RESIDENTIAL_FLOOR,
  SIDE_LABEL,
  STATUS_META,
  STATUS_ORDER,
  TOP_FLOOR,
  blockLabel,
  floorLabel,
  formatDistance,
} from "@/lib/explore/config";
import { DEFAULT_FILTERS, filtersActive } from "@/lib/explore/filters";
import { buildInterior, defaultTourRoom, roomKind } from "@/lib/explore/interior";
import { ALL_PARKING, PARKING, PARKING_KIND_LABEL, parkingById } from "@/lib/explore/parking";
import { unitPlacement } from "@/lib/explore/placement";
import { placePois } from "@/lib/explore/pois";
import { AMENITIES } from "@/lib/explore/site";
import { SEASONS, daylight, formatHour, parseCoords } from "@/lib/explore/sun";
import { ALL_UNITS, UNIT_TYPES, unitById, unitsOn } from "@/lib/explore/units";
import type { BasementLevel, ParkingKind, Side, View } from "@/lib/explore/types";
import { cn } from "@/lib/utils";
import { useExplore, useExploreApi, useNavigate } from "../store";
import { countStatuses, handoffUrl, useMatches } from "./data";
import { Btn, Chip, Fact, Icon, Kicker, SectionTitle, StatusBadge, StatusDot } from "./primitives";

function PanelHeader({ kicker, title, sub, aside }: { kicker: string; title: string; sub?: string; aside?: React.ReactNode }) {
  return (
    <div>
      <Kicker>{kicker}</Kicker>
      <div className="mt-2 flex items-start justify-between gap-3">
        <h2 className="text-2xl font-extrabold leading-tight tracking-display text-night">{title}</h2>
        {aside}
      </div>
      {sub && <p className="mt-1.5 text-sm font-medium leading-snug text-mist">{sub}</p>}
    </div>
  );
}

function StatusBar({ counts }: { counts: ReturnType<typeof countStatuses> }) {
  return (
    <div className="mt-4">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-night/5">
        {STATUS_ORDER.map((s) =>
          counts[s] ? (
            <span key={s} style={{ width: `${(counts[s] / counts.total) * 100}%`, background: STATUS_META[s].ui }} />
          ) : null
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-mist">
        {STATUS_ORDER.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <StatusDot status={s} />
            {STATUS_META[s].short} <b className="tabular-nums text-night">{counts[s]}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function MockNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-xl border border-dashed border-gold/60 bg-gold/10 px-3 py-2 text-xs font-medium leading-snug text-night/80">
      {children}
    </p>
  );
}

/* ---------------- L0 Байршил ---------------- */

export function LocationPanel() {
  const site = useExplore((s) => s.site);
  const poi = useExplore((s) => s.poi);
  const mode = useExplore((s) => s.mode);
  const api = useExploreApi();
  const navigate = useNavigate();
  const pois = useMemo(() => placePois(site.pins), [site.pins]);
  const sel = poi !== null ? pois[poi] : undefined;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.coords)}`;

  return (
    <>
      <PanelHeader kicker="Байршил" title="Төслийн байршил" sub={site.address} />
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Fact label="Блок" value={BLOCKS.length} />
        <Fact label="Айл" value={ALL_UNITS.length} />
        <Fact label="Зогсоол" value={ALL_PARKING.length} />
      </div>
      <Btn tone="dark" size="lg" className="mt-4 w-full" onClick={() => navigate({ level: "site" })}>
        Хотхон руу орох <Icon name="arrow" />
      </Btn>

      <SectionTitle>Ойролцоох байршил</SectionTitle>
      <ul className="space-y-1">
        {pois.map((p) => {
          const d = p.distance ? { value: p.distance, unit: p.unit } : formatDistance(p.meters);
          const on = poi === p.index;
          return (
            <li key={p.index}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => api.setState({ poi: on ? null : p.index })}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                  on ? "bg-night text-white" : "hover:bg-night/5"
                )}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lime text-xs font-extrabold text-night">
                  {p.index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{p.place}</span>
                <span className="text-sm font-extrabold tabular-nums">
                  {p.distance ? "" : "≈ "}
                  {d.value} <span className="text-xs font-semibold opacity-70">{d.unit}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {sel && (sel.image || sel.description) && (
        <div className="explore-enter mt-3 overflow-hidden rounded-2xl bg-night text-white">
          {sel.image && (
            /* Админаас оруулсан зураг (Supabase г.м. гадаад хаяг) — next/image-ийн домэйн жагсаалтад ороогүй. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={sel.image} alt={sel.place} loading="lazy" className="h-36 w-full object-cover" />
          )}
          {sel.description && <p className="px-4 py-3 text-sm leading-snug text-white/80">{sel.description}</p>}
        </div>
      )}
      <MockNote>
        Зай нь агаарын рендер дээрх байрлалаас тооцсон ойролцоо утга. Бодит координат орж ирэхэд (админ → Байршил)
        автоматаар засагдана.
      </MockNote>
      {mode === "kiosk" ? (
        <Btn className="mt-4 w-full" onClick={() => api.setState({ qr: { url: directions, title: "Чиглэлийг утсандаа авах" } })}>
          <Icon name="qr" /> Чиглэлийг утсандаа
        </Btn>
      ) : (
        <a
          href={directions}
          target="_blank"
          rel="noopener"
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-night/5 px-5 text-sm font-bold text-night hover:bg-night/10"
        >
          <Icon name="pin" /> Чиглэл авах
        </a>
      )}
    </>
  );
}

/* ---------------- L1 Хотхон ---------------- */

export function SitePanel() {
  const statuses = useExplore((s) => s.inventory.units);
  const parking = useExplore((s) => s.inventory.parking);
  const hover = useExplore((s) => s.hover);
  const amenity = useExplore((s) => s.amenity);
  const season = useExplore((s) => s.season);
  const hour = useExplore((s) => s.hour);
  const coords = useExplore((s) => s.site.coords);
  const api = useExploreApi();
  const navigate = useNavigate();

  const perBlock = useMemo(
    () =>
      Object.fromEntries(
        BLOCKS.map((b) => [b, countStatuses(ALL_UNITS.filter((u) => u.block === b).map((u) => u.id), statuses)])
      ),
    [statuses]
  );
  const { lat, lng } = parseCoords(coords);
  const day = daylight(season, lat, lng);
  const min = Math.ceil(day.sunrise * 4) / 4;
  const max = Math.floor(day.sunset * 4) / 4;
  const sel = AMENITIES.find((a) => a.id === amenity);

  return (
    <>
      <PanelHeader kicker="Хотхон" title="Elysium Residence" sub="4 блок, нэг подиум. Нийт талбайн 85% нь ногоон, нийтийн эзэмшлийн орон зай." />

      <SectionTitle>Блок сонгох</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {BLOCKS.map((b) => {
          const c = perBlock[b];
          const hot = hover?.kind === "block" && hover.block === b;
          return (
            <button
              key={b}
              type="button"
              onMouseEnter={() => api.setState({ hover: { kind: "block", block: b } })}
              onMouseLeave={() => api.setState({ hover: null })}
              onClick={() => navigate({ level: "block", block: b })}
              className={cn(
                "rounded-2xl border px-3.5 py-3 text-left transition",
                hot ? "border-night bg-night text-white" : "border-night/10 bg-white/70 hover:border-night/40"
              )}
            >
              <p className="text-base font-extrabold">{blockLabel(b)}</p>
              <p className={cn("mt-0.5 text-xs font-semibold", hot ? "text-white/70" : "text-mist")}>
                {FIRST_RESIDENTIAL_FLOOR}–{TOP_FLOOR} давхар · {c.total} айл
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold">
                <StatusDot status="available" /> {c.available} сул
              </p>
            </button>
          );
        })}
      </div>

      <SectionTitle>Зоорь · автомашины зогсоол</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {BASEMENT_LEVELS.map((level) => {
          const c = countStatuses(PARKING[level].map((p) => p.id), parking);
          return (
            <button
              key={level}
              type="button"
              onClick={() => navigate({ level: "basement", basement: level })}
              className="rounded-2xl border border-night/10 bg-white/70 px-3.5 py-3 text-left transition hover:border-night/40"
            >
              <p className="flex items-center gap-2 text-base font-extrabold">
                <Icon name="car" /> {level}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-mist">
                {c.total} байр · {c.available} сул
              </p>
            </button>
          );
        })}
      </div>

      <SectionTitle aside={<span className="text-xs font-bold tabular-nums text-night">{formatHour(hour)}</span>}>
        Нар ба сүүдэр
      </SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {SEASONS.map((s) => (
          <Chip key={s.key} active={season === s.key} onClick={() => {
            const d = daylight(s.key, lat, lng);
            api.setState({ season: s.key, hour: Math.min(Math.max(hour, Math.ceil(d.sunrise * 4) / 4), Math.floor(d.sunset * 4) / 4) });
          }}>
            {s.label}
          </Chip>
        ))}
      </div>
      <input
        type="range"
        className="explore-range mt-3"
        min={min}
        max={max}
        step={0.25}
        value={Math.min(Math.max(hour, min), max)}
        aria-label="Цаг"
        onChange={(e) => api.setState({ hour: Number(e.target.value) })}
      />
      <p className="mt-1.5 flex justify-between text-xs font-semibold text-mist">
        <span>Нар мандах {formatHour(day.sunrise)}</span>
        <span>Жаргах {formatHour(day.sunset)}</span>
      </p>

      <SectionTitle>Тохижилт</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {AMENITIES.map((a, i) => (
          <Chip
            key={a.id}
            active={amenity === a.id}
            onClick={() =>
              a.basement ? navigate({ level: "basement", basement: "B1" }) : api.setState({ amenity: amenity === a.id ? null : a.id })
            }
          >
            <span className="tabular-nums opacity-60">{a.basement ? "P" : i + 1}</span> {a.title}
          </Chip>
        ))}
      </div>
      {sel && (
        <div className="explore-enter mt-3 overflow-hidden rounded-2xl bg-night text-white">
          {sel.image && (
            <Image src={sel.image} alt={sel.title} width={640} height={360} sizes="24rem" className="h-40 w-full object-cover" />
          )}
          <div className="px-4 py-3">
            <p className="text-base font-extrabold">{sel.title}</p>
            <p className="mt-1 text-sm leading-snug text-white/75">{sel.body}</p>
          </div>
        </div>
      )}
      <MockNote>Тохижилт нь рендерээс ерөнхийлсөн mockup — гадна тохижилтыг 3D файл ирэхэд бодитоор хийнэ.</MockNote>
    </>
  );
}

/* ---------------- Зоорь ---------------- */

const KINDS: ParkingKind[] = ["standard", "large", "ev", "accessible"];

export function BasementPanel({ view }: { view: Extract<View, { level: "basement" }> }) {
  const statuses = useExplore((s) => s.inventory.parking);
  const kinds = useExplore((s) => s.parkingKinds);
  const block = useExplore((s) => s.parkingBlock);
  const mode = useExplore((s) => s.mode);
  const kioskId = useExplore((s) => s.kioskId);
  const api = useExploreApi();
  const navigate = useNavigate();
  const level: BasementLevel = view.basement;
  const counts = useMemo(() => countStatuses(PARKING[level].map((p) => p.id), statuses), [level, statuses]);
  const space = view.parkingId ? parkingById(view.parkingId) : undefined;
  const status = space ? (statuses[space.id] ?? "not_released") : null;

  return (
    <>
      <PanelHeader
        kicker="Зоорь"
        title={`${level} давхар`}
        sub="Подиумын доорх газар доорх зогсоол — блок бүрийн лифт зоорь хүртэл бууна."
        aside={
          <div className="flex gap-1">
            {BASEMENT_LEVELS.map((l) => (
              <Chip key={l} active={l === level} onClick={() => navigate({ level: "basement", basement: l }, { replace: true })}>
                {l}
              </Chip>
            ))}
          </div>
        }
      />
      <StatusBar counts={counts} />

      {space && status && (
        <div className="explore-enter mt-4 rounded-2xl bg-night p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xl font-extrabold">Байр {space.id}</p>
            <StatusBadge status={status} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <p>
              <span className="block text-xs text-white/60">Төрөл</span>
              <b>{PARKING_KIND_LABEL[space.kind]}</b>
            </p>
            <p>
              <span className="block text-xs text-white/60">Хамгийн ойр лифт</span>
              <b>
                {blockLabel(space.nearestBlock)} · ~{space.walk} м
              </b>
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Btn tone="primary" onClick={() => api.setState({ lead: { parkingId: space.id } })}>
              Сонирхох
            </Btn>
            <Btn
              tone="ghost"
              className="text-white hover:bg-white/10"
              onClick={() =>
                api.setState({ qr: { url: handoffUrl(`/parking/${space.id}`, mode, kioskId), title: `Байр ${space.id} — утсандаа` } })
              }
            >
              <Icon name="qr" /> Утсандаа
            </Btn>
          </div>
        </div>
      )}

      <SectionTitle>Төрөл</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <Chip
            key={k}
            active={kinds.includes(k)}
            onClick={() => api.setState({ parkingKinds: kinds.includes(k) ? kinds.filter((x) => x !== k) : [...kinds, k] })}
          >
            {PARKING_KIND_LABEL[k]}
          </Chip>
        ))}
      </div>
      <SectionTitle>Миний блокийн лифтэнд ойр</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {BLOCKS.map((b) => (
          <Chip key={b} active={block === b} onClick={() => api.setState({ parkingBlock: block === b ? null : b })}>
            {blockLabel(b)}
          </Chip>
        ))}
      </div>
      {!space && <p className="mt-4 text-sm font-medium text-mist">Зогсоолын байр дээр дарж сонгоно уу.</p>}
      <MockNote>
        B1/B2-ын зураг ирээгүй тул зогсоолын байрлал, дугаарлалт нь жишээ (нийт {ALL_PARKING.length} байр). Зураг ирэхэд
        бодит схемээр солигдоно.
      </MockNote>
    </>
  );
}

/* ---------------- L2 Блок ---------------- */

const SIDES: Side[] = ["n", "e", "s", "w"];

export function BlockPanel({ view }: { view: Extract<View, { level: "block" }> }) {
  const filters = useExplore((s) => s.filters);
  const statuses = useExplore((s) => s.inventory.units);
  const picked = useExplore((s) => s.picked);
  const api = useExploreApi();
  const navigate = useNavigate();
  const ids = useMemo(() => ALL_UNITS.filter((u) => u.block === view.block).map((u) => u.id), [view.block]);
  const counts = useMemo(() => countStatuses(ids, statuses), [ids, statuses]);
  const matches = useMatches(view.block, filters);
  const active = filtersActive(filters);
  const pickedFloor = picked?.startsWith("floor:") ? Number(picked.slice(6)) : null;
  const set = (patch: Partial<typeof filters>) => api.setState({ filters: { ...filters, ...patch } });
  const floors = Array.from({ length: TOP_FLOOR - FIRST_RESIDENTIAL_FLOOR + 1 }, (_, i) => FIRST_RESIDENTIAL_FLOOR + i);

  return (
    <>
      <PanelHeader
        kicker="Блок"
        title={blockLabel(view.block)}
        sub={`${FIRST_RESIDENTIAL_FLOOR}–${TOP_FLOOR} давхар · давхарт 5 айл · 1-р давхар үйлчилгээ`}
      />
      <StatusBar counts={counts} />

      {pickedFloor && (
        <div className="explore-enter mt-4 flex items-center justify-between gap-3 rounded-2xl bg-night px-4 py-3 text-white">
          <p className="text-base font-extrabold">{floorLabel(pickedFloor)}</p>
          <Btn tone="primary" size="sm" onClick={() => navigate({ level: "floor", block: view.block, floor: pickedFloor })}>
            Давхрыг үзэх <Icon name="arrow" />
          </Btn>
        </div>
      )}

      <SectionTitle aside={active && <button type="button" className="text-xs font-bold text-moss underline" onClick={() => api.setState({ filters: DEFAULT_FILTERS })}>Цэвэрлэх</button>}>
        Айл хайх
      </SectionTitle>
      <p className="mb-1.5 text-xs font-semibold text-mist">Өрөөний тоо</p>
      <div className="flex flex-wrap gap-1.5">
        {[2, 3, 4].map((n) => (
          <Chip key={n} active={filters.rooms.includes(n)} onClick={() => set({ rooms: filters.rooms.includes(n) ? filters.rooms.filter((x) => x !== n) : [...filters.rooms, n] })}>
            {n} өрөө
          </Chip>
        ))}
      </div>
      <p className="mt-3 mb-1.5 text-xs font-semibold text-mist">Цонхны чиг</p>
      <div className="flex flex-wrap gap-1.5">
        {SIDES.map((s) => (
          <Chip key={s} active={filters.facing.includes(s)} onClick={() => set({ facing: filters.facing.includes(s) ? filters.facing.filter((x) => x !== s) : [...filters.facing, s] })}>
            {SIDE_LABEL[s]}
          </Chip>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {(["floorMin", "floorMax"] as const).map((key) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs font-semibold text-mist">{key === "floorMin" ? "Давхар — доод" : "Давхар — дээд"}</span>
            <select
              value={filters[key]}
              onChange={(e) => {
                const v = Number(e.target.value);
                set(key === "floorMin" ? { floorMin: Math.min(v, filters.floorMax) } : { floorMax: Math.max(v, filters.floorMin) });
              }}
              className="min-h-10 w-full rounded-xl border border-night/15 bg-white px-3 text-sm font-bold text-night"
            >
              {floors.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <label className="mt-3 flex items-center gap-2.5 text-sm font-bold text-night">
        <input
          type="checkbox"
          checked={filters.onlyAvailable}
          onChange={(e) => set({ onlyAvailable: e.target.checked })}
          className="h-5 w-5 accent-night"
        />
        Зөвхөн сул айл
      </label>

      <SectionTitle aside={<span className="text-xs font-bold tabular-nums text-night">{matches.length}</span>}>Тохирох айл</SectionTitle>
      <ul className="space-y-1">
        {matches.slice(0, 60).map((u) => {
          const t = UNIT_TYPES[u.type];
          const st = statuses[u.id] ?? "not_released";
          return (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => navigate({ level: "unit", unitId: u.id })}
                onMouseEnter={() => api.setState({ hover: { kind: "floor", block: u.block, floor: u.floor } })}
                onMouseLeave={() => api.setState({ hover: null })}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-night/5"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-night text-xs font-extrabold text-lime">{t.letter}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold text-night">{u.id}</span>
                  <span className="block text-xs font-semibold text-mist">
                    {t.area} · {t.rooms} өрөө · {u.floor}-р давхар
                  </span>
                </span>
                <StatusDot status={st} />
              </button>
            </li>
          );
        })}
      </ul>
      {matches.length > 60 && <p className="mt-2 text-xs font-semibold text-mist">… нийт {matches.length}. Шүүлтүүрээр нарийсгана уу.</p>}
    </>
  );
}

/* ---------------- L3 Давхар ---------------- */

export function FloorPanel({ view }: { view: Extract<View, { level: "floor" }> }) {
  const statuses = useExplore((s) => s.inventory.units);
  const picked = useExplore((s) => s.picked);
  const api = useExploreApi();
  const navigate = useNavigate();
  const units = unitsOn(view.block, view.floor);
  const sel = picked ? unitById(picked) : undefined;
  const go = (floor: number) => navigate({ level: "floor", block: view.block, floor }, { replace: true });

  return (
    <>
      <PanelHeader
        kicker={blockLabel(view.block)}
        title={floorLabel(view.floor)}
        sub={view.floor === 2 ? "2-р давхрын хуваалт: E-1 … E-5" : "3–23-р давхрын хуваалт: E-3 … E-7"}
        aside={
          <div className="flex flex-col gap-1">
            <button
              type="button"
              aria-label="Дээд давхар"
              disabled={view.floor >= TOP_FLOOR}
              onClick={() => go(view.floor + 1)}
              className="grid h-9 w-9 place-items-center rounded-full bg-night/5 text-night hover:bg-night/10 disabled:opacity-30"
            >
              <Icon name="up" />
            </button>
            <button
              type="button"
              aria-label="Доод давхар"
              disabled={view.floor <= FIRST_RESIDENTIAL_FLOOR}
              onClick={() => go(view.floor - 1)}
              className="grid h-9 w-9 place-items-center rounded-full bg-night/5 text-night hover:bg-night/10 disabled:opacity-30"
            >
              <Icon name="down" />
            </button>
          </div>
        }
      />
      <SectionTitle>Энэ давхрын айлууд</SectionTitle>
      <ul className="space-y-1.5">
        {units.map((u) => {
          const t = UNIT_TYPES[u.type];
          const st = statuses[u.id] ?? "not_released";
          const on = picked === u.id;
          return (
            <li key={u.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => (on ? navigate({ level: "unit", unitId: u.id }) : api.setState({ picked: u.id }))}
                onMouseEnter={() => api.setState({ hover: { kind: "unit", id: u.id } })}
                onMouseLeave={() => api.setState({ hover: null })}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition",
                  on ? "border-night bg-night text-white" : "border-night/10 bg-white/70 hover:border-night/40"
                )}
              >
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-extrabold", on ? "bg-lime text-night" : "bg-night text-lime")}>
                  {t.letter}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold">
                    {t.title} <span className="font-semibold opacity-60">· {t.code}</span>
                  </span>
                  <span className={cn("block text-xs font-semibold", on ? "text-white/70" : "text-mist")}>
                    {t.area} · {t.rooms} өрөө · {t.facing.map((s) => SIDE_LABEL[s]).join(", ")}
                  </span>
                </span>
                <StatusDot status={st} />
              </button>
            </li>
          );
        })}
      </ul>
      {sel && (
        <Btn tone="dark" size="lg" className="explore-enter mt-4 w-full" onClick={() => navigate({ level: "unit", unitId: sel.id })}>
          Айл {sel.id}-г үзэх <Icon name="arrow" />
        </Btn>
      )}
      {!sel && <p className="mt-4 text-sm font-medium text-mist">Айл дээр дарж сонгоно, дахин дарахад дотор нь орно.</p>}
    </>
  );
}

/* ---------------- L4 Айл ---------------- */

export function UnitPanel({ view }: { view: Extract<View, { level: "unit" }> }) {
  const statuses = useExplore((s) => s.inventory.units);
  const compare = useExplore((s) => s.compare);
  const focusRoom = useExplore((s) => s.focusRoom);
  const mode = useExplore((s) => s.mode);
  const kioskId = useExplore((s) => s.kioskId);
  const api = useExploreApi();
  const navigate = useNavigate();
  const unit = unitById(view.unitId);
  const model = useMemo(() => {
    const p = unitPlacement(view.unitId);
    return p ? buildInterior(p.unit.type, p.frame.L, p.frame.D) : null;
  }, [view.unitId]);
  if (!unit) return null;
  const t = UNIT_TYPES[unit.type];
  const status = statuses[unit.id] ?? "not_released";
  const inCompare = compare.includes(unit.id);
  const neighbors = unitsOn(unit.block, unit.floor).filter((u) => u.id !== unit.id);
  const roomIndex = (no: number) => model?.rooms.find((r) => r.no === no)?.index;

  return (
    <>
      <PanelHeader
        kicker={`${blockLabel(unit.block)} · ${floorLabel(unit.floor)}`}
        title={`Айл ${unit.id}`}
        sub={`${t.title} (${t.code}) — ${t.plan.spot}`}
        aside={<StatusBadge status={status} />}
      />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Fact label="Талбай" value={t.area} />
        <Fact label="Өрөө" value={t.rooms} />
        <Fact label="Давхар" value={unit.floor} />
        <Fact label="Цонхны чиг" value={<span className="text-sm">{t.facing.map((s) => SIDE_LABEL[s]).join(", ")}</span>} />
      </div>

      <div className="mt-4 grid gap-2">
        <Btn tone="dark" size="lg" onClick={() => navigate({ level: "tour", unitId: unit.id })}>
          <Icon name="walk" /> Дотор нь алхах
        </Btn>
        <div className="grid grid-cols-2 gap-2">
          <Btn tone="primary" onClick={() => api.setState({ lead: { unitId: unit.id } })}>
            Сонирхох
          </Btn>
          <Btn onClick={() => api.setState({ qr: { url: handoffUrl(`/unit/${unit.id}`, mode, kioskId), title: `Айл ${unit.id} — утсандаа` } })}>
            <Icon name="qr" /> Утсандаа
          </Btn>
          <Btn onClick={() => api.setState({ planUnit: unit.id })}>
            <Icon name="plan" /> 2D төлөвлөгөө
          </Btn>
          <Btn
            tone={inCompare ? "dark" : "soft"}
            disabled={!inCompare && compare.length >= 3}
            onClick={() => api.setState({ compare: inCompare ? compare.filter((x) => x !== unit.id) : [...compare, unit.id] })}
          >
            <Icon name={inCompare ? "check" : "compare"} /> {inCompare ? "Харьцуулж байна" : "Харьцуулах"}
          </Btn>
        </div>
      </div>

      <SectionTitle aside={<span className="text-xs font-bold text-night">{t.area}</span>}>Өрөөнүүд</SectionTitle>
      <ul className="space-y-0.5">
        {t.plan.list.map((r) => {
          const idx = roomIndex(r.no);
          const on = idx !== undefined && focusRoom === idx;
          return (
            <li key={r.no}>
              <button
                type="button"
                disabled={idx === undefined}
                onClick={() => (on ? navigate({ level: "tour", unitId: unit.id, room: idx }) : api.setState({ focusRoom: idx ?? null }))}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-sm transition disabled:cursor-default",
                  on ? "bg-night text-white" : "hover:bg-night/5"
                )}
              >
                <span className="w-5 text-xs font-bold tabular-nums opacity-50">{r.no}</span>
                <span className="flex-1 font-semibold">{r.name}</span>
                <span className="font-extrabold tabular-nums">{r.area} м²</span>
                {on && <Icon name="walk" />}
              </button>
            </li>
          );
        })}
      </ul>

      <SectionTitle>Энэ давхрын бусад айл</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {neighbors.map((n) => (
          <Chip key={n.id} onClick={() => navigate({ level: "unit", unitId: n.id }, { replace: true })}>
            <StatusDot status={statuses[n.id] ?? "not_released"} /> {UNIT_TYPES[n.type].letter} · {n.id}
          </Chip>
        ))}
      </div>
      <MockNote>Интерьер ба тавилга нь mockup — бодит интерьерийг 3D файлаас ачаална. Талбай, өрөөний жагсаалт нь брошурын албан ёсны тоо.</MockNote>
    </>
  );
}

/* ---------------- L5 Аялал ---------------- */

export function TourPanel({ view }: { view: Extract<View, { level: "tour" }> }) {
  const tourRoom = useExplore((s) => s.tourRoom);
  const mode = useExplore((s) => s.mode);
  const api = useExploreApi();
  const navigate = useNavigate();
  const unit = unitById(view.unitId);
  const model = useMemo(() => {
    const p = unitPlacement(view.unitId);
    return p ? buildInterior(p.unit.type, p.frame.L, p.frame.D) : null;
  }, [view.unitId]);
  if (!unit || !model) return null;
  const t = UNIT_TYPES[unit.type];
  const current = tourRoom ?? defaultTourRoom(model);
  const room = current !== null ? model.rooms[current] : undefined;

  return (
    <>
      <PanelHeader
        kicker={`Айл ${unit.id} · ${t.title}`}
        title={room ? room.name : "Үүдний хэсэг"}
        sub={room ? `${room.area} м²` : "Шалан дээрх цагираг дээр дарж өрөө хооронд алхана."}
      />
      <p className="mt-3 rounded-xl bg-night/[0.04] px-3 py-2.5 text-xs font-semibold leading-relaxed text-night/80">
        {mode === "kiosk"
          ? "Шал эсвэл ногоон цагираг дээр дарж алхана · Чирж эргэн харна."
          : "Шал эсвэл ногоон цагираг дээр дарж алхана · Чирж эргэн харна · Гар: ↑↓ алхах, ←→ эргэх."}
      </p>
      <SectionTitle>Өрөө рүү шилжих</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {model.rooms
          .filter((r) => roomKind(r.name) !== "corridor")
          .map((r) => (
            <Chip
              key={r.index}
              active={current === r.index}
              onClick={() => navigate({ level: "tour", unitId: unit.id, room: r.index }, { replace: true })}
            >
              {r.name}
            </Chip>
          ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Btn tone="primary" onClick={() => api.setState({ lead: { unitId: unit.id } })}>
          Сонирхох
        </Btn>
        <Btn onClick={() => navigate({ level: "unit", unitId: unit.id })}>Гарах</Btn>
      </div>
      <MockNote>Mockup интерьер. Бодит 3D файлын интерьер ирэхэд яг ийм аргаар дотор нь алхана (360° зураг хэрэггүй).</MockNote>
    </>
  );
}
