import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE, SESSION_COOKIE_OPTIONS, authDisabled, createSessionToken, shouldRenewSession, verifySessionToken,
} from "@/lib/auth";

/* Админ (/admin) болон админ API (/api/admin) хандалтыг хамгаална.
   Нэвтрээгүй бол: хуудас → /admin/login руу, API → 401.
   Идэвхтэй ажиллаж байгаа бол нэвтрэлтийг автоматаар сунгана.
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
  if (token && await verifySessionToken(token)) {
    const res = NextResponse.next();
    if (shouldRenewSession(token)) res.cookies.set(SESSION_COOKIE, await createSessionToken(), SESSION_COOKIE_OPTIONS);
    return res;
  }

  if (pathname.startsWith("/api/")) {
    // Засварлагч энэ мессежийг шууд харуулдаг — хийсэн засвар нь хуудсандаа үлдэнэ.
    return NextResponse.json({
      ok: false,
      code: "unauthorized",
      error: "Нэвтрэлтийн хугацаа дууссан. Хуудсаа хаалгүйгээр шинэ таб дээр /admin/login-оор нэвтэрч ороод энд дахин оролдоно уу — оруулсан мэдээлэл хадгалагдсан хэвээр байна.",
    }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = PAGE_LOGIN;
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
