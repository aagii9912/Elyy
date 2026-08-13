import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { isAllowedUploadType, UPLOAD_TYPE_ERROR } from "@/lib/upload-types";

export const runtime = "nodejs";

/* Том файлыг (танилцуулга PDF г.м.) browser-ээс шууд Supabase Storage руу
   илгээх зөвшөөрөл. Vercel дээр serverless функцийн хүсэлтийн бие ~4.5MB-аар
   хязгаарлагддаг тул түүнээс том файл энэ замаар л орно.

   Буцаана:
     { ok: true, uploadUrl, publicUrl }  — шууд PUT хийнэ
     { ok: false, unsupported: true }    — driver дэмжихгүй (локал) */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { filename?: string; contentType?: string }
    | null;

  const filename = String(body?.filename ?? "").trim();
  const contentType = String(body?.contentType ?? "").trim();

  if (!filename) {
    return NextResponse.json({ ok: false, error: "Файлын нэр алга." }, { status: 400 });
  }
  if (!isAllowedUploadType(contentType)) {
    return NextResponse.json({ ok: false, error: UPLOAD_TYPE_ERROR }, { status: 400 });
  }

  try {
    const signed = await getStore().createSignedUpload({ filename, contentType });
    if (!signed) {
      return NextResponse.json(
        { ok: false, unsupported: true, error: "Шууд байршуулах боломжгүй." },
        { status: 501 }
      );
    }
    return NextResponse.json({ ok: true, ...signed });
  } catch (err) {
    console.error("[admin] upload/sign:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `Байршуулах зөвшөөрөл авахад алдаа гарлаа: ${detail}` },
      { status: 500 }
    );
  }
}
