import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

/** Зураг upload — multipart/form-data, талбар: file. Буцаана: { url }. */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Зураг хавсаргана уу." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "Зөвхөн зураг оруулах боломжтой." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "Зураг 8MB-аас бага байх ёстой." }, { status: 413 });
    }
    const url = await getStore().uploadImage({
      buffer,
      filename: file.name || "image",
      contentType: file.type,
    });
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("[admin] upload:", err);
    return NextResponse.json({ ok: false, error: "Зураг байршуулахад алдаа гарлаа." }, { status: 500 });
  }
}
