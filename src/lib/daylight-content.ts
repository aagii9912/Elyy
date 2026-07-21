/* ============================================================
   ELYSIUM — /daylight experience content (MN default / EN).
   Structure mirrors the Daylight-style page sections.
   All copy is Elysium's own; media from public/images|video.
   ============================================================ */

import type { Lang } from "./content";

export type DlDict = {
  nav: { links: { label: string; href: string }[]; cta: string };
  hero: {
    kicker: string;
    titleLines: [string, string];
    text: string;
    cta: string;
    ctaSecondary: string;
    formPlaceholder: string;
    infoTop: { label: string; value: string };
    infoRight: { backup: string; thermostat: string; thermoValue: string };
    wordmark: string;
  };
  usp: {
    items: { surtitle: string; titleLines: [string, string]; image: string; alt: string }[];
  };
  how: {
    surtitle: string;
    titleLines: [string, string];
    text: string;
    cta: string;
    steps: {
      surtitle: string;
      title: string;
      subtitle: string;
      text: string;
      cta?: string;
    }[];
    phone: {
      title: string;
      chipTop: string;
      toggleLeft: string;
      toggleRight: string;
    };
    chart: {
      tabA: string;
      tabB: string;
      value: number;
      valueSuffix: string;
      valueLabel: string;
      percent: number;
      days: string[];
    };
  };
  why: {
    items: {
      surtitle: string;
      layout: "center" | "left";
      title: string; // "left" layout: lines separated by \n
      image: string;
      overlay: number;
    }[];
    cta: string;
  };
  network: {
    surtitle: string;
    titleLines: [string, string];
    text: string;
    cta: string;
  };
  diptych: {
    titleLines: [string, string];
    subtitle: string;
    text: string;
    cta: string;
    image: string;
  };
  footer: {
    heading: string;
    links: { label: string; href: string }[];
    socials: { label: string; href: string }[];
    rights: string;
  };
};

