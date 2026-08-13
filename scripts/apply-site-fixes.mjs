#!/usr/bin/env node
/* ============================================================
   Нэг удаагийн засвар — захиалагчийн PDF тэмдэглэлийн текстийг
   Supabase-д ХАДГАЛАГДСАН контент дээр тавина.

   Яагаад хэрэгтэй вэ: `src/lib/site-content.ts` дэх өгөгдмөл нь зөвхөн
   ХАДГАЛААГҮЙ талбаруудад үйлчилдэг. `/admin/site` дээр нэгэнт засаж
   хадгалсан бол хадгалсан утга нь өгөгдмөлийг дардаг тул кодын шинэ
   текст амьд сайтад гарахгүй. Энэ скрипт нь зөвхөн PDF дээр заасан
   талбаруудыг л шинэчилнэ — бусад бүх засварыг хөндөхгүй.

   Ашиглах:
     # 1) Юу өөрчлөгдөхийг харах (юу ч бичихгүй)
     node scripts/apply-site-fixes.mjs https://elysium.mn '<ADMIN_PASSWORD>'

     # 2) Бодитоор тавих
     node scripts/apply-site-fixes.mjs https://elysium.mn '<ADMIN_PASSWORD>' --apply

   Дахин ажиллуулж болно (idempotent) — тавигдсан талбарыг дахин
   бичихгүй, "өөрчлөлт алга" гэж хэлнэ.
   ============================================================ */

const [, , baseArg, password, ...flags] = process.argv;
const APPLY = flags.includes("--apply");

if (!baseArg || !password) {
  console.error(
    "Ашиглах: node scripts/apply-site-fixes.mjs <сайтын-хаяг> <ADMIN_PASSWORD> [--apply]"
  );
  process.exit(1);
}
const base = baseArg.replace(/\/+$/, "");

/* ---- PDF дээр заасан засварууд ---------------------------------- */

const HERO_SUB =
  "Туул голын салхи илбэсэн бүсэд байршилтай, архитектур болон инженерингийн эргономик шийдэлтэй орон сууц.";

const EQUIP_TITLE = "Үндсэн бүтээц";

const EQUIP_ITEMS = [
  {
    title: "Veka Softline",
    body: "E-Low түрхлэгтэй, гурван давхар шилтэй вакум цонх нь гэрт буй дулааныг гадагшлуулахгүй байхаас гадна хэт халалтаас хамгаална.",
    link: "https://www.veka.de/window-fabricators/products-services/front-doors/softline-82/",
  },
  {
    title: "Yaret aluminum composite panels",
    body: "Гурван давхар дулаалга бүхий гал дэмжихгүй метал фасад.",
    link: "https://www.yaretacp.com/",
  },
  {
    title: "Бүрэн цутгамал хийцлэл",
    body: "Газар хөдлөлтийн 8 баллд тэсвэртэй, айл хоорондын дуу тусгаарлалт сайтай бүрэн цутгамал хийцлэл.",
    link: "",
  },
  {
    title: "Desenk elevator",
    body: "Аюулгүй байдал болон тав тухыг хослуулсан эрчим хүчний хэмнэлттэй цахилгаан шат.",
    link: "http://www.desenkelevator.com/products/passenger-elevator/",
  },
];

const MANAGERS = [
  { name: "Н.Ариунбилэг", initials: "НА", role: "Борлуулалтын ахлах менежер", phone: "8888-3374" },
  { name: "Б.Энхзул", initials: "БЭ", role: "Борлуулалтын менежер", phone: "9008-3374" },
  { name: "Р.Чанцалдулам", initials: "РЧ", role: "Борлуулалтын менежер", phone: "8888-3375" },
];

const MANAGERS_BODY =
  "Залгах эсвэл Viber-ээр бичээрэй — менежер тантай шууд ярилцаж, үзүүлэх цагийг тохирно.";
const HOURS_LABEL = "Борлуулалтын албаны цагийн хуваарь";
const HOURS = "Даваа – Ням · 09:00 – 18:00";

/* ---- Патч ------------------------------------------------------- */

const changes = [];
const setField = (path, current, next) => {
  if (JSON.stringify(current) === JSON.stringify(next)) return false;
  changes.push({ path, from: current, to: next });
  return true;
};

function patch(site) {
  // 1 · Толгой цэс — «Хэрэгжүүлэгч» → «Төсөл хэрэгжүүлэгч»
  const navItem = site.nav?.items?.find((i) => i.href === "#developer");
  if (navItem && setField("nav.items[#developer].label", navItem.label, "Төсөл хэрэгжүүлэгч")) {
    navItem.label = "Төсөл хэрэгжүүлэгч";
  }

  // 2 · Hero-гийн дэд текст
  if (site.hero && setField("hero.sub", site.hero.sub, HERO_SUB)) site.hero.sub = HERO_SUB;

  // 4 · 03-р бүлгийн гарчиг ба навигацийн шошго
  if (site.equip && setField("equip.title", site.equip.title, EQUIP_TITLE)) {
    site.equip.title = EQUIP_TITLE;
  }
  if (site.storyNav && setField("storyNav.equip", site.storyNav.equip, EQUIP_TITLE)) {
    site.storyNav.equip = EQUIP_TITLE;
  }

  // 5 · Үндсэн бүтээцийн 4 карт (текст + үйлдвэрлэгчийн линк)
  if (site.equip && setField("equip.items", site.equip.items, EQUIP_ITEMS)) {
    site.equip.items = EQUIP_ITEMS;
  }

  // 8 · Борлуулалтын баг + албаны цагийн хуваарь
  if (site.managers) {
    if (setField("managers.items", site.managers.items, MANAGERS)) site.managers.items = MANAGERS;
    if (setField("managers.body", site.managers.body, MANAGERS_BODY)) {
      site.managers.body = MANAGERS_BODY;
    }
    if (setField("managers.hoursLabel", site.managers.hoursLabel, HOURS_LABEL)) {
      site.managers.hoursLabel = HOURS_LABEL;
    }
    if (setField("managers.hours", site.managers.hours, HOURS)) site.managers.hours = HOURS;
  }

  return site;
}

/* ---- Ажиллуулах ------------------------------------------------- */

const short = (v) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s == null ? "(хоосон)" : s.length > 90 ? `${s.slice(0, 90)}…` : s;
};

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
  console.error("Контент уншиж чадсангүй:", getJson?.error ?? getRes.status);
  process.exit(1);
}

const next = patch(getJson.content);

if (changes.length === 0) {
  console.log("Өөрчлөлт алга — PDF-ийн засварууд аль хэдийн тавигдсан байна.");
  process.exit(0);
}

console.log(`\n${changes.length} талбар өөрчлөгдөнө:\n`);
for (const c of changes) {
  console.log(`  ${c.path}`);
  console.log(`    − ${short(c.from)}`);
  console.log(`    + ${short(c.to)}\n`);
}

if (!APPLY) {
  console.log("Энэ нь урьдчилсан харагдац. Бодитоор тавихдаа --apply нэмнэ үү.");
  process.exit(0);
}

const put = await fetch(`${base}/api/admin/site`, {
  method: "PUT",
  headers: { "Content-Type": "application/json", cookie },
  body: JSON.stringify(next),
});
const putJson = await put.json().catch(() => null);
if (!put.ok || !putJson?.ok) {
  console.error("Хадгалж чадсангүй:", putJson?.error ?? put.status);
  process.exit(1);
}
console.log("Хадгаллаа. Үндсэн хуудас шууд шинэчлэгдсэн.");
