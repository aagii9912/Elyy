/* Intentional placeholders — film & interior renders arrive later.
   Styled to read as deliberate "coming soon" panels, not broken. */

export function VideoPlaceholder({
  label = "Film coming soon",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      data-placeholder="video"
      className={`relative flex items-center justify-center overflow-hidden bg-charcoal text-bone ${className}`}
    >
      {/* subtle grain / vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55))]" />
      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-bone/40">
          <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7L8 5Z" />
          </svg>
        </span>
        <span className="overline text-bone/70">{label}</span>
      </div>
    </div>
  );
}

export function InteriorPlaceholder({
  label = "Interior visuals coming soon",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      data-placeholder="interior"
      className={`relative flex items-center justify-center overflow-hidden border border-clay/60 bg-sand ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 14px, rgba(157,148,134,0.12) 14px 28px)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-taupe" fill="none" aria-hidden>
          <path
            d="M3 21V8l9-5 9 5v13M3 21h18M9 21v-6h6v6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
        <span className="overline text-taupe">{label}</span>
      </div>
    </div>
  );
}
