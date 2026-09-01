import { FOOTER } from "./data";
import { Reveal } from "./Reveal";
import { MailIcon, PhoneIcon, PinIcon } from "./icons";

export function Footer() {
  return (
    <footer className="mt-10 rounded-t-3xl bg-acs-cream2">
      <div className="mx-auto max-w-[1440px] px-6 pt-24 md:px-10">
        {/* CTA + link columns */}
        <div className="grid gap-16 md:grid-cols-2">
          <div className="flex flex-col justify-between">
            <Reveal
              as="h2"
              className="max-w-lg text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium uppercase leading-[1.12] tracking-[-0.01em] text-acs-brown"
            >
              {FOOTER.cta}
            </Reveal>
            <a
              href="#contact"
              className="mt-10 inline-block w-fit text-[0.9rem] uppercase tracking-[0.05em] text-acs-brown underline-offset-8 hover:underline"
            >
              {FOOTER.getInTouch}
            </a>
          </div>

          <div className="grid grid-cols-3 gap-8 md:justify-items-end">
            {FOOTER.navCols.map((col, i) => (
              <ul key={i} className="space-y-3.5">
                {col.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[0.82rem] uppercase tracking-[0.03em] text-acs-brown/85 transition-opacity hover:opacity-60"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        {/* Divider + bottom row */}
        <div className="mt-20 border-t border-acs-brown/15 pt-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-acs-brown/80">
              <MailIcon className="h-5 w-5" />
              <span className="h-4 w-px bg-acs-brown/25" />
              <PhoneIcon className="h-5 w-5" />
              <span className="h-4 w-px bg-acs-brown/25" />
              <PinIcon className="h-5 w-5" />
            </div>
            <div className="text-[0.85rem] text-acs-brown/75">{FOOTER.copyright}</div>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="mt-16 overflow-hidden">
          <div className="whitespace-nowrap text-center text-[clamp(3.5rem,15vw,13rem)] font-extrabold leading-none tracking-[-0.04em] text-acs-brown">
            {FOOTER.wordmark}
          </div>
        </div>
      </div>

      {/* Bottom full-width image */}
      <div className="mt-10 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FOOTER.image}
          alt="ArcSphere residence"
          className="h-[300px] w-full object-cover md:h-[440px]"
        />
      </div>
    </footer>
  );
}