const mn: DlDict = {
  nav: {
    links: [
      { label: "Танилцуулга", href: "#about" },
      { label: "Давуу тал", href: "#advantages" },
      { label: "Өрөөний сонголт", href: "#apartments" },
      { label: "Холбоо барих", href: "#contact" },
    ],
    cta: "Уулзалт товлох",
  },
  hero: {
    kicker: "Elysium · Улаанбаатар",
    titleLines: ["Эв найрамдалтай,", "төгс амьдрал"],
    text: "4 блок, 506 айлын орон сууц. Нийт талбайн 85% нь ногоон, нийтийн эзэмшлийн орон зай — байгальтай зэрэгцэн амьдрах шинэ хотхон.",
    cta: "Уулзалт товлох",
    ctaSecondary: "Өрөөний сонголт",
    formPlaceholder: "Утасны дугаараа үлдээх",
    infoTop: { label: "Ногоон орчин", value: "Нийт талбайн 85%" },
    infoRight: { backup: "Автозогсоол · 513", thermostat: "Хамгаалалт", thermoValue: "24/7" },
    wordmark: "Elysium",
  },
  usp: {
    items: [
      {
        surtitle: "Хэмнэлт",
        titleLines: ["Ашиглалтын зардлаа", "мэдэгдэхүйц бууруул"],
        image: "/images/exterior-lowangle-towers.jpg",
        alt: "Elysium цамхагууд",
      },
      {
        surtitle: "Хамгаалалт",
        titleLines: ["Өвлийн хүйтэнд ч", "дулаан, найдвартай орчин"],
        image: "/images/exterior-snow-courtyard.jpg",
        alt: "Өвлийн хотхон",
      },
      {
        surtitle: "Хяналт",
        titleLines: ["Бүх үйлчилгээг", "нэг дороос удирд"],
        image: "/images/aerial-courtyard-promenade.jpg",
        alt: "Хотхоны агаараас харагдах байдал",
      },
    ],
  },
  how: {
    surtitle: "Хэрхэн эзэмших вэ",
    titleLines: ["Шинэ амьдралын", "эхлэл энд"],
    text: "Elysium-д орон сууц эзэмших нь энгийн. Урьдчилсан захиалгаас түлхүүр гардуулах хүртэл бид таныг алхам бүрд дагалдана — уян хатан төлбөрийн нөхцөл, найдвартай гэрээ, цагтаа баригдах барилга.",
    cta: "Уулзалт товлох",
    steps: [
      {
        surtitle: "Алхам 1",
        title: "Урьдчилсан\nзахиалга",
        subtitle: "Уян хатан төлбөр",
        text: "Сонгосон өрөөндөө урьдчилгаа төлж байршлаа баталгаажуулна. Банкны хөнгөлөлттэй зээл болон шат дараатай төлбөрийн уян хатан нөхцөлүүдээс сонгоорой.",
        cta: "Үнийн мэдээлэл авах",
      },
      {
        surtitle: "Алхам 2",
        title: "Бид барина",
        subtitle: "Монкон Констракшн",
        text: "Зураг төслөөс эхлээд өндөр чанарын материал, угсралт, тохижилт хүртэл бүх үе шатыг бид хариуцна. 2027 оны II улиралд ашиглалтад орно.",
      },
      {
        surtitle: "Алхам 3",
        title: "Түлхүүрээ\nгардан ав",
        subtitle: "Таны шинэ гэр",
        text: "Түлхүүрээ гардан авч, ногоон орчинтой, бүрэн тохижсон хотхонд шинэ амьдралаа эхлүүлнэ. Үл хөдлөхийн үнэ цэнэ жил бүр өснө.",
      },
    ],
    phone: {
      title: "Захиалгын систем",
      chipTop: "Elysium апп",
      toggleLeft: "Урьдчилгаа",
      toggleRight: "Зээл",
    },
    chart: {
      tabA: "Ногоон орчин",
      tabB: "Үнэ цэнэ",
      value: 85,
      valueSuffix: "%",
      valueLabel: "нийтийн эзэмшил",
      percent: 12.3,
      days: ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"],
    },
  },
  why: {
    items: [
      {
        surtitle: "Яагаад Elysium",
        layout: "center",
        title: "Хотын шуугианаас ангид, өөрийн гэсэн орчин",
        image: "/images/aerial-park-playground.jpg",
        overlay: 50,
      },
      {
        surtitle: "Тулгамдсан асуудал",
        layout: "left",
        title:
          "Агаарын бохирдол жилээс жилд нэмэгдэж байна\nТүгжрэлд өдөрт 2 цаг алдаж байна\nНогоон орчин хотод улам ховордож байна",
        image: "/images/exterior-path-moody.jpg",
        overlay: 50,
      },
      {
        surtitle: "Нэг хотхон · нэг амьдрал",
        layout: "center",
        title: "506 айл нэг дор — тайван, аюулгүй, ногоон хороолол",
        image: "/images/amenity-canal-golden.jpg",
        overlay: 50,
      },
    ],
    cta: "Уулзалт товлох",
  },
  network: {
    surtitle: "Өсөн тэлж буй хотхон",
    titleLines: ["Айл бүр хотхоныг", "илүү хүчирхэг болгоно"],
    text: "Elysium-ийн айл бүр ногоон орчин, нийтийн эзэмшлийн талбай, үйлчилгээний нэгдсэн сүлжээнд холбогдоно. Хотхон өсөх тусам орчны чанар, үл хөдлөхийн үнэ цэнэ хамт өснө.",
    cta: "Уулзалт товлох",
  },
  diptych: {
    titleLines: ["Elysium-д", "тавтай морил"],
    subtitle: "Ирээдүй гэрэлтэй",
    text: "Амьдралаа өөрчлөхөд бэлэн үү? Хотын төвөөс хол биш, байгальтай ойр шинэ амьдрал таныг хүлээж байна.",
    cta: "Уулзалт товлох",
    image: "/images/exterior-dusk-pastel.png",
  },
  footer: {
    heading: "Дэлгэрэнгүй мэдээлэл",
    links: [
      { label: "Танилцуулга PDF", href: "/brochure.pdf" },
      { label: "Өрөөний сонголт", href: "/final#apartments" },
      { label: "Байршил", href: "/final#location" },
      { label: "Холбоо барих", href: "/final#booking" },
    ],
    socials: [
      { label: "FB", href: "#" },
      { label: "IG", href: "#" },
      { label: "YT", href: "#" },
    ],
    rights: "© 2026 Elysium · Монкон Констракшн ХХК",
  },
};

