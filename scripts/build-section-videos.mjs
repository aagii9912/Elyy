/* Build the web-ready loop clips that play behind the full-bleed showcase
 * sections, from the client's 4K exports.
 *
 * Кадрын дараалал (`build-scroll-frames.mjs`) нь ГҮЙЛТЭД уягдсан бүлгүүдэд
 * зориулагдсан бол энэ нь ӨӨРӨӨ давтагдан тоглох дэвсгэрт зориулагдсан:
 * WebP кадр биш, жинхэнэ mp4 — 5 секундын давталтад 160 кадар хадгалах нь
 * утгагүй, mp4 нь 10 дахин хөнгөн.
 *
 * Sources live outside the repo (~/Downloads) — this is a one-off
 * regeneration tool, the committed output is public/video/<out>.
 *
 *   node scripts/build-section-videos.mjs [structure|hero]
 */

import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "ffmpeg-static";

const SRC = "/Users/aagii/Downloads";
const PUBLIC = fileURLToPath(new URL("../public/", import.meta.url));

const SETS = {
  /* Барилгын бүтэц (бүлэг 03) — слайд бүрийн ард нэг клип, барилгын
     үе шатын дарааллаар: цутгамал каркас → цонх → фасад. Гурвуулаа
     5.04сек / 24fps / 4K эх файл. */
  structure: {
    dir: "video",
    /* Бүтэн дэлгэцийн дэвсгэр — 1920 өргөн хангалттай: дээр нь бараан
       градиент, бичиг суух тул нарийн ширийн нь харагдахгүй. */
    scale: "1920:-2",
    crf: 28,
    clips: [
      { src: "hf_20260813_071108_b9b49fe3-27bd-465a-8d0d-75de7c5f6ef5.mp4", out: "structure-frame.mp4" },
      { src: "hf_20260813_071136_7a1ab96a-2a6a-4f5a-ad14-b73999b31edb.mp4", out: "structure-windows.mp4" },
      { src: "hf_20260813_071213_3fff4b01-2e51-4845-a099-d82f7b624e76.mp4", out: "structure-facade.mp4" },
    ],
  },

  /* Нүүр дэлгэц (hero) — 16 секундын давталт. Кадрын дараалал
     (хуучин `hero-video-frames`, одоо устгагдсан) орлож, ГҮЙЛТЭД
     уягдахаа больсон: хуудас нээмэгц өөрөө эргэлдэнэ.

     Цамхагуудын доогуур өнцгийн рендер: өдөр → нар жаргах → өдөр
     гэсэн бүтэн мөчлөг. Эхний ба сүүлийн кадар нь бараг ижил тул
     давталтын оёдол мэдэгдэхгүй.

     ХОЁР ТУСДАА ЭКСПОРТ — хөтөч зөвхөн НЭГИЙГ нь татна (`MonoHero`
     дотор matchMedia-гаар сонгоно):
       • веб      → 4K хэвтээ эх (3840×2160 / 25fps) → 1920×1030.
         `crop`-ийн өндөр 2160 → 2060: баруун доод буланд «AI
         generated» ус тэмдэг шатаагдсан тул доод захыг хайчилна
         (4.6% — барилгын доод давхрууд л алдагдана).
       • гар утас → босоо эх (1080×1920 / 23.98fps), кадралт нь
         тусдаа хийгдсэн: тэнгэр дээд 40%-ийг эзэлдэг тул гарчигт
         зай үлдэнэ. Ус тэмдэггүй, кроп шаардлагагүй.

     ⚠ Босоо эхийн нэр (`mobile.mp4`) ~/Downloads дотор ерөнхий тул
       дахин үүсгэхийн өмнө яг тэр файл эсэхийг шалгаарай.

     `g` — 2 секунд тутамд түлхүүр кадар, эх бүрийн fps-ээр. */
  hero: {
    dir: "video",
    scale: "1920:-2",
    crf: 26,
    g: 50,
    /* Постер — эхний кадар зурагдах хүртэлх дэвсгэр, мөн
       prefers-reduced-motion / Data Saver үеийн ганц зураг. */
    poster: 0.2,
    clips: [
      { src: "A015C0002_260822_S52G15.mp4", out: "hero-loop-desktop.mp4", crop: "3840:2060:0:0" },
      { src: "mobile.mp4", out: "hero-loop-mobile.mp4", scale: "1080:-2", crf: 28, g: 48 },
    ],
  },
};

function build(name) {
  const set = SETS[name];
  if (!set) throw new Error(`unknown set: ${name}`);
  const outDir = join(PUBLIC, set.dir);

  for (const clip of set.clips) {
    const out = join(outDir, clip.out);
    const scale = clip.scale ?? set.scale;
    const crf = clip.crf ?? set.crf;
    const crop = clip.crop ?? set.crop;
    const g = clip.g ?? set.g ?? 48;
    const vf = [crop && `crop=${crop}`, `scale=${scale}`].filter(Boolean).join(",");
    execFileSync(
      ffmpeg,
      [
        "-y",
        "-v", "error",
        "-i", join(SRC, clip.src),
        // Дэвсгэр — дуугүй. Эх файлд ч дууны урсгал байхгүй.
        "-an",
        "-vf", vf,
        "-c:v", "libx264",
        "-profile:v", "main",
        "-pix_fmt", "yuv420p",
        "-crf", String(crf),
        "-preset", "slow",
        // 2 секунд тутамд түлхүүр кадар — давталтын эргэлт цэвэр болно.
        "-g", String(g),
        // moov atom-ыг эхэнд — эхний байтаас нь тоглож эхэлнэ.
        "-movflags", "+faststart",
        out,
      ],
      { stdio: ["ignore", "inherit", "inherit"] }
    );
    const kb = Math.round(statSync(out).size / 1024);
    console.log(`[${name}] ${clip.out} — ${kb} KB`);

    const at = clip.poster ?? set.poster;
    if (at == null) continue;
    const poster = out.replace(/\.mp4$/, ".jpg");
    execFileSync(
      ffmpeg,
      [
        "-y",
        "-v", "error",
        "-ss", String(at),
        "-i", join(SRC, clip.src),
        "-frames:v", "1",
        "-vf", vf,
        "-q:v", "4",
        poster,
      ],
      { stdio: ["ignore", "inherit", "inherit"] }
    );
    console.log(`[${name}] ${poster.split("/").pop()} — ${Math.round(statSync(poster).size / 1024)} KB`);
  }
}

const which = process.argv[2];
for (const name of which ? [which] : Object.keys(SETS)) build(name);
