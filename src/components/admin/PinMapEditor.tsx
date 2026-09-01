"use client";

/* /admin/site → Байршил — цэгүүдийг ЗУРАГ ДЭЭР НЬ чирж байрлуулах.

   Цэгийн `x`/`y` нь зургийн өргөн/өндрийн хувь (0–100). Хайрцаг нь
   зургийг энгийн урсгалаар (`block w-full`) агуулдаг тул ХАРЬЦААГ
   таамаглах шаардлагагүй — хайрцаг үргэлж зургийн яг харьцаатай байна,
   ингэснээр админ дээр байрлуулсан цэг сайт дээр яг тэр газраа буудаг.

   Удирдлага: цэгийг чирнэ / зурган дээр дарж сонгосон цэгээ зөөнө /
   сумны товчоор 0.5%-аар (Shift-тэй 0.1%) нарийвчилна. */

import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/lib/site-content";

type Pin = SiteContent["location"]["pins"][number];

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n * 10) / 10));

export function PinMapEditor({
  image,
  pins,
  onChange,
}: {
  image: string;
  pins: Pin[];
  onChange: (next: Pin[]) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState(0);
  /* Чирсэн эсэх — чирсний дараа гарах `click`-ийг залгиж, цэг хоёр
     дахин үсрэхээс сэргийлнэ. */
  const dragged = useRef(false);
  /* Идэвхтэй чирэлтийг зогсоох функц — unmount дээр цэвэрлэнэ. */
  const stopDrag = useRef<(() => void) | null>(null);

  useEffect(() => () => stopDrag.current?.(), []);

  const move = (i: number, clientX: number, clientY: number) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return;
    const x = clamp(((clientX - box.left) / box.width) * 100);
    const y = clamp(((clientY - box.top) / box.height) * 100);
    onChange(pins.map((p, j) => (j === i ? { ...p, x, y } : p)));
  };

  /* Чирэлт — `setPointerCapture` зарим хөтөч/оролтод найдваргүй тул
     window дээр сонсоно: хулгана зургаас гарсан ч цэг дагана. */
  const startDrag = (i: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSel(i);
    dragged.current = false;
    stopDrag.current?.();

    const onMove = (ev: PointerEvent) => {
      dragged.current = true;
      move(i, ev.clientX, ev.clientY);
    };
    const end = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      stopDrag.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    stopDrag.current = end;
  };

  const nudge = (i: number, dx: number, dy: number) => {
    onChange(
      pins.map((p, j) => (j === i ? { ...p, x: clamp(p.x + dx), y: clamp(p.y + dy) } : p))
    );
  };

  if (!image) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
        Эхлээд дээрх «Байршлын зураг» талбарт зураг байршуулна уу — дараа нь цэгүүдийг
        зураг дээр нь чирж байрлуулна.
      </p>
    );
  }

  const active = pins[sel];

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-body">
        <span className="font-semibold text-neutral-700">
          {active ? `Сонгосон: ${sel + 1} · ${active.place}` : "Цэг алга"}
        </span>
        <span className="text-neutral-400">
          Цэгийг чирнэ · зураг дээр дарж сонгосон цэгээ зөөнө · сумны товчоор нарийвчилна
        </span>
      </div>

      <div
        ref={boxRef}
        onClick={(e) => {
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          if (pins.length) move(sel, e.clientX, e.clientY);
        }}
        className="relative w-full select-none overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" draggable={false} className="block w-full" />

        {pins.map((p, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}. ${p.place}`}
            aria-pressed={sel === i}
            style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: "none" }}
            onPointerDown={(e) => startDrag(i, e)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 0.1 : 0.5;
              const d: Record<string, [number, number]> = {
                ArrowLeft: [-step, 0],
                ArrowRight: [step, 0],
                ArrowUp: [0, -step],
                ArrowDown: [0, step],
              };
              const hit = d[e.key];
              if (!hit) return;
              e.preventDefault();
              nudge(i, hit[0], hit[1]);
            }}
            className={`absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full text-label font-bold tabular-nums text-white ring-2 transition-[background-color,box-shadow] active:cursor-grabbing ${
              sel === i
                ? "bg-[#6a9652] ring-white shadow-[0_0_0_3px_rgba(106,150,82,0.35)]"
                : "bg-[#7ea86a]/85 ring-white/70 hover:bg-[#7ea86a]"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {active && (
        <p className="mt-2 text-xs text-neutral-500">
          X {active.x}% · Y {active.y}%
        </p>
      )}
    </div>
  );
}
