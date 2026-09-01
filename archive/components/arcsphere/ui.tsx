import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Centered section header: uppercase title + muted subtitle. */
export function SectionHead({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-2xl text-center ${className}`}>
      <Reveal
        as="h2"
        className="text-[clamp(1.9rem,4.4vw,2.5rem)] font-medium uppercase leading-[1.28] tracking-[-0.01em] text-acs-brown"
      >
        {title}
      </Reveal>
      {subtitle && (
        <Reveal
          as="p"
          delay={80}
          className="mx-auto mt-5 max-w-md text-[0.95rem] uppercase leading-relaxed tracking-[0.02em] text-acs-brown/75"
        >
          {subtitle}
        </Reveal>
      )}
    </div>
  );
}

type PillProps = {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
};

/** Rounded-full pill button in the three ArcSphere styles. */
export function Pill({ children, href = "#", variant = "solid", className = "" }: PillProps) {
  const styles: Record<string, string> = {
    solid: "bg-acs-cream text-acs-brown hover:bg-white",
    outline:
      "border border-acs-cream/60 text-acs-cream hover:bg-acs-cream/10 backdrop-blur-sm",
    ghost: "bg-acs-brown text-acs-cream hover:bg-acs-ink",
  };
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[0.85rem] uppercase tracking-[0.02em] transition-colors duration-300 ${styles[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
