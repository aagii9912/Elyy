#!/usr/bin/env node
/* ============================================================
   `docs/noir/index.html` — `/noir` theme-ийн БИЕ ДААСАН хувилбарыг
   үүсгэнэ: нэг файл, build хэрэггүй, браузераар шууд нээгдэнэ.

   Хэрэглээ:
     node scripts/build-noir-preview.mjs

   Загварын CSS нь `src/app/noir/noir.css`-ЭЭС уншигдана — тиймээс
   theme-ийн өнгө, хэмжилт өөрчлөгдвөл энэ скриптийг дахин
   ажиллуулахад л хангалттай (CSS хоёр газар давхардахгүй).

   Контент нь `src/lib/site-content.ts`-ийн ӨГӨГДМӨЛ утгуудын хувилбар
   (snapshot) — бие даасан файл нь Supabase рүү очих боломжгүй тул.
   Амьд, админаас удирдагддаг эх хувилбар нь ҮРГЭЛЖ `/noir` route.
   ============================================================ */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "docs/noir/index.html");

/** Бие даасан файлаас репо доторх хөрөнгө рүү заах зам. */
const A = (p) => `../../public${p}`;

/* ------------------------------------------------------------------ */
/* Контентын хувилбар                                                  */
/* ------------------------------------------------------------------ */

