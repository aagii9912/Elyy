"use client";

/* Зоорь (B1/B2) — MOCKUP. Сонгосон давхар бүрэн, нөгөө нь сүүдэр
   маягаар. Зогсоол бүр статусын өнгөтэй (instancing), EV болон
   хөгжлийн бэрхшээлтэй байрууд тэмдэгтэй. Сонгосон байрнаас хамгийн
   ойр лифт хүртэлх зам тасархай шугамаар харагдана. */

import { useLayoutEffect, useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D } from "three";
import {
  BASEMENT_HEIGHT,
  BASEMENT_LEVELS,
  PALETTE,
  STATUS_META,
  basementFloorY,
} from "@/lib/explore/config";
import {
  AISLES,
  BASEMENT_BOUNDS,
  BASEMENT_CORES,
  INNER_RAMP,
  PARKING,
  SPACE_D,
  SPACE_W,
  basementColumns,
  parkingById,
} from "@/lib/explore/parking";
import type { BasementLevel } from "@/lib/explore/types";
import { useExplore, useExploreApi, useNavigate } from "../store";

const tmp = new Object3D();
const C_MUTED = new Color("#8d918d");
const C_WHITE = new Color("#ffffff");
const STATUS_COLOR = Object.fromEntries(
  Object.entries(STATUS_META).map(([k, v]) => [k, new Color(v.color)])
) as Record<string, Color>;

export function Basement() {
  const view = useExplore((s) => s.view);
  if (view.level !== "basement") return null;
  return (
    <group>
      <Walls />
      {BASEMENT_LEVELS.map((level) => (
        <BasementLevelMesh key={level} level={level} active={level === view.basement} />
      ))}
    </group>
  );
}

function BasementLevelMesh({ level, active }: { level: BasementLevel; active: boolean }) {
  const y = basementFloorY(level);
  const w = BASEMENT_BOUNDS.x1 - BASEMENT_BOUNDS.x0;
  const d = BASEMENT_BOUNDS.z1 - BASEMENT_BOUNDS.z0;
  const cx = (BASEMENT_BOUNDS.x0 + BASEMENT_BOUNDS.x1) / 2;
  const cz = (BASEMENT_BOUNDS.z0 + BASEMENT_BOUNDS.z1) / 2;
  const ghost = !active;

  return (
    <group>
      <mesh position={[cx, y - 0.15, cz]} receiveShadow>
        <boxGeometry args={[w, 0.3, d]} />
        <meshStandardMaterial
          color={PALETTE.basementFloor}
          roughness={1}
          transparent={ghost}
          opacity={ghost ? 0.18 : 1}
          depthWrite={!ghost}
        />
      </mesh>
      {active && (
        <>
          {AISLES.map((a, i) => (
            <mesh key={i} position={[cx, y + 0.02, a.cz]}>
              <boxGeometry args={[w - 2, 0.02, a.z1 - a.z0]} />
              <meshStandardMaterial color="#b4b7b2" roughness={1} />
            </mesh>
          ))}
          <Columns y={y} />
          <Spaces level={level} />
          <Cores y={y} />
          <InnerRamp y={y} level={level} />
          <SelectedPath level={level} />
        </>
      )}
    </group>
  );
}

