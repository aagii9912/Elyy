import { notFound } from "next/navigation";
import { getStore, storeMode } from "@/lib/store";
import { authDisabled } from "@/lib/auth";
import { EventEditor } from "@/components/admin/EventEditor";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const event = await getStore().getEvent(id).catch(() => null);
  if (!event) notFound();
  return <EventEditor initial={event} storeMode={storeMode()} authDisabled={authDisabled()} />;
}
