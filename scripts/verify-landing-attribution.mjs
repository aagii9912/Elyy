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

const {
  sanitizeAttribution, attributionFromUrl, hasCampaignParams, isLandingPurpose, landingLinks, attributionSummary, META_URL_PARAMETERS,
} = load("../src/lib/landing-attribution.ts");

// Meta-ийн зарын линк: UTM, ID, fbclid; дотоод referrer тооцохгүй.
const ad = attributionFromUrl(
  "?utm_source=ig&utm_medium=paid_social&utm_campaign=Elysium%20Oct&utm_id=120210000000001&adset_id=120210000000002&ad_id=120210000000003&fbclid=IwAR0abc-_1",
  "https://www.elysium.mn/", "elysium.mn",
);
assert.deepEqual(ad, {
  utmSource: "ig", utmMedium: "paid_social", utmCampaign: "Elysium Oct",
  utmId: "120210000000001", adsetId: "120210000000002", adId: "120210000000003", fbclid: "IwAR0abc-_1",
});
assert.equal(hasCampaignParams(ad), true);

// Referrer: зөвхөн домэйн, гадны сайтаас л.
assert.deepEqual(attributionFromUrl("", "https://l.facebook.com/l.php?u=secret", "elysium.mn"), { referrerHost: "l.facebook.com" });
assert.equal(attributionFromUrl("", "https://elysium.mn/news/a", "www.elysium.mn"), null);
assert.equal(attributionFromUrl("", "", "elysium.mn"), null);
assert.equal(hasCampaignParams({ referrerHost: "google.com" }), false);

// Allow-list: буруу ID, хэт урт текст, хяналтын тэмдэгт, илүү түлхүүр хасагдана.
assert.deepEqual(sanitizeAttribution({
  utmSource: " facebook ", utmMedium: "x".repeat(201), utmCampaign: "a\nb", utmId: "12ab", adId: "99",
  fbclid: "bad value", referrerHost: "Instagram.com", pageUrl: "https://evil.example", extra: "x",
}), { utmSource: "facebook", adId: "99", referrerHost: "instagram.com" });
assert.equal(sanitizeAttribution(null), null);
assert.equal(sanitizeAttribution(["x"]), null);
assert.equal(sanitizeAttribution({ referrerHost: "localhost" }), null);

assert.equal(isLandingPurpose("event"), true);
assert.equal(isLandingPurpose("social_ad"), true);
assert.equal(isLandingPurpose("ads"), false);

const links = landingLinks("https://elysium.mn/yarmag", "yarmag");
assert.equal(links.eventQr, "https://elysium.mn/yarmag?utm_source=event&utm_medium=qr&utm_campaign=yarmag");
assert.equal(links.socialPost, "https://elysium.mn/yarmag?utm_source=facebook&utm_medium=social&utm_campaign=yarmag");
assert.match(META_URL_PARAMETERS, /utm_medium=paid_social/);
assert.match(META_URL_PARAMETERS, /utm_id=\{\{campaign\.id\}\}/);

assert.equal(attributionSummary({ utmSource: "event", utmMedium: "qr", utmCampaign: "yarmag" }), "UTM: event / qr · Кампанит ажил: yarmag");
assert.equal(attributionSummary({ fbclid: "x", referrerHost: "l.facebook.com" }), "Facebook/Instagram линк · Ирсэн сайт: l.facebook.com");
assert.equal(attributionSummary(null), "");

// leadRequestBody: attribution байхгүй (server талд window алга) үед хуучин хэлбэр хэвээр.
const { leadRequestBody } = load("../src/lib/lead-request.ts");
const attempt = { current: null };
const body = JSON.parse(leadRequestBody({ name: "Тест" }, attempt));
assert.equal(body.attribution, undefined);
assert.equal(body.name, "Тест");

console.log("Landing attribution checks passed.");
