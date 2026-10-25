"use client";

/* Хотхоны тохижилт (mockup) — подиумын тавцан, алхалтын гудамж, зүлэг,
   тоглоомын талбай, мод, хашаа, гудамж, зоорийн рамп, хөрш барилгууд.
   Зоорийн түвшинд тавцан тунгалаг болж доорх B1/B2 харагдана. */

import { useLayoutEffect, useMemo, useRef } from "react";
import { ExtrudeGeometry, InstancedMesh, Object3D, Shape, ShapeGeometry } from "three";
import { BASEMENT_HEIGHT, PALETTE } from "@/lib/explore/config";
import { BASEMENT_BOUNDS, STREET_RAMPS } from "@/lib/explore/parking";
import {
  DECK,
  KINDERGARTEN,
  LAWNS,
  NEIGHBORS,
  PLAYGROUNDS,
  PROMENADE,
  STREETS,
  siteTrees,
  type RoundRect,
} from "@/lib/explore/site";
import { useExplore } from "../store";

const tmp = new Object3D();

function roundRect(r: RoundRect) {
  const s = new Shape();
  const { x0, x1, z0, z1 } = r;
  const rad = Math.min(r.r, (x1 - x0) / 2, (z1 - z0) / 2);
  /* Shape нь XY хавтгайд — доор −90°-аар эргүүлэхэд y → −z болно. */
  const y0 = -z1;
  const y1 = -z0;
  s.moveTo(x0 + rad, y0);
  s.lineTo(x1 - rad, y0);
  s.quadraticCurveTo(x1, y0, x1, y0 + rad);
  s.lineTo(x1, y1 - rad);
  s.quadraticCurveTo(x1, y1, x1 - rad, y1);
  s.lineTo(x0 + rad, y1);
  s.quadraticCurveTo(x0, y1, x0, y1 - rad);
  s.lineTo(x0, y0 + rad);
  s.quadraticCurveTo(x0, y0, x0 + rad, y0);
  return s;
}

/** Тавцангийн зоорийн дээрх хэсгийн урд хил. */
const DECK_SPLIT = BASEMENT_BOUNDS.z1;

/** Тавцангийн зоорийн дээрх хэсэг — ар захаас рампуудын ховилтой
 *  (Shape нь XY-д: y = −z), 0.4 м зузаан. */
function deckBackGeometry() {
  const s = new Shape();
  s.moveTo(DECK.x0, -DECK.z0);
  for (const r of [...STREET_RAMPS].sort((a, b) => a.x0 - b.x0)) {
    s.lineTo(r.x0, -DECK.z0);
    s.lineTo(r.x0, -r.z1);
    s.lineTo(r.x1, -r.z1);
    s.lineTo(r.x1, -DECK.z0);
  }
  s.lineTo(DECK.x1, -DECK.z0);
  s.lineTo(DECK.x1, -DECK_SPLIT);
  s.lineTo(DECK.x0, -DECK_SPLIT);
  s.closePath();
  return new ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: false });
}

const OFFSET = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 } as const;

