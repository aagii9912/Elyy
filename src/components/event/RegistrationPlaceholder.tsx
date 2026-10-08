import styles from "./EventRegistration.module.css";

export function RegistrationPlaceholder({ label, detail, kind = "image", className = "" }: {
  label: string; detail?: string; kind?: "image" | "logo" | "person"; className?: string;
}) {
  return (
    <div className={`${styles.placeholder} ${className}`}>
      <svg aria-hidden viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2">
        {kind === "person" ? <><circle cx="24" cy="16" r="8" /><path d="M9 42v-4a15 15 0 0 1 30 0v4" /></> :
          kind === "logo" ? <><path d="m24 5 18 19-18 19L6 24 24 5Z" /><path d="m24 13 10 11-10 11-10-11 10-11Z" /></> :
            <><rect x="5" y="8" width="38" height="32" rx="2" /><circle cx="16" cy="18" r="3" /><path d="m6 34 12-10 8 7 6-5 10 9" /></>}
      </svg>
      <span>{label}</span>
      {detail && <small>{detail}</small>}
    </div>
  );
}
