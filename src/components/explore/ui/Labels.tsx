"use client";

/* 3D дээрх шошгууд (цамхаг, давхар, айл, өрөө, байршил, зоорь).
   DOM-д энгийн элемент болж үүсэж, байрлалыг нь `LabelProjector`
   кадр бүрд камераас тооцож бичнэ. */

import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BASEMENT_HEIGHT,
  BLOCKS,
  FLOOR_HEIGHT,
  ROOF_Y,
  STATUS_META,
  basementFloorY,
  blockLabel,
  floorBase,
  floorLabel,
  towerOf,
  towerToWorld,
} from "@/lib/explore/config";
import { buildInterior } from "@/lib/explore/interior";
import { BASEMENT_CORES, parkingById } from "@/lib/explore/parking";
import { frameToWorld, unitPlacement } from "@/lib/explore/placement";
import { slotOf, unitsOn, UNIT_TYPES, ALL_UNITS } from "@/lib/explore/units";
import { toLocalRect } from "@/lib/explore/plates";
import { placePois } from "@/lib/explore/pois";
import { AMENITIES } from "@/lib/explore/site";
import type { View } from "@/lib/explore/types";
import { cn } from "@/lib/utils";
import { useExplore, useExploreApi, useNavigate } from "../store";

function Anchor({
  id,
  x,
  y,
  z,
  interactive,
  children,
}: {
  id: string;
  x: number;
  y: number;
  z: number;
  interactive?: boolean;
  children: React.ReactNode;
}) {
  const api = useExploreApi();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const anchors = api.getState().anchors;
    anchors.set(id, { x, y, z, el: ref.current });
    return () => {
      anchors.delete(id);
    };
  }, [api, id, x, y, z]);
  return (
    <div
      ref={ref}
      className={cn("absolute top-0 left-0 will-change-transform", interactive ? "pointer-events-auto" : "pointer-events-none")}
      style={{ transform: "translate3d(-9999px, -9999px, 0)", visibility: "hidden" }}
    >
      {children}
    </div>
  );
}

export function Labels() {
  const view = useExplore((s) => s.view);
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <LevelLabels view={view} />
    </div>
  );
}

function LevelLabels({ view }: { view: View }) {
  switch (view.level) {
    case "location":
      return <LocationLabels />;
    case "site":
      return <SiteLabels />;
    case "block":
      return <BlockLabels block={view.block} />;
    case "floor":
      return <FloorLabels block={view.block} floor={view.floor} />;
    case "unit":
      return <RoomLabels unitId={view.unitId} />;
    case "basement":
      return <BasementLabels level={view.basement} parkingId={view.parkingId} />;
    case "tour":
      return null;
  }
}

function LocationLabels() {
  const pins = useExplore((s) => s.site.pins);
  const active = useExplore((s) => s.poi);
  const api = useExploreApi();
  const pois = useMemo(() => placePois(pins), [pins]);
  return (
    <>
      <Anchor id="brand" x={0} y={ROOF_Y + 46} z={-35}>
        <div className="explore-tag explore-tag--brand">Elysium Residence</div>
      </Anchor>
      {pois.map((p) => (
        <Anchor key={p.index} id={`poi-${p.index}`} x={p.wx} y={66} z={p.wz} interactive>
          <button
            type="button"
            aria-pressed={p.index === active}
            aria-label={`${p.index + 1}. ${p.place}`}
            title={p.place}
            className={cn("explore-pin", p.index === active && "is-active")}
            onClick={() => api.setState({ poi: p.index === active ? null : p.index })}
          >
            {p.index + 1}
          </button>
        </Anchor>
      ))}
    </>
  );
}

function SiteLabels() {
  const statuses = useExplore((s) => s.inventory.units);
  const amenity = useExplore((s) => s.amenity);
  const api = useExploreApi();
  const navigate = useNavigate();
  const free = useMemo(() => {
    const out: Record<number, number> = {};
    for (const u of ALL_UNITS) if (statuses[u.id] === "available") out[u.block] = (out[u.block] ?? 0) + 1;
    return out;
  }, [statuses]);
  return (
    <>
      {BLOCKS.map((b) => {
        const t = towerOf(b);
        return (
          <Anchor key={b} id={`tower-${b}`} x={t.x} y={ROOF_Y + 14} z={t.z} interactive>
            <button
              type="button"
              className="explore-tag explore-tag--button"
              onMouseEnter={() => api.setState({ hover: { kind: "block", block: b } })}
              onMouseLeave={() => api.setState({ hover: null })}
              onClick={() => navigate({ level: "block", block: b })}
            >
              <strong>{blockLabel(b)}</strong>
              <span>{free[b] ?? 0} сул</span>
            </button>
          </Anchor>
        );
      })}
      {AMENITIES.map((a, i) => (
        <Anchor key={a.id} id={`amenity-${a.id}`} x={a.x} y={a.y + 6} z={a.z} interactive>
          <button
            type="button"
            aria-pressed={amenity === a.id}
            aria-label={a.title}
            title={a.title}
            className={cn("explore-pin explore-pin--soft", amenity === a.id && "is-active")}
            onClick={() =>
              a.basement ? navigate({ level: "basement", basement: "B1" }) : api.setState({ amenity: amenity === a.id ? null : a.id })
            }
          >
            {a.basement ? "P" : i + 1}
          </button>
        </Anchor>
      ))}
    </>
  );
}

