"use client";

/* Камер — түвшин бүрд «гэр» өнцөг, хязгаар, кино маягийн шилжилт.
   Гадна түвшнүүдийн хооронд (байршил ↔ хотхон ↔ блок ↔ давхар) одоогийн
   эргэлтийн өнцгийг хадгалж үргэлжлүүлнэ; айл, аялал руу ороход фасадын
   гаднаас харна. Аялал (tour) нь нэгдүгээр биеийн харагдац — камер
   байрандаа эргэнэ, шилжилтийг `UnitInterior` хариуцна. */

import { useEffect, useRef } from "react";
import { CameraControls, CameraControlsImpl } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Box3, PerspectiveCamera, Vector3 } from "three";
import { basementFloorY, floorBase, towerOf } from "@/lib/explore/config";
import { parkingById } from "@/lib/explore/parking";
import { frameToWorld, unitPlacement } from "@/lib/explore/placement";
import { buildInterior, standPoint, tourStartPoint } from "@/lib/explore/interior";
import type { View } from "@/lib/explore/types";
import { useExplore } from "../store";

const { ACTION } = CameraControlsImpl;
const DEG = Math.PI / 180;
export const EYE = 1.6;

type Pose = {
  target: [number, number, number];
  distance: number;
  polar: number;
  /** undefined — одоогийн өнцгөө хадгална. */
  azimuth?: number;
  min: number;
  max: number;
  polarRange: [number, number];
  bounds: [number, number, number, number, number, number];
  near: number;
  far: number;
};

const EXTERIOR = new Set(["location", "site", "basement", "block", "floor"]);

function poseFor(view: View): Pose | null {
  switch (view.level) {
    case "location":
      /* Байршлын рендер шиг: урд-баруун урдаас хойд-зүүн хойш (жинхэнэ
         азимут ~24°) — хотын төв ард, баруун талд. */
      return {
        target: [-250, 0, -450],
        distance: 2500,
        polar: 60 * DEG,
        azimuth: 40 * DEG,
        min: 700,
        max: 5200,
        polarRange: [20 * DEG, 74 * DEG],
        bounds: [-3000, -10, -3400, 3000, 400, 1800],
        near: 4,
        far: 16000,
      };
    case "site":
      /* Хотхоны рендер шиг хашааны талаас, өндрөөс — урд талын Алтарганын
         цамхгууд хашааг халхлахгүй. */
      return {
        target: [0, 10, -14],
        distance: 360,
        polar: 44 * DEG,
        azimuth: -30 * DEG,
        min: 110,
        max: 950,
        polarRange: [15 * DEG, 84 * DEG],
        bounds: [-240, -10, -260, 240, 120, 220],
        near: 1,
        far: 12000,
      };
    case "basement": {
      const y = basementFloorY(view.basement);
      const space = view.parkingId ? parkingById(view.parkingId) : undefined;
      /* Зоорь урт, нарийн — өмнөд талаас, дээрээс харна. Байр сонгосон
         бол тэр байр болон лифт хүртэлх зам руу ойртоно. */
      return {
        target: space ? [space.x, y, space.z + 4] : [0, y, -36],
        distance: space ? 70 : 165,
        polar: 36 * DEG,
        azimuth: -6 * DEG,
        min: 35,
        max: 420,
        polarRange: [8 * DEG, 78 * DEG],
        bounds: [-110, y - 2, -70, 110, y + 30, -5],
        near: 0.5,
        far: 9000,
      };
    }
    case "block": {
      const t = towerOf(view.block);
      return {
        target: [t.x, 36, t.z],
        distance: 190,
        polar: 73 * DEG,
        min: 55,
        max: 460,
        polarRange: [15 * DEG, 92 * DEG],
        bounds: [t.x - 70, 0, t.z - 70, t.x + 70, 90, t.z + 70],
        near: 0.5,
        far: 12000,
      };
    }
    case "floor": {
      const t = towerOf(view.block);
      const y = floorBase(view.floor);
      return {
        target: [t.x, y + 1, t.z],
        distance: 74,
        polar: 38 * DEG,
        min: 22,
        max: 240,
        polarRange: [4 * DEG, 84 * DEG],
        bounds: [t.x - 40, y - 2, t.z - 40, t.x + 40, y + 30, t.z + 40],
        near: 0.3,
        far: 12000,
      };
    }
    case "unit": {
      const p = unitPlacement(view.unitId);
      if (!p) return null;
      return {
        target: [p.center.x, p.floorY + 1.2, p.center.z],
        distance: 27,
        polar: 42 * DEG,
        azimuth: Math.atan2(p.outward.x, p.outward.z) + 0.45,
        min: 8,
        max: 90,
        polarRange: [3 * DEG, 80 * DEG],
        bounds: [p.center.x - 14, p.floorY - 1, p.center.z - 14, p.center.x + 14, p.floorY + 6, p.center.z + 14],
        near: 0.2,
        far: 9000,
      };
    }
    case "tour":
      return null;
  }
}

