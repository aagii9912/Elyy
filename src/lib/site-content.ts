/* ============================================================
   ELYSIUM — Үндсэн сайтын (`/`) бүх засварлагдах контент.

   Энэ файл нь ХАДГАЛАГДААГҮЙ ҮЕИЙН ӨГӨГДМӨЛ утгыг агуулна. Админ
   (`/admin/site`) дээр засвар хийхэд өөрчлөлт нь storage-д (Supabase
   `site_content` хүснэгт эсвэл локал `.data/site.json`) JSON хэлбэрээр
   хадгалагдана. Хуудас рендерлэхдээ хадгалсан JSON-ыг доорх өгөгдмөл
   утган дээр `mergeSiteContent`-оор давхарлана — ингэснээр:
     • шинэ талбар нэмэхэд хуучин хадгалсан өгөгдөл эвдрэхгүй,
     • танихгүй/хог талбарууд хаягдана,
     • буруу төрөлтэй утга ирвэл өгөгдмөл рүү буцна.

   Client болон server хоёуланд import хийгддэг тул энд server-only
   код (fs, supabase г.м.) БАЙХГҮЙ.
   ============================================================ */

export type NavLink = { label: string; href: string };
export type StoryPointContent = { heading: string; accent: string; text: string };
export type TitledItem = { title: string; body: string };
/** Гадаад эх сурвалж руу заасан карт (ж: үйлдвэрлэгчийн хуудас). */
export type LinkedItem = TitledItem & { link: string };
/** Сошиал холбоос. `icon` — facebook | instagram | youtube | tiktok |
 *  linkedin | twitter | link. `href` хоосон/"#" бол харагдахгүй. */
export type SocialLink = NavLink & { icon: string };