function BlockLabels({ block }: { block: number }) {
  const hover = useExplore((s) => s.hover);
  const picked = useExplore((s) => s.picked);
  const statuses = useExplore((s) => s.inventory.units);
  const floor =
    hover?.kind === "floor" && hover.block === block ? hover.floor : picked?.startsWith("floor:") ? Number(picked.slice(6)) : null;
  if (!floor) return null;
  const at = towerToWorld(block, 14, 9);
  const free = unitsOn(block, floor).filter((u) => statuses[u.id] === "available").length;
  return (
    <Anchor id="floor-tag" x={at.x} y={floorBase(floor) + 1.5} z={at.z}>
      <div className="explore-tag">
        <strong>{floorLabel(floor)}</strong>
        <span>{free} сул</span>
      </div>
    </Anchor>
  );
}

function FloorLabels({ block, floor }: { block: number; floor: number }) {
  const statuses = useExplore((s) => s.inventory.units);
  const picked = useExplore((s) => s.picked);
  const api = useExploreApi();
  const navigate = useNavigate();
  const t = towerOf(block);
  return (
    <>
      {unitsOn(block, floor).map((u) => {
        const slot = slotOf(u);
        if (!slot) return null;
        const r = toLocalRect(slot);
        const at = towerToWorld(t.block, r.cx, r.cz);
        const status = statuses[u.id] ?? "not_released";
        const on = picked === u.id;
        return (
          <Anchor key={u.id} id={`unit-${u.id}`} x={at.x} y={floorBase(floor) + FLOOR_HEIGHT + 0.6} z={at.z} interactive>
            <button
              type="button"
              aria-pressed={on}
              onMouseEnter={() => api.setState({ hover: { kind: "unit", id: u.id } })}
              onMouseLeave={() => api.setState({ hover: null })}
              onClick={() => (on ? navigate({ level: "unit", unitId: u.id }) : api.setState({ picked: u.id }))}
              className={cn("explore-tag explore-tag--button", on && "explore-tag--dark")}
            >
              <span className="explore-dot" style={{ background: STATUS_META[status].ui }} />
              <strong>{UNIT_TYPES[u.type].letter}</strong>
              <span>{u.id}</span>
            </button>
          </Anchor>
        );
      })}
    </>
  );
}

function RoomLabels({ unitId }: { unitId: string }) {
  const labels = useMemo(() => {
    const p = unitPlacement(unitId);
    if (!p) return [];
    const model = buildInterior(p.unit.type, p.frame.L, p.frame.D);
    return model.rooms
      .filter((r) => r.kind === "loggia" || Number.parseFloat(r.area) >= 6)
      .map((r) => ({ ...r, at: frameToWorld(p, (r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2), y: p.floorY + 0.5 }));
  }, [unitId]);
  return (
    <>
      {labels.map((r) => (
        <Anchor key={r.index} id={`room-${r.index}`} x={r.at.x} y={r.y} z={r.at.z}>
          <div className="explore-room">
            <span>{r.name}</span>
            <strong>{r.area} м²</strong>
          </div>
        </Anchor>
      ))}
    </>
  );
}

function BasementLabels({ level, parkingId }: { level: "B1" | "B2"; parkingId?: string }) {
  const statuses = useExplore((s) => s.inventory.parking);
  const y = basementFloorY(level);
  const space = parkingId ? parkingById(parkingId) : undefined;
  return (
    <>
      {BASEMENT_CORES.map((c) => (
        <Anchor key={c.block} id={`core-${c.block}`} x={c.cx} y={y + BASEMENT_HEIGHT + 0.6} z={c.cz}>
          <div className="explore-tag explore-tag--dark">
            <strong>{blockLabel(c.block)}</strong>
            <span>лифт</span>
          </div>
        </Anchor>
      ))}
      {space && space.level === level && (
        <Anchor id="space" x={space.x} y={y + 2.2} z={space.z}>
          <div className="explore-tag">
            <span className="explore-dot" style={{ background: STATUS_META[statuses[space.id] ?? "not_released"].ui }} />
            <strong>{space.id}</strong>
          </div>
        </Anchor>
      )}
    </>
  );
}
