import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStore } from "@/lib/store";
import { mergeSiteContent } from "@/lib/site-content";
import { sanitizeTheme } from "@/lib/theme-css";

export const runtime = "nodejs";

/** Одоогийн сайтын контент (хадгалаагүй талбарууд өгөгдмөлөөр дүүрнэ). */
export async function GET() {
  try {
    const stored = await getStore().getSiteContent();
    return NextResponse.json({ ok: true, content: mergeSiteContent(stored) });
  } catch (err) {
    console.error("[admin] getSiteContent:", err);
    return NextResponse.json(
      { ok: false, error: "Контент ачаалахад алдаа гарлаа." },
      { status: 500 }
    );
  }
}

/** Сайтын контентыг хадгална. Body: бүтэн (эсвэл хэсэгчилсэн) SiteContent.
 *  Ирсэн өгөгдлийг өгөгдмөл бүтэц дээр давхарлаж цэвэрлэсний дараа
 *  хадгална — танихгүй талбар хадгалагдахгүй, дутуу нь өгөгдмөлөөр дүүрнэ. */
export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Буруу өгөгдөл." }, { status: 400 });
    }
    const merged = mergeSiteContent(body);
    // Дизайны утгууд `<style>` руу ордог тул хадгалахын ӨМНӨ шүүнэ
    // (рендерийн үед `buildThemeCss` дахин шүүнэ — хоёр давхар хамгаалалт).
    const content = { ...merged, theme: sanitizeTheme(merged.theme) };
    await getStore().saveSiteContent(content);

    // Засвар шууд нийтэд харагдана. Дизайн нь мэдээний хуудас болон
    // `/noir` theme-д ч хамаарах тул тэдгээрийг мөн шинэчилнэ.
    revalidatePath("/");
    revalidatePath("/noir");
    revalidatePath("/news");
    revalidatePath("/news/[slug]", "page");

    return NextResponse.json({ ok: true, content });
  } catch (err) {
    console.error("[admin] saveSiteContent:", err);
    return NextResponse.json(
      { ok: false, error: "Хадгалахад алдаа гарлаа. Supabase тохиргоог шалгана уу." },
      { status: 500 }
    );
  }
}