const C = {
  title: "Elysium Residence — Бизнес зэрэглэлийн орон сууц",
  description:
    "4 блок, 506 айлын орон сууц. Нийт талбайн 85% нь ногоон, нийтийн эзэмшлийн орон зай. 2027 оны 2-р улиралд ашиглалтад орно.",
  nav: [
    ["Төслийн тухай", "#about"],
    ["Давуу тал", "#elys"],
    ["Өрөөний сонголт", "#apartments"],
    ["Төсөл хэрэгжүүлэгч", "#developer"],
    ["Байршил", "#location"],
    ["FAQ", "#faq"],
  ],
  cta: "Уулзалт товлох",
  brochure: "Танилцуулга татах",
  menuAria: "Цэс",
  hero: {
    lines: ["Elysium", "Residence"],
    sub: "Туул голын салхи илбэсэн бүсэд байршилтай, архитектур болон инженерингийн эргономик шийдэлтэй орон сууц.",
    video: A("/video/hero-source.mp4"),
    poster: A("/hero-video-frames/frame_132.webp"),
  },
  partners: [
    ["E.C.A.", "Турк"],
    ["Legrand", "Франц"],
    ["Egger", "Герман"],
    ["LX Hausys", "Солонгос"],
  ],
  plan: {
    kicker: "Ерөнхий төлөвлөлт",
    title: "Form Follows Function",
    points: [
      ["506", "", "айлын орон сууц · 4 блок"],
      ["85", "%", "нийтийн эзэмшлийн талбай — ногоон байгууламж, орон зай"],
      ["513", "", "автомашины зогсоол"],
      ["2027 · II", "", "улиралд ашиглалтад орно"],
    ],
  },
  elys: {
    kicker: "Агшин бүрд мэдрэх тав тух",
    title: "Төслийн консепц — ELYS",
    body: "Эргономик төлөвлөлт, ногоон орчин, аюулгүй байдал, эрчим хүчний хэмнэлт — дөрвөн зарчмын эхний үсэг ELYS нэрийг бүрдүүлнэ.",
    items: [
      [
        "Ergonomic Standards",
        "Эрүүл амьдрахад тань зориулж, хүний бүх хэрэгцээг тооцоолон гаргасан эргономик шийдэлтэй тул тав тухтай амьдрах боломжтой.",
        A("/images/elys/ergonomic-interior.jpg"),
      ],
      [
        "Live in Harmony",
        "Эрүүл зөв амьдралын хэв маягт хөтлөх нийтийн эзэмшлийн ногоон байгууламж талбайг төлөвлөсөн.",
        A("/images/elys/harmony-courtyard.jpg"),
      ],
      [
        "Your Safety",
        "Аюулгүй байдал тав тухыг хангасан орчин үеийн нэвтрэлтийн нэгдсэн системийг цогцоор нь төлөвлөсөн.",
        A("/images/elys/safety-control-room.jpg"),
      ],
      [
        "Save Big",
        "Дулаан алдагдал багатай, эрчим хүчний хэмнэлттэй шийдэл нь урт хугацаандаа таны ашиглалтын зардлыг бууруулна.",
        A("/images/elys/efficiency-tower-crown.jpg"),
      ],
    ],
  },
  equip: {
    kicker: "Дэлгэрэнгүйд нухацтай",
    title: "Барилгын бүтэц",
    body: "Каркасаас фасад хүртэл ашигласан үндсэн материал, тоноглол бүр нь урт хугацааны тав тух, эрчим хүчний хэмнэлтэд ажиллана.",
    sourceLabel: "Үйлдвэрлэгчийн хуудас",
    items: [
      [
        "Бүрэн цутгамал хийцлэл",
        "Газар хөдлөлтийн 8 баллд тэсвэртэй, айл хоорондын дуу тусгаарлалт сайтай бүрэн цутгамал хийцлэл.",
        "",
        A("/video/structure-frame.mp4"),
        A("/structure-frames/frame_040.webp"),
      ],
      [
        "Veka Softline",
        "E-Low түрхлэгтэй, гурван давхар шилтэй вакум цонх нь гэрт буй дулааныг гадагшлуулахгүй байхаас гадна хэт халалтаас хамгаална.",
        "https://www.veka.de/window-fabricators/products-services/front-doors/softline-82/",
        A("/video/structure-windows.mp4"),
        A("/structure-frames/frame_075.webp"),
      ],
      [
        "Yaret aluminum composite panels",
        "Гурван давхар дулаалга бүхий гал дэмжихгүй метал фасад.",
        "https://www.yaretacp.com/",
        A("/video/structure-facade.mp4"),
        A("/structure-frames/frame_119.webp"),
      ],
    ],
  },
  apartments: {
    kicker: "Өрөөний сонголт",
    title: "Танд тохирох орон зай",
    body: "Уужим, ашигтай, минимал орон сууцны сонголтоос та өөрт тохирохыг сонгоорой.",
    allLabel: "Бүх тип",
    viewsWord: "өнцөг",
    ctaKicker: "Аксонометр зураг",
    ctaTitle: "Төлөвлөгөөгөө менежертэй хамт сонгоорой",
    ctaLink: "Уулзалт товлох",
    units: [
      ["A тип", "3 өрөө", "84.66 м²", "B1", "a-01", "a-02"],
      ["B тип", "4 өрөө", "133.61 м²", "B1", "b-01", "b-02"],
      ["C тип", "3 өрөө", "80.32 м²", "B1", "c-01", "c-02"],
      ["D тип", "2 өрөө", "51.72 м²", "B1", "d-01", "d-02"],
      ["D тип · 2 давхар", "2 өрөө", "49.19 м²", "B1", "d2f-01", "d2f-02"],
      ["E тип", "3 өрөө", "89.73 м²", "B2", "e-01", "e-02"],
      ["E тип · 2 давхар", "2 өрөө", "64.16 м²", "B2", "e2f-01", "e2f-02"],
    ],
  },
  gallery: {
    kicker: "Зургийн цомог",
    title: "Elysium-ийн дүр төрх",
    images: [
      ["living-01", "Зочны өрөө"],
      ["bedroom-01", "Унтлагын өрөө"],
      ["living-02", "Зочны өрөө"],
      ["bath-01", "Угаалгын өрөө"],
      ["living-03", "Зочны өрөө"],
      ["bedroom-02", "Унтлагын өрөө"],
      ["living-04", "Зочны өрөө"],
      ["bedroom-03", "Унтлагын өрөө"],
      ["living-05", "Зочны өрөө"],
      ["bath-02", "Угаалгын өрөө"],
      ["living-06", "Зочны өрөө"],
      ["bedroom-04", "Унтлагын өрөө"],
    ],
  },
  developer: {
    kicker: "Төсөл хэрэгжүүлэгч",
    name: "Монкон Констракшн ХХК",
    body: "Монкон Констракшн ХХК нь 2006 оноос хойш захиалагч, хэрэглэгчдэдээ барилгын зураг төслөөс эхлээд түлхүүр гардуулах хүртэлх барилгын цогц үйлчилгээг хүргэхдээ архитектурын шинэлэг шийдлийг нэвтрүүлж, барилга угсралтын чанараа тогтмол сайжруулсаар ирсэн.",
    since: ["2006", "оноос"],
    count: ["60+", "төсөл"],
    hint: "Гүйлгэж үргэлжлүүлэх →",
    projects: [
      ["Комфорт хотхон", "15 давхар · 600 айл", "2014–2019", "comfort"],
      ["Мандала хотхон", "18 давхар · 510 айл", "2015–2019", "mandala-khotkhon"],
      ["Мандала гарден", "16 давхар · 2500 айл", "2019–2030", "mandala-garden"],
      ["360, 365 Мандала Тауэр", "25 давхар · 200 айл", "2018–2025", "mandala-tower-360"],
    ],
  },
  location: {
    kicker: "Байршил",
    addressLabel: "Хаяг",
    directionsLabel: "Чиглэл авах ↗",
    tabs: [
      [
        "Төслийн байршил",
        "Хотын төвд, байгалийн хажууд",
        "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, Улаанбаатар",
        "47.89733862835647,106.88538756153864",
      ],
      [
        "Борлуулалтын оффис",
        "Биечлэн ирж танилцаарай",
        "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэр",
        "47.90146685024925,106.93241183285195",
      ],
    ],
    nearby: [
      [
        "Боловсрол",
        [
          ["Номин Кидс", "Цэцэрлэг", "450"],
          ["Оном сургууль", "Сургууль", "600"],
          ["18-р сургууль", "Сургууль", "1000"],
          ["Орхон Хасу", "Сургууль", "1200"],
        ],
      ],
      [
        "Худалдаа, үйлчилгээ",
        [
          ["Поларис их дэлгүүр", "", "550"],
          ["Номин Юнайтэд", "", "620"],
          ["Лавай зах", "", "1100"],
          ["Хүннү молл", "", "3700"],
        ],
      ],
      [
        "Эрүүл мэнд",
        [
          ["ХУД эрүүл мэндийн төв", "", "1000"],
          ["Интермед эмнэлэг", "", "1700"],
          ["Улаанбаатар сувилал", "", "1800"],
        ],
      ],
    ],
  },
  contact: {
    kicker: "Холбоо барих",
    title: "Бидэнтэй холбогдох",
    sub: "Та доорх асуулгыг бөглөснөөр манай борлуулалтын менежерүүд тантай холбогдон уулзалтын өдрийг баталгаажуулах болно.",
    meta: [
      ["Утас", "7786-2222", "tel:77862222"],
      ["Цагийн хуваарь", "Даваа – Ням · 09:00 – 18:00", ""],
      ["Борлуулалтын алба", "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэр", ""],
      ["И-мэйл", "info@elysium.mn", "mailto:info@elysium.mn"],
    ],
    form: ["Нэр", "Утас", "Уулзах хүссэн огноо", "Хүсэлт илгээх"],
    note: "Бие даасан урьдчилан харах хувилбар — маягт илгээгдэхгүй. Амьд хувилбар нь /noir.",
  },
  faq: {
    kicker: "Түгээмэл асуулт",
    title: "Түгээмэл асуулт, хариулт",
    items: [
      ["Хэзээ ашиглалтад орох вэ?", "Elysium Residence 2027 оны 2-р улиралд ашиглалтад орохоор төлөвлөгдсөн."],
      ["Давхартаа хэдэн айлтай вэ?", "Блок, давхар тус бүрийн айлын тоо төлөвлөлтөөс хамаарна. Дэлгэрэнгүйг борлуулалтын албанаас тодруулна уу."],
      ["Төслийн байршил хаана вэ?", "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэрын ойролцоо."],
      ["Борлуулалтын албатай хэрхэн холбогдох вэ?", "Утас 7786-2222, эсвэл “Уулзалт товлох” хэсгээр хүсэлт үлдээнэ үү."],
      ["Гадаадаас орон сууц захиалах боломжтой юу?", "Тийм. Цахим үзлэг, онлайн захиалга, зайнаас гэрээ байгуулах боломжтой."],
    ],
  },
  footer: {
    sales: "Борлуулалтын алба",
    menuTitle: "Цэс",
    menu: [
      ["Өрөөний сонголт", "#apartments"],
      ["Төслийн давуу тал", "#elys"],
      ["Байршил", "#location"],
      ["Түгээмэл асуулт", "#faq"],
    ],
    note: "Form Follows Function · Comfort · Serenity",
  },
};

