"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Safe to call repeatedly; only meaningful on the client.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Keep transforms on the compositor — pinned canvases and the reveal
  // batch both animate transform/opacity, so this is pure win.
  gsap.config({ force3D: true });
  // Mobile browsers resize the viewport when the URL bar hides/shows. Without
  // this, every one of those resizes refreshes ScrollTrigger mid-scroll and
  // the pinned chapters visibly jump.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export const EASE = "power3.out";
export const EASE_LUXE = "expo.out";

export { gsap, ScrollTrigger, useGSAP };
