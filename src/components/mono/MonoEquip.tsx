"use client";

/* /mono — Тоноглол ба шийдэл. Chapter 03 of the scroll story:
   engineering-callout variant — lime pins on the facade close-up
   (frames 85–121) with connector lines drawing toward sharp spec
   cards. */

import { MonoScrollStory } from "./MonoScrollStory";

const POINTS = [
  { n: "01", heading: "Дулаан алдагдал багатай цонх", text: "Гурван давхар шилтэй, эрчим хүч хэмнэх цонхны систем — өвлийн дулааныг дотогшоо хадгална." },
  { n: "02", heading: "Ухаалаг нэвтрэлтийн систем", text: "Нүүр таних + RFID нэгдсэн хяналт — зөвхөн оршин суугчид болон зөвшөөрөлтэй зочид нэвтэрнэ." },
  { n: "03", heading: "Солонгос лифт", text: "Өндөр хурдны, ачаалал даацтай зорчигчийн лифт — хүлээх цагийг багасгана." },
  { n: "04", heading: "Агаар сэлгэлтийн систем", text: "Шүүлттэй агааржуулалт — тоос, хийг шүүж, айл бүрд цэвэр агаар орж байршуулна." },
];

export function MonoEquip() {
  return (
    <MonoScrollStory
      id="equip"
      chapter="03"
      kicker="Дэлгэрэнгүйд нухацтай"
      title="Тоноглол ба шийдэл"
      points={POINTS}
      frameStart={85}
      frameEnd={121}
      variant="callouts"
    />
  );
}
