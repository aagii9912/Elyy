"use client";

/* Админы дизайн (theme) засварлагч — палитр, типографи, хэсэг тус
   бүрийн дэвсгэр, шилэн гадаргуу.

   Бүх утга `SiteContent.theme`-д хадгалагдаж, `lib/theme-css.ts` нь
   түүнээс public хуудасны `<style>`-ийг үүсгэнэ.

   Зохион байгуулалт: ЗҮҮН талд дөрвөн алхмын хөшүүрэг, БАРУУН талд
   жинхэнэ нүүр хуудсыг ачаалсан амьд preview (`ThemePreview`). Өнгө,
   фонтын нэрийг үгээр тайлбарлах гэж оролдохын оронд үр дүнг нь шууд
   харуулах нь энэ самбарын гол зарчим. */

import { useMemo, useState } from "react";
import {
  type GlassContent,
  BODY_FONTS,
  DISPLAY_FONTS,
  type FontOption,
  type TypeContent,
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
  type ThemeSectionId,
} from "@/lib/site-content";
import { backgroundFilmStyle, backgroundStyle } from "@/lib/theme-css";
import { Button, Card, Field, ImageField, Select, TextInput, Toggle } from "./ui";
import { ThemePreview } from "./ThemePreview";

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
/* Дэвсгэрийн засварлагч                                               */
/* ------------------------------------------------------------------ */

/** Кадрын оронд тавих дүрс — хальс ямар өнгөтэй буухыг харуулах
 *  зорилготой, жинхэнэ бичлэгийг татахгүйгээр. */
const FRAME_STANDIN =
  "linear-gradient(158deg,#4d5a63 0%,#8f9aa1 34%,#cdd3d6 58%,#6f7a82 100%)";

/* Админд харагдах ДӨРВӨН төрөл. Кодын `kind` + `token` хосыг нэг
   ойлгомжтой мөр болгож нэгтгэв — «токен» гэдэг үг админд гарахгүй:

     Өгөгдмөл → kind "token"    + token "auto"
     Өнгө     → kind "token"    + палитрын өнгө   (палитраа дагана)
                ЭСВЭЛ kind "solid" + дурын hex     (тогтмол)
     Градиент → kind "gradient"
     Зураг    → kind "image"                                          */
type BgMode = "default" | "color" | "gradient" | "image";

const MODE_TABS: { id: BgMode; label: string }[] = [
  { id: "default", label: "Өгөгдмөл" },
  { id: "color", label: "Өнгө" },
  { id: "gradient", label: "Градиент" },
  { id: "image", label: "Зураг" },
];

function bgModeOf(v: Background): BgMode {
  if (v.kind === "gradient") return "gradient";
  if (v.kind === "image") return "image";
  if (v.kind === "solid") return "color";
  return v.token && v.token !== "auto" ? "color" : "default";
}

/** «Өнгө» дотор санал болгох палитрын өнгө. Эдгээрийг сонгоход тухайн
 *  хэсэг палитраа ДАГАЖ өөрчлөгддөг болно (доорх «дурын өнгө» бол
 *  палитраас хамааралгүй тогтмол утга). */
const SWATCHES: { token: string; label: string }[] = [
  { token: "ground", label: "Хуудасны дэвсгэр" },
  { token: "surface", label: "Карт / цагаан" },
  { token: "dark", label: "Хар" },
  { token: "accent", label: "Тодруулга" },
  { token: "transparent", label: "Тунгалаг" },
];

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

/** Палитрын өнгийг ЖИНХЭНЭ hex рүү — swatch-ийг зөв будахад. */
function swatchColor(token: string, palette: ThemeContent["palette"]): string {
  switch (token) {
    case "ground": return palette.ground;
    case "surface": return palette.surface;
    case "dark": return palette.dark;
    case "accent": return palette.accent;
    default: return "transparent";
  }
}

