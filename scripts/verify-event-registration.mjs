import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const load = createRequire(import.meta.url);
load.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const { eventRegistrationMessage, registrationOptions, validRegistrationOptions, ulaanbaatarToday } = load("../src/lib/event-registration.ts");
const { defaultContent, newEvent } = load("../src/lib/events.ts");
const { leadRequestBody } = load("../src/lib/lead-request.ts");
const today = "2026-10-08";
const input = { appointmentDate: today, apartmentTypes: ["3 Өрөө", "5 Өрөө"], areaRanges: ["161-182 м.кв", "253-370 м.кв"] };
const result = eventRegistrationMessage(input, today);
assert.equal(result.ok, true);
assert.equal(result.message, "Цаг товлох өдөр: 2026-10-08\nСонирхож буй орон сууц: 3 Өрөө, 5 Өрөө\nСонирхож буй талбайн хэмжээ: 161-182 м.кв, 253-370 м.кв");
for (const patch of [
  { appointmentDate: "2026-10-07" }, { appointmentDate: "2027-02-29" },
  { appointmentDate: "2026-13-08" }, { appointmentDate: "08/10/2026" },
  { appointmentDate: null }, { apartmentTypes: [] }, { areaRanges: [] },
  { apartmentTypes: "3 Өрөө" }, { apartmentTypes: ["3 Өрөө", "3 Өрөө"] },
  { areaRanges: ["not-configured"] }, { apartmentTypes: [1] },
]) assert.equal(eventRegistrationMessage({ ...input, ...patch }, today).ok, false, JSON.stringify(patch));

assert.equal(eventRegistrationMessage({ ...input, appointmentDate: "2028-02-29" }, today).ok, true);
assert.equal(ulaanbaatarToday(new Date("2026-10-07T16:00:00Z")), today);
assert.equal(ulaanbaatarToday(new Date("2026-10-07T15:59:59Z")), "2026-10-07");
const fullPage = defaultContent("Test");
assert.equal(fullPage.template, "event");
assert.equal(fullPage.accent, "#b4d656");
assert.equal(fullPage.form.fields.email, false);
assert.equal(fullPage.form.fields.guests, true);
assert.equal(fullPage.sections.length, 3);
const registrationPage = defaultContent("Test", "registration");
assert.equal(registrationPage.template, "registration");
assert.equal(registrationPage.accent, "#b99e7f");
assert.equal(registrationPage.form.fields.guests, false);
assert.deepEqual(registrationPage.sections, []);
assert.equal(newEvent({ id: "test", name: "Test", slug: "test", now: today, template: "registration" }).content.template, "registration");
assert.equal(registrationOptions({}).apartmentTypes.length, 5);
const custom = { apartmentTypes: ["2 өрөө"], areaRanges: ["80–100 м²"] };
assert.equal(eventRegistrationMessage({ ...input, ...custom }, today, custom).ok, true);
assert.equal(eventRegistrationMessage(input, today, custom).ok, false);
const renamed = eventRegistrationMessage({ ...input, ...custom }, today, { ...custom, apartmentLabel: "Сонгох байр", areaLabel: "Талбай" });
assert.ok(renamed.message.includes("Сонгох байр: 2 өрөө\nТалбай: 80–100 м²"));
for (const bad of [[], [""], [" repeat", "repeat"], ["same", "same"], ["x".repeat(61)], [3]]) {
  assert.equal(validRegistrationOptions(bad), false);
}
assert.equal(validRegistrationOptions(custom.apartmentTypes), true);

const attempt = { current: null };
const first = JSON.parse(leadRequestBody(input, attempt));
assert.equal(JSON.parse(leadRequestBody(input, attempt)).requestId, first.requestId);
assert.notEqual(JSON.parse(leadRequestBody({ ...input, areaRanges: ["201-230 м.кв"] }, attempt)).requestId, first.requestId);
console.log("Event registration: required selections, dates, custom options, defaults, and retry IDs passed.");
