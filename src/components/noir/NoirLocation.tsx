"use client";

/* `/noir` — Байршил. Төслийн байршил ба борлуулалтын оффис хоёрын
   хооронд сэлгэнэ; газрын зураг нь theme-ийн харанхуйд тааруулсан
   CSS шүүлтүүрээр ногоон/бараан болж харагдана. */

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { sectionTone } from "@/lib/theme-css";
import { NoirChapter, NoirSection } from "./shared";

const embed = (coords: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(coords)}&z=16&output=embed`;

const directions = (coords: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}`;

export function NoirLocation({ site }: { site: SiteContent }) {
  const { location } = site;
  const [tab, setTab] = useState<"project" | "office">("project");
  const current = location.tabs[tab];

  return (
    <NoirSection id="location" bg="location" tone={sectionTone(site.theme, "location", "dark")}>
      <div className="nv-head nv-head--split">
        <div>
          <NoirChapter>{location.kicker}</NoirChapter>
          <h2 className="nv-h2" data-rise>
            {current.title}
          </h2>
        </div>
        <div data-rise style={{ "--d": "0.08s" } as React.CSSProperties}>
          <p className="nv-lead">
            <b style={{ display: "block", fontWeight: 400, color: "var(--nv-strip)", fontSize: "11px", letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: "8px" }}>
              {location.addressLabel}
            </b>
            {current.address}
          </p>
          <a
            className="nv-ghost"
            href={directions(current.coords)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: "18px", fontSize: "14px" }}
          >
            {location.directionsLabel}
          </a>
        </div>
      </div>

      <div className="nv-tabs">
        {(["project", "office"] as const).map((key) => (
          <button
            type="button"
            key={key}
            className={`nv-tab${tab === key ? " is-on" : ""}`}
            onClick={() => setTab(key)}
          >
            {location.tabs[key].label}
          </button>
        ))}
      </div>

      <div className="nv-map" data-rise>
        <iframe
          key={current.coords}
          src={embed(current.coords)}
          title={current.title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="nv-nearby">
        {location.nearby.map((group, i) => (
          <div key={group.label + i} data-rise style={{ "--d": `${0.05 * i}s` } as React.CSSProperties}>
            <h4>{group.label}</h4>
            <ul>
              {group.items.map((item, j) => (
                <li key={item.place + j}>
                  <b>{item.place}</b>
                  <span>
                    {item.kind && `${item.kind} · `}
                    {item.distance}м
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </NoirSection>
  );
}
