/* Subset the client's Gilroy OTFs down to the web faces the site actually
 * uses.
 *
 * Ирсэн багц: 20 OTF = 2.1 МБ. Үүнээс кодод ҮНЭХЭЭР хэрэглэгддэг нь
 * 300/400/500/600/700/800/900 (босоо) ба 300 налуу (`/final` хуудасны
 * ганц шошго) — нийт 8. Thin(100), UltraLight(200), Heavy(950) болон
 * үлдсэн 9 налуу нь нэг ч удаа дуудагддаггүй.
 *
 * OTF нь вэбэд зориулагдаагүй: шахалтгүй, ~105 КБ. Тэрхүү файлыг
 * latin+cyrillic хүрээгээр зүсэж WOFF2 болгоход ~20 КБ болно — хөтөч
 * татдаг байт 5 дахин буурна.
 *
 * Шаардлага: fonttools + brotli (`pip install fonttools brotli`).
 *
 *   node scripts/build-fonts.mjs
 */

import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = fileURLToPath(new URL("../src/fonts/gilroy/", import.meta.url));

/* Хүрээ. Монгол кирилл нь Ө/ө (U+04E8-9) ба Ү/ү (U+04AE-F) шаарддаг —
   Google-ийн стандарт `cyrillic` дэд багц эдгээрийг АГУУЛДАГГҮЙ тул
   0400–04FF-ийг бүтнээр нь авна. Мөн UI-д хэрэглэгддэг сум (→ ↗),
   зураас, хашилт зэрэг цэг таслал. */
const UNICODES = [
  "U+0000-00FF", // latin + latin-1 supplement (· × ° гэх мэт)
  "U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC",
  "U+0300-0301", // өргөлт
  "U+0400-04FF", // кирилл, монгол Ө/Ү-г оруулаад
  "U+2000-206F", // зай, зураас, хашилт, …
  "U+2074,U+20AC,U+2113,U+2116,U+2122", // № € ™
  "U+2190-21FF", // сум: → ↗ ↑ ↓
  "U+2212,U+2215,U+25CA,U+FEFF,U+FFFD",
].join(",");

/* Хадгалах OpenType шинжүүд. `kern`/`liga` алдвал бичиг задарна;
   үлдсэнийг нь хаяснаар хүснэгт хөнгөрнө. */
const FEATURES = "kern,liga,clig,calt,ccmp,locl,mark,mkmk,rlig";

/** Кодод хэрэглэгддэг нүүрнүүд. Энэ жагсаалт `src/app/layout.tsx`-ийн
 *  `src` массивтай ЯГ тохирно. */
const FACES = [
  { src: "GIP-Light.otf", out: "gilroy-300.woff2" },
  { src: "GIP-Regular.otf", out: "gilroy-400.woff2" },
  { src: "GIP-Medium.otf", out: "gilroy-500.woff2" },
  { src: "GIP-SemiBold.otf", out: "gilroy-600.woff2" },
  { src: "GIP-Bold.otf", out: "gilroy-700.woff2" },
  { src: "GIP-ExtraBold.otf", out: "gilroy-800.woff2" },
  { src: "GIP-Black.otf", out: "gilroy-900.woff2" },
  /* Ганц налуу: `/final` хуудасны хэсгийн шошго (`font-light italic`).
     Үүнгүй бол хөтөч босоо нүүрийг налуулж хуурамч italic зурна. */
  { src: "GIP-LightItalic.otf", out: "gilroy-300-italic.woff2" },
];

const kb = (file) => Math.round(statSync(file).size / 1024);

let before = 0;
for (const f of readdirSync(DIR).filter((f) => f.endsWith(".otf"))) {
  before += statSync(join(DIR, f)).size;
}

let after = 0;
for (const face of FACES) {
  const input = join(DIR, face.src);
  const output = join(DIR, face.out);
  execFileSync(
    "pyftsubset",
    [
      input,
      `--unicodes=${UNICODES}`,
      `--layout-features=${FEATURES}`,
      "--flavor=woff2",
      "--drop-tables+=DSIG",
      `--output-file=${output}`,
    ],
    { stdio: ["ignore", "inherit", "inherit"] }
  );
  after += statSync(output).size;
  console.log(`${face.src} (${kb(input)} KB) → ${face.out} (${kb(output)} KB)`);
}

console.log(
  `\n${FACES.length} faces — ${Math.round(after / 1024)} KB total ` +
    `(эх OTF сан ${Math.round(before / 1024)} KB)`
);
