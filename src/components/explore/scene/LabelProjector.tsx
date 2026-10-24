"use client";

/* 3D шошгыг DOM давхаргад байрлуулагч. Шошгууд нь үндсэн React модонд
   (`ui/Labels.tsx`) амьдардаг — R3F-ийн дотор тусдаа React root үүсгэхгүй
   (drei Html шиг), тиймээс контекст, загвар, kiosk-ийн томруулалт
   хэвээр. Энд зөвхөн кадр бүрд дэлгэцийн байрлалыг нь бичнэ. */

import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useExploreApi } from "../store";

const v = new Vector3();

export function LabelProjector() {
  const api = useExploreApi();
  useFrame(({ camera, size }) => {
    for (const a of api.getState().anchors.values()) {
      const el = a.el;
      if (!el) continue;
      v.set(a.x, a.y, a.z).project(camera);
      if (v.z > 1 || v.z < -1 || Math.abs(v.x) > 1.15 || Math.abs(v.y) > 1.15) {
        if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
        continue;
      }
      if (el.style.visibility !== "visible") el.style.visibility = "visible";
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      el.style.zIndex = String(Math.round((1 - v.z) * 5000));
    }
  });
  return null;
}
