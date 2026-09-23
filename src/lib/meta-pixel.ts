type MetaPixelEvent = "PageView" | "Schedule" | "Lead";

declare global {
  interface Window {
    fbq?: (command: "track", event: MetaPixelEvent) => void;
  }
}

export function trackMetaPixel(event: MetaPixelEvent) {
  window.fbq?.("track", event);
}
