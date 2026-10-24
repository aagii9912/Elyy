"use client";

/* Айлын интерьер — dollhouse (айлын түвшин) ба дотор нь алхах (аялал).
   Айл/аяллын түвшинд Blender-ээр bake хийсэн загвар (`baked.ts`,
   scripts/interiors) ачаална; ачаалах хооронд, мөн давхрын төлөвлөлтөд
   `lib/explore/interior.ts`-ийн процедур хувилбар харагдана. Өрөө сонгох,
   алхах нь хоёуланд нь процедур шалаар (үл үзэгдэх давхарга) явна.

   Аялал: шалан дээр дарж алхана, чирж эргэнэ (мэдрэгч дэлгэц ч мөн),
   гар дээр ↑↓ / W S — урагш хойш, ← → / A D — эргэх. */

import { Component, Suspense, use, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Color, Group, InstancedMesh, Object3D, Vector3 } from "three";
import type { CameraControlsImpl } from "@react-three/drei";
import { ROOM_HEIGHT, STATUS_META, TOWER_ROTATION, towerOf } from "@/lib/explore/config";
import {
  FLOOR_COLOR,
  buildInterior,
  defaultTourRoom,
  standPoint,
  type InteriorModel,
  type Item,
  type Piece,
} from "@/lib/explore/interior";
import { frameToWorld, unitPlacement, worldToFrame, type UnitPlacement } from "@/lib/explore/placement";
import { unitsOn } from "@/lib/explore/units";
import type { UnitTypeKey } from "@/lib/explore/types";
import { useExplore, useExploreApi, useNavigate } from "../store";
import { loadBakedInterior } from "./baked";
import { EYE } from "./CameraRig";

const tmp = new Object3D();
const C_WHITE = new Color("#ffffff");
const STATUS_COLOR = Object.fromEntries(
  Object.entries(STATUS_META).map(([k, v]) => [k, new Color(v.color)])
) as Record<string, Color>;

