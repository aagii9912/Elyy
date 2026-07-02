/* ============================================================
   ELYSIUM — Bilingual content (MN default / EN).
   Single source of truth. Edit copy here.
   Video, interior & axonometric visuals are placeholders.
   ============================================================ */

export type Lang = "mn" | "en";
export const LANGS: Lang[] = ["mn", "en"];
export const DEFAULT_LANG: Lang = "mn";

export const SITE = {
  name: "Elysium",
  email: "info@elysium.mn",
  phone: "+976 7786 2222",
  developer: "Монкон Констракшн ХХК",
  social: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
  ],
};

export const NAV = [
  { key: "articles", href: "#articles" },
  { key: "apartments", href: "#apartments" },
  { key: "advantages", href: "#advantages" },
  { key: "fromAbroad", href: "#from-abroad" },
] as const;

type Stat = { value?: number; suffix?: string; text?: string; label: string };
type Item = { title: string; body: string };
type Faq = { q: string; a: string };

export type Dict = {
  nav: Record<"articles" | "apartments" | "advantages" | "fromAbroad", string>;
  cta: string;
  hero: { kicker: string; title: string; subtitle: string; primary: string; secondary: string; scroll: string };
  stats: Stat[];
  intro: { kicker: string; title: string; body: string };
  advantages: { kicker: string; title: string; body: string; items: Item[] };
  apartments: { kicker: string; title: string; body: string; note: string; types: Item[]; placeholder: string };
  developer: { kicker: string; title: string; body: string; label: string; projects: string[]; tour: string };
  gallery: { kicker: string; title: string; cta: string };
  fromAbroad: { kicker: string; title: string; body: string; points: string[] };
  booking: {
    kicker: string; title: string; body: string;
    fields: { name: string; phone: string; email: string; type: string; date: string; message: string };
    submit: string; sending: string; successTitle: string; successBody: string; again: string; error: string; choose: string;
  };
  faq: { kicker: string; title: string; items: Faq[] };
  articles: { kicker: string; title: string; body: string; soon: string };
  footer: { ctaTitle: string; explore: string; contact: string; salesOffice: string; salesAddress: string; hours: string; social: string; rights: string };
  placeholders: { film: string; interior: string; axono: string; map: string };
  v2: {
    hero: { headline: string; sub: string; primary: string; secondary: string };
    why: { kicker: string; title: string; body: string };
    mosaic: { title: string; body: string };
    process: { kicker: string; title: string; cta: string; steps: Item[] };
    testimonials: { kicker: string; title: string; items: { quote: string; name: string; role: string }[] };
    services: { kicker: string; title: string; body: string; cta: string; items: Item[] };
    support: { kicker: string; title: string; body: string };
    cta: { title: string; sub: string; placeholder: string; button: string };
  };
};

