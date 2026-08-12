/* /mono — slogan band: the three "Form Follows …" lines on an infinite
   marquee. Black text, lime diamond as the lone colour accent. */

import type { SiteContent } from "@/lib/site-content";

export function MonoMarquee({ site }: { site: SiteContent }) {
  const slogans = site.marquee.slogans;
  const track = [...slogans, ...slogans, ...slogans];
  return (
    <div aria-hidden data-reveal="up" className="overflow-hidden border-b border-night/10 bg-white py-5 md:py-7">
      <div className="green-marquee flex w-max items-center gap-10 whitespace-nowrap pr-10">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center gap-10">
            {track.map((s, i) => (
              <span key={`${half}-${i}`} className="flex items-center gap-10">
                <span className="text-[clamp(1.4rem,3vw,2.4rem)] font-extrabold uppercase tracking-tight text-night/85">
                  {s}
                </span>
                <svg viewBox="696.5 -1 29 30" className="h-5 w-5 text-lime" fill="currentColor" aria-hidden>
                  <path d="M724.7627131503,1.6928812257l-1.5571644463-1.5571639374c-.1809564854-.1809564263-.4743448685-.1809563783-.6553012947.0000001071l-10.9339166573,10.9339202305c-.0868983404.0868983688-.1357173084.2047578379-.1357172883.3276506695l.0000002984,1.8262380573c.0000000201.1228928316.0488190266.2407522848.1357173954.3276506252l1.5571644463,1.5571639374c.1809564854.1809564262.4743448685.1809563783.6553012947-.0000001071l10.9339166573-10.9339202304c.0868983404-.0868983688.1357173084-.2047578379.1357172883-.3276506695l-.0000002984-1.8262380573c-.0000000201-.1228928316-.0488190266-.2407522848-.1357173954-.3276506252Z" />
                  <path d="M710.6956105802,6.3674608853l-1.5571644462-1.5571639374c-.1809564854-.1809564262-.4743448685-.1809563783-.6553012947.0000001071l-10.9339166573,10.9339202304c-.0868983404.0868983688-.1357173084.2047578379-.1357172883.3276506695l.0000002984,1.8262380573c.0000000201.1228928316.0488190266.2407522848.1357173954.3276506252l1.5571644463,1.5571639374c.1809564854.1809564262.4743448685.1809563783.6553012947-.0000001071l10.9339166573-10.9339202304c.0868983404-.0868983688.1357173084-.2047578379.1357172883-.3276506695l-.0000002984-1.8262380573c-.0000000201-.1228928316-.0488190266-.2407522848-.1357173954-.3276506252Z" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