/** Аяллын эхлэл: сонгосон өрөөний төв (цонх руу харсан), эсвэл зочны
 *  өрөөний ар хэсгээс цонх, хотын харагдац руу. */
export function tourStart(unitId: string, room?: number) {
  const p = unitPlacement(unitId);
  if (!p) return null;
  const model = buildInterior(p.unit.type, p.frame.L, p.frame.D);
  const type = p.unit.type;
  const r = room !== undefined ? model.rooms[room] : model.rooms.find((x) => x.kind === "living");
  const stand = r && (r.kind !== "living" || room !== undefined) ? standPoint(type, r) : null;
  const from = r
    ? (stand ?? tourStartPoint(type) ?? { x: (r.x0 + r.x1) / 2, z: r.z1 - 1 })
    : model.entry;
  /* Тавилгатай өрөө — тавилга руу; бусад: урд бүсийнх фасад руу,
     ар бүсийнх зочны өрөө рүү харна. */
  const living = model.rooms.find((x) => x.kind === "living");
  const look =
    stand?.look ??
    (r && r.z0 <= 0.01
      ? { x: from.x, z: -1 }
      : living
        ? { x: (living.x0 + living.x1) / 2, z: (living.z0 + living.z1) / 2 }
        : { x: from.x, z: 0 });
  const eye = frameToWorld(p, from.x, from.z);
  const at = frameToWorld(p, look.x, look.z);
  const y = p.floorY + EYE;
  const dx = at.x - eye.x;
  const dz = at.z - eye.z;
  const len = Math.hypot(dx, dz) || 1;
  return { eye: new Vector3(eye.x, y, eye.z), dir: new Vector3(dx / len, -0.06, dz / len) };
}

function closestAngle(current: number, target: number) {
  const twoPi = Math.PI * 2;
  return target + twoPi * Math.round((current - target) / twoPi);
}

