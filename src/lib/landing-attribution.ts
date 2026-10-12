/* ============================================================
   Landing page-ийн суваг (attribution)
   • Хуудас бүр «Зориулалт»-тай: эвент, сошиал зар эсвэл ерөнхий.
     Линкэнд UTM байхгүй үед Vertmonhub сувгийг түүгээр тогтооно.
   • Зочны линк дэх utm_*, Meta-ийн campaign/adset/ad ID, fbclid болон
     referrer-ийн домэйныг (бүтэн URL биш) энэ айлчлалын турш
     sessionStorage-д хадгалж, маягт илгээхэд хавсаргана.
   • Сервер зөвхөн allow-list талбарыг уртын хязгаартай авна.
   Сувгийг Vertmonhub ангилна (нэг дүрэм) — энд зөвхөн түүхий утга.
   ============================================================ */

export type LandingPurpose = "event" | "social_ad" | "general";

export const LANDING_PURPOSES: { value: LandingPurpose; label: string; description: string }[] = [
  { value: "event", label: "Эвент", description: "Ярмаг, экспо, нээлттэй өдөр зэрэгт QR-аар бүртгүүлэх хуудас." },
  { value: "social_ad", label: "Сошиал зар", description: "Facebook, Instagram-ийн төлбөртэй зараас орж ирэх хуудас." },
  { value: "general", label: "Ерөнхий", description: "Олон сувагт ашиглана. Суваг зөвхөн линкийн UTM-ээр тодорхойлогдоно." },
];

export function isLandingPurpose(value: unknown): value is LandingPurpose {
  return value === "event" || value === "social_ad" || value === "general";
}

/** Маягтаас ирэх, Vertmonhub руу дамжих түүхий мэдээлэл. */
export type LeadAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  /** Meta: {{campaign.id}} */
  utmId?: string;
  /** Meta: {{adset.id}} */
  adsetId?: string;
  /** Meta: {{ad.id}} */
  adId?: string;
  fbclid?: string;
  /** Өөр сайтаас шилжсэн бол тэр сайтын домэйн (ж: l.facebook.com). */
  referrerHost?: string;
};

/** Хадгалах/дамжуулах хэлбэр: серверийн тогтоосон хуудасны мэдээлэлтэй. */
export type StoredAttribution = LeadAttribution & {
  pagePurpose?: LandingPurpose;
  /** Маягт илгээсэн хуудасны хаяг (query-гүй). */
  pageUrl?: string;
};

const URL_PARAMS = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
  utm_id: "utmId",
  adset_id: "adsetId",
  ad_id: "adId",
  fbclid: "fbclid",
} as const satisfies Record<string, keyof LeadAttribution>;

const TEXT_KEYS = ["utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm"] as const;
const ID_KEYS = ["utmId", "adsetId", "adId"] as const;
const TEXT_MAX = 200;
const FBCLID_RE = /^[A-Za-z0-9_-]{1,500}$/;
const ID_RE = /^\d{1,30}$/;
const HOST_RE = /^(?=.{1,253}$)[a-z0-9-]+(\.[a-z0-9-]+)+$/;

/** Allow-list: зөвшөөрөгдсөн түлхүүр, зөв хэлбэртэй утга л үлдэнэ. Хоосон бол null. */
export function sanitizeAttribution(raw: unknown): LeadAttribution | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  const out: LeadAttribution = {};
  for (const key of TEXT_KEYS) {
    const value = typeof input[key] === "string" ? (input[key] as string).trim() : "";
    if (value && value.length <= TEXT_MAX && !/\p{Cc}/u.test(value)) out[key] = value;
  }
  for (const key of ID_KEYS) {
    const value = typeof input[key] === "string" ? (input[key] as string).trim() : "";
    if (ID_RE.test(value)) out[key] = value;
  }
  const fbclid = typeof input.fbclid === "string" ? input.fbclid.trim() : "";
  if (FBCLID_RE.test(fbclid)) out.fbclid = fbclid;
  const host = typeof input.referrerHost === "string" ? input.referrerHost.trim().toLowerCase() : "";
  if (HOST_RE.test(host)) out.referrerHost = host;
  return Object.keys(out).length ? out : null;
}

