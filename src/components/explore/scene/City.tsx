"use client";

/* Хотын орчин — «цагаан шавар» массив (instancing, нэг draw call),
   гудамж, цэцэрлэгт хүрээлэн, Туул гол, уулс. Текстургүй тул маш
   хөнгөн; бодит хотын загварыг студиэс авмагц энийг солино. */

import { useLayoutEffect, useMemo, useRef } from "react";
import { BufferGeometry, Color, Float32BufferAttribute, InstancedMesh, Object3D, Path, Shape, ShapeGeometry } from "three";
import { MOUNTAINS, PARK, buildCity, buildParkTrees, buildRoads, riverPoints } from "@/lib/explore/city";
import { PALETTE } from "@/lib/explore/config";
import { GROUND_OPENING } from "@/lib/explore/parking";

const tmp = new Object3D();
const CITY_A = new Color("#f7f6f1");
const CITY_B = new Color("#e2e0d7");

function useInstances<T>(ref: React.RefObject<InstancedMesh | null>, items: T[], place: (o: Object3D, item: T, i: number) => void, color?: (item: T, c: Color) => void) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new Color();
    items.forEach((item, i) => {
      tmp.position.set(0, 0, 0);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(1, 1, 1);
      place(tmp, item, i);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
      if (color) {
        color(item, c);
        mesh.setColorAt(i, c);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
}

function riverGeometry(width: number) {
  const pts = riverPoints();
  const pos: number[] = [];
  const idx: number[] = [];
  pts.forEach(([x, z], i) => {
    const [nx, nz] = pts[Math.min(i + 1, pts.length - 1)];
    const [px, pz] = pts[Math.max(i - 1, 0)];
    const dx = nx - px;
    const dz = nz - pz;
    const len = Math.hypot(dx, dz) || 1;
    const ox = (-dz / len) * (width / 2);
    const oz = (dx / len) * (width / 2);
    pos.push(x + ox, 0, z + oz, x - ox, 0, z - oz);
    if (i > 0) {
      const a = (i - 1) * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Газар — зоорь, рампын нээлттэй (Shape нь XY-д: y = −z). */
function groundGeometry() {
  const R = 20000;
  const s = new Shape();
  s.moveTo(-R, -R);
  s.lineTo(R, -R);
  s.lineTo(R, R);
  s.lineTo(-R, R);
  s.lineTo(-R, -R);
  const hole = new Path();
  GROUND_OPENING.forEach(([x, z], i) => (i === 0 ? hole.moveTo(x, -z) : hole.lineTo(x, -z)));
  hole.closePath();
  s.holes.push(hole);
  return new ShapeGeometry(s);
}

export function City() {
  const buildings = useMemo(() => buildCity(), []);
  const roads = useMemo(() => buildRoads(), []);
  const trees = useMemo(() => buildParkTrees(), []);
  const river = useMemo(() => riverGeometry(70), []);
  const ground = useMemo(() => groundGeometry(), []);

  const bRef = useRef<InstancedMesh>(null);
  const rRef = useRef<InstancedMesh>(null);
  const tRef = useRef<InstancedMesh>(null);

  useInstances(
    bRef,
    buildings,
    (o, b) => {
      o.position.set(b.x, b.h / 2, b.z);
      o.scale.set(b.w, b.h, b.d);
    },
    (b, c) => c.copy(CITY_A).lerp(CITY_B, b.tone * 0.8)
  );
  useInstances(rRef, roads, (o, r) => {
    o.position.set(r.x, 0.06, r.z);
    o.scale.set(r.w, 0.12, r.d);
  });
  useInstances(tRef, trees, (o, [x, z, s]) => {
    o.position.set(x, 4.5 * s, z);
    o.scale.set(3.4 * s, 4.5 * s, 3.4 * s);
  });

  return (
    <group>
      <mesh geometry={ground} rotation-x={-Math.PI / 2} receiveShadow>
        <meshStandardMaterial color={PALETTE.ground} roughness={1} />
      </mesh>

      <instancedMesh ref={rRef} args={[undefined, undefined, roads.length]} receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color={PALETTE.road} roughness={1} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
      </instancedMesh>

      <instancedMesh ref={bRef} args={[undefined, undefined, buildings.length]} receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </instancedMesh>

      {/* Үндэсний цэцэрлэгт хүрээлэн */}
      <mesh rotation-x={-Math.PI / 2} position={[PARK.x, 0.08, PARK.z]} scale={[PARK.rx, PARK.rz, 1]} receiveShadow>
        <circleGeometry args={[1, 48]} />
        <meshStandardMaterial color={PALETTE.park} roughness={1} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
      <instancedMesh ref={tRef} args={[undefined, undefined, trees.length]}>
        <coneGeometry args={[1, 2, 6]} />
        <meshStandardMaterial color={PALETTE.tree} roughness={1} flatShading />
      </instancedMesh>

      {/* Туул гол */}
      <mesh geometry={river} position-y={0.1}>
        <meshStandardMaterial color={PALETTE.water} roughness={0.35} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>

      {/* Богд уулын силуэт — манан дунд */}
      {MOUNTAINS.map((m, i) => (
        <mesh key={i} position={[m.x, m.h / 2 - 20, m.z]}>
          <coneGeometry args={[m.r, m.h, 7]} />
          <meshStandardMaterial color={PALETTE.mountain} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}
