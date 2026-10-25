"use client";

/* Тэнгэр, манан, гэрэл. Нар нь Улаанбаатарын бодит байрлалаар
   (улирал + цаг), сүүдрийн камер нь тухайн түвшний гол объектыг
   (хотхон, цамхаг, айл) хамарна — ингэснээр сүүдэр ойроос ч тод. */

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DirectionalLight, Object3D, PointLight } from "three";
import { PALETTE, basementFloorY, floorBase, towerOf } from "@/lib/explore/config";
import { toSiteDir } from "@/lib/explore/location";
import { unitPlacement } from "@/lib/explore/placement";
import { parseCoords, sunVector } from "@/lib/explore/sun";
import type { View } from "@/lib/explore/types";
import { useExplore } from "../store";

const FOG: Record<View["level"], [number, number]> = {
  location: [1400, 9000],
  site: [500, 4800],
  basement: [380, 3600],
  block: [420, 4200],
  floor: [380, 4000],
  unit: [320, 3600],
  tour: [320, 3600],
};

function focusOf(view: View): { x: number; y: number; z: number; extent: number } {
  switch (view.level) {
    case "location":
      return { x: 0, y: 0, z: -20, extent: 260 };
    case "site":
      return { x: 0, y: 0, z: -10, extent: 150 };
    case "basement":
      return { x: 0, y: basementFloorY(view.basement), z: -36, extent: 120 };
    case "block":
      return { ...towerOf(view.block), y: 30, extent: 85 };
    case "floor":
      return { ...towerOf(view.block), y: floorBase(view.floor), extent: 60 };
    case "unit":
    case "tour": {
      const p = unitPlacement(view.unitId);
      return p ? { x: p.center.x, y: p.floorY, z: p.center.z, extent: 34 } : { x: 0, y: 0, z: 0, extent: 150 };
    }
  }
}

const SKY_DAY = new Color(PALETTE.sky);
const SKY_DUSK = new Color("#c9ccd2");

export function Environment() {
  const view = useExplore((s) => s.view);
  const season = useExplore((s) => s.season);
  const hour = useExplore((s) => s.hour);
  const coords = useExplore((s) => s.site.coords);
  const sunRef = useRef<DirectionalLight>(null);
  const lampRef = useRef<PointLight>(null);
  const target = useMemo(() => new Object3D(), []);

  const { lat, lng } = parseCoords(coords);
  /* Нар жинхэнэ хойд зүгээр тооцогдоно — хотхоны систем рүү эргүүлнэ. */
  const sun = useMemo(() => {
    const v = sunVector(season, hour, lat, lng);
    return { ...v, ...toSiteDir(v.x, v.z) };
  }, [season, hour, lat, lng]);
  const focus = focusOf(view);
  const day = Math.max(0, Math.min(1, sun.y * 3));
  const tour = view.level === "tour";
  const sky = useMemo(() => SKY_DUSK.clone().lerp(SKY_DAY, day), [day]);
  const [near, far] = FOG[view.level];

  useLayoutEffect(() => {
    const light = sunRef.current;
    if (!light) return;
    const dist = 700;
    const y = Math.max(sun.y, 0.06);
    light.position.set(focus.x + sun.x * dist, focus.y + y * dist, focus.z + sun.z * dist);
    target.position.set(focus.x, focus.y, focus.z);
    target.updateMatrixWorld();
    const cam = light.shadow.camera;
    cam.left = -focus.extent;
    cam.right = focus.extent;
    cam.top = focus.extent;
    cam.bottom = -focus.extent;
    cam.near = 10;
    cam.far = dist * 2;
    cam.updateProjectionMatrix();
  }, [sun, focus.x, focus.y, focus.z, focus.extent, target]);

  /* Аялалд камерын ард зөөлөн гэрэл — өрөө жигд гэрэлтэнэ. */
  useFrame(({ camera }) => {
    if (tour && lampRef.current) lampRef.current.position.set(camera.position.x, camera.position.y + 0.6, camera.position.z);
  });

  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, near, far]} />
      <hemisphereLight args={["#ffffff", "#d6d0c2", (tour ? 2.6 : 1.75) * (0.55 + 0.45 * day)]} />
      <directionalLight
        ref={sunRef}
        target={target}
        castShadow
        color="#fff3df"
        intensity={sun.y > 0 ? 1.0 + 1.7 * day : 0.15}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      <primitive object={target} />
      {tour && <pointLight ref={lampRef} intensity={6} distance={9} decay={1.6} color="#fff6ea" />}
    </>
  );
}
