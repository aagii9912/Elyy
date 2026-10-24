"use client";

/* Explorer-ийг зөвхөн хөтөч дээр ачаална (three.js нь серверт хэрэггүй,
   нүүр хуудасны bundle-д ч орохгүй). WebGL дэмжихгүй төхөөрөмжид 2D
   мэдээлэл рүү чиглүүлнэ. */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Logo } from "@/components/Logo";
import type { ExploreInit } from "./store";

function Loading() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-[#e9ece5] font-gilroy text-night">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/location-aerial.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 blur-[2px]" />
      <div className="relative flex flex-col items-center gap-4 rounded-3xl bg-surface/90 px-10 py-8 shadow-xl backdrop-blur-md">
        <Logo className="h-5 w-auto" />
        <p className="text-sm font-bold uppercase tracking-caps-sm">3D орчныг ачааллаж байна…</p>
        <span className="relative h-1 w-48 overflow-hidden rounded-full bg-night/10">
          <span className="explore-loading absolute inset-y-0 left-0 w-1/3 rounded-full bg-night" />
        </span>
      </div>
      <style>{`@keyframes explore-loading{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}.explore-loading{animation:explore-loading 1.1s ease-in-out infinite}`}</style>
    </div>
  );
}

const Explorer = dynamic(() => import("./Explorer"), { ssr: false, loading: Loading });

let webglCache: boolean | null = null;
function hasWebGL() {
  if (webglCache === null) {
    try {
      const c = document.createElement("canvas");
      webglCache = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}
const noop = () => () => {};

export function ExplorerApp(props: ExploreInit) {
  const webgl = useSyncExternalStore(noop, hasWebGL, () => true);
  if (!webgl) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-ground px-6 font-gilroy text-night">
        <div className="max-w-md text-center">
          <Logo className="mx-auto h-5 w-auto" />
          <h1 className="mt-6 text-2xl font-extrabold">Таны төхөөрөмж 3D-г дэмжихгүй байна</h1>
          <p className="mt-3 text-sm text-mist">
            Хөтчөө шинэчлэх эсвэл өөр төхөөрөмж ашиглана уу. Өрөөний төлөвлөгөө, зургийг үндсэн сайтаас үзэж болно.
          </p>
          <Link href="/#apartments" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-night px-6 text-sm font-bold text-white">
            Өрөөний сонголт үзэх
          </Link>
        </div>
      </div>
    );
  }
  return <Explorer {...props} />;
}
