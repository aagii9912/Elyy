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

  /* Нүүр дэлгэц (hero) — 20 секундын давталт. Кадрын дараалал
     (хуучин `hero-video-frames`, одоо устгагдсан) орлож, ГҮЙЛТЭД
     уягдахаа больсон: хуудас нээмэгц өөрөө эргэлдэнэ.

     2026-09-07: захиалагчийн ХОЁР 10 секундын 4K клипийг (3840×2160 /
     24fps, дуутай) дараалуулан залгасан — `download (3)` үүр цайх →
     өдөр, `download (4)` өдөр → нар жаргах. Залгаас (3-ын сүүл, 4-ийн
     эхлэл) хоёулаа цэнхэр тэнгэртэй өдөр, давталтын оёдол (4-ийн
     улбар шар нар жаргалт → 3-ын улбар шар үүр) мөн ойролцоо өнгөтэй.
     Ус тэмдэггүй, кроп шаардлагагүй.

     ХОЁР ТУСДАА ЭКСПОРТ — хөтөч зөвхөн НЭГИЙГ нь татна (`MonoHero`
     дотор matchMedia-гаар сонгоно):
       • веб      → 1920×1080 бүтэн кадр.
       • гар утас → ижил эхээс 9:16 (1215×2160) ТӨВ кроп → 1080×1920:
         цамхагууд кадрын төвд, тэнгэр дээд 35%-ийг эзэлдэг тул
         гарчигт зай үлдэнэ. (Урьд нь тусдаа босоо экспорт байсан.)

     `srcs` — олон эх байвал ижил кодлолтой гэж үзэн concat filter-ээр
     залгана (өөр fps/хэмжээтэй бол эхлээд нэгтгэх хэрэгтэй).
     `g` — 2 секунд тутамд түлхүүр кадар, эх бүрийн fps-ээр. */
  hero: {
    dir: "video",
    scale: "1920:1080",
    /* 4K эх нь мөхлөгтэй тул crf 26 дээр 10MB болж байсан — 29 дээр
       ~6MB, hero-гийн бичгийн ард ялгаа мэдэгдэхгүй. */
    crf: 29,
    g: 48,
    /* Постер — эхний кадар зурагдах хүртэлх дэвсгэр, мөн
       prefers-reduced-motion / Data Saver үеийн ганц зураг. */
    poster: 0.2,
    srcs: ["download (3).mp4", "download (4).mp4"],
    clips: [
      { out: "hero-loop-desktop.mp4" },
      { out: "hero-loop-mobile.mp4", crop: "1215:2160:1312:0", scale: "1080:1920", crf: 30 },
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
    /* `setsar=1` — кроп + масштабын дараа пиксел дөрвөлжин хэвээр гэдгийг
       тодорхой бичнэ, эс бөгөөс зарим тоглуулагч DAR-ыг буруу тооцно. */
    const vf = [crop && `crop=${crop}`, `scale=${scale}`, "setsar=1"].filter(Boolean).join(",");
    /* Нэг эх → `-vf`; олон эх → дараалуулан залгаад мөн адил шүүлтүүр. */
    const srcs = clip.srcs ?? set.srcs ?? [clip.src];
    const inputs = srcs.flatMap((f) => ["-i", join(SRC, f)]);
    const filter =
      srcs.length > 1
        ? [
            "-filter_complex",
            `${srcs.map((_, i) => `[${i}:v]`).join("")}concat=n=${srcs.length}:v=1:a=0[cat];[cat]${vf}[v]`,
            "-map", "[v]",
          ]
        : ["-vf", vf];
    execFileSync(
      ffmpeg,
      [
        "-y",
        "-v", "error",
        ...inputs,
        // Дэвсгэр — дуугүй (hero-гийн эх файлд дуу байгаа ч хаягдана).
        "-an",
        ...filter,
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
    /* Постерыг ЭХНИЙ эх файлаас — залгаасан клипийн 0.2сек нь мөн тэр. */
    execFileSync(
      ffmpeg,
      [
        "-y",
        "-v", "error",
        "-ss", String(at),
        "-i", join(SRC, srcs[0]),
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