export type SiteContent = {
  seo: { title: string; description: string };

  brand: {
    /** Hero-гийн том гарчиг (үг тус бүр mask-аар гарч ирнэ). */
    line: string;
    /** Hero-гийн дээд kicker + footer-ийн танилцуулга эхлэл. */
    tag: string;
    email: string;
    /** Танилцуулга PDF-ийн зам. */
    brochureUrl: string;
  };

  /** Танилцуулга татахын өмнөх холбоо барих маягт (lead capture).
   *  `enabled: false` үед PDF шууд нээгдэнэ. */
  brochure: {
    enabled: boolean;
    title: string;
    sub: string;
    name: string;
    phone: string;
    email: string;
    consent: string;
    submit: string;
    sending: string;
    error: string;
    successTitle: string;
    successBody: string;
    downloadLabel: string;
  };

  nav: {
    items: NavLink[];
    brochureLabel: string;
    ctaLabel: string;
    menuAria: string;
  };

  hero: { sub: string };

  /** Chapter 01 — Ерөнхий төлөвлөлт (тоон үзүүлэлт). */
  plan: { kicker: string; title: string; points: StoryPointContent[] };

  /** Chapter 02 — ELYS консепц. Зүйл бүрийн эхний үсэг ELYS нэрийг
   *  бүрдүүлнэ; самбар дээр дарахад дэлгэрэнгүй pop-up нээгдэнэ. */
  elys: {
    kicker: string;
    title: string;
    /** Гарчгийн баруун талын танилцуулга өгүүлбэр. */
    body: string;
    /** Идэвхтэй самбар дээрх "дэлгэрэнгүй" шошго. */
    moreLabel: string;
    items: TitledItem[];
  };

  /** Үндсэн бүтээц — материалын карт бүр дээр дарахад дэлгэрэнгүй
   *  pop-up нээгдэнэ (`image` = pop-up доторх зураг, хоосон байж болно). */
  equip: {
    kicker: string;
    title: string;
    body: string;
    /** Карт дээрх "дэлгэрэнгүй" шошго. */
    moreLabel: string;
    /** Pop-up доторх эх сурвалжийн холбоосын шошго. */
    sourceLabel: string;
    items: (LinkedItem & { image: string })[];
  };

  /** VR / 360° аялал. `embedUrl` тохируулсан үед постер дээр дарахад
   *  бүтэн дэлгэцийн pop-up дотор аялал нээгдэнэ. Хоосон үед секц
   *  "тун удахгүй" төлөвтэй харагдаж, CTA нь уулзалт руу хөтөлнө —
   *  ингэснээр VR хэсэг сайт дээр үргэлж байна. Постер ч хоосон бол
   *  секц огт рендерлэгдэхгүй. */
  vr: {
    kicker: string;
    title: string;
    body: string;
    /** Matterport / Kuula / YouTube 360 embed URL. */
    embedUrl: string;
    /** Тоглуулахаас өмнөх постер зураг. */
    poster: string;
    ctaLabel: string;
    note: string;
    /** Аялал бэлэн болоогүй үеийн шошго ба CTA. */
    soonLabel: string;
    soonCta: string;
  };

  /** Гурван бүлгийн баруун талын навигацийн шошго. */
  storyNav: { plan: string; elys: string; equip: string };

  marquee: { slogans: string[] };

  apartments: {
    kicker: string;
    title: string;
    body: string;
    /** Карт дээрх "N өнцөг" гэсний дараах үг. */
    viewsWord: string;
    cardCta: string;
    /** B1/B2 шүүлтүүрийн "бүгд" таб. */
    allLabel: string;
    /** Тухайн тип рүү чиглэсэн хүсэлтийн pop-up. */
    inquiry: {
      title: string;
      sub: string;
      name: string;
      phone: string;
      note: string;
      submit: string;
      sending: string;
      error: string;
      successTitle: string;
      successBody: string;
    };
    ctaCard: { kicker: string; title: string; link: string };
    units: {
      /** Типийн нэр — карт дээрх шошго (ж: "A тип"). */
      title: string;
      rooms: string;
      /** Талбай эсвэл давхрын тэмдэглэгээ. */
      area: string;
      /** Барилгын блок (ж: "B1"). Хоосон бол шүүлтүүрт орохгүй. */
      block: string;
      /** Карт дээрх жижиг зураг. */
      thumb: string;
      /** Lightbox-д гүйлгэх өнцгүүд. */
      views: string[];
    }[];
  };

  developer: {
    kicker: string;
    name: string;
    body: string;
    /** Timeline-ийн ард гарах компанийн icon. Хоосон бол гүйдэг он харагдана. */
    logo: string;
    since: string;
    sinceLabel: string;
    projectCount: string;
    projectCountLabel: string;
    scrollHint: string;
    /** `units` нь картын булан дахь бүтэн шошго (ж: "600 айл"). */
    projects: { title: string; meta: string; units: string; years: string; image: string }[];
  };

  gallery: {
    kicker: string;
    title: string;
    images: { src: string; tag: string }[];
  };

  location: {
    kicker: string;
    directionsLabel: string;
    addressLabel: string;
    tabs: {
      project: { label: string; title: string; address: string; coords: string };
      office: { label: string; title: string; address: string; coords: string };
    };
    nearby: { label: string; items: { place: string; distance: string; kind: string }[] }[];
    office: { phoneLabel: string; hoursLabel: string; emailLabel: string; ctaLabel: string };
  };

  contact: {
    kicker: string;
    title: string;
    sub: string;
    phone: string;
    hours: string;
    location: string;
    labels: { phone: string; hours: string; office: string; email: string };
    form: {
      name: string;
      phone: string;
      dateLabel: string;
      submit: string;
      sending: string;
      error: string;
      successTitle: string;
      successBody: string;
    };
  };

  managers: {
    kicker: string;
    title: string;
    body: string;
    /** Борлуулалтын албаны цагийн хуваарь — тайлбарын доор гарна. */
    hoursLabel: string;
    hours: string;
    callLabel: string;
    viberLabel: string;
    /** `photo` хоосон бол товчлол (initials) бүхий дугуй харагдана. */
    items: { name: string; initials: string; role: string; phone: string; photo: string }[];
  };

  faq: { kicker: string; title: string; items: { q: string; a: string }[] };

  /** `/news` хуудасны текст. Нийтлэлүүд өөрсдөө storage-д тусдаа
   *  хадгалагдаж, `/admin/news`-ээс удирдагдана. */
  news: {
    /** Толгой/хөл цэсэнд харагдах нэр. */
    navLabel: string;
    kicker: string;
    title: string;
    sub: string;
    empty: string;
    readMore: string;
    backLabel: string;
    moreTitle: string;
  };

  footer: {
    salesTitle: string;
    menuTitle: string;
    socialTitle: string;
    menu: NavLink[];
    social: SocialLink[];
    note: string;
  };

  chatbot: {
    title: string;
    subtitle: string;
    greeting: string;
    placeholder: string;
    fallback: string;
    quick: string[];
    /** `keys` — таслалаар тусгаарласан түлхүүр үгс. */
    answers: { keys: string; a: string }[];
  };
};

