/* Build the portrait stills that replace the scroll-frame / clip backdrops
 * on phones.
 *
 * Утсан дээр бүтэн дэлгэцийн дэвсгэр бүр 375pt × 3 нягтрал = 1125px өргөн
 * талбайд тавигддаг. Тэнд 1280 өргөнтэй ХЭВТЭЭ кадрыг `cover`-оор тавихад
 * зөвхөн дунд ~28% нь харагдаад ~3 дахин томсоно — тиймээс бүдгэрдэг. Энэ
 * скрипт эх рендерээс шууд ХӨРӨГ зүсэм авна: томсгохгүй, тайрна.
 *
 * `focus` бол art-direction: 16:9-ээс 1:2 зүсэм авахад өргөний ~28% л
 * үлддэг тул голыг нь автоматаар авбал (ж: барилгын клипүүд) дан тэнгэр
 * үлдэнэ. Голомтыг зурган тус бүрд гараар сонгосон — `next/image` үүнийг
 * хийж чадахгүй.
 *
 * Эх сурвалж (`build-scroll-frames.mjs`, `build-section-videos.mjs`-тэй
 * ижил конвенц): ~/Downloads доторх 4K мастер. Тэдгээр нь репод байхгүй
 * тул зүйл бүр репо доторх нөөц эх сурвалжтай (`alt`) — мастергүй машин
 * дээр ч бүрэн ажиллана, зөвхөн гаралт нь бага нягтралтай гарна.
 * Мастертай машин дээр дахин ажиллуулбал гаралт нь өөрөө томорно.
 *
 *   node scripts/build-mobile-stills.mjs [hero|plan|structure]
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "ffmpeg-static";

const SRC = join(homedir(), "Downloads");
const ROOT = fileURLToPath(new URL("../", import.meta.url));
const OUT_DIR = join(ROOT, "public/images/mobile");

/** Зорилтот өргөн, харьцаа тус бүрд.
 *
 *  `portrait` — бүтэн дэлгэцийн дэвсгэр. Утасны хамгийн өргөн нь
 *  ~430pt × 3 = 1290px, гэхдээ дээр нь текст, хөшиг сууна — 1080 хангалттай.
 *
 *  `card` — бүлэг 01-ийн карт. Тэр нь дэлгэцийн бүтэн өргөн БИШ: хэсгийн
 *  хажуугийн зай хасагдаад 375pt дэлгэц дээр 335pt = 1005px болно. 900
 *  нь түүнээс 1.1 дахин л жижиг — ялгаа мэдэгдэхгүй, харин файл ~30%
 *  хөнгөрнө. Дөрвөн карт зэрэг ачаалагддаг тул энэ нь мэдэгдэхүйц. */
const TARGET_W = { portrait: 1080, card: 900 };
/** WebP чанар. 80 — рендерийн зөөлөн градиентад артефакт үүсгэхгүй
 *  доод хязгаар (72 дээр тэнгэрт зураас гарч ирдэг). */
const QUALITY = 80;

/** Дэлгэцийн харьцаанууд. Орчин үеийн утас ~0.46 — 1:2 зүсэм `cover`
 *  үед хажуугаас ~8% л алдана. Бүлэг 01-ийн картууд 3:4 тул тэднийг
 *  тэр харьцаагаар нь зүснэ (1:2 зургийг 3:4 нүдэнд хийвэл дээд/доод
 *  талаас нь 37% тайрч, доорх голомтыг үрэгдүүлнэ). */
const ASPECT = { portrait: 1 / 2, card: 3 / 4 };

/* Зүйл бүр:
     out     — public/images/mobile/<out>.webp
     src     — ~/Downloads доторх мастер (байвал үүнийг сонгоно)
     alt     — репо доторх нөөц эх сурвалж
     at      — видео эх сурвалжаас кадар авах хором (сек)
     focus   — хэвтээ голомт (0 = зүүн зах, 1 = баруун зах)
     focusY  — босоо голомт (өгөгдмөл 0.5)
     aspect  — ASPECT-ийн түлхүүр
     note    — хаана хэрэглэгдэхийг тэмдэглэнэ */
