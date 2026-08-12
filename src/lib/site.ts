/* ============================================================
   ELYSIUM — Үндсэн сайтын контентыг сервер талд ачаалах.
   Storage-оос уншаад өгөгдмөл утган дээр давхарлана. Уншилт
   амжилтгүй бол (DB унтарсан, тохируулаагүй г.м.) сайт унахгүй —
   өгөгдмөл контентоор рендерлэнэ.
   ============================================================ */

import "server-only";
import { cache } from "react";
import { getStore } from "./store";
import { mergeSiteContent, type SiteContent } from "./site-content";

/** Нэг хүсэлтийн дотор дахин дуудахад storage руу дахин очихгүй
 *  (`generateMetadata` + хуудас хоёулаа дуудна). */
export const loadSiteContent = cache(async (): Promise<SiteContent> => {
  try {
    return mergeSiteContent(await getStore().getSiteContent());
  } catch (err) {
    console.error("[site] контент ачаалахад алдаа гарлаа, өгөгдмөлөөр рендерлэнэ:", err);
    return mergeSiteContent(undefined);
  }
});
