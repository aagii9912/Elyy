"use client";

/* Самбаруудад хэрэгтэй тооцоо — статусын тоо, шүүлтүүрийн үр дүн,
   QR холбоос. */

import { useMemo } from "react";
import { STATUS_ORDER } from "@/lib/explore/config";
import { ALL_UNITS } from "@/lib/explore/units";
import type { Status, StatusMap } from "@/lib/explore/types";
import { matchesFilters, type Filters } from "@/lib/explore/filters";
import { useExplore } from "../store";

export type Counts = Record<Status, number> & { total: number };

export function countStatuses(ids: string[], statuses: StatusMap): Counts {
  const out = { available: 0, reserved: 0, sold: 0, not_released: 0, total: ids.length } as Counts;
  for (const id of ids) out[statuses[id] ?? "not_released"]++;
  return out;
}

export function useMatches(block: number, filters: Filters) {
  const statuses = useExplore((s) => s.inventory.units);
  return useMemo(
    () =>
      ALL_UNITS.filter((u) => u.block === block && matchesFilters(u, filters, statuses[u.id])).sort(
        (a, b) =>
          STATUS_ORDER.indexOf(statuses[a.id] ?? "not_released") -
            STATUS_ORDER.indexOf(statuses[b.id] ?? "not_released") || b.floor - a.floor || a.slot - b.slot
      ),
    [block, filters, statuses]
  );
}

/** Утсан дээр үргэлжлүүлэх холбоос — kiosk бол UTM-тэй (Vertmonhub суваг). */
export function handoffUrl(path: string, mode: "web" | "kiosk", kioskId: string) {
  const origin = typeof window === "undefined" ? "https://elysium.mn" : window.location.origin;
  const params =
    mode === "kiosk"
      ? `utm_source=kiosk&utm_medium=qr&utm_campaign=${encodeURIComponent(kioskId)}`
      : "utm_source=explore&utm_medium=qr";
  return `${origin}/explore${path}?${params}`;
}
