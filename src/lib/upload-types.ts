/* Байршуулахыг зөвшөөрсөн файлын төрлүүд — сервер (upload, upload/sign)
   болон админы клиент хоёулаа эндээс уншина. */

/** Зураг — бүх растер төрөл. Танилцуулга — зөвхөн PDF. */
export const ALLOWED_UPLOAD_TYPES = ["application/pdf"] as const;

export function isAllowedUploadType(contentType: string): boolean {
  return (
    contentType.startsWith("image/") ||
    (ALLOWED_UPLOAD_TYPES as readonly string[]).includes(contentType)
  );
}

export const UPLOAD_TYPE_ERROR = "Зөвхөн зураг эсвэл PDF оруулах боломжтой.";
