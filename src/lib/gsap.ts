"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Safe to call repeatedly; only meaningful on the client.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export const EASE = "power3.out";
export const EASE_LUXE = "expo.out";

export { gsap, ScrollTrigger, useGSAP };
