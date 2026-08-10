import { NextResponse } from "next/server";
import { checkPassword, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = String(body?.password ?? "");
  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "Нууц үг буруу байна." }, { status: 401 });
  }
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
