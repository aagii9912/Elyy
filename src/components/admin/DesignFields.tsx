"use client";

/* Админы дизайн (theme) засварлагч — палитр, хэсэг тус бүрийн дэвсгэр
   (өнгө / градиент / зураг), хөшиг, бичгийн горим.

   Бүх утга `SiteContent.theme`-д хадгалагдаж, `lib/theme-css.ts` нь
   түүнээс public хуудасны `<style>`-ийг үүсгэнэ. */

import { useState } from "react";
import {
  BACKGROUND_TOKENS,
  BG_ATTACHMENTS,
  BG_POSITIONS,
  BG_REPEATS,
  BG_SIZES,
  GRADIENT_TYPES,
  RADIAL_SHAPES,
  THEME_SECTIONS,
  DEFAULT_THEME,
  defaultBackground,
  type Background,
  type ThemeContent,
} from "@/lib/site-content";
import { backgroundStyle } from "@/lib/theme-css";
import { Button, Card, Field, ImageField, Select, TextInput, Toggle } from "./ui";

/* ------------------------------------------------------------------ */
/* Өнгөний туслахууд                                                   */
/* ------------------------------------------------------------------ */

/** `<input type="color">` нь зөвхөн `#rrggbb` хүлээж авдаг. */
function normalizeHex(value: string): string {
  const v = (value || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  if (/^#[0-9a-f]{3}$/i.test(v)) return "#" + v.slice(1).split("").map((c) => c + c).join("");
  if (/^#[0-9a-f]{8}$/i.test(v)) return v.slice(0, 7);
  return "#000000";
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hexColor: string): number {
  const h = normalizeHex(hexColor).slice(1);
  const r = channel(parseInt(h.slice(0, 2), 16));
  const g = channel(parseInt(h.slice(2, 4), 16));
  const b = channel(parseInt(h.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG тодролын харьцаа (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function ContrastNote({ fg, bg }: { fg: string; bg: string }) {
  const ratio = contrastRatio(fg, bg);
  const text = `Тодрол ${ratio.toFixed(1)}:1`;
  if (ratio >= 4.5) return <span className="text-xs font-semibold text-green-600">{text} · сайн</span>;
  if (ratio >= 3) return <span className="text-xs font-semibold text-amber-600">{text} · зөвхөн том бичигт</span>;
  return <span className="text-xs font-semibold text-red-600">{text} · уншигдахгүй</span>;
}

/* ------------------------------------------------------------------ */
/* Өнгө сонгох талбар                                                  */
/* ------------------------------------------------------------------ */

export function ColorField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: React.ReactNode;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={normalizeHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-[42px] w-12 shrink-0 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
        />
        <TextInput value={value} placeholder="#f4f4f1" onChange={(e) => onChange(e.target.value)} />
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/* Градиент зохиогч                                                    */
/* ------------------------------------------------------------------ */

const ANGLE_PRESETS = [0, 45, 90, 135, 180, 225, 270, 315];

const GRADIENT_TYPE_LABEL: Record<string, string> = {
  linear: "Шугаман",
  radial: "Төвөөс",
  conic: "Эргэлдэх",
};

function GradientBuilder({
  value,
  onChange,
}: {
  value: Background["gradient"];
  onChange: (next: Background["gradient"]) => void;
}) {
  const set = (patch: Partial<Background["gradient"]>) => onChange({ ...value, ...patch });
  const stops = value.stops;

  const setStop = (i: number, patch: Partial<(typeof stops)[number]>) =>
    set({ stops: stops.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Төрөл">
          <Select value={value.type} onChange={(e) => set({ type: e.target.value })}>
            {GRADIENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {GRADIENT_TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
        </Field>

        {value.type !== "radial" ? (
          <Field label={`Өнцөг — ${value.angle}°`}>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={value.angle}
              onChange={(e) => set({ angle: Number(e.target.value) })}
              className="w-full accent-[#2a5124]"
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {ANGLE_PRESETS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => set({ angle: a })}
                  className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${
                    value.angle === a
                      ? "border-[#2a5124] bg-[#2a5124]/5 text-[#2a5124]"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {a}°
                </button>
              ))}
            </div>
          </Field>
        ) : (
          <Field label="Хэлбэр">
            <Select value={value.shape} onChange={(e) => set({ shape: e.target.value })}>
              {RADIAL_SHAPES.map((sh) => (
                <option key={sh} value={sh}>
                  {sh}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <div>
        <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
          Өнгөний зогсоолууд
        </span>
        <div className="space-y-2">
          {stops.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-neutral-200 p-2">
              <input
                type="color"
                aria-label={`Зогсоол ${i + 1}`}
                value={normalizeHex(s.color)}
                onChange={(e) => setStop(i, { color: e.target.value })}
                className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-neutral-300 bg-white p-1"
              />
              <TextInput
                value={s.color}
                onChange={(e) => setStop(i, { color: e.target.value })}
                className="max-w-[130px]"
              />
              <input
                type="range"
                min={0}
                max={100}
                value={s.at}
                onChange={(e) => setStop(i, { at: Number(e.target.value) })}
                className="min-w-0 flex-1 accent-[#2a5124]"
              />
              <span className="w-11 shrink-0 text-right text-xs font-semibold tabular-nums text-neutral-500">
                {s.at}%
              </span>
              <button
                type="button"
                disabled={stops.length <= 2}
                onClick={() => set({ stops: stops.filter((_, j) => j !== i) })}
                className="shrink-0 rounded-md border border-neutral-300 px-2 py-1 text-xs font-semibold text-neutral-500 disabled:opacity-30"
                title={stops.length <= 2 ? "Хамгийн багадаа 2 зогсоол" : "Устгах"}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          className="mt-2"
          disabled={stops.length >= 8}
          onClick={() =>
            set({
              stops: [...stops, { color: stops[stops.length - 1].color, at: 100 }],
            })
          }
        >
          + Зогсоол нэмэх
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Дэвсгэрийн бүрэн засварлагч                                         */
/* ------------------------------------------------------------------ */

const KIND_TABS: { id: string; label: string }[] = [
  { id: "token", label: "Токен" },
  { id: "solid", label: "Өнгө" },
  { id: "gradient", label: "Градиент" },
  { id: "image", label: "Зураг" },
];

const TOKEN_LABEL: Record<string, string> = {
  auto: "Өгөгдмөл (кодоор — өөрчлөхгүй)",
  ground: "Хуудасны суурь",
  surface: "Карт / цагаан гадаргуу",
  dark: "Хар",
  accent: "Тодруулга",
  transparent: "Тунгалаг",
};

const TONE_LABEL: Record<string, string> = {
  auto: "Авто (кодын өгөгдмөл)",
  light: "Гэрэлтэй дэвсгэр — бараан бичиг",
  dark: "Хар дэвсгэр — цагаан бичиг",
};

const POSITION_LABEL: Record<string, string> = {
  center: "Голд", top: "Дээд", bottom: "Доод", left: "Зүүн", right: "Баруун",
  "top left": "Дээд зүүн", "top right": "Дээд баруун",
  "bottom left": "Доод зүүн", "bottom right": "Доод баруун",
};

const SIZE_LABEL: Record<string, string> = {
  cover: "Дүүргэх (cover)", contain: "Бүтнээр багтаах (contain)", auto: "Жинхэнэ хэмжээ",
};

const REPEAT_LABEL: Record<string, string> = {
  "no-repeat": "Давтахгүй", repeat: "Давтах", "repeat-x": "Хэвтээ давтах", "repeat-y": "Босоо давтах",
};

export function BackgroundField({
  value,
  onChange,
  palette,
  hint,
}: {
  value: Background;
  onChange: (next: Background) => void;
  /** Урьдчилан харахад токенийг жинхэнэ өнгө болгоход хэрэгтэй. */
  palette: ThemeContent["palette"];
  hint?: React.ReactNode;
}) {
  const set = (patch: Partial<Background>) => onChange({ ...value, ...patch });
  const kind = value.kind || "token";
  const preview = backgroundStyle(value, palette);
  const dark = value.tone === "dark";
  const blurred = kind === "image" && value.image.blur > 0 && Boolean(value.image.url);

  return (
    <div className="space-y-4">
      {/* Урьдчилан харах — бүдгэрүүлсэн зураг нь public талд `::before`
          давхаргаар ордог тул энд ч тусдаа давхаргаар харуулна. */}
      <div
        style={blurred ? { aspectRatio: "16/6" } : { ...preview, aspectRatio: "16/6" }}
        className="relative flex flex-col justify-center gap-1 overflow-hidden rounded-xl border border-neutral-300 px-5"
      >
        {blurred && (
          <span
            aria-hidden
            style={{
              ...preview,
              position: "absolute",
              inset: `-${Math.ceil(value.image.blur * 1.5)}px`,
              filter: `blur(${value.image.blur}px)`,
            }}
          />
        )}
        <span
          className="relative text-[11px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: dark ? "rgba(255,255,255,0.62)" : "#8a8d8c" }}
        >
          Жишээ шошго
        </span>
        <span
          className="relative text-xl font-extrabold tracking-tight"
          style={{ color: dark ? "#ffffff" : palette.dark }}
        >
          Хэсгийн гарчиг
        </span>
      </div>

      {/* Төрлийн таб */}
      <div className="flex flex-wrap gap-1.5">
        {KIND_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => set({ kind: t.id })}
            className={`rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors ${
              kind === t.id
                ? "border-[#2a5124] bg-[#2a5124]/5 text-[#2a5124]"
                : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {kind === "token" && (
        <Field label="Дизайн системийн өнгө" hint="«Өгөгдмөл» үед энэ хэсэг кодод бичсэн өнгөөрөө үлдэнэ.">
          <Select value={value.token} onChange={(e) => set({ token: e.target.value })}>
            {BACKGROUND_TOKENS.map((t) => (
              <option key={t} value={t}>
                {TOKEN_LABEL[t]}
              </option>
            ))}
          </Select>
        </Field>
      )}

      {kind === "solid" && (
        <ColorField label="Дэвсгэр өнгө" value={value.color} onChange={(color) => set({ color })} />
      )}

      {kind === "gradient" && (
        <GradientBuilder value={value.gradient} onChange={(gradient) => set({ gradient })} />
      )}

      {kind === "image" && (
        <div className="space-y-4">
          <ImageField
            label="Дэвсгэр зураг"
            value={value.image.url}
            ratio="16/9"
            maxEdge={2400}
            onChange={(url) => set({ image: { ...value.image, url } })}
            hint="Том зураг хуудсыг удаашруулна — 2400px-ээс дээшгүй байлгана."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Байрлал">
              <Select
                value={value.image.position}
                onChange={(e) => set({ image: { ...value.image, position: e.target.value } })}
              >
                {BG_POSITIONS.map((p) => (
                  <option key={p} value={p}>{POSITION_LABEL[p]}</option>
                ))}
              </Select>
            </Field>
            <Field label="Хэмжээ">
              <Select
                value={value.image.size}
                onChange={(e) => set({ image: { ...value.image, size: e.target.value } })}
              >
                {BG_SIZES.map((p) => (
                  <option key={p} value={p}>{SIZE_LABEL[p]}</option>
                ))}
              </Select>
            </Field>
            <Field label="Давталт">
              <Select
                value={value.image.repeat}
                onChange={(e) => set({ image: { ...value.image, repeat: e.target.value } })}
              >
                {BG_REPEATS.map((p) => (
                  <option key={p} value={p}>{REPEAT_LABEL[p]}</option>
                ))}
              </Select>
            </Field>
            <Field label="Гүйлт" hint="«Тогтмол» нь гар утсанд автоматаар унтарна (iOS дээр гацдаг).">
              <Select
                value={value.image.attachment}
                onChange={(e) => set({ image: { ...value.image, attachment: e.target.value } })}
              >
                {BG_ATTACHMENTS.map((p) => (
                  <option key={p} value={p}>{p === "fixed" ? "Тогтмол (parallax)" : "Хуудастай хамт"}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label={`Бүдгэрүүлэлт — ${value.image.blur}px`} hint="Зургийг зөөлрүүлж, бичгийг уншигдахуйц болгоно.">
            <input
              type="range"
              min={0}
              max={24}
              value={value.image.blur}
              onChange={(e) => set({ image: { ...value.image, blur: Number(e.target.value) } })}
              className="w-full accent-[#2a5124]"
            />
          </Field>
        </div>
      )}

      {/* Хөшиг */}
      <div className="rounded-xl border border-neutral-200 p-4">
        <p className="mb-3 text-[13px] font-bold text-neutral-800">Хөшиг (дэвсгэр дээр давхарлана)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            label="Хөшгийн өнгө"
            value={value.overlay.color}
            onChange={(color) => set({ overlay: { ...value.overlay, color } })}
          />
          <Field label={`Хүч — ${value.overlay.opacity}%`} hint="0% үед хөшиг огт үүсэхгүй.">
            <input
              type="range"
              min={0}
              max={100}
              value={value.overlay.opacity}
              onChange={(e) => set({ overlay: { ...value.overlay, opacity: Number(e.target.value) } })}
              className="w-full accent-[#2a5124]"
            />
          </Field>
        </div>
        <div className="mt-3">
          <Toggle
            checked={value.overlay.soft}
            onChange={(soft) => set({ overlay: { ...value.overlay, soft } })}
            label="Зөөлөн (дээд/доод тал нь тод, дунд нь нимгэн)"
          />
        </div>
      </div>

      {/* Бичгийн горим */}
      <Field
        label="Бичгийн өнгө"
        hint="Дэвсгэрийг хартай болгосон бол «Хар дэвсгэр» болгож бичгээ цайруулна."
      >
        <Select value={value.tone} onChange={(e) => set({ tone: e.target.value })}>
          {Object.entries(TONE_LABEL).map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </Select>
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" onClick={() => onChange(defaultBackground())}>
          Өгөгдмөл рүү буцаах
        </Button>
        {hint && <span className="text-xs text-neutral-400">{hint}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Бэлэн палитрууд                                                     */
/* ------------------------------------------------------------------ */

export const PALETTE_PRESETS: { id: string; label: string; palette: ThemeContent["palette"] }[] = [
  { id: "mono", label: "Mono (одоогийн)", palette: DEFAULT_THEME.palette },
  {
    id: "forest",
    label: "Гүн ногоон",
    palette: {
      ground: "#f3f6e4", surface: "#ffffff", dark: "#16280f", muted: "#6f7a63",
      accent: "#b4d656", accentDeep: "#2a5124", film: "#16280f",
    },
  },
  {
    id: "night",
    label: "Шөнө",
    palette: {
      ground: "#14161a", surface: "#1e2229", dark: "#f2f4f7", muted: "#98a0ae",
      accent: "#b4d656", accentDeep: "#7f9c48", film: "#05070a",
    },
  },
  {
    id: "paper",
    label: "Цаас",
    palette: {
      ground: "#faf8f3", surface: "#ffffff", dark: "#221e1a", muted: "#8c8378",
      accent: "#c99a4b", accentDeep: "#7a5c2a", film: "#221e1a",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Дизайны бүрэн самбар                                                */
/* ------------------------------------------------------------------ */

export function DesignPanel({
  theme,
  onChange,
}: {
  theme: ThemeContent;
  onChange: (next: ThemeContent) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const p = theme.palette;

  const setPalette = (patch: Partial<ThemeContent["palette"]>) =>
    onChange({ ...theme, palette: { ...p, ...patch } });

  const setSection = (id: keyof ThemeContent["sections"], bg: Background) =>
    onChange({ ...theme, sections: { ...theme.sections, [id]: bg } });

  /** Тухайн хэсэг өгөгдмөлөөсөө өөрчлөгдсөн эсэх — жагсаалтад тэмдэглэнэ. */
  const changed = (bg: Background) =>
    JSON.stringify(bg) !== JSON.stringify(defaultBackground());

  return (
    <>
      <Card title="Бэлэн палитр">
        <p className="mb-3 text-[13px] leading-relaxed text-neutral-500">
          Нэг товчоор бүх өнгийг сольж, дараа нь доор гараар засна. Хэсэг тус
          бүрийн дэвсгэрийг өөрчлөхгүй.
        </p>
        <div className="flex flex-wrap gap-2">
          {PALETTE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange({ ...theme, palette: preset.palette })}
              className="flex items-center gap-2 rounded-xl border border-neutral-300 px-3 py-2 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <span className="flex">
                {[preset.palette.ground, preset.palette.surface, preset.palette.dark, preset.palette.accent].map(
                  (c) => (
                    <span
                      key={c}
                      style={{ background: c }}
                      className="h-5 w-5 rounded-full border border-black/10 [&:not(:first-child)]:-ml-1.5"
                    />
                  )
                )}
              </span>
              {preset.label}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Палитр">
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            label="Хуудасны суурь"
            value={p.ground}
            onChange={(ground) => setPalette({ ground })}
            hint={<ContrastNote fg={p.dark} bg={p.ground} />}
          />
          <ColorField
            label="Карт / гадаргуу"
            value={p.surface}
            onChange={(surface) => setPalette({ surface })}
            hint={<ContrastNote fg={p.dark} bg={p.surface} />}
          />
          <ColorField
            label="Үндсэн бичиг ба хар хэсэг"
            value={p.dark}
            onChange={(dark) => setPalette({ dark })}
          />
          <ColorField
            label="Бүдэг туслах бичиг"
            value={p.muted}
            onChange={(muted) => setPalette({ muted })}
            hint={<ContrastNote fg={p.muted} bg={p.ground} />}
          />
          <ColorField
            label="Тодруулга"
            value={p.accent}
            onChange={(accent) => setPalette({ accent })}
          />
          <ColorField
            label="Гүн тодруулга"
            value={p.accentDeep}
            onChange={(accentDeep) => setPalette({ accentDeep })}
            hint={<ContrastNote fg={p.accentDeep} bg={p.ground} />}
          />
          <ColorField
            label="Кино хэсгийн хөшиг"
            value={p.film}
            onChange={(film) => setPalette({ film })}
            hint="Бичлэгийн кадруудын дээрх өнгөт хөшиг."
          />
        </div>
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange({ ...theme, palette: DEFAULT_THEME.palette })}
          >
            Палитрыг өгөгдмөл рүү буцаах
          </Button>
        </div>
      </Card>

      <Card title="Хуудасны суурь дэвсгэр" right={<span className="text-xs text-neutral-400">html</span>}>
        <p className="mb-4 text-[13px] leading-relaxed text-neutral-500">
          Гүйлтийн хязгаараас хальсан үед (overscroll) харагдах өнгө.
        </p>
        <BackgroundField
          value={theme.page}
          palette={p}
          onChange={(page) => onChange({ ...theme, page })}
        />
      </Card>

      <Card title="Хэсэг тус бүрийн дэвсгэр">
        <p className="mb-4 text-[13px] leading-relaxed text-neutral-500">
          Хэсэг бүрийг дарж дэвсгэр өнгө, градиент эсвэл зургийг нь тусад нь
          тохируулна. «Өгөгдмөл» үед тухайн хэсэг кодод бичсэн өнгөөрөө үлдэнэ.
        </p>
        <ul className="space-y-2">
          {THEME_SECTIONS.map((s) => {
            const bg = theme.sections[s.id];
            const isOpen = open === s.id;
            return (
              <li key={s.id} className="overflow-hidden rounded-xl border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className="flex w-full items-center gap-3 bg-neutral-50 px-4 py-3 text-left transition-colors hover:bg-neutral-100"
                >
                  <span
                    aria-hidden
                    style={{ ...backgroundStyle(bg, p), backgroundSize: "cover" }}
                    className="h-8 w-12 shrink-0 rounded-md border border-neutral-300 bg-white"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-[14px] font-bold text-neutral-900">
                      {s.label}
                      {changed(bg) && (
                        <span aria-hidden title="Өөрчлөгдсөн" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </span>
                    {s.hint && <span className="block text-[11px] text-neutral-400">{s.hint}</span>}
                  </span>
                  <span aria-hidden className="shrink-0 text-neutral-400">{isOpen ? "▾" : "▸"}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-neutral-200 p-4">
                    <BackgroundField value={bg} palette={p} onChange={(next) => setSection(s.id, next)} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
