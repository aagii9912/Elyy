// Elysium Residence — content (from src/lib/content.ts) mapped onto the
// ArcSphere editorial layout. Mongolian (Elysium default language).

const IMG = "/images";

export const BRAND = {
  name: "Elysium",
  navCta: "Уулзалт товлох",
};

export const NAV_LINKS = [
  { label: "Давуу тал", href: "#services" },
  { label: "Онцлох төсөл", href: "#projects" },
  { label: "Холбоо барих", href: "#contact" },
];

export const HERO = {
  heading: ["Эв найрамдалтай,", "төгс амьдрал"],
  subtitle:
    "4 блок, 440 айлын орон сууцтай, нийт талбайн 85% нь нийтийн эзэмшил — байгальтай зэрэгцэн амьдрах шинэ хотхон.",
  image: `${IMG}/hero-sunset.png`,
  primary: "Өрөөний сонголт",
  secondary: "Уулзалт товлох",
};

export const GALLERY = [
  { src: `${IMG}/amenity-garden-walk.jpg`, alt: "Ногоон зугаалгын зам", tall: true },
  { src: `${IMG}/exterior-elevation-dusk.jpg`, alt: "Барилгын үдшийн дүр", tall: false },
  { src: `${IMG}/exterior-plaza-pink.jpg`, alt: "Талбайн орчин", tall: true },
];

export const STATEMENT = {
  heading: ["Гэрэл, агаар, ногоон", "орчныг нэгтгэсэн"],
  subtitle:
    "Хотын төвд байгальтай зэрэгцэн амьдрах бодлоготой төлөвлөлт.",
  imageLeft: `${IMG}/amenity-canal-blue.jpg`,
  imageRight: `${IMG}/exterior-garden-path.jpg`,
};

export const STATS = [
  "506 айлын орон сууц",
  "85% нийтийн эзэмшил",
  "513 автомашины зогсоол",
  "2027 · II улиралд ашиглалтад",
];

export const FEATURED = {
  title: "Онцлох төслүүд",
  subtitle: "Монкон Констракшны амжилттай хэрэгжүүлсэн төслүүд.",
  viewMore: "Бүх төслийг үзэх",
  items: [
    {
      title: "Комфорт хотхон",
      category: "15 давхар · 600 айл",
      location: "2014–2019",
      image: `${IMG}/exterior-cluster-dusk.jpg`,
      tall: false,
    },
    {
      title: "Мандала гарден",
      category: "16 давхар · 2500 айл",
      location: "2019–2030",
      image: `${IMG}/aerial-masterplan.jpg`,
      tall: true,
    },
    {
      title: "360 Мандала Тауэр",
      category: "25 давхар · 200 айл",
      location: "2018–2025",
      image: `${IMG}/exterior-lowangle-towers.jpg`,
      tall: false,
    },
  ],
};

export const SERVICES = {
  title: "Төслийн давуу тал",
  subtitle: "Концепц — ELYS: дөрвөн тулгуур зарчим.",
  items: [
    {
      name: "Ergonomic Standards",
      desc: "Хүний биед ээлтэй, тав тухтай, ухаалаг орон зайн төлөвлөлт.",
      image: `${IMG}/amenity-pool-deck.jpg`,
    },
    {
      name: "Live in Harmony",
      desc: "Байгальтай зэрэгцсэн, тэнцвэртэй, амгалан амьдралын орчин.",
      image: `${IMG}/amenity-garden-walk.jpg`,
    },
    {
      name: "Your Safety",
      desc: "24/7 хамгаалалт, ухаалаг хяналтын систем, аюулгүй гэр бүлийн орчин.",
      image: `${IMG}/exterior-towers-winter.jpg`,
    },
    {
      name: "Save Big",
      desc: "Эрчим хүч, ашиглалтын зардлыг бууруулсан тогтвортой шийдэл.",
      image: `${IMG}/amenity-canal-golden.jpg`,
    },
  ],
};

export const EXPERTISE = {
  title: "Төслийн онцлог",
  subtitle: "Байгальтай зэрэгцэн амьдрах шинэ хотхон.",
  items: [
    {
      stat: "506",
      statLabel: "Айлын орон сууц · 4 блок",
      title: "Орон сууц",
      desc: "1–4 өрөөний уужим, эргономик төлөвлөлттэй орон сууцны сонголт.",
      image: `${IMG}/exterior-elevation-dusk.jpg`,
    },
    {
      stat: "85%",
      statLabel: "Нийтийн эзэмшлийн талбай",
      title: "Ногоон орчин",
      desc: "Ногоон байгууламж, тайван амьдралд зориулсан нийтийн эзэмшлийн орон зай.",
      image: `${IMG}/aerial-park-playground.jpg`,
    },
  ],
};

