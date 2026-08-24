"use client";

/* `/noir` — Төсөл хэрэгжүүлэгч. Компанийн товч танилцуулга, дараа нь
   өмнөх төслүүд хэвтээгээр гүйх зурвас (гар утсанд хуруугаараа). */

import type { SiteContent } from "@/lib/site-content";
import { sectionTone } from "@/lib/theme-css";
import { NoirChapter, NoirSection } from "./shared";

export function NoirDeveloper({ site }: { site: SiteContent }) {
  const { developer } = site;

  return (
    <NoirSection id="developer" bg="developer" tone={sectionTone(site.theme, "developer", "dark")}>
      <div className="nv-head nv-head--split">
        <div>
          <NoirChapter>{developer.kicker}</NoirChapter>
          <h2 className="nv-h2" data-rise>
            {developer.name}
          </h2>
        </div>
        <p className="nv-lead" data-rise style={{ "--d": "0.08s" } as React.CSSProperties}>
          {developer.body}
        </p>
      </div>

      <div className="nv-stats" style={{ marginTop: "clamp(28px, 4vh, 52px)" }}>
        <div className="nv-stat" data-rise>
          <b>{developer.since}</b>
          <span>{developer.sinceLabel}</span>
        </div>
        <div className="nv-stat" data-rise style={{ "--d": "0.06s" } as React.CSSProperties}>
          <b>{developer.projectCount}</b>
          <span>{developer.projectCountLabel}</span>
        </div>
      </div>

      <div className="nv-rail" data-rise style={{ "--d": "0.1s" } as React.CSSProperties}>
        {developer.projects.map((project, i) => (
          <article className="nv-slide" key={project.title + i}>
            <div className="nv-slide-media">
              {project.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.image} alt={project.title} loading="lazy" />
              )}
              {project.years && <span className="nv-slide-years">{project.years}</span>}
            </div>
            <h4>{project.title}</h4>
            <p>{project.meta || project.units}</p>
          </article>
        ))}
      </div>

      <p className="nv-note">{developer.scrollHint}</p>
    </NoirSection>
  );
}