/* ------------------------------------------------------------------ */
/* Өгөгдмөл контент — одоогийн сайт дээр байгаа бүх текст.             */
/* ------------------------------------------------------------------ */

export const DEFAULT_SITE_CONTENT: SiteContent = {
  seo: {
    title: "Elysium Residence — Бизнес зэрэглэлийн орон сууц",
    description:
      "4 блок, 506 айлын орон сууц. Нийт талбайн 85% нь ногоон, нийтийн эзэмшлийн орон зай. 2027 оны 2-р улиралд ашиглалтад орно.",
  },

  brand: {
    line: "Elysium Residence",
    tag: "Бизнес зэрэглэлийн орон сууц",
    email: "info@elysium.mn",
    brochureUrl: "/brochure.pdf",
  },

  brochure: {
    enabled: true,
    title: "Танилцуулга татах",
    sub: "Утас, и-мэйлээ үлдээснээр танилцуулга шууд татагдаж, менежер тантай холбогдоно.",
    name: "Нэр",
    phone: "Утас",
    email: "И-мэйл",
    consent: "Мэдээллийг зөвхөн танилцуулга хүргэх, холбогдох зорилгоор ашиглана.",
    submit: "Татах",
    sending: "Илгээж байна…",
    error: "Илгээхэд алдаа гарлаа. Дахин оролдоно уу.",
    successTitle: "Баярлалаа! Татаж эхэллээ.",
    successBody: "Хэрэв автоматаар татагдаагүй бол доорх холбоосыг дарна уу.",
    downloadLabel: "Танилцуулга нээх ↓",
  },

  nav: {
    items: [
      { label: "Төслийн тухай", href: "#about" },
      { label: "Давуу тал", href: "#elys" },
      { label: "Өрөөний сонголт", href: "#apartments" },
      { label: "Төсөл хэрэгжүүлэгч", href: "#developer" },
      { label: "Байршил", href: "#location" },
      { label: "FAQ", href: "#faq" },
    ],
    brochureLabel: "Танилцуулга татах",
    ctaLabel: "Уулзалт товлох",
    menuAria: "Цэс",
  },

  hero: {
    sub: "Туул голын салхи илбэсэн бүсэд байршилтай, архитектур болон инженерингийн эргономик шийдэлтэй орон сууц.",
  },

  plan: {
    kicker: "Ерөнхий төлөвлөлт",
    title: "Form Follows Function",
    points: [
      { heading: "506", accent: "", text: "айлын орон сууц · 4 блок" },
      { heading: "85", accent: "%", text: "нийтийн эзэмшлийн талбай — ногоон байгууламж, орон зай" },
      { heading: "513", accent: "", text: "автомашины зогсоол" },
      { heading: "2027 · II", accent: "", text: "улиралд ашиглалтад орно" },
    ],
  },

  elys: {
    kicker: "Агшин бүрд мэдрэх тав тух",
    title: "Төслийн консепц — ELYS",
    body: "Эргономик төлөвлөлт, ногоон орчин, аюулгүй байдал, эрчим хүчний хэмнэлт — дөрвөн зарчмын эхний үсэг ELYS нэрийг бүрдүүлнэ. Аль ч хэсэг дээр дарж дэлгэрэнгүйг үзнэ үү.",
    moreLabel: "Дэлгэрэнгүй",
    items: [
      {
        title: "Ergonomic Standards",
        body: "Эрүүл амьдрахад тань зориулж, хүний бүх хэрэгцээг тооцоолон гаргасан эргономик шийдэлтэй тул тав тухтай амьдрах боломжтой.",
      },
      {
        title: "Live in Harmony",
        body: "Эрүүл зөв амьдралын хэв маягт хөтлөх нийтийн эзэмшлийн ногоон байгууламж талбайг төлөвлөсөн.",
      },
      {
        title: "Your Safety",
        body: "Аюулгүй байдал тав тухыг хангасан орчин үеийн нэвтрэлтийн нэгдсэн системийг цогцоор нь төлөвлөсөн.",
      },
      {
        title: "Save Big",
        body: "Дулаан алдагдал багатай, эрчим хүчний хэмнэлттэй шийдэл нь урт хугацаандаа таны ашиглалтын зардлыг бууруулна.",
      },
    ],
  },

  equip: {
    kicker: "Дэлгэрэнгүйд нухацтай",
    title: "Барилгын бүтэц",
    body: "Каркасаас фасад хүртэл ашигласан үндсэн материал, тоноглол бүр нь урт хугацааны тав тух, эрчим хүчний хэмнэлтэд ажиллана.",
    moreLabel: "Дэлгэрэнгүй",
    sourceLabel: "Үйлдвэрлэгчийн хуудас",
    /* Дараалал нь барилгын бичлэгийн үе шатыг дагана:
       цутгамал каркас → цонх → фасад. `image` хоосон үед MonoEquip нь
       барилгын бичлэгээс дарааллын дагуу кадр авна — өгөгдмөлд зураг
       бичвэл `mergeSiteContent` түүнийг ХАДГАЛСАН бүх материал руу
       хуулж, бүгд нэг ижил зурагтай болно. */
    items: [
      {
        title: "Бүрэн цутгамал хийцлэл",
        body: "Газар хөдлөлтийн 8 баллд тэсвэртэй, айл хоорондын дуу тусгаарлалт сайтай бүрэн цутгамал хийцлэл.",
        link: "",
        image: "",
      },
      {
        title: "Veka Softline",
        body: "E-Low түрхлэгтэй, гурван давхар шилтэй вакум цонх нь гэрт буй дулааныг гадагшлуулахгүй байхаас гадна хэт халалтаас хамгаална.",
        link: "https://www.veka.de/window-fabricators/products-services/front-doors/softline-82/",
        image: "",
      },
      {
        title: "Yaret aluminum composite panels",
        body: "Гурван давхар дулаалга бүхий гал дэмжихгүй метал фасад.",
        link: "https://www.yaretacp.com/",
        image: "",
      },
    ],
  },

  vr: {
    kicker: "Виртуал аялал",
    title: "Elysium-ийг 360°-аар үзэх",
    body: "Байрандаа биечлэн ирэхээсээ өмнө өрөө бүрийг виртуалаар тойрон үзэж, орон зайн мэдрэмжийг аваарай.",
    /* Админаас (`/admin/site` → VR аялал) Matterport / Kuula / YouTube 360
       embed URL оруулна. Хоосон үед "тун удахгүй" төлөв харагдана. */
    embedUrl: "",
    poster: "/images/interior/living-01.jpg",
    ctaLabel: "Аялал эхлүүлэх",
    note: "Хамгийн сайн үзэгдэл — бүтэн дэлгэц эсвэл VR төхөөрөмж дээр.",
    soonLabel: "360° аялал — тун удахгүй",
    soonCta: "Биечлэн үзэх цаг товлох",
  },

  storyNav: {
    plan: "Ерөнхий төлөвлөлт",
    elys: "ELYS концепц",
    equip: "Барилгын бүтэц",
  },

  marquee: {
    slogans: ["Form Follows Function", "Form Follows Comfort", "Form Follows Serenity"],
  },

  apartments: {
    kicker: "Өрөөний сонголт",
    title: "Танд тохирох орон зай",
    body: "Уужим, ашигтай, минимал орон сууцны сонголтоос та өөрт тохирохыг сонгоорой.",
    viewsWord: "өнцөг",
    cardCta: "Сонирхох",
    allLabel: "Бүх тип",
    inquiry: {
      title: "Энэ типийг сонирхож байна",
      sub: "Нэр, утсаа үлдээгээрэй — менежер тухайн типийн төлөвлөгөө, үнийн мэдээллийг хүргэнэ.",
      name: "Нэр",
      phone: "Утас",
      note: "Нэмэлт тайлбар (заавал биш)",
      submit: "Хүсэлт илгээх",
      sending: "Илгээж байна…",
      error: "Илгээхэд алдаа гарлаа. Дахин оролдоно уу.",
      successTitle: "Хүсэлтийг хүлээн авлаа.",
      successBody: "Борлуулалтын менежер тантай удахгүй холбогдоно.",
    },
    ctaCard: {
      kicker: "Аксонометр зураг",
      title: "Төлөвлөгөөгөө менежертэй хамт сонгоорой",
      link: "Уулзалт товлох",
    },
    /* `block` — B1/B2 шүүлтүүр. Одоогоор бүгд B1 дээр байна; зөв
       хуваарилалтыг `/admin/site` → Өрөөний сонголт хэсгээс сонгоно. */
    units: [
      {
        title: "A тип",
        rooms: "3 өрөө",
        area: "79.70 м²",
        block: "B1",
        thumb: "/images/axono/a-01-sm.jpg",
        views: ["/images/axono/a-01.jpg", "/images/axono/a-02.jpg"],
      },
      {
        title: "B тип",
        rooms: "4 өрөө",
        area: "137.59 м²",
        block: "B1",
        thumb: "/images/axono/b-01-sm.jpg",
        views: ["/images/axono/b-01.jpg", "/images/axono/b-02.jpg"],
      },
      {
        title: "C тип",
        rooms: "3 өрөө",
        area: "78.67 м²",
        block: "B1",
        thumb: "/images/axono/c-01-sm.jpg",
        views: ["/images/axono/c-01.jpg", "/images/axono/c-02.jpg"],
      },
      {
        title: "D тип",
        rooms: "2 өрөө",
        area: "50.15 м²",
        block: "B1",
        thumb: "/images/axono/d-01-sm.jpg",
        views: ["/images/axono/d-01.jpg", "/images/axono/d-02.jpg"],
      },
      {
        title: "D тип · 2 давхар",
        rooms: "2 өрөө",
        area: "2-р давхрын төлөвлөлт",
        block: "B1",
        thumb: "/images/axono/d2f-01-sm.jpg",
        views: ["/images/axono/d2f-01.jpg", "/images/axono/d2f-02.jpg"],
      },
      {
        title: "E тип",
        rooms: "3 өрөө",
        area: "88.08 м²",
        block: "B2",
        thumb: "/images/axono/e-01-sm.jpg",
        views: ["/images/axono/e-01.jpg", "/images/axono/e-02.jpg"],
      },
      {
        title: "E тип · 2 давхар",
        rooms: "2 өрөө",
        area: "2-р давхрын төлөвлөлт",
        block: "B2",
        thumb: "/images/axono/e2f-01-sm.jpg",
        views: ["/images/axono/e2f-01.jpg", "/images/axono/e2f-02.jpg"],
      },
    ],
  },

  developer: {
    kicker: "Төсөл хэрэгжүүлэгч",
    name: "Монкон Констракшн ХХК",
    body: "Монкон Констракшн ХХК нь 2006 оноос хойш захиалагч, хэрэглэгчдэдээ барилгын зураг төслөөс эхлээд түлхүүр гардуулах хүртэлх барилгын цогц үйлчилгээг хүргэхдээ архитектурын шинэлэг шийдлийг нэвтрүүлж, барилга угсралтын чанараа тогтмол сайжруулсаар ирсэн. Өнөөдрийг хүртэл 60 гаруй төслийг амжилттай хэрэгжүүлээд байна.",
    logo: "",
    since: "2006",
    sinceLabel: "оноос",
    projectCount: "60+",
    projectCountLabel: "төсөл",
    scrollHint: "Гүйлгэж үргэлжлүүлэх →",
    projects: [
      {
        title: "Комфорт хотхон",
        meta: "15 давхар · 600 айл",
        units: "600 айл",
        years: "2014–2019",
        image: "/images/projects/comfort.jpg",
      },
      {
        title: "Мандала хотхон",
        meta: "18 давхар · 510 айл",
        units: "510 айл",
        years: "2015–2019",
        image: "/images/projects/mandala-khotkhon.jpg",
      },
      {
        title: "Мандала гарден",
        meta: "16 давхар · 2500 айл",
        units: "2500 айл",
        years: "2019–2030",
        image: "/images/projects/mandala-garden.jpg",
      },
      {
        title: "360, 365 Мандала Тауэр",
        meta: "25 давхар · 200 айл",
        units: "200 айл",
        years: "2018–2025",
        image: "/images/projects/mandala-tower-360.jpg",
      },
    ],
  },

  gallery: {
    kicker: "Зургийн цомог",
    title: "Elysium-ийн дүр төрх",
    images: [
      { src: "/images/interior/living-01.jpg", tag: "Зочны өрөө" },
      { src: "/images/interior/bedroom-01.jpg", tag: "Унтлагын өрөө" },
      { src: "/images/interior/living-02.jpg", tag: "Зочны өрөө" },
      { src: "/images/interior/bath-01.jpg", tag: "Угаалгын өрөө" },
      { src: "/images/interior/living-03.jpg", tag: "Зочны өрөө" },
      { src: "/images/interior/bedroom-02.jpg", tag: "Унтлагын өрөө" },
      { src: "/images/interior/living-04.jpg", tag: "Зочны өрөө" },
      { src: "/images/interior/bedroom-03.jpg", tag: "Унтлагын өрөө" },
      { src: "/images/interior/living-05.jpg", tag: "Зочны өрөө" },
      { src: "/images/interior/bath-02.jpg", tag: "Угаалгын өрөө" },
      { src: "/images/interior/living-06.jpg", tag: "Зочны өрөө" },
      { src: "/images/interior/bedroom-04.jpg", tag: "Унтлагын өрөө" },
      { src: "/images/interior/bedroom-05.jpg", tag: "Унтлагын өрөө" },
      { src: "/images/interior/bath-03.jpg", tag: "Угаалгын өрөө" },
    ],
  },

  location: {
    kicker: "Байршил",
    directionsLabel: "Чиглэл авах ↗",
    addressLabel: "Хаяг",
    tabs: {
      project: {
        label: "Төслийн байршил",
        title: "Хотын төвд, байгалийн хажууд",
        address: "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, Улаанбаатар",
        coords: "47.89733862835647,106.88538756153864",
      },
      office: {
        label: "Борлуулалтын оффис",
        title: "Биечлэн ирж танилцаарай",
        address: "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэр",
        coords: "47.90146685024925,106.93241183285195",
      },
    },
    nearby: [
      {
        label: "Боловсрол",
        items: [
          { place: "Номин Кидс", distance: "450", kind: "Цэцэрлэг" },
          { place: "Оном сургууль", distance: "600", kind: "Сургууль" },
          { place: "18-р сургууль", distance: "1000", kind: "Сургууль" },
          { place: "72-р цэцэрлэг", distance: "1000", kind: "Цэцэрлэг" },
          { place: "Орхон Хасу", distance: "1200", kind: "Сургууль" },
          { place: "15-р сургууль", distance: "1500", kind: "Сургууль" },
          { place: "65-р цэцэрлэг", distance: "1650", kind: "Цэцэрлэг" },
          { place: "67-р цэцэрлэг", distance: "1790", kind: "Цэцэрлэг" },
          { place: "75-р сургууль", distance: "1800", kind: "Сургууль" },
        ],
      },
      {
        label: "Худалдаа, үйлчилгээ",
        items: [
          { place: "Поларис их дэлгүүр", distance: "550", kind: "" },
          { place: "Номин Юнайтэд", distance: "620", kind: "" },
          { place: "Лавай зах", distance: "1100", kind: "" },
          { place: "19-р үйлчилгээний төв", distance: "1600", kind: "" },
          { place: "Хүннү молл", distance: "3700", kind: "" },
          { place: "Food City", distance: "3800", kind: "" },
        ],
      },
      {
        label: "Эрүүл мэнд",
        items: [
          { place: "ХУД эрүүл мэндийн төв", distance: "1000", kind: "" },
          { place: "Интермед эмнэлэг", distance: "1700", kind: "" },
          { place: "Улаанбаатар сувилал", distance: "1800", kind: "" },
        ],
      },
    ],
    office: {
      phoneLabel: "Утас",
      hoursLabel: "Цагийн хуваарь",
      emailLabel: "И-мэйл",
      ctaLabel: "Уулзалт товлох",
    },
  },

  contact: {
    kicker: "Холбоо барих",
    title: "Бидэнтэй холбогдох",
    sub: "Та доорх асуулгыг бөглөснөөр манай борлуулалтын менежерүүд тантай холбогдон уулзалтын өдрийг баталгаажуулах болно.",
    phone: "7786-2222",
    hours: "Даваа – Ням · 09:00 – 18:00",
    location: "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэр",
    labels: {
      phone: "Утас",
      hours: "Цагийн хуваарь",
      office: "Борлуулалтын алба",
      email: "И-мэйл",
    },
    form: {
      name: "Нэр",
      phone: "Утас",
      dateLabel: "Уулзах хүссэн огноо",
      submit: "Хүсэлт илгээх",
      sending: "Илгээж байна…",
      error: "Илгээхэд алдаа гарлаа. Дахин оролдоно уу, эсвэл доорх дугаар руу залгана уу.",
      successTitle: "Баярлалаа! Таны хүсэлтийг хүлээн авлаа.",
      successBody: "Борлуулалтын менежер тантай удахгүй холбогдож, уулзалтын өдрийг баталгаажуулна.",
    },
  },

  managers: {
    kicker: "Борлуулалтын баг",
    title: "Менежертэй шууд холбогдох",
    body: "Залгах эсвэл Viber-ээр бичээрэй — менежер тантай шууд ярилцаж, үзүүлэх цагийг тохирно.",
    hoursLabel: "Борлуулалтын албаны цагийн хуваарь",
    hours: "Даваа – Ням · 09:00 – 18:00",
    callLabel: "Залгах",
    viberLabel: "Viber",
    items: [
      { name: "Н.Ариунбилэг", initials: "НА", role: "Борлуулалтын ахлах менежер", phone: "8888-3374", photo: "" },
      { name: "Б.Энхзул", initials: "БЭ", role: "Борлуулалтын менежер", phone: "9008-3374", photo: "" },
      { name: "Р.Чанцалдулам", initials: "РЧ", role: "Борлуулалтын менежер", phone: "8888-3375", photo: "" },
    ],
  },

  faq: {
    kicker: "Түгээмэл асуулт",
    title: "Түгээмэл асуулт, хариулт",
    items: [
      {
        q: "Хэзээ ашиглалтад орох вэ?",
        a: "Elysium Residence 2027 оны 2-р улиралд ашиглалтад орохоор төлөвлөгдсөн.",
      },
      {
        q: "Давхартаа хэдэн айлтай вэ?",
        a: "Блок, давхар тус бүрийн айлын тоо төлөвлөлтөөс хамаарна. Дэлгэрэнгүйг борлуулалтын албанаас тодруулна уу.",
      },
      {
        q: "Төслийн байршил хаана вэ?",
        a: "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэрын ойролцоо.",
      },
      {
        q: "Борлуулалтын албатай хэрхэн холбогдох вэ?",
        a: "Утас 7786-2222, эсвэл “Уулзалт товлох” хэсгээр хүсэлт үлдээнэ үү.",
      },
      {
        q: "Гадаадаас орон сууц захиалах боломжтой юу?",
        a: "Тийм. Цахим үзлэг, онлайн захиалга, зайнаас гэрээ байгуулах боломжтой.",
      },
    ],
  },

  news: {
    navLabel: "Мэдээ",
    kicker: "Мэдээ & нийтлэл",
    title: "Төслийн явц, мэдээ мэдээлэл",
    sub: "Хотхоны бүтээн байгуулалтын явц, арга хэмжээ, шинэ мэдээллийг эндээс тогтмол хүлээн авна уу.",
    empty: "Одоогоор нийтэлсэн мэдээ алга. Удахгүй шинэ мэдээлэл нэмэгдэнэ.",
    readMore: "Дэлгэрэнгүй",
    backLabel: "Бүх мэдээ",
    moreTitle: "Бусад мэдээ",
  },

  footer: {
    salesTitle: "Борлуулалтын алба",
    menuTitle: "Цэс",
    socialTitle: "Сошиал",
    menu: [
      { label: "Өрөөний сонголт", href: "#apartments" },
      { label: "Төслийн давуу тал", href: "#elys" },
      { label: "Байршил", href: "#location" },
      { label: "Танилцуулга татах", href: "/brochure.pdf" },
    ],
    /* `href` хоосон эсвэл "#" бол тухайн холбоос сайт дээр харагдахгүй —
       жинхэнэ хаягаа `/admin/site` → Хөл хэсэг дээрээс оруулна. */
    social: [
      { label: "Facebook", href: "", icon: "facebook" },
      { label: "Instagram", href: "", icon: "instagram" },
      { label: "YouTube", href: "", icon: "youtube" },
      { label: "TikTok", href: "", icon: "tiktok" },
    ],
    note: "Form Follows Function · Comfort · Serenity",
  },

  chatbot: {
    title: "Elysium туслах",
    subtitle: "Төслийн мэдээлэл дээр суурилсан",
    greeting:
      "Сайн байна уу! Би Elysium Residence-ийн туслах. Байршил, өрөөний сонголт, ашиглалтад орох хугацааны талаар асуугаарай.",
    placeholder: "Асуултаа бичнэ үү…",
    fallback:
      "Уучлаарай, тодорхой ойлгосонгүй. Борлуулалтын менежер дэлгэрэнгүй хариулна: 7786-2222. Эсвэл доорх сэдвүүдээс сонгоно уу.",
    quick: ["Үнэ хэд вэ?", "Байршил хаана вэ?", "Хэзээ ашиглалтад орох вэ?", "Өрөөний сонголт"],
    answers: [
      {
        keys: "байршил, хаана, байр, map, зураг",
        a: "Төсөл Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэрын ойролцоо оршино. Үндэсний цэцэрлэгт хүрээлэн 1 мин, Мишээл 2 мин, Их дэлгүүр 3 мин машины замтай.",
      },
      {
        keys: "хэзээ, ашиглалт, хугацаа, бэлэн болох, 2027",
        a: "Ашиглалтад орох хугацаа: 2027 оны 2-р улирал.",
      },
      {
        keys: "өрөө, мкв, м², талбай, сонголт, загвар",
        a: "1 өрөө 38–52 м², 2 өрөө 58–74 м², 3 өрөө 82–104 м², 4 өрөө 110 м²-аас дээш талбайтай. “Өрөөний сонголт” хэсгээс дэлгэрэнгүйг үзнэ үү.",
      },
      {
        keys: "үнэ, ханш, зээл, төлбөр, өртөг, хөнгөлөлт",
        a: "Үнийн мэдээллийг борлуулалтын менежер танд тохирох өрөөний төлөвлөгөөний хамт тодруулж өгнө. Утас: 7786-2222.",
      },
      {
        keys: "блок, айл, 506, хэд",
        a: "Нийт 4 блок, 506 айлын орон сууцтай. Нийт талбайн 85% нь нийтийн эзэмшлийн ногоон орон зай.",
      },
      {
        keys: "зогсоол, машин, паркинг",
        a: "513 автомашины зогсоолтой — айл бүрд хангалттай хуваарилна.",
      },
      {
        keys: "монкон, хэрэгжүүлэгч, барилгачин, компани",
        a: "Монкон Констракшн ХХК — 2006 оноос хойш 60 гаруй төсөл хэрэгжүүлсэн (Мандала хотхон, Мандала гарден, 360/365 Мандала Тауэр г.м.).",
      },
      {
        keys: "уулзалт, захиалга, үзлэг, бүртгэл",
        a: "Доорх “Уулзалт товлох” хэсэгт нэр, утас, огноогоо үлдээхэд манай менежер холбогдоно. Эсвэл шууд 7786-2222 руу залгана уу.",
      },
      {
        keys: "ногоон, цэцэрлэг, green",
        a: "Нийт талбайн 85% нь нийтийн эзэмшлийн ногоон байгууламж — Үндэсний цэцэрлэгт хүрээлэнтэй зэрэгцдэг.",
      },
      {
        keys: "гадаад, гадаадаас, зайнаас",
        a: "Тийм — цахим үзлэг, онлайн захиалга, зайнаас гэрээ байгуулах боломжтой. Менежер таньд тусална: 7786-2222.",
      },
      {
        keys: "сайн, hello, hi",
        a: "Сайн байна уу! Танд юугаар туслах вэ?",
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Merge — хадгалсан JSON-ыг өгөгдмөл бүтэц дээр давхарлана.           */
/* ------------------------------------------------------------------ */

/** Өгөгдмөл бүтцийг дагаж шинэ объект үүсгэнэ (өгөгдмөлийг хэзээ ч
 *  буцааж хуваалцахгүй — засварлагч мутаци хийхэд аюулгүй).
 *  Массивын элементийн дутуу түлхүүрийг эхний өгөгдмөл элементээс нөхнө. */
function mergeValue<T>(def: T, val: unknown): T {
  if (Array.isArray(def)) {
    const template = (def as unknown[])[0];
    if (!Array.isArray(val)) return def.map((item) => mergeValue(item, item)) as T;
    if (template === undefined) return (val as unknown[]).slice() as T;
    return val.map((item) => mergeValue(template, item)) as T;
  }
  if (def !== null && typeof def === "object") {
    const source =
      val !== null && typeof val === "object" && !Array.isArray(val)
        ? (val as Record<string, unknown>)
        : {};
    const out: Record<string, unknown> = {};
    for (const [key, dv] of Object.entries(def as Record<string, unknown>)) {
      out[key] = mergeValue(dv, source[key]);
    }
    return out as T;
  }
  return typeof val === typeof def ? (val as T) : def;
}

/** Хадгалсан (эсвэл хагас дутуу) өгөгдлөөс бүрэн `SiteContent` гаргана. */
export function mergeSiteContent(stored: unknown): SiteContent {
  return mergeValue(DEFAULT_SITE_CONTENT, stored);
}

/** Гүн хуулбар — засварлагчид өгөгдмөл рүү буцаахад ашиглана. */
export function cloneDefaultSiteContent(): SiteContent {
  return mergeSiteContent(undefined);
}
