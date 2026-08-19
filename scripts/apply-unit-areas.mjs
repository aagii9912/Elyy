#!/usr/bin/env node
/* ============================================================
   Нэг удаагийн засвар — типүүдийн талбай БОЛОН чатботын талбайн
   хариултыг "Elysium Brochure 0813"-ын утгаар Supabase-д ХАДГАЛАГДСАН
   контент дээр тавина.

   Яагаад хэрэгтэй вэ: `src/lib/site-content.ts` дэх өгөгдмөл нь зөвхөн
   ХАДГАЛААГҮЙ талбаруудад үйлчилдэг. Талбайг `/admin/site` дээр нэгэнт
   хадгалсан тул кодын шинэ утга амьд сайтад гарахгүй. Энэ скрипт нь
   зөвхөн `apartments.units[].area` болон талбайн тухай чатботын нэг
   хариултыг шинэчилнэ — бусад бүх засварыг хөндөхгүй.

   Ашиглах:
     # 1) Юу өөрчлөгдөхийг харах (юу ч бичихгүй)
     node scripts/apply-unit-areas.mjs https://elysium.mn '<ADMIN_PASSWORD>'

     # 2) Бодитоор тавих
     node scripts/apply-unit-areas.mjs https://elysium.mn '<ADMIN_PASSWORD>' --apply

   Дахин ажиллуулж болно (idempotent).

   Талбайн эх сурвалж: айл бүрийн өрөөнүүдийн нийлбэр — `src/lib/unit-plans.ts`
   дэх задаргаатай яг таарна.
   ============================================================ */

const [, , baseArg, password, ...flags] = process.argv;
const APPLY = flags.includes("--apply");

if (!baseArg || !password) {
  console.error("Ашиглах: node scripts/apply-unit-areas.mjs <сайтын-хаяг> <ADMIN_PASSWORD> [--apply]");
  process.exit(1);
}
const base = baseArg.replace(/\/+$/, "");

/* Гарчгаар нь тааруулна — `/admin/site` дээр гарчиг өөрчилсөн бол
   тухайн мөр алгасагдаж, консолд "олдсонгүй" гэж хэлнэ. */
const AREAS = {
  "A тип": "84.66 м²",
  "B тип": "133.61 м²",
  "C тип": "80.32 м²",
  "D тип": "51.72 м²",
  "D тип · 2 давхар": "49.19 м²",
  "E тип": "89.73 м²",
  "E тип · 2 давхар": "64.16 м²",
};

/* Чатботын хуучин хариулт бодит хуваалттай зөрчилдөж байсан. Анхаарах:
   брошурт 1 өрөөний хуваалт БАЙХГҮЙ тул тэр мужийг хассан — өөр блокт
   1 өрөө байдаг бол энэ мөрийг гараар нэмнэ. */
const CHATBOT_KEYS = "өрөө, мкв, м², талбай, сонголт, загвар";
const CHATBOT_ANSWER =
  "2 өрөө 49.19–64.16 м², 3 өрөө 80.32–89.73 м², 4 өрөө 133.61 м². " +
  "“Өрөөний сонголт” хэсгээс тип бүрийн төлөвлөгөө, өрөөний задаргааг үзнэ үү.";

const changes = [];
const missing = [];

function patch(site) {
  const units = site.apartments?.units ?? [];
  for (const [title, area] of Object.entries(AREAS)) {
    const unit = units.find((u) => u.title?.trim() === title);
    if (!unit) { missing.push(title); continue; }
    if (unit.area !== area) {
      changes.push({ path: `apartments.units[${title}].area`, from: unit.area, to: area });
      unit.area = area;
    }
  }

  const qa = site.chatbot?.answers?.find((q) => q.keys === CHATBOT_KEYS);
  if (!qa) missing.push("чатботын талбайн хариулт");
  else if (qa.a !== CHATBOT_ANSWER) {
    changes.push({ path: "chatbot.answers[талбай].a", from: qa.a, to: CHATBOT_ANSWER });
    qa.a = CHATBOT_ANSWER;
  }

  return site;
}

const login = await fetch(`${base}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password }),
});
if (!login.ok) {
  console.error(`Нэвтэрч чадсангүй (${login.status}). ADMIN_PASSWORD-оо шалгана уу.`);
  process.exit(1);
}
const cookie = (login.headers.getSetCookie?.() ?? [login.headers.get("set-cookie")])
  .filter(Boolean)
  .map((c) => c.split(";")[0])
  .join("; ");

const getRes = await fetch(`${base}/api/admin/site`, { headers: { cookie } });
const getJson = await getRes.json();
if (!getRes.ok || !getJson?.ok) {
  console.error("Контент уншиж чадсангүй:", getJson);
  process.exit(1);
}

const next = patch(getJson.content);

if (missing.length) console.warn(`Олдсонгүй (гарчиг өөрчлөгдсөн байж магадгүй): ${missing.join(", ")}`);
if (!changes.length) {
  console.log("Өөрчлөлт алга — талбайнууд аль хэдийн брошуртай нийцсэн байна.");
  process.exit(0);
}
const short = (v) => (v == null ? "(хоосон)" : String(v).length > 80 ? `${String(v).slice(0, 80)}…` : String(v));
for (const c of changes) console.log(`  ${c.path}:\n    ${short(c.from)}\n    → ${short(c.to)}`);

if (!APPLY) {
  console.log(`\n${changes.length} өөрчлөлт. Бодитоор тавихдаа --apply нэмнэ үү.`);
  process.exit(0);
}

const put = await fetch(`${base}/api/admin/site`, {
  method: "PUT",
  headers: { "Content-Type": "application/json", cookie },
  body: JSON.stringify(next),
});
const putJson = await put.json().catch(() => null);
if (!put.ok || !putJson?.ok) {
  console.error("Хадгалж чадсангүй:", put.status, putJson);
  process.exit(1);
}
console.log(`\n${changes.length} өөрчлөлт хадгалагдлаа.`);