/* ------------------------------------------------------------------ */
/* Брэндийн тэмдэг (src/components/Logo.tsx-тэй ижил геометр)          */
/* ------------------------------------------------------------------ */

const MARK = `<svg viewBox="696.5 -1 29 30" fill="currentColor" role="img" aria-label="Elysium"><g>
<path d="M724.7627131503,1.6928812257l-1.5571644463-1.5571639374c-.1809564854-.1809564263-.4743448685-.1809563783-.6553012947.0000001071l-10.9339166573,10.9339202305c-.0868983404.0868983688-.1357173084.2047578379-.1357172883.3276506695l.0000002984,1.8262380573c.0000000201.1228928316.0488190266.2407522848.1357173954.3276506252l1.5571644463,1.5571639374c.1809564854.1809564262.4743448685.1809563783.6553012947-.0000001071l10.9339166573-10.9339202304c.0868983404-.0868983688.1357173084-.2047578379.1357172883-.3276506695l-.0000002984-1.8262380573c-.0000000201-.1228928316-.0488190266-.2407522848-.1357173954-.3276506252Z"/>
<path d="M724.7627131503,11.0526964505l-1.5571644463-1.5571639374c-.1809564854-.1809564262-.4743448685-.1809563783-.6553012947.0000001071l-10.9339166573,10.9339202304c-.0868983404.0868983688-.1357173084.2047578379-.1357172883.3276506695l.0000002984,1.8262380573c.0000000201.1228928316.0488190266.2407522848.1357173954.3276506252l1.5571644463,1.5571639374c.1809564854.1809564262.4743448685.1809563783.6553012947-.0000001071l10.9339166573-10.9339202304c.0868983404-.0868983688.1357173084-.2047578379.1357172883-.3276506695l-.0000002984-1.8262380573c-.0000000201-.1228928316-.0488190266-.2407522848-.1357173954-.3276506252Z"/>
<path d="M710.6956105802,15.7571507035l-1.5571644462-1.5571639374c-.1809564854-.1809564262-.4743448685-.1809563783-.6553012947.0000001071l-10.9339166573,10.9339202304c-.0868983404.0868983688-.1357173084.2047578379-.1357172883.3276506695l.0000002984,1.8262380573c.0000000201.1228928316.0488190266.2407522848.1357173954.3276506252l1.5571644463,1.5571639374c.1809564854.1809564263.4743448685.1809563783.6553012947-.0000001071l10.9339166573-10.9339202305c.0868983404-.0868983688.1357173084-.2047578379.1357172883-.3276506695l-.0000002984-1.8262380573c-.0000000201-.1228928316-.0488190266-.2407522848-.1357173954-.3276506252Z"/>
<path d="M710.6956105802,6.3674608853l-1.5571644462-1.5571639374c-.1809564854-.1809564262-.4743448685-.1809563783-.6553012947.0000001071l-10.9339166573,10.9339202304c-.0868983404.0868983688-.1357173084.2047578379-.1357172883.3276506695l.0000002984,1.8262380573c.0000000201.1228928316.0488190266.2407522848.1357173954.3276506252l1.5571644463,1.5571639374c.1809564854.1809564262.4743448685.1809563783.6553012947-.0000001071l10.9339166573-10.9339202304c.0868983404-.0868983688.1357173084-.2047578379.1357172883-.3276506695l-.0000002984-1.8262380573c-.0000000201-.1228928316-.0488190266-.2407522848-.1357173954-.3276506252Z"/>
</g></svg>`;

