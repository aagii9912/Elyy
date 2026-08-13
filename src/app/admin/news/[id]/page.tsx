import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import { NewsEditor } from "@/components/admin/NewsEditor";

export const dynamic = "force-dynamic";

export default async function AdminNewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const news = await getStore()
    .getNews(id)
    .catch((e) => {
      console.error("[admin] load news item:", e);
      return null;
    });
  if (!news) notFound();
  return <NewsEditor initial={news} />;
}
