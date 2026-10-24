"use client";

/* Explorer-ийн UI суурь элементүүд. Бүх хэмжээ rem-ээр (kiosk-д
   үндсэн фонтыг томруулахад жигд томроно), өнгө — брэндийн токен. */

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { STATUS_META } from "@/lib/explore/config";
import type { Status } from "@/lib/explore/types";
import { cn } from "@/lib/utils";

type IconName =
  | "back"
  | "home"
  | "close"
  | "arrow"
  | "walk"
  | "plan"
  | "phone"
  | "qr"
  | "compare"
  | "pin"
  | "up"
  | "down"
  | "sun"
  | "car"
  | "check"
  | "chevron";

const PATHS: Record<IconName, string> = {
  back: "M15 18l-6-6 6-6",
  home: "M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10",
  close: "M6 6l12 12M18 6 6 18",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  walk: "M13 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM10 21l2-6 3 3v3m-3-6-1-5 4 2 2 3M9 10l-2 4",
  plan: "M4 4h16v16H4zM4 12h7m4 0h5M11 4v5m0 4v7",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2m-6 4v2m4-2h2v2h-2",
  compare: "M8 4v16M16 4v16M4 8h4M16 8h4M4 16h4m8 0h4",
  pin: "M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  up: "M6 15l6-6 6 6",
  down: "M6 9l6 6 6-6",
  sun: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 1v3m0 16v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M1 12h3m16 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  car: "M5 17h14v-4l-2-5H7l-2 5v4Zm0 0v2m14-2v2M7.5 14h.01M16.5 14h.01",
  check: "M5 12.5 10 17l9-10",
  chevron: "M9 6l6 6-6 6",
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-[1.1em] w-[1.1em] shrink-0", className)}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "dark" | "ghost" | "soft";
  size?: "sm" | "md" | "lg";
};

export function Btn({ tone = "soft", size = "md", className, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-night",
        size === "sm" && "min-h-9 px-3.5 text-xs",
        size === "md" && "min-h-11 px-5 text-sm",
        size === "lg" && "min-h-13 px-6 text-base",
        tone === "primary" && "bg-lime text-night hover:brightness-95",
        tone === "dark" && "bg-night text-white hover:bg-[#24443a]",
        tone === "ghost" && "text-night hover:bg-night/5",
        tone === "soft" && "bg-night/5 text-night hover:bg-night/10",
        className
      )}
    />
  );
}

export function Chip({
  active,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      {...rest}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition duration-200",
        active
          ? "border-night bg-night text-white"
          : "border-night/15 bg-white/70 text-night hover:border-night/40",
        className
      )}
    />
  );
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-night/10 bg-white/80 px-2.5 py-1 text-xs font-bold text-night",
        className
      )}
    >
      <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-night/30" style={{ background: meta.ui }} />
      {meta.label}
    </span>
  );
}

export function StatusDot({ status }: { status: Status }) {
  return (
    <span
      aria-label={STATUS_META[status].label}
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-night/30"
      style={{ background: STATUS_META[status].ui }}
    />
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-caps text-moss">
      <span aria-hidden className="h-px w-5 bg-moss" />
      {children}
    </p>
  );
}

export function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-night/[0.04] px-3 py-2.5">
      <p className="text-xs font-semibold text-mist">{label}</p>
      <p className="mt-0.5 text-base font-extrabold tabular-nums text-night">{value}</p>
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mt-5 mb-2 flex items-center justify-between gap-3">
      <h3 className="text-xs font-bold uppercase tracking-caps-sm text-mist">{children}</h3>
      {aside}
    </div>
  );
}

/** Модал — explorer-ийн бүрхүүл рүү portal хийнэ (Esc, дэвсгэр дээр дарж хаана). */
export function Sheet({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const first = panel.current?.querySelector<HTMLElement>("input, button, textarea, select, a[href]");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  const host = document.querySelector(".explore-shell") ?? document.body;
  return createPortal(
    <div className="pointer-events-auto fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Хаах" onClick={onClose} className="absolute inset-0 bg-night/45 backdrop-blur-[2px]" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={cn(
          "explore-enter explore-scroll relative max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-2xl sm:rounded-3xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-md"
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={id} className="text-xl font-extrabold leading-tight text-night">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Хаах"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-night/5 text-night hover:bg-night/10"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    host
  );
}
