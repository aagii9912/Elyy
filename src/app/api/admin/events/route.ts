import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getStore } from "@/lib/store";
import { newEvent, slugify, isValidSlug } from "@/lib/events";

export const runtime = "nodejs";

/** Бүх эвентийн жагсаалт (админ). */
export async function GET() {
  try {
    const events = await getStore().listEvents();
    return NextResponse.json({ ok: true, events });
  } catch (err) {
    console.error("[admin] listEvents:", err);
    return NextResponse.json({ ok: false, error: "Жагсаалт ачаалахад алдаа гарлаа." }, { status: 500 });
  }
}

/** Шинэ эвент үүсгэх. Body: { name } */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: "Эвентийн нэр оруулна уу." }, { status: 400 });
    }
    const store = getStore();

    // Нэрнээс slug — reserved/буруу бол fallback, давхцвал -2, -3 залгана.
    let base = slugify(name);
    if (!base || !isValidSlug(base)) base = "event";
    let slug = base;
    let n = 2;
    while (await store.getEventBySlug(slug)) slug = `${base}-${n++}`;

    const doc = newEvent({ id: randomUUID(), name, slug, now: new Date().toISOString() });
    const created = await store.createEvent(doc);
    return NextResponse.json({ ok: true, event: created });
  } catch (err) {
    console.error("[admin] createEvent:", err);
    return NextResponse.json({ ok: false, error: "Эвент үүсгэхэд алдаа гарлаа." }, { status: 500 });
  }
}
