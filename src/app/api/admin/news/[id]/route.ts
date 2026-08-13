import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStore } from "@/lib/store";
import { isValidSlug } from "@/lib/events";
import type { NewsDoc } from "@/lib/news";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Public хуудсуудыг шинэчилнэ (жагсаалт + тухайн нийтлэл). */
function revalidateNews(slugs: (string | undefined)[]) {
  revalidatePath("/news");
  for (const slug of slugs) if (slug) revalidatePath(`/news/${slug}`);
}

/** Нэг мэдээ авах. */
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const news = await getStore().getNews(id);
  if (!news) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, news });
}

/** Мэдээ шинэчлэх. Body: { title?, slug?, excerpt?, cover?, tag?, date?, body?, status? } */
export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ ok: false, error: "Буруу өгөгдөл." }, { status: 400 });
    }

    const patch: Partial<Omit<NewsDoc, "id">> = {};
    if (typeof payload.title === "string") patch.title = payload.title.trim();
    if (typeof payload.excerpt === "string") patch.excerpt = payload.excerpt;
    if (typeof payload.cover === "string") patch.cover = payload.cover;
    if (typeof payload.tag === "string") patch.tag = payload.tag.trim();
    if (typeof payload.body === "string") patch.body = payload.body;
    if (payload.status === "draft" || payload.status === "published") patch.status = payload.status;
    if (typeof payload.date === "string") {
      const date = payload.date.trim();
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { ok: false, error: "Огноо ЖЖЖЖ-СС-ӨӨ хэлбэртэй байх ёстой." },
          { status: 400 }
        );
      }
      patch.date = date;
    }
    if (typeof payload.slug === "string") {
      const slug = payload.slug.trim().toLowerCase();
      if (!isValidSlug(slug)) {
        return NextResponse.json(
          { ok: false, error: "Slug буруу эсвэл ашиглах боломжгүй (жишээ: admin, api, news)." },
          { status: 400 }
        );
      }
      patch.slug = slug;
    }

    const store = getStore();
    const before = await store.getNews(id);
    try {
      const updated = await store.updateNews(id, patch);
      if (!updated) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
      // Slug солигдсон бол хуучин замыг ч цэвэрлэнэ.
      revalidateNews([before?.slug, updated.slug]);
      return NextResponse.json({ ok: true, news: updated });
    } catch (e) {
      if (e instanceof Error && e.message === "slug-taken") {
        return NextResponse.json(
          { ok: false, error: "Энэ slug аль хэдийн ашиглагдсан." },
          { status: 409 }
        );
      }
      throw e;
    }
  } catch (err) {
    console.error("[admin] updateNews:", err);
    return NextResponse.json({ ok: false, error: "Хадгалахад алдаа гарлаа." }, { status: 500 });
  }
}

/** Мэдээ устгах. */
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const store = getStore();
    const before = await store.getNews(id);
    await store.deleteNews(id);
    revalidateNews([before?.slug]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin] deleteNews:", err);
    return NextResponse.json({ ok: false, error: "Устгахад алдаа гарлаа." }, { status: 500 });
  }
}
