import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Админ",
  robots: { index: false, follow: false },
};

/* Админ бүрхүүл — маркетингийн брэнд бус, саарал ажлын дэвсгэр.
   .admin-shell класс нь globals.css-д custom cursor-ыг унтрааж, native
   курсорыг сэргээнэ. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell min-h-dvh bg-neutral-50 text-neutral-900">{children}</div>;
}
