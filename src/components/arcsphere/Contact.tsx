"use client";

import { CONTACT } from "./data";
import { Reveal } from "./Reveal";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "./icons";

const SOCIALS = [FacebookIcon, InstagramIcon, YoutubeIcon];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
      <div className="grid gap-14 md:grid-cols-2 md:gap-20">
        {/* Left column */}
        <div className="flex flex-col justify-between">
          <div>
            <Reveal
              as="h2"
              className="text-[clamp(2rem,4.4vw,3.2rem)] font-medium uppercase leading-[1.06] tracking-[-0.01em] text-acs-brown"
            >
              {CONTACT.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </Reveal>
            <Reveal
              as="p"
              delay={80}
              className="mt-6 max-w-md text-[1rem] leading-relaxed text-acs-brown/80"
            >
              {CONTACT.subtitle}
            </Reveal>
          </div>

          <Reveal delay={120} className="mt-16 grid grid-cols-2 gap-y-10">
            <div>
              <div className="text-[1rem] text-acs-brown">{CONTACT.phoneLabel}</div>
              <div className="mt-2 text-[0.9rem] text-acs-brown/70">{CONTACT.phone}</div>
            </div>
            <div>
              <div className="text-[1rem] text-acs-brown">{CONTACT.emailLabel}</div>
              <div className="mt-2 text-[0.9rem] text-acs-brown/70">{CONTACT.email}</div>
            </div>
            <div>
              <div className="text-[1rem] text-acs-brown">{CONTACT.socialLabel}</div>
              <div className="mt-3 flex gap-3 text-acs-brown">
                {SOCIALS.map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-acs-brown/8 transition-colors hover:bg-acs-brown/16"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[1rem] text-acs-brown">{CONTACT.addressLabel}</div>
              <div className="mt-2 max-w-[16rem] text-[0.9rem] text-acs-brown/70">
                {CONTACT.address}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right column — form */}
        <Reveal delay={80}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="text-[1.15rem] text-acs-brown">{CONTACT.detailTitle}</div>
            <div className="mt-6 space-y-7">
              {CONTACT.detailFields.map((f) => (
                <input key={f} className="acs-input" placeholder={f} type="text" />
              ))}
            </div>

            <div className="mt-14 text-[1.15rem] text-acs-brown">{CONTACT.contextTitle}</div>
            <div className="mt-6 space-y-7">
              {CONTACT.contextFields.map((f) => (
                <input key={f} className="acs-input" placeholder={f} type="text" />
              ))}
            </div>

            <button
              type="submit"
              className="mt-12 w-full rounded-full bg-acs-brown py-4 text-[0.9rem] text-acs-cream transition-colors hover:bg-acs-ink"
            >
              {CONTACT.submit}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
