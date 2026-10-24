"use client";

/* ============================================================
   3D Explorer — kiosk ба вэбийн нэгдсэн үндэс.
   Нэг Canvas бүх түвшинд амьд үлдэж (WebGL context дахин үүсэхгүй),
   UI нь дээр нь DOM давхарга. `mode="kiosk"` — том мэдрэгч UI,
   attract mode, идэвхгүй үед автоматаар эхлэл рүү буцна.
   ============================================================ */

import "./explore.css";
import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { INVENTORY_POLL_MS, KIOSK_IDLE_MS } from "@/lib/explore/config";
import { parseExplorePath } from "@/lib/explore/routes";
import type { InventorySnapshot } from "@/lib/explore/types";
import { Scene } from "./scene/Scene";
import { Overlay } from "./ui/Overlay";
import {
  DEFAULT_FILTERS,
  ExploreStoreContext,
  createExploreStore,
  useExplore,
  useExploreApi,
  useNavigate,
  type ExploreInit,
} from "./store";

export default function Explorer(props: ExploreInit) {
  const [store] = useState(() => createExploreStore(props));
  return (
    <ExploreStoreContext.Provider value={store}>
      <Shell />
    </ExploreStoreContext.Provider>
  );
}

function Shell() {
  const mode = useExplore((s) => s.mode);
  const api = useExploreApi();
  const [dpr, setDpr] = useState(() =>
    typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, mode === "kiosk" ? 1.25 : 1.75)
  );

  useHistorySync();
  useInventoryPolling();
  useKiosk();

  return (
    <div
      className={`explore-shell${mode === "kiosk" ? " is-kiosk" : ""}`}
      data-lenis-prevent
      onContextMenu={mode === "kiosk" ? (e) => e.preventDefault() : undefined}
    >
      <Canvas
        className="explore-canvas"
        shadows="percentage"
        dpr={dpr}
        camera={{ fov: 38, near: 1, far: 16000, position: [-900, 1700, 2300] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onPointerMissed={() => api.setState({ picked: null, poi: null, amenity: null, focusRoom: null })}
      >
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(mode === "kiosk" ? 1.25 : 1.75, d + 0.25))}
        />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Overlay />
    </div>
  );
}

/** Хөтчийн «буцах/урагшлах» → түвшин. */
function useHistorySync() {
  const api = useExploreApi();
  useEffect(() => {
    const onPop = () => {
      const { basePath } = api.getState();
      const view = parseExplorePath(window.location.pathname, basePath);
      api.setState({
        view,
        hover: null,
        picked: null,
        focusRoom: null,
        tourRoom: view.level === "tour" ? (view.room ?? null) : null,
      });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [api]);
}

/** Статусыг тогтмол шинэчилнэ (Vertmonhub эсвэл mockup). */
function useInventoryPolling() {
  const api = useExploreApi();
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/explore/inventory", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as InventorySnapshot;
        if (alive && data?.units) api.setState({ inventory: data });
      } catch {
        /* Сүлжээ тасарсан — сүүлийн мэдээлэл хэвээр (kiosk offline). */
      }
    };
    const id = window.setInterval(tick, INVENTORY_POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [api]);
}

/** Kiosk: идэвхгүй үед attract mode + бүх төлөвийг цэвэрлэж эхлэл рүү. */
function useKiosk() {
  const api = useExploreApi();
  const mode = useExplore((s) => s.mode);
  const attract = useExplore((s) => s.attract);
  const navigate = useNavigate();

  useEffect(() => {
    if (mode !== "kiosk") return;
    const root = document.documentElement;
    root.classList.add("explore-kiosk-root");
    const params = new URLSearchParams(window.location.search);
    const idleMs = Number(params.get("idle")) * 1000 || KIOSK_IDLE_MS;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        navigate({ level: "location" }, { replace: true });
        api.setState({
          attract: true,
          lead: null,
          qr: null,
          planUnit: null,
          compare: [],
          compareOpen: false,
          filters: DEFAULT_FILTERS,
          parkingKinds: [],
          parkingBlock: null,
          poi: null,
        });
      }, idleMs);
    };
    /* Attract mode-оос гарахыг `KioskAttract` хариуцна (товшилтыг өөрөө
       шингээж, доорх 3D руу дамжуулахгүй). Энд зөвхөн цагийг сэргээнэ. */
    const wake = () => arm();
    const events = ["pointerdown", "keydown", "wheel"] as const;
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    arm();
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, wake));
      root.classList.remove("explore-kiosk-root");
    };
  }, [mode, api, navigate]);

  /* Attract mode-д хот → хотхон → блок гэж ээлжилнэ. */
  useEffect(() => {
    if (mode !== "kiosk" || !attract) return;
    const steps = [
      { level: "location" as const },
      { level: "site" as const },
      { level: "block" as const, block: 2 },
      { level: "site" as const },
      { level: "block" as const, block: 4 },
    ];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % steps.length;
      navigate(steps[i], { replace: true });
      api.setState({ attract: true });
    }, 12_000);
    return () => window.clearInterval(id);
  }, [mode, attract, navigate, api]);
}