const WORDMARK = readFileSync(resolve(ROOT, "src/components/Logo.tsx"), "utf8")
  .split("const WORDMARK = `")[1]
  .split("`;")[0];

/* ------------------------------------------------------------------ */
/* Бүтэц                                                               */
/* ------------------------------------------------------------------ */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const chapter = (text) => `<p class="nv-chapter">${esc(text)}</p>`;

const head = (kicker, title, lead) => `
      <div class="nv-head nv-head--split">
        <div>
          ${chapter(kicker)}
          <h2 class="nv-h2" data-rise>${esc(title)}</h2>
        </div>
        ${lead ? `<p class="nv-lead" data-rise style="--d:.08s">${esc(lead)}</p>` : ""}
      </div>`;

const body = `
  <div class="noir-page">
    <header class="nv-topbar">
      <a class="nv-brand" href="#top" aria-label="Elysium Residence">${MARK}</a>
      <nav class="nv-links" aria-label="Үндсэн цэс">
        ${C.nav.map(([label, href]) => `<a href="${href}">${esc(label)}</a>`).join("\n        ")}
      </nav>
      <a class="nv-pill nv-pill-nav" href="#contact"><span>${esc(C.cta)}</span></a>
      <button type="button" class="nv-burger" id="burger" aria-expanded="false" aria-controls="menu" aria-label="${esc(C.menuAria)}"><i></i><i></i></button>
    </header>

    <nav class="nv-menu" id="menu" aria-label="${esc(C.menuAria)}" aria-hidden="true">
      <div class="nv-menu-inner">
        <p class="nv-menu-eyebrow">${esc(C.menuAria)}</p>
        <ul class="nv-menu-list">
          ${C.nav.map(([label, href]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("\n          ")}
        </ul>
        <div class="nv-menu-foot">
          <a class="nv-pill" href="#contact"><span>${esc(C.cta)}</span></a>
          <a class="nv-ghost" href="${A("/brochure.pdf")}" target="_blank" rel="noopener">${esc(C.brochure)}</a>
        </div>
      </div>
    </nav>

    <main>
      <section id="top" class="nv-stage" data-tone="dark">
        <div class="nv-plate">
          <video class="nv-plate-video" autoplay muted loop playsinline preload="auto" poster="${C.hero.poster}" aria-hidden="true">
            <source src="${C.hero.video}" type="video/mp4">
          </video>
        </div>
        <div class="nv-hero">
          <div class="nv-copy">
            <h1 class="nv-headline">${C.hero.lines.map((l) => `<span>${esc(l)}</span>`).join("")}</h1>
            <p class="nv-sub">${esc(C.hero.sub)}</p>
            <div class="nv-actions">
              <a class="nv-pill nv-pill-cta" href="#contact"><span>${esc(C.cta)}</span></a>
              <a class="nv-ghost" href="${A("/brochure.pdf")}" target="_blank" rel="noopener">${esc(C.brochure)}</a>
            </div>
          </div>
          <div class="nv-logos" aria-label="Түншлэгч үйлдвэрлэгчид">
            ${C.partners.map(([b, m]) => `<span class="nv-lg">${esc(b)}<i class="nv-lg-meta">${esc(m)}</i></span>`).join("\n            ")}
          </div>
          <span class="nv-scroll" aria-hidden="true"><i></i></span>
        </div>
      </section>

      <section id="about" class="nv-sec" data-tone="dark"><div class="nv-wrap">
        ${head(`01 · ${C.plan.kicker}`, C.plan.title, C.hero.sub)}
        <div class="nv-stats">
          ${C.plan.points
            .map(
              ([n, accent, text], i) => `<div class="nv-stat" data-rise style="--d:${(i * 0.06).toFixed(2)}s">
            <b>${/^\d+$/.test(n) ? `<span data-count="${n}">0</span>` : esc(n)}${accent ? `<i>${esc(accent)}</i>` : ""}</b>
            <span>${esc(text)}</span>
          </div>`
            )
            .join("\n          ")}
        </div>
      </div></section>

      <section id="elys" class="nv-sec" data-tone="dark"><div class="nv-wrap">
        ${head(`02 · ${C.elys.kicker}`, C.elys.title, C.elys.body)}
        <div class="nv-panels" data-rise style="--d:.12s">
          ${C.elys.items
            .map(
              ([title, text, img], i) => `<button type="button" class="nv-panel${i === 0 ? " is-active" : ""}" data-panel aria-expanded="${i === 0}">
            <img src="${img}" alt="" aria-hidden="true">
            <span class="nv-panel-letter">${esc(title.slice(0, 1).toUpperCase())}</span>
            <h3 class="nv-h3">${esc(title)}</h3>
            <p class="nv-panel-body">${esc(text)}</p>
          </button>`
            )
            .join("\n          ")}
        </div>
      </div></section>

      <section id="equip" class="nv-sec" data-tone="dark"><div class="nv-wrap">
        ${head(`03 · ${C.equip.kicker}`, C.equip.title, C.equip.body)}
        <div style="margin-top:clamp(26px,4vh,52px)">
          ${C.equip.items
            .map(
              ([title, text, link, clip, still], i) => `<article class="nv-row" data-rise style="--d:${(i * 0.05).toFixed(2)}s">
            <div>
              <span class="nv-row-index">${String(i + 1).padStart(2, "0")}</span>
              <h3 class="nv-h3">${esc(title)}</h3>
              <p class="nv-row-body">${esc(text)}</p>
              ${link ? `<a class="nv-ghost" href="${link}" target="_blank" rel="noopener noreferrer" style="margin-top:18px;font-size:13.5px">${esc(C.equip.sourceLabel)}</a>` : ""}
            </div>
            <div class="nv-row-media">
              <video data-clip muted loop playsinline preload="none" poster="${still}" aria-hidden="true"><source src="${clip}" type="video/mp4"></video>
            </div>
          </article>`
            )
            .join("\n          ")}
        </div>
      </div></section>

      <section id="apartments" class="nv-sec" data-tone="dark"><div class="nv-wrap">
        ${head(C.apartments.kicker, C.apartments.title, C.apartments.body)}
        <div class="nv-tabs" data-rise>
          <button type="button" class="nv-tab is-on" data-block="">${esc(C.apartments.allLabel)}</button>
          <button type="button" class="nv-tab" data-block="B1">B1</button>
          <button type="button" class="nv-tab" data-block="B2">B2</button>
        </div>
        <div class="nv-units">
          ${C.apartments.units
            .map(
              ([title, rooms, area, block, v1, v2], i) => `<button type="button" class="nv-unit" data-rise data-unit-block="${block}"
            data-views="${A(`/images/axono/${v1}.jpg`)}|${A(`/images/axono/${v2}.jpg`)}"
            data-thumb="${A(`/images/axono/${v1}-sm.jpg`)}" data-caption="${esc(`${title} · ${rooms} · ${area}`)}">
            <span class="nv-unit-no">${String(i + 1).padStart(2, "0")}</span>
            <span class="nv-unit-name">${esc(title)}</span>
            <span class="nv-unit-meta">${esc(`${rooms} · ${area} · ${block}`)}</span>
            <span class="nv-unit-cta">2 ${esc(C.apartments.viewsWord)} ↗</span>
          </button>`
            )
            .join("\n          ")}
        </div>
        <div class="nv-cta-row">
          <div>
            ${chapter(C.apartments.ctaKicker)}
            <h3 class="nv-h3">${esc(C.apartments.ctaTitle)}</h3>
          </div>
          <a class="nv-pill" href="#contact"><span>${esc(C.apartments.ctaLink)}</span></a>
        </div>
      </div></section>

      <section id="gallery" class="nv-sec" data-tone="dark"><div class="nv-wrap">
        ${chapter(C.gallery.kicker)}
        <h2 class="nv-h2" data-rise>${esc(C.gallery.title)}</h2>
        <div class="nv-grid">
          ${C.gallery.images
            .map(
              ([name, tag], i) => `<button type="button" class="nv-shot" data-rise style="--d:${(Math.min(i, 8) * 0.04).toFixed(2)}s" data-shot="${A(`/images/interior/${name}.jpg`)}" data-caption="${esc(tag)}" aria-label="${esc(tag)}">
            <img src="${A(`/images/interior/${name}.jpg`)}" alt="${esc(tag)}" loading="lazy"><span>${esc(tag)}</span>
          </button>`
            )
            .join("\n          ")}
        </div>
      </div></section>

      <section id="developer" class="nv-sec" data-tone="dark"><div class="nv-wrap">
        ${head(C.developer.kicker, C.developer.name, C.developer.body)}
        <div class="nv-stats" style="margin-top:clamp(28px,4vh,52px)">
          <div class="nv-stat" data-rise><b>${esc(C.developer.since[0])}</b><span>${esc(C.developer.since[1])}</span></div>
          <div class="nv-stat" data-rise style="--d:.06s"><b>${esc(C.developer.count[0])}</b><span>${esc(C.developer.count[1])}</span></div>
        </div>
        <div class="nv-rail" data-rise style="--d:.1s">
          ${C.developer.projects
            .map(
              ([title, meta, years, img]) => `<article class="nv-slide">
            <div class="nv-slide-media"><img src="${A(`/images/projects/${img}.jpg`)}" alt="${esc(title)}" loading="lazy"><span class="nv-slide-years">${esc(years)}</span></div>
            <h4>${esc(title)}</h4><p>${esc(meta)}</p>
          </article>`
            )
            .join("\n          ")}
        </div>
        <p class="nv-note">${esc(C.developer.hint)}</p>
      </div></section>

      <section id="location" class="nv-sec" data-tone="dark"><div class="nv-wrap">
        <div class="nv-head nv-head--split">
          <div>
            ${chapter(C.location.kicker)}
            <h2 class="nv-h2" data-rise data-loc-title>${esc(C.location.tabs[0][1])}</h2>
          </div>
          <div data-rise style="--d:.08s">
            <p class="nv-lead">
              <b style="display:block;font-weight:400;color:var(--nv-strip);font-size:11px;letter-spacing:.24em;text-transform:uppercase;margin-bottom:8px">${esc(C.location.addressLabel)}</b>
              <span data-loc-address>${esc(C.location.tabs[0][2])}</span>
            </p>
            <a class="nv-ghost" data-loc-dir href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(C.location.tabs[0][3])}" target="_blank" rel="noopener noreferrer" style="margin-top:18px;font-size:14px">${esc(C.location.directionsLabel)}</a>
          </div>
        </div>
        <div class="nv-tabs">
          ${C.location.tabs
            .map(
              ([label, title, address, coords], i) =>
                `<button type="button" class="nv-tab${i === 0 ? " is-on" : ""}" data-loc="${coords}" data-loc-name="${esc(title)}" data-loc-addr="${esc(address)}">${esc(label)}</button>`
            )
            .join("\n          ")}
        </div>
        <div class="nv-map" data-rise>
          <iframe id="map" src="https://www.google.com/maps?q=${encodeURIComponent(C.location.tabs[0][3])}&amp;z=16&amp;output=embed" title="${esc(C.location.tabs[0][1])}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
        <div class="nv-nearby">
          ${C.location.nearby
            .map(
              ([label, items], i) => `<div data-rise style="--d:${(i * 0.05).toFixed(2)}s">
            <h4>${esc(label)}</h4>
            <ul>${items.map(([place, kind, dist]) => `<li><b>${esc(place)}</b><span>${kind ? `${esc(kind)} · ` : ""}${esc(dist)}м</span></li>`).join("")}</ul>
          </div>`
            )
            .join("\n          ")}
        </div>
      </div></section>

      <section id="contact" class="nv-sec" data-tone="dark"><div class="nv-wrap">
        <div class="nv-head nv-head--split">
          <div>
            ${chapter(C.contact.kicker)}
            <h2 class="nv-h2" data-rise>${esc(C.contact.title)}</h2>
            <p class="nv-lead" style="margin-top:18px">${esc(C.contact.sub)}</p>
            <dl class="nv-contact-meta">
              ${C.contact.meta
                .map(
                  ([label, value, href]) =>
                    `<div><dt>${esc(label)}</dt><dd${label === "Борлуулалтын алба" ? ' style="font-size:16px;line-height:1.5"' : ""}>${href ? `<a href="${href}">${esc(value)}</a>` : esc(value)}</dd></div>`
                )
                .join("\n              ")}
            </dl>
          </div>
          <div data-rise style="--d:.08s">
            <form class="nv-form" id="lead">
              <div class="nv-field"><label for="f-name">${esc(C.contact.form[0])}</label><input id="f-name" name="name" required></div>
              <div class="nv-field"><label for="f-phone">${esc(C.contact.form[1])}</label><input id="f-phone" name="phone" required inputmode="tel"></div>
              <div class="nv-field"><label for="f-date">${esc(C.contact.form[2])}</label><input id="f-date" name="date" type="date"></div>
              <button type="submit" class="nv-pill"><span>${esc(C.contact.form[3])}</span></button>
              <p class="nv-note">${esc(C.contact.note)}</p>
            </form>
          </div>
        </div>
      </div></section>

      <section id="faq" class="nv-sec" data-tone="dark"><div class="nv-wrap">
        ${chapter(C.faq.kicker)}
        <h2 class="nv-h2" data-rise>${esc(C.faq.title)}</h2>
        <div class="nv-faq">
          ${C.faq.items
            .map(
              ([q, a], i) => `<div class="nv-faq-item${i === 0 ? " is-open" : ""}" data-faq>
            <button type="button" class="nv-faq-q" aria-expanded="${i === 0}">${esc(q)}<i aria-hidden="true"></i></button>
            <div class="nv-faq-a"${i === 0 ? ' style="max-height:420px"' : ""}><p>${esc(a)}</p></div>
          </div>`
            )
            .join("\n          ")}
        </div>
      </div></section>
    </main>

    <footer class="nv-footer" data-tone="dark">
      <div class="nv-wrap">
        <svg class="nv-footer-mark" viewBox="0 -1 146 33" fill="currentColor" role="img" aria-label="Elysium">${WORDMARK}</svg>
        <div class="nv-cols">
          <div>
            <h4>${esc(C.footer.sales)}</h4>
            <ul>
              <li><a href="tel:77862222">7786-2222</a></li>
              <li><a href="mailto:info@elysium.mn">info@elysium.mn</a></li>
              <li>Даваа – Ням · 09:00 – 18:00</li>
              <li>Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэр</li>
            </ul>
          </div>
          <div>
            <h4>${esc(C.footer.menuTitle)}</h4>
            <ul>${C.footer.menu.map(([label, href]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("")}</ul>
          </div>
        </div>
        <div class="nv-foot-bar"><span>${esc(C.footer.note)}</span><span>© 2026 Elysium Residence</span></div>
      </div>
    </footer>

    <div class="nv-peek" id="peek" aria-hidden="true"><img alt=""></div>
  </div>`;

