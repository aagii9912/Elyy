import type { HighlightIconName } from "@/lib/registration-page";

/* Онцлох мэдээллийн жагсаалтын дүрсүүд — дүүргэсэн, accent өнгөөр (currentColor). */
const PATHS: Record<HighlightIconName, string> = {
  building: "M5 3h14a1 1 0 0 1 1 1v17h-6v-4h-4v4H4V4a1 1 0 0 1 1-1Zm3 4v2h2V7H8Zm6 0v2h2V7h-2Zm-6 4v2h2v-2H8Zm6 0v2h2v-2h-2Z",
  home: "M12 3 2 11h3v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9h3L12 3Z",
  key: "M14.5 2a7.5 7.5 0 0 0-7.2 9.6L2 16.9V22h5v-3h3v-3h2.4l.3-.3A7.5 7.5 0 1 0 14.5 2Zm2 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z",
  pie: "M11 3.05V13h9.95A9 9 0 1 1 11 3.05ZM13 2a9 9 0 0 1 9 9h-9V2Z",
  bars: "M4.5 12h2A1.5 1.5 0 0 1 8 13.5v6A1.5 1.5 0 0 1 6.5 21h-2A1.5 1.5 0 0 1 3 19.5v-6A1.5 1.5 0 0 1 4.5 12ZM11 3h2a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 13 21h-2a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 11 3Zm6.5 5h2A1.5 1.5 0 0 1 21 9.5v10a1.5 1.5 0 0 1-1.5 1.5h-2a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 17.5 8Z",
  percent: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm7 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-.3-7.1 1.4 1.4-7.8 7.8-1.4-1.4 7.8-7.8Z",
  wallet: "M3 6a2 2 0 0 1 2-2h13v3h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm13 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5 6v1h11V6H5Z",
  calendar: "M7 2v2H5a2 2 0 0 0-2 2v2h18V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7ZM3 10v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9H3Zm4 3h3v3H7v-3Z",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v4.6l3.2 3.2-1.4 1.4L11 12.4V7Z",
  pin: "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 4.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
  video: "M3 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v2.6l5-3v10.8l-5-3V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z",
  users: "M9 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm8 1a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM2 19a7 7 0 0 1 14 0v1H2v-1Zm16 1v-1a8.9 8.9 0 0 0-1.5-5H17a5 5 0 0 1 5 5v1h-4Z",
  check: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.3 6.3 1.4 1.4-7.2 7.2-4.2-4.2 1.4-1.4 2.8 2.8 5.8-5.8Z",
  star: "m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.1-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9 2.9-6Z",
};

export function HighlightIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" clipRule="evenodd" className={className}>
      <path d={PATHS[name as HighlightIconName] ?? PATHS.check} />
    </svg>
  );
}
