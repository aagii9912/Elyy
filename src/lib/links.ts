/* ============================================================
   ELYSIUM — Гараар оруулсан холбоосыг цэвэрлэх туслах.

   Админаас (`/admin/site`) ирсэн хаяг үргэлж цэвэрхэн байдаггүй:
     • хуучин өгөгдмөл "#"-ийн АРД наасан → "#https://facebook.com/…"
     • схемгүй                            → "www.facebook.com/…"
     • илүү зай / шинэ мөр                → " https://… "

   Ийм утгыг шууд `href`-д тавибал браузер гадагш гарахгүй:
   "#https://…" нь зөвхөн одоогийн хуудсанд hash нэмнэ
   (`https://www.elysium.mn/#https://www.facebook.com/…`), схемгүй
   утга нь сайтын дотоод зам мэт үзэгдэнэ. Тиймээс рендерийн өмнө
   бүх ГАДААД холбоосыг эндүүр дамжуулна.

   Анхаар: цэсний "#apartments" мэт хуудас доторх зангуу нь ГАДААД
   холбоос БИШ — тэдгээрт энэ функцийг хэрэглэхгүй.
   ============================================================ */

/** `scheme:` угтвартай эсэх. */
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** Зөвшөөрөх схемүүд. Бусад нь (`javascript:`, `data:` …) хаягдана. */
const SAFE_SCHEME = /^(https?|mailto|tel|viber):/i;

/** Схемгүй домэйн: "facebook.com", "www.facebook.com/ElysiumbyMoncon". */
const BARE_DOMAIN = /^[\w-]+(\.[\w-]+)+([/?#].*)?$/;

/**
 * Гадаад холбоосыг браузерт өгөхөд бэлэн хэлбэрт оруулна.
 * Холбоос болгож чадахгүй утга дээр ХООСОН мөр буцаана — дуудаж буй
 * тал түүнийг "тохируулаагүй" гэж үзэж элементийг нуух ёстой.
 *
 *   externalHref("#https://www.facebook.com/Elysium") // "https://www.facebook.com/Elysium"
 *   externalHref("www.facebook.com/Elysium")          // "https://www.facebook.com/Elysium"
 *   externalHref("#")                                  // ""
 *   externalHref("Elysium")                            // ""
 */
export function externalHref(raw?: string | null): string {
  const value = (raw ?? "").trim();
  if (!value) return "";

  /* Тэргүүн "#" — хуучин өгөгдмөл утга дээр хаягаа наасны ул мөр. */
  const cleaned = value.replace(/^[#\s]+/, "").trim();
  if (!cleaned || cleaned === "/") return "";

  /* Сайтын дотоод зам ("/brochure.pdf") — хэвээр нь. */
  if (cleaned.startsWith("/")) return cleaned;

  if (SCHEME.test(cleaned)) {
    if (!SAFE_SCHEME.test(cleaned)) return "";
    /* "https://" ганцаараа — хаяг нь дутуу. */
    const rest = cleaned.replace(/^[a-z][a-z0-9+.-]*:(\/\/)?/i, "").trim();
    return rest ? cleaned : "";
  }

  /* Схемгүй домэйн — https:// нөхнө. */
  return BARE_DOMAIN.test(cleaned) ? `https://${cleaned}` : "";
}
