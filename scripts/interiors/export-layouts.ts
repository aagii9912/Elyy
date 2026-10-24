/* Айлын 7 типийн төлөвлөлтийг (`lib/explore/interior.ts`) Blender-д
   зориулж JSON болгоно — интерьерийн геометрийн цорын ганц эх сурвалж.

     npx tsx --tsconfig ./tsconfig.json scripts/interiors/export-layouts.ts

   Гаралт: scripts/interiors/layouts.json */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOM_HEIGHT } from "@/lib/explore/config";
import { buildInterior } from "@/lib/explore/interior";
import { PLATE_2F, PLATE_TYP, toLocalRect, unitFrame } from "@/lib/explore/plates";
import { UNIT_TYPES } from "@/lib/explore/units";

const round = (_key: string, v: unknown) => (typeof v === "number" ? Math.round(v * 1e4) / 1e4 : v);

const out: Record<string, unknown> = {};
for (const slot of [...PLATE_TYP, ...PLATE_2F]) {
  if (out[slot.type]) continue;
  const frame = unitFrame(toLocalRect(slot), slot.facade);
  const m = buildInterior(slot.type, frame.L, frame.D);
  /* Тавилга, ханын оройг Blender өөрөө үүсгэнэ. */
  out[slot.type] = {
    type: slot.type,
    code: UNIT_TYPES[slot.type].code,
    facade: slot.facade,
    H: ROOM_HEIGHT,
    L: m.L,
    D: m.D,
    rooms: m.rooms,
    walls: m.walls,
    glass: m.glass,
    frames: m.frames,
    doors: m.doors,
    entry: m.entry,
  };
}

const file = join(process.cwd(), "scripts/interiors/layouts.json");
writeFileSync(file, JSON.stringify(out, round, 1) + "\n");
console.log(`wrote ${file}: ${Object.keys(out).join(", ")}`);