const mn: Dict = {
  nav: {
    articles: "Нийтлэл",
    apartments: "Өрөөний сонголт",
    advantages: "Төслийн давуу тал",
    fromAbroad: "Гадаадаас захиалах",
  },
  cta: "Уулзалт товлох",
  hero: {
    kicker: "Elysium · Улаанбаатар",
    title: "Эв найрамдалтай, төгс амьдрал",
    subtitle:
      "4 блок, 506 айлын орон сууцтай, нийт талбайн 85% нь нийтийн эзэмшил — байгальтай зэрэгцэн амьдрах шинэ хотхон.",
    primary: "Уулзалт товлох",
    secondary: "Өрөөний сонголт",
    scroll: "Гүйлгэх",
  },
  stats: [
    { value: 506, label: "айлын орон сууц · 4 блок" },
    { value: 85, suffix: "%", label: "нийтийн эзэмшлийн талбай" },
    { value: 513, label: "автомашины зогсоол" },
    { text: "2027 · II", label: "улиралд ашиглалтад орно" },
  ],
  intro: {
    kicker: "Танилцуулга",
    title: "Гэрэл, агаар, ногоон орчныг нэгтгэсэн бодлоготой төлөвлөлт.",
    body:
      "Elysium нь хотын төвд байгальтай зэрэгцэн амьдрах боломжийг бүтээдэг. Нийт талбайн дийлэнх нь ногоон ба нийтийн эзэмшлийн орон зайд зориулагдсан бөгөөд айл бүр гэрэл гэгээ, тайван амгаланг хүртэхээр төлөвлөгджээ.",
  },
  advantages: {
    kicker: "Төслийн давуу тал",
    title: "Дөрвөн тулгуур зарчим",
    body: "Хотхоны төлөвлөлтийн гол шийдвэр бүрийг дараах зарчмаар хэмждэг.",
    items: [
      { title: "Ergonomic Standards", body: "Хүний биед ээлтэй, тав тухтай, ухаалаг орон зайн төлөвлөлт." },
      { title: "Live in Harmony", body: "Байгальтай зэрэгцсэн, тэнцвэртэй, амгалан амьдралын орчин." },
      { title: "Your Safety", body: "24/7 хамгаалалт, ухаалаг хяналтын систем, аюулгүй гэр бүлийн орчин." },
      { title: "Save Big", body: "Эрчим хүч, ашиглалтын зардлыг бууруулсан тогтвортой шийдэл." },
    ],
  },
  apartments: {
    kicker: "Өрөөний сонголт",
    title: "Танд тохирох орон зай",
    body: "Өрөөний тоо, талбай бүрд тохирсон төлөвлөлтүүд. Аксонометр зургийг доороос үзнэ үү.",
    note: "Аксонометр зургууд удахгүй нэмэгдэнэ.",
    placeholder: "Аксонометр зураг — удахгүй",
    types: [
      { title: "1 өрөө", body: "Студи ба нэг өрөө — 38–52 м²" },
      { title: "2 өрөө", body: "Гэр бүлд тохиромжтой — 58–74 м²" },
      { title: "3 өрөө", body: "Уужим зохион байгуулалт — 82–104 м²" },
      { title: "4 өрөө", body: "Дээд зэрэглэлийн орон зай — 110 м²-аас" },
    ],
  },
  developer: {
    kicker: "Төсөл хэрэгжүүлэгч",
    title: "Монкон Констракшн",
    body:
      "Elysium хотхоныг Монкон Констракшн хэрэгжүүлж байна. Бид Комфорт хотхон, Мандала хотхон, Мандала гарден, 360, 365 Мандала Тауэр зэрэг төслүүдийг чанартай, хугацаандаа амжилттай ашиглалтад оруулсан туршлагатай.",
    label: "Өмнөх төслүүд",
    projects: ["Комфорт хотхон", "Мандала хотхон", "Мандала гарден", "360, 365 Мандала Тауэр"],
    tour: "360° виртуал аялал — удахгүй",
  },
  gallery: { kicker: "Зургийн цомог", title: "Elysium-ийн дүр төрх", cta: "Бүгдийг үзэх" },
  fromAbroad: {
    kicker: "Гадаадаас захиалах",
    title: "Хаанаас ч орон сууцаа сонгоорой",
    body:
      "Гадаадад амьдарч байгаа ч Elysium-аас орон сууц захиалах боломжтой. Цахим үзлэг, онлайн захиалга, зайнаас гэрээ байгуулах үйлчилгээг борлуулалтын мэргэжилтнүүд бүрэн дэмжинэ.",
    points: ["Цахим (360°) үзлэг", "Онлайн захиалга, төлбөрийн уян хатан нөхцөл", "Зайнаас гэрээ байгуулах дэмжлэг"],
  },
  booking: {
    kicker: "Уулзалт товлох",
    title: "Бидэнтэй холбогдоорой",
    body:
      "Мэдээллээ үлдээгээрэй — борлуулалтын мэргэжилтэн тань нэг ажлын өдрийн дотор холбогдож, биечлэн эсвэл цахим үзлэг товлоно.",
    fields: { name: "Нэр", phone: "Утас", email: "И-мэйл", type: "Сонирхож буй өрөө", date: "Тохиромжтой огноо", message: "Нэмэлт мэдээлэл" },
    submit: "Хүсэлт илгээх",
    sending: "Илгээж байна…",
    successTitle: "Баярлалаа.",
    successBody: "Таны хүсэлт борлуулалтын албанд хүлээн авагдлаа. Бид нэг ажлын өдрийн дотор тантай холбогдоно.",
    again: "Дахин хүсэлт илгээх",
    error: "Алдаа гарлаа. Дахин оролдоно уу эсвэл шууд холбогдоно уу.",
    choose: "Сонгох",
  },
  faq: {
    kicker: "Түгээмэл асуулт",
    title: "Асуулт & хариулт",
    items: [
      { q: "Хэзээ ашиглалтад орох вэ?", a: "Elysium хотхон 2027 оны 2-р улиралд ашиглалтад орохоор төлөвлөгдсөн." },
      { q: "Давхартаа хэдэн айлтай вэ?", a: "Блок, давхар тус бүрийн айлын тоо төлөвлөлтөөс хамаарна. Дэлгэрэнгүйг борлуулалтын албанаас тодруулна уу." },
      { q: "Төслийн байршил хаана вэ?", a: "Хотхон Улаанбаатар хотод байрлана. Нарийвчилсан байршлыг борлуулалтын албанаас авна уу." },
      { q: "Борлуулалтын албатай хэрхэн холбогдох вэ?", a: `Утас ${SITE.phone}, и-мэйл ${SITE.email}, эсвэл “Уулзалт товлох” хэсгээр хүсэлт үлдээнэ үү.` },
      { q: "Гадаадаас орон сууц захиалах боломжтой юу?", a: "Тийм. Цахим үзлэг, онлайн захиалга, зайнаас гэрээ байгуулах боломжтой." },
    ],
  },
  articles: { kicker: "Нийтлэл", title: "Мэдээ & нийтлэл", body: "Хотхоны явц, үйл явдал, зөвлөмжийг энд хүргэнэ.", soon: "Нийтлэлүүд удахгүй нэмэгдэнэ." },
  footer: {
    ctaTitle: "Elysium-д таны шинэ амьдрал эхэлнэ.",
    explore: "Цэс",
    contact: "Холбоо барих",
    salesOffice: "Борлуулалтын алба",
    salesAddress: "Улаанбаатар хот · хаягийг удахгүй нэмнэ",
    hours: "Да–Ням · 09:00–18:00",
    social: "Сошиал холбоос",
    rights: "Бүх эрх хуулиар хамгаалагдсан.",
  },
  placeholders: {
    film: "Видео удахгүй",
    interior: "Интерьер зураг удахгүй",
    axono: "Аксонометр зураг — удахгүй",
    map: "Интерактив газрын зураг — удахгүй",
  },
  v2: {
    hero: {
      headline: "Амьдралаа Elysium-аас эхлүүл",
      sub: "Мэргэжлийн баг. Тодорхой зам. Байгальтай зэрэгцсэн шинэ хотхон танаас хариу хүлээж байна.",
      primary: "Орон сууц үзэх",
      secondary: "Уулзалт товлох",
    },
    why: {
      kicker: "Яагаад Elysium?",
      title: "Энэ бол зүгээр нэг орон сууц биш.",
      body: "Таны амьдрал өөрчлөгдөж байна. Зүгээр нэг байр бус — дараагийн алхмаа олоорой. Бид тодорхой, итгэлтэй, зөв шийдэлд хүрэхэд тань туслана.",
    },
    mosaic: {
      title: "Энэ бол өөрчлөлт, амьдралын чанар.",
      body: "Гэрэл гэгээтэй орон зай, ногоон хүрээлэн, ухаалаг төлөвлөлт — өдөр бүрийг сэргээх амьдрал.",
    },
    process: {
      kicker: "Энгийн 3 алхам",
      title: "Шинэ гэрт хүрэх зам",
      cta: "Эхлүүлэх",
      steps: [
        { title: "Хүнтэй ярь", body: "Мэргэжлийн зөвлөхтэй холбогдож, хэрэгцээгээ ярилцана." },
        { title: "Тодорхой бол", body: "Танд яг тохирох өрөө, төлбөрийн нөхцөлийг тодорхойлно." },
        { title: "Нүүж ор", body: "Захиалга, гэрээ, түлхүүр хүлээн авах хүртэл хамт байна." },
      ],
    },
    testimonials: {
      kicker: "Хэрэглэгчид",
      title: "Бидний тухай тэдний үг",
      items: [
        { quote: "Үзлэгээс эхлээд гэрээ хүртэл бүх зүйл хялбар, ил тод байсан.", name: "Б. Болормаа", role: "Шинэ оршин суугч" },
        { quote: "Гадаадаас байраа сонгож, бүхэлд нь онлайнаар шийдсэн. Гайхалтай үйлчилгээ.", name: "Т. Эрдэнэ", role: "Гадаадаас худалдан авагч" },
        { quote: "Ногоон орчин, тайван амьдрал яг хүссэнээр маань боллоо.", name: "Г. Сараа", role: "Гэр бүлийн худалдан авагч" },
        { quote: "Багийнхан мэргэжлийн, асуулт бүрд тодорхой хариулсан.", name: "Д. Тэмүүлэн", role: "Хөрөнгө оруулагч" },
      ],
    },
    services: {
      kicker: "Үйлчилгээ",
      title: "Elysium танд хэрхэн туслах вэ",
      body: "Манай баг сонголтоос эхлээд түлхүүр хүлээн авах хүртэл алхам бүрд хамт байна.",
      cta: "Эхлэх",
      items: [
        { title: "Орон сууц сонгох", body: "Өрөөний төрөл, давхар, талбайгаар тань тохирохыг олж сонгоно." },
        { title: "Санхүүжилт & нөхцөл", body: "Төлбөрийн уян хатан нөхцөл, зээлийн зөвлөгөөг бүрэн дэмжинэ." },
        { title: "Гадаадаас захиалах", body: "Цахим үзлэг, онлайн захиалга, зайнаас гэрээ байгуулах боломж." },
      ],
    },
    support: {
      kicker: "Худалдан авалтаас цааш",
      title: "Зөвхөн орон сууц бус — амьдрал",
      body: "Хотхоны менежмент, аюулгүй байдал, ногоон орчин — оршин суух бүх хугацаанд тань санаа тавина.",
    },
    cta: {
      title: "Танд хэрэгтэй гэрийг бид олоход тусална.",
      sub: "Эхлүүлцгээе",
      placeholder: "И-мэйл хаягаа оруулна уу",
      button: "Илгээх",
    },
  },
};