/* ------------------------------------------------------------------ */
/* Хөтөч дэх зан төлөв — санамсаргүй сан ашиглаагүй, цэвэр JS          */
/* ------------------------------------------------------------------ */

const script = `
(function () {
  var root = document.querySelector('.noir-page');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Цэс */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    root.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Цэс хаах' : '${C.menuAria}');
    menu.setAttribute('aria-hidden', String(!open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!root.classList.contains('is-open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeBox(); } });
  addEventListener('resize', function () { if (innerWidth / innerHeight > 1.1) setMenu(false); });

  /* Толгойн нягтрал */
  var bar = document.querySelector('.nv-topbar');
  function onScroll() { bar.classList.toggle('is-stuck', scrollY > innerHeight * 0.62); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Илрэх анимэйшн ба тоолуур */
  var rises = [].slice.call(document.querySelectorAll('[data-rise],[data-count]'));
  if (reduce) {
    rises.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-in');
        var raw = el.getAttribute('data-count');
        if (raw) {
          var target = Number(raw), start = performance.now();
          (function step(now) {
            var t = Math.min(1, (now - start) / 1100);
            var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            el.textContent = Math.round(target * eased).toLocaleString('en-US');
            if (t < 1) requestAnimationFrame(step);
          })(start);
        }
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    rises.forEach(function (el) { io.observe(el); });
  }

  /* Клип — харагдах үед л тоглоно */
  if (!reduce) {
    var clipIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { var p = e.target.play(); if (p) p.catch(function () {}); }
        else e.target.pause();
      });
    }, { threshold: 0.25 });
    [].forEach.call(document.querySelectorAll('[data-clip]'), function (v) { clipIo.observe(v); });
  }

  /* ELYS самбарууд */
  var panels = [].slice.call(document.querySelectorAll('[data-panel]'));
  panels.forEach(function (panel) {
    function pick() {
      panels.forEach(function (p) { p.classList.remove('is-active'); p.setAttribute('aria-expanded', 'false'); });
      panel.classList.add('is-active'); panel.setAttribute('aria-expanded', 'true');
    }
    panel.addEventListener('click', pick);
    panel.addEventListener('mouseenter', pick);
  });

  /* Өрөөний шүүлтүүр */
  var units = [].slice.call(document.querySelectorAll('.nv-unit'));
  [].forEach.call(document.querySelectorAll('[data-block]'), function (tab) {
    tab.addEventListener('click', function () {
      [].forEach.call(document.querySelectorAll('[data-block]'), function (t) { t.classList.remove('is-on'); });
      tab.classList.add('is-on');
      var want = tab.getAttribute('data-block');
      units.forEach(function (u) {
        u.style.display = !want || u.getAttribute('data-unit-block') === want ? '' : 'none';
      });
    });
  });

  /* Хөвүүлэхэд гарах төлөвлөгөө */
  var peek = document.getElementById('peek'), peekImg = peek.querySelector('img');
  units.forEach(function (u) {
    u.addEventListener('mousemove', function (e) {
      peekImg.src = u.getAttribute('data-thumb');
      peek.style.left = (e.clientX + 170) + 'px';
      peek.style.top = e.clientY + 'px';
      peek.classList.add('is-on');
    });
    u.addEventListener('mouseleave', function () { peek.classList.remove('is-on'); });
    u.addEventListener('click', function () {
      peek.classList.remove('is-on');
      openBox(u.getAttribute('data-views').split('|'), 0, u.getAttribute('data-caption'));
    });
  });

  /* Байршлын табууд */
  [].forEach.call(document.querySelectorAll('[data-loc]'), function (tab) {
    tab.addEventListener('click', function () {
      [].forEach.call(document.querySelectorAll('[data-loc]'), function (t) { t.classList.remove('is-on'); });
      tab.classList.add('is-on');
      var coords = tab.getAttribute('data-loc');
      document.querySelector('[data-loc-title]').textContent = tab.getAttribute('data-loc-name');
      document.querySelector('[data-loc-address]').textContent = tab.getAttribute('data-loc-addr');
      document.querySelector('[data-loc-dir]').href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(coords);
      document.getElementById('map').src = 'https://www.google.com/maps?q=' + encodeURIComponent(coords) + '&z=16&output=embed';
    });
  });

  /* Асуулт & хариулт */
  [].forEach.call(document.querySelectorAll('[data-faq]'), function (item) {
    item.querySelector('.nv-faq-q').addEventListener('click', function () {
      var open = item.classList.contains('is-open');
      [].forEach.call(document.querySelectorAll('[data-faq]'), function (i) {
        i.classList.remove('is-open');
        i.querySelector('.nv-faq-q').setAttribute('aria-expanded', 'false');
        i.querySelector('.nv-faq-a').style.maxHeight = '0px';
      });
      if (!open) {
        item.classList.add('is-open');
        item.querySelector('.nv-faq-q').setAttribute('aria-expanded', 'true');
        item.querySelector('.nv-faq-a').style.maxHeight = '420px';
      }
    });
  });

  /* Зураг үзэх цонх */
  var box = null, boxImages = [], boxIndex = 0, boxCaption = '';
  function renderBox() {
    box.querySelector('img').src = boxImages[boxIndex];
    box.querySelector('[data-box-label]').textContent =
      boxCaption + (boxImages.length > 1 ? ' · ' + (boxIndex + 1) + '/' + boxImages.length : '');
  }
  function openBox(images, index, caption) {
    boxImages = images; boxIndex = index; boxCaption = caption || '';
    if (!box) {
      box = document.createElement('div');
      box.className = 'nv-box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      box.innerHTML = '<button type="button" class="nv-icon nv-box-close" aria-label="Хаах">✕</button>' +
        '<img alt="">' +
        '<div class="nv-box-bar"><button type="button" class="nv-icon" data-step="-1" aria-label="Өмнөх">←</button>' +
        '<span data-box-label></span>' +
        '<button type="button" class="nv-icon" data-step="1" aria-label="Дараах">→</button></div>';
      box.addEventListener('click', function (e) {
        if (e.target === box || e.target.closest('.nv-box-close')) return closeBox();
        var step = e.target.closest('[data-step]');
        if (step) { boxIndex = (boxIndex + Number(step.getAttribute('data-step')) + boxImages.length) % boxImages.length; renderBox(); }
      });
      document.querySelector('.noir-page').appendChild(box);
    }
    box.style.display = '';
    document.documentElement.style.overflow = 'hidden';
    renderBox();
  }
  function closeBox() {
    if (!box) return;
    box.style.display = 'none';
    document.documentElement.style.overflow = '';
  }
  [].forEach.call(document.querySelectorAll('[data-shot]'), function (shot, i, all) {
    shot.addEventListener('click', function () {
      openBox([].map.call(all, function (s) { return s.getAttribute('data-shot'); }), i, shot.getAttribute('data-caption'));
    });
  });
  addEventListener('keydown', function (e) {
    if (!box || box.style.display === 'none') return;
    if (e.key === 'ArrowRight') { boxIndex = (boxIndex + 1) % boxImages.length; renderBox(); }
    if (e.key === 'ArrowLeft') { boxIndex = (boxIndex - 1 + boxImages.length) % boxImages.length; renderBox(); }
  });

  /* Маягт — бие даасан файлд сервер байхгүй тул зөвхөн мэдэгдэнэ. */
  document.getElementById('lead').addEventListener('submit', function (e) {
    e.preventDefault();
    e.target.querySelector('.nv-note').textContent = 'Энэ бол урьдчилан харах хувилбар — хүсэлт илгээгдээгүй. Амьд хувилбар: /noir';
  });
})();
`;

