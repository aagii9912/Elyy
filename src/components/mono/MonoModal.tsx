"use client";

/* /mono — хуудсын бүх pop-up-ын нэгдсэн бүрхүүл (материал, өрөөний
   хүсэлт, танилцуулга татах, VR аялал).

   Нэг дор хийж өгдөг зүйлс:
     • Lenis-ийн гүйлтийг зогсоож, хаагдахад сэргээнэ,
     • Esc товч ба дэвсгэр дээр дарахад хаана,
     • нээгдэхэд фокусыг дотогш, хаагдахад буцаан өгнө (Tab дотор эргэлдэнэ),
     • prefers-reduced-motion үед нээлтийн хөдөлгөөнийг хийхгүй.
   Гар утсанд доороос гарч ирдэг хуудас (sheet), дэлгэц томрох тусам
   голлосон карт болно. */

import { useCallback, useEffect, useId, useRef } from "react";
import { useLenis } from "lenis/react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MonoModal({
  open,
  onClose,
  label,
  children,
  size = "md",
  closeLabel = "Хаах",
}: {
  open: boolean;
  onClose: () => void;
  /** Дэлгэц уншигчид зориулсан гарчиг. */
  label: string;
  children: React.ReactNode;
  size?: "md" | "lg" | "full";
  closeLabel?: string;
}) {
  const lenis = useLenis();
  const panel = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement | null;
    lenis?.stop();
    /* Lenis байхгүй үед (эсвэл reduced-motion) native гүйлтийг барина. */
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first = panel.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (!nodes.length) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
      restore.current?.focus?.();
    };
  }, [open, lenis, close]);

  if (!open) return null;

  const width =
    size === "full" ? "max-w-[1400px]" : size === "lg" ? "max-w-3xl" : "max-w-lg";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-labelledby={titleId}
      className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center"
      onClick={close}
    >
      <div aria-hidden className="mono-modal-veil absolute inset-0 bg-night/60 backdrop-blur-sm" />

      <div
        ref={panel}
        onClick={(e) => e.stopPropagation()}
        className={`mono-modal-panel relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface text-night shadow-[0_40px_120px_-40px_rgba(21,23,23,0.7)] sm:max-h-[88svh] sm:rounded-3xl ${width}`}
      >
        {/* гар утсанд чирэх мэдрэмж өгөх бариул */}
        <span aria-hidden className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-night/15 sm:hidden" />

        <button
          type="button"
          onClick={close}
          data-cursor-hover
          aria-label={closeLabel}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-night/12 bg-surface/90 text-night backdrop-blur transition-colors hover:bg-night hover:text-white"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div id={titleId} className="sr-only">
          {label}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