const en: Dict = {
  nav: {
    articles: "Articles",
    apartments: "Apartments",
    advantages: "Advantages",
    fromAbroad: "Buy from Abroad",
  },
  cta: "Book a Visit",
  hero: {
    kicker: "Elysium · Ulaanbaatar",
    title: "A life lived in harmony",
    subtitle:
      "Four blocks, 506 residences and 85% shared & open space — a new community designed to live alongside nature.",
    primary: "Book a Visit",
    secondary: "View Apartments",
    scroll: "Scroll",
  },
  stats: [
    { value: 506, label: "residences · 4 blocks" },
    { value: 85, suffix: "%", label: "shared & open space" },
    { value: 513, label: "parking spaces" },
    { text: "2027 · Q2", label: "anticipated completion" },
  ],
  intro: {
    kicker: "Introduction",
    title: "A considered plan that unites light, air and greenery.",
    body:
      "Elysium creates the chance to live alongside nature in the heart of the city. Most of the grounds are given to greenery and shared space, and every home is planned to capture daylight and a sense of calm.",
  },
  advantages: {
    kicker: "Project Advantages",
    title: "Four guiding principles",
    body: "Every major planning decision is measured against these principles.",
    items: [
      { title: "Ergonomic Standards", body: "Comfortable, human-centred and intelligent spatial planning." },
      { title: "Live in Harmony", body: "A balanced, peaceful environment that lives alongside nature." },
      { title: "Your Safety", body: "24/7 security, smart monitoring and a safe environment for families." },
      { title: "Save Big", body: "Sustainable solutions that lower energy and running costs." },
    ],
  },
  apartments: {
    kicker: "Apartments",
    title: "A space that fits you",
    body: "Layouts for every room count and footprint. Explore the axonometric drawings below.",
    note: "Axonometric drawings coming soon.",
    placeholder: "Axonometric drawing — coming soon",
    types: [
      { title: "1 room", body: "Studio & one-bedroom — 38–52 m²" },
      { title: "2 rooms", body: "Ideal for families — 58–74 m²" },
      { title: "3 rooms", body: "Spacious layouts — 82–104 m²" },
      { title: "4 rooms", body: "Premium living — from 110 m²" },
    ],
  },
  developer: {
    kicker: "The Developer",
    title: "Mongon Construction",
    body:
      "Elysium is being delivered by Mongon Construction. We have a proven track record of completing projects such as 360, Garden and Mandala on time and to a high standard.",
    label: "Previous projects",
    projects: ["360", "Garden", "Mandala"],
    tour: "360° virtual tour — coming soon",
  },
  gallery: { kicker: "Gallery", title: "The look of Elysium", cta: "View all" },
  fromAbroad: {
    kicker: "Buy from Abroad",
    title: "Choose your home from anywhere",
    body:
      "Living abroad is no obstacle to reserving a home at Elysium. Our sales specialists fully support virtual viewings, online reservation and remote contracts.",
    points: ["Virtual (360°) viewings", "Online reservation with flexible terms", "Remote contract support"],
  },
  booking: {
    kicker: "Book a Visit",
    title: "Get in touch",
    body:
      "Leave your details and a sales specialist will contact you within one business day to arrange an in-person or virtual viewing.",
    fields: { name: "Name", phone: "Phone", email: "Email", type: "Apartment of interest", date: "Preferred date", message: "Message" },
    submit: "Send request",
    sending: "Sending…",
    successTitle: "Thank you.",
    successBody: "Your request has reached our sales office. We will be in touch within one business day.",
    again: "Send another request",
    error: "Something went wrong. Please try again or contact us directly.",
    choose: "Choose",
  },
  faq: {
    kicker: "FAQ",
    title: "Questions & answers",
    items: [
      { q: "When will it be completed?", a: "Elysium is anticipated to be completed in Q2 of 2027." },
      { q: "How many apartments per floor?", a: "The number of apartments per floor depends on the block and layout. Please contact the sales office for details." },
      { q: "Where is the project located?", a: "The development is located in Ulaanbaatar. Please contact the sales office for the precise location." },
      { q: "How do I contact the sales office?", a: `Call ${SITE.phone}, email ${SITE.email}, or leave a request via “Book a Visit”.` },
      { q: "Can I buy an apartment from abroad?", a: "Yes. Virtual viewings, online reservation and remote contracts are all available." },
    ],
  },
  articles: { kicker: "Articles", title: "News & articles", body: "Project progress, events and guidance will appear here.", soon: "Articles coming soon." },
  footer: {
    ctaTitle: "Begin your new life at Elysium.",
    explore: "Explore",
    contact: "Contact",
    salesOffice: "Sales office",
    salesAddress: "Ulaanbaatar · address coming soon",
    hours: "Mon–Sun · 09:00–18:00",
    social: "Social",
    rights: "All rights reserved.",
  },
  placeholders: {
    film: "Film coming soon",
    interior: "Interior visuals coming soon",
    axono: "Axonometric drawing — coming soon",
    map: "Interactive map — coming soon",
  },
  v2: {
    hero: {
      headline: "Begin your life at Elysium",
      sub: "An expert team. A clear path. A new community living alongside nature is waiting for you.",
      primary: "View Apartments",
      secondary: "Book a Visit",
    },
    why: {
      kicker: "Why Elysium?",
      title: "This isn't just about an apartment.",
      body: "Your life is changing. Don't just find a place — find what's next. We help you move forward with clarity, confidence and the right choice.",
    },
    mosaic: {
      title: "It's about progress and quality of life.",
      body: "Light-filled spaces, green gardens and intelligent planning — a life that restores you every day.",
    },
    process: {
      kicker: "Three simple steps",
      title: "The path to your new home",
      cta: "Get started",
      steps: [
        { title: "Talk to a human", body: "Connect with an expert advisor and talk through what you need." },
        { title: "Get clarity", body: "We define the right apartment and payment terms for you." },
        { title: "Move forward", body: "We stay with you through reservation, contract and keys." },
      ],
    },
    testimonials: {
      kicker: "Residents",
      title: "Don't take our word for it",
      items: [
        { quote: "From the viewing to the contract, everything was easy and transparent.", name: "B. Bolormaa", role: "New resident" },
        { quote: "I chose my home from abroad and handled it all online. Wonderful service.", name: "T. Erdene", role: "Overseas buyer" },
        { quote: "The green surroundings and calm living are exactly what we wanted.", name: "G. Saraa", role: "Family buyer" },
        { quote: "The team was professional and answered every question clearly.", name: "D. Temuulen", role: "Investor" },
      ],
    },
    services: {
      kicker: "Services",
      title: "How Elysium helps you",
      body: "Our team is with you at every stage — from choosing to receiving the keys.",
      cta: "Get started",
      items: [
        { title: "Choose an apartment", body: "Find the layout, floor and size that fits you best." },
        { title: "Financing & terms", body: "Flexible payment terms and full lending guidance." },
        { title: "Buy from abroad", body: "Virtual viewings, online reservation and remote contracts." },
      ],
    },
    support: {
      kicker: "Beyond the purchase",
      title: "Not just an apartment — a life",
      body: "Property management, safety and green surroundings — we care for you throughout your stay.",
    },
    cta: {
      title: "We'll help you find the home you need.",
      sub: "Let's get started",
      placeholder: "Enter your email",
      button: "Submit",
    },
  },
};