/** Линкийн параметр ба referrer-ээс attribution. Нэг сайтын дотоод шилжилтийг referrer гэж тооцохгүй. */
export function attributionFromUrl(search: string, referrer: string, currentHost: string): LeadAttribution | null {
  const params = new URLSearchParams(search);
  const raw: Record<string, string> = {};
  for (const [param, key] of Object.entries(URL_PARAMS)) {
    const value = params.get(param);
    if (value) raw[key] = value;
  }
  const host = referrerHostOf(referrer);
  if (host && !sameSite(host, currentHost)) raw.referrerHost = host;
  return sanitizeAttribution(raw);
}

/** Линкэнд UTM, Meta ID эсвэл fbclid байгаа эсэх (referrer-ээс бусад). */
export function hasCampaignParams(attribution: LeadAttribution | null): boolean {
  return !!attribution && Object.keys(attribution).some((key) => key !== "referrerHost");
}

function referrerHostOf(referrer: string): string | null {
  try {
    return referrer ? new URL(referrer).hostname.toLowerCase() : null;
  } catch {
    return null;
  }
}

function sameSite(a: string, b: string): boolean {
  const strip = (host: string) => host.toLowerCase().replace(/:\d+$/, "").replace(/^www\./, "");
  return strip(a) === strip(b);
}

/* ---- Browser: энэ айлчлалын attribution ---- */

const STORAGE_KEY = "elysium-attribution";

/** Хуудас ачаалах бүрт: шинэ кампанит линк ирвэл солино, үгүй бол анхны referrer-ийг хадгална. */
export function captureLeadAttribution(): void {
  if (typeof window === "undefined") return;
  const incoming = attributionFromUrl(window.location.search, document.referrer, window.location.host);
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (hasCampaignParams(incoming) || (!stored && incoming)) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(incoming));
    }
  } catch {
    /* storage хаалттай (private mode) — илгээх үед URL-аас дахин уншина */
  }
}

/** Маягт илгээхэд хавсаргах attribution (байхгүй бол null). */
export function readLeadAttribution(): LeadAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) return sanitizeAttribution(JSON.parse(stored));
  } catch {
    /* доорх URL-ын нөөц */
  }
  return attributionFromUrl(window.location.search, document.referrer, window.location.host);
}

/* ---- Админ: суваг тус бүрийн бэлэн линк ---- */

/** Meta Ads Manager → Ad → «URL parameters» талбарт хуулах мөр. */
export const META_URL_PARAMETERS =
  "utm_source={{site_source_name}}&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}" +
  "&utm_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}";

export function landingLinks(pageUrl: string, slug: string) {
  const withParams = (params: Record<string, string>) => `${pageUrl}?${new URLSearchParams(params).toString()}`;
  return {
    eventQr: withParams({ utm_source: "event", utm_medium: "qr", utm_campaign: slug }),
    socialPost: withParams({ utm_source: "facebook", utm_medium: "social", utm_campaign: slug }),
  };
}

/** Админы жагсаалтад: түүхий утгын товч (сувгийг Vertmonhub ангилна). */
export function attributionSummary(attribution: StoredAttribution | null | undefined): string {
  if (!attribution) return "";
  const utm = [attribution.utmSource, attribution.utmMedium].filter(Boolean).join(" / ");
  return [
    utm && `UTM: ${utm}`,
    attribution.utmCampaign && `Кампанит ажил: ${attribution.utmCampaign}`,
    !utm && attribution.fbclid && "Facebook/Instagram линк",
    attribution.referrerHost && `Ирсэн сайт: ${attribution.referrerHost}`,
  ].filter(Boolean).join(" · ");
}
