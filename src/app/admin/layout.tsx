import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Админ",
  robots: { index: false, follow: false },
};

/* Админ бүрхүүл — тайван цайвар суурь, брэндийн ногоон удирдлага.
   .admin-shell класс нь globals.css-д custom cursor-ыг унтрааж, native
   курсорыг сэргээнэ. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell min-h-dvh bg-[#f2f4ef] text-[#203126]">{children}</div>;
}
