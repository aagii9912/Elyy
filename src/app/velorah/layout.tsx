import { Instrument_Serif, Playfair_Display } from "next/font/google";
import "./velorah.css";

/* `/velorah` — шилэн кино hero.

   Дэлгэцийн хоёр фонт ЭНД тодорхойлогдоно, root layout-д БИШ:
   `next/font` нь фонтыг импортолсон сегментэд л `<link rel=preload>`
   гаргадаг тул `/`, `/noir`, `/news` зэрэг хуудас эдгээрийг татахаа
   болино (тэнд огт хэрэглэгддэггүй). */

/* ⚠️ Энэ фонтын `.variable`-ыг `velorah.css` дотор ХЭРЭГЛЭХГҮЙ —
   гэр бүлийн нэрийг нь ШУУД бичдэг. Учир нь `next/font` нь
   `--font-instrument-serif`-ийг ХОЁР гэр бүлийн жагсаалт болгодог:
   `"Instrument Serif", "Instrument Serif Fallback"`. Сүүлийнх нь
   `src: local(Times New Roman)` бөгөөд unicode-range ЗААГААГҮЙ.
   Instrument Serif кириллгүй тул кирилл үсэг бүр тэр metric fallback
   руу унана; Times New Roman кириллийг хамардаг учир Playfair хүртэл
   ХЭЗЭЭ Ч хүрэхгүй — гарчиг Windows/macOS дээр 83.94% хэмжээтэй Times,
   Times байхгүй системд Playfair болж, платформоос хамааран ӨӨР
   харагдана. (`adjustFontFallback: false` нь Next 16.2.9-д үйлчилсэнгүй
   — build-ийн гаралтаас шалгасан.) Google-ийн фонтын @font-face нэр нь
   хэшлэгддэггүй тул шууд бичихэд найдвартай. */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

/* Instrument Serif-ийн КИРИЛЛ хос — хөтөч үсэг тус бүрээр буцна. */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  display: "swap",
});

export default function VelorahLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${instrumentSerif.variable} ${playfair.variable}`}>{children}</div>;
}
