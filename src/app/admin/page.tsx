import { getStore, storeMode } from "@/lib/store";
import { authDisabled } from "@/lib/auth";
import { Dashboard } from "@/components/admin/Dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const events = await getStore()
    .listEvents()
    .catch((e) => {
      console.error("[admin] load events:", e);
      return [];
    });
  return <Dashboard initialEvents={events} storeMode={storeMode()} authDisabled={authDisabled()} />;
}