export const DICT: Record<Lang, Dict> = { mn, en };

/* Gallery image set (locale-independent) */
export const GALLERY = [
  { src: "/images/hero-sunset.png", alt: "Elysium" },
  { src: "/images/amenity-canal-blue.jpg", alt: "Elysium" },
  { src: "/images/exterior-plaza-pink.jpg", alt: "Elysium" },
  { src: "/images/exterior-snow-courtyard.jpg", alt: "Elysium" },
  { src: "/images/aerial-masterplan.jpg", alt: "Elysium" },
  { src: "/images/amenity-garden-walk.jpg", alt: "Elysium" },
  { src: "/images/exterior-path-moody.jpg", alt: "Elysium" },
  { src: "/images/aerial-park-playground.jpg", alt: "Elysium" },
  { src: "/images/exterior-elevation-dusk.jpg", alt: "Elysium" },
];

export const APARTMENT_IMAGES = [
  "/images/exterior-lowangle-towers.jpg",
  "/images/exterior-garden-path.jpg",
  "/images/exterior-cluster-dusk.jpg",
  "/images/exterior-elevation-dusk.jpg",
];

export const HERO_IMAGE = "/images/hero-sunset.png";

/* ============================================================
   FINAL — unified /final page content (MN only; client v2 review).
   Single source of truth for the redesigned page.
   ============================================================ */