function Pieces({ items, color, opacity = 1, cast = true }: { items: Piece[]; color: string; opacity?: number; cast?: boolean }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    items.forEach((p, i) => {
      tmp.position.set(p.x, p.y, p.z);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(p.sx, p.sy, p.sz);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  const glass = opacity < 1;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow={cast && !glass} receiveShadow={!glass}>
      <boxGeometry />
      <meshStandardMaterial
        color={color}
        roughness={glass ? 0.08 : 0.9}
        metalness={0}
        transparent={glass}
        opacity={opacity}
        depthWrite={!glass}
      />
    </instancedMesh>
  );
}

function Furniture({ items }: { items: Item[] }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const c = new Color();
    items.forEach((p, i) => {
      tmp.position.set(p.x, p.y, p.z);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(p.sx, p.sy, p.sz);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      m.setColorAt(i, c.set(p.color));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow receiveShadow>
      <boxGeometry />
      <meshStandardMaterial color="#ffffff" roughness={0.8} />
    </instancedMesh>
  );
}

export function UnitInterior() {
  const view = useExplore((s) => s.view);
  /* Давхрын түвшин — давхрын бүх айлын төлөвлөлт (статусын өнгөтэй шал). */
  if (view.level === "floor") {
    return (
      <>
        {unitsOn(view.block, view.floor).map((u) => (
          <Interior key={u.id} unitId={u.id} tour={false} plan />
        ))}
      </>
    );
  }
  if (view.level !== "unit" && view.level !== "tour") return null;
  return <Interior key={view.unitId} unitId={view.unitId} tour={view.level === "tour"} />;
}

function Interior({ unitId, tour, plan = false }: { unitId: string; tour: boolean; plan?: boolean }) {
  const placement = useMemo(() => unitPlacement(unitId), [unitId]);
  const model = useMemo(
    () => (placement ? buildInterior(placement.unit.type, placement.frame.L, placement.frame.D) : null),
    [placement]
  );
  if (!placement || !model) return null;
  const t = towerOf(placement.unit.block);
  const f = placement.frame;
  const procedural = <Procedural model={model} tour={tour} floors={!plan} />;
  return (
    <group position={[t.x, 0, t.z]} rotation-y={TOWER_ROTATION}>
      <group position={[f.ox, placement.floorY, f.oz]} rotation-y={f.rotY}>
        <Floors model={model} placement={placement} tour={tour} plan={plan} ghost={!plan} />
        {plan ? (
          procedural
        ) : (
          <BakedBoundary fallback={procedural}>
            <Suspense fallback={procedural}>
              <Baked type={placement.unit.type} tour={tour} />
            </Suspense>
          </BakedBoundary>
        )}
      </group>
      {tour && <TourControls model={model} placement={placement} />}
    </group>
  );
}

/** Blender-ийн загвар (лайтмаптай). */
function Baked({ type, tour }: { type: UnitTypeKey; tour: boolean }) {
  const baked = use(loadBakedInterior(type));
  return (
    <>
      {baked.room.map((o) => (
        <primitive key={o.uuid} object={o} />
      ))}
      {tour && baked.ceiling.map((o) => <primitive key={o.uuid} object={o} />)}
    </>
  );
}

/** Загвар ачаалагдахгүй бол (файл алга, сүлжээ) процедур хувилбар. */
class BakedBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Процедур интерьер — давхрын төлөвлөлт, ачаалах үеийн орлуулга. */
function Procedural({ model, tour, floors }: { model: InteriorModel; tour: boolean; floors: boolean }) {
  return (
    <>
      {floors &&
        model.rooms.map((r) => (
          <mesh key={r.index} position={[(r.x0 + r.x1) / 2, 0.02, (r.z0 + r.z1) / 2]} receiveShadow>
            <boxGeometry args={[r.x1 - r.x0, 0.04, r.z1 - r.z0]} />
            <meshStandardMaterial color={FLOOR_COLOR[r.kind]} roughness={0.75} />
          </mesh>
        ))}
      <Pieces items={model.walls} color="#f3f0ea" />
      <Pieces items={model.caps} color="#2f3433" cast={false} />
      <Pieces items={model.frames} color="#3a3f3e" />
      <Pieces items={model.glass} color="#d4e6ec" opacity={0.22} />
      <Furniture items={model.furniture} />
      {tour && (
        <mesh position={[model.L / 2, ROOM_HEIGHT - 0.01, model.D / 2]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[model.L + 0.5, model.D + 0.5]} />
          <meshStandardMaterial color="#fbfaf7" roughness={1} />
        </mesh>
      )}
    </>
  );
}

function Floors({
  model,
  placement,
  tour,
  plan,
  ghost,
}: {
  model: InteriorModel;
  placement: UnitPlacement;
  tour: boolean;
  plan: boolean;
  /** Загварын дээрх үл үзэгдэх сонголтын давхарга (идэвхтэй өрөөг тодруулна). */
  ghost: boolean;
}) {
  const api = useExploreApi();
  const navigate = useNavigate();
  const focusRoom = useExplore((s) => s.focusRoom);
  const tourRoom = useExplore((s) => s.tourRoom);
  const id = placement.unit.id;
  const status = useExplore((s) => s.inventory.units[id] ?? "not_released");
  const picked = useExplore((s) => s.picked === id);
  const hovered = useExplore((s) => s.hover?.kind === "unit" && s.hover.id === id);
  const [hot, setHot] = useState<number | null>(null);
  const pointerType = useRef("mouse");
  const controls = useThree((s) => s.controls) as CameraControlsImpl | null;
  const type = placement.unit.type;

  /* Давхрын төлөвлөлтөөс айл сонгоход загварыг урьдчилан татна. */
  useEffect(() => {
    if (plan && picked) loadBakedInterior(type).catch(() => {});
  }, [plan, picked, type]);

  const moveTo = (wx: number, wz: number) => {
    if (!controls) return;
    const local = worldToFrame(placement, wx, wz);
    const loggia = model.rooms.find((r) => r.kind === "loggia");
    let z = Math.min(Math.max(local.z, 0.35), model.D - 0.35);
    const x = Math.min(Math.max(local.x, 0.35), model.L - 0.35);
    if (local.z < 0 && loggia && x > loggia.x0 + 0.3 && x < loggia.x1 - 0.3) z = Math.max(local.z, loggia.z0 + 0.35);
    const w = frameToWorld(placement, x, z);
    const pos = new Vector3();
    const tgt = new Vector3();
    controls.getPosition(pos);
    controls.getTarget(tgt);
    const dir = tgt.sub(pos).normalize();
    const y = placement.floorY + EYE;
    controls.setLookAt(w.x, y, w.z, w.x + dir.x * 0.1, y + dir.y * 0.1, w.z + dir.z * 0.1, true);
    const room = model.rooms.find((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1);
    if (room) api.setState({ tourRoom: room.index });
  };

  return (
    <>
      {model.rooms.map((r) => {
        const active = tour ? tourRoom === r.index : focusRoom === r.index || hot === r.index;
        const color = new Color(FLOOR_COLOR[r.kind]);
        if (plan) {
          /* Давхрын төлөвлөлт: шал нь айлын статусын өнгөөр. */
          color.lerp(STATUS_COLOR[status], 0.72);
          if (picked || hovered) color.lerp(C_WHITE, 0.4);
        } else if (active && !tour) color.lerp(C_WHITE, 0.35);
        return (
          <mesh
            key={r.index}
            position={[(r.x0 + r.x1) / 2, 0.02, (r.z0 + r.z1) / 2]}
            receiveShadow
            onPointerDown={(e) => (pointerType.current = e.nativeEvent.pointerType || "mouse")}
            onPointerMove={(e) => {
              if (e.nativeEvent.pointerType !== "mouse") return;
              e.stopPropagation();
              if (plan) {
                if (!hovered) api.setState({ hover: { kind: "unit", id } });
              } else if (hot !== r.index) setHot(r.index);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              if (plan) {
                if (api.getState().hover?.kind === "unit") api.setState({ hover: null });
              } else setHot((h) => (h === r.index ? null : h));
              document.body.style.cursor = "";
            }}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              if (e.delta > 6) return;
              e.stopPropagation();
              if (tour) return moveTo(e.point.x, e.point.z);
              if (plan) {
                if (api.getState().picked === id) navigate({ level: "unit", unitId: id });
                else api.setState({ picked: id });
                return;
              }
              const touch = pointerType.current !== "mouse";
              if (touch && api.getState().focusRoom !== r.index) api.setState({ focusRoom: r.index });
              else navigate({ level: "tour", unitId: id, room: r.index });
            }}
          >
            <boxGeometry args={[r.x1 - r.x0, 0.04, r.z1 - r.z0]} />
            {ghost ? (
              <meshBasicMaterial color="#ffffff" transparent opacity={active && !tour ? 0.22 : 0} depthWrite={false} />
            ) : (
              <meshStandardMaterial color={color} roughness={0.75} />
            )}
          </mesh>
        );
      })}
      {tour && (
        <Rings
          model={model}
          type={type}
          onPick={(x, z) => {
            const w = frameToWorld(placement, x, z);
            moveTo(w.x, w.z);
          }}
        />
      )}
    </>
  );
}

/** Өрөө бүрийн зогсох цэгт (тавилгагүй) гэрэлтэх цагираг — дарахад тийш «алхана». */
function Rings({ model, type, onPick }: { model: InteriorModel; type: UnitTypeKey; onPick: (x: number, z: number) => void }) {
  const tourRoom = useExplore((s) => s.tourRoom) ?? defaultTourRoom(model);
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.08;
    g.children.forEach((c) => c.scale.set(s, s, s));
  });
  return (
    <group ref={group}>
      {model.rooms
        .filter((r) => r.index !== tourRoom && (r.x1 - r.x0) > 0.9 && (r.z1 - r.z0) > 0.9)
        .map((r) => {
          const p = standPoint(type, r);
          return (
            <mesh
              key={r.index}
              position={[p.x, 0.06, p.z]}
              rotation-x={-Math.PI / 2}
              onClick={(e) => {
                if (e.delta > 6) return;
                e.stopPropagation();
                onPick(p.x, p.z);
              }}
            >
              <ringGeometry args={[0.26, 0.4, 32]} />
              <meshBasicMaterial color="#c5d996" transparent opacity={0.9} depthWrite={false} />
            </mesh>
          );
        })}
    </group>
  );
}

