import type { SVGProps } from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function CubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 2.5 21 7v10l-9 4.5L3 17V7z" />
      <path d="M3 7l9 4.5L21 7" />
      <path d="M12 11.5V21.5" />
    </svg>
  );
}

export function BulbIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.2 1 2.5h6c0-1.3.3-1.8 1-2.5A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 6.1 21.3l1.2-6.6L2.5 9.5l6.6-.9z" />
    </svg>
  );
}

export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.94 8.5H4.06V20h2.88V8.5ZM5.5 3.5A1.7 1.7 0 1 0 5.5 7a1.7 1.7 0 0 0 0-3.5ZM20 13.9c0-3-1.6-4.4-3.7-4.4a3.2 3.2 0 0 0-2.9 1.6h-.05V8.5H10.6V20h2.88v-5.7c0-1.5.28-2.95 2.14-2.95 1.83 0 1.85 1.7 1.85 3.05V20H20v-6.1Z" />
    </svg>
  );
}

export function PinterestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-3.6 19.3c-.08-.8-.15-2 .03-2.9l1.16-4.9s-.3-.6-.3-1.47c0-1.38.8-2.4 1.8-2.4.85 0 1.26.64 1.26 1.4 0 .86-.55 2.14-.83 3.33-.24 1 .5 1.8 1.48 1.8 1.78 0 3.14-1.87 3.14-4.57 0-2.4-1.72-4.07-4.17-4.07-2.84 0-4.5 2.13-4.5 4.32 0 .86.33 1.78.74 2.28.08.1.09.19.07.29l-.28 1.13c-.04.18-.15.22-.34.13-1.25-.58-2.03-2.4-2.03-3.87 0-3.15 2.29-6.04 6.6-6.04 3.46 0 6.16 2.47 6.16 5.77 0 3.44-2.17 6.21-5.18 6.21-1.01 0-1.96-.53-2.29-1.15l-.62 2.37c-.22.86-.83 1.94-1.24 2.6A10 10 0 1 0 12 2Z" />
    </svg>
  );
}

export function BehanceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8.2 11.3c.8-.4 1.2-1 1.2-1.9 0-1.8-1.3-2.6-3.2-2.6H2v10h4.4c2 0 3.5-1 3.5-3 0-1.3-.6-2.2-1.7-2.5ZM4.2 8.5h1.8c.8 0 1.3.3 1.3 1s-.5 1.1-1.4 1.1H4.2V8.5Zm2 6.9H4.2v-2.5h2c1 0 1.6.4 1.6 1.25 0 .9-.6 1.25-1.6 1.25ZM19.2 9.2H14.6V8h4.6v1.2ZM17.9 11c-2.1 0-3.6 1.5-3.6 3.7 0 2.2 1.4 3.6 3.7 3.6 1.7 0 3-.8 3.4-2.3h-1.9c-.2.5-.7.8-1.4.8-1 0-1.6-.6-1.7-1.6H21.6c.2-2.6-1.2-4.2-3.7-4.2Zm-1.5 3c.1-.9.7-1.5 1.5-1.5.9 0 1.4.6 1.5 1.5h-3Z" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-2.9h-2.9V8.7c0-.84.24-1.42 1.46-1.42h1.54V4.68c-.27-.04-1.18-.12-2.24-.12-2.22 0-3.74 1.35-3.74 3.84v2.14H8v2.9h2.48V21h3.02Z" />
    </svg>
  );
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.5 8.2a2.7 2.7 0 0 0-1.9-1.9C18.9 5.8 12 5.8 12 5.8s-6.9 0-8.6.5A2.7 2.7 0 0 0 1.5 8.2 28 28 0 0 0 1 12a28 28 0 0 0 .5 3.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 23 12a28 28 0 0 0-.5-3.8ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z" />
    </svg>
  );
}

export const PROCESS_ICONS = {
  search: SearchIcon,
  cube: CubeIcon,
  bulb: BulbIcon,
  check: CheckIcon,
} as const;
