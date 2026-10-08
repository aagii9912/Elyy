import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { isValidSlug, type EventDoc } from "@/lib/events";
import { validRegistrationOptions } from "@/lib/event-registration";
import { validRegistrationPage } from "@/lib/registration-page";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Нэг эвент авах. */
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const event = await getStore().getEvent(id);
  if (!event) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  return NextResponse.json({ ok: true, event });
}

/** Эвент шинэчлэх. Body: { name?, slug?, status?, content? } */
export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Буруу өгөгдөл." }, { status: 400 });
    }

    const patch: Partial<Omit<EventDoc, "id">> = {};
    if (typeof body.name === "string") patch.name = body.name.trim();
    if (body.status === "draft" || body.status === "published") patch.status = body.status;
    if (body.content && typeof body.content === "object") {
      const template = body.content.template;
      if (template !== undefined && template !== "event" && template !== "registration") {
        return NextResponse.json({ ok: false, error: "Хуудасны загвар буруу байна." }, { status: 400 });
      }
      for (const key of ["apartmentTypes", "areaRanges"]) {
        const options = body.content.form?.[key];
        if (options !== undefined && !validRegistrationOptions(options)) {
          return NextResponse.json(
            { ok: false, error: "Сонголт бүр 1–60 тэмдэгттэй, давхцахгүй 1–20 мөр байна." }, { status: 400 },
          );
        }
      }
      for (const key of ["apartmentLabel", "areaLabel"]) {
        const label = body.content.form?.[key];
        if (label !== undefined && (typeof label !== "string" || !label.trim() || label.length > 100)) {
          return NextResponse.json({ ok: false, error: "Сонголтын гарчиг 1–100 тэмдэгттэй байна." }, { status: 400 });
        }
      }
      if (body.content.registrationPage !== undefined && !validRegistrationPage(body.content.registrationPage)) {
        return NextResponse.json({ ok: false, error: "Header, footer, менежерийн мэдээллийг шалгана уу. Холбоос, и-мэйл, утас болон өнгө зөв утгатай байна." }, { status: 400 });
      }
      patch.content = body.content;
    }
    if (typeof body.slug === "string") {
      const slug = body.slug.trim().toLowerCase();
      if (!isValidSlug(slug)) {
        return NextResponse.json(
          { ok: false, error: "Slug буруу эсвэл ашиглах боломжгүй (жишээ: admin, api)." },
          { status: 400 }
        );
      }
      patch.slug = slug;
    }

    try {
      const updated = await getStore().updateEvent(id, patch);
      if (!updated) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
      return NextResponse.json({ ok: true, event: updated });
    } catch (e) {
      if (e instanceof Error && e.message === "slug-taken") {
        return NextResponse.json({ ok: false, error: "Энэ slug аль хэдийн ашиглагдсан." }, { status: 409 });
      }
      throw e;
    }
  } catch (err) {
    console.error("[admin] updateEvent:", err);
    return NextResponse.json({ ok: false, error: "Хадгалахад алдаа гарлаа." }, { status: 500 });
  }
}

/** Эвент устгах. */
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await getStore().deleteEvent(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin] deleteEvent:", err);
    return NextResponse.json({ ok: false, error: "Устгахад алдаа гарлаа." }, { status: 500 });
  }
}