const GROUPS = {
  /* Hero — цамхагууд + ELYSIUM тэмдэг. Голомт нь тэмдэг үүрсэн хамгийн
     өндөр цамхаг дээр (зүүн гуравны нэг). */
  hero: [
    {
      out: "hero",
      src: "Hero-daylight.mp4",
      at: 7.6,
      alt: "public/images/hero-towers-sign.png",
      focus: 0.28,
      aspect: "portrait",
      note: "MonoHero — #top",
    },
  ],

  /* Бүлэг 01 — цэг тутамд нэг карт. Дараалал нь `site.plan.points`-ыг
     дагана: 506 айл · 4 блок / 85% ногоон / 513 зогсоол / 2027 II улирал. */
  plan: [
    {
      out: "plan-01-masterplan",
      alt: "public/images/aerial-masterplan.jpg",
      focus: 0.5,
      aspect: "card",
      note: "506 айл · 4 блок",
    },
    {
      out: "plan-02-green",
      alt: "public/images/aerial-courtyard-promenade.jpg",
      /* Цэцэрлэгт хүрээлэн ба явган зам — цамхагийн хана биш. */
      focus: 0.45,
      aspect: "card",
      note: "85% ногоон байгууламж",
    },
    {
      out: "plan-03-street",
      alt: "public/images/amenity-retail-podium.jpg",
      /* Гудамжны түвшин: орц + зогсож буй машинууд баруун талд. */
      focus: 0.62,
      aspect: "card",
      note: "513 зогсоол",
    },
    {
      out: "plan-04-handover",
      alt: "public/images/exterior-elevation-dusk.jpg",
      focus: 0.5,
      aspect: "card",
      note: "2027 · II улирал",
    },
  ],

  /* Бүлэг 03 — слайд тутамд нэг дэвсгэр, барилгын үе шатын дарааллаар.
     Клипүүдэд барилга нь зөвхөн ЗҮҮН талыг эзэлж, баруун тал нь тэнгэр:
     голоор нь зүсвэл хоосон тэнгэр үлдэнэ. */
  structure: [
    {
      out: "structure-01-frame",
      src: "hf_20260813_071108_b9b49fe3-27bd-465a-8d0d-75de7c5f6ef5.mp4",
      at: 4.6,
      alt: "public/video/structure-frame.mp4",
      focus: 0.25,
      aspect: "portrait",
      note: "цутгамал каркас",
    },
    {
      out: "structure-02-windows",
      src: "hf_20260813_071136_7a1ab96a-2a6a-4f5a-ad14-b73999b31edb.mp4",
      at: 4.6,
      alt: "public/video/structure-windows.mp4",
      focus: 0.24,
      aspect: "portrait",
      note: "цонх",
    },
    {
      out: "structure-03-facade",
      src: "hf_20260813_071213_3fff4b01-2e51-4845-a099-d82f7b624e76.mp4",
      at: 4.6,
      alt: "public/video/structure-facade.mp4",
      focus: 0.22,
      aspect: "portrait",
      note: "фасад",
    },
  ],
};