const en: DlDict = {
  nav: {
    links: [
      { label: "About", href: "#about" },
      { label: "Advantages", href: "#advantages" },
      { label: "Apartments", href: "#apartments" },
      { label: "Contact", href: "#contact" },
    ],
    cta: "Book a visit",
  },
  hero: {
    kicker: "Elysium · Ulaanbaatar",
    titleLines: ["A life in harmony,", "made complete"],
    text: "4 towers, 506 residences. 85% of the grounds are green, shared open space — a new community built side by side with nature.",
    cta: "Book a visit",
    ctaSecondary: "Apartments",
    formPlaceholder: "Enter your phone number",
    infoTop: { label: "Green space", value: "85% of the site" },
    infoRight: { backup: "Parking · 513", thermostat: "Security", thermoValue: "24/7" },
    wordmark: "Elysium",
  },
  usp: {
    items: [
      {
        surtitle: "Save",
        titleLines: ["Cut your living costs", "noticeably"],
        image: "/images/exterior-lowangle-towers.jpg",
        alt: "Elysium towers",
      },
      {
        surtitle: "Protect",
        titleLines: ["Warm and secure", "through every winter"],
        image: "/images/exterior-snow-courtyard.jpg",
        alt: "Winter courtyard",
      },
      {
        surtitle: "Control",
        titleLines: ["Manage every service", "from one place"],
        image: "/images/aerial-courtyard-promenade.jpg",
        alt: "Aerial view of the courtyard",
      },
    ],
  },
  how: {
    surtitle: "How to own",
    titleLines: ["The start of", "a new life"],
    text: "Owning at Elysium is simple. From pre-booking to key handover we walk with you at every step — flexible payment terms, a secure contract, and construction delivered on time.",
    cta: "Book a visit",
    steps: [
      {
        surtitle: "Step 1",
        title: "Reserve\nyour home",
        subtitle: "Flexible payments",
        text: "Secure your chosen residence with a down payment. Choose between preferential bank financing and staged payment plans.",
        cta: "Get pricing",
      },
      {
        surtitle: "Step 2",
        title: "We build",
        subtitle: "Moncon Construction",
        text: "From design to premium materials, assembly and landscaping — we handle every stage. Completion in Q2 2027.",
      },
      {
        surtitle: "Step 3",
        title: "Receive\nyour keys",
        subtitle: "Your new home",
        text: "Take your keys and begin life in a fully finished, green community. Your property's value grows year after year.",
      },
    ],
    phone: {
      title: "Booking system",
      chipTop: "Elysium app",
      toggleLeft: "Deposit",
      toggleRight: "Loan",
    },
    chart: {
      tabA: "Green space",
      tabB: "Value",
      value: 85,
      valueSuffix: "%",
      valueLabel: "shared grounds",
      percent: 12.3,
      days: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    },
  },
  why: {
    items: [
      {
        surtitle: "Why Elysium",
        layout: "center",
        title: "A world of your own, away from the city noise",
        image: "/images/aerial-park-playground.jpg",
        overlay: 50,
      },
      {
        surtitle: "The problem",
        layout: "left",
        title:
          "Air pollution rises every year\nTwo hours a day are lost to traffic\nGreen space keeps disappearing from the city",
        image: "/images/exterior-path-moody.jpg",
        overlay: 50,
      },
      {
        surtitle: "One community · one life",
        layout: "center",
        title: "506 families together — a calm, safe, green neighborhood",
        image: "/images/amenity-canal-golden.jpg",
        overlay: 50,
      },
    ],
    cta: "Book a visit",
  },
  network: {
    surtitle: "A growing community",
    titleLines: ["Every home makes", "the community stronger"],
    text: "Every Elysium residence connects to a unified network of green space, shared grounds and services. As the community grows, so does the quality of life — and the value of your home.",
    cta: "Book a visit",
  },
  diptych: {
    titleLines: ["Step into", "Elysium"],
    subtitle: "The future is bright",
    text: "Ready for a change? A new life close to nature — and never far from the city — is waiting for you.",
    cta: "Book a visit",
    image: "/images/exterior-dusk-pastel.png",
  },
  footer: {
    heading: "Learn more",
    links: [
      { label: "Brochure PDF", href: "/brochure.pdf" },
      { label: "Apartments", href: "/final#apartments" },
      { label: "Location", href: "/final#location" },
      { label: "Contact", href: "/final#booking" },
    ],
    socials: [
      { label: "FB", href: "#" },
      { label: "IG", href: "#" },
      { label: "YT", href: "#" },
    ],
    rights: "© 2026 Elysium · Moncon Construction LLC",
  },
};

export const DL_DICT: Record<Lang, DlDict> = { mn, en };

export const DL_MEDIA = {
  heroVideo: "/video/hero-source.mp4",
  heroPoster: "/images/hero-sunset.png",
  howIntroImage: "/images/hero-towers-bluesky.png",
  step1Image: "/images/amenity-pool-deck.jpg",
  step2Image: "/images/exterior-towers-winter.jpg",
  networkImage: "/images/aerial-masterplan.jpg",
  footerVideo: "/video/hero-source.mp4",
  footerPoster: "/images/exterior-elevation-dusk.jpg",
  logo: "/brand/elysium-logo.svg",
} as const;
