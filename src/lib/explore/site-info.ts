/* Сайтын контентоос (админаас засагддаг) Explorer-т хэрэгтэй хэсгийг
   л салгаж клиент рүү дамжуулна — бүтэн контентыг илгээхгүй. */

import type { SiteContent } from "@/lib/site-content";
import type { ExploreSiteInfo } from "./types";

export function exploreSiteInfo(site: SiteContent): ExploreSiteInfo {
  const project = site.location.tabs.project;
  const q = site.apartments.inquiry;
  return {
    address: project.address,
    coords: project.coords,
    phone: site.contact.phone,
    hours: site.contact.hours,
    pins: site.location.pins.map((p) => ({
      place: p.place,
      description: p.description,
      distance: p.distance,
      unit: p.unit,
      image: p.image,
      x: p.x,
      y: p.y,
    })),
    inquiry: {
      name: q.name,
      phone: q.phone,
      note: q.note,
      submit: q.submit,
      sending: q.sending,
      error: q.error,
      successTitle: q.successTitle,
      successBody: q.successBody,
    },
  };
}