export function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null);
  const view = useExplore((s) => s.view);
  const attract = useExplore((s) => s.attract);
  const prevLevel = useRef<string | null>(null);
  const key = JSON.stringify(view);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    /* Камерыг controls-оос авна — near/far-ыг түвшин бүрд тааруулна. */
    const cam = c.camera as PerspectiveCamera;
    const first = prevLevel.current === null;
    const fromTour = prevLevel.current === "tour";
    prevLevel.current = view.level;

    if (view.level === "tour") {
      const start = tourStart(view.unitId, view.room);
      if (!start) return;
      cam.near = 0.05;
      cam.far = 9000;
      cam.fov = 68;
      cam.updateProjectionMatrix();
      c.setBoundary();
      c.minDistance = 0.05;
      c.maxDistance = 0.2;
      c.minPolarAngle = 35 * DEG;
      c.maxPolarAngle = 125 * DEG;
      c.azimuthRotateSpeed = -0.32;
      c.polarRotateSpeed = -0.32;
      c.dollyToCursor = false;
      c.mouseButtons.left = ACTION.ROTATE;
      c.mouseButtons.right = ACTION.NONE;
      c.mouseButtons.middle = ACTION.NONE;
      c.mouseButtons.wheel = ACTION.NONE;
      c.touches.one = ACTION.TOUCH_ROTATE;
      c.touches.two = ACTION.NONE;
      c.touches.three = ACTION.NONE;
      const t = start.eye.clone().addScaledVector(start.dir, 0.1);
      c.setLookAt(start.eye.x, start.eye.y, start.eye.z, t.x, t.y, t.z, !first);
      return;
    }

    const pose = poseFor(view);
    if (!pose) return;
    cam.near = pose.near;
    cam.far = pose.far;
    cam.fov = 38;
    cam.updateProjectionMatrix();

    c.azimuthRotateSpeed = 1;
    c.polarRotateSpeed = 1;
    c.dollyToCursor = true;
    c.mouseButtons.left = ACTION.ROTATE;
    c.mouseButtons.right = ACTION.TRUCK;
    c.mouseButtons.middle = ACTION.DOLLY;
    c.mouseButtons.wheel = ACTION.DOLLY;
    c.touches.one = ACTION.TOUCH_ROTATE;
    c.touches.two = ACTION.TOUCH_DOLLY_TRUCK;
    c.touches.three = ACTION.TOUCH_TRUCK;
    c.minDistance = pose.min;
    c.maxDistance = pose.max;
    c.minPolarAngle = pose.polarRange[0];
    c.maxPolarAngle = pose.polarRange[1];
    const [x0, y0, z0, x1, y1, z1] = pose.bounds;
    c.setBoundary(new Box3(new Vector3(x0, y0, z0), new Vector3(x1, y1, z1)));

    /* Айлын түвшин фасадын гаднаас; бусад гадна түвшин одоогийн өнцгөө
       хадгална (эхний ачаалал ба аяллаас гарахад — өгөгдмөл өнцөг). */
    const azimuth = closestAngle(
      c.azimuthAngle,
      pose.azimuth ?? (first || (fromTour && EXTERIOR.has(view.level)) ? -22 * DEG : c.azimuthAngle)
    );
    const [tx, ty, tz] = pose.target;
    const s = Math.sin(pose.polar);
    /* Босоо (утас, босоо kiosk) дэлгэцэд хэвтээ харагдац багтахгүй — холдоно. */
    const distance = pose.distance * (cam.aspect < 0.8 ? 1.6 : cam.aspect < 1.2 ? 1.25 : 1);
    const pos = new Vector3(
      tx + distance * s * Math.sin(azimuth),
      ty + distance * Math.cos(pose.polar),
      tz + distance * s * Math.cos(azimuth)
    );
    c.setLookAt(pos.x, pos.y, pos.z, tx, ty, tz, !first);
    // `key` нь view-ийн бүх утгыг агуулна — объект бүрд дахин ажиллуулахгүйн тулд.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /* Самбарын ард 3D нуугдахгүй — проекцийн төвийг харагдах хэсгийн
     төв рүү шилжүүлнэ (desktop — зүүн тийш, утсанд — дээш). */
  const size = useThree((s) => s.size);
  const panel = useExplore((s) => s.panel);
  useEffect(() => {
    const cam = ref.current?.camera as PerspectiveCamera | undefined;
    if (!cam) return;
    const dx = panel.desktop ? Math.min(panel.w, size.width * 0.5) / 2 : 0;
    const dy = panel.desktop ? 0 : Math.min(panel.h, size.height * 0.7) / 2;
    if (dx < 1 && dy < 1) cam.clearViewOffset();
    else cam.setViewOffset(size.width, size.height, dx, dy, size.width, size.height);
  }, [panel, size.width, size.height]);

  useFrame((_, delta) => {
    if (attract && ref.current) ref.current.rotate(0.05 * delta, 0, false);
  });

  return <CameraControls ref={ref} makeDefault smoothTime={0.55} draggingSmoothTime={0.12} />;
}
