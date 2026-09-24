/* Байршуулахыг зөвшөөрсөн файлын төрлүүд — сервер (upload, upload/sign)
   болон админы клиент хоёулаа эндээс уншина. */

/** Зураг, танилцуулга PDF, дэвсгэр видеоны хөтөч дэмждэг төрлүүд. */
export const ALLOWED_UPLOAD_TYPES = ["application/pdf", "video/mp4", "video/webm", "video/quicktime"] as const;

export function isAllowedUploadType(contentType: string): boolean {
  return (
    contentType.startsWith("image/") ||
    (ALLOWED_UPLOAD_TYPES as readonly string[]).includes(contentType)
  );
}

export const UPLOAD_TYPE_ERROR = "Зөвхөн зураг, PDF, MP4, WebM эсвэл MOV оруулах боломжтой.";
