"use client";

import { LabelProjector } from "./LabelProjector";
import { PoiMarkers } from "./Markers";
import { Basement } from "./Basement";
import { CameraRig } from "./CameraRig";
import { City } from "./City";
import { Environment } from "./Environment";
import { SiteLandscape } from "./SiteLandscape";
import { Towers } from "./Towers";
import { UnitInterior } from "./UnitInterior";

/* Нэг 3D орчин — бүх түвшин энд байрлаж, камер шилжинэ. */
export function Scene() {
  return (
    <>
      <Environment />
      <CameraRig />
      <City />
      <SiteLandscape />
      <Towers />
      <Basement />
      <UnitInterior />
      <PoiMarkers />
      <LabelProjector />
    </>
  );
}
