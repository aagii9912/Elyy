import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const load = createRequire(import.meta.url);

load.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const { mergeSiteContent, DEFAULT_THEME } = load("../src/lib/site-content.ts");
const { isAllowedUploadType } = load("../src/lib/upload-types.ts");

const oldPalette = {
  ground: "#f4f4f1", surface: "#ffffff", dark: "#151717", muted: "#8a8d8c",
  accent: "#b4d656", accentDeep: "#3f6a33", film: "#16280f",
};
const olderSite = mergeSiteContent({
  theme: { palette: oldPalette },
  location: {
    pins: [
      { place: "A", x: 12, y: 34 },
      { place: "B", x: 78, y: 90 },
    ],
  },
});
assert.deepEqual(olderSite.location.pins.map(({ xMobile, yMobile }) => [xMobile, yMobile]), [[12, 34], [78, 90]]);
assert.deepEqual(olderSite.theme.palette, DEFAULT_THEME.palette);
assert.equal(olderSite.hero.media.mobile.video, "/video/hero-loop-mobile.mp4");
assert.equal(olderSite.plan.background.desktop.video, "");

const customized = mergeSiteContent({
  theme: { palette: { ...oldPalette, accent: "#123456" } },
  hero: { media: { desktop: { video: "/custom/hero.mp4" } } },
  location: { mapImageMobile: "/custom/mobile.jpg", pins: [{ x: 12, y: 34, xMobile: 56, yMobile: 67 }] },
});
assert.equal(customized.theme.palette.accent, "#123456");
assert.equal(customized.hero.media.desktop.video, "/custom/hero.mp4");
assert.equal(customized.location.mapImageMobile, "/custom/mobile.jpg");
assert.deepEqual([customized.location.pins[0].xMobile, customized.location.pins[0].yMobile], [56, 67]);

for (const type of ["video/mp4", "video/webm", "video/quicktime"]) assert.ok(isAllowedUploadType(type));
assert.equal(isAllowedUploadType("text/html"), false);
process.stdout.write("Responsive maps and videos: OK\n");