export function SiteLandscape() {
  const level = useExplore((s) => s.view.level);
  const cityReady = useExplore((s) => s.cityReady);
  const xray = level === "basement";

  const deckBackGeo = useMemo(() => deckBackGeometry(), []);
  const lawnGeo = useMemo(() => new ShapeGeometry(LAWNS.map(roundRect), 6), []);
  const promenadeGeo = useMemo(() => new ShapeGeometry(roundRect(PROMENADE), 4), []);
  const trees = useMemo(() => siteTrees(), []);
  const crowns = useRef<InstancedMesh>(null);
  const trunks = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const c = crowns.current;
    const t = trunks.current;
    if (!c || !t) return;
    trees.forEach(([x, z, s], i) => {
      tmp.rotation.set(0, i * 1.7, 0);
      tmp.position.set(x, 4.2 * s, z);
      tmp.scale.set(2.6 * s, 2.9 * s, 2.6 * s);
      tmp.updateMatrix();
      c.setMatrixAt(i, tmp.matrix);
      tmp.position.set(x, 1.4 * s, z);
      tmp.scale.set(0.22 * s, 2.8 * s, 0.22 * s);
      tmp.updateMatrix();
      t.setMatrixAt(i, tmp.matrix);
    });
    c.instanceMatrix.needsUpdate = true;
    t.instanceMatrix.needsUpdate = true;
    c.computeBoundingSphere();
    t.computeBoundingSphere();
  }, [trees]);

  const deckW = DECK.x1 - DECK.x0;

  return (
    <group>
      {/* Подиумын тавцан — зоорийн дээрх хэсэг нь зоорийн түвшинд тунгалаг */}
      <mesh geometry={deckBackGeo} rotation-x={-Math.PI / 2} position-y={-0.4} receiveShadow>
        <meshStandardMaterial
          color={PALETTE.paving}
          roughness={0.95}
          transparent={xray}
          opacity={xray ? 0.12 : 1}
          depthWrite={!xray}
        />
      </mesh>
      <mesh position={[0, -0.2, (DECK_SPLIT + DECK.z1) / 2]} receiveShadow>
        <boxGeometry args={[deckW, 0.4, DECK.z1 - DECK_SPLIT]} />
        <meshStandardMaterial color={PALETTE.paving} roughness={0.95} />
      </mesh>

      {/* Гудамж — бодит хот ачаалагдсан бол OSM-ийн бодит зам */}
      {!cityReady && STREETS.map((s, i) => (
        <mesh key={i} position={[(s.x0 + s.x1) / 2, 0.07, (s.z0 + s.z1) / 2]} receiveShadow>
          <boxGeometry args={[s.x1 - s.x0, 0.14, s.z1 - s.z0]} />
          <meshStandardMaterial color={PALETTE.asphalt} roughness={1} {...OFFSET} />
        </mesh>
      ))}

      {/* Зоорийн рамп — ар талын гудамжнаас B1 рүү (тавцангийн ховилоор) */}
      {STREET_RAMPS.map((r, i) => {
        const len = r.z1 - r.z0;
        const w = r.x1 - r.x0;
        const angle = Math.atan2(BASEMENT_HEIGHT, len);
        return (
          <group key={i} position={[(r.x0 + r.x1) / 2, 0, (r.z0 + r.z1) / 2]}>
            <mesh position-y={-BASEMENT_HEIGHT / 2} rotation-x={angle} receiveShadow>
              <boxGeometry args={[w, 0.3, Math.hypot(len, BASEMENT_HEIGHT)]} />
              <meshStandardMaterial color="#7d8581" roughness={1} />
            </mesh>
            {[-1, 1].map((side) => (
              <group key={side}>
                <mesh position={[side * (w / 2 + 0.2), -BASEMENT_HEIGHT / 2 + 0.45, 0]}>
                  <boxGeometry args={[0.4, BASEMENT_HEIGHT + 0.9, len]} />
                  <meshStandardMaterial color="#cfcbc1" roughness={1} />
                </mesh>
              </group>
            ))}
            {!xray && (
              <mesh position={[0, -BASEMENT_HEIGHT / 2, len / 2]}>
                <boxGeometry args={[w, BASEMENT_HEIGHT, 0.3]} />
                <meshStandardMaterial color="#3f4643" roughness={1} />
              </mesh>
            )}
          </group>
        );
      })}

      <group visible={!xray}>
        <mesh geometry={promenadeGeo} rotation-x={-Math.PI / 2} position-y={0.03} receiveShadow>
          <meshStandardMaterial color={PALETTE.path} roughness={1} {...OFFSET} />
        </mesh>
        <mesh geometry={lawnGeo} rotation-x={-Math.PI / 2} position-y={0.05} receiveShadow>
          <meshStandardMaterial color={PALETTE.lawn} roughness={1} {...OFFSET} />
        </mesh>
        {PLAYGROUNDS.map((p, i) => (
          <mesh key={i} rotation-x={-Math.PI / 2} position={[p.x, 0.08, p.z]} receiveShadow>
            <circleGeometry args={[p.r, 40]} />
            <meshStandardMaterial color={p.color} roughness={1} polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
          </mesh>
        ))}

        {/* Хашаа */}
        {[
          [DECK.x0, DECK.x1, DECK.z1, DECK.z1],
          [DECK.x0, DECK.x0, DECK.z0 + 8, DECK.z1],
          [DECK.x1, DECK.x1, DECK.z0 + 8, DECK.z1],
        ].map(([x0, x1, z0, z1], i) => (
          <mesh key={i} position={[(x0 + x1) / 2, 0.5, (z0 + z1) / 2]} castShadow receiveShadow>
            <boxGeometry args={[Math.max(x1 - x0, 1.1), 1, Math.max(z1 - z0, 1.1)]} />
            <meshStandardMaterial color={PALETTE.hedge} roughness={1} />
          </mesh>
        ))}

        <instancedMesh ref={crowns} args={[undefined, undefined, trees.length]} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={PALETTE.tree} roughness={1} flatShading />
        </instancedMesh>
        <instancedMesh ref={trunks} args={[undefined, undefined, trees.length]}>
          <cylinderGeometry args={[1, 1, 1, 5]} />
          <meshStandardMaterial color={PALETTE.trunk} roughness={1} />
        </instancedMesh>

        {/* Цэцэрлэгийн барилга (хотхоны −x урд булан) */}
        <mesh
          position={[
            (KINDERGARTEN.x0 + KINDERGARTEN.x1) / 2,
            KINDERGARTEN.h / 2,
            (KINDERGARTEN.z0 + KINDERGARTEN.z1) / 2,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[KINDERGARTEN.x1 - KINDERGARTEN.x0, KINDERGARTEN.h, KINDERGARTEN.z1 - KINDERGARTEN.z0]} />
          <meshStandardMaterial color="#f3efe6" roughness={0.9} />
        </mesh>
      </group>

      {/* Хөрш барилгууд (бодит хот ачаалагдсан бол OSM-ийн барилга) */}
      {!cityReady && NEIGHBORS.map((n, i) => (
        <mesh key={i} position={[n.x, n.h / 2, n.z]} castShadow receiveShadow>
          <boxGeometry args={[n.w, n.h, n.d]} />
          <meshStandardMaterial color="#f5f4ef" roughness={0.95} transparent={xray} opacity={xray ? 0.25 : 1} />
        </mesh>
      ))}
    </group>
  );
}
