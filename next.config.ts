import type { NextConfig } from "next";

/* Админы оруулсан зураг хоёр газар очдог (`src/lib/store.ts`):
     • Supabase Storage → `https://<ref>.supabase.co/storage/...` (гадаад),
     • локал драйвер     → `/uploads/...` (нэг эх сурвалж, тохиргоо шаардахгүй).
   `next/image` нь тохируулаагүй гадаад хостыг ЗӨВШӨӨРДӨГГҮЙ тул цомог,
   ELYS, төслийн зургууд админаар солигдвол алдаа өгөх байсан. Хостыг
   орчны хувьсагчаас гаргаж авна: Supabase тохируулаагүй бол гадаад хаяг
   бас үүсэхгүй, жагсаалт хоосон үлдэнэ. */
const supabaseHost = (() => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
