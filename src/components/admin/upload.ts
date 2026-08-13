"use client";

/* Админы файл байршуулах туслах — `ImageField`, `FileField` болон
   нийтлэлийн «Зураг оруулах» товч бүгд үүнийг дуудна.

   Хоёр зам:
     • жижиг файл  → `/api/admin/upload` (server дамжина)
     • том файл    → `/api/admin/upload/sign`-аас зөвшөөрөл аваад
                     Storage руу ШУУД илгээнэ.

   Яагаад вэ: Vercel дээр serverless функцийн хүсэлтийн бие ~4.5MB-аар
   хязгаарлагддаг. Аксонометр рендер, танилцуулга PDF зэрэг түүнээс том
   файл сервер хүртэл ч очихгүй таслагддаг. Зургийг нэмээд browser дээр
   шахаж жижигрүүлнэ. */

import { UPLOAD_TYPE_ERROR, isAllowedUploadType } from "@/lib/upload-types";

/** Зургийн илгээхийн өмнөх дээд хэмжээ — уртаашаа пиксел. */
const MAX_EDGE = 2000;
/** Үүнээс жижиг зургийг дахин кодлохгүй (лого, icon г.м. хэвээр үлдэнэ). */
const SKIP_UNDER_BYTES = 600 * 1024;
/** Үүнээс том файлыг server-ээр дамжуулахгүй, шууд Storage руу илгээнэ. */
const DIRECT_MIN_BYTES = 3.5 * 1024 * 1024;

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/** Canvas-аар дамжуулж болох растер төрлүүд (SVG/GIF-ийг хөндөхгүй). */
const isRaster = (type: string) =>
  type === "image/jpeg" || type === "image/png" || type === "image/webp";

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

async function decode(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* зарим хөтөч дээр бүтэхгүй — доорх аргаар */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("decode"));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Зургийг MAX_EDGE-д багтаан дахин кодлоно. Ашиггүй бол эх файлаа буцаана. */
async function shrink(file: File): Promise<Blob> {
  if (!isRaster(file.type) || file.size <= SKIP_UNDER_BYTES) return file;

  const src = await decode(file);
  const sw = src.width;
  const sh = src.height;
  if (!sw || !sh) return file;

  const scale = Math.min(1, MAX_EDGE / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);

  // JPEG нь тунгалаг байдлыг алддаг тул PNG/WebP-г WebP-ээр кодлоно.
  // Хөтөч WebP кодлохгүй бол toBlob нь PNG буцаана — тэр ч бас болно.
  const type = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";
  const quality = type === "image/jpeg" ? 0.85 : 0.9;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality)
  );
  return blob && blob.size < file.size ? blob : file;
}

/** Файлын өргөтгөлийг бодит төрөлд нь тааруулна (зурагт л хамаатай). */
function withExt(name: string, type: string): string {
  const ext = type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";
  const base = (name || "image").replace(/\.[^.]+$/, "");
  return `${base}.${ext}`;
}

/** Серверийн JSON алдааг (эсвэл статусыг) уншиж мессеж болгоно. */
async function errorFrom(res: Response, size: number): Promise<string> {
  const json = (await res.json().catch(() => null)) as { error?: string } | null;
  if (json?.error) return json.error;
  if (res.status === 401) {
    return "Нэвтрэлт дууссан байна. Хуудсыг сэргээгээд дахин нэвтэрнэ үү.";
  }
  if (res.status === 413) return `Файл хэтэрхий том байна (${mb(size)}MB).`;
  return `Байршуулж чадсангүй (сервер ${res.status}).`;
}

/** Шууд Storage руу. `null` = энэ орчинд боломжгүй (дуудагч тал буцаж унана). */
async function viaSignedUrl(
  blob: Blob,
  name: string,
  type: string
): Promise<UploadResult | null> {
  let signRes: Response;
  try {
    signRes = await fetch("/api/admin/upload/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: name, contentType: type }),
    });
  } catch {
    return { ok: false, error: "Сүлжээний алдаа — холболтоо шалгаад дахин оролдоно уу." };
  }

  const signed = (await signRes.json().catch(() => null)) as
    | { ok?: boolean; uploadUrl?: string; publicUrl?: string; unsupported?: boolean; error?: string }
    | null;

  // Локал горим г.м. — энгийн upload руу шилжинэ.
  if (signed?.unsupported) return null;
  if (!signRes.ok || !signed?.ok || !signed.uploadUrl || !signed.publicUrl) {
    return { ok: false, error: signed?.error ?? `Байршуулж чадсангүй (сервер ${signRes.status}).` };
  }

  // Supabase-ийн signed upload нь `cacheControl` + файл бүхий FormData-г
  // PUT хэлбэрээр хүлээж авна (token нь URL дотор — өөр header хэрэггүй).
  const fd = new FormData();
  fd.append("cacheControl", "3600");
  fd.append("", new File([blob], name, { type }));

  let putRes: Response;
  try {
    putRes = await fetch(signed.uploadUrl, { method: "PUT", body: fd });
  } catch {
    return { ok: false, error: "Файлыг илгээхэд сүлжээний алдаа гарлаа." };
  }
  if (!putRes.ok) {
    const detail = await putRes.text().catch(() => "");
    return {
      ok: false,
      error: `Storage файлыг хүлээж авсангүй (${putRes.status}). ${detail.slice(0, 160)}`.trim(),
    };
  }
  return { ok: true, url: signed.publicUrl };
}

/** Server дамжсан энгийн upload (жижиг файл, локал горим). */
async function viaApi(blob: Blob, name: string, type: string): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", new File([blob], name, { type }));

  let res: Response;
  try {
    res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  } catch {
    return { ok: false, error: "Сүлжээний алдаа — холболтоо шалгаад дахин оролдоно уу." };
  }

  const json = (await res.clone().json().catch(() => null)) as
    | { ok?: boolean; url?: string }
    | null;
  if (res.ok && json?.ok && typeof json.url === "string") return { ok: true, url: json.url };
  return { ok: false, error: await errorFrom(res, blob.size) };
}

/** Зураг эсвэл PDF-ийг байршуулж нийтийн URL-ийг буцаана. */
export async function uploadFile(file: File): Promise<UploadResult> {
  if (!isAllowedUploadType(file.type)) return { ok: false, error: UPLOAD_TYPE_ERROR };

  let payload: Blob = file;
  let name = file.name || "file";
  const type = file.type;
  try {
    const smaller = await shrink(file);
    if (smaller !== file) {
      payload = smaller;
      name = withExt(name, smaller.type);
    }
  } catch {
    /* шахалт бүтэхгүй бол эх файлаар нь илгээнэ */
  }
  const outType = payload.type || type;

  if (payload.size > DIRECT_MIN_BYTES) {
    const direct = await viaSignedUrl(payload, name, outType);
    if (direct) return direct; // null = боломжгүй → энгийн замаар
  }
  return viaApi(payload, name, outType);
}
