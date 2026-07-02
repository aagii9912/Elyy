import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elysium — Эв найрамдалтай, төгс амьдрал",
  description:
    "4 блок, 440 айлын орон сууцтай, нийт талбайн 85% нь нийтийн эзэмшил — байгальтай зэрэгцэн амьдрах шинэ хотхон.",
};

export default function ArcSphereLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="arcsphere min-h-screen w-full overflow-x-hidden">{children}</div>;
}
