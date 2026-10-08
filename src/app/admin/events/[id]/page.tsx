import { notFound } from "next/navigation";
import { getStore, storeMode } from "@/lib/store";
import { authDisabled } from "@/lib/auth";
import { EventEditor } from "@/components/admin/EventEditor";
import { defaultRegistrationPage } from "@/lib/registration-page";
import { loadSiteContent } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const event = await getStore().getEvent(id).catch(() => null);
  if (!event) notFound();
  // Keep inherited social links when an older registration page is first edited.
  if (event.content.template === "registration" && !event.content.registrationPage) {
    const page = defaultRegistrationPage();
    page.links.social = (await loadSiteContent()).footer.social;
    event.content = { ...event.content, registrationPage: page };
  }
  return <EventEditor initial={event} storeMode={storeMode()} authDisabled={authDisabled()} />;
}
