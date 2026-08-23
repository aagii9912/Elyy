/* ============================================================
   ELYSIUM — Дизайны (theme) CSS үүсгэгч.

   Админаас хадгалсан `SiteContent.theme`-ээс `<style>`-д тавих CSS
   мөрийг үүсгэнэ. Tailwind v4 нь `bg-ground`-ыг
   `background-color: var(--color-ground)` болгож хөрвүүлдэг тул
   хувьсагчийн УТГЫГ дарж бичихэд бүх хуудас шинэ өнгө рүү шилжинэ.

   ⚠️ АЮУЛГҮЙ БАЙДАЛ: хадгалсан утгыг ХЭЗЭЭ Ч шууд CSS рүү бичихгүй.
   Бүх утга доорх `hex/num/pick/imageUrl` шүүлтүүрээр дамжиж, зөвшөөрсөн
   хэлбэрт нийцээгүй бол өгөгдмөл рүү буцна. Ингэснээр `}</style><script>`
   маягийн утга хадгалагдсан ч CSS эвдрэхгүй.

   Client болон server хоёуланд ачаалагдана — server-only код БАЙХГҮЙ.
   ============================================================ */

import {
  BACKGROUND_KINDS,
  BACKGROUND_TOKENS,
  BG_ATTACHMENTS,
  BG_POSITIONS,
  BG_REPEATS,
  BG_SIZES,
  GRADIENT_TYPES,
  RADIAL_SHAPES,
  THEME_SECTIONS,
  TONES,
  defaultBackground,
  DEFAULT_THEME,
  type Background,
  type ThemeContent,
  type ThemeSectionId,
} from "./site-content";

/* ------------------------------------------------------------------ */
/* Шүүлтүүрүүд                                                         */
/* ------------------------------------------------------------------ */

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Зөвхөн `#rgb|#rgba|#rrggbb|#rrggbbaa`. Бусад бүхнийг өгөгдмөл рүү. */
export function hex(value: unknown, fallback: string): string {
  const v = typeof value === "string" ? value.trim() : "";
  return HEX.test(v) ? v.toLowerCase() : fallback;
}

