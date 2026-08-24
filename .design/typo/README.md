# Типографийн админ самбар — дизайн

`/admin/site → Дизайн → Типографи`. Дизайнер нүүр хуудасны фонт, жин,
үсэг хоорондын зайг өөрөө удирдана.

| Файл | Юу вэ |
|---|---|
| `Main.dc.html` | Бүтэн админ хуудас — Типографи самбар |
| `Presets.dc.html` | Дөрвөн бэлэн хослол зэрэгцүүлсэн — хөшүүрэг юу хийдгийг харуулна |
| `Mobile.dc.html` | Гар утасны хувилбар |

Өнгө, радиус, хэмжээ бүгд одоогийн админаас авсан (`components/admin/ui.tsx`,
`DesignFields.tsx`, `SiteEditor.tsx`): ногоон `#2a5124`, карт `rounded-2xl`
`border-neutral-200`, талбарын шошго 13px/600, оролт `rounded-lg` 15px.

## Гурван гол шийдэл

1. **Preview дээрээ, наалдамхай.** Хөшүүрэг тохируулж байхад үр дүн
   үргэлж нүдний өмнө байна.
2. **Фонт жагсаалтаар, dropdown-оор биш.** Мөр бүрт латин + кирилл дээж
   тухайн фонтоороо гарна.
3. **«КИРИЛЛ ✓» тэмдэг.** Google Fonts-ын олон тансаг фонт (Bodoni Moda,
   Marcellus, Instrument Serif, Figtree) кирилл дэмждэггүй — жагсаалтад
   зөвхөн шалгасан фонт орно.

## Шалгасан фонтууд (2026-08)

Кирилл ✔ — Cormorant Garamond, Playfair Display, Manrope, Montserrat,
Onest, Golos Text, Unbounded, Jost, Spectral, PT Serif, Rubik, Raleway,
Commissioner, Wix Madefor Display, Oswald

Кирилл ✘ — **Figtree, Bodoni Moda, Marcellus, Instrument Serif**

Засах: эдгээр файлыг засаад `/design` skill-ээр дахин угсарч нийтэлнэ.
