/* The high-key grade applied to every scroll-scrubbed frame sequence.
 *
 * Why it exists: the mono page is ONE light ground (design-system §1). The
 * frame sequences used to be shown full-bleed behind a black scrim, so the
 * footage was present but invisible and the page read as two dark screens
 * bolted onto a light site. The footage now sits in a light inset panel on
 * the ground, which means the frames themselves have to belong to that
 * ground — lifted, not drained.
 *
 * The first attempt at that repair got the lift out of `hue=s=0.15`, i.e. by
 * throwing the colour away: both sequences came back at 0.011 / 0.0095 mean
 * pixel saturation — monochrome, against 0.083–0.42 across the page's own
 * reference images. This grade gets the lift from exposure and a white scrim
 * instead, and restores the colour (and, on the pale masterplan, pushes it):
 *
 *   gamma      out = in^(1/gamma). Exposure. Opens the shadows, where an
 *              architectural render keeps its modelling, without moving the
 *              white point.
 *   scrim      out = scrim + (1 − scrim)·in. A white scrim over the whole
 *              frame: the black point lifts off zero so the darkest pixel in
 *              the window is still lighter than the page's ink and nothing in
 *              the footage reads as a hole cut in the ground. It also carries
 *              the foliage up out of `moss` — dark forest green is a brand
 *              colour, reserved for kicker rules, pins and nodes
 *              (design-system §2), and a window full of it would eat the
 *              page's whole green accent budget.
 *   vibrance   saturation gain of 1 + vibrance·(1 − sat/VIBRANCE_REF):
 *              strongest on the palest pixels, 1.0 (untouched) on anything
 *              already at VIBRANCE_REF saturation. Vibrance rather than flat
 *              saturation because the masterplan is a pale render that needs
 *              the lift exactly where it is weakest, while its planting is
 *              already saturated and must not be pushed further toward the
 *              brand greens.
 *
 * Per sequence, because they are different negatives: the hero plate is a
 * dusk exterior that already carries colour and has no foliage to speak of,
 * so it gets the shallower scrim and keeps more of its range; the masterplan
 * is a pale daylight render with a lot of planting, so it gets a deeper scrim
 * and more vibrance.
 *
 * Measured on the graded output: masterplan lum 0.75, p95−p05 0.51,
 * saturation 0.098; hero lum 0.65, p95−p05 0.48, saturation 0.166.
 *
 * The transform is deliberately plain arithmetic on straight sRGB bytes
 * rather than an ffmpeg filter string: ffmpeg's `hue`/`eq` chain runs in
 * subsampled YUV, which cost ~4x the accent-neighbourhood pixels for the same
 * look. Both `build-scroll-frames.mjs` (regeneration from the client clips)
 * and `grade-scroll-frames.mjs` (re-grade of the committed frames) call
 * `gradeWebp` below, so the two paths cannot drift apart.
 */

import { execFileSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";

/** Saturation at which vibrance has faded to 1.0 (no change). */
export const VIBRANCE_REF = 0.38;

/** Grade + encoder settings per public/ frame directory. */
export const GRADES = {
  "hero-video-frames": { gamma: 1.35, scrim: 0.10, vibrance: 1.0, quality: 62 },
  "plan-frames": { gamma: 1.32, scrim: 0.16, vibrance: 1.15, quality: 70 },
};

/** 256-entry LUT for the tone + scrim steps, which are per-channel. */
function toneLut({ gamma, scrim }) {
  const lut = new Float32Array(256);
  for (let i = 0; i < 256; i++) lut[i] = scrim + (1 - scrim) * Math.pow(i / 255, 1 / gamma);
  return lut;
}

/**
 * Grade a packed rgb24 buffer in place.
 * @param {Buffer|Uint8Array} buf  length must be a multiple of 3
 * @param {{gamma:number, scrim:number, vibrance:number}} grade
 * @returns {Buffer|Uint8Array} the same buffer
 */
export function gradeRgb24(buf, grade) {
  if (buf.length % 3 !== 0) throw new Error(`rgb24 buffer not a multiple of 3: ${buf.length}`);
  const tone = toneLut(grade);
  const { vibrance } = grade;
  for (let i = 0; i < buf.length; i += 3) {
    const r = tone[buf[i]];
    const g = tone[buf[i + 1]];
    const b = tone[buf[i + 2]];

    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    const gain = 1 + vibrance * (1 - Math.min(1, sat / VIBRANCE_REF));

    buf[i] = clamp255(lum + (r - lum) * gain);
    buf[i + 1] = clamp255(lum + (g - lum) * gain);
    buf[i + 2] = clamp255(lum + (b - lum) * gain);
  }
  return buf;
}

function clamp255(v) {
  const n = Math.round(v * 255);
  return n < 0 ? 0 : n > 255 ? 255 : n;
}

/* ---- file-level application -------------------------------------------
   ffmpeg is used only to decode and encode; every arithmetic step above runs
   on straight rgb24 bytes, so the grade is identical whichever script
   applies it. */

/** `WxH` of an image, read off ffmpeg's own stream line. */
function dimensions(file) {
  let info = "";
  try {
    // `ffmpeg -i <file>` with no output prints the stream line and exits 1.
    execFileSync(ffmpeg, ["-hide_banner", "-i", file],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    info = String(e.stderr ?? "");
  }
  const m = /,\s(\d+)x(\d+)[\s,]/.exec(info);
  if (!m) throw new Error(`could not read dimensions of ${file}`);
  return { w: Number(m[1]), h: Number(m[2]) };
}

/**
 * Grade one WebP frame: `src` → `out` (may be the same path).
 * @param {string} src
 * @param {string} out
 * @param {{gamma:number, scrim:number, vibrance:number, quality:number}} grade
 */
export function gradeWebp(src, out, grade) {
  const { w, h } = dimensions(src);
  const raw = execFileSync(
    ffmpeg,
    ["-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    { maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "inherit"] }
  );
  execFileSync(
    ffmpeg,
    ["-y", "-v", "error",
     "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${w}x${h}`, "-i", "-",
     "-c:v", "libwebp", "-quality", String(grade.quality),
     "-compression_level", "6", "-preset", "picture", "-frames:v", "1", out],
    { input: gradeRgb24(raw, grade), stdio: ["pipe", "inherit", "inherit"] }
  );
}
