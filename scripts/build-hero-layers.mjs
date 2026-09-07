/* Hero-гийн ХОЁР ДАВХАРГАТ клип — «бичиг блокуудын ард» эффект.
 *
 * Захиалагч нэг timeline-аас хоёр 4K (3840×2160 / 24fps / 30сек)
 * экспорт өгсөн:
 *   • background.mp4 — арын бүтэн бичлэг (хот, тэнгэр, блокууд бүгд).
 *   • Masked.mp4     — зөвхөн урд талын 4 блок + подиум, ногоон
 *                      (#00FD00) дэвсгэр дээр.
 *
 * Сайт дээр: ар видео → «ELYSIUM RESIDENCE» гарчиг → урд блокуудын
 * alpha видео. Гарчиг блокуудын АРД, тэнгэрийн урд харагдана
 * (`MonoHero.tsx`). Хоёр видео ижил кадртай тул ижил crop/scale-ээр
 * гаргавал пикселээрээ давхцана.
 *
 * Гаралт (public/video/):
 *   hero-loop-{desktop,mobile}.mp4 / .jpg   — ар (H.264) + постер
 *   hero-fg-{desktop,mobile}.webm           — урд, VP9 alpha (Chrome, Firefox, Android)
 *   hero-fg-{desktop,mobile}.mov            — урд, HEVC alpha (Safari, iOS)
 *   hero-fg-{desktop,mobile}.webp           — урд блокуудын alpha постер
 *
 * Chroma key: ffmpeg `chromakey` (yuv444 дээр, ирмэг зөөлөн) + `despill`
 * (mix 0.5, expand 0 — ар видеотой тулгахад өнгөний зөрүү ~4/255,
 * ногоон үлдэгдэл ~0). Гар утас — ижил эхээс төвийн 9:16 кроп.
 *
 *   node scripts/build-hero-layers.mjs [desktop|mobile]
 */

import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "ffmpeg-static";

const SRC = "/Users/aagii/Downloads";
const BG = join(SRC, "background.mp4");
const FG = join(SRC, "Masked.mp4");
const OUT = fileURLToPath(new URL("../public/video/", import.meta.url));

/** Постер / cutout авах мөч (сек). */
const POSTER_AT = 0.2;
/** 2 секунд тутамд түлхүүр кадар (24fps). */
const GOP = 48;

/* Урд давхарга ар давхаргатай ИЖИЛ харьцаа, ижил кропоор гарах ёстой;
   нягтрал нь ялгаатай байж болно — хоёулаа `object-cover`-оор нэг
   хайрцагт сунадаг тул давхцана. Гар утасны урд давхаргыг 810×1440
   болгож жинг нь багасгав (1080×1920 дээр webm 8MB байсан). */
const VARIANTS = {
  desktop: {
    bg: "scale=1920:1080:flags=lanczos,setsar=1",
    fg: "scale=1920:1080:flags=lanczos,setsar=1",
    /* Ар — блокууд урд давхаргаас ирэх тул арын нарийн ширийн чухал биш. */
    bgCrf: 31,
    fgCrf: 42,
  },
  mobile: {
    bg: "crop=1215:2160:1312:0,scale=1080:1920:flags=lanczos,setsar=1",
    fg: "crop=1215:2160:1312:0,scale=810:1440:flags=lanczos,setsar=1",
    bgCrf: 31,
    fgCrf: 42,
  },
};

const KEY = "format=yuv444p,chromakey=0x00FD00:0.12:0.05,despill=type=green:mix=0.5:expand=0";

function run(args) {
  execFileSync(ffmpeg, ["-y", "-v", "error", ...args], { stdio: ["ignore", "inherit", "inherit"] });
}
const kb = (f) => `${Math.round(statSync(f).size / 1024)} KB`;

function build(name) {
  const v = VARIANTS[name];
  if (!v) throw new Error(`unknown variant: ${name}`);

  /* Ар — H.264 */
  const bg = join(OUT, `hero-loop-${name}.mp4`);
  run([
    "-i", BG, "-an", "-vf", v.bg,
    "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
    "-crf", String(v.bgCrf), "-preset", "slow", "-g", String(GOP),
    "-movflags", "+faststart", bg,
  ]);
  console.log(`[${name}] bg mp4 — ${kb(bg)}`);
  const poster = join(OUT, `hero-loop-${name}.jpg`);
  run(["-ss", String(POSTER_AT), "-i", BG, "-frames:v", "1", "-vf", v.bg, "-q:v", "4", poster]);
  console.log(`[${name}] bg poster — ${kb(poster)}`);

  /* Урд — VP9 alpha (webm) */
  const webm = join(OUT, `hero-fg-${name}.webm`);
  run([
    "-i", FG, "-an", "-vf", `${v.fg},${KEY},format=yuva420p`,
    "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
    "-crf", String(v.fgCrf), "-b:v", "0", "-deadline", "good", "-cpu-used", "2",
    "-row-mt", "1", "-auto-alt-ref", "0", "-g", String(GOP), webm,
  ]);
  console.log(`[${name}] fg webm — ${kb(webm)}`);

  /* Урд — HEVC alpha (mov, Safari). VideoToolbox — зөвхөн macOS дээр. */
  const mov = join(OUT, `hero-fg-${name}.mov`);
  run([
    "-i", FG, "-an", "-vf", `${v.fg},${KEY},format=bgra`,
    "-c:v", "hevc_videotoolbox", "-alpha_quality", "0.6", "-q:v", "45",
    "-tag:v", "hvc1", "-pix_fmt", "bgra", "-movflags", "+faststart", mov,
  ]);
  console.log(`[${name}] fg mov — ${kb(mov)}`);

  /* Урд — alpha постер (webp) */
  const webp = join(OUT, `hero-fg-${name}.webp`);
  run([
    "-ss", String(POSTER_AT), "-i", FG, "-frames:v", "1",
    "-vf", `${v.fg},${KEY},format=rgba`, "-c:v", "libwebp", "-quality", "85", webp,
  ]);
  console.log(`[${name}] fg poster — ${kb(webp)}`);
}

const which = process.argv[2];
for (const name of which ? [which] : Object.keys(VARIANTS)) build(name);
