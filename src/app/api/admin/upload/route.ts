import { NextResponse } from "next/server";
import { getStore, storeMode } from "@/lib/store";
import { isAllowedUploadType, UPLOAD_TYPE_ERROR } from "@/lib/upload-types";

export const runtime = "nodejs";

/* Vercel дээр serverless функцийн хүсэлтийн бие ~4.5MB-аар хязгаарлагддаг тул
   клиент тал зургийг илгээхээсээ өмнө шахдаг (`components/admin/upload.ts`),
   том файлыг `upload/sign`-аар шууд Storage руу илгээдэг.
   Доорх хязгаар нь зөвхөн эцсийн хамгаалалт. */
const MAX_BYTES = 4 * 1024 * 1024;

const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || "elysium-media";

/** Локал драйвер Vercel дээр ажиллахгүй — файл систем read-only.
 *  (Өөр газар өөрөө host хийж байгаа бол бичих боломжтой байж мэдэх тул
 *  зөвхөн Vercel-ийг шалгана; бусад тохиолдолд бичих оролдлого өөрөө
 *  тодорхой алдаа буцаана.) */
function localOnVercel(): boolean {
  return storeMode() === "local" && Boolean(process.env.VERCEL);
}

const NOT_CONFIGURED =
  "Зураг хадгалах сан тохируулаагүй байна: SUPABASE_URL болон " +
  "SUPABASE_SERVICE_ROLE_KEY орчны хувьсагчийг Vercel дээр нэмнэ үү " +
  "(файл систем read-only тул зураг хадгалагдахгүй).";

/** Оношилгоо — админ самбар одоогийн хадгалалтын горимыг эндээс уншина. */
export async function GET() {
  return NextResponse.json({
    ok: !localOnVercel(),
    mode: storeMode(),
    bucket: storeMode() === "supabase" ? BUCKET : null,
    error: localOnVercel() ? NOT_CONFIGURED : null,
  });
}

/** Зураг upload — multipart/form-data, талбар: file. Буцаана: { url }. */
export async function POST(req: Request) {
  if (localOnVercel()) {
    return NextResponse.json({ ok: false, error: NOT_CONFIGURED }, { status: 500 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    // Ихэвчлэн хэт том бие — hosting нь route хүртэл ирэхээс өмнө таслана.
    return NextResponse.json(
      { ok: false, error: "Зураг хэтэрхий том байна. 4MB-аас бага зураг оруулна уу." },
      { status: 413 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Файл хавсаргана уу." }, { status: 400 });
  }
  if (!isAllowedUploadType(file.type)) {
    return NextResponse.json({ ok: false, error: UPLOAD_TYPE_ERROR }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Файл 4MB-аас бага байх ёстой." }, { status: 413 });
  }

  try {
    const url = await getStore().uploadImage({
      buffer,
      filename: file.name || "image",
      contentType: file.type,
    });
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("[admin] upload:", err);
    // Route нь middleware-ээр админд хаалттай тул шалтгааныг нуухгүй —
    // «алдаа гарлаа» гэсэн ерөнхий мессеж оношлоход ямар ч тус болдоггүй.
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `Зураг байршуулахад алдаа гарлаа: ${detail}` },
      { status: 500 }
    );
  }
}