/** Тулгуур хана — хоёр давхрыг бүтэн хамарна, тунгалаг (дотор нь харагдана). */
function Walls() {
  const { x0, x1, z0, z1 } = BASEMENT_BOUNDS;
  const bottom = basementFloorY("B2") - 0.3;
  const h = -bottom;
  const segs: [number, number, number, number][] = [
    [x0, x1, z0, z0],
    [x0, x1, z1, z1],
    [x0, x0, z0, z1],
    [x1, x1, z0, z1],
  ];
  return (
    <>
      {segs.map(([a0, a1, b0, b1], i) => (
        <mesh key={i} position={[(a0 + a1) / 2, bottom + h / 2, (b0 + b1) / 2]}>
          <boxGeometry args={[Math.max(a1 - a0, 0.4), h, Math.max(b1 - b0, 0.4)]} />
          <meshStandardMaterial color={PALETTE.basementWall} roughness={1} transparent opacity={0.32} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function Columns({ y }: { y: number }) {
  const cols = useMemo(() => basementColumns(), []);
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    cols.forEach(([x, z], i) => {
      tmp.position.set(x, y + (BASEMENT_HEIGHT - 0.3) / 2, z);
      tmp.scale.set(0.55, BASEMENT_HEIGHT - 0.3, 0.55);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [cols, y]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cols.length]} castShadow>
      <boxGeometry />
      <meshStandardMaterial color="#d7d6d0" roughness={1} />
    </instancedMesh>
  );
}

function Spaces({ level }: { level: BasementLevel }) {
  const spaces = PARKING[level];
  const statuses = useExplore((s) => s.inventory.parking);
  const view = useExplore((s) => s.view);
  const hover = useExplore((s) => s.hover);
  const kinds = useExplore((s) => s.parkingKinds);
  const block = useExplore((s) => s.parkingBlock);
  const api = useExploreApi();
  const navigate = useNavigate();
  const y = basementFloorY(level);
  const ref = useRef<InstancedMesh>(null);
  const evRef = useRef<InstancedMesh>(null);
  const accRef = useRef<InstancedMesh>(null);
  const selected = view.level === "basement" ? view.parkingId : undefined;

  const ev = useMemo(() => spaces.filter((s) => s.kind === "ev"), [spaces]);
  const acc = useMemo(() => spaces.filter((s) => s.kind === "accessible"), [spaces]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const c = new Color();
    spaces.forEach((s, i) => {
      const hot = s.id === selected || (hover?.kind === "parking" && hover.id === s.id);
      tmp.position.set(s.x, y + (hot ? 0.25 : 0.06), s.z);
      tmp.scale.set(SPACE_W - 0.22, hot ? 0.5 : 0.1, SPACE_D - 0.25);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      const match = (!kinds.length || kinds.includes(s.kind)) && (block === null || s.nearestBlock === block);
      c.copy(match ? STATUS_COLOR[statuses[s.id] ?? "not_released"] : C_MUTED);
      if (hot) c.lerp(C_WHITE, 0.35);
      m.setColorAt(i, c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [spaces, statuses, selected, hover, kinds, block, y]);

  useLayoutEffect(() => {
    for (const [mesh, list] of [
      [evRef.current, ev],
      [accRef.current, acc],
    ] as const) {
      if (!mesh) continue;
      list.forEach((s, i) => {
        const nose = s.row === 0 || s.row === 2 ? -1 : 1;
        tmp.position.set(s.x, y + 0.35, s.z + nose * (SPACE_D / 2 - 0.5));
        tmp.scale.set(0.9, 0.5, 0.18);
        tmp.updateMatrix();
        mesh.setMatrixAt(i, tmp.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [ev, acc, y]);

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (e.nativeEvent.pointerType !== "mouse" || e.instanceId === undefined) return;
    e.stopPropagation();
    const id = spaces[e.instanceId]?.id;
    const cur = api.getState().hover;
    if (id && !(cur?.kind === "parking" && cur.id === id)) api.setState({ hover: { kind: "parking", id } });
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    if (api.getState().hover) api.setState({ hover: null });
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 6 || e.instanceId === undefined) return;
    e.stopPropagation();
    const s = spaces[e.instanceId];
    if (s) navigate({ level: "basement", basement: level, parkingId: s.id }, { replace: Boolean(selected) });
  };

  return (
    <>
      <instancedMesh
        ref={ref}
        args={[undefined, undefined, spaces.length]}
        receiveShadow
        onPointerMove={onMove}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <boxGeometry />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={evRef} args={[undefined, undefined, ev.length]}>
        <boxGeometry />
        <meshStandardMaterial color={PALETTE.lime} emissive={PALETTE.lime} emissiveIntensity={0.35} />
      </instancedMesh>
      <instancedMesh ref={accRef} args={[undefined, undefined, acc.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#5b8fd6" emissive="#5b8fd6" emissiveIntensity={0.25} />
      </instancedMesh>
    </>
  );
}

function Cores({ y }: { y: number }) {
  const h = BASEMENT_HEIGHT - 0.3;
  return (
    <>
      {BASEMENT_CORES.map((c) => (
        <mesh key={c.block} position={[c.cx, y + h / 2, c.cz]} castShadow>
          <boxGeometry args={[c.x1 - c.x0, h, c.z1 - c.z0]} />
          <meshStandardMaterial color={PALETTE.forest} roughness={0.8} />
        </mesh>
      ))}
    </>
  );
}

function InnerRamp({ y, level }: { y: number; level: BasementLevel }) {
  const len = INNER_RAMP.z1 - INNER_RAMP.z0;
  const angle = Math.atan2(BASEMENT_HEIGHT, len);
  /* B1-ээс B2 рүү уруудна — B1 дээр нүх, B2 дээр налуу. */
  const top = level === "B1" ? y : y + BASEMENT_HEIGHT;
  return (
    <mesh
      position={[(INNER_RAMP.x0 + INNER_RAMP.x1) / 2, top - BASEMENT_HEIGHT / 2, (INNER_RAMP.z0 + INNER_RAMP.z1) / 2]}
      rotation-x={angle}
    >
      <boxGeometry args={[INNER_RAMP.x1 - INNER_RAMP.x0, 0.25, Math.hypot(len, BASEMENT_HEIGHT)]} />
      <meshStandardMaterial color="#6f7672" roughness={1} />
    </mesh>
  );
}

function SelectedPath({ level }: { level: BasementLevel }) {
  const view = useExplore((s) => s.view);
  const id = view.level === "basement" ? view.parkingId : undefined;
  const space = id ? parkingById(id) : undefined;
  if (!space || space.level !== level) return null;
  const y = basementFloorY(level) + 0.25;
  return (
    <Line
      points={space.path.map(([x, z]) => [x, y, z] as [number, number, number])}
      color={PALETTE.forest}
      lineWidth={3.5}
      dashed
      dashSize={1.2}
      gapSize={0.7}
    />
  );
}
