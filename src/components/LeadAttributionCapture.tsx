"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureLeadAttribution } from "@/lib/landing-attribution";

/** Зочны линкийн UTM/fbclid, referrer-ийн домэйныг энэ айлчлалд хадгална (маягт хавсаргана). */
export function LeadAttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureLeadAttribution();
  }, [pathname]);

  return null;
}
