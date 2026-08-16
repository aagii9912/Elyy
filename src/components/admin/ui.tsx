"use client";

/* Админ UI-ийн дахин ашиглагдах жижиг блокууд.
   Маркетингийн брэнд бус — цэвэрхэн, ажлын хэрэгслийн загвар. */

import { forwardRef, useRef, useState } from "react";
import { uploadFile } from "./upload";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "dark";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<string, string> = {
    primary: "bg-[#2a5124] text-white hover:bg-[#1f3d1b]",
    dark: "bg-night text-white hover:bg-black",
    ghost: "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-400">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-[15px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#2a5124] focus:ring-2 focus:ring-[#2a5124]/15";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

/* ref-ийг дамжуулна — нийтлэлийн засварлагч курсорын байрлалд зураг
   оруулахдаа textarea-д шууд хандах шаардлагатай. */
export const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea(props, ref) {
    return <textarea ref={ref} {...props} className={`${inputCls} resize-y ${props.className ?? ""}`} />;
  }
);

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 text-sm font-medium text-neutral-700"
    >
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-[#2a5124]" : "bg-neutral-300"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </span>
      {label}
    </button>
  );
}

export function Card({ title, children, right }: { title?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-neutral-900">{title}</h3>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

/** `"4/3"` → санал болгох пиксел хэмжээ (урт тал нь `maxEdge`). */
function recommendedSize(ratio: string, maxEdge: number): { w: number; h: number } {
  const [rw, rh] = ratio.split("/").map((n) => Number(n) || 1);
  return rw >= rh
    ? { w: maxEdge, h: Math.round((maxEdge * rh) / rw) }
    : { w: Math.round((maxEdge * rw) / rh), h: maxEdge };
}

/** Зураг байршуулах талбар — /api/admin/upload руу upload хийж URL авна.
 *  Илгээхийн өмнө зургийг `maxEdge` хүртэл багасгана; санал болгох хэмжээ,
 *  харьцааг талбар дээрээ өөрөө бичиж харуулна. Upload бүтэхгүй тохиолдолд
 *  (Supabase тохируулаагүй г.м.) хаягийг гараар бичиж болно. */
export function ImageField({
  label,
  value,
  onChange,
  hint,
  ratio = "16/9",
  maxEdge = 1600,
  fit = "cover",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  /** Талбарын харьцаа — ж: `"4/3"`, `"3/4"`, `"1/1"`. */
  ratio?: string;
  /** Хадгалах дээд хэмжээ (уртаашаа пиксел). */
  maxEdge?: number;
  /** Тунгалаг дэвсгэртэй зурагт `contain` тохиромжтой. */
  fit?: "cover" | "contain";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [manual, setManual] = useState(false);

  const { w, h } = recommendedSize(ratio, maxEdge);
  const sizeNote = `Санал болгох ${w}×${h}px (${ratio.replace("/", ":")}) · JPG, PNG эсвэл WebP · том зураг автоматаар багасна`;

  const upload = async (file: File) => {
    setBusy(true);
    setErr(null);
    const res = await uploadFile(file, { maxEdge });
    if (res.ok) onChange(res.url);
    else {
      setErr(res.error);
      setManual(true); // upload унасан — гар аргыг шууд нээнэ
    }
    setBusy(false);
  };

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">{label}</span>
      <div
        style={{ aspectRatio: ratio }}
        className="relative overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
            {busy ? "Байршуулж байна…" : "Зураг алга"}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? "Түр хүлээнэ үү…" : value ? "Солих" : "Зураг оруулах"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setManual((v) => !v)}>
          {manual ? "Хаягийг нуух" : "Хаягаар оруулах"}
        </Button>
        {value && (
          <Button type="button" variant="danger" onClick={() => onChange("")}>
            Устгах
          </Button>
        )}
      </div>
      {manual && (
        <div className="mt-2">
          <TextInput
            value={value}
            placeholder="/images/axono/a-01.jpg"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
      <span className="mt-1 block text-xs text-neutral-400">{sizeNote}</span>
      {hint && <span className="mt-0.5 block text-xs text-neutral-400">{hint}</span>}
      {err && <span className="mt-1 block text-xs text-red-500">{err}</span>}
    </div>
  );
}

/** Storage-д давхцахгүй байлгах үүднээс нэмсэн угтвар (uuid / timestamp). */
const KEY_PREFIX =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d{13}-[0-9a-f]{8})-/i;

/** URL-аас уншигдахуйц файлын нэр (`…/1786-ab12-brochure.pdf` → `brochure.pdf`). */
function fileNameOf(url: string): string {
  const clean = url.split(/[?#]/)[0];
  let base = clean.split("/").pop() || url;
  try {
    base = decodeURIComponent(base);
  } catch {
    /* хөрвүүлэлт бүтэхгүй бол түүхий нэрээр */
  }
  return base.replace(KEY_PREFIX, "") || base;
}

/** Баримт (PDF) хавсаргах талбар — танилцуулга г.м.
 *  Том файлыг Storage руу шууд илгээнэ; хаягийг гараар ч бичиж болно. */
export function FileField({
  label,
  value,
  onChange,
  hint,
  accept = "application/pdf",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [manual, setManual] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    setErr(null);
    const res = await uploadFile(file);
    if (res.ok) onChange(res.url);
    else {
      setErr(res.error);
      setManual(true);
    }
    setBusy(false);
  };

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">{label}</span>
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3">
        <span aria-hidden className="text-lg">
          📄
        </span>
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate text-sm font-semibold text-[#2a5124] underline underline-offset-2"
          >
            {fileNameOf(value)}
          </a>
        ) : (
          <span className="flex-1 text-xs text-neutral-400">
            {busy ? "Байршуулж байна…" : "Файл хавсаргаагүй"}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? "Түр хүлээнэ үү…" : value ? "Солих" : "Файл хавсаргах"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setManual((v) => !v)}>
          {manual ? "Хаягийг нуух" : "Хаягаар оруулах"}
        </Button>
        {value && (
          <Button type="button" variant="danger" onClick={() => onChange("")}>
            Устгах
          </Button>
        )}
      </div>
      {manual && (
        <div className="mt-2">
          <TextInput
            value={value}
            placeholder="/brochure.pdf"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
      <span className="mt-1 block text-xs text-neutral-400">
        PDF · хэмжээний хязгаар байхгүй (3.5MB-аас том файл Storage руу шууд илгээгдэнэ)
      </span>
      {hint && <span className="mt-0.5 block text-xs text-neutral-400">{hint}</span>}
      {err && <span className="mt-1 block text-xs text-red-500">{err}</span>}
    </div>
  );
}