/* ------------------------------------------------------------------ */
/* Файл угсрах                                                         */
/* ------------------------------------------------------------------ */

const css = readFileSync(resolve(ROOT, "src/app/noir/noir.css"), "utf8");

const html = `<!doctype html>
<html lang="mn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(C.title)}</title>
<meta name="description" content="${esc(C.description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
<style>
/* Брэндийн Gilroy — репо доторх файлаас (лицензтэй тул CDN-д тавихгүй).
   Ачаалагдахгүй бол Manrope руу зөөлөн буцна. */
@font-face { font-family: "GilroyLocal"; font-weight: 400; font-display: swap; src: url("../../src/fonts/gilroy/GIP-Regular.otf") format("opentype"); }
@font-face { font-family: "GilroyLocal"; font-weight: 500; font-display: swap; src: url("../../src/fonts/gilroy/GIP-Medium.otf") format("opentype"); }
@font-face { font-family: "GilroyLocal"; font-weight: 700; font-display: swap; src: url("../../src/fonts/gilroy/GIP-Bold.otf") format("opentype"); }

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
img, svg, video, iframe { display: block; max-width: 100%; }
button { font: inherit; color: inherit; }
:root { --font-gilroy: "GilroyLocal", "Manrope"; }
body { font-family: var(--font-gilroy), ui-sans-serif, system-ui, sans-serif; background-color: #0a1207; }

${css}
</style>
</head>
<body>
${body}
<script>${script}</script>
</body>
</html>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`✓ ${OUT} (${(html.length / 1024).toFixed(1)} KB)`);
