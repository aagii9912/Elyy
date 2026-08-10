import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken, authDisabled } from "@/lib/auth";

/* Админ (/admin) болон админ API (/api/admin) хандалтыг хамгаална.
   Нэвтрээгүй бол: хуудас → /admin/login руу, API → 401.
   ADMIN_PASSWORD тохируулаагүй бол (локал) чөлөөтэй нэвтрүүлнэ. */

const PAGE_LOGIN = "/admin/login";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Нэвтрэх хуудас / нэвтрэх API — үргэлж нээлттэй
  if (pathname === PAGE_LOGIN || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  if (authDisabled()) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySessionToken(token);
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = PAGE_LOGIN;
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
