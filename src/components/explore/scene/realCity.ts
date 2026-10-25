/* Бодит хотын 3D загвар (scripts/location/build_city.py → city.glb):
   барилга (суурийн бодит хэлбэр + өндөр), зам, ус, ногоон бүс.
   Google Maps-ийн 3D «блок» шиг — гэрэлтүүлэгтэй цайвар массив. */

import { Mesh, MeshStandardMaterial, type Material, type Object3D } from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { CITY_MODEL } from "@/lib/explore/location";

/* Давхаргын дараалал (газрын хавтгай давхаргууд z-fighting-гүй). */
const LAYERS: Record<string, { offset: number; rough?: number; shadow?: boolean; flat?: boolean }> = {
  cover: { offset: -1 },
  green: { offset: -2 },
  water: { offset: -3, rough: 0.4 },
  road_path: { offset: -4 },
  road_minor: { offset: -5 },
  road_major: { offset: -6 },
  rail: { offset: -7 },
  building_flat: { offset: -8 },
  building: { offset: 0, shadow: true, flat: true },
};

let city: Promise<Object3D[]> | null = null;

export function loadRealCity(): Promise<Object3D[]> {
  if (!city) {
    city = load();
    city.catch(() => (city = null));
  }
  return city;
}

async function load(): Promise<Object3D[]> {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(CITY_MODEL);
  const mats = new Map<string, Material>();
  const nodes = [...gltf.scene.children];
  for (const node of nodes) {
    node.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const name = (o.material as Material).name;
      const spec = LAYERS[name] ?? { offset: 0 };
      let m = mats.get(name);
      if (!m) {
        m = new MeshStandardMaterial({
          name,
          vertexColors: o.geometry.hasAttribute("color"),
          color: name === "water" ? "#aad3ee" : "#ffffff",
          roughness: spec.rough ?? 1,
          metalness: 0,
          flatShading: spec.flat ?? false,
          polygonOffset: spec.offset !== 0,
          polygonOffsetFactor: spec.offset,
          polygonOffsetUnits: spec.offset,
        });
        mats.set(name, m);
      }
      o.material = m;
      o.receiveShadow = true;
      o.castShadow = Boolean(spec.shadow);
      o.matrixAutoUpdate = false;
      o.updateMatrix();
      o.raycast = noRaycast;
    });
  }
  return nodes;
}

function noRaycast() {}
