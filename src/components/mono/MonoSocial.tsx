/* /mono — сошиал холбоос. Админаас (`/admin/site` → Хөл хэсэг) нэр,
   холбоос, icon-ыг сонгоно. `href` хоосон эсвэл "#" бол тухайн мөр
   харагдахгүй — ингэснээр тохируулаагүй холбоос хэрэглэгчид гарахгүй. */

import type { SocialLink } from "@/lib/site-content";

/** Тохируулсан (жинхэнэ URL-тэй) холбоосууд. */
export const liveSocials = (items: SocialLink[]) =>
  items.filter((i) => {
    const href = i.href?.trim();
    return Boolean(href) && href !== "#" && i.label?.trim();
  });

/* 24×24 viewBox, currentColor-оор будагдана. */
const PATHS: Record<string, string> = {
  facebook:
    "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z",
  instagram:
    "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.39C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.39 2.12.66.67 1.33 1.09 2.12 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.39.67-.66 1.09-1.33 1.39-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.39-2.12C21.32 1.35 20.65.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z",
  youtube:
    "M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z",
  tiktok:
    "M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .74-5.07v-3.1a5.65 5.65 0 0 0-.74-.05A5.68 5.68 0 1 0 15.54 15V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.24-1.48Z",
  linkedin:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z",
  twitter:
    "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z",
  link: "M10.6 13.4a4 4 0 0 0 5.66 0l3.54-3.54a4 4 0 0 0-5.66-5.66l-1.42 1.42 1.42 1.41 1.41-1.41a2 2 0 1 1 2.83 2.83l-3.54 3.53a2 2 0 0 1-2.83 0l-1.41 1.42Zm2.8-2.8a4 4 0 0 0-5.66 0l-3.54 3.54a4 4 0 0 0 5.66 5.66l1.42-1.42-1.42-1.41-1.41 1.41a2 2 0 1 1-2.83-2.83l3.54-3.53a2 2 0 0 1 2.83 0l1.41-1.42Z",
};

/* Нэр нь танигдах сүлжээтэй яг таарвал түүнийг эрхэмлэнэ. Учир нь
   `mergeSiteContent` нь хадгалсан хуучин мөрүүдийн дутуу `icon`-ыг эхний
   өгөгдмөл элементээс нөхдөг — тэгэхгүй бол Instagram, YouTube бүгд
   Facebook-ийн тэмдэгтэй гарна. Өөрийн нэр өгсөн бол `icon` мөрдөгдөнө. */
const iconKey = (item: SocialLink) => {
  const byLabel = (item.label || "").toLowerCase().trim();
  if (PATHS[byLabel]) return byLabel;
  const byIcon = (item.icon || "").toLowerCase().trim();
  return PATHS[byIcon] ? byIcon : "link";
};

function SocialIcon({ item }: { item: SocialLink }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
      <path d={PATHS[iconKey(item)]} />
    </svg>
  );
}

/** Дугуй icon товчнуудын мөр — цайвар суурьт (холбоо барих хэсэг). */
export function SocialRow({
  items,
  className = "",
  tone = "light",
}: {
  items: SocialLink[];
  className?: string;
  tone?: "light" | "dark";
}) {
  const live = liveSocials(items);
  if (!live.length) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className}`}>
      {live.map((item, i) => (
        <li key={`${item.href}-${i}`}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-hover
            aria-label={item.label}
            title={item.label}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 ${
              tone === "dark"
                ? "border-white/20 text-white/70 hover:border-white hover:bg-white hover:text-night"
                : "border-night/15 text-night/60 hover:border-night hover:bg-night hover:text-white"
            }`}
          >
            <SocialIcon item={item} />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Нэр + icon бүхий босоо жагсаалт — хөл хэсэгт (цайвар суурь). */
export function SocialList({ items }: { items: SocialLink[] }) {
  const live = liveSocials(items);
  if (!live.length) return null;

  return (
    <ul className="mt-4 space-y-2.5 text-sm text-night/70">
      {live.map((item, i) => (
        <li key={`${item.href}-${i}`}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-hover
            className="inline-flex items-center gap-2.5 py-1 transition-colors duration-300 hover:text-night"
          >
            <SocialIcon item={item} />
            {item.label}
            <span aria-hidden className="text-night/50">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
