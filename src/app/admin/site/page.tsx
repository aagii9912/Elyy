import { getStore } from "@/lib/store";
import { mergeSiteContent } from "@/lib/site-content";
import { SiteEditor } from "@/components/admin/SiteEditor";

export const dynamic = "force-dynamic";

export default async function AdminSitePage() {
  const stored = await getStore()
    .getSiteContent()
    .catch((e) => {
      console.error("[admin] load site content:", e);
      return null;
    });
  return <SiteEditor initial={mergeSiteContent(stored)} />;
}
