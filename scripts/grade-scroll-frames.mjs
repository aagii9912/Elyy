/* Re-grade a committed frame sequence in place.
 *
 * `build-scroll-frames.mjs` needs the client's 4K clips (they live outside
 * the repo), so it cannot be run on a checkout. This script applies the
 * identical grade — `gradeWebp`, see frame-grade.mjs — to the WebP frames
 * that are committed, which is how the light rebuild of the hero and of
 * chapter 01 was produced.
 *
 * It reads the UNGRADED originals out of git (`git show <ref>:<path>`) rather
 * than the working tree, so it is idempotent: running it twice grades the
 * same source twice and lands on the same output. Pass a different ref once
 * the ungraded frames are no longer the committed ones.
 *
 *   node scripts/grade-scroll-frames.mjs hero-video-frames plan-frames
 *   node scripts/grade-scroll-frames.mjs --ref <sha> plan-frames
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readdirSync, writeFileSync, renameSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { GRADES, gradeWebp } from "./frame-grade.mjs";

const REPO = fileURLToPath(new URL("../", import.meta.url));
const PUBLIC = join(REPO, "public");

function gradeDir(dir, ref) {
  const grade = GRADES[dir];
  if (!grade) throw new Error(`no grade defined for public/${dir} — see frame-grade.mjs`);
  const frames = readdirSync(join(PUBLIC, dir))
    .filter((f) => /^frame_\d+\.webp$/.test(f))
    .sort();
  if (!frames.length) throw new Error(`no frames in public/${dir}`);

  const tmp = mkdtempSync(join(tmpdir(), "grade-"));
  let bytes = 0;
  for (const f of frames) {
    // the ungraded original, straight out of git
    const src = join(tmp, `src-${f}`);
    writeFileSync(src, execFileSync("git", ["show", `${ref}:public/${dir}/${f}`],
      { cwd: REPO, maxBuffer: 1 << 28, encoding: "buffer" }));

    const out = join(tmp, f);
    gradeWebp(src, out, grade);
    bytes += statSync(out).size;
    rmSync(src, { force: true });
  }

  for (const f of frames) renameSync(join(tmp, f), join(PUBLIC, dir, f));
  rmSync(tmp, { recursive: true, force: true });
  console.log(
    `[${dir}] graded ${frames.length} frames from ${ref} → public/${dir}/ ` +
      `(${(bytes / 1024 / 1024).toFixed(1)} MB, ${Math.round(bytes / frames.length / 1024)} KB avg)`
  );
}

const argv = process.argv.slice(2);
let ref = "HEAD";
const dirs = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--ref") ref = argv[++i];
  else dirs.push(argv[i]);
}
if (!dirs.length) throw new Error("usage: node scripts/grade-scroll-frames.mjs [--ref <sha>] <dir> [dir…]");
for (const d of dirs) gradeDir(d, ref);