export const FINAL = {
  brandLine: "Elysium Residence",
  brandTag: "Бизнес зэрэглэлийн орон сууц",
  hero: {
    sub: "Туул голын эрэгт байрлах, шинэ стандарт тогтоох бизнес зэрэглэлийн орон сууц.",
    brochure: "Танилцуулга татах",
    cta: "Уулзалт товлох",
  },
  stats: {
    kicker: "Ерөнхий төлөвлөлт",
    items: [
      { value: 506, suffix: "", label: "айлын орон сууц · 4 блок" },
      { value: 85, suffix: "%", label: "нийтийн эзэмшлийн талбай" },
      { value: 513, suffix: "", label: "автомашины зогсоол" },
    ],
  },
  about: {
    kicker: "Төслийн тухай",
    title: "Form Follows Function",
    body:
      "Туул голын салхи илбэсэн шинэ төлөвлөлт бүхий бүсэд байрлах Elysium Residence нь чимхлүүр хэсэг бүрд ур ухаанаа шингээсэн эргономик шийдэлтэй, бүс нутагтаа шинэ стандартыг тогтоох бизнес зэрэглэлийн орон сууц юм.",
    completionLabel: "Ашиглалтад орох хугацаа",
    completion: "2027 оны 2-р улирал",
  },
  elys: {
    kicker: "Агшин бүрд мэдрэх тав тух",
    title: "Төслийн консепц — ELYS",
    items: [
      { title: "Ergonomic Standards", body: "Эрүүл амьдрахад тань зориулж, хүний бүх хэрэгцээг тооцоолон гаргасан эргономик шийдэлтэй тул тав тухтай амьдрах боломжтой." },
      { title: "Live in Harmony", body: "Эрүүл зөв амьдралын хэв маягт хөтлөх нийтийн эзэмшлийн ногоон байгууламж талбайг төлөвлөсөн." },
      { title: "Your Safety", body: "Аюулгүй байдал тав тухыг хангасан орчин үеийн нэвтрэлтийн нэгдсэн системийг цогцоор нь төлөвлөсөн." },
      { title: "Save Big", body: "Дулаан алдагдал багатай, эрчим хүчний хэмнэлттэй шийдэл нь урт хугацаандаа таны ашиглалтын зардлыг бууруулна." },
    ],
  },
  apartments: {
    kicker: "Өрөөний сонголт",
    body: "Уужим, ашигтай, минимал орон сууцны сонголтоос та өөрт тохирохыг сонгоорой.",
    types: [
      { title: "1 өрөө", area: "38–52 м²" },
      { title: "2 өрөө", area: "58–74 м²" },
      { title: "3 өрөө", area: "82–104 м²" },
      { title: "4 өрөө", area: "110 м²-аас" },
    ],
  },
  developer: {
    kicker: "Төсөл хэрэгжүүлэгч",
    name: "Монкон Констракшн ХХК",
    since: 2006,
    projectCount: "60+",
    body:
      "Монкон Констракшн ХХК нь 2006 оноос хойш захиалагч, хэрэглэгчдэдээ барилгын зураг төслөөс эхлээд түлхүүр гардуулах хүртэлх барилгын цогц үйлчилгээг хүргэхдээ архитектурын шинэлэг шийдлийг нэвтрүүлж, барилга угсралтын чанараа тогтмол сайжруулсаар ирсэн. Өнөөдрийг хүртэл 60 гаруй төслийг амжилттай хэрэгжүүлээд байна.",
    projects: [
      { title: "Комфорт хотхон", meta: "15 давхар · 600 айл", floors: 15, units: 600, years: "2014–2019" },
      { title: "Мандала хотхон", meta: "18 давхар · 510 айл", floors: 18, units: 510, years: "2015–2019" },
      { title: "Мандала гарден", meta: "16 давхар · 2500 айл", floors: 16, units: 2500, years: "2019–2030" },
      { title: "360, 365 Мандала Тауэр", meta: "25 давхар · 200 айл", floors: 25, units: 200, years: "2018–2025" },
    ],
  },
  gallery: { kicker: "Зургийн цомог", title: "Elysium-ийн дүр төрх" },
  contact: {
    kicker: "Бидэнтэй холбогдох",
    sub: "Та доорх асуулгыг бөглөснөөр манай борлуулалтын менежерүүд тантай холбогдон уулзалтын өдрийг баталгаажуулах болно.",
    phone: "7786-2222",
    hours: "Даваа – Ням · 09:00 – 18:00",
    location: "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэр",
  },
  faq: {
    kicker: "Түгээмэл асуулт",
    items: [
      { q: "Хэзээ ашиглалтад орох вэ?", a: "Elysium Residence 2027 оны 2-р улиралд ашиглалтад орохоор төлөвлөгдсөн." },
      { q: "Давхартаа хэдэн айлтай вэ?", a: "Блок, давхар тус бүрийн айлын тоо төлөвлөлтөөс хамаарна. Дэлгэрэнгүйг борлуулалтын албанаас тодруулна уу." },
      { q: "Төслийн байршил хаана вэ?", a: "Үндэсний цэцэрлэгт хүрээлэнгийн баруун хойно, 360 Мандала тауэрын ойролцоо." },
      { q: "Борлуулалтын албатай хэрхэн холбогдох вэ?", a: "Утас 7786-2222, эсвэл “Уулзалт товлох” хэсгээр хүсэлт үлдээнэ үү." },
      { q: "Гадаадаас орон сууц захиалах боломжтой юу?", a: "Тийм. Цахим үзлэг, онлайн захиалга, зайнаас гэрээ байгуулах боломжтой." },
    ],
  },
} as const;
