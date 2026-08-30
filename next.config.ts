import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Нэг лавлахад хоёр `next dev` зэрэг ажиллахгүй — Next нь
     `<distDir>/dev/lock` дээр цоож тавьдаг. `NEXT_DIST_DIR` өгвөл өөр
     build хавтас ашиглана, ингэснээр зэрэгцээ session (жишээ нь
     баталгаажуулалтын урьдчилсан харагдац) өөрийн сервертэй болно.
     Тохируулаагүй үед хэвийн `.next`. */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
