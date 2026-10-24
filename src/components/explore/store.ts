"use client";

/* ============================================================
   Explorer-ийн төлөв (zustand). Нэг Explorer = нэг store — контекстоор
   дамжина (R3F-ийн Canvas контекстыг автоматаар гүүрээр дамжуулдаг тул
   3D бүрэлдэхүүн ч мөн адил хандана).

   Түвшин (`view`) нь URL-тай синк: `navigate` нь history.pushState
   хийж, хөтчийн «буцах» товч `popstate`-ээр буцаан уншина.
   ============================================================ */

import { createContext, useCallback, useContext } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import { DEFAULT_FILTERS, type Filters } from "@/lib/explore/filters";
import { parseExplorePath, viewPath } from "@/lib/explore/routes";
import type { Season } from "@/lib/explore/sun";
import type {
  ExploreMode,
  ExploreSiteInfo,
  InventorySnapshot,
  ParkingKind,
  View,
} from "@/lib/explore/types";

export type Hover =
  | { kind: "block"; block: number }
  | { kind: "floor"; block: number; floor: number }
  | { kind: "unit"; id: string }
  | { kind: "parking"; id: string }
  | null;

export { DEFAULT_FILTERS, type Filters };

export type LeadTarget = { unitId?: string; parkingId?: string };

export type ExploreState = {
  mode: ExploreMode;
  basePath: string;
  kioskId: string;
  site: ExploreSiteInfo;
  inventory: InventorySnapshot;
  view: View;
  hover: Hover;
  /** Мэдрэгч дэлгэцийн эхний дарлагаар сонгосон зүйл (давхар, айл). */
  picked: string | null;
  poi: number | null;
  amenity: string | null;
  filters: Filters;
  parkingKinds: ParkingKind[];
  parkingBlock: number | null;
  season: Season;
  hour: number;
  /** Аялал дахь одоогийн өрөө (interior.rooms индекс). */
  tourRoom: number | null;
  /** Айлын түвшинд тодруулсан өрөө. */
  focusRoom: number | null;
  lead: LeadTarget | null;
  qr: { url: string; title: string } | null;
  planUnit: string | null;
  compare: string[];
  compareOpen: boolean;
  attract: boolean;
  sheetOpen: boolean;
  /** Самбарын хэмжээ (px) — камерын төвийг харагдах хэсэг рүү шилжүүлнэ. */
  panel: { w: number; h: number; desktop: boolean };
  /** 3D шошгоны бэхэлгээ: DOM элемент + дэлхийн байрлал. `LabelProjector`
   *  кадр бүрд байрлалыг нь шинэчилнэ (реактив биш). */
  anchors: Map<string, Anchor>;
};

export type Anchor = { x: number; y: number; z: number; el: HTMLElement | null };

export type ExploreInit = Pick<ExploreState, "mode" | "basePath" | "kioskId" | "site" | "inventory">;

export function createExploreStore(init: ExploreInit) {
  const view =
    typeof window === "undefined"
      ? ({ level: "location" } as View)
      : parseExplorePath(window.location.pathname, init.basePath);
  /* Kiosk төхөөрөмжийн нэр URL-аас (`/kiosk?kiosk=office-1`) — хүсэлт,
     QR-ын UTM-д орно. */
  const kioskId =
    (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("kiosk")) || init.kioskId;
  return createStore<ExploreState>()(() => ({
    ...init,
    kioskId,
    view,
    hover: null,
    picked: null,
    poi: null,
    amenity: null,
    filters: DEFAULT_FILTERS,
    parkingKinds: [],
    parkingBlock: null,
    season: "summer",
    hour: 16,
    tourRoom: null,
    focusRoom: null,
    lead: null,
    qr: null,
    planUnit: null,
    compare: [],
    compareOpen: false,
    attract: false,
    sheetOpen: false,
    panel: { w: 0, h: 0, desktop: true },
    anchors: new Map(),
  }));
}

export const ExploreStoreContext = createContext<StoreApi<ExploreState> | null>(null);

export function useExploreApi(): StoreApi<ExploreState> {
  const store = useContext(ExploreStoreContext);
  if (!store) throw new Error("ExploreStoreContext олдсонгүй");
  return store;
}

export function useExplore<T>(selector: (s: ExploreState) => T): T {
  return useStore(useExploreApi(), selector);
}

/** Түвшин солих — URL-ыг шинэчилж, түр сонголтуудыг цэвэрлэнэ. */
export function useNavigate() {
  const api = useExploreApi();
  return useCallback(
    (view: View, opts?: { replace?: boolean }) => {
      const { basePath } = api.getState();
      const url = `${basePath}${viewPath(view)}`;
      if (typeof window !== "undefined" && window.location.pathname !== url) {
        if (opts?.replace) window.history.replaceState(null, "", url);
        else window.history.pushState(null, "", url);
      }
      api.setState({
        view,
        hover: null,
        picked: null,
        amenity: null,
        poi: view.level === "location" ? api.getState().poi : null,
        tourRoom: view.level === "tour" ? (view.room ?? null) : null,
        focusRoom: null,
        sheetOpen: false,
      });
    },
    [api]
  );
}