/** Гараар алхах (вэб). */
function TourControls({ model, placement }: { model: InteriorModel; placement: UnitPlacement }) {
  const controls = useThree((s) => s.controls) as CameraControlsImpl | null;
  const api = useExploreApi();

  useEffect(() => {
    if (!controls) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      const turn = k === "arrowleft" || k === "a" ? 1 : k === "arrowright" || k === "d" ? -1 : 0;
      const step = k === "arrowup" || k === "w" ? 0.7 : k === "arrowdown" || k === "s" ? -0.7 : 0;
      if (turn) {
        e.preventDefault();
        controls.rotate((turn * Math.PI) / 12, 0, true);
        return;
      }
      if (!step) return;
      e.preventDefault();
      const pos = new Vector3();
      const tgt = new Vector3();
      controls.getPosition(pos);
      controls.getTarget(tgt);
      const dir = tgt.clone().sub(pos).setY(0).normalize();
      const next = pos.clone().addScaledVector(dir, step);
      const local = worldToFrame(placement, next.x, next.z);
      const x = Math.min(Math.max(local.x, 0.35), model.L - 0.35);
      const z = Math.min(Math.max(local.z, -1), model.D - 0.35);
      const w = frameToWorld(placement, x, z);
      const look = tgt.sub(pos).normalize();
      controls.setLookAt(w.x, pos.y, w.z, w.x + look.x * 0.1, pos.y + look.y * 0.1, w.z + look.z * 0.1, true);
      const room = model.rooms.find((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1);
      if (room) api.setState({ tourRoom: room.index });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [controls, model, placement, api]);

  return null;
}
