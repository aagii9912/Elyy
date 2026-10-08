import type { SocialLink } from "./site-content";
import { externalHref } from "./links";

export type RegistrationManager = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  image: string;
};

export type RegistrationPageContent = {
  header: { desktopImage: string; mobileImage: string; logo: string; logoAlt: string; title: string; body: string };
  links: { website: string; social: SocialLink[] };
  salesTitle: string;
  contactTitle: string;
  managers: { title: string; subtitle: string; items: RegistrationManager[] };
  footer: {
    logo: string; company: string; description: string; address: string;
    phone: string; email: string; mapUrl: string; copyright: string;
    background: string; textColor: string;
  };
};

export function emptyManager(id: string): RegistrationManager {
  return { id, name: "", role: "", phone: "", email: "", image: "" };
}

/** Blank assets and copy are intentional: this template starts with placeholders. */
export function defaultRegistrationPage(): RegistrationPageContent {
  return {
    header: { desktopImage: "", mobileImage: "", logo: "", logoAlt: "", title: "", body: "" },
    links: {
      website: "",
      social: ["Facebook", "Instagram", "YouTube"].map((label) => ({ label, icon: label.toLowerCase(), href: "" })),
    },
    salesTitle: "Борлуулалтын алба",
    contactTitle: "Бидэнтэй холбогдох",
    managers: {
      title: "Борлуулалтын менежерүүд",
      subtitle: "",
      items: [1, 2, 3].map((i) => emptyManager(`manager-${i}`)),
    },
    footer: {
      logo: "", company: "", description: "", address: "", phone: "", email: "", mapUrl: "", copyright: "",
      background: "#f3f1ed", textColor: "#303030",
    },
  };
}

const record = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, max = 200) => typeof value === "string" && value.length <= max;
const link = (value: unknown) => text(value, 2000) && (!value || Boolean(externalHref(value as string)));
const media = (value: unknown) => text(value, 2000) && (!value || /^(https?:\/\/|\/(?!\/))/i.test(value as string));
const email = (value: unknown) => text(value, 255) && (!value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string));
const phone = (value: unknown) => text(value, 40) && (!value || /^[+\d\s().-]+$/.test(value as string));
const hex = (value: unknown) => typeof value === "string" && /^#[\da-f]{6}$/i.test(value);

/** Validate at the admin API boundary; old pages may omit this whole block. */
export function validRegistrationPage(value: unknown): value is RegistrationPageContent {
  if (!record(value)) return false;
  const { header: h, links: l, managers: m, footer: f } = value;
  if (!record(h) || !record(l) || !record(m) || !record(f)) return false;
  if (![h.desktopImage, h.mobileImage, h.logo, f.logo].every(media) || !text(h.logoAlt) || !text(h.title) || !text(h.body, 3000)) return false;
  if (!text(value.salesTitle) || !text(value.contactTitle) || !link(l.website)) return false;
  if (!Array.isArray(l.social) || l.social.length > 8 || !l.social.every((s) => record(s) && text(s.label, 60) && text(s.icon, 30) && link(s.href))) return false;
  if (!text(m.title) || !text(m.subtitle, 1000) || !Array.isArray(m.items) || m.items.length > 12) return false;
  if (!m.items.every((i) => record(i) && text(i.id, 100) && Boolean(i.id) && text(i.name) && text(i.role) && phone(i.phone) && email(i.email) && media(i.image))) return false;
  if (new Set(m.items.map((i) => i.id)).size !== m.items.length) return false;
  return text(f.company) && text(f.description, 3000) && text(f.address, 1000) && phone(f.phone) && email(f.email) && link(f.mapUrl) && text(f.copyright) && hex(f.background) && hex(f.textColor);
}
