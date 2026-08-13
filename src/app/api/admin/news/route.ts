import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getStore } from "@/lib/store";
import { isValidSlug } from "@/lib/events";
import { newNews, slugify } from "@/lib/news";

export const runtime = "nodejs";

/** Бүх мэдээ (ноорог оролцуулаад) — админ. */
export async function GET() {
  try {
    const news = await getStore().listNews();
    return NextResponse.json({ ok: true, news });
  } catch (err) {
    console.error("[admin] listNews:", err);
    return NextResponse.json(
      { ok: false, error: "Жагсаалт ачаалахад алдаа гарлаа." },
      { status: 500 }
    );
  }
}

/** Шинэ мэдээ үүсгэх. Body: { title } */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const title = String(body?.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: "Гарчиг оруулна уу." }, { status: 400 });
    }
    const store = getStore();

    // Гарчгаас slug — буруу/давхцсан бол дугаар залгана.
    let base = slugify(title);
    if (!base || !isValidSlug(base)) base = "medee";
    let slug = base;
    let n = 2;
    while (await store.getNewsBySlug(slug)) slug = `${base}-${n++}`;

    const doc = newNews({ id: randomUUID(), title, slug, now: new Date().toISOString() });
    try {
      const created = await store.createNews(doc);
      revalidatePath("/news");
      return NextResponse.json({ ok: true, news: created });
    } catch (e) {
      if (e instanceof Error && e.message === "slug-taken") {
        return NextResponse.json(
          { ok: false, error: "Энэ нэртэй мэдээ дөнгөж үүслээ. Дахин оролдоно уу." },
          { status: 409 }
        );
      }
      throw e;
    }
  } catch (err) {
    console.error("[admin] createNews:", err);
    return NextResponse.json({ ok: false, error: "Мэдээ үүсгэхэд алдаа гарлаа." }, { status: 500 });
  }
}