/** Эх файлын мөрөн дэх эхний `WxH`. */
function probe(file) {
  // ffmpeg нь оролт дээр гаралтгүй дуудагдвал 1-ээр гардаг — энэ нь
  // алдаа биш, тиймээс статусыг нь үл тоомсорлож stderr-ийг уншина.
  let out = "";
  try {
    execFileSync(ffmpeg, ["-hide_banner", "-i", file], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) {
    out = `${err.stderr ?? ""}`;
  }
  const line = out.split("\n").find((l) => l.includes("Stream #") && l.includes("Video:"));
  const m = line?.match(/,\s(\d{2,5})x(\d{2,5})[\s,]/);
  if (!m) throw new Error(`cannot read dimensions: ${file}`);
  return { w: Number(m[1]), h: Number(m[2]) };
}

/** Голомтын эргэн тойрны хамгийн ТОМ `ratio` зүсмийг эх файлаас олно. */
function crop({ w, h }, ratio, focus, focusY) {
  let cw = Math.round(h * ratio);
  let ch = h;
  if (cw > w) {
    cw = w;
    ch = Math.round(w / ratio);
  }
  // Голомтыг төвд нь тавиад, зүсмийг зургийн дотор үлдээнэ.
  const x = Math.round(Math.min(Math.max(focus * w - cw / 2, 0), w - cw));
  const y = Math.round(Math.min(Math.max(focusY * h - ch / 2, 0), h - ch));
  return { cw, ch, x, y };
}

function build(group) {
  const items = GROUPS[group];
  if (!items) throw new Error(`unknown group: ${group}`);
  mkdirSync(OUT_DIR, { recursive: true });

  for (const item of items) {
    const master = item.src ? join(SRC, item.src) : null;
    const usingMaster = Boolean(master && existsSync(master));
    const input = usingMaster ? master : resolve(ROOT, item.alt);
    if (!existsSync(input)) throw new Error(`no source for ${item.out}: ${item.alt}`);

    // `at` нь зөвхөн бичлэгт хамаатай: hero-гийн нөөц эх сурвалж нь
    // ЗУРАГ тул түүн дээр хайлт хийвэл кадар олдохгүй, гаралт хоосон
    // гарна (ffmpeg энэ тохиолдолд алдаа ч буцаадаггүй).
    const at = item.at && !/\.(png|jpe?g|webp|avif|tiff?)$/i.test(input) ? item.at : null;

    const size = probe(input);
    const ratio = ASPECT[item.aspect];
    const { cw, ch, x, y } = crop(size, ratio, item.focus, item.focusY ?? 0.5);

    // Хэзээ ч томсгохгүй: зорилтот өргөн эх зүсмээс том бол зүсмээ
    // байгаагаар нь үлдээнэ. Томсгосон пиксел нь тодрол нэмэхгүй, зөвхөн
    // байт нэмнэ.
    const outW = Math.min(TARGET_W[item.aspect], cw);
    const outH = Math.round(outW / ratio);

    const out = join(OUT_DIR, `${item.out}.webp`);
    execFileSync(
      ffmpeg,
      [
        "-y",
        "-v", "error",
        ...(at ? ["-ss", String(at)] : []),
        "-i", input,
        "-frames:v", "1",
        "-vf", `crop=${cw}:${ch}:${x}:${y},scale=${outW}:${outH}:flags=lanczos`,
        "-c:v", "libwebp",
        "-quality", String(QUALITY),
        "-compression_level", "6",
        "-preset", "picture",
        // Нэг зураг: `image2` муксер өгөгдмөлөөр дугаарлагдсан дараалал
        // хүлээдэг — `-update` нь ганц файл руу бичихийг заана.
        "-f", "image2",
        "-update", "1",
        out,
      ],
      { stdio: ["ignore", "inherit", "inherit"] }
    );

    const kb = Math.round(statSync(out).size / 1024);
    console.log(
      `[${group}] ${item.out}.webp — ${outW}×${outH}, ${kb} KB ` +
        `(${size.w}×${size.h} ${usingMaster ? "master" : "repo"}, focus ${item.focus}) · ${item.note}`
    );
    if (!usingMaster && item.src) {
      console.log(
        `         ↳ ${item.src} олдсонгүй (${SRC}) — 4K мастертай машин дээр ` +
          `дахин ажиллуулбал ${TARGET_W[item.aspect]}px өргөнтэй гарна.`
      );
    }
  }
}

const which = process.argv[2];
for (const group of which ? [which] : Object.keys(GROUPS)) build(group);