export function BackgroundField({
  value,
  onChange,
  palette,
  hint,
  film = false,
  manualTone = false,
}: {
  value: Background;
  onChange: (next: Background) => void;
  /** Урьдчилан харахад токенийг жинхэнэ өнгө болгоход хэрэгтэй. */
  palette: ThemeContent["palette"];
  hint?: React.ReactNode;
  /** Кадраар бүрхэгдсэн хэсэг үү — тийм бол дэвсгэр нь кадрын ДЭЭР буух
   *  хальс болно (`lib/theme-css.ts` → `backgroundFilmStyle`). Урьдчилан
   *  харахад ч мөн хальс болгож үзүүлнэ. */
  film?: boolean;
  /** Бичгийн өнгийг ГАРААР сонгох ёстой хэсэг үү. Үлдсэн хэсгүүд
   *  дэвсгэрийнхээ гэрэлтэлтээс өөрсдөө тооцдог тул тоныг харуулахгүй
   *  (`lib/theme-css.ts` → `flatSectionTone`). */
  manualTone?: boolean;
}) {
  const set = (patch: Partial<Background>) => onChange({ ...value, ...patch });
  const mode = bgModeOf(value);
  const preview = backgroundStyle(value, palette);
  const dark = value.tone === "dark";
  const blurred = value.kind === "image" && value.image.blur > 0 && Boolean(value.image.url);
  /* Кадртай хэсэгт дэвсгэр нь ард нь биш, кадрын ДЭЭР хальс болж
     буудаг — урьдчилан харахыг ч яг тэр дарааллаар нь угсарна. */
  const filmLayer = film ? backgroundFilmStyle(value, palette) : null;
  /* Зурган дэвсгэрийн гэрэлтэлтийг код мэдэх аргагүй тул тэнд ямагт
     гараар. Бусад тохиолдолд дэвсгэрээс автоматаар тодорхойлогдоно. */
  const showTone = manualTone || mode === "image";

  /** Төрөл солиход утгыг ЗӨВ хосолол руу шилжүүлнэ. */
  const setMode = (next: BgMode) => {
    if (next === "default") set({ kind: "token", token: "auto" });
    else if (next === "color") set({ kind: "token", token: "surface" });
    else if (next === "gradient") set({ kind: "gradient" });
    else set({ kind: "image" });
  };

  return (
    <div className="space-y-4">
      {/* Урьдчилан харах — бүдгэрүүлсэн зураг нь public талд `::before`
          давхаргаар ордог тул энд ч тусдаа давхаргаар харуулна. */}
      <div
        style={
          film
            ? { backgroundImage: FRAME_STANDIN, aspectRatio: "16/6" }
            : blurred
              ? { aspectRatio: "16/6" }
              : { ...preview, aspectRatio: "16/6" }
        }
        className="relative flex flex-col justify-center gap-1 overflow-hidden rounded-xl border border-neutral-300 px-5"
      >
        {filmLayer && (
          <span aria-hidden style={{ ...filmLayer, position: "absolute", inset: 0 }} />
        )}
        {!film && blurred && (
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

      {/* Төрөл */}
      <div className="flex flex-wrap gap-1.5">
        {MODE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setMode(t.id)}
            className={`rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors ${
              mode === t.id
                ? "border-[#2a5124] bg-[#2a5124]/5 text-[#2a5124]"
                : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mode === "default" && (
        <p className="rounded-lg bg-neutral-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-neutral-500">
          Энэ хэсэг кодод бичсэн өнгөөрөө үлдэнэ — дизайны тохиргоо түүнд хүрэхгүй.
        </p>
      )}

      {mode === "color" && (
        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
            Палитраас
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SWATCHES.map((s) => {
              const on = value.kind === "token" && value.token === s.token;
              const c = swatchColor(s.token, palette);
              return (
                <button
                  key={s.token}
                  type="button"
                  onClick={() => set({ kind: "token", token: s.token })}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                    on
                      ? "border-[#2a5124] bg-[#2a5124]/5 text-[#2a5124]"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <span
                    aria-hidden
                    style={
                      s.token === "transparent"
                        ? { backgroundImage: "linear-gradient(45deg,#ddd 25%,transparent 25%,transparent 75%,#ddd 75%),linear-gradient(45deg,#ddd 25%,#fff 25%,#fff 75%,#ddd 75%)", backgroundSize: "8px 8px", backgroundPosition: "0 0,4px 4px" }
                        : { background: c }
                    }
                    className="h-5 w-5 rounded-md border border-black/10"
                  />
                  {s.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-400">
            Палитраас сонгосон өнгө нь палитраа <b>дагаж</b> өөрчлөгдөнө. Доорх дурын өнгө
            бол палитраас хамааралгүй тогтмол утга.
          </p>

          <div className="mt-3.5">
            <ColorField
              label="Эсвэл дурын өнгө"
              value={value.color}
              onChange={(color) => set({ kind: "solid", color })}
              hint={
                value.kind === "solid"
                  ? "Идэвхтэй — палитр өөрчлөгдөхөд энэ хэсэг дагахгүй."
                  : "Өнгө сонгомогц энэ утга идэвхжинэ."
              }
            />
          </div>
        </div>
      )}

      {mode === "gradient" && (
        <GradientBuilder value={value.gradient} onChange={(gradient) => set({ gradient })} />
      )}

      {mode === "image" && (
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

      {/* Хөшиг. Кадртай хэсэгт энэ нь ХАЛЬСНЫ ТУН болж хувирдаг тул
          шошго, тайлбарыг нь тэр утгаар нь бичнэ (эс бөгөөс «0% үед
          хөшиг огт үүсэхгүй» гэсэн тайлбар худал болно — тэнд 0% нь
          «өгөгдмөл 55%» гэсэн үг). */}
      <div className="rounded-xl border border-neutral-200 p-4">
        <p className="mb-1 text-[13px] font-bold text-neutral-800">
          {film ? "Кадрын дээрх өнгөт хальс" : "Хөшиг — дэвсгэр дээр давхарлах"}
        </p>
        <p className="mb-3 text-[12px] leading-relaxed text-neutral-500">
          {film
            ? "Бичлэгийг бараантуулж, дээрх бичгийг уншигдахуйц болгоно."
            : "Зураг эсвэл градиентийг бараантуулж, бичгийг уншигдахуйц болгоно."}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            label="Хөшгийн өнгө"
            value={value.overlay.color}
            onChange={(color) => set({ overlay: { ...value.overlay, color } })}
            hint={
              film
                ? "Зөвхөн дэвсгэр нь «Өгөгдмөл» үед хэрэглэгдэнэ — өнгө/градиент сонгосон бол тэр нь хальс болно."
                : undefined
            }
          />
          <Field
            label={`Хүч — ${value.overlay.opacity}%`}
            hint={
              film
                ? "0% үед хальс өгөгдмөл 55% тунгаар буунa."
                : "0% үед хөшиг огт үүсэхгүй."
            }
          >
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

      {/* Бичгийн горим — зөвхөн ГАРААР тохируулах шаардлагатай үед. */}
      {showTone ? (
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
      ) : (
        <p className="text-[12px] leading-relaxed text-neutral-400">
          Бичгийн өнгө <b>автоматаар</b> тодорхойлогдоно — дэвсгэрийг хартай болгоход бичиг
          цайрч, цайвар болгоход бараантана.
        </p>
      )}

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
/* Типографи                                                           */
/* ------------------------------------------------------------------ */

/** Админ дээр дээж харуулахын тулд бүх сонгож болох фонтыг татна.
 *  (Зөвхөн энэ хуудсанд — нийтийн сайт зөвхөн СОНГОСОН фонтоо татна.) */
const SPECIMEN_HREF =
  "https://fonts.googleapis.com/css2?" +
  [...new Set([...DISPLAY_FONTS, ...BODY_FONTS].map((f) => f.google).filter(Boolean))]
    .map((f) => `family=${f}`)
    .join("&") +
  "&display=swap";

type TypePreset = { id: string; label: string; value: TypeContent };

const TYPE_PRESETS: TypePreset[] = [
  {
    id: "default",
    label: "Одоогийн (Gilroy)",
    value: { ...DEFAULT_THEME.type },
  },
  {
    id: "classic",
    label: "Сонгодог",
    value: {
      mode: "custom", displayFont: "cormorant", bodyFont: "onest",
      headingWeight: 400, headingTracking: 0.08, headingLeading: 1.02,
      headingUppercase: true, scale: 1,
    },
  },
  {
    id: "editorial",
    label: "Редакцийн",
    value: {
      mode: "custom", displayFont: "playfair", bodyFont: "golos",
      headingWeight: 400, headingTracking: 0.02, headingLeading: 1.05,
      headingUppercase: false, scale: 1,
    },
  },
  {
    id: "modern",
    label: "Орчин үеийн",
    value: {
      mode: "custom", displayFont: "jost", bodyFont: "manrope",
      headingWeight: 300, headingTracking: 0.14, headingLeading: 1.02,
      headingUppercase: true, scale: 1,
    },
  },
];

function stackOf(list: FontOption[], id: string): string {
  return (list.find((f) => f.id === id) ?? list[0]).stack;
}

function CyrillicBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold tracking-[0.04em] text-green-700">
      КИРИЛЛ ✓
    </span>
  );
}

/** Фонтыг ЖАГСААЛТААР — dropdown-д зөвхөн нэр харагдана, дизайнер
 *  сонгохоосоо өмнө үсгийг нь харах ёстой. Мөр бүрт латин + кирилл дээж. */
function FontList({
  fonts,
  value,
  onChange,
}: {
  fonts: FontOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {fonts.map((f) => {
        const on = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={`flex items-center gap-3.5 rounded-xl border px-4 py-3 text-left transition-colors ${
              on ? "border-2 border-[#2a5124] bg-[#2a5124]/5 px-[15px] py-[11px]" : "border-neutral-300 bg-white hover:bg-neutral-50"
            }`}
          >
            <span
              aria-hidden
              className={`h-4 w-4 shrink-0 rounded-full ${
                on ? "border-[5px] border-[#2a5124]" : "border border-neutral-300"
              }`}
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-bold text-neutral-900">{f.label}</span>
                <CyrillicBadge />
              </span>
              <span className="mt-0.5 block text-[12px] text-neutral-500">{f.note}</span>
            </span>
            <span className="shrink-0 text-right leading-[1.15]" style={{ fontFamily: f.stack }}>
              <span className="block text-[21px] text-neutral-900">Elysium</span>
              <span className="block text-[15px] text-neutral-500">Орон сууц</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: number[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
            o === value
              ? "border-[#2a5124] bg-[#2a5124]/5 text-[#2a5124]"
              : "border-neutral-300 text-neutral-500 hover:bg-neutral-50"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Нүүр дэлгэцийн бичгийг тухайн тохиргоогоор харуулах хар самбар. */
function TypePreview({ t }: { t: TypeContent }) {
  const display = stackOf(DISPLAY_FONTS, t.displayFont);
  const body = stackOf(BODY_FONTS, t.bodyFont);
  const custom = t.mode === "custom";
  return (
    <div className="overflow-hidden rounded-2xl bg-[#151717] px-5 py-6">
      <p
        className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/55"
        style={{ fontFamily: custom ? body : undefined }}
      >
        Бизнес зэрэглэлийн орон сууц
      </p>
      <p
        className="mt-3.5 text-white"
        style={{
          fontFamily: custom ? display : undefined,
          fontSize: `${Math.round(38 * (custom ? t.scale : 1))}px`,
          fontWeight: custom ? t.headingWeight : 500,
          letterSpacing: custom ? `${t.headingTracking}em` : "-0.2px",
          lineHeight: custom ? t.headingLeading : 1.05,
          textTransform: (custom ? t.headingUppercase : true) ? "uppercase" : "none",
        }}
      >
        Elysium Residence
      </p>
      <p
        className="mt-4 max-w-[44ch] leading-[1.7] text-white/[0.78]"
        style={{
          fontFamily: custom ? body : undefined,
          fontSize: `${Math.round(14 * (custom ? t.scale : 1))}px`,
        }}
      >
        Туул голын салхи илбэсэн бүсэд байршилтай, архитектур болон инженерингийн эргономик
        шийдэлтэй орон сууц.
      </p>
      <span
        className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#151717]"
        style={{ fontFamily: custom ? body : undefined }}
      >
        Уулзалт товлох
      </span>
    </div>
  );
}

export function TypePanel({
  value,
  onChange,
}: {
  value: TypeContent;
  onChange: (next: TypeContent) => void;
}) {
  /* Ямар нэг хөшүүрэг хөдөлмөгц `custom` руу шилжинэ — тэр мөчөөс
     эхлэн сайт дээр CSS үүсч, тохиргоо үйлчилнэ. */
  const set = (patch: Partial<TypeContent>) => onChange({ ...value, ...patch, mode: "custom" });
  const custom = value.mode === "custom";
  const activePreset = TYPE_PRESETS.find(
    (p) => JSON.stringify(p.value) === JSON.stringify(value)
  )?.id;

  return (
    <>
      {/* Админ дээр дээж харуулахад бүх фонт хэрэгтэй */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={SPECIMEN_HREF} />

      {/* Фонтын дээж. Жинхэнэ хуудсыг хажуугийн амьд preview харуулдаг
          тул энэ нь зөвхөн үсгийн ХЭЛБЭРИЙГ томоор үзүүлэх үүрэгтэй. */}
      <Card title="Фонтын дээж" right={<span className="text-xs text-neutral-400">Латин + кирилл</span>}>
        <TypePreview t={value} />
        <p className="mt-3.5 text-xs leading-relaxed text-neutral-400">
          Сонгосон фонт монгол бичигт хэрхэн буухыг эндээс шалгана.
          {!custom && " Одоо кодын өгөгдмөл хэвээр: сайт дээр нэмэлт CSS, нэмэлт фонт татагдахгүй."}
        </p>
      </Card>

      <Card title="Бэлэн хослол">
        <p className="mb-3.5 text-[13px] leading-relaxed text-neutral-500">
          Нэг товчоор фонт, жин, үсэг хоорондын зайг хамт сольж, дараа нь доор гараар засна.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {TYPE_PRESETS.map((p) => {
            const on = activePreset === p.id;
            const d = stackOf(DISPLAY_FONTS, p.value.displayFont);
            const b = stackOf(BODY_FONTS, p.value.bodyFont);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ ...p.value })}
                className={`flex flex-col gap-2 rounded-xl border px-4 py-3 text-left transition-colors ${
                  on ? "border-2 border-[#2a5124] bg-[#2a5124]/5 px-[15px] py-[11px]" : "border-neutral-300 bg-white hover:bg-neutral-50"
                }`}
              >
                <span
                  className="text-[24px] leading-none text-neutral-900"
                  style={{
                    fontFamily: d,
                    fontWeight: p.value.headingWeight,
                    letterSpacing: `${p.value.headingTracking}em`,
                    textTransform: p.value.headingUppercase ? "uppercase" : "none",
                  }}
                >
                  Elysium
                </span>
                <span className="text-[12px] text-neutral-500" style={{ fontFamily: b }}>
                  Орон сууц
                </span>
                <span className={`text-[12px] font-bold ${on ? "text-[#2a5124]" : "text-neutral-700"}`}>
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Фонт" right={<span className="text-xs text-neutral-400">{DISPLAY_FONTS.length + BODY_FONTS.length} сонголт</span>}>
        <Field
          label="Гарчгийн фонт"
          hint="Брэндийн нэр, хэсгийн гарчиг. Жагсаалтад ЗӨВХӨН кирилл дэмждэг фонт орсон — эс бөгөөс монгол бичиг системийн фонт руу унана."
        >
          <div className="mt-1.5">
            <FontList fonts={DISPLAY_FONTS} value={value.displayFont} onChange={(displayFont) => set({ displayFont })} />
          </div>
        </Field>
        <div className="h-5" />
        <Field label="Бичвэрийн фонт" hint="Тайлбар, жагсаалт, товчны бичиг.">
          <div className="mt-1.5">
            <FontList fonts={BODY_FONTS} value={value.bodyFont} onChange={(bodyFont) => set({ bodyFont })} />
          </div>
        </Field>
      </Card>

      <Card title="Гарчгийн шинж">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Жин" hint="300 = тансаг · 700 = корпоратив">
            <div className="mt-1.5">
              <Segmented
                options={[300, 400, 500, 700, 800]}
                value={value.headingWeight}
                onChange={(headingWeight) => set({ headingWeight })}
              />
            </div>
          </Field>
          <Field label={`Үсэг хоорондын зай — ${value.headingTracking > 0 ? "+" : ""}${value.headingTracking}em`}>
            <input
              type="range"
              min={-0.03}
              max={0.2}
              step={0.005}
              value={value.headingTracking}
              onChange={(e) => set({ headingTracking: Number(e.target.value) })}
              className="w-full accent-[#2a5124]"
            />
          </Field>
          <Field label={`Мөрийн өндөр — ${value.headingLeading}`}>
            <input
              type="range"
              min={0.95}
              max={1.2}
              step={0.01}
              value={value.headingLeading}
              onChange={(e) => set({ headingLeading: Number(e.target.value) })}
              className="w-full accent-[#2a5124]"
            />
          </Field>
          <Field label="Хэлбэр">
            <div className="mt-2.5">
              <Toggle
                checked={value.headingUppercase}
                onChange={(headingUppercase) => set({ headingUppercase })}
                label="Том үсгээр бичих"
              />
            </div>
          </Field>
        </div>
      </Card>

      <Card title="Ерөнхий хэмжээ">
        <Field
          label={`Коэффициент — ${value.scale.toFixed(2)}×`}
          hint="Бүх шатлал ХАМТ томорно/жижигрэнэ — тус тусад нь биш. Ингэснээр шатлал хоорондын харьцаа хэзээ ч эвдрэхгүй."
        >
          <input
            type="range"
            min={0.9}
            max={1.15}
            step={0.01}
            value={value.scale}
            onChange={(e) => set({ scale: Number(e.target.value) })}
            className="w-full accent-[#2a5124]"
          />
        </Field>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-neutral-200 pt-3.5 text-xs text-neutral-500">
          {[
            ["H1 (hero)", 73.6],
            ["H2 (хэсэг)", 44.8],
            ["Тайлбар", 16],
          ].map(([label, base]) => (
            <span key={label as string}>
              {label} <b className="text-neutral-900">{Math.round((base as number) * value.scale)}px</b>
            </span>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4">
        <Button type="button" variant="ghost" onClick={() => onChange({ ...DEFAULT_THEME.type })}>
          Типографийг өгөгдмөл рүү буцаах
        </Button>
        {custom && (
          <span className="text-xs text-neutral-400">
            Одоо тохируулсан горимд — сайт дээр нэмэлт CSS үүснэ.
          </span>
        )}
      </div>
    </>
  );
}


/* ------------------------------------------------------------------ */
/* Шилэн гадаргуу                                                      */
/* ------------------------------------------------------------------ */

const GLASS_PRESETS: { id: string; label: string; value: GlassContent }[] = [
  { id: "off", label: "Унтраах", value: { mode: "off", blur: 20, saturation: 165 } },
  { id: "soft", label: "Зөөлөн", value: { mode: "custom", blur: 12, saturation: 130 } },
  { id: "default", label: "Энгийн", value: { mode: "default", blur: 20, saturation: 165 } },
  { id: "strong", label: "Тод", value: { mode: "custom", blur: 30, saturation: 200 } },
];

/** Шилний тохиргоог ЖИНХЭНЭ `.glass` классаар харуулна — админы CSS
 *  нь сайттай нэг globals.css тул preview нь бодит үр дүн. */
function GlassPreview({ g }: { g: GlassContent }) {
  const off = g.mode === "off";
  const vars =
    g.mode === "custom"
      ? ({ "--glass-blur": `${g.blur}px`, "--glass-sat": `${g.saturation}%` } as React.CSSProperties)
      : undefined;
  return (
    <div
      style={vars}
      className="relative overflow-hidden rounded-2xl"
      aria-hidden
    >
      {/* Ард нь өнгөт зураас — шил ажиллаж байгаа эсэхийг эндээс харна */}
      <div className="h-[128px] w-full bg-[linear-gradient(115deg,#2a5124_0%,#b4d656_28%,#f4f4f1_52%,#151717_78%,#3f6a33_100%)]" />
      <div className="absolute inset-0 flex items-center justify-center gap-3">
        <span
          className={`rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-neutral-900 ${
            off ? "bg-white/96" : "glass glass-chip"
          }`}
        >
          Цайвар шил
        </span>
        <span
          className={`rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-white ${
            off ? "bg-[#151717]/[0.86]" : "glass-dark glass-chip"
          }`}
        >
          Хар шил
        </span>
      </div>
    </div>
  );
}

export function GlassPanel({
  value,
  onChange,
}: {
  value: GlassContent;
  onChange: (next: GlassContent) => void;
}) {
  const active = GLASS_PRESETS.find(
    (p) => JSON.stringify(p.value) === JSON.stringify(value)
  )?.id;
  const custom = value.mode === "custom";

  return (
    <Card
      title="Шилэн гадаргуу"
      right={<span className="text-xs text-neutral-400">Толгой, тэмдэг, товч, pop-up</span>}
    >
      <p className="mb-3.5 text-[13px] leading-relaxed text-neutral-500">
        Зураг, кадрын дээр суудаг гадаргуунуудын тунгалаг байдал. Ханалт нь хамгийн чухал: зөвхөн
        бүдгэрүүлэлт бол манан, ханалт нэмэхэд шил болно.
      </p>

      <GlassPreview g={value} />

      <div className="mt-4 flex flex-wrap gap-1.5">
        {GLASS_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange({ ...p.value })}
            className={`rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
              active === p.id
                ? "border-[#2a5124] bg-[#2a5124]/5 text-[#2a5124]"
                : "border-neutral-300 text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {value.mode !== "off" && (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label={`Бүдгэрүүлэлт — ${value.blur}px`}>
            <input
              type="range"
              min={4}
              max={40}
              step={1}
              value={value.blur}
              onChange={(e) => onChange({ ...value, mode: "custom", blur: Number(e.target.value) })}
              className="w-full accent-[#2a5124]"
            />
          </Field>
          <Field label={`Ханалт — ${value.saturation}%`} hint="100% = өнгө нэмэхгүй (манан). 165% = шил.">
            <input
              type="range"
              min={100}
              max={220}
              step={5}
              value={value.saturation}
              onChange={(e) =>
                onChange({ ...value, mode: "custom", saturation: Number(e.target.value) })
              }
              className="w-full accent-[#2a5124]"
            />
          </Field>
        </div>
      )}

      <p className="mt-4 border-t border-neutral-200 pt-3.5 text-xs leading-relaxed text-neutral-400">
        {value.mode === "off"
          ? "Шил унтраалттай — гадаргуунууд дүүргэлттэй болно."
          : custom
            ? "Тохируулсан горим — сайт дээр нэмэлт CSS үүснэ."
            : "Өгөгдмөл горим — сайт дээр нэмэлт CSS үүсэхгүй."}{" "}
        Тунгалаг байдлыг багасгах тохиргоотой (`prefers-reduced-transparency`) хэрэглэгч энэ
        тохиргооноос үл хамааран дүүргэлттэй хувилбар авна.
      </p>
    </Card>
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
/* Палитрын мөр                                                        */
/* ------------------------------------------------------------------ */

/** Палитрын нэг өнгө. Нэрийг нь ойлгуулах гол зүйл бол ХААНА
 *  хэрэглэгддгийг нь бичих — «Гүн тодруулга» гэдэг үг өөрөө юу ч
 *  хэлэхгүй. Үлдсэнийг хажуугийн амьд preview харуулна. */
type PaletteRole = {
  key: keyof ThemeContent["palette"];
  label: string;
  where: string;
  /** Тодролыг шалгах хос: энэ өнгө дээр ямар өнгө буудаг вэ. */
  contrast?: { fg: keyof ThemeContent["palette"]; bg: keyof ThemeContent["palette"] };
};

const PALETTE_ROLES: PaletteRole[] = [
  {
    key: "ground",
    label: "Хуудасны дэвсгэр",
    where: "Бараг бүх хэсгийн цаад өнгө — цайвар «цаас».",
    contrast: { fg: "dark", bg: "ground" },
  },
  {
    key: "surface",
    label: "Карт, самбарын өнгө",
    where: "Өрөөний карт, менежерийн карт, pop-up, маягтын талбар.",
    contrast: { fg: "dark", bg: "surface" },
  },
  {
    key: "dark",
    label: "Бичиг ба хар хэсэг",
    where: "Гарчиг, үндсэн бичвэр, хар товч, хөл хэсгийн дэвсгэр.",
  },
  {
    key: "muted",
    label: "Туслах бүдэг бичиг",
    where: "Тайлбар, шошго, тоон нэгж — гол биш, дэмжих бичиг.",
    contrast: { fg: "muted", bg: "ground" },
  },
  {
    key: "accent",
    label: "Тодруулга (тод ногоон)",
    where: "Гарчгийн өмнөх зураас, идэвхтэй цэг, гүйдэг мөр, hover.",
  },
  {
    key: "accentDeep",
    label: "Гүн тодруулга",
    where: "Ногоон товч, холбоос, диаграмын гүн өнгө.",
    contrast: { fg: "accentDeep", bg: "ground" },
  },
  {
    key: "film",
    label: "Бичлэгийн хөшиг",
    where: "Нүүр дэлгэц, 01 ба 03-ын кадрын дээр буух өнгөт хальс.",
  },
];

function PaletteRow({
  role,
  palette,
  onChange,
}: {
  role: PaletteRole;
  palette: ThemeContent["palette"];
  onChange: (next: string) => void;
}) {
  const value = palette[role.key];
  return (
    <div className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3">
      <input
        type="color"
        aria-label={role.label}
        value={normalizeHex(value)}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-neutral-300 bg-white p-1"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-[14px] font-bold text-neutral-900">{role.label}</span>
          {role.contrast && (
            <ContrastNote fg={palette[role.contrast.fg]} bg={palette[role.contrast.bg]} />
          )}
        </div>
        <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-500">{role.where}</p>
        <TextInput
          value={value}
          placeholder="#f4f4f1"
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 max-w-[150px] py-1.5 text-[13px]"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Дизайны бүрэн самбар                                                */
/* ------------------------------------------------------------------ */

/* Дөрвөн алхам — дизайнерын бодох дараалал:
   өнгө → бичиг → хэсэг тус бүрийн дэвсгэр → эффект.
   (Өмнө нь «Дэвсгэр» табанд шил, хуудасны суурь, 15 хэсэг гурвуулаа
   хамт байсан нь юуг нь эхлэхийг ойлгомжгүй болгож байв.) */
const DESIGN_TABS = [
  { id: "color", label: "1 · Өнгө", hint: "Брэндийн палитр" },
  { id: "type", label: "2 · Бичиг", hint: "Фонт, гарчгийн шинж" },
  { id: "sections", label: "3 · Хэсгүүд", hint: "Хэсэг бүрийн дэвсгэр" },
  { id: "effects", label: "4 · Эффект", hint: "Шил, хуудасны суурь" },
] as const;

type DesignTab = (typeof DESIGN_TABS)[number]["id"];

export function DesignPanel({
  theme,
  onChange,
}: {
  theme: ThemeContent;
  onChange: (next: ThemeContent) => void;
}) {
  const [open, setOpen] = useState<ThemeSectionId | null>(null);
  const [tab, setTab] = useState<DesignTab>("color");
  const p = theme.palette;

  const setPalette = (patch: Partial<ThemeContent["palette"]>) =>
    onChange({ ...theme, palette: { ...p, ...patch } });

  const setSection = (id: ThemeSectionId, bg: Background) =>
    onChange({ ...theme, sections: { ...theme.sections, [id]: bg } });

  /** Тухайн хэсэг өгөгдмөлөөсөө өөрчлөгдсөн эсэх — жагсаалтад тэмдэглэнэ. */
  const changed = (bg: Background) =>
    JSON.stringify(bg) !== JSON.stringify(defaultBackground());

  /* Юу нь өгөгдмөлөөс салсныг НЭГ мөрөнд. Дизайны тохиргоо олон
     давхаргатай тул «би юу өөрчилсөн бэ?» гэдэг хамгийн түгээмэл
     төөрөгдөл байдаг. */
  const diff = useMemo(() => {
    const out: string[] = [];
    const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
    if (!same(theme.palette, DEFAULT_THEME.palette)) out.push("өнгө");
    if (theme.type.mode !== "default") out.push("бичиг");
    const n = THEME_SECTIONS.filter((s) => changed(theme.sections[s.id])).length;
    if (n) out.push(`${n} хэсгийн дэвсгэр`);
    if (theme.glass.mode !== "default") out.push("шил");
    if (changed(theme.page)) out.push("хуудасны суурь");
    return out;
  }, [theme]);

  /* Хэсэг сонгосон үед preview тийш нь гүйнэ. Бусад табд эхнээс нь. */
  const focus = tab === "sections" ? open : null;

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(340px,400px)_minmax(0,1fr)] xl:items-start">
      {/* Preview — нарийн дэлгэцэд ДЭЭРЭЭ, өргөнд баруун талд наалдана. */}
      <div className="min-w-0 xl:sticky xl:top-[84px] xl:order-2">
        <ThemePreview theme={theme} focus={focus} />
      </div>

      <div className="min-w-0 space-y-5 xl:order-1">
        <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
          {/* Хоёр багана — хөшүүргийн багана нарийн (≈360px) тул дөрөв
              багтахгүй. `sm:` нь дэлгэцээр хэмждэг тул энд ашиглахгүй. */}
          <div className="grid grid-cols-2 gap-1.5">
            {DESIGN_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
                  tab === t.id
                    ? "border-[#2a5124] bg-[#2a5124]/5"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <span
                  className={`block text-[13px] font-bold ${
                    tab === t.id ? "text-[#2a5124]" : "text-neutral-700"
                  }`}
                >
                  {t.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-tight text-neutral-400">
                  {t.hint}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-2.5">
            <span className="text-[12px] text-neutral-500">
              {diff.length ? (
                <>
                  Өгөгдмөлөөс өөрчлөгдсөн: <b className="text-neutral-800">{diff.join(" · ")}</b>
                </>
              ) : (
                "Бүх тохиргоо өгөгдмөл — сайт кодод бичсэн дүр төрхөөрөө."
              )}
            </span>
            {diff.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="ml-auto px-2.5 py-1 text-[12px]"
                onClick={() => {
                  if (confirm("Дизайны БҮХ тохиргоог өгөгдмөл рүү буцаах уу?")) {
                    onChange(structuredClone(DEFAULT_THEME));
                  }
                }}
              >
                Бүгдийг өгөгдмөл рүү
              </Button>
            )}
          </div>
        </div>

        {tab === "type" && (
          <TypePanel value={theme.type} onChange={(type) => onChange({ ...theme, type })} />
        )}

        {tab === "color" && (
          <>
            <Card title="Бэлэн палитр">
              <p className="mb-3 text-[13px] leading-relaxed text-neutral-500">
                Нэг товчоор бүх өнгийг сольж, дараа нь доор гараар засна.
              </p>
              <div className="flex flex-wrap gap-2">
                {PALETTE_PRESETS.map((preset) => {
                  const on = JSON.stringify(preset.palette) === JSON.stringify(p);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onChange({ ...theme, palette: preset.palette })}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-semibold transition-colors ${
                        on
                          ? "border-[#2a5124] bg-[#2a5124]/5 text-[#2a5124]"
                          : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <span className="flex">
                        {[
                          preset.palette.ground,
                          preset.palette.surface,
                          preset.palette.dark,
                          preset.palette.accent,
                        ].map((c) => (
                          <span
                            key={c}
                            style={{ background: c }}
                            className="h-5 w-5 rounded-full border border-black/10 [&:not(:first-child)]:-ml-1.5"
                          />
                        ))}
                      </span>
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card title="Өнгө бүр хаана хэрэглэгддэг вэ">
              <div className="space-y-2">
                {PALETTE_ROLES.map((role) => (
                  <PaletteRow
                    key={role.key}
                    role={role}
                    palette={p}
                    onChange={(v) => setPalette({ [role.key]: v })}
                  />
                ))}
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
          </>
        )}

        {tab === "sections" && (
          <Card title="Хэсэг тус бүрийн дэвсгэр">
            <p className="mb-4 text-[13px] leading-relaxed text-neutral-500">
              Хэсгийг дарахад баруун талын preview тийш нь гүйж, хүрээгээр тэмдэглэнэ.
              «Өгөгдмөл» үед тухайн хэсэг кодод бичсэн өнгөөрөө үлдэнэ.
            </p>
            <ul className="space-y-2">
              {THEME_SECTIONS.map((s) => {
                const bg = theme.sections[s.id];
                const isOpen = open === s.id;
                const isFilm = "film" in s && Boolean(s.film);
                return (
                  <li key={s.id} className="overflow-hidden rounded-xl border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : s.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isOpen ? "bg-[#2a5124]/5" : "bg-neutral-50 hover:bg-neutral-100"
                      }`}
                    >
                      <span
                        aria-hidden
                        style={{ ...backgroundStyle(bg, p), backgroundSize: "cover" }}
                        className="h-8 w-12 shrink-0 rounded-md border border-neutral-300 bg-white"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5 text-[14px] font-bold text-neutral-900">
                          {s.label}
                          {changed(bg) && (
                            <span
                              aria-hidden
                              title="Өөрчлөгдсөн"
                              className="h-1.5 w-1.5 rounded-full bg-amber-500"
                            />
                          )}
                          {isFilm && (
                            <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.02em] text-neutral-600">
                              БИЧЛЭГ ДЭЭР
                            </span>
                          )}
                        </span>
                        {s.hint && <span className="block text-[11px] text-neutral-400">{s.hint}</span>}
                      </span>
                      <span aria-hidden className="shrink-0 text-neutral-400">
                        {isOpen ? "▾" : "▸"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-neutral-200 p-4">
                        {isFilm && (
                          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-800">
                            Энэ хэсгийг бичлэг/кадар бүтэн бүрхдэг. Сонгосон өнгө, градиент
                            нь <b>кадрын ДЭЭР</b> буух өнгөт хальс болж буунa (өгөгдмөл тун
                            55%). Тунг «Хүч» гүйлгүүрээр тохируулна.
                          </p>
                        )}
                        <BackgroundField
                          value={bg}
                          palette={p}
                          film={isFilm}
                          manualTone={"manualTone" in s ? Boolean(s.manualTone) : false}
                          onChange={(next) => setSection(s.id, next)}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        {tab === "effects" && (
          <>
            <GlassPanel value={theme.glass} onChange={(glass) => onChange({ ...theme, glass })} />

            <Card title="Хуудасны суурь өнгө">
              <p className="mb-4 text-[13px] leading-relaxed text-neutral-500">
                Хуудсыг эхлэл эсвэл төгсгөлөөс нь цааш чангаахад (bounce) хормын зуур
                харагддаг өнгө. Ихэвчлэн хуудасны дэвсгэртэй ижил байлгана.
              </p>
              <BackgroundField
                value={theme.page}
                palette={p}
                onChange={(page) => onChange({ ...theme, page })}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
