import { getStore } from "@/lib/store";
import { NewsDashboard } from "@/components/admin/NewsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const news = await getStore()
    .listNews()
    .catch((e) => {
      console.error("[admin] load news:", e);
      return [];
    });
  return <NewsDashboard initialNews={news} />;
}
