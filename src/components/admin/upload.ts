"use client";

/* Админы зураг байршуулах туслах — `ImageField` болон нийтлэлийн
   «Зураг оруулах» товч хоёулаа үүнийг дуудна.

   Илгээхийн өмнө browser дээр хэмжээг багасгаж шахна. Аксонометр,
   интерьер рендерүүд ихэвчлэн 10–20MB байдаг бөгөөд Vercel дээр
   serverless функцийн хүсэлтийн бие ~4.5MB-аар хязгаарлагддаг тул
   шахалтгүйгээр илгээвэл сервер хүртэл ч очихгүй. */

/** Илгээхийн өмнөх дээд хэмжээ — уртаашаа пиксел. */
const MAX_EDGE = 2000;
/** Үүнээс жижиг файлыг дахин кодлохгүй (лого, icon г.м. хэвээр үлдэнэ). */
const SKIP_UNDER_BYTES = 600 * 1024;

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

/** Файлын өргөтгөлийг бодит төрөлд нь тааруулна. */
function withExt(name: string, type: string): string {
  const ext = type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";
  const base = (name || "image").replace(/\.[^.]+$/, "");
  return `${base}.${ext}`;
}

/** Зургийг `/api/admin/upload` руу илгээж, нийтийн URL-ийг буцаана. */
export async function uploadImageFile(file: File): Promise<UploadResult> {
  let payload: Blob = file;
  let name = file.name || "image";
  try {
    const smaller = await shrink(file);
    if (smaller !== file) {
      payload = smaller;
      name = withExt(name, smaller.type);
    }
  } catch {
    /* шахалт бүтэхгүй бол эх файлаар нь илгээнэ */
  }

  const fd = new FormData();
  fd.append("file", new File([payload], name, { type: payload.type || file.type }));

  let res: Response;
  try {
    res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  } catch {
    return { ok: false, error: "Сүлжээний алдаа — холболтоо шалгаад дахин оролдоно уу." };
  }

  const json = (await res.json().catch(() => null)) as
    | { ok?: boolean; url?: string; error?: string }
    | null;

  if (res.ok && json?.ok && typeof json.url === "string") return { ok: true, url: json.url };
  if (json?.error) return { ok: false, error: json.error };
  if (res.status === 401) {
    return { ok: false, error: "Нэвтрэлт дууссан байна. Хуудсыг сэргээгээд дахин нэвтэрнэ үү." };
  }
  if (res.status === 413) {
    return { ok: false, error: `Зураг хэтэрхий том байна (${mb(payload.size)}MB).` };
  }
  return { ok: false, error: `Байршуулж чадсангүй (сервер ${res.status}).` };
}