export const PROCESS = {
  title: "Энгийн 3 алхам",
  subtitle: "Шинэ гэрт хүрэх зам.",
  items: [
    {
      tag: "Яриа",
      num: "01",
      title: "Хүнтэй ярь",
      desc: "Мэргэжлийн зөвлөхтэй холбогдож, хэрэгцээгээ ярилцана.",
      image: `${IMG}/amenity-retail-podium.jpg`,
      icon: "search" as const,
    },
    {
      tag: "Тодорхой",
      num: "02",
      title: "Тодорхой бол",
      desc: "Танд яг тохирох өрөө, төлбөрийн нөхцөлийг тодорхойлно.",
      image: `${IMG}/amenity-canal-blue.jpg`,
      icon: "bulb" as const,
    },
    {
      tag: "Шилжилт",
      num: "03",
      title: "Нүүж ор",
      desc: "Захиалга, гэрээ, түлхүүр хүлээн авах хүртэл хамт байна.",
      image: `${IMG}/exterior-garden-path.jpg`,
      icon: "check" as const,
    },
  ],
};

export const TESTIMONIALS = {
  title: "Бидний тухай тэдний үг",
  subtitle: "Оршин суугчид болон худалдан авагчдын сэтгэгдэл.",
  image: `${IMG}/amenity-pool-deck.jpg`,
  items: [
    {
      quote:
        "Үзлэгээс эхлээд гэрээ хүртэл бүх зүйл хялбар, ил тод байсан.",
      name: "Б. Болормаа",
      role: "Шинэ оршин суугч",
    },
    {
      quote:
        "Гадаадаас байраа сонгож, бүхэлд нь онлайнаар шийдсэн. Гайхалтай үйлчилгээ.",
      name: "Т. Эрдэнэ",
      role: "Гадаадаас худалдан авагч",
    },
    {
      quote: "Ногоон орчин, тайван амьдрал яг хүссэнээр маань боллоо.",
      name: "Г. Сараа",
      role: "Гэр бүлийн худалдан авагч",
    },
    {
      quote: "Багийнхан мэргэжлийн, асуулт бүрд тодорхой хариулсан.",
      name: "Д. Тэмүүлэн",
      role: "Хөрөнгө оруулагч",
    },
  ],
};

export const GEHRY = {
  image: `${IMG}/aerial-courtyard-water.jpg`,
  quote: "Гэрэл, агаар, ногоон орчныг нэгтгэсэн бодлоготой амьдрал.",
  author: "Elysium Residence",
  primary: "Өрөөний сонголт",
  secondary: "Уулзалт товлох",
};

export const CONTACT = {
  heading: ["Уулзалт", "товлоорой"],
  subtitle:
    "Мэдээллээ үлдээгээрэй — борлуулалтын мэргэжилтэн тань нэг ажлын өдрийн дотор холбогдоно.",
  phone: "+976 7786 2222",
  email: "info@elysium.mn",
  address: "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэр",
  detailTitle: "Таны мэдээлэл",
  detailFields: ["Нэр", "Утас", "И-мэйл"],
  contextTitle: "Сонирхол",
  contextFields: ["Сонирхож буй өрөө", "Тохиромжтой огноо", "Нэмэлт мэдээлэл"],
  submit: "Хүсэлт илгээх",
  socialLabel: "Сошиал холбоос",
  phoneLabel: "Утас",
  emailLabel: "И-мэйл",
  addressLabel: "Хаяг",
};

export const FOOTER = {
  cta: "Elysium-д таны шинэ амьдрал эхэлнэ.",
  getInTouch: "Холбоо барих",
  navCols: [
    ["Нүүр", "Танилцуулга", "Өрөөний сонголт", "Давуу тал", "Гадаадаас захиалах", "Холбоо барих"],
    ["Facebook", "Instagram", "YouTube"],
    ["Нууцлалын бодлого", "Үйлчилгээний нөхцөл"],
  ],
  copyright: "© 2027 Elysium · Бүх эрх хуулиар хамгаалагдсан.",
  wordmark: "Elysium",
  image: `${IMG}/aerial-courtyard-promenade.jpg`,
};
