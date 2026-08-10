/* ============================================================
   ELYSIUM — Admin auth (нэг нууц үг + гарын үсэгтэй cookie)
   Зөвхөн Web Crypto + process.env ашиглана → middleware (edge)
   болон API route (node) хоёуланд ажиллана. Node-only import
   энд оруулж БОЛОХГҮЙ.

   ENV:
     ADMIN_PASSWORD        — админд нэвтрэх нууц үг (заавал, production)
     ADMIN_SESSION_SECRET  — cookie гарын үсгийн нууц (заавал биш;
                             байхгүй бол ADMIN_PASSWORD-оос үүсгэнэ)
   ADMIN_PASSWORD тохируулаагүй бол auth ИДЭВХГҮЙ (зөвхөн локал
   хөгжүүлэлтэд). Production дээр заавал тохируулна.
   ============================================================ */

export const SESSION_COOKIE = "ely_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 хоног

const enc = new TextEncoder();

function adminPassword(): string | undefined {
  const p = process.env.ADMIN_PASSWORD;
  return p && p.length > 0 ? p : undefined;
}

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "elysium-dev-secret";
}

/** ADMIN_PASSWORD тохируулаагүй → auth идэвхгүй (нээлттэй, зөвхөн локалд). */
export function authDisabled(): boolean {
  return adminPassword() === undefined;
}

/** Тогтмол хугацааны (timing-safe) мөр харьцуулалт. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(input: string): boolean {
  const pw = adminPassword();
  if (pw === undefined) return true; // auth идэвхгүй үед бүх зүйл зөвшөөрөгдөнө
  return safeEqual(input, pw);
}

async function hmacHex(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Гарын үсэгтэй session token үүсгэнэ: `<exp>.<hmac(exp)>` */
export async function createSessionToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const sig = await hmacHex(String(exp));
  return `${exp}.${sig}`;
}

/** Token-ыг шалгана — гарын үсэг зөв ба хугацаа дуусаагүй эсэх. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const expected = await hmacHex(expStr);
  return safeEqual(sig, expected);
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
