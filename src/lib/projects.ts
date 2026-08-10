/* Монкон Констракшны өмнөх төслүүдийн зураг — "Төсөл хэрэгжүүлэгч" хэсэг.
   Индекс нь FINAL.developer.projects-ийн дараалалтай яг таарна:
   Комфорт · Мандала хотхон · Мандала гарден · 360, 365 Мандала Тауэр.

   ЗУРАГ ОДООГООР PLACEHOLDER: эдгээр нь Elysium-ийн render-ууд, Монконы
   жинхэнэ төслийн гэрэл зураг БИШ. Жинхэнэ зураг ирмэгц зөвхөн энэ файлын
   `src`/`alt` талбарыг солиход /- (MonoDeveloper) болон /final (FinalProjects)
   хоёулаа шинэчлэгдэнэ. Спек ба эх сурвалжийн жагсаалт: docs/ASSETS-NEEDED.md §7 */

export type ProjectPhoto = {
  /** файлын нэр болгож ашиглах slug — public/images/projects/<slug>.jpg */
  slug: string;
  src: string;
  alt: string;
  /** placeholder эсэх — жинхэнэ зураг тавихад false болгоно */
  placeholder: boolean;
};

export const PROJECT_PHOTOS: ProjectPhoto[] = [
  {
    slug: "comfort",
    src: "/images/exterior-towers-winter.jpg",
    alt: "Комфорт хотхон",
    placeholder: true,
  },
  {
    slug: "mandala-khotkhon",
    src: "/images/exterior-lowangle-towers.jpg",
    alt: "Мандала хотхон",
    placeholder: true,
  },
  {
    slug: "mandala-garden",
    src: "/images/aerial-courtyard-promenade.jpg",
    alt: "Мандала гарден",
    placeholder: true,
  },
  {
    slug: "mandala-tower-360",
    src: "/images/hero-towers-bluesky.png",
    alt: "360, 365 Мандала Тауэр",
    placeholder: true,
  },
];
