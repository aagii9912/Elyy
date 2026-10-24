"use client";

/* Байршлын (L0) ойролцоох цэгүүдийн тулгуур, сонгосон цэг хүртэлх
   тасархай шугам. Дугаартай товчнууд нь DOM шошго (`ui/Labels.tsx`). */

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { PALETTE } from "@/lib/explore/config";
import { placePois } from "@/lib/explore/pois";
import { useExplore } from "../store";

export function PoiMarkers() {
  const level = useExplore((s) => s.view.level);
  const pins = useExplore((s) => s.site.pins);
  const active = useExplore((s) => s.poi);
  const pois = useMemo(() => placePois(pins), [pins]);
  if (level !== "location") return null;
  const sel = active !== null ? pois[active] : undefined;

  return (
    <group>
      {pois.map((p) => (
        <mesh key={p.index} position={[p.wx, 30, p.wz]}>
          <cylinderGeometry args={[1.2, 1.2, 60, 6]} />
          <meshBasicMaterial color={p.index === active ? PALETTE.forest : "#7c8a80"} transparent opacity={0.55} />
        </mesh>
      ))}
      {sel && (
        <Line
          points={[
            [0, 4, -20],
            [sel.wx, 4, sel.wz],
          ]}
          color={PALETTE.forest}
          lineWidth={2.5}
          dashed
          dashSize={18}
          gapSize={12}
        />
      )}
    </group>
  );
}
