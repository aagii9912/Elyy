import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import { RESERVED_SLUGS } from "@/lib/events";
import { EventLanding } from "@/components/event/EventLanding";

/* Эвентийн public landing page: /<slug>
   Статик route-ууд (/final, /mono, /admin гэх мэт) энэ dynamic segment-ээс
   давуу тул зөвхөн бусад замыг энэ барьж авна. Хэвлэгдээгүй (draft) эвентийг
   зөвхөн ?preview=1-тэй үед харуулна. */

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return {};
  const event = await getStore().getEventBySlug(slug).catch(() => null);
  if (!event) return {};
  const c = event.content;
  const draft = event.status !== "published";
  return {
    title: event.name,
    description: c.hero.subtitle,
    openGraph: {
      title: `${event.name} — Elysium`,
      description: c.hero.subtitle,
      images: c.hero.image ? [c.hero.image] : undefined,
      type: "website",
    },
    robots: draft ? { index: false, follow: false } : undefined,
  };
}

export default async function EventPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) notFound();

  const { preview } = await searchParams;
  const event = await getStore().getEventBySlug(slug).catch(() => null);

  if (!event) notFound();
  if (event.status !== "published" && preview !== "1") notFound();

  return <EventLanding event={event} />;
}
