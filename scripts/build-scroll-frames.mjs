/* Build the scroll-scrubbed frame sequences from the client's 4K clips.
 *
 * Each sequence concatenates several 8s clips with a short crossfade, then
 * samples a fixed number of WebP frames. The frame count is chosen so the
 * pinned section advances roughly one frame per 10–15px of scroll.
 *
 * Sources live outside the repo (~/Downloads) — this script is a one-off
 * regeneration tool, the committed output is public/<out>/frame_NNN.webp.
 *
 *   node scripts/build-scroll-frames.mjs [plan|structure]
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "ffmpeg-static";

const SRC = "/Users/aagii/Downloads";
const PUBLIC = fileURLToPath(new URL("../public/", import.meta.url));

const SEQUENCES = {
  /* Нүүр дэлгэцийн `hero` багц ХАСАГДСАН: тэр хэсэг кадрын дараалал
     биш, давталттай mp4 болсон — `build-section-videos.mjs hero`. */
  /* Ерөнхий төлөвлөлт — one clip per stat point, in POINTS order:
     506 айл · 4 блок / 85% ногоон / 513 зогсоол / 2027 II улирал. */
  plan: {
    out: "plan-frames",
    clips: ["Niit tuluwlult.mp4", "85%.mp4", "513 zogsool.mp4", "Niit tuluwlult 2.mp4"],
    xfade: 0.5,
    frames: 180,
    scale: "1152:648",
    quality: 60,
  },
  /* Барилгын бүтэц — single 15s clip: bare monolithic frame → windows →
     finished facade. Drives chapter 03's scrub in that same order. */
  structure: {
    out: "structure-frames",
    clips: ["hf_20260813_071108_b9b49fe3-27bd-465a-8d0d-75de7c5f6ef5_1.mp4"],
    clipLen: 15.125,
    xfade: 0,
    frames: 120,
    scale: "1280:-2",
    quality: 62,
  },
};

/** Duration of each source clip, in seconds. */
function duration(file) {
  const out = execFileSync(ffmpeg, ["-i", join(SRC, file)], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).toString();
  return out;
}

/** Build the `-filter_complex` chain: scale each clip, then xfade them in order. */
function filterChain({ clips, xfade, scale, frames }, clipLen) {
  const parts = clips.map((_, i) => `[${i}:v]scale=${scale},setsar=1,fps=24[c${i}]`);

  // Running length of the chain so far, used to place each xfade offset.
  let acc = clipLen;
  let prev = "c0";
  for (let i = 1; i < clips.length; i++) {
    const offset = (acc - xfade).toFixed(3);
    const label = i === clips.length - 1 ? "xf" : `x${i}`;
    parts.push(
      `[${prev}][c${i}]xfade=transition=fade:duration=${xfade}:offset=${offset}[${label}]`
    );
    acc = acc + clipLen - xfade;
    prev = label;
  }

  const total = acc;
  // Sample `frames` evenly across the whole timeline.
  const fps = (frames / total).toFixed(6);
  parts.push(`[${prev}]fps=${fps}[v]`);
  return { filter: parts.join(";"), total };
}

function build(name) {
  const seq = SEQUENCES[name];
  if (!seq) throw new Error(`unknown sequence: ${name}`);

  const outDir = join(PUBLIC, seq.out);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  // Client clips are a uniform 8s / 24fps / 4K export unless overridden.
  const CLIP_LEN = seq.clipLen ?? 8;
  const { filter, total } = filterChain(seq, CLIP_LEN);

  const args = [
    "-y",
    "-v", "error",
    ...seq.clips.flatMap((c) => ["-i", join(SRC, c)]),
    "-filter_complex", filter,
    "-map", "[v]",
    "-vsync", "0",
    "-frames:v", String(seq.frames),
    "-c:v", "libwebp",
    "-quality", String(seq.quality),
    "-compression_level", "6",
    "-preset", "picture",
    // Force the image2 muxer — matching on the .webp extension alone would
    // produce a single animated WebP instead of a numbered sequence.
    "-f", "image2",
    join(outDir, "frame_%03d.webp"),
  ];

  console.log(`[${name}] ${seq.clips.length} clips → ${total.toFixed(1)}s → ${seq.frames} frames @ ${seq.scale}`);
  execFileSync(ffmpeg, args, { stdio: ["ignore", "inherit", "inherit"] });

  const files = readdirSync(outDir).filter((f) => f.endsWith(".webp"));
  const bytes = files.reduce((n, f) => n + statSync(join(outDir, f)).size, 0);
  console.log(
    `[${name}] wrote ${files.length} frames, ${(bytes / 1024 / 1024).toFixed(1)} MB ` +
      `(${Math.round(bytes / files.length / 1024)} KB avg) → public/${seq.out}/`
  );
}

const which = process.argv[2];
for (const name of which ? [which] : Object.keys(SEQUENCES)) build(name);
