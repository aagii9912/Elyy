/* Blender-ээр bake хийсэн интерьер (scripts/interiors/build.py):
   <type>.gltf — геометр (UV0 давталттай albedo, UV1 лайтмап),
   <type>-lightmap.webp — гэрэлтүүлэг (sRGB, scene.extras.lightmap_scale).

   Гэрэл бүгд лайтмап дотор тул MeshBasicMaterial (unlit) — киоск, утсан
   дээр ч хөнгөн. Тааз (Ceiling*) зөвхөн дотор алхахад харагдана. */

import {
  Color,
  DoubleSide,
  FrontSide,
  Mesh,
  MeshBasicMaterial,
  SRGBColorSpace,
  ShaderChunk,
  TextureLoader,
  type Material,
  type MeshStandardMaterial,
  type Object3D,
  type Texture,
} from "three";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { UnitTypeKey } from "@/lib/explore/types";

export type BakedInterior = {
  /** Шал, хана, тавилга (тааз ороогүй). */
  room: Object3D[];
  /** Тааз ба таазны гэрэл — зөвхөн аялалд. */
  ceiling: Object3D[];
};

const BASE = "/models/interiors";

/* Интерьер өөрийн tone mapping-тай (гадна тал нь ACES хэвээр): лайтмап
   Blender-ийн scene-linear утга тул Blender preview-ийн AgX муруйг давтана.
   toneMapped=false үед three tone mapping-ийн функцуудыг shader-т
   оруулдаггүй тул chunk-ийг өөрсдөө нэмнэ. */
const EXPOSURE = 1.3;
const TONE_GLSL = /* glsl */ `
${ShaderChunk.tonemapping_pars_fragment}
vec3 bakedTone( vec3 c ) {
  return AgXToneMapping( c * ${EXPOSURE.toFixed(3)} );
}
`;

function bakedTone(m: MeshBasicMaterial) {
  m.toneMapped = false;
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", `${TONE_GLSL}\nvoid main() {`)
      .replace("#include <tonemapping_fragment>", "gl_FragColor.rgb = bakedTone( gl_FragColor.rgb );");
  };
  m.customProgramCacheKey = () => "baked-agx";
  return m;
}

const EMIT: Record<string, Color> = {
  emit_warm: new Color(1.0, 0.82, 0.62).multiplyScalar(2.2),
  emit_soft: new Color(1.0, 0.9, 0.78).multiplyScalar(1.8),
  emit_cool: new Color(1.0, 0.97, 0.92).multiplyScalar(1.5),
};

const cache = new Map<UnitTypeKey, Promise<BakedInterior>>();

export function loadBakedInterior(type: UnitTypeKey): Promise<BakedInterior> {
  let p = cache.get(type);
  if (!p) {
    p = load(type);
    /* Алдаа гарвал (файл байхгүй г.м.) дараагийн удаа дахин оролдоно. */
    p.catch(() => cache.delete(type));
    cache.set(type, p);
  }
  return p;
}

async function load(type: UnitTypeKey): Promise<BakedInterior> {
  const [gltf, lightmap] = await Promise.all([
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(`${BASE}/${type}.gltf`),
    new TextureLoader().loadAsync(`${BASE}/${type}-lightmap.webp`),
  ]);
  lightmap.flipY = false;
  lightmap.colorSpace = SRGBColorSpace;
  lightmap.channel = 1;
  const scale = Number(gltf.scene.userData.lightmap_scale ?? 1);
  const mats = new Map<string, Material>();
  const room: Object3D[] = [];
  const ceiling: Object3D[] = [];
  for (const node of [...gltf.scene.children]) {
    node.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const src = o.material as MeshStandardMaterial;
      let m = mats.get(src.name);
      if (!m) {
        m = convert(src, lightmap, scale);
        mats.set(src.name, m);
      }
      o.material = m;
      o.matrixAutoUpdate = false;
      o.updateMatrix();
      o.raycast = noRaycast;
    });
    (node.name.startsWith("Ceiling") ? ceiling : room).push(node);
  }
  return { room, ceiling };
}

/** Интерьерийн меш дээр дарахыг шалны (процедур) меш хүлээн авна. */
function noRaycast() {}

function convert(src: MeshStandardMaterial, lightmap: Texture, scale: number): Material {
  const name = src.name;
  if (name === "cap") return new MeshBasicMaterial({ color: "#2f3433" });
  if (name === "glass")
    return new MeshBasicMaterial({ color: "#e4eff2", transparent: true, opacity: 0.12, depthWrite: false, side: DoubleSide });
  if (name === "curtain")
    return new MeshBasicMaterial({
      color: new Color(1.08, 1.07, 1.05),
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      side: DoubleSide,
    });
  const emit = EMIT[name];
  if (emit) return bakedTone(new MeshBasicMaterial({ color: emit }));
  /* Шалны банз ташуу өнцгөөс ч тод харагдана. */
  if (src.map) src.map.anisotropy = 8;
  /* Тааз зөвхөн ойсон гэрлээр гэрэлтдэг тул лавлах рендер шиг цайвар болгоно. */
  const boost = name === "ceiling" ? 1.3 : 1;
  return bakedTone(
    new MeshBasicMaterial({
      name,
      map: src.map,
      color: src.color,
      lightMap: lightmap,
      lightMapIntensity: Math.PI * scale * boost,
      side: FrontSide,
    })
  );
}
