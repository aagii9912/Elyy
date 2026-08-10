/* Монкон Констракшны өмнөх төслүүдийн зураг — "Төсөл хэрэгжүүлэгч" хэсэг.
   Индекс нь FINAL.developer.projects-ийн дараалалтай яг таарна:
   Комфорт · Мандала хотхон · Мандала гарден · 360, 365 Мандала Тауэр.

   Зургууд нь Монконы жинхэнэ төслийн гэрэл зураг (захиалагчаас 2026-08-10-нд
   авсан). Эх файлуудыг 4:3 болгож хэрчээд 1600×1200 JPEG болгосон —
   дэлгэрэнгүйг docs/ASSETS-NEEDED.md §7-оос үз.

   Зураг солих бол зөвхөн энэ файлын `src`/`alt`-ыг өөрчилнө: / (MonoDeveloper)
   болон /final (FinalProjects) хоёул эндээс уншина. */

export type ProjectPhoto = {
  /** файлын нэр болгож ашиглах slug — public/images/projects/<slug>.jpg */
  slug: string;
  src: string;
  alt: string;
  /** placeholder эсэх — Elysium render түр тавьсан бол true */
  placeholder: boolean;
};

export const PROJECT_PHOTOS: ProjectPhoto[] = [
  {
    slug: "comfort",
    src: "/images/projects/comfort.jpg",
    alt: "Комфорт хотхон — Монкон Констракшн",
    placeholder: false,
  },
  {
    slug: "mandala-khotkhon",
    src: "/images/projects/mandala-khotkhon.jpg",
    alt: "Мандала хотхон — Монкон Констракшн",
    placeholder: false,
  },
  {
    slug: "mandala-garden",
    src: "/images/projects/mandala-garden.jpg",
    alt: "Мандала гарден — Монкон Констракшн",
    placeholder: false,
  },
  {
    slug: "mandala-tower-360",
    src: "/images/projects/mandala-tower-360.jpg",
    alt: "360, 365 Мандала Тауэр — Монкон Констракшн",
    placeholder: false,
  },
];
