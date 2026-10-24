"use client";

/* 4 цамхаг — айл бүр тусдаа хайрцаг (instancing, 440), давхрын хучилт,
   лифтний цөм, 1-р давхрын шил, дээвэр, титэм. Нэг draw call-аар
   зурагдаж, түвшнээс хамаарч өнгө, харагдах байдал нь солигдоно:
     • хотхон/байршил — фасадын өнгө, курсор очсон блок тодорно,
     • блок — айлууд статусын өнгөөр (шүүлтүүрт тохирохгүй нь бүдэг),
     • давхар — дээд давхрууд нуугдаж, сонгосон давхрын айлууд статусаар,
     • айл/аялал — тухайн айлын хайрцаг нуугдаж интерьер харагдана.
   Бодит 3D файл ирэхэд айл бүрийн mesh нь `UNIT_<блок>_<давхар>_<байрлал>`
   нэрээр энэ бүтцийг орлоно (docs/3D-INTERACTIVE-PLAN.md §5.6). */

import { useLayoutEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Color, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import {
  FIRST_RESIDENTIAL_FLOOR,
  FLOOR_HEIGHT,
  GROUND_FLOOR_HEIGHT,
  PALETTE,
  ROOF_Y,
  SLAB,
  STATUS_META,
  TOP_FLOOR,
  TOWERS,
  TOWER_ROTATION,
  floorBase,
  towerToWorld,
} from "@/lib/explore/config";
import { CORE, PLATE_TYP, plateFor, toLocalRect, type LocalRect } from "@/lib/explore/plates";
import { matchesFilters, type Filters } from "@/lib/explore/filters";
import { parseUnitId, unitById, type UnitRef } from "@/lib/explore/units";
import type { StatusMap, View } from "@/lib/explore/types";
import { useExplore, useExploreApi, useNavigate, type Hover } from "../store";

type UnitInst = { unit: UnitRef; matrix: Matrix4 };
type StructInst = { block: number; floor: number; matrix: Matrix4; color: string };

const UP = new Vector3(0, 1, 0);
const ZERO = new Matrix4().makeScale(0, 0, 0);

function buildTowers() {
  const q = new Quaternion().setFromAxisAngle(UP, TOWER_ROTATION);
  const box = (block: number, r: LocalRect, y0: number, y1: number, pad: number) => {
    const c = towerToWorld(block, r.cx, r.cz);
    return new Matrix4().compose(
      new Vector3(c.x, (y0 + y1) / 2, c.z),
      q,
      new Vector3(r.w + pad * 2, y1 - y0, r.d + pad * 2)
    );
  };
  const core = toLocalRect(CORE);
  const units: UnitInst[] = [];
  const structs: StructInst[] = [];

  for (const t of TOWERS) {
    const b = t.block;
    for (const s of PLATE_TYP) {
      structs.push({ block: b, floor: 1, matrix: box(b, toLocalRect(s), 0, GROUND_FLOOR_HEIGHT - 0.05, -0.2), color: PALETTE.glass });
    }
    structs.push({ block: b, floor: 1, matrix: box(b, core, 0, GROUND_FLOOR_HEIGHT, 0), color: PALETTE.core });

    for (let floor = FIRST_RESIDENTIAL_FLOOR; floor <= TOP_FLOOR; floor++) {
      const base = floorBase(floor);
      for (const s of plateFor(floor) ?? []) {
        const r = toLocalRect(s);
        structs.push({ block: b, floor, matrix: box(b, r, base, base + SLAB, 0.12), color: PALETTE.slab });
        const unit = unitById(`${b}-${String(floor).padStart(2, "0")}${String(s.slot).padStart(2, "0")}`);
        if (!unit) continue;
        units.push({ unit, matrix: box(b, r, base + SLAB, base + FLOOR_HEIGHT, -0.05) });
      }
      structs.push({ block: b, floor, matrix: box(b, core, base, base + FLOOR_HEIGHT, 0), color: PALETTE.core });
    }

    for (const s of PLATE_TYP) {
      structs.push({ block: b, floor: TOP_FLOOR + 1, matrix: box(b, toLocalRect(s), ROOF_Y, ROOF_Y + 0.5, 0.12), color: PALETTE.slab });
    }
    structs.push({ block: b, floor: TOP_FLOOR + 1, matrix: box(b, core, ROOF_Y, ROOF_Y + 4.2, 0.6), color: PALETTE.crown });
  }
  return { units, structs };
}

/** Түвшин бүрд «таслах» давхар — түүнээс дээш нуугдана. */
function cutOf(view: View): { block: number; floor: number } | null {
  if (view.level === "floor") return { block: view.block, floor: view.floor };
  if (view.level === "unit") {
    const u = parseUnitId(view.unitId);
    return u ? { block: u.block, floor: u.floor } : null;
  }
  return null;
}

const C_FACADE = new Color(PALETTE.facade);
const C_HOVER = new Color(PALETTE.facadeHover);
const C_MUTED = new Color(PALETTE.muted);
const C_WHITE = new Color("#ffffff");
const STATUS_COLOR = Object.fromEntries(
  Object.entries(STATUS_META).map(([k, v]) => [k, new Color(v.color)])
) as Record<string, Color>;

function unitColor(
  out: Color,
  u: UnitRef,
  view: View,
  hover: Hover,
  picked: string | null,
  filters: Filters,
  statuses: StatusMap
) {
  const status = statuses[u.id] ?? "not_released";
  const statusColor = STATUS_COLOR[status];
  switch (view.level) {
    case "location":
    case "site":
    case "basement":
      out.copy(hover?.kind === "block" && hover.block === u.block ? C_HOVER : C_FACADE);
      return;
    case "block": {
      if (u.block !== view.block) {
        out.copy(hover?.kind === "block" && hover.block === u.block ? C_HOVER : C_FACADE);
        return;
      }
      out.copy(matchesFilters(u, filters, status) ? statusColor : C_MUTED);
      const floorHot =
        (hover?.kind === "floor" && hover.floor === u.floor) || picked === `floor:${u.floor}`;
      if (floorHot) out.lerp(C_WHITE, 0.4);
      return;
    }
    case "floor": {
      if (u.block === view.block && u.floor === view.floor) {
        out.copy(statusColor);
        if (picked === u.id || (hover?.kind === "unit" && hover.id === u.id)) out.lerp(C_WHITE, 0.45);
        return;
      }
      out.copy(hover?.kind === "floor" && hover.block === u.block && hover.floor === u.floor ? C_HOVER : C_FACADE);
      return;
    }
    case "unit":
    case "tour": {
      out.copy(hover?.kind === "unit" && hover.id === u.id ? C_HOVER : C_FACADE);
      return;
    }
  }
}

export function Towers() {
  const view = useExplore((s) => s.view);
  const hover = useExplore((s) => s.hover);
  const picked = useExplore((s) => s.picked);
  const filters = useExplore((s) => s.filters);
  const statuses = useExplore((s) => s.inventory.units);
  const api = useExploreApi();
  const navigate = useNavigate();

  const { units, structs } = useMemo(() => buildTowers(), []);
  const unitRef = useRef<InstancedMesh>(null);
  const structRef = useRef<InstancedMesh>(null);
  const pointerType = useRef("mouse");

  const viewKey = JSON.stringify(view);

  /* Харагдах байдал + өнгө */
  useLayoutEffect(() => {
    const um = unitRef.current;
    const sm = structRef.current;
    if (!um || !sm) return;
    const cut = cutOf(view);
    const focusId = view.level === "unit" || view.level === "tour" ? view.unitId : null;
    const c = new Color();
    units.forEach((inst, i) => {
      const u = inst.unit;
      const planFloor = view.level === "floor" && u.block === view.block && u.floor === view.floor;
      const hidden = (cut && u.block === cut.block && u.floor > cut.floor) || u.id === focusId || planFloor;
      um.setMatrixAt(i, hidden ? ZERO : inst.matrix);
      unitColor(c, u, view, hover, picked, filters, statuses);
      um.setColorAt(i, c);
    });
    structs.forEach((inst, i) => {
      const hidden = cut && inst.block === cut.block && inst.floor > cut.floor;
      sm.setMatrixAt(i, hidden ? ZERO : inst.matrix);
      c.set(inst.color);
      if (
        (view.level === "site" || view.level === "location") &&
        hover?.kind === "block" &&
        hover.block === inst.block &&
        inst.color === PALETTE.core
      ) {
        c.lerp(C_HOVER, 0.6);
      }
      sm.setColorAt(i, c);
    });
    um.instanceMatrix.needsUpdate = true;
    sm.instanceMatrix.needsUpdate = true;
    if (um.instanceColor) um.instanceColor.needsUpdate = true;
    if (sm.instanceColor) sm.instanceColor.needsUpdate = true;
    um.computeBoundingSphere();
    sm.computeBoundingSphere();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey, hover, picked, filters, statuses, units, structs]);

  const xray = view.level === "basement";

  const infoOf = (kind: "unit" | "struct", id: number | undefined) => {
    if (id === undefined) return null;
    if (kind === "unit") {
      const u = units[id]?.unit;
      return u ? { block: u.block, floor: u.floor, unitId: u.id } : null;
    }
    const s = structs[id];
    return s ? { block: s.block, floor: s.floor, unitId: null as string | null } : null;
  };

  const hoverFor = (info: { block: number; floor: number; unitId: string | null }): Hover => {
    const v = api.getState().view;
    const residential = info.floor >= FIRST_RESIDENTIAL_FLOOR && info.floor <= TOP_FLOOR;
    switch (v.level) {
      case "location":
      case "site":
      case "basement":
        return { kind: "block", block: info.block };
      case "block":
        return info.block === v.block && residential
          ? { kind: "floor", block: info.block, floor: info.floor }
          : { kind: "block", block: info.block };
      case "floor":
        if (info.block !== v.block) return { kind: "block", block: info.block };
        if (info.floor === v.floor && info.unitId) return { kind: "unit", id: info.unitId };
        return residential ? { kind: "floor", block: info.block, floor: info.floor } : null;
      case "unit": {
        const u = parseUnitId(v.unitId);
        return u && info.unitId && info.block === u.block && info.floor === u.floor ? { kind: "unit", id: info.unitId } : null;
      }
      case "tour":
        return null;
    }
  };

  const onMove = (kind: "unit" | "struct") => (e: ThreeEvent<PointerEvent>) => {
    if (e.nativeEvent.pointerType !== "mouse") return;
    const info = infoOf(kind, e.instanceId);
    if (!info) return;
    const next = hoverFor(info);
    if (next) e.stopPropagation();
    const cur = api.getState().hover;
    if (JSON.stringify(cur) !== JSON.stringify(next)) api.setState({ hover: next });
    document.body.style.cursor = next ? "pointer" : "";
  };

  const onOut = () => {
    if (api.getState().hover) api.setState({ hover: null });
    document.body.style.cursor = "";
  };

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    pointerType.current = e.nativeEvent.pointerType || "mouse";
  };

  const onClick = (kind: "unit" | "struct") => (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6) return;
    const info = infoOf(kind, e.instanceId);
    if (!info) return;
    const s = api.getState();
    const v = s.view;
    const touch = pointerType.current !== "mouse";
    const residential = info.floor >= FIRST_RESIDENTIAL_FLOOR && info.floor <= TOP_FLOOR;
    if (v.level === "tour") return;
    e.stopPropagation();
    switch (v.level) {
      case "location":
        navigate({ level: "site" });
        return;
      case "site":
      case "basement":
        navigate({ level: "block", block: info.block });
        return;
      case "block": {
        if (info.block !== v.block) return navigate({ level: "block", block: info.block });
        if (!residential) return;
        const key = `floor:${info.floor}`;
        if (touch && s.picked !== key) api.setState({ picked: key });
        else navigate({ level: "floor", block: info.block, floor: info.floor });
        return;
      }
      case "floor": {
        if (info.block !== v.block) return navigate({ level: "block", block: info.block });
        if (info.floor === v.floor && info.unitId) {
          if (s.picked === info.unitId) navigate({ level: "unit", unitId: info.unitId });
          else api.setState({ picked: info.unitId });
          return;
        }
        if (residential) navigate({ level: "floor", block: info.block, floor: info.floor });
        return;
      }
      case "unit": {
        const u = parseUnitId(v.unitId);
        if (u && info.unitId && info.block === u.block && info.floor === u.floor && info.unitId !== v.unitId) {
          navigate({ level: "unit", unitId: info.unitId });
        }
        return;
      }
    }
  };

  return (
    <group>
      <instancedMesh
        ref={unitRef}
        args={[undefined, undefined, units.length]}
        castShadow={!xray}
        receiveShadow
        onPointerMove={onMove("unit")}
        onPointerOut={onOut}
        onPointerDown={onDown}
        onClick={onClick("unit")}
      >
        <boxGeometry />
        <meshStandardMaterial color="#ffffff" roughness={0.82} transparent={xray} opacity={xray ? 0.07 : 1} depthWrite={!xray} />
      </instancedMesh>
      <instancedMesh
        ref={structRef}
        args={[undefined, undefined, structs.length]}
        castShadow={!xray}
        receiveShadow
        onPointerMove={onMove("struct")}
        onPointerOut={onOut}
        onPointerDown={onDown}
        onClick={onClick("struct")}
      >
        <boxGeometry />
        <meshStandardMaterial color="#ffffff" roughness={0.7} transparent={xray} opacity={xray ? 0.07 : 1} depthWrite={!xray} />
      </instancedMesh>
    </group>
  );
}