function num(value: unknown, lo: number, hi: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, n));
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const v = typeof value === "string" ? value.trim() : "";
  return (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

/** Дэвсгэр зургийн хаяг. Зөвхөн дотоод (`/…`) эсвэл `https://…`;
 *  хашилт, хаалт, зай, тусгай тэмдэгт агуулсныг бүхэлд нь хаяна. */
export function imageUrl(value: unknown): string {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) return "";
  if (/[\s"'()\;{}<>]/.test(v)) return "";
  return /^(?:\/[^/]|https:\/\/[a-z0-9.-]+\/)/i.test(v) ? v : "";
}

/** `#rrggbb` + тунгалаг (0–1) → `rgba(...)`. */
function rgba(hexColor: string, alpha: number): string {
  let h = hexColor.slice(1);
  if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const baseA = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  const a = Math.round(Math.min(1, Math.max(0, alpha * baseA)) * 1000) / 1000;
  return `rgba(${r},${g},${b},${a})`;
}

/* ------------------------------------------------------------------ */
/* Дэвсгэр → CSS                                                       */
/* ------------------------------------------------------------------ */

function stopsCss(bg: Background): string {
  const def = defaultBackground().gradient.stops;
  const raw = Array.isArray(bg.gradient?.stops) ? bg.gradient.stops : def;
  const stops = raw.length >= 2 ? raw : def;
  return stops
    .map((s, i) => `${hex(s?.color, def[Math.min(i, def.length - 1)].color)} ${num(s?.at, 0, 100, i === 0 ? 0 : 100)}%`)
    .join(",");
}

/** Градиентийн CSS утга (`background-image`-д тавихад тохирно). */
function gradientCss(bg: Background): string {
  const type = pick(bg.gradient?.type, GRADIENT_TYPES, "linear");
  const angle = num(bg.gradient?.angle, 0, 360, 180);
  const shape = pick(bg.gradient?.shape, RADIAL_SHAPES, RADIAL_SHAPES[0]);
  const stops = stopsCss(bg);
  if (type === "radial") return `radial-gradient(${shape},${stops})`;
  if (type === "conic") return `conic-gradient(from ${angle}deg at 50% 50%,${stops})`;
  return `linear-gradient(${angle}deg,${stops})`;
}

/** Хөшгийн CSS. Хоосон мөр = хөшиггүй. */
export function overlayCss(bg: Background): string {
  const opacity = num(bg.overlay?.opacity, 0, 100, 0) / 100;
  if (opacity <= 0) return "";
  const color = hex(bg.overlay?.color, "#151717");
  if (bg.overlay?.soft === false) {
    return `linear-gradient(${rgba(color, opacity)},${rgba(color, opacity)})`;
  }
  // Зөөлөн: дээд/доод нь тод, дунд нь нимгэн — зураг голоороо харагдана.
  return (
    `linear-gradient(180deg,${rgba(color, opacity)} 0%,` +
    `${rgba(color, opacity * 0.35)} 45%,` +
    `${rgba(color, Math.min(1, opacity * 1.1))} 100%)`
  );
}

/** React `style`-д шууд тавихад тохирох дэвсгэрийн шинжүүд. */
export type BackgroundStyle = {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
};

/** Токенийг CSS утга руу. `palette` өгвөл ЖИНХЭНЭ hex-ээр (админы
 *  урьдчилан харахад `--color-*` хувьсагч байхгүй тул). */
function tokenValue(token: string, palette?: ThemeContent["palette"]): string | null {
  const d = DEFAULT_THEME.palette;
  switch (token) {
    case "ground": return palette ? hex(palette.ground, d.ground) : "var(--color-ground)";
    case "surface": return palette ? hex(palette.surface, d.surface) : "var(--color-surface)";
    case "dark": return palette ? hex(palette.dark, d.dark) : "var(--color-night)";
    case "accent": return palette ? hex(palette.accent, d.accent) : "var(--color-lime)";
    case "transparent": return "transparent";
    default: return null; // "auto" — өгөгдмөлийг хөндөхгүй
  }
}

/** Нэг дэвсгэрийн CSS шинжүүд. Хоосон объект = "юу ч бүү хий". */
export function backgroundStyle(
  bg: Background | undefined,
  palette?: ThemeContent["palette"]
): BackgroundStyle {
  const src = bg ?? defaultBackground();
  const kind = pick(src.kind, BACKGROUND_KINDS, "token");
  const out: BackgroundStyle = {};
  const layers: string[] = [];

  const overlay = overlayCss(src);
  if (overlay) layers.push(overlay);

  if (kind === "solid") {
    out.backgroundColor = hex(src.color, "#f4f4f1");
  } else if (kind === "gradient") {
    layers.push(gradientCss(src));
  } else if (kind === "image") {
    const url = imageUrl(src.image?.url);
    if (url) {
      layers.push(`url("${url}")`);
      out.backgroundSize = pick(src.image?.size, BG_SIZES, "cover");
      out.backgroundPosition = pick(src.image?.position, BG_POSITIONS, "center");
      out.backgroundRepeat = pick(src.image?.repeat, BG_REPEATS, "no-repeat");
      if (pick(src.image?.attachment, BG_ATTACHMENTS, "scroll") === "fixed") {
        out.backgroundAttachment = "fixed";
      }
    }
  } else {
    const token = tokenValue(pick(src.token, BACKGROUND_TOKENS, "auto"), palette);
    if (token) out.backgroundColor = token;
  }

  if (layers.length) {
    /* Олон давхарга — ЭХНИЙ нь дээр буудаг тул хөшиг үргэлж түрүүнд. */
    out.backgroundImage = layers.join(",");
    if (!out.backgroundSize) {
      out.backgroundSize = "cover";
      out.backgroundPosition = "center";
      out.backgroundRepeat = "no-repeat";
    }
  }
  return out;
}

/** Бүдгэрүүлсэн зургийн давхарга (`::before`). Хоосон = хэрэггүй.
 *
 *  `filter: blur()` нь `background-image`-д шууд үйлчилдэггүй тул зургийг
 *  тусдаа давхаргад гаргана. Хөшгийг ч ЭНД оруулна — эс бөгөөс хөшиг
 *  элементийн дэвсгэр дээр үлдэж, бүдгэрсэн зурагны ДООР дарагдана. */
function blurLayer(bg: Background | undefined): string {
  const src = bg ?? defaultBackground();
  if (pick(src.kind, BACKGROUND_KINDS, "token") !== "image") return "";
  const url = imageUrl(src.image?.url);
  const blur = num(src.image?.blur, 0, 24, 0);
  if (!url || blur <= 0) return "";
  const overlay = overlayCss(src);
  const layers = overlay ? `${overlay},url("${url}")` : `url("${url}")`;
  return (
    `content:"";position:absolute;inset:-${Math.ceil(blur * 1.5)}px;z-index:-1;` +
    `pointer-events:none;background-image:${layers};` +
    `background-size:${pick(src.image?.size, BG_SIZES, "cover")};` +
    `background-position:${pick(src.image?.position, BG_POSITIONS, "center")};` +
    `background-repeat:${pick(src.image?.repeat, BG_REPEATS, "no-repeat")};` +
    `filter:blur(${blur}px)`
  );
}

const KEBAB = /[A-Z]/g;

/** `{backgroundColor:"#fff"}` → `background-color:#fff`. */
function declText(style: Record<string, string>): string {
  return Object.entries(style)
    .map(([k, v]) => `${k.replace(KEBAB, (m) => "-" + m.toLowerCase())}:${v}`)
    .join(";");
}

type Declarations = { body: string; before: string };

function backgroundDecls(bg: Background): Declarations {
  const style: Record<string, string> = { ...backgroundStyle(bg) } as Record<string, string>;
  const before = blurLayer(bg);
  if (before) {
    /* Зураг ба хөшиг хоёулаа `::before`-д шилжсэн — элемент дээр давхардуулж
       болохгүй (бүдгэрээгүй хувилбар нь доогуур нь харагдана). */
    delete style.backgroundImage;
    delete style.backgroundSize;
    delete style.backgroundPosition;
    delete style.backgroundRepeat;
    delete style.backgroundAttachment;
    /* Бүдгэрүүлсэн зураг нь хэсгийн ӨӨРИЙН дэвсгэрийн дээр, контентын
       доор буух ёстой. `isolation:isolate` энэ дарааллыг хэсэг дотор
       түгжинэ (`z-index:-1` гадагш "унахгүй"). */
    style.position = "relative";
    style.isolation = "isolate";
  }
  return { body: declText(style), before };
}

/* ------------------------------------------------------------------ */
/* Бичгийн горим (tone)                                                */
/* ------------------------------------------------------------------ */

/** Тухайн хэсгийн бичгийн горим. `auto` үед компонентын өгөгдмөлөөр. */
export function sectionTone(
  theme: ThemeContent | undefined,
  id: ThemeSectionId,
  fallback: "light" | "dark"
): "light" | "dark" {
  const value = pick(theme?.sections?.[id]?.tone, TONES, "auto");
  return value === "auto" ? fallback : value;
}

/* ------------------------------------------------------------------ */
/* Гол функц                                                           */
/* ------------------------------------------------------------------ */

/** `theme`-ээс `<style>`-д тавих CSS. Аюулгүй — бүх утга шүүгдсэн. */
export function buildThemeCss(theme: ThemeContent | undefined): string {
  const t = theme ?? DEFAULT_THEME;
  const p = t.palette ?? DEFAULT_THEME.palette;
  const d = DEFAULT_THEME.palette;
  const rules: string[] = [];

  /* 1) Палитр — Tailwind токенууд руу шууд. */
  rules.push(
    `:root,.mono-page{` +
      `--color-ground:${hex(p.ground, d.ground)};` +
      `--color-surface:${hex(p.surface, d.surface)};` +
      `--color-night:${hex(p.dark, d.dark)};` +
      `--color-mist:${hex(p.muted, d.muted)};` +
      `--color-lime:${hex(p.accent, d.accent)};` +
      `--color-moss:${hex(p.accentDeep, d.accentDeep)};` +
      `--color-charcoal:${hex(p.film, d.film)};` +
      `}`
  );

  /* 2) Хуудасны суурь — overscroll бүсэд ч харагдана. */
  const page = backgroundDecls(t.page ?? defaultBackground());
  if (page.body) rules.push(`html{${page.body}}`);

  /* 3) Хэсэг тус бүр. */
  for (const { id } of THEME_SECTIONS) {
    const bg = t.sections?.[id] ?? defaultBackground();
    const { body, before } = backgroundDecls(bg);
    if (body) rules.push(`.mono-page [data-bg="${id}"]{${body}}`);
    if (before) rules.push(`.mono-page [data-bg="${id}"]::before{${before}}`);
  }

  /* 4) Мобайл дээр `fixed` нь iOS-д гацдаг — үргэлж scroll руу буулгана. */
  if (rules.some((r) => r.includes("background-attachment:fixed"))) {
    rules.push(`@media (max-width:767px){.mono-page [data-bg]{background-attachment:scroll!important}}`);
  }

  return rules.join("\n");
}

/* ------------------------------------------------------------------ */
/* Хадгалахын өмнөх цэвэрлэгээ                                         */
/* ------------------------------------------------------------------ */

/** Нэг дэвсгэрийг зөвшөөрөгдсөн утгууд руу шахна. */
function sanitizeBackground(bg: Background | undefined): Background {
  const d = defaultBackground();
  const src = bg ?? d;
  const stops = Array.isArray(src.gradient?.stops) ? src.gradient.stops : d.gradient.stops;
  return {
    kind: pick(src.kind, BACKGROUND_KINDS, "token"),
    token: pick(src.token, BACKGROUND_TOKENS, "auto"),
    color: hex(src.color, d.color),
    gradient: {
      type: pick(src.gradient?.type, GRADIENT_TYPES, "linear"),
      angle: num(src.gradient?.angle, 0, 360, d.gradient.angle),
      shape: pick(src.gradient?.shape, RADIAL_SHAPES, RADIAL_SHAPES[0]),
      stops: (stops.length >= 2 ? stops : d.gradient.stops)
        .slice(0, 8)
        .map((s, i) => ({
          color: hex(s?.color, d.gradient.stops[Math.min(i, 1)].color),
          at: num(s?.at, 0, 100, i === 0 ? 0 : 100),
        })),
    },
    image: {
      url: imageUrl(src.image?.url),
      position: pick(src.image?.position, BG_POSITIONS, "center"),
      size: pick(src.image?.size, BG_SIZES, "cover"),
      repeat: pick(src.image?.repeat, BG_REPEATS, "no-repeat"),
      attachment: pick(src.image?.attachment, BG_ATTACHMENTS, "scroll"),
      blur: num(src.image?.blur, 0, 24, 0),
    },
    overlay: {
      color: hex(src.overlay?.color, d.overlay.color),
      opacity: num(src.overlay?.opacity, 0, 100, 0),
      soft: typeof src.overlay?.soft === "boolean" ? src.overlay.soft : true,
    },
    tone: pick(src.tone, TONES, "auto"),
  };
}

/** Хадгалахын өмнө дизайны бүх утгыг цэвэрлэнэ — хог утга хадгалагдахгүй. */
export function sanitizeTheme(theme: ThemeContent | undefined): ThemeContent {
  const t = theme ?? DEFAULT_THEME;
  const p = t.palette ?? DEFAULT_THEME.palette;
  const d = DEFAULT_THEME.palette;
  const sections = {} as ThemeContent["sections"];
  for (const { id } of THEME_SECTIONS) {
    sections[id] = sanitizeBackground(t.sections?.[id]);
  }
  return {
    palette: {
      ground: hex(p.ground, d.ground),
      surface: hex(p.surface, d.surface),
      dark: hex(p.dark, d.dark),
      muted: hex(p.muted, d.muted),
      accent: hex(p.accent, d.accent),
      accentDeep: hex(p.accentDeep, d.accentDeep),
      film: hex(p.film, d.film),
    },
    page: sanitizeBackground(t.page),
    sections,
  };
}
