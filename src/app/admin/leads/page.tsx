import { getStore } from "@/lib/store";
import { LeadsTable } from "@/components/admin/LeadsTable";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  // Эвентүүдийг шүүлтүүрт ашиглана; бүртгэлийг client талаас татна.
  const events = await getStore()
    .listEvents()
    .catch(() => []);
  return <LeadsTable events={events} />;
}
