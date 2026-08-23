# 03 · Барилгын бүтэц — бичвэрийн байрлал

`src/components/ui/portrait-showcase.tsx` (MonoEquip ашигладаг) хэсгийн
бичвэрийн эгнээ, байрлалыг сайжруулах дизайн.

| Файл | Юу вэ |
|---|---|
| `Main.dc.html` | A · Зүүн тэнхлэг — тайлбарыг thumbnail-ийн дээр буулгав (санал болгосон) |
| `TwoCol.dc.html` | B · Хоёр багана, гарчгийн мөрнөөс жигдэрсэн, «ОНЦЛОХ» шошготой |
| `Bottom.dc.html` | C · Бүх бичвэр доод гуравны нэгд, thumbnail баруун талд |
| `Current.dc.html` | Одоогийн харагдац — зэрэгцүүлэхэд |
| `Mobile.dc.html` | Гар утас · A |
| `structure.webp` | Дэвсгэр кадр (`public/structure-frames/frame_040.webp`) |
| `canvas.json` | Байрлал, тэмдэглэлүүд |

Өнгө, хөшиг, хэмжээ бүгд `portrait-showcase.tsx`-аас авсан (charcoal
хөшиг 42/16/72 ба 46/6/0, гарчиг `clamp(1.9rem,4.4vw,4rem)`, kicker
11px/0.28em, thumbnail 56px г.м.).

Засах: эдгээр файлыг засаад `/design` skill-ээр дахин угсарч нийтэлнэ.
